import localFont from 'next/font/local';

/**
 * Inter font - English/LTR text
 * Loaded from shared package fonts directory
 */
export const inter = localFont({
  src: [
    {
      path: '../public/fonts/inter/Inter_18pt-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/inter/Inter_18pt-Medium.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../public/fonts/inter/Inter_18pt-SemiBold.ttf',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../public/fonts/inter/Inter_18pt-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-inter',
  display: 'swap',
});

/**
 * Cairo font - Arabic/RTL text
 * Loaded from shared package fonts directory
 */
export const cairo = localFont({
  src: [
    {
      path: '../public/fonts/cairo/Cairo-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/cairo/Cairo-Medium.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../public/fonts/cairo/Cairo-SemiBold.ttf',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../public/fonts/cairo/Cairo-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-cairo',
  display: 'swap',
});

/**
 * Combined font class names for body element
 */
export const fontVariables = `${inter.variable} ${cairo.variable}`;
