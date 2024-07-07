import SQLiteESMFactory from 'wa-sqlite/dist/wa-sqlite.mjs'
import { MemoryVFS } from 'wa-sqlite/src/examples/MemoryVFS.js'
import type { BaseOptions, Options } from '../types'

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
    sqliteModule,
    vfsFn: (MemoryVFS as any).create,
  }
}
