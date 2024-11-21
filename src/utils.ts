import type { SQLiteDBCore } from './types'
import { SQLITE_DETERMINISTIC, SQLITE_DIRECTONLY, SQLITE_UTF8 } from 'wa-sqlite'

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
  // must call and test, see https://stackoverflow.com/questions/76113945/file-system-access-api-on-safari-ios-createsyncaccesshandle-unknownerror-i
  const inner = async (): Promise<boolean> => {
    const root = await navigator?.storage.getDirectory?.()
    if (!root) {
      return false
    }
    try {
      const handle = await root.getFileHandle('_CHECK', { create: true })
      // @ts-expect-error check
      const access = await handle.createSyncAccessHandle()
      access.close()
      return true
    } catch {
      return false
    } finally {
      await root.removeEntry('_CHECK')
    }
  }
  if ('importScripts' in globalThis) {
    return inner()
  }
  try {
    if (typeof Worker === 'undefined') {
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
      worker.onmessage = ({ data }) => {
        resolve(data)
      }
      worker.onerror = (err) => {
        err.preventDefault()
        reject(false)
      }
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
