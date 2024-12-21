import type { BaseOptions, Options } from '../types'
import { IDBMirrorVFS } from 'wa-sqlite/src/examples/IDBMirrorVFS.js'
import SQLiteAsyncESMFactory from '../../wa-sqlite-fts5/wa-sqlite-async.mjs'

export { IDBMirrorVFS } from 'wa-sqlite/src/examples/IDBMirrorVFS.js'
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
