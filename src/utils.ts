import type { BaseStorageOptions, SQLiteDBCore } from './types'
import { SQLITE_DETERMINISTIC, SQLITE_DIRECTONLY, SQLITE_UTF8 } from 'wa-sqlite'
import { SQLITE_ROW } from 'wa-sqlite/src/sqlite-constants.js'
import { importDatabase } from './io'

/**
 * check if IndexedDB and Web Locks API supported
 */
export function isIdbSupported(): boolean {
  return 'locks' in navigator
}

/**
 * check if [OPFS SyncAccessHandle](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemSyncAccessHandle) supported
 */
export async function isOpfsSupported(): Promise<boolean> {
  // must write file to test, see https://stackoverflow.com/questions/76113945/file-system-access-api-on-safari-ios-createsyncaccesshandle-unknownerror-i
  const inner = (): Promise<boolean> => new Promise((resolve) => {
    if (typeof navigator?.storage?.getDirectory !== 'function') {
      resolve(false)
      return
    }

    navigator.storage.getDirectory()
      .then((root) => {
        if (!root) {
          resolve(false)
          return
        }

        root.getFileHandle('_CHECK', { create: true })
          // @ts-expect-error no type
          .then(handle => handle.createSyncAccessHandle())
          .then(access => (access.close(), root.removeEntry('_CHECK')))
          .then(() => resolve(true))
          .catch(() => root.removeEntry('_CHECK')
            .then(() => resolve(false))
            .catch(() => resolve(false)),
          )
      })
      .catch(() => resolve(false))
  })

  if ('importScripts' in globalThis) {
    return await inner()
  }
  try {
    if (typeof Worker === 'undefined' || typeof Promise === 'undefined') {
      return false
    }

    const url = URL.createObjectURL(
      new Blob(
        [`(${inner})().then(postMessage)`],
        { type: 'text/javascript' },
      ),
    )
    const worker = new Worker(url)

    const result = await new Promise<boolean>((resolve, reject) => {
      worker.onmessage = ({ data }) => resolve(data)
      worker.onerror = err => (err.preventDefault(), reject(false))
    })

    worker.terminate()
    URL.revokeObjectURL(url)

    return result
  } catch {
    return false
  }
}

/**
 * check `new Worker(url, { type: 'module' })` support
 *
 * {@link https://stackoverflow.com/questions/62954570/javascript-feature-detect-module-support-for-web-workers Reference}
 */
export function isModuleWorkerSupport(): boolean {
  let supports = false
  try {
    new Worker('data:,', {
      // @ts-expect-error check assign
      get type() {
        supports = true
      },
    }).terminate()
  } finally {
    // eslint-disable-next-line no-unsafe-finally
    return supports
  }
}

/**
 * Create custom function, run js script in SQLite
 *
 * @example
 * ```ts
 * import { customFunction, initSQLite, isOpfsSupported } from '@subframe7536/sqlite-wasm'
 * import { useOpfsStorage } from '@subframe7536/sqlite-wasm/opfs'
 * import { uuidv7 } from 'uuidv7'
 *
 * const { run, sqlite, db } = await initSQLite(
 *   useOpfsStorage('test')
 * )
 * customFunction(sqlite, db, 'uuidv7', () => uuidv7())
 * console.log(await run('select uuidv7() as a'))
 * // [{ "a": "01932f1b-b663-7714-af4d-17a3d9efc7b3" }]
 * ```
 */
export function customFunction<N extends string, T extends SQLiteCompatibleType[]>(
  sqlite: SQLiteAPI,
  db: number,
  fnName: N,
  fn: N extends '' ? never : (...args: T) => (SQLiteCompatibleType | number[]) | null,
  options: {
    deterministic?: boolean
    directOnly?: boolean
    varargs?: boolean
  } = {},
): void {
  let flags = SQLITE_UTF8
  if (options.deterministic) {
    flags |= SQLITE_DETERMINISTIC
  }
  if (options.directOnly) {
    flags |= SQLITE_DIRECTONLY
  }
  sqlite.create_function(
    db,
    fnName,
    (options.varargs || fn.length === 0) ? -1 : fn.length,
    flags,
    0,
    (ctx, value) => {
      const args = [] as unknown as T
      for (let i = 0; i < fn.length; i++) {
        args.push(sqlite.value(value[i]))
      }
      return sqlite.result(ctx, fn(...args))
    },
  )
}

export function customFunctionCore<N extends string, T extends SQLiteCompatibleType[]>(
  core: SQLiteDBCore,
  fnName: N,
  fn: N extends '' ? never : (...args: T) => (SQLiteCompatibleType | number[]) | null,
  options: {
    deterministic?: boolean
    directOnly?: boolean
    varargs?: boolean
  } = {},
): void {
  return customFunction(core.sqlite, core.db, fnName, fn, options)
}

/**
 * Parse options with existing database
 * @param data database File or ReadableStream
 * @param options extra options
 * @example
 * ```ts
 * import { initSQLite, withExistDB } from '@subframe7536/sqlite-wasm'
 * import { useIdbStorage } from '@subframe7536/sqlite-wasm/idb'
 *
 * const db = initSQLite(
 *   useIdbStorage('test.db', withExistDB(FileOrReadableStream, { url }))
 * )
 * ```
 */
export function withExistDB<T extends BaseStorageOptions>(
  data: File | ReadableStream,
  options?: Omit<T, 'beforeOpen'>,
): T {
  return {
    ...options,
    beforeOpen: (vfs, path) => importDatabase(vfs, path, data),
  } as T
}

export async function close(core: SQLiteDBCore): Promise<void> {
  await core.sqlite.close(core.pointer)
  await core.vfs.close()
}

export function changes(core: SQLiteDBCore): number | bigint {
  return core.sqliteModule._sqlite3_changes(core.pointer)
}

export function lastInsertRowId(core: SQLiteDBCore): number | bigint {
  return core.sqliteModule._sqlite3_last_insert_rowid(core.pointer)
}

export async function stream(
  core: SQLiteDBCore,
  onData: (data: Record<string, SQLiteCompatibleType>) => void,
  sql: string,
  parameters?: SQLiteCompatibleType[],
): Promise<void> {
  const { sqlite, pointer } = core
  for await (const stmt of sqlite.statements(pointer, sql)) {
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
