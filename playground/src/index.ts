import { useIdbStorage } from '@subframe7536/sqlite-wasm/idb'
import { initSQLite, isIdbSupported, isModuleWorkerSupport, isOpfsSupported } from '@subframe7536/sqlite-wasm'
import OpfsWorker from './worker?worker'

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
  await run('CREATE TABLE if not exists t1(a INTEGER, b INTEGER, c VARCHAR(100));')
  await run('INSERT INTO t1 VALUES(1, 19147, \'nineteen thousand one hundred forty-seven\');')
  await run('INSERT INTO t1 VALUES(2, 26008, \'twenty-six thousand eight\');')
  await run('INSERT INTO t1 VALUES(3, 46582, \'forty-six thousand five hundred eighty-two\');')
  console.log(await run('select * from t1'))

  const worker = new OpfsWorker()
  worker.postMessage('')
})
