import type { BaseStorageOptions, IDBBatchAtomicVFSOptions, InitSQLiteOptions } from '../types'

import { IDBBatchAtomicVFS } from 'wa-sqlite/src/examples/IDBBatchAtomicVFS.js'

import SQLiteAsyncESMFactory from '../../wa-sqlite-fts5/wa-sqlite-async.mjs'

export { IDBBatchAtomicVFS } from 'wa-sqlite/src/examples/IDBBatchAtomicVFS.js'

export type IDBVFSOptions = IDBBatchAtomicVFSOptions

/**
 * Store data in `IndexedDB`,
 * use `IDBBatchAtomicVFS` with `wa-sqlite-async.wasm`,
 * larger than sync version, better compatibility
 * @param fileName db file name
 * @param options options
 * @example
 * ```ts
 * import { initSQLite } from '@subframe7536/sqlite-wasm'
 * import { useIdbStorage } from '@subframe7536/sqlite-wasm/idb'
 *
 * // optional url
 * const url = 'https://cdn.jsdelivr.net/npm/@subframe7536/sqlite-wasm@0.5.0/wa-sqlite-async.wasm'
 * const url1 = 'https://cdn.jsdelivr.net/gh/subframe7536/sqlite-wasm@v0.5.0/wa-sqlite-fts5/wa-sqlite-async.wasm'
 *
 * const { run, changes, lastInsertRowId, close } = await initSQLite(
 *   useIdbStorage('test.db', { url })
 * )
 * ```
 */
export async function useIdbStorage(
  fileName: string,
  options: IDBVFSOptions & BaseStorageOptions = {},
): Promise<InitSQLiteOptions> {
  const {
    url,
    lockPolicy = 'shared+hint',
    lockTimeout = Infinity,
    ...rest
  } = options
  const sqliteModule = await SQLiteAsyncESMFactory(
    url ? { locateFile: () => url } : undefined,
  )
  const idbName = fileName.endsWith('.db') ? fileName : `${fileName}.db`
  const vfsOptions = { idbName, lockPolicy, lockTimeout }

  return {
    path: idbName,
    sqliteModule,
    vfsFn: IDBBatchAtomicVFS.create,
    vfsOptions,
    ...rest,
  }
}
