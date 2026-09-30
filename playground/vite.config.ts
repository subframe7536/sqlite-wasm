import { resolve } from 'node:path'

import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    alias: [
      {
        find: /^wa-sqlite$/,
        replacement: resolve(import.meta.dirname, '../wa-sqlite/src/sqlite-api.js'),
      },
      {
        find: /^wa-sqlite\/src\//,
        replacement: `${resolve(import.meta.dirname, '../wa-sqlite/src')}/`,
      },
      {
        find: /^wa-sqlite-fts5\//,
        replacement: `${resolve(import.meta.dirname, '../wa-sqlite-fts5')}/`,
      },
    ],
  },
})
