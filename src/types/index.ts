import type { Base } from 'wa-sqlite/src/VFS.js'
import type { SQLiteAPI } from './api'

export type Promisable<T> = T | Promise<T>

export interface FacadeVFS extends Base {
  close: () => void | Promise<void>

  isReady: () => boolean | Promise<boolean>

  hasAsyncMethod: (methodName: string) => boolean

  getFilename: (pFile: number) => string

  jOpen: (filename: string, pFile: number, flags: number, pOutFlags: DataView) => number | Promise<number>

  jDelete: (filename: string, syncDir: number) => number | Promise<number>

  jAccess: (filename: string, flags: number, pResOut: DataView) => number | Promise<number>

  jFullPathname: (filename: string, zOut: Uint8Array) => number | Promise<number>

  jGetLastError: (zBuf: Uint8Array) => number | Promise<number>

  jClose: (pFile: number) => number | Promise<number>

  jRead: (pFile: number, pData: Uint8Array, iOffset: number) => number | Promise<number>

  jWrite: (pFile: number, pData: Uint8Array, iOffset: number) => number | Promise<number>

  jTruncate: (pFile: number, size: number) => number | Promise<number>

  jSync: (pFile: number, flags: number) => number | Promise<number>

  jFileSize: (pFile: number, pSize: DataView) => number | Promise<number>

  jLock: (pFile: number, lockType: number) => number | Promise<number>

  jUnlock: (pFile: number, lockType: number) => number | Promise<number>

  jCheckReservedLock: (pFile: number, pResOut: DataView) => number | Promise<number>

  jFileControl: (pFile: number, op: number, pArg: DataView) => number | Promise<number>

  jSectorSize: (pFile: number) => number | Promise<number>

  jDeviceCharacteristics: (pFile: number) => number | Promise<number>
}

export interface IDBBatchAtomicVFSOptions {
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

export interface InitSQLiteOptions extends Omit<BaseStorageOptions, 'url'> {
  path: string
  sqliteModule: any
  vfsFn: (name: string, module: any, options?: any) => Promisable<FacadeVFS>
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
  stream: (
    onData: (data: Record<string, SQLiteCompatibleType>) => void,
    sql: string,
    parameters?: SQLiteCompatibleType[]
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
    parameters?: SQLiteCompatibleType[]
  ) => Promise<Array<Record<string, SQLiteCompatibleType>>>
  /**
   * Import database from `File` or `ReadableStream`
   * @param data exising database
   */
  sync: (data: File | ReadableStream) => Promise<void>
  /**
   * Export database to `Uint8Array`
   */
  dump: () => Promise<Uint8Array>
}

export interface BaseStorageOptions {
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
  /**
   * Callback before `sqlite.open_v2(path)`
   */
  beforeOpen?: (vfs: FacadeVFS, path: string) => Promisable<void>
}
