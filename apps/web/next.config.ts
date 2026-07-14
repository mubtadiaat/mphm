import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    loader: "cloudinary",
    path: "https://res.cloudinary.com/r9f9o3jm/image/upload/",
  },
};

export default nextConfig;
