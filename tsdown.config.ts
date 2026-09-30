import { fileURLToPath } from 'node:url'

import { defineConfig } from 'tsdown'
import type { UserConfig } from 'tsdown'

const shared: UserConfig = {
  entry: {
    index: 'src/index.ts',
    idb: 'src/vfs/idb.ts',
    'idb-memory': 'src/vfs/idb-memory.ts',
    opfs: 'src/vfs/opfs.ts',
    'fs-handle': 'src/vfs/fs-handle.ts',
    'opfs-wa': 'src/vfs/opfs-write-ahead.ts',
    constant: 'wa-sqlite/src/sqlite-constants.js',
  },
  platform: 'browser',
  format: 'esm',
  deps: {
    alwaysBundle: ['wa-sqlite'],
  },
  alias: {
    'wa-sqlite$': fileURLToPath(new URL('./wa-sqlite/src/sqlite-api.js', import.meta.url)),
    'wa-sqlite': fileURLToPath(new URL('./wa-sqlite', import.meta.url)),
    'wa-sqlite-fts5': fileURLToPath(new URL('./wa-sqlite-fts5', import.meta.url)),
  },
}

export default defineConfig([
  {
    ...shared,
    dts: {
      // Emit declarations directly from the JavaScript constants entry.
      generator: 'oxc',
      emitJs: true,
    },
    copy: ['wa-sqlite-fts5/wa-sqlite.wasm', 'wa-sqlite-fts5/wa-sqlite-async.wasm'],
    exports: {
      customExports: {
        './wasm': './dist/wa-sqlite.wasm',
        './wasm-async': './dist/wa-sqlite-async.wasm',
        './dist/*': './dist/*',
      },
    },
  },
  {
    ...shared,
    dts: false,
    minify: true,
    outExtensions() {
      return { js: '.min.js' }
    },
  },
])
