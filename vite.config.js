import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    // هذا الخيار يجبر Vite على إعادة بناء الحزم، مما يساعد في حل مشاكل الـ Cache
    force: true,
    // مراقبة التغييرات بشكل أفضل
    watch: {
      usePolling: true,
    },
  },
  // إعدادات البناء
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
