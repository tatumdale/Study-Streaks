/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    // App router is now stable in Next.js 14
  },
  transpilePackages: [
    '@refinedev/nextjs-router',
    '@refinedev/core',
    '@refinedev/antd',
    '@refinedev/inferencer',
    '@refinedev/react-hook-form',
    '@refinedev/react-table',
    '@refinedev/simple-rest',
  ],
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dashboard',
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;