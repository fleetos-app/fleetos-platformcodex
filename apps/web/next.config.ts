import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@fleetos/auth",
    "@fleetos/database",
    "@fleetos/rbac",
    "@fleetos/tenant-router",
    "@fleetos/ui"
  ],
  webpack(config) {
    config.resolve.extensionAlias = {
      ...(config.resolve.extensionAlias ?? {}),
      ".js": [".ts", ".tsx", ".js"],
    };

    return config;
  },
};

export default nextConfig;
