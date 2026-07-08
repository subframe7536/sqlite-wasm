import type { FacadeVFS, SQLiteAPI, SQLiteCompatibleType } from './sqlite-types'

export type {
  FacadeVFS,
  SQLiteAPI,
  SQLiteCompatibleType,
  SQLitePrepareOptions,
  SQLiteVFS,
} from './sqlite-types'

export type Promisable<T> = T | Promise<T>

export interface OPFSWriteAheadVFSOptions {
  /**
   * Number of temporary files to preallocate
   */
  nTmpFiles?: number
  /**
   * Automatic checkpoint threshold in pages
   */
  autoCheckpoint?: number
  /**
   * Interval in milliseconds for backstop checkpointing
   */
  backstopInterval?: number
}

export interface IDBBatchAtomicVFSOptions {
  /**
   * patched options for navigator.locks.request()
   * @default 'shared+hint'
   */
  lockPolicy?: 'exclusive' | 'shared' | 'shared+hint'
  /**
   * timeout for the lock
   * @default Infinity
   */
  lockTimeout?: number
}

export interface InitSQLiteOptions extends Omit<BaseStorageOptions, 'url'> {
  path: string
  sqliteModule: any
  vfsFn: (name: string, module: any, options?: any) => Promisable<FacadeVFS>
  vfsOptions?: any
  readonly?: boolean
}

export type SQLiteDBCore = {
  /**
   * File name (IDBBatchAtomicVFS) or directory path (OPFSCoopSyncVFS)
   */
  path: string
  /**
   * DB pointer
   * @deprecated use pointer instead
   */
  db: number
  /**
   * SQLite db pointer
   */
  pointer: number
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
  vfs: FacadeVFS
}

export type SQLiteDB = SQLiteDBCore & {
  /**
   * Close db. Throw error if fail to close
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
  stream: (
    onData: (data: Record<string, SQLiteCompatibleType>) => void,
    sql: string,
    parameters?: SQLiteCompatibleType[],
  ) => Promise<void>
  /**
   * Run sql and return result list
   * @param sql raw sql with placeholder
   * @param parameters params that replace the placeholder
   * @example
   * const results = await run('select ? from test where id = ?', ['name', 1])
   */
  run: (
    sql: string,
    parameters?: SQLiteCompatibleType[],
  ) => Promise<Array<Record<string, SQLiteCompatibleType>>>
  /**
   * Import database from File or ReadableStream
   * @param data exising database
   */
  sync: (data: File | ReadableStream) => Promise<void>
  /**
   * Export database to Uint8Array
   */
  dump: () => Promise<Uint8Array<ArrayBuffer>>
}

export interface BaseStorageOptions {
  /**
   * Custom wasm url
   */
  url?: string
  /**
   * Open SQLite file with SQLITE_OPEN_READONLY
   *
   * If absent, open with SQLITE_OPEN_READWRITE | SQLITE_OPEN_CREATE
   */
  readonly?: boolean
  /**
   * Callback before sqlite.open_v2(path)
   */
  beforeOpen?: (vfs: FacadeVFS, path: string) => Promisable<void>
}
