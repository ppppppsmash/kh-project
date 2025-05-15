import { del, put } from "@vercel/blob";
import { v7 as uuidv7 } from "uuid";

export const uploadToBlob = async (file: File): Promise<string> => {
	try {
		const blob = await put(uuidv7(), file, {
			access: "public",
		});
		return blob.url;
	} catch (error) {
		console.error("画像のアップロードに失敗しました:", error);
		throw new Error("画像のアップロードに失敗しました");
	}
};

export const deleteFromBlob = async (url: string): Promise<void> => {
	try {
		await del(url);
	} catch (error) {
		console.error("画像の削除に失敗しました:", error);
		throw new Error("画像の削除に失敗しました");
	}
};
