import SQLiteESMFactory from 'wa-sqlite/dist/wa-sqlite.mjs'
import { MemoryVFS } from 'wa-sqlite/src/examples/MemoryVFS.js'
import type { BaseOptions, InitOptions } from '../types'

export { MemoryVFS } from 'wa-sqlite/src/examples/MemoryVFS.js'

export async function useMemoryStorage(
  options: BaseOptions = {},
): Promise<InitOptions> {
  const sqliteModule = await SQLiteESMFactory(
    options.url ? { locateFile: () => options.url } : undefined,
  )
  return { path: ':memory:', sqliteModule, vfs: new MemoryVFS() }
}
