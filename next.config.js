/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  webpack: (config, { isServer }) => {
    // Disable webpack cache to prevent caching issues
    config.cache = false;
    return config;
  },
};

module.exports = nextConfig;