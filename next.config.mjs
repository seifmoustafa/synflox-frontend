/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable proper TypeScript error checking
  typescript: {
    ignoreBuildErrors: false,
  },
  // Enable Next.js image optimization
  images: {
    unoptimized: false,
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Additional optimizations
  experimental: {
    // optimizeCss: true, // Disabled due to missing critters dependency
  },
  // Enable compression
  compress: true,
  // Enable source maps in development
  productionBrowserSourceMaps: false,
};

export default nextConfig;
