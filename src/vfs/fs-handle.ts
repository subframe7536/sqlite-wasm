import type { BaseStorageOptions, InitSQLiteOptions } from '../types'

import SQLiteAsyncESMFactory from '../../wa-sqlite-fts5/wa-sqlite-async.mjs'
import { OPFSAnyContextVFS } from './class/OPFSAnyContextVFS'

export { OPFSAnyContextVFS } from './class/OPFSAnyContextVFS'

/**
 * Store data through `FileSystemFileHandle`,
 * use modified `OPFSAnyContextVFS` with `wa-sqlite-async.wasm`,
 * allow to use device's local file or OPFS in main or worker thread,
 * but a little slower than `useOpfsStorage`
 *
 * @param path db file directory path
 * @param rootDirHandle root directory handle
 * @param options wasm file url
 * @example
 * ```ts
 * import { initSQLite, isOpfsSupported } from '@subframe7536/sqlite-wasm'
 * import { useFsHandleStorage } from '@subframe7536/sqlite-wasm/fs-handle'
 *
 * // optional url
 * const url = 'https://cdn.jsdelivr.net/npm/@subframe7536/sqlite-wasm@0.5.0/dist/wa-sqlite-async.wasm'
 *
 * // device's local file
 * const root = await window.showDirectoryPicker()
 * // OPFS
 * const root1 = await navigator.storage.getDirectory()
 *
 * const { run, changes, lastInsertRowId, close } = await initSQLite(
 *   useFsHandleStorage('test.db', root, url)
 * )
 * ```
 */
export async function useFsHandleStorage(
  path: string,
  rootDirHandle: FileSystemDirectoryHandle,
  options: BaseStorageOptions = {},
): Promise<InitSQLiteOptions> {
  const { url, ...rest } = options
  const sqliteModule = await SQLiteAsyncESMFactory(
    options.url ? { locateFile: () => options.url } : undefined,
  )
  /// keep-sorted
  return {
    path,
    sqliteModule,
    vfsFn: (...args) => OPFSAnyContextVFS.create(...args, rootDirHandle) as any,
    ...rest,
  }
}
