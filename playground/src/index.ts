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
// import { useIdbMemoryStorage } from '../../src/vfs/idb-memory'
import { useIdbStorage } from '../../src/vfs/idb'
import { runSQL } from './runSQL'
import OpfsWorker from './worker?worker'

let db: SQLiteDB

const supportModuleWorker = isModuleWorkerSupport()
const supportIDB = isIdbSupported()
const supportOPFS = await isOpfsSupported()
console.log('support module worker:', supportModuleWorker)
console.log('support IDBBatchAtomicVFS:', supportIDB)
console.log('support OPFSCoopSyncVFS:', supportOPFS)
document.querySelector('.main')?.addEventListener('click', async () => {
  if (!db) {
    // db = await initSQLite(useIdbMemoryStorage('test.db', { url }))
    db = await initSQLite(useIdbStorage('test.db', { url }))
  }
  await runSQL(db.run)
  await runSQL((await initSQLite(useMemoryStorage({ url: syncUrl }))).run)
})
document.querySelector('.import')?.addEventListener('click', async () => {
  await db?.close()
  let file
  try {
    file = await selectFile('.db,.sqlite,.sqlite3')
  } catch (error) {
    // eslint-disable-next-line no-alert
    prompt(`${error}`)
    return
  }
  db = await initSQLite(
    // useIdbMemoryStorage('test.db', withExistDB(file, { url })),
    useIdbStorage('test.db', { url }),
  )
  await importDatabase(db.vfs, db.path, file)
  console.log(
    await db.run(`SELECT "type", "tbl_name" AS "table", CASE WHEN "sql" LIKE '%PRIMARY KEY AUTOINCREMENT%' THEN 1 ELSE "name" END AS "name" FROM "sqlite_master"`),
  )
})

document.querySelector('.download')?.addEventListener('click', async () => {
  download(await db.dump())
})

document.querySelector('.worker')?.addEventListener('click', async () => {
  const worker = new OpfsWorker()
  const ee = mitt<{
    data: [any]
    done: []
  }>()
  worker.onmessage = ({ data }) => {
    if (data === 'done') {
      ee.emit('done')
    } else {
      ee.emit('data', data)
    }
  }
  function test(): AsyncIterableIterator<any> {
    let resolver: ((value: IteratorResult<any>) => void) | null = null

    ee.on('data', (...data) => {
      if (resolver) {
        console.log('data')
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
  worker.postMessage('')
  for await (const data of test()) {
    console.log('iterator', data)
  }
})
document.querySelector('.clear')?.addEventListener('click', async () => {
  await db.close()
  const root = await navigator.storage.getDirectory()
  for await (const [name] of root.entries()) {
    console.log('clear', name)
    await root.removeEntry(name, { recursive: true })
    console.log('clear success', name)
  }
  console.log('clear all OPFS')
  const dbs = await window.indexedDB.databases()
  dbs.forEach((db) => {
    console.log('clear', db.name)
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
