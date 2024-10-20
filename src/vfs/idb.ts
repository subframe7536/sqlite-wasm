import type { BaseOptions, IDBBatchAtomicVFSOptions, Options } from '../types'
import SQLiteAsyncESMFactory from 'wa-sqlite/dist/wa-sqlite-async.mjs'
import { IDBBatchAtomicVFS } from 'wa-sqlite/src/examples/IDBBatchAtomicVFS.js'

export { IDBBatchAtomicVFS } from 'wa-sqlite/src/examples/IDBBatchAtomicVFS.js'

export type IDBVFSOptions = IDBBatchAtomicVFSOptions & {
  /**
   * @default 'idb-sqlite-vfs'
   */
  idbName?: string
}

/**
 * storage data in IndexedDB,
 * use IDBBatchAtomicVFS with `wa-sqlite-async.wasm` (larger than sync version), better compatibility
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
    idbName = 'idb-sqlite-vfs',
    lockPolicy = 'shared+hint',
    lockTimeout = Infinity,
    readonly,
  } = options
  const sqliteModule = await SQLiteAsyncESMFactory(
    url ? { locateFile: () => url } : undefined,
  )
  const vfsOptions = { idbName, lockPolicy, lockTimeout }
  /// keep-sorted
  return {
    path: fileName.endsWith('.db') ? fileName : `${fileName}.db`,
    readonly,
    sqliteModule,
    vfsFn: IDBBatchAtomicVFS.create,
    vfsOptions,
  }
}
