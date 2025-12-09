/** 
 * @synflox/shared - Base Next.js Configuration
 * 
 * Shared Next.js configuration that apps can extend.
 * Usage in app next.config.mjs:
 * 
 * import baseConfig from '../../packages/shared/next.config.base.mjs';
 * export default { ...baseConfig };
 * 
 * @type {import('next').NextConfig} 
 */
const baseConfig = {
  // Transpile shared packages from monorepo
  transpilePackages: ['@synflox/shared'],
  
  // Disable React Strict Mode to prevent duplicate API requests in development
  // React Strict Mode intentionally double-mounts components to detect side effects,
  // but this causes duplicate network requests which overload the server.
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

export default baseConfig;
