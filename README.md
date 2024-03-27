## sqlite-wasm

typesafe [wa-sqlite](https://github.com/rhashimoto/wa-sqlite) wrapper, run in memory or persist data to IndexedDB or [OPFS](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API/Origin_private_file_system)

low-level layer for [kysely-wasqlite-worker-dialect](https://github.com/subframe7536/kysely-sqlite-tools/tree/master/packages/dialect-wasqlite-worker)

### Usage

#### Memory

use MemoryVFS with `wa-sqlite.wasm`, no data persistence

```ts
import { getSyncWasmURL, initSQLite, isOpfsSupported, useMemoryStorage } from '@subframe7536/sqlite-wasm'

// optional url
const url = 'https://cdn.jsdelivr.net/gh/rhashimoto/wa-sqlite@v0.9.9/dist/wa-sqlite.wasm'

const { run, changes, lastInsertRowId, close } = await initSQLite(
  useMemoryStorage({ url })
)
```

#### IndexedDB

use IDBBatchAtomicVFS with `wa-sqlite-async.wasm`, larger than sync version, better compatibility

[minimal IndexedDB backend browser version](https://caniuse.com/mdn-api_lockmanager)

```ts
import { useIdbStorage } from '@subframe7536/sqlite-wasm/idb'
import { getAsyncWasmURL, initSQLite } from '@subframe7536/sqlite-wasm'

// optional url
const url = 'https://cdn.jsdelivr.net/gh/rhashimoto/wa-sqlite@v0.9.9/dist/wa-sqlite-async.wasm'

const { run, changes, lastInsertRowId, close } = await initSQLite(
  useIdbStorage('IndexedDB', { url })
)
```

#### OPFS

use AccessHandlePoolVFS with `wa-sqlite.wasm`, smaller than async version

[minimal OPFS backend browser version](https://caniuse.com/mdn-api_filesystemsyncaccesshandle)

**MUST RUN IN WEB WORKER**

```ts
import { getSyncWasmURL, initSQLite, isOpfsSupported } from '@subframe7536/sqlite-wasm'
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
