export type InitOptions = {
  path: string
  sqliteModule: any
  vfs: SQLiteVFS
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
  close(): Promise<void>
  /**
   * get db changes
   */
  changes(): number
  /**
   * get lastInsertRowId
   */
  lastInsertRowId(): Promise<number>
  /**
   * run sql and return result list
   * @param sql raw sql with placeholder
   * @param parameters params that replace the placeholder
   * @example
   * const results = await run('select ? from test where id = ?', ['name', 1])
   */
  run(sql: string, parameters?: readonly unknown[]): Promise<Array<Record<string, SQLiteCompatibleType>>>
}

export type BaseOptions = {
  url?: string
}

export type SQLiteCompatibleType = number | string | Uint8Array | Array<number> | bigint | null

export interface SQLiteVFS {
  /** Maximum length of a file path in UTF-8 bytes (default 64) */
  mxPathName?: number

  /** @see https://sqlite.org/c3ref/io_methods.html */
  xClose(fileId: number): number

  /** @see https://sqlite.org/c3ref/io_methods.html */
  xRead(
    fileId: number,
    pData: Uint8Array,
    iOffset: number
  ): number

  /** @see https://sqlite.org/c3ref/io_methods.html */
  xWrite(
    fileId: number,
    pData: Uint8Array,
    iOffset: number
  ): number

  /** @see https://sqlite.org/c3ref/io_methods.html */
  xTruncate(fileId: number, iSize: number): number

  /** @see https://sqlite.org/c3ref/io_methods.html */
  xSync(fileId: number, flags: number): number

  /** @see https://sqlite.org/c3ref/io_methods.html */
  xFileSize(
    fileId: number,
    pSize64: DataView
  ): number

  /** @see https://sqlite.org/c3ref/io_methods.html */
  xLock(fileId: number, flags: number): number

  /** @see https://sqlite.org/c3ref/io_methods.html */
  xUnlock(fileId: number, flags: number): number

  /** @see https://sqlite.org/c3ref/io_methods.html */
  xCheckReservedLock(
    fileId: number,
    pResOut: DataView
  ): number

  /** @see https://sqlite.org/c3ref/io_methods.html */
  xFileControl(
    fileId: number,
    flags: number,
    pOut: DataView
  ): number

  /** @see https://sqlite.org/c3ref/io_methods.html */
  xDeviceCharacteristics(fileId: number): number

  /** @see https://sqlite.org/c3ref/vfs.html */
  xOpen(
    name: string | null,
    fileId: number,
    flags: number,
    pOutFlags: DataView
  ): number

  /** @see https://sqlite.org/c3ref/vfs.html */
  xDelete(name: string, syncDir: number): number

  /** @see https://sqlite.org/c3ref/vfs.html */
  xAccess(
    name: string,
    flags: number,
    pResOut: DataView
  ): number
}
