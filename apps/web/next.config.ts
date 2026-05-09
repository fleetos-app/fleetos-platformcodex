import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@fleetos/auth",
    "@fleetos/database",
    "@fleetos/rbac",
    "@fleetos/tenant-router",
    "@fleetos/ui"
  ]
};

export default nextConfig;
