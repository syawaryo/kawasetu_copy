import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      // xlsx-populateがブラウザで動くようにNode.jsモジュールを無効化
      fs: { browser: './empty-module.js' },
    },
  },
};

export default nextConfig;
