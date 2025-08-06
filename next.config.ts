import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.externals.push("sharp");
    }

    // Handle Zappar WASM files
    config.module.rules.push({
      test: /zcv\.wasm$/,
      type: "javascript/auto",
      loader: "file-loader"
    });

    return config;
  },
  // transpilePackages: ["@theatre/r3f","three"],
  reactStrictMode: true,
  turbopack: {
    resolveAlias: {
      react: "react",
      "react-dom": "react-dom",
      "@react-three/fiber": "@react-three/fiber"
    },

    // 👇 Optional: if you use non-standard extensions
    resolveExtensions: [".vert", ".frag", ".tsx", ".ts", ".jsx", ".js", ".json", ".css"]
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  },
  experimental: {
    // webpackBuildWorker: true,
    serverActions: {
      bodySizeLimit: "10mb"
    }
  }
};

export default nextConfig;
