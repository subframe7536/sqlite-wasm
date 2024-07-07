import type { Promisable } from '@subframe7536/type-utils'
import { Base } from 'wa-sqlite/src/VFS.js'

declare class ISQLiteVFS extends Base {
  public static create(name: string, module: any, options?: any): Promisable<SQLiteVFS>
}

export type Options = {
  path: string
  sqliteModule: any
  vfsFn: typeof ISQLiteVFS['create']
  vfsOptions?: any
  readonly?: boolean
}

export type SQLiteDB = {
  /**
   * file name (IDBBatchAtomicVFS) or directory path (AccessHandlePoolVFS)
   */
  path: string
  /**
   * db pointer
   */
  db: number
  /**
   * sqlite apis
   */
  sqlite: SQLiteAPI
  /**
   * sqlite vfs
   */
  vfs: SQLiteVFS
  /**
   * close db
   */
  close: () => Promise<void>
  /**
   * get db changes
   */
  changes: () => number
  /**
   * get lastInsertRowId
   */
  lastInsertRowId: () => Promise<number>
  /**
   * run sql and return result list
   * @param sql raw sql with placeholder
   * @param parameters params that replace the placeholder
   * @example
   * const results = await run('select ? from test where id = ?', ['name', 1])
   */
  run: (sql: string, parameters?: SQLiteCompatibleType[]) => Promise<Array<Record<string, SQLiteCompatibleType>>>
}

export type BaseOptions = {
  url?: string
  readonly?: boolean
}
