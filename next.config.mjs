// next.config.mjs
import path from "path";

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
};

export default nextConfig;