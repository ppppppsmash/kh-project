import { put } from "@vercel/blob";

export const uploadImage = async (file: File) => {
  const blob = await put(file.name, file, {
    access: 'public',
  });

  return blob.url;
};
