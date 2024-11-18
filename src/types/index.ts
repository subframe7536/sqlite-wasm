import type { Promisable } from '@subframe7536/type-utils'
import { Base } from 'wa-sqlite/src/VFS.js'

// eslint-disable-next-line unused-imports/no-unused-vars
declare class ISQLiteVFS extends Base {
  public static create(name: string, module: any, options?: any): Promisable<SQLiteVFS>
}

export type IDBBatchAtomicVFSOptions = {
  /**
   * patched options for `navigator.locks.request()`
   * @default 'shared+hint'
   */
  lockPolicy?: 'exclusive' | 'shared' | 'shared+hint'
  /**
   * timeout for the lock
   * @default Infinity
   */
  lockTimeout?: number
}

export type Options = {
  path: string
  sqliteModule: any
  vfsFn: typeof ISQLiteVFS['create']
  vfsOptions?: any
  readonly?: boolean
}

export type SQLiteDBCore = {
  /**
   * File name (`IDBBatchAtomicVFS`) or directory path (`OPFSCoopSyncVFS`)
   */
  path: string
  /**
   * DB pointer
   */
  db: number
  /**
   * SQLite apis
   */
  sqlite: SQLiteAPI
  /**
   * Wasm build module
   */
  sqliteModule: any
  /**
   * SQLite vfs
   */
  vfs: SQLiteVFS
}

export type SQLiteDB = SQLiteDBCore & {
  /**
   * Close db
   */
  close: () => Promise<void>
  /**
   * Get db changes
   */
  changes: () => number | bigint
  /**
   * Get lastInsertRowId
   */
  lastInsertRowId: () => number | bigint
  /**
   * Run sql and return result list
   * @param onData trigger onn stream has data received
   * @param sql raw sql with placeholder
   * @param parameters params that replace the placeholder
   * @example
   * const results = await run('select ? from test where id = ?', ['name', 1])
   */
  stream: (onData: (data: Record<string, SQLiteCompatibleType>) => void, sql: string, parameters?: SQLiteCompatibleType[]) => Promise<void>
  /**
   * Run sql and return result list
   * @param sql raw sql with placeholder
   * @param parameters params that replace the placeholder
   * @example
   * const results = await run('select ? from test where id = ?', ['name', 1])
   */
  run: (sql: string, parameters?: SQLiteCompatibleType[]) => Promise<Array<Record<string, SQLiteCompatibleType>>>
}

export type BaseOptions = {
  /**
   * Custom wasm url
   */
  url?: string
  /**
   * Open SQLite file with `SQLITE_OPEN_READONLY`
   *
   * If absent, open with `SQLITE_OPEN_READWRITE | SQLITE_OPEN_CREATE`
   */
  readonly?: boolean
}
