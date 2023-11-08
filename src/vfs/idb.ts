import SQLiteAsyncESMFactory from 'wa-sqlite/dist/wa-sqlite-async.mjs'
import { IDBBatchAtomicVFS } from 'wa-sqlite/src/examples/IDBBatchAtomicVFS.js'
import { Factory } from 'wa-sqlite'
import type { InitOptions } from '..'
import type { BaseOptions } from './opfs'

export interface IDBVFSOptions {
  /**
   * @default "relaxed"
   */
  durability?: 'default' | 'strict' | 'relaxed'
  /**
   * @default "deferred"
   */
  purge?: 'deferred' | 'manual'
  /**
   * @default 16
   */
  purgeAtLeast?: number
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
  options: IDBVFSOptions & BaseOptions = { },
): Promise<InitOptions> {
  const { url, durability = 'relaxed', ...rest } = options
  const SQLiteAsyncModule = await SQLiteAsyncESMFactory(
    url ? { locateFile: () => url } : undefined,
  )
  const sqlite = Factory(SQLiteAsyncModule)
  sqlite.vfs_register(
    new IDBBatchAtomicVFS(fileName, { durability, ...rest }),
  )
  return { fileName, sqlite }
}
