import type { BaseOptions, Options } from '../types'
import SQLiteESMFactory from 'wa-sqlite/dist/wa-sqlite.mjs'
import { MemoryVFS } from 'wa-sqlite/src/examples/MemoryVFS.js'

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
