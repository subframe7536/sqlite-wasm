import SQLiteESMFactory from 'wa-sqlite-fts5/wa-sqlite.mjs'
import { OPFSCoopSyncVFS as OPFSCoopSyncVFSImpl } from 'wa-sqlite/src/examples/OPFSCoopSyncVFS.js'

import type { BaseStorageOptions, InitSQLiteOptions, OPFSVFSOptions } from '../type'

export interface OPFSCoopSyncVFSConstructor {
  create: (name: string, module: any, options?: any) => Promise<any>
}

export const OPFSCoopSyncVFS: OPFSCoopSyncVFSConstructor = OPFSCoopSyncVFSImpl

export type OPFSStorageOptions = OPFSVFSOptions

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
  options: OPFSStorageOptions & BaseStorageOptions = {},
): Promise<InitSQLiteOptions> {
  const { url, getRoot, prefix, ...rest } = options
  const sqliteModule = await SQLiteESMFactory(url ? { locateFile: () => url } : undefined)
  const vfsOptions: OPFSVFSOptions = {}
  if (getRoot !== undefined) {
    vfsOptions.getRoot = getRoot
  }
  if (prefix !== undefined) {
    vfsOptions.prefix = prefix
  }

  return {
    path,
    sqliteModule,
    vfsFn: OPFSCoopSyncVFS.create,
    vfsOptions,
    ...rest,
  }
}
