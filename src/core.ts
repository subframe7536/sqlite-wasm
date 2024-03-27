import type { Promisable } from '@subframe7536/type-utils'
import { Factory, SQLITE_OPEN_READONLY, SQLITE_ROW } from 'wa-sqlite'
import type { InitOptions, SQLiteCompatibleType, SQLiteDB } from './types'

/**
 * load db
 * @param options init options
 */
export async function initSQLite(options: Promisable<InitOptions>, readonly?: boolean): Promise<SQLiteDB> {
  const { path, sqliteModule, vfs } = await options
  const sqlite = Factory(sqliteModule)
  sqlite.vfs_register(vfs, true)
  const db = await sqlite.open_v2(
    path,
    readonly ? SQLITE_OPEN_READONLY : undefined,
  )
  return {
    path,
    vfs,
    db,
    sqlite,
    async close() {
      await sqlite.close(db)
    },
    changes() {
      return sqlite.changes(db)
    },
    async lastInsertRowId() {
      return await new Promise<number>(resolve => sqlite.exec(
        db,
        'SELECT last_insert_rowid()',
        ([id]) => resolve(id as number),
      ))
    },
    async run(sql: string, parameters?: SQLiteCompatibleType[]) {
      const str = sqlite.str_new(db, sql)
      try {
        const prepared = await sqlite.prepare_v2(db, sqlite.str_value(str))

        if (!prepared) {
          return []
        }

        const stmt = prepared.stmt
        try {
          parameters?.length && sqlite.bind_collection(stmt, parameters)

          const rows: Record<string, SQLiteCompatibleType>[] = []
          const cols = sqlite.column_names(stmt)

          while ((await sqlite.step(stmt)) === SQLITE_ROW) {
            const row = sqlite.row(stmt)
            rows.push(Object.fromEntries(cols.map((key, i) => [key, row[i]])))
          }
          return rows
        } finally {
          await sqlite.finalize(stmt)
        }
      } finally {
        sqlite.str_finish(str)
      }
    },
  }
}
