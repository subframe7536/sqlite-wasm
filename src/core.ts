import type { Promisable } from '@subframe7536/type-utils'
import type { Options, SQLiteDB, SQLiteDBCore } from './types'
import { Factory, SQLITE_OPEN_READONLY, SQLITE_ROW } from 'wa-sqlite'

/**
 * Load SQLite database, presets: `useMemoryStorage`, `useIdbStorage`, `useIdbMemoryStorage`, `useOpfsStorage`
 * @param options init options
 */
export async function initSQLite(options: Promisable<Options>): Promise<SQLiteDB> {
  const core = await initSQLiteCore(options)
  /// keep-sorted
  return {
    ...core,
    changes: changes.bind(null, core),
    close: close.bind(null, core),
    lastInsertRowId: lastInsertRowId.bind(null, core),
    run: run.bind(null, core),
    stream: stream.bind(null, core),
  }
}

/**
 * Load SQLite database without utils
 *
 * Presets: `useMemoryStorage`, `useIdbStorage`, `useOpfsStorage`
 * @param options init options
 */
export async function initSQLiteCore(
  options: Promisable<Options>,
): Promise<SQLiteDBCore> {
  const { path, sqliteModule, vfsFn, vfsOptions, readonly } = await options
  const sqlite = Factory(sqliteModule)
  const vfs = await vfsFn(path, sqliteModule, vfsOptions)
  sqlite.vfs_register(vfs, true)
  const db = await sqlite.open_v2(
    path,
    readonly ? SQLITE_OPEN_READONLY : undefined,
  )
  /// keep-sorted
  return {
    db,
    path,
    sqlite,
    sqliteModule,
    vfs,
  }
}

export async function close(core: SQLiteDBCore): Promise<void> {
  await core.sqlite.close(core.db)
}
export function changes(core: SQLiteDBCore): number | bigint {
  return core.sqliteModule._sqlite3_changes(core.db)
}

export function lastInsertRowId(core: SQLiteDBCore): number | bigint {
  return core.sqliteModule._sqlite3_last_insert_rowid(core.db)
}

export async function stream(
  core: SQLiteDBCore,
  onData: (data: Record<string, SQLiteCompatibleType>) => void,
  sql: string,
  parameters?: SQLiteCompatibleType[],
): Promise<void> {
  const { sqlite, db } = core
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

export async function run(
  core: SQLiteDBCore,
  sql: string,
  parameters?: SQLiteCompatibleType[],
): Promise<Array<Record<string, SQLiteCompatibleType>>> {
  const results: any[] = []
  await stream(core, data => results.push(data), sql, parameters)
  return results
}
