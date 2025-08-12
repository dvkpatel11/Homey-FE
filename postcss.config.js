export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    // Production optimizations
    ...(process.env.NODE_ENV === "production" && {
      cssnano: {
        preset: [
          "default",
          {
            discardComments: { removeAll: true },
            normalizeWhitespace: false, // Keep readable for debugging
            minifySelectors: true,
            minifyParams: true,
            minifyFontValues: true,
            colormin: true,
            convertValues: {
              length: false, // Don't convert px to other units for consistency
            },
          },
        ],
      },
    }),
  },
};
