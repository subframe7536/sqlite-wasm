# sqlite-wasm

Typesafe [custom wa-sqlite](https://github.com/subframe7536/sqwab) wrapper, run in memory or persist data to IndexedDB or [OPFS](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API/Origin_private_file_system), support FTS5 and update / delete limit

Low-level layer for [kysely-wasqlite-worker-dialect](https://github.com/subframe7536/kysely-sqlite-tools/tree/master/packages/dialect-wasqlite-worker)

## Usage

### Memory

Store data in memory, use `MemoryVFS` with `wa-sqlite.wasm`, no data persistence

```ts
import { initSQLite, isOpfsSupported, useMemoryStorage } from '@subframe7536/sqlite-wasm'

// optional url
const url = 'https://cdn.jsdelivr.net/npm/@subframe7536/sqlite-wasm@0.5.0/wa-sqlite.wasm'
const url1 = 'https://cdn.jsdelivr.net/gh/subframe7536/sqlite-wasm@v0.5.0/wa-sqlite-fts5/wa-sqlite.wasm'

const { run, changes, lastInsertRowId, close } = await initSQLite(
  useMemoryStorage({ url })
)
```

### IndexedDB

Store data in `IndexedDB`, use `IDBBatchAtomicVFS` with `wa-sqlite-async.wasm`, larger than sync version, better compatibility

[minimal IndexedDB backend browser version](https://caniuse.com/mdn-api_lockmanager)

```ts
import { initSQLite } from '@subframe7536/sqlite-wasm'
import { useIdbStorage } from '@subframe7536/sqlite-wasm/idb'

// optional url
const url = 'https://cdn.jsdelivr.net/npm/@subframe7536/sqlite-wasm@0.5.0/wa-sqlite-async.wasm'
const url1 = 'https://cdn.jsdelivr.net/gh/subframe7536/sqlite-wasm@v0.5.0/wa-sqlite-fts5/wa-sqlite-async.wasm'

const { run, changes, lastInsertRowId, close } = await initSQLite(
  useIdbStorage('test.db', { url })
)
```

#### IdbMemory

Store data in memory and sync to `IndexedDB`, use `IDBMirrorVFS` with `wa-sqlite-async.wasm` (larger than sync version), better performance compare to `useIdbStorage`.

```ts
import { initSQLite } from '@subframe7536/sqlite-wasm'
import { useIdbMemoryStorage } from '@subframe7536/sqlite-wasm/idb-memory'
// before 0.5.0
// import { useIdbMemoryStorage } from '@subframe7536/sqlite-wasm/idb'

// optional url
const url = 'https://cdn.jsdelivr.net/npm/@subframe7536/sqlite-wasm@0.5.0/dist/wa-sqlite-async.wasm'

const { run, changes, lastInsertRowId, close } = await initSQLite(
  useIdbMemoryStorage('test.db', { url })
)
```

### OPFS

Store data in [OPFS](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API/Origin_private_file_system) through [FileSystemSyncAccessHandle](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemSyncAccessHandle), use `OPFSCoopSyncVFS` with `wa-sqlite.wasm`, smaller and faster all other persist storages.

> [!important]
> **MUST RUN IN WEB WORKER!**

[minimal OPFS backend browser version](https://caniuse.com/mdn-api_filesystemsyncaccesshandle)

```ts
import { initSQLite, isOpfsSupported } from '@subframe7536/sqlite-wasm'
import { useOpfsStorage } from '@subframe7536/sqlite-wasm/opfs'

// optional url
const url = 'https://cdn.jsdelivr.net/npm/@subframe7536/sqlite-wasm@0.5.0/dist/wa-sqlite.wasm'

onmessage = async () => {
  if (!await isOpfsSupported()) { // this can be called in main thread
    return
  }
  const { run, changes, lastInsertRowId, close } = await initSQLite(
    useOpfsStorage('test.db', url)
  )
}
```

#### File System Access API

Store data through `FileSystemFileHandle`, use modified `OPFSAnyContextVFS` with `wa-sqlite-async.wasm`, allow to directly read and write to device's local file or OPFS file entry in main or worker thread, but a little slower than [`useOpfsStorage`](#opfs)

[minimal File System Access backend browser version](https://caniuse.com/mdn-api_filesystemhandle)

> [!warning]
> 1. maybe have perfarmance issue on Windows with device's local file, see in [#5](https://github.com/subframe7536/sqlite-wasm/pull/5)
> 2. Safari is not supported, see in [caniuse](https://caniuse.com/mdn-api_filesystemwritablefilestream)

```ts
import { initSQLite, isOpfsSupported } from '@subframe7536/sqlite-wasm'
import { useFsHandleStorage } from '@subframe7536/sqlite-wasm/fs-handle'

// optional url
const url = 'https://cdn.jsdelivr.net/npm/@subframe7536/sqlite-wasm@0.5.0/dist/wa-sqlite-async.wasm'

// device's local file
const root = await window.showDirectoryPicker()
// OPFS
const root1 = await navigator.storage.getDirectory()

const { run, changes, lastInsertRowId, close } = await initSQLite(
  useFsHandleStorage('test.db', root, url)
)
```

### Import from existing database

From v0.5.0

Existing database can be `File` or `ReadableStream`

```ts
async function selectFile(): Promise<File> {
  return await new Promise((resolve, reject) => {
    const input = document.createElement('input')
    input.type = 'file'

    input.onchange = () => {
      const file = input.files?.[0]
      if (file) {
        resolve(file)
      } else {
        reject(new Error('No file selected'))
      }
      input.remove()
    }

    input.oncancel = () => {
      reject(new Error('File selection cancelled'))
      input.remove()
    }
    input.click()
  })
}
const FileOrReadableStream = remote
  ? (await fetch(remoteSqliteURL)).body!
  : await selectFile()
```

Import while initiaizing

```ts
import { initSQLite, withExistDB } from '@subframe7536/sqlite-wasm'
import { useIdbStorage } from '@subframe7536/sqlite-wasm/idb'

const db = initSQLite(
  useIdbStorage('test.db', withExistDB(FileOrReadableStream, { url }))
)
```

or load it later

```ts
import { importDatabase } from '@subframe7536/sqlite-wasm'
import { useIdbStorage } from '@subframe7536/sqlite-wasm/idb'

const db = initSQLite('test.db', { url })
await db.sync(FileOrReadableStream)

// or use independent function
await importDatabase(db.vfs, db.path, FileOrReadableStream)
```

### Export current database

From v0.5.0

If you are using `useOpfsStorage`, you can directly download it from OPFS, since its db file has same structure as native filesystem.

Example for `useIdbStorage`

```ts
import { exportDatabase } from '@subframe7536/sqlite-wasm'
import { useIdbStorage } from '@subframe7536/sqlite-wasm/idb'

const db = initSQLite('test.db', { url })

const buffer = await db.dump()
// or use independent function
const buffer1 = exportDatabase(db.vfs, db.path)
```

### Custom Function

```ts
import { customFunction, initSQLite, isOpfsSupported } from '@subframe7536/sqlite-wasm'
import { useOpfsStorage } from '@subframe7536/sqlite-wasm/opfs'
import { uuidv7 } from 'uuidv7'

const { run, sqlite, db } = await initSQLite(
  useOpfsStorage('test')
)
customFunction(sqlite, db, 'uuidv7', () => uuidv7())
console.log(await run('select uuidv7() as a'))
// [{ "a": "01932f1b-b663-7714-af4d-17a3d9efc7b3" }]
```

### Fine-Grain Functions

```ts
import {
  close,
  customFunctionCore,
  exportDatabase,
  importDatabase,
  initSQLiteCore,
  iterator,
  run,
} from '@subframe7536/sqlite-wasm'

const core = await initSQLiteCore(/* options */)

await importDatabase(core.vfs, core.path, stream)

for await (const row of iterator(core, 'select * from test')) {
  console.log(row)
}

customFunctionCore(core, 'test', num => num)
await run(core, 'select test(?)', [1])

const buf = await exportDatabase(core.vfs, core.path)

await close(core)
```

### Utils

```ts
function dumpVFS(vfs: FacadeVFS, path: string, onDone?: (vfs: FacadeVFS, path: string) => any): ReadableStream

function exportDatabaseFromIDB(vfs: FacadeVFS, path: string): Promise<Uint8Array>

function exportDatabaseFromFsHandle(vfs: FacadeVFS, path: string): Promise<Uint8Array>

/**
 * Export database to `Uint8Array`
 * @param vfs SQLite VFS
 * @param path database path
 */
function exportDatabase(vfs: FacadeVFS, path: string): Promise<Uint8Array>

function importDatabaseToIdb(vfs: FacadeVFS, path: string, stream: ReadableStream<Uint8Array>): Promise<void>

/**
 * Import database from `File` or `ReadableStream`
 * @param vfs SQLite VFS
 * @param path db path
 * @param data existing database
 */
function importDatabase(vfs: FacadeVFS, path: string, data: File | ReadableStream<Uint8Array>): Promise<void>

/**
 * check if IndexedDB and Web Locks API supported
 */
function isIdbSupported(): boolean

/**
 * check if [OPFS SyncAccessHandle](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemSyncAccessHandle) supported
 */
function isOpfsSupported(): Promise<boolean>

/**
 * check `new Worker(url, { type: 'module' })` support
 *
 * {@link https://stackoverflow.com/questions/62954570/javascript-feature-detect-module-support-for-web-workers Reference}
 */
function isModuleWorkerSupport(): boolean

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
function customFunction<N extends string, T extends SQLiteCompatibleType[]>(sqlite: SQLiteAPI, db: number, fnName: N, fn: N extends '' ? never : (...args: T) => (SQLiteCompatibleType | number[]) | null, options?: {
  deterministic?: boolean
  directOnly?: boolean
  varargs?: boolean
}): void

function customFunctionCore<N extends string, T extends SQLiteCompatibleType[]>(core: SQLiteDBCore, fnName: N, fn: N extends '' ? never : (...args: T) => (SQLiteCompatibleType | number[]) | null, options?: {
  deterministic?: boolean
  directOnly?: boolean
  varargs?: boolean
}): void

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
function withExistDB<T extends BaseStorageOptions>(data: File | ReadableStream, options?: Omit<T, 'beforeOpen'>): T

function close(core: SQLiteDBCore): Promise<void>

function changes(core: SQLiteDBCore): number | bigint

function lastInsertRowId(core: SQLiteDBCore): number | bigint

function stream(core: SQLiteDBCore, onData: (data: Record<string, SQLiteCompatibleType>) => void, sql: string, parameters?: SQLiteCompatibleType[]): Promise<void>

function run(core: SQLiteDBCore, sql: string, parameters?: SQLiteCompatibleType[]): Promise<Array<Record<string, SQLiteCompatibleType>>>

function iterator(core: SQLiteDBCore, sql: string, parameters?: SQLiteCompatibleType[], chunkSize?: number): AsyncIterableIterator<Record<string, SQLiteCompatibleType>[]>

function parseOpenV2Flag(readonly?: boolean): number

function reopen(core: SQLiteDBCore, readonly?: boolean): Promise<void>
```

## License

MIT
