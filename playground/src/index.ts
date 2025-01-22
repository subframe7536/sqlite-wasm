import { mitt } from 'zen-mitt'
import url from '../../dist/wa-sqlite-async.wasm?url'
import syncUrl from '../../dist/wa-sqlite.wasm?url'
import {
  importDatabase,
  initSQLite,
  isIdbSupported,
  isModuleWorkerSupport,
  isOpfsSupported,
  type SQLiteDB,
  useMemoryStorage,
  withExistDB,
} from '../../src/index'
import { useFsHandleStorage } from '../../src/vfs/fs-handle'
import { useIdbStorage } from '../../src/vfs/idb'
import { useIdbMemoryStorage } from '../../src/vfs/idb-memory'
import { runSQL } from './runSQL'
import OpfsWorker from './worker?worker'

let db: SQLiteDB | undefined

const supportModuleWorker = isModuleWorkerSupport()
const supportIDB = isIdbSupported()
const supportOPFS = await isOpfsSupported()
console.log('support module worker:', supportModuleWorker)
console.log('support IDBBatchAtomicVFS:', supportIDB)
console.log('support OPFSCoopSyncVFS:', supportOPFS)
document.querySelector('.main')?.addEventListener('click', async () => {
  if (!db) {
    // const root = await window.showDirectoryPicker()
    // db = await initSQLite(useIdbMemoryStorage('test.db', { url }))
    // db = await initSQLite(useFsHandleStorage('test.db', root, { url }))
    db = await initSQLite(useIdbStorage('test.db', { url }))
  }
  await runSQL(db.run)
  console.table({
    sqlite: db.sqlite.libversion(),
    sqliteModule: db.sqliteModule._sqlite3_libversion_number(),
    sql: (await db.run('select sqlite_version() as a'))[0].a,
  })
  await runSQL((await initSQLite(useMemoryStorage({ url: syncUrl }))).run)
})
document.querySelector('.import')?.addEventListener('click', async () => {
  await db?.close()
  let file
  try {
    file = await selectFile('.db,.sqlite,.sqlite3')
  } catch (error) {
    // eslint-disable-next-line no-alert
    alert(`${error}`)
    return
  }
  db = await initSQLite(
    // useIdbMemoryStorage('test.db', withExistDB(file, { url })),
    useIdbMemoryStorage('test.db', { url }),
    // useIdbStorage('test.db', { url }),
  )
  await db.sync(file)
  console.log(
    await db.run(`SELECT "type", "tbl_name" AS "table", CASE WHEN "sql" LIKE '%PRIMARY KEY AUTOINCREMENT%' THEN 1 ELSE "name" END AS "name" FROM "sqlite_master"`),
  )
})

document.querySelector('.download')?.addEventListener('click', async () => {
  if (db) {
    download(await db.dump())
  }
})

document.querySelector('.downloadW')?.addEventListener('click', async () => {
  const worker = new OpfsWorker()
  worker.postMessage('dl')
  worker.onmessage = (buf: MessageEvent) => {
    download(buf.data)
    worker.terminate()
  }
})

const ee = mitt<{
  data: [any]
  done: []
}>()

function test(): AsyncIterableIterator<any> {
  let resolver: ((value: IteratorResult<any>) => void) | null = null

  ee.on('data', (...data) => {
    if (resolver) {
      resolver({ value: data[0] })
      resolver = null
    }
  })

  ee.on('done', () => {
    if (resolver) {
      resolver({ value: undefined, done: true })
    }
  })

  return {
    [Symbol.asyncIterator]() {
      return this
    },
    async next() {
      return new Promise<IteratorResult<any>>((resolve) => {
        resolver = resolve
      })
    },
    async return() {
      return { value: undefined, done: true }
    },
  } satisfies AsyncIterableIterator<any>
}

document.querySelector('.worker')?.addEventListener('click', async () => {
  const worker = new OpfsWorker()
  worker.onmessage = ({ data }) => {
    if (data === 'done') {
      ee.emit('done')
    } else {
      ee.emit('data', data)
    }
  }
  worker.postMessage('')
  for await (const data of test()) {
    console.log('[stream]', data)
  }
})
document.querySelector('.importW')?.addEventListener('click', async () => {
  const worker = new OpfsWorker()
  worker.onmessage = ({ data }) => {
    if (data === 'done') {
      ee.emit('done')
    } else {
      ee.emit('data', data)
    }
  }
  let file
  try {
    file = await selectFile('.db,.sqlite,.sqlite3')
  } catch (error) {
    // eslint-disable-next-line no-alert
    alert(`${error}`)
    return
  }
  worker.postMessage(file)
  for await (const data of test()) {
    console.log('[import] iterator', data)
  }
})
document.querySelector('.clear')?.addEventListener('click', async () => {
  await db?.close()
  const root = await navigator.storage.getDirectory()
  for await (const [name] of root.entries()) {
    await root.removeEntry(name, { recursive: true })
    console.log('delete entry:', name)
  }
  console.log('clear all OPFS')
  const dbs = await window.indexedDB.databases()
  dbs.forEach((db) => {
    console.log('delete idb:', db.name)
    window.indexedDB.deleteDatabase(db.name!)
  })
  console.log('clear all IndexedDB')
})

function download(buffer: Uint8Array): void {
  const blob = new Blob([buffer])
  const reader = new FileReader()
  reader.readAsDataURL(blob)
  reader.onload = (e) => {
    const a = document.createElement('a')
    a.download = `test.db`
    a.href = e.target?.result as string
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }
}

async function selectFile(accept?: string): Promise<File> {
  return await new Promise((resolve, reject) => {
    const input = document.createElement('input')
    input.type = 'file'
    if (accept) {
      input.accept = accept
    }

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

    window.addEventListener('focus', () => {
      setTimeout(() => {
        if (!input.files?.length) {
          reject(new Error('File selection cancelled'))
          input.remove()
        }
      }, 300)
    }, { once: true })

    input.click()
  })
}
