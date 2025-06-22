import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    turbo: {
      resolveExtensions: ['.js', '.jsx', '.ts', '.tsx'],
    },
  },
   images: {
    domains: ['images.unsplash.com', 'companieslogo.com', "via.placeholder.com"],
  },
  /* config options here */
};

export default nextConfig;
