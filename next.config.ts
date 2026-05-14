import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	/* config options here */
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "kxiebh2k4xk247kc.public.blob.vercel-storage.com",
			},
			{
				protocol: "https",
				hostname: "avatars.slack-edge.com",
			},
			{
				protocol: "https",
				hostname: "adixi-mgr-uploads.s3.ap-northeast-1.amazonaws.com",
			},
			{
				protocol: "https",
				hostname: "lh3.googleusercontent.com",
			},
		],
	},
};

export default nextConfig;
