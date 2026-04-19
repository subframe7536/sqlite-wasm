import SQLiteESMFactory from 'wa-sqlite-fts5/wa-sqlite.mjs'
import { OPFSWriteAheadVFS } from 'wa-sqlite/src/examples/OPFSWriteAheadVFS.js'

import type { BaseStorageOptions, InitSQLiteOptions, OPFSWriteAheadVFSOptions } from '../types'

export { OPFSWriteAheadVFS } from 'wa-sqlite/src/examples/OPFSWriteAheadVFS.js'

export type OPFSWriteAheadStorageOptions = OPFSWriteAheadVFSOptions

/**
 * Store data in [OPFS](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API/Origin_private_file_system)
 * using write-ahead logging for improved performance and concurrency,
 * use `OPFSWriteAheadVFS` with `wa-sqlite.wasm`, smaller and faster sync build
 *
 * **MUST RUN IN WEB WORKER**
 *
 * Requires OPFS `readwrite-unsafe` locking mode — **Chromium browsers only**
 *
 * Only journal mode `DELETE` (default) or `OFF` should be used.
 * For multiple-statement write transactions, `BEGIN IMMEDIATE` or `BEGIN EXCLUSIVE` must be used.
 * @param path db file directory path
 * @param options options
 * @example
 * ```ts
 * import { initSQLite, isOpfsReadWriteUnsafeSupported } from '@subframe7536/sqlite-wasm'
 * import { useOpfsWriteAheadStorage } from '@subframe7536/sqlite-wasm/opfs-wa'
 *
 * // optional url
 * const url = 'https://cdn.jsdelivr.net/npm/@subframe7536/sqlite-wasm/dist/wa-sqlite.wasm'
 *
 * // must run in web worker
 * if (await isOpfsReadWriteUnsafeSupported()) {
 *   const { run, changes, lastInsertRowId, close } = await initSQLite(
 *     useOpfsWriteAheadStorage('test.db', { url })
 *   )
 * }
 * ```
 */
export async function useOpfsWriteAheadStorage(
  path: string,
  options: OPFSWriteAheadStorageOptions & BaseStorageOptions = {},
): Promise<InitSQLiteOptions> {
  const { url, nTmpFiles, autoCheckpoint, backstopInterval, ...rest } = options
  const sqliteModule = await SQLiteESMFactory(url ? { locateFile: () => url } : undefined)
  const vfsOptions: OPFSWriteAheadVFSOptions = {}
  if (nTmpFiles !== undefined) {
    vfsOptions.nTmpFiles = nTmpFiles
  }
  if (autoCheckpoint !== undefined) {
    vfsOptions.autoCheckpoint = autoCheckpoint
  }
  if (backstopInterval !== undefined) {
    vfsOptions.backstopInterval = backstopInterval
  }

  return {
    path,
    sqliteModule,
    vfsFn: OPFSWriteAheadVFS.create,
    vfsOptions,
    ...rest,
  }
}
