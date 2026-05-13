import {
	DeleteObjectCommand,
	PutObjectCommand,
	S3Client,
} from "@aws-sdk/client-s3";
import { v7 as uuidv7 } from "uuid";

const s3 = new S3Client({
	region: process.env.AWS_REGION,
	credentials:
		process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
			? {
					accessKeyId: process.env.AWS_ACCESS_KEY_ID,
					secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
				}
			: undefined,
});

const BUCKET = process.env.AWS_S3_BUCKET as string;
const PUBLIC_URL = process.env.AWS_S3_PUBLIC_URL as string;

export const uploadToBlob = async (file: File): Promise<string> => {
	try {
		const key = uuidv7();
		const buffer = Buffer.from(await file.arrayBuffer());
		await s3.send(
			new PutObjectCommand({
				Bucket: BUCKET,
				Key: key,
				Body: buffer,
				ContentType: file.type || "application/octet-stream",
			}),
		);
		return `${PUBLIC_URL}/${key}`;
	} catch (error) {
		console.error("画像のアップロードに失敗しました:", error);
		throw new Error("画像のアップロードに失敗しました");
	}
};

export const deleteFromBlob = async (url: string): Promise<void> => {
	try {
		const key = url.startsWith(`${PUBLIC_URL}/`)
			? url.replace(`${PUBLIC_URL}/`, "")
			: url.split("/").pop();
		if (!key) return;
		await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
	} catch (error) {
		console.error("画像の削除に失敗しました:", error);
		throw new Error("画像の削除に失敗しました");
	}
};
