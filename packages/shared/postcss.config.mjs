/** 
 * @synflox/shared - PostCSS Configuration
 * 
 * Shared PostCSS configuration for all apps.
 * Apps can import this directly or copy to their root.
 * 
 * @type {import('postcss-load-config').Config} 
 */
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

export default config;
