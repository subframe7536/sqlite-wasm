import { uuidv7 } from 'uuidv7'

import { customFunction, initSQLite, isOpfsSupported, withExistDB } from '../../src'
import { useOpfsStorage } from '../../src/vfs/opfs'
import url from '../../wa-sqlite-fts5/wa-sqlite.wasm?url'
import { runIterator, runSQLStream } from './runSQL'

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
  console.table({
    sqlite: db.sqlite.libversion(),
    sqliteModule: db.sqliteModule._sqlite3_libversion_number(),
    sql: (await db.run('select sqlite_version() as a'))[0].a,
  })
  // if (data) {
  //   await db.sync(data)
  // }
  await runSQLStream(db.run, db.stream, data => postMessage(data))
  console.log(db.lastInsertRowId(), db.changes(), db.sqliteModule._sqlite3_changes64(db.pointer))
  await runIterator(db)
  console.log(db.lastInsertRowId(), db.changes(), db.sqliteModule._sqlite3_changes64(db.pointer))
  customFunction(db.sqlite, db.pointer, 'uuidv7', () => uuidv7())
  console.log(
    'uuidv7():',
    (await db.run('select uuidv7() as a'))[0].a,
  )
  postMessage('done')
}
