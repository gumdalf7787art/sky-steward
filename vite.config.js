import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      plugins: [
        {
          name: 'trace-modules',
          transform(code, id) {
            return null;
          },
          moduleParsed(info) {
            console.log('Parsed:', info.id);
          },
          buildEnd() {
            console.log('--- BUILD END ---');
          },
          renderStart() {
            console.log('--- RENDER START ---');
          },
          renderChunk(code, chunk) {
            console.log('Rendering Chunk:', chunk.fileName);
            return null;
          },
          generateBundle() {
            console.log('--- GENERATE BUNDLE ---');
          }
        }
      ]
    }
  }
})
