import type { BaseStorageOptions, InitSQLiteOptions } from '../types'

import { MemoryVFS } from 'wa-sqlite/src/examples/MemoryVFS.js'

import SQLiteESMFactory from '../../wa-sqlite-fts5/wa-sqlite.mjs'

export { MemoryVFS } from 'wa-sqlite/src/examples/MemoryVFS.js'

/**
 * Store data in memory,
 * use `MemoryVFS` with `wa-sqlite.wasm`,
 * no data persistence
 * @param options options
 * @example
 * ```ts
 * import { initSQLite, isOpfsSupported, useMemoryStorage } from '@subframe7536/sqlite-wasm'
 *
 * // optional url
 * const url = 'https://cdn.jsdelivr.net/npm/@subframe7536/sqlite-wasm@0.5.0/wa-sqlite.wasm'
 * const url1 = 'https://cdn.jsdelivr.net/gh/subframe7536/sqlite-wasm@v0.5.0/wa-sqlite-fts5/wa-sqlite.wasm'
 *
 * const { run, changes, lastInsertRowId, close } = await initSQLite(
 *   useMemoryStorage({ url })
 * )
 * ```
 */
export async function useMemoryStorage(
  options: BaseStorageOptions = {},
): Promise<InitSQLiteOptions> {
  const { url, ...rest } = options
  const sqliteModule = await SQLiteESMFactory(
    url ? { locateFile: () => url } : undefined,
  )
  /// keep-sorted
  return {
    path: ':memory:',
    sqliteModule,
    vfsFn: (MemoryVFS as any).create,
    ...rest,
  }
}
