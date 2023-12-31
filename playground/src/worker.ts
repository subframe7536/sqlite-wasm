import { initSQLite, isOpfsSupported } from '@subframe7536/sqlite-wasm'
import { useOpfsStorage } from '@subframe7536/sqlite-wasm/opfs'

onmessage = async () => {
  if (!await isOpfsSupported()) {
    return
  }
  initSQLite(useOpfsStorage(
    'test',
    // 'https://cdn.jsdelivr.net/gh/rhashimoto/wa-sqlite@v0.9.9/dist/wa-sqlite.wasm',
  ))
    .then(async ({ run }) => {
      await run('CREATE TABLE if not exists t1(a INTEGER, b INTEGER, c VARCHAR(100));')
      await run('INSERT INTO t1 VALUES(1, 19147, \'nineteen thousand one hundred forty-seven\');')
      await run('INSERT INTO t1 VALUES(2, 26008, \'twenty-six thousand eight\');')
      await run('INSERT INTO t1 VALUES(3, 46582, \'forty-six thousand five hundred eighty-two\');')
      console.log(await run('select * from t1'))
    })
}
