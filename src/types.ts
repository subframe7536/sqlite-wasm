export type InitOptions = {
  fileName: string
  sqliteModule: any
  vfs: SQLiteVFS
}

export type SQLiteDB = {
  db: number
  sqlite: SQLiteAPI
  close(): Promise<void>
  changes(): number
  lastInsertRowId(): Promise<number>
  run(sql: string, parameters?: readonly unknown[]): Promise<Record<string, SQLiteCompatibleType>[]>
}

export type BaseOptions = {
  url?: string
}
