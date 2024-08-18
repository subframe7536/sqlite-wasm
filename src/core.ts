import type { Promisable } from '@subframe7536/type-utils'
import { Factory, SQLITE_OPEN_READONLY, SQLITE_ROW } from 'wa-sqlite'
import type { Options, SQLiteDB } from './types'

/**
 * load SQLite database, presets: `useMemoryStorage`, `useIdbStorage`, `useOpfsStorage`
 * @param options init options
 */
export async function initSQLite(options: Promisable<Options>): Promise<SQLiteDB> {
  const { path, sqliteModule, vfsFn, vfsOptions, readonly } = await options
  const sqlite = Factory(sqliteModule)
  const vfs = await vfsFn(path, sqliteModule, vfsOptions)
  sqlite.vfs_register(vfs, true)
  const db = await sqlite.open_v2(
    path,
    readonly ? SQLITE_OPEN_READONLY : undefined,
  )
  const close: SQLiteDB['close'] = async () => {
    await sqlite.close(db)
  }
  const changes: SQLiteDB['changes'] = () => {
    return sqlite.changes(db)
  }
  const lastInsertRowId: SQLiteDB['lastInsertRowId'] = async () => {
    return await new Promise<number>(resolve => sqlite.exec(
      db,
      'SELECT last_insert_rowid()',
      ([id]) => resolve(id as number),
    ))
  }
  const stream: SQLiteDB['stream'] = async (onData, sql, parameters) => {
    for await (const stmt of sqlite.statements(db, sql)) {
      if (parameters?.length) {
        sqlite.bind_collection(stmt, parameters)
      }
      const cols = sqlite.column_names(stmt)
      while (await sqlite.step(stmt) === SQLITE_ROW) {
        const row = sqlite.row(stmt)
        onData(Object.fromEntries(cols.map((key, i) => [key, row[i]])))
      }
    }
  }
  const run: SQLiteDB['run'] = async (sql, parameters) => {
    const results: any[] = []
    await stream(data => results.push(data), sql, parameters)
    return results
  }
  /// keep-sorted
  return {
    changes,
    close,
    db,
    lastInsertRowId,
    path,
    run,
    sqlite,
    stream,
    vfs,
  }
}
