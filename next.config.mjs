/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["better-sqlite3", "bcryptjs"],
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
