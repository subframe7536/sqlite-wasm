import { initSQLite, isOpfsSupported } from '@subframe7536/sqlite-wasm'
import { useOpfsStorage } from '@subframe7536/sqlite-wasm/opfs'
import { runSQLStream } from './runSQL'

onmessage = async () => {
  if (!await isOpfsSupported()) {
    return
  }
  const { run, stream } = await initSQLite(useOpfsStorage(
    'test',
    // 'https://cdn.jsdelivr.net/gh/rhashimoto/wa-sqlite@v0.9.9/dist/wa-sqlite.wasm',
  ))
  console.log('start')
  await runSQLStream(run, stream, data => postMessage(data))
  postMessage('done')
}
