// next.config.mjs
import path from "path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@": path.resolve(process.cwd(), "src"),
      "@app": path.resolve(process.cwd(), "src/app"),
      "@lib": path.resolve(process.cwd(), "src/lib"),
      "@components": path.resolve(process.cwd(), "src/app/components"),
    };
    return config;
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co", // ✅ for placeholder event images
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com", // ✅ Google profile pics
      },
      {
        protocol: "https",
        hostname: "cdn.supabase.io",
      },
      {
        protocol: "https",
        hostname: "loilmtqszazyhnzgbudz.supabase.co", // ✅ your Supabase bucket
      },
    ],
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;