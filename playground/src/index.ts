import { useIdbStorage } from '@subframe7536/sqlite-wasm/idb'
import { initSQLite, isIdbSupported, isModuleWorkerSupport, isOpfsSupported, useMemoryStorage } from '@subframe7536/sqlite-wasm'
import OpfsWorker from './worker?worker'
import { runSQL } from './runSQL'

document.addEventListener('DOMContentLoaded', async () => {
  const { run } = await initSQLite(useIdbStorage('test.db', {
    // url: 'https://cdn.jsdelivr.net/gh/rhashimoto/wa-sqlite@v0.9.9/dist/wa-sqlite-async.wasm',
  }))

  const supportModuleWorker = isModuleWorkerSupport()
  const supportIDB = isIdbSupported()
  const supportOPFS = await isOpfsSupported()
  console.log('support module worker:', supportModuleWorker)
  console.log('support IDBBatchAtomicVFS:', supportIDB)
  console.log('support AccessHandlePoolVFS:', supportOPFS)
  await runSQL(run)

  const worker = new OpfsWorker()
  worker.postMessage('')

  await runSQL((await initSQLite(useMemoryStorage())).run)
})
