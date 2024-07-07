import { useIdbStorage } from '@subframe7536/sqlite-wasm/idb'
import { initSQLite, isIdbSupported, isModuleWorkerSupport, isOpfsSupported, useMemoryStorage } from '@subframe7536/sqlite-wasm'
import OpfsWorker from './worker?worker'
import { runSQL } from './runSQL'

const { run, close } = await initSQLite(useIdbStorage('test.db', {
  // url: 'https://cdn.jsdelivr.net/gh/rhashimoto/wa-sqlite@v0.9.9/dist/wa-sqlite-async.wasm',
}))
document.addEventListener('DOMContentLoaded', async () => {
  const supportModuleWorker = isModuleWorkerSupport()
  const supportIDB = isIdbSupported()
  const supportOPFS = await isOpfsSupported()
  console.log('support module worker:', supportModuleWorker)
  console.log('support IDBBatchAtomicVFS:', supportIDB)
  console.log('support OPFSCoopSyncVFS:', supportOPFS)
  await runSQL(run)

  const worker = new OpfsWorker()
  worker.postMessage('')

  await runSQL((await initSQLite(useMemoryStorage())).run)
})

document.querySelector('button')?.addEventListener('click', async () => {
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
