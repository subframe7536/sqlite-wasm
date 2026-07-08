import SQLiteESMFactory from 'wa-sqlite-fts5/wa-sqlite.mjs'
import { MemoryVFS as MemoryVFSImpl } from 'wa-sqlite/src/examples/MemoryVFS.js'

import type { BaseStorageOptions, InitSQLiteOptions } from '../type'

export interface MemoryVFSConstructor {
  create: (name: string, module: any) => Promise<any>
}

export const MemoryVFS: MemoryVFSConstructor = MemoryVFSImpl

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
  const sqliteModule = await SQLiteESMFactory(url ? { locateFile: () => url } : undefined)

  return {
    path: ':memory:',
    sqliteModule,
    vfsFn: MemoryVFS.create,
    ...rest,
  }
}
