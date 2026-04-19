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
    constant: 'src/constant.ts',
  },
  platform: 'browser',
  format: 'esm',
  deps: {
    alwaysBundle: ['wa-sqlite'],
  },
  alias: Object.fromEntries(
    ['wa-sqlite', 'wa-sqlite/src', 'wa-sqlite/src/', 'wa-sqlite-fts5'].map((name) => [
      name,
      fileURLToPath(new URL(name, import.meta.url)),
    ]),
  ),
}

export default defineConfig([
  {
    ...shared,
    dts: { oxc: true },
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
    minify: true,
    outExtensions() {
      return { js: '.min.js' }
    },
  },
])
