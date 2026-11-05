import { Factory } from 'wa-sqlite'

import { exportDatabase, importDatabase } from './io'
import type { InitSQLiteOptions, Promisable, SQLiteDB, SQLiteDBCore, SQLiteVFS } from './type'
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
  return {
    ...core,
    changes: () => changes(core),
    close: () => close(core),
    dump: () => exportDatabase(core.vfs, core.path),
    lastInsertRowId: () => lastInsertRowId(core),
    run: (...args) => run(core, ...args),
    stream: (...args) => stream(core, ...args),
    sync: (data) => importDatabase(core.vfs, core.path, data),
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
  // wa-sqlite <1.2.0 builds lack the Module.asyncMode marker; without it
  // step_asap() calls the raw export, which returns garbage when an
  // Asyncify call suspends. handleAsync is a plain function only on
  // Asyncify builds (async function on JSPI, null on sync builds).
  if (
    sqliteModule.asyncMode === undefined
    && sqliteModule.handleAsync?.constructor?.name === 'Function'
  ) {
    sqliteModule.asyncMode = 'asyncify'
  }
  const sqlite = Factory(sqliteModule)
  const vfs = await vfsFn(path, sqliteModule, vfsOptions)
  sqlite.vfs_register(vfs as unknown as SQLiteVFS, true)
  await beforeOpen?.(vfs, path)
  const pointer = await sqlite.open_v2(path, parseOpenV2Flag(readonly))

  return {
    db: pointer,
    path,
    pointer,
    sqlite,
    sqliteModule,
    vfs,
  }
}
