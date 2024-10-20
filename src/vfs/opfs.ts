import type { BaseOptions, Options } from '../types'
import { OPFSCoopSyncVFS } from 'wa-sqlite/src/examples/OPFSCoopSyncVFS.js'
import SQLiteESMFactory from '../../wa-sqlite-fts5/wa-sqlite.mjs'

export { OPFSCoopSyncVFS } from 'wa-sqlite/src/examples/OPFSCoopSyncVFS.js'

/**
 * store data in [OPFS](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API/Origin_private_file_system),
 * use OPFSCoopSyncVFS with `wa-sqlite.wasm` (smaller than async version), [compatibility](https://caniuse.com/mdn-api_filesystemsyncaccesshandle)
 *
 * **MUST RUN IN WEB WORKER**
 * @param path db file directory path
 * @param options wasm file url
 * @example
 * // only effect in worker
 * import { initSQLite, isOpfsSupported } from '@subframe7536/sqlite-wasm'
 * import { useOpfsStorage } from '@subframe7536/sqlite-wasm/opfs'
 *
 * const url = 'https://cdn.jsdelivr.net/gh/rhashimoto/wa-sqlite@v0.9.9/dist/wa-sqlite.wasm'
 *
 * onmessage = async () => {
 *   if (!isOpfsSupported()) {
 *     return
 *   }
 *   const { run, changes, lastInsertRowId, close, sqlite, db } = await initSQLite(
 *     useOpfsStorage('test', { url })
 *   )
 * }
 */
export async function useOpfsStorage(
  path: string,
  options: BaseOptions = {},
): Promise<Options> {
  const sqliteModule = await SQLiteESMFactory(
    options.url ? { locateFile: () => options.url } : undefined,
  )
  /// keep-sorted
  return {
    path,
    readonly: options.readonly,
    sqliteModule,
    vfsFn: OPFSCoopSyncVFS.create,
  }
}
