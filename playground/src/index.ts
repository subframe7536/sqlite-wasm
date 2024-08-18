import { useIdbStorage } from '@subframe7536/sqlite-wasm/idb'
import { initSQLite, isIdbSupported, isModuleWorkerSupport, isOpfsSupported, useMemoryStorage } from '@subframe7536/sqlite-wasm'
import { mitt } from 'zen-mitt'
import OpfsWorker from './worker?worker'
import { runSQL } from './runSQL'

const { run, close } = await initSQLite(useIdbStorage('test.db', {
  // url: 'https://cdn.jsdelivr.net/gh/rhashimoto/wa-sqlite@v0.9.9/dist/wa-sqlite-async.wasm',
}))

const supportModuleWorker = isModuleWorkerSupport()
const supportIDB = isIdbSupported()
const supportOPFS = await isOpfsSupported()
console.log('support module worker:', supportModuleWorker)
console.log('support IDBBatchAtomicVFS:', supportIDB)
console.log('support OPFSCoopSyncVFS:', supportOPFS)
await runSQL(run)
await runSQL((await initSQLite(useMemoryStorage())).run)

const worker = new OpfsWorker()
const ee = mitt<{
  data: any
  done: void
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

  ee.on('data', (data) => {
    if (resolver) {
      console.log('data')
      resolver({ value: data })
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
  worker.postMessage('')
  for await (const data of test()) {
    console.log('iterator', data)
  }
})
document.querySelector('.clear')?.addEventListener('click', async () => {
  await close()
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
