import { uuidv7 } from 'uuidv7'
import url from '../../dist/wa-sqlite.wasm?url'
import { customFunction, initSQLite, isOpfsSupported, withExistDB } from '../../src'
import { useOpfsStorage } from '../../src/vfs/opfs'
import { runSQLStream } from './runSQL'

onmessage = async ({ data }) => {
  if (!await isOpfsSupported()) {
    return
  }
  const db = await initSQLite(useOpfsStorage(
    'test.db',
    (data && data !== 'dl') ? withExistDB(data, { url }) : { url },
    // { url },
  ))
  if (data === 'dl') {
    postMessage(await db.dump())
    return
  }
  // if (data) {
  //   await db.sync(data)
  // }
  await runSQLStream(db.run, db.stream, data => postMessage(data))
  console.log(db.lastInsertRowId(), db.changes())
  customFunction(db.sqlite, db.pointer, 'uuidv7', () => uuidv7())
  console.log(
    'uuidv7():',
    (await db.run('select uuidv7() as a'))[0].a,
  )
  postMessage('done')
}
