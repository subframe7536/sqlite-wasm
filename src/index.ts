import type { Promisable } from '@subframe7536/type-utils'
import { SQLITE_ROW } from 'wa-sqlite'

export type InitOptions = {
  fileName: string
  sqlite: SQLiteAPI
}

export type SQLiteDB = {
  db: number
  sqlite: SQLiteAPI
  close(): Promise<void>
  changes(): number
  lastInsertRowId(): Promise<number>
  run(sql: string, parameters?: readonly unknown[]): Promise<Record<string, SQLiteCompatibleType>[]>
}

/**
 * load db
 * @param options init options
 */
export async function initSQLite(options: Promisable<InitOptions>): Promise<SQLiteDB> {
  const { fileName, sqlite } = await options
  const db = await sqlite.open_v2(fileName)
  return {
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
    async run(sql: string, parameters?: readonly unknown[]) {
      const str = sqlite.str_new(db, sql)
      const prepared = await sqlite.prepare_v2(db, sqlite.str_value(str))

      if (!prepared) {
        return []
      }

      const stmt = prepared.stmt
      try {
        parameters?.length && sqlite.bind_collection(stmt, parameters as [])

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
    },
  }
}

export function getSyncWasmURL() {
  return new URL('@subframe7536/sqlite-wasm/wasm', import.meta.url).href
}

export function getAsyncWasmURL() {
  return new URL('@subframe7536/sqlite-wasm/wasm-async', import.meta.url).href
}

/**
 * check if [OPFS SyncAccessHandle](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemSyncAccessHandle) supported
 *
 * **MUST RUN IN WEB WORKER**
 */
export async function isOpfsSupported() {
  const root = await navigator?.storage.getDirectory?.()
  if (!root) {
    return false
  }
  const checkFileName = '_CHECK'
  try {
    const handle = await root.getFileHandle(checkFileName, { create: true })
    return 'createSyncAccessHandle' in handle
  } catch {
    return false
  } finally {
    await root.removeEntry(checkFileName)
  }
}
