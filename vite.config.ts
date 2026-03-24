import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      /**
       * Optional peer dependencies for cloud provider adapters.
       * These SDKs are loaded via dynamic import() inside their adapters
       * and only needed at runtime if the corresponding provider is selected
       * (VITE_DB_PROVIDER, VITE_STORAGE_PROVIDER, VITE_COMPUTE_PROVIDER).
       *
       * Install the SDK you need:
       *   npm install @supabase/supabase-js        (for supabase)
       *   npm install firebase                     (for firebase)
       *   npm install @aws-sdk/client-s3           (for r2 / s3)
       */
      external: [
        'firebase/app',
        'firebase/firestore',
        '@supabase/supabase-js',
        '@aws-sdk/client-s3',
      ],
    },
  },
})

