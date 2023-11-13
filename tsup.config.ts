import { copyFile } from 'node:fs/promises'
import { defineConfig } from 'tsup'

export default defineConfig({
  clean: true,
  entry: {
    index: 'src/index.ts',
    idb: 'src/vfs/idb.ts',
    opfs: 'src/vfs/opfs.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  treeshake: true,
  plugins: [
    {
      name: 'classic worker',
      renderChunk(code) {
        if (this.format === 'cjs') {
          return { code: code.replace(/import\.meta\.url/g, 'undefined') }
        }
      },
    },
    {
      name: 'copy-wasm',
      buildEnd() {
        if (this.format === 'esm') {
          Promise.all([
            copyFile(
              './node_modules/wa-sqlite/dist/wa-sqlite.wasm',
              './dist/wa-sqlite.wasm',
            ),
            copyFile(
              './node_modules/wa-sqlite/dist/wa-sqlite-async.wasm',
              './dist/wa-sqlite-async.wasm',
            ),
          ])
        }
      },
    },
  ],
})
