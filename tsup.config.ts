import { copyFile } from 'node:fs/promises'
import { defineConfig } from 'tsup'

export default defineConfig({
  clean: true,
  entry: {
    index: 'src/index.ts',
    idb: 'src/vfs/idb.ts',
    opfs: 'src/vfs/opfs.ts',
    constant: 'src/constant.ts',
  },
  format: ['esm', 'cjs'],
  dts: { resolve: true },
  treeshake: true,
  tsconfig: './tsconfig.json',
  noExternal: ['wa-sqlite'],
  plugins: [
    {
      name: 'copy-wasm',
      buildEnd() {
        if (this.format === 'esm') {
          Promise.all([
            copyFile(
              './wa-sqlite-fts5/wa-sqlite.wasm',
              './dist/wa-sqlite.wasm',
            ),
            copyFile(
              './wa-sqlite-fts5/wa-sqlite-async.wasm',
              './dist/wa-sqlite-async.wasm',
            ),
          ])
        }
      },
    },
  ],
})
