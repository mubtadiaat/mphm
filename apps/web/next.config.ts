import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
  outputFileTracingExcludes: {
    "*": [
      "**/node_modules/three/**/*",
      "**/node_modules/@react-three/**/*",
      "**/node_modules/exceljs/**/*",
      "**/node_modules/jspdf/**/*",
      "**/node_modules/jspdf-autotable/**/*",
      "**/node_modules/xlsx/**/*",
      "**/node_modules/xlsx-js-style/**/*",
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
