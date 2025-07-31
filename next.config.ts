import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**", // Allow all paths
      },
    ],
  },
   eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
