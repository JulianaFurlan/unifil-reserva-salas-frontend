<<<<<<< HEAD
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
=======
export default {
>>>>>>> 8cf02fa45c6c9ec21fe2c580d8a58239630e6305
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false
      }
    }
  }
<<<<<<< HEAD
})
=======
}
>>>>>>> 8cf02fa45c6c9ec21fe2c580d8a58239630e6305
