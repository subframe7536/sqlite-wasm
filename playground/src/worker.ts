import { uuidv7 } from 'uuidv7'
import url from '../../dist/wa-sqlite.wasm?url'
import { customFunction, initSQLite, isOpfsSupported } from '../../src'
import { useOpfsStorage } from '../../src/vfs/opfs'
import { runSQLStream } from './runSQL'

onmessage = async () => {
  if (!await isOpfsSupported()) {
    return
  }
  const { run, stream, lastInsertRowId, changes, sqlite, db } = await initSQLite(useOpfsStorage(
    'test',
    { url },
    // 'https://cdn.jsdelivr.net/gh/rhashimoto/wa-sqlite@v0.9.9/dist/wa-sqlite.wasm',
  ))
  await runSQLStream(run, stream, data => postMessage(data))
  console.log(lastInsertRowId(), changes())
  customFunction(sqlite, db, 'uuidv7', () => uuidv7())
  console.log(
    await run('select uuidv7() as a'),
  )
  postMessage('done')
}
