import type { BaseOptions, Options } from '../types'
import SQLiteAsyncESMFactory from '../../wa-sqlite-fts5/wa-sqlite-async.mjs'
import { IDBMirrorVFS } from './class/IDBMirrorVFS'

export { IDBMirrorVFS } from './class/IDBMirrorVFS'
/**
 * Store data in memory and sync to `IndexedDB`,
 * use `IDBMirrorVFS` with `wa-sqlite-async.wasm` (larger than sync version),
 * better performance compare to `useIdbStorage`.
 * @param fileName db file name
 * @param options options
 * @example
 * ```ts
 * import { initSQLite } from '@subframe7536/sqlite-wasm'
 * import { useIdbMemoryStorage } from '@subframe7536/sqlite-wasm/idb-memory'
 *
 * // optional url
 * const url = 'https://cdn.jsdelivr.net/npm/@subframe7536/sqlite-wasm@0.5.0/dist/wa-sqlite-async.wasm'
 *
 * const { run, changes, lastInsertRowId, close } = await initSQLite(
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
    vfsFn: IDBMirrorVFS.create as any,
    ...rest,
  }
}
