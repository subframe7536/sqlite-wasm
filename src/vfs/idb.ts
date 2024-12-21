import type { BaseOptions, IDBBatchAtomicVFSOptions, Options } from '../types'
import { IDBBatchAtomicVFS } from 'wa-sqlite/src/examples/IDBBatchAtomicVFS.js'
import { IDBMirrorVFS } from 'wa-sqlite/src/examples/IDBMirrorVFS.js'
import SQLiteAsyncESMFactory from '../../wa-sqlite-fts5/wa-sqlite-async.mjs'

export { IDBBatchAtomicVFS } from 'wa-sqlite/src/examples/IDBBatchAtomicVFS.js'
export { IDBMirrorVFS } from 'wa-sqlite/src/examples/IDBMirrorVFS.js'

export type IDBVFSOptions = IDBBatchAtomicVFSOptions

/**
 * Store data in IndexedDB,
 * Use `IDBBatchAtomicVFS` with `wa-sqlite-async.wasm` (larger than sync version), better compatibility
 * @param fileName db file name
 * @param options options
 * @example
 * ```ts
 * import { useIdbStorage } from '@subframe7536/sqlite-wasm/idb'
 * import { initSQLite } from '@subframe7536/sqlite-wasm'
 *
 * // optional url
 * const url = "https://cdn.jsdelivr.net/gh/subframe7536/sqlite-wasm@main/wa-sqlite-fts5/wa-sqlite-async.wasm"
 *
 * const { run, changes, lastInsertRowId, close, sqlite, db } = await initSQLite(
 *   useIdbStorage('test.db', { url })
 * )
 * ```
 */
export async function useIdbStorage(
  fileName: string,
  options: IDBVFSOptions & BaseOptions = {},
): Promise<Options> {
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
  /// keep-sorted
  return {
    path: idbName,
    sqliteModule,
    vfsFn: IDBBatchAtomicVFS.create,
    vfsOptions,
    ...rest,
  }
}

/**
 * Store data in memory and sync to IndexedDB,
 * Use `IDBMirrorVFS` with `wa-sqlite-async.wasm` (larger than sync version), better performance compare to `IDBBatchAtomicVFS`
 * @param fileName db file name
 * @param options options
 * @example
 * ```ts
 * import { useIdbMemoryStorage } from '@subframe7536/sqlite-wasm/idb'
 * import { initSQLite } from '@subframe7536/sqlite-wasm'
 *
 * // optional url
 * const url = "https://cdn.jsdelivr.net/gh/subframe7536/sqlite-wasm@main/wa-sqlite-fts5/wa-sqlite-async.wasm"
 *
 * const { run, changes, lastInsertRowId, close, sqlite, db } = await initSQLite(
 *   useIdbMemoryStorage('test.db', { url })
 * )
 * ```
 */
export async function useIdbMemoryStorage(
  fileName: string,
  options: BaseOptions = {},
): Promise<Options> {
  const { url, ...rest } = options
  const sqliteModule = await SQLiteAsyncESMFactory(
    url ? { locateFile: () => url } : undefined,
  )
  /// keep-sorted
  return {
    path: fileName.endsWith('.db') ? fileName : `${fileName}.db`,
    sqliteModule,
    vfsFn: IDBMirrorVFS.create,
    ...rest,
  }
}
