import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'kxiebh2k4xk247kc.public.blob.vercel-storage.com',
      },
    ],
  },
};

export default nextConfig;
