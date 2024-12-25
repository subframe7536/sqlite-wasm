import type { Options } from 'tsup'
import { copyFile } from 'node:fs/promises'
import { defineConfig } from 'tsup'

const commonOptions: Options = {
  entry: {
    'index': 'src/index.ts',
    'idb': 'src/vfs/idb.ts',
    'idb-memory': 'src/vfs/idb-memory.ts',
    'opfs': 'src/vfs/opfs.ts',
    'constant': 'src/constant.ts',
  },
  format: ['esm', 'cjs'],
  treeshake: true,
  noExternal: ['wa-sqlite'],
  tsconfig: './tsconfig.json',
}

export default defineConfig([
  {
    ...commonOptions,
    clean: true,
    dts: { resolve: true },
  },
  {
    ...commonOptions,
    minify: true,
    splitting: false,
    outExtension({ format }) {
      return {
        js: format === 'esm' ? `.min.js` : '.min.cjs',
      }
    },
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
              // Maybe uncomment later when jspi support is widely supported
              // copyFile(
              //   './wa-sqlite-fts5/wa-sqlite-jspi.wasm',
              //   './dist/wa-sqlite-jspi.wasm',
              // ),
            ])
          }
        },
      },
    ],
  },
])
