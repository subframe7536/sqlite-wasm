import type { BaseOptions, IDBBatchAtomicVFSOptions, Options } from '../types'
import SQLiteAsyncESMFactory from 'wa-sqlite/dist/wa-sqlite-async.mjs'
import { IDBBatchAtomicVFS } from 'wa-sqlite/src/examples/IDBBatchAtomicVFS.js'
import { IDBMirrorVFS } from 'wa-sqlite/src/examples/IDBMirrorVFS.js'

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
 * import { getAsyncWasmURL, initSQLite } from '@subframe7536/sqlite-wasm'
 *
 * // const url = 'https://cdn.jsdelivr.net/gh/rhashimoto/wa-sqlite@v0.9.9/dist/wa-sqlite-async.wasm'
 * const url = getAsyncWasmURL()
 *
 * const { run, changes, lastInsertRowId, close, sqlite, db } = await initSQLite(
 *   useIdbStorage('test', { url })
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
    readonly,
  } = options
  const sqliteModule = await SQLiteAsyncESMFactory(
    url ? { locateFile: () => url } : undefined,
  )
  const idbName = fileName.endsWith('.db') ? fileName : `${fileName}.db`
  const vfsOptions = { idbName, lockPolicy, lockTimeout }
  /// keep-sorted
  return {
    path: idbName,
    readonly,
    sqliteModule,
    vfsFn: IDBMirrorVFS.create,
    vfsOptions,
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
 * import { getAsyncWasmURL, initSQLite } from '@subframe7536/sqlite-wasm'
 *
 * // const url = 'https://cdn.jsdelivr.net/gh/rhashimoto/wa-sqlite@v0.9.9/dist/wa-sqlite-async.wasm'
 * const url = getAsyncWasmURL()
 *
 * const { run, changes, lastInsertRowId, close, sqlite, db } = await initSQLite(
 *   useIdbMemoryStorage('test', { url })
 * )
 * ```
 */
export async function useIdbMemoryStorage(
  fileName: string,
  options: BaseOptions = {},
): Promise<Options> {
  const {
    url,
    readonly,
  } = options
  const sqliteModule = await SQLiteAsyncESMFactory(
    url ? { locateFile: () => url } : undefined,
  )
  /// keep-sorted
  return {
    path: fileName.endsWith('.db') ? fileName : `${fileName}.db`,
    readonly,
    sqliteModule,
    vfsFn: IDBBatchAtomicVFS.create,
  }
}
