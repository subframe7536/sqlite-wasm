# sqlite-wasm

Typesafe [custom wa-sqlite](https://github.com/subframe7536/sqwab/releases/tag/v1729389754) wrapper, run in memory or persist data to IndexedDB or [OPFS](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API/Origin_private_file_system), support FTS5 and update / delete limit

Low-level layer for [kysely-wasqlite-worker-dialect](https://github.com/subframe7536/kysely-sqlite-tools/tree/master/packages/dialect-wasqlite-worker)

## Usage

### Memory

Use `MemoryVFS` with `wa-sqlite.wasm`, no data persistence

```ts
import { initSQLite, isOpfsSupported, useMemoryStorage } from '@subframe7536/sqlite-wasm'

// optional url
const url = 'https://cdn.jsdelivr.net/gh/rhashimoto/wa-sqlite@v0.9.9/dist/wa-sqlite.wasm'

const { run, changes, lastInsertRowId, close } = await initSQLite(
  useMemoryStorage({ url })
)
```

### IndexedDB

use `IDBBatchAtomicVFS` with `wa-sqlite-async.wasm`, larger than sync version, better compatibility

[minimal IndexedDB backend browser version](https://caniuse.com/mdn-api_lockmanager)

```ts
import { initSQLite } from '@subframe7536/sqlite-wasm'
import { useIdbStorage } from '@subframe7536/sqlite-wasm/idb'

// optional url
const url = 'https://cdn.jsdelivr.net/gh/rhashimoto/wa-sqlite@v0.9.9/dist/wa-sqlite-async.wasm'

const { run, changes, lastInsertRowId, close } = await initSQLite(
  useIdbStorage('IndexedDB', { url })
)
```

#### IdbMemory

Use `IDBMirrorVFS` with `wa-sqlite-async.wasm` (larger than sync version), better performance compare to `useIdbStorage`, store data in memory and sync to IndexedDB.

```ts
import { initSQLite } from '@subframe7536/sqlite-wasm'
import { useIdbMemoryStorage } from '@subframe7536/sqlite-wasm/idb'

// optional url
const url = 'https://cdn.jsdelivr.net/gh/rhashimoto/wa-sqlite@v0.9.9/dist/wa-sqlite-async.wasm'

const { run, changes, lastInsertRowId, close } = await initSQLite(
  useIdbMemoryStorage('IndexedDB', { url })
)
```

### OPFS

use `OPFSCoopSyncVFS` with `wa-sqlite.wasm`, smaller than async version

[minimal OPFS backend browser version](https://caniuse.com/mdn-api_filesystemsyncaccesshandle)

**MUST RUN IN WEB WORKER**

```ts
import { initSQLite, isOpfsSupported } from '@subframe7536/sqlite-wasm'
import { useOpfsStorage } from '@subframe7536/sqlite-wasm/opfs'

// optional url
const url = 'https://cdn.jsdelivr.net/gh/rhashimoto/wa-sqlite@v0.9.9/dist/wa-sqlite.wasm'

onmessage = async () => {
  if (!await isOpfsSupported()) { // this can be called in main thread
    return
  }
  const { run, changes, lastInsertRowId, close } = await initSQLite(
    useOpfsStorage('OPFS', url)
  )
}
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
// // [{ "a": "01932f1b-b663-7714-af4d-17a3d9efc7b3" }]
```

## License

MIT
