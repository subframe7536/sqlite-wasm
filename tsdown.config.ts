import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    idb: 'src/vfs/idb.ts',
    'idb-memory': 'src/vfs/idb-memory.ts',
    opfs: 'src/vfs/opfs.ts',
    'fs-handle': 'src/vfs/fs-handle.ts',
    constant: 'src/constant.ts',
  },
  clean: true,
  dts: {
    oxc: true,
  },
  platform: 'neutral',
  format: ['esm', 'cjs'],
  deps: {
    alwaysBundle: ['wa-sqlite'],
  },
  alias: {
    'wa-sqlite': 'wa-sqlite/src/sqlite-api.js',
    'wa-sqlite/src': 'wa-sqlite/src',
    'wa-sqlite/src/': 'wa-sqlite/src/',
  },
  copy: ['wa-sqlite-fts5/wa-sqlite.wasm', 'wa-sqlite-fts5/wa-sqlite-async.wasm'],
  exports: {
    customExports: {
      './wasm': './dist/wa-sqlite.wasm',
      './wasm-async': './dist/wa-sqlite-async.wasm',
      './dist/*': './dist/*',
    },
  },
})
