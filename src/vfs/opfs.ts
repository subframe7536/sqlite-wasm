import type { BaseStorageOptions, InitSQLiteOptions } from '../types'

import { OPFSCoopSyncVFS } from 'wa-sqlite/src/examples/OPFSCoopSyncVFS.js'

import SQLiteESMFactory from '../../wa-sqlite-fts5/wa-sqlite.mjs'

export { OPFSCoopSyncVFS } from 'wa-sqlite/src/examples/OPFSCoopSyncVFS.js'

/**
 * Store data in [OPFS](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API/Origin_private_file_system) through [FileSystemSyncAccessHandle](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemSyncAccessHandle),
 * use `OPFSCoopSyncVFS` with `wa-sqlite.wasm`, smaller and faster than all other persist storages
 *
 * **MUST RUN IN WEB WORKER**
 * @param path db file directory path
 * @param options wasm file url
 * @example
 * ```ts
 * import { initSQLite, isOpfsSupported } from '@subframe7536/sqlite-wasm'
 * import { useOpfsStorage } from '@subframe7536/sqlite-wasm/opfs'
 *
 * // optional url
 * const url = 'https://cdn.jsdelivr.net/npm/@subframe7536/sqlite-wasm@0.5.0/dist/wa-sqlite.wasm'
 *
 * onmessage = async () => {
 *   if (!await isOpfsSupported()) { // this can be called in main thread
 *     return
 *   }
 *   const { run, changes, lastInsertRowId, close } = await initSQLite(
 *     useOpfsStorage('test.db', url)
 *   )
 * }
 * ```
 */
export async function useOpfsStorage(
  path: string,
  options: BaseStorageOptions = {},
): Promise<InitSQLiteOptions> {
  const { url, ...rest } = options
  const sqliteModule = await SQLiteESMFactory(
    options.url ? { locateFile: () => options.url } : undefined,
  )

  return {
    path,
    sqliteModule,
    vfsFn: OPFSCoopSyncVFS.create,
    ...rest,
  }
}
