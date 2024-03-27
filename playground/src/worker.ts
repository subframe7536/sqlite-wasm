import { initSQLite, isOpfsSupported } from '@subframe7536/sqlite-wasm'
import { useOpfsStorage } from '@subframe7536/sqlite-wasm/opfs'
import { runSQL } from './runSQL'

onmessage = async () => {
  if (!await isOpfsSupported()) {
    return
  }
  initSQLite(useOpfsStorage(
    'test',
    // 'https://cdn.jsdelivr.net/gh/rhashimoto/wa-sqlite@v0.9.9/dist/wa-sqlite.wasm',
  ))
    .then(({ run }) => {
      runSQL(run)
    })
}
