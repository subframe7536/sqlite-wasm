import { cpSync, rmSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { defineConfig } from 'tsdown'
import type { UserConfig } from 'tsdown'

cpSync('./wa-sqlite/src/sqlite-constants.js', './sqlite-constants.ts', {
  recursive: true,
  force: true,
})

const shared: UserConfig = {
  entry: {
    index: 'src/index.ts',
    idb: 'src/vfs/idb.ts',
    'idb-memory': 'src/vfs/idb-memory.ts',
    opfs: 'src/vfs/opfs.ts',
    'fs-handle': 'src/vfs/fs-handle.ts',
    'opfs-wa': 'src/vfs/opfs-write-ahead.ts',
    constant: './sqlite-constants.ts',
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
    plugins: [
      {
        name: 'cleanup',
        buildEnd() {
          rmSync('./sqlite-constants.ts', { force: true })
        },
      },
    ],
  },
])
