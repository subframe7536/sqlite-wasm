import SQLiteESMFactory from 'wa-sqlite/dist/wa-sqlite.mjs'
import { AccessHandlePoolVFS } from 'wa-sqlite/src/examples/AccessHandlePoolVFS.js'
import type { BaseOptions, InitOptions } from '../types'

/**
 * store data in [OPFS](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API/Origin_private_file_system),
 * use AccessHandlePoolVFS with `wa-sqlite.wasm` (smaller than async version), [compatibility](https://caniuse.com/mdn-api_filesystemsyncaccesshandle)
 *
 * **MUST RUN IN WEB WORKER**
 * @param fileName db file name
 * @param options wasm file url
 * @example
 * // only effect in worker
 * import { getSyncWasmURL, initSQLite, isOpfsSupported } from '@subframe7536/sqlite-wasm'
 * import { useOpfsStorage } from '@subframe7536/sqlite-wasm/opfs'
 *
 * // const url = 'https://cdn.jsdelivr.net/gh/rhashimoto/wa-sqlite@v0.9.9/dist/wa-sqlite.wasm',
 * const url = getSyncWasmURL()
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
  fileName: string,
  options: BaseOptions = {},
): Promise<InitOptions> {
  const sqliteModule = await SQLiteESMFactory(
    options.url ? { locateFile: () => options.url } : undefined,
  )
  const vfs = new AccessHandlePoolVFS(fileName)
  await vfs.isReady
  return { sqliteModule, fileName, vfs }
}
