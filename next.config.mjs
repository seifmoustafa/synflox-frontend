/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable React Strict Mode to prevent duplicate API requests in development
  // React Strict Mode intentionally double-mounts components to detect side effects,
  // but this causes duplicate network requests which overload the server.
  // The deduplication logic in useGenericCrudViewModel can't prevent this because
  // the cleanup function aborts the first request before the second mount.
  reactStrictMode: false,
  
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
