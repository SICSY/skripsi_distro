import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* config options here */
//   transpilePackages: ["three"],
//   eslint: {
//     ignoreDuringBuilds: true
//   },
//   typescript: {
//     ignoreBuildErrors: true
//   },
//   experimental: {
//     serverActions: {
//       bodySizeLimit: "10mb"
//     }
//   }
// };

// export default nextConfig;
// /** @type {import('next').NextConfig} */

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

  // Enable experimental features for WASM
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb"
    }
  },

  // Headers for WASM and SharedArrayBuffer
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "require-corp"
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin"
          }
        ]
      }
    ];
  },

  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  },
  images: {
    unoptimized: true
  }
};

module.exports = nextConfig;
