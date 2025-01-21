import type { InitSQLiteOptions, Promisable, SQLiteDB, SQLiteDBCore } from './types'
import { Factory } from 'wa-sqlite'
import { exportDatabase, importDatabase } from './io'
import { changes, close, lastInsertRowId, parseOpenV2Flag, run, stream } from './utils'

/**
 * Load SQLite database, presets:
 * - `useMemoryStorage`
 * - `useIdbStorage`
 * - `useIdbMemoryStorage`
 * - `useOpfsStorage`
 * - `useFsHandleStorage`
 * @param options {@link InitSQLiteOptions}
 */
export async function initSQLite(options: Promisable<InitSQLiteOptions>): Promise<SQLiteDB> {
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
    sync: data => importDatabase(core.vfs, core.path, data),
  }
}

/**
 * Load SQLite database without utils
 *
 * Presets: `useMemoryStorage`, `useIdbStorage`, `useOpfsStorage`
 * @param options {@link InitSQLiteOptions}
 */
export async function initSQLiteCore(
  options: Promisable<InitSQLiteOptions>,
): Promise<SQLiteDBCore> {
  const { path, sqliteModule, vfsFn, vfsOptions, readonly, beforeOpen } = await options
  const sqlite = Factory(sqliteModule)
  const vfs = await vfsFn(path, sqliteModule, vfsOptions)
  sqlite.vfs_register(vfs as unknown as SQLiteVFS, true)
  await beforeOpen?.(vfs, path)
  const pointer = await sqlite.open_v2(
    path,
    parseOpenV2Flag(readonly),
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
