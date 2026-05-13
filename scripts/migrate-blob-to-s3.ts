/**
 * Vercel Blob にある既存ユーザー画像を S3 に移行するスクリプト。
 *
 * 実行方法:
 *   pnpm tsx scripts/migrate-blob-to-s3.ts
 *
 * 必要な環境変数 (.env):
 *   DATABASE_URL
 *   S3_REGION / S3_ACCESS_KEY_ID / S3_SECRET_ACCESS_KEY
 *   S3_BUCKET / S3_PUBLIC_URL
 */

import "dotenv/config";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { eq, isNotNull } from "drizzle-orm";
import { v7 as uuidv7 } from "uuid";
import { db } from "../db";
import { users } from "../db/schema/users";

const s3 = new S3Client({
	region: process.env.S3_REGION,
	credentials: {
		accessKeyId: process.env.S3_ACCESS_KEY_ID as string,
		secretAccessKey: process.env.S3_SECRET_ACCESS_KEY as string,
	},
});
const BUCKET = process.env.S3_BUCKET as string;
const PUBLIC_URL = process.env.S3_PUBLIC_URL as string;

const isVercelBlobUrl = (url: string) =>
	url.includes(".public.blob.vercel-storage.com") ||
	url.includes(".blob.vercel-storage.com");

const guessContentType = (url: string): string => {
	const ext = url.split("?")[0].split(".").pop()?.toLowerCase();
	switch (ext) {
		case "png":
			return "image/png";
		case "jpg":
		case "jpeg":
			return "image/jpeg";
		case "gif":
			return "image/gif";
		case "webp":
			return "image/webp";
		default:
			return "application/octet-stream";
	}
};

async function main() {
	const rows = await db
		.select()
		.from(users)
		.where(isNotNull(users.photoUrl));

	const targets = rows.filter(
		(u) => u.photoUrl && isVercelBlobUrl(u.photoUrl),
	);
	console.log(`Found ${targets.length} users with Vercel Blob images`);

	let migrated = 0;
	let failed = 0;

	for (const user of targets) {
		const oldUrl = user.photoUrl!;
		try {
			const res = await fetch(oldUrl);
			if (!res.ok) throw new Error(`fetch failed: ${res.status}`);
			const buffer = Buffer.from(await res.arrayBuffer());

			const key = uuidv7();
			await s3.send(
				new PutObjectCommand({
					Bucket: BUCKET,
					Key: key,
					Body: buffer,
					ContentType: guessContentType(oldUrl),
				}),
			);

			const newUrl = `${PUBLIC_URL}/${key}`;
			await db
				.update(users)
				.set({ photoUrl: newUrl })
				.where(eq(users.id, user.id));

			console.log(`  ✓ ${user.email}: ${oldUrl} → ${newUrl}`);
			migrated++;
		} catch (err) {
			console.error(`  ✗ ${user.email}: ${(err as Error).message}`);
			failed++;
		}
	}

	console.log(`\nDone. migrated=${migrated} failed=${failed}`);
	process.exit(0);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
