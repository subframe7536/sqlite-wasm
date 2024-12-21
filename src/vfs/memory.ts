import type { BaseOptions, Options } from '../types'
import { MemoryVFS } from 'wa-sqlite/src/examples/MemoryVFS.js'
import SQLiteESMFactory from '../../wa-sqlite-fts5/wa-sqlite.mjs'

export { MemoryVFS } from 'wa-sqlite/src/examples/MemoryVFS.js'

export async function useMemoryStorage(
  options: BaseOptions = {},
): Promise<Options> {
  const { url, ...rest } = options
  const sqliteModule = await SQLiteESMFactory(
    url ? { locateFile: () => url } : undefined,
  )
  /// keep-sorted
  return {
    path: ':memory:',
    sqliteModule,
    vfsFn: (MemoryVFS as any).create,
    ...rest,
  }
}
