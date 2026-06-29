import type { NextConfig } from "next";

const nextConfig: NextConfig = {
 experimental: {
    serverActions: {
      bodySizeLimit: '20mb', // tăng lên theo nhu cầu
    },
  },
};

export default nextConfig;
