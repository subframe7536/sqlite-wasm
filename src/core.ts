import type { Options, Promisable, SQLiteDB, SQLiteDBCore } from './types'
import {
  Factory,
  SQLITE_OPEN_CREATE,
  SQLITE_OPEN_READONLY,
  SQLITE_OPEN_READWRITE,
  SQLITE_ROW,
} from 'wa-sqlite'
import { exportDatabase, importDatabase } from './io'

/**
 * Load SQLite database, presets: `useMemoryStorage`, `useIdbStorage`, `useIdbMemoryStorage`, `useOpfsStorage`
 * @param options init options
 */
export async function initSQLite(options: Promisable<Options>): Promise<SQLiteDB> {
  const core = await initSQLiteCore(options)
  /// keep-sorted
  return {
    ...core,
    changes: () => changes(core),
    close: () => close(core),
    dump: () => exportDatabase(core.vfs, core.path),
    lastInsertRowId: () => lastInsertRowId(core),
    run: (...args) => run(core, ...args),
    stream: (...args) => stream(core, ...args),
    sync: file => importDatabase(core.vfs, core.path, file),
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
  const { path, sqliteModule, vfsFn, vfsOptions, readonly, beforeOpen } = await options
  const sqlite = Factory(sqliteModule)
  const vfs = await vfsFn(path, sqliteModule, vfsOptions)
  sqlite.vfs_register(vfs as unknown as SQLiteVFS, true)
  beforeOpen?.(vfs, path)
  const pointer = await sqlite.open_v2(
    path,
    readonly ? SQLITE_OPEN_READONLY : SQLITE_OPEN_READWRITE | SQLITE_OPEN_CREATE,
  )
  /// keep-sorted
  return {
    db: pointer,
    path,
    pointer,
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
