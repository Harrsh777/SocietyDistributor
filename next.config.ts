import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  experimental: {
    turbo: {
      resolveExtensions: ['.js', '.jsx', '.ts', '.tsx'],
    },
  },
   images: {
    domains: ['images.unsplash.com', 'companieslogo.com', "via.placeholder.com", "nrdpnjrnnwvlajqgxphw.supabase.co"],
  },
  /* config options here */
};

export default nextConfig;
