/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Allows production builds on Vercel to complete even with ESLint warnings/errors
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Prevents TypeScript compilation errors from blocking production builds
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
};

module.exports = nextConfig;