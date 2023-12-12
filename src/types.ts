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
