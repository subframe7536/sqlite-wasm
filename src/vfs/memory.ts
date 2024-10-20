import type { BaseOptions, Options } from '../types'
import { MemoryVFS } from 'wa-sqlite/src/examples/MemoryVFS.js'
import SQLiteESMFactory from '../../wa-sqlite-fts5/wa-sqlite.mjs'

export { MemoryVFS } from 'wa-sqlite/src/examples/MemoryVFS.js'

export async function useMemoryStorage(
  options: BaseOptions = {},
): Promise<Options> {
  const sqliteModule = await SQLiteESMFactory(
    options.url ? { locateFile: () => options.url } : undefined,
  )
  /// keep-sorted
  return {
    path: ':memory:',
    readonly: options.readonly,
    sqliteModule,
    vfsFn: (MemoryVFS as any).create,
  }
}
