import react from "@vitejs/plugin-react-swc";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
            },
          },
        ],
      },
      manifest: {
        name: "Homey - Household Management",
        short_name: "Homey",
        description: "Modern household management app with glassmorphic design",
        theme_color: "#7c3aed",
        background_color: "#0f172a",
        display: "standalone",
        orientation: "portrait-primary",
        start_url: "/",
        scope: "/",
        icons: [
          {
            src: "icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
    visualizer({
      filename: "dist/stats.html",
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],

  // Development server optimization
  server: {
    port: 3000,
    host: true, // Allow external access for mobile testing
    hmr: {
      overlay: false, // Disable error overlay for better mobile experience
    },
  },

  // Preview server for production testing
  preview: {
    port: 3000,
    host: true,
  },

  // Build optimizations
  build: {
    target: "es2015",
    outDir: "dist",
    assetsDir: "assets",

    // Optimize for mobile
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks for better caching
          vendor: ["react", "react-dom"],
          ui: ["framer-motion", "lucide-react", "react-hot-toast"],
          utils: ["date-fns", "clsx", "axios"],
        },
        // Better file naming for caching
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
      },
    },

    // Reduce bundle size
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
      },
    },

    // Source maps for debugging
    sourcemap: false, // Disable for smaller bundle size

    // Asset optimization
    assetsInlineLimit: 4096, // Inline small assets
  },

  // Dependency optimization for faster dev startup
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "framer-motion",
      "date-fns",
      "clsx",
      "lucide-react",
      "react-hot-toast",
      "react-hook-form",
    ],
    // Force dep optimization on first run
    force: false,
  },

  // Path resolution
  resolve: {
    alias: {
      "@": "/src",
      "@components": "/src/components",
      "@pages": "/src/pages",
      "@contexts": "/src/contexts",
      "@hooks": "/src/hooks",
      "@lib": "/src/lib",
      "@utils": "/src/lib/utils",
    },
  },

  // Environment variables
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },

  // CSS optimization
  css: {
    postcss: "./postcss.config.js",
    devSourcemap: true,
  },
});
