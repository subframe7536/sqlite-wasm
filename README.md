## sqlite-wasm

typesafe [wa-sqlite](https://github.com/rhashimoto/wa-sqlite) wrapper, persist data to IndexedDB or [OPFS](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API/Origin_private_file_system)

### usage

#### IndexedDB

use IDBBatchAtomicVFS with `wa-sqlite-async.wasm`, larger than sync version, better compatibility

```ts
import { useIdbStorage } from '@subframe7536/sqlite-wasm/idb'
import { getAsyncWasmURL, initSQLite } from '@subframe7536/sqlite-wasm'

// const url = 'https://cdn.jsdelivr.net/gh/rhashimoto/wa-sqlite@v0.9.9/dist/wa-sqlite-async.wasm'
const url = getAsyncWasmURL()

const { run, changes, lastInsertRowId, close, sqlite, db } = await initSQLite(
  useIdbStorage('test', { url })
)
```

#### OPFS

use AccessHandlePoolVFS with `wa-sqlite.wasm`, smaller than async version, [compatibility](https://caniuse.com/mdn-api_filesystemsyncaccesshandle)

**MUST RUN IN WEB WORKER**

```ts
import { getSyncWasmURL, initSQLite, isOpfsSupported } from '@subframe7536/sqlite-wasm'
import { useOpfsStorage } from '@subframe7536/sqlite-wasm/opfs'

// const url = 'https://cdn.jsdelivr.net/gh/rhashimoto/wa-sqlite@v0.9.9/dist/wa-sqlite.wasm',
const url = getSyncWasmURL()

onmessage = async () => {
  if (!await isOpfsSupported()) {
    return
  }
  const { run, changes, lastInsertRowId, close, sqlite, db } = await initSQLite(
    useOpfsStorage('test', url)
  )
}
```