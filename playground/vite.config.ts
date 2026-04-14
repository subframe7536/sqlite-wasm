import { resolve } from 'node:path'

import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    alias: [
      {
        find: /^wa-sqlite$/,
        replacement: resolve(__dirname, '../wa-sqlite/src/sqlite-api.js'),
      },
      {
        find: /^wa-sqlite\/src\//,
        replacement: `${resolve(__dirname, '../wa-sqlite/src')}/`,
      },
    ],
  },
})
