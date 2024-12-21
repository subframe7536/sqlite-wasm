// reference from https://github.com/rhashimoto/wa-sqlite/blob/master/demo/file/index.js
import type { FacadeVFS, Promisable } from '../types'
import {
  SQLITE_FCNTL_BEGIN_ATOMIC_WRITE,
  SQLITE_FCNTL_COMMIT_ATOMIC_WRITE,
  SQLITE_FCNTL_SYNC,
  SQLITE_LOCK_EXCLUSIVE,
  SQLITE_LOCK_NONE,
  SQLITE_LOCK_RESERVED,
  SQLITE_LOCK_SHARED,
  SQLITE_OPEN_CREATE,
  SQLITE_OPEN_MAIN_DB,
  SQLITE_OPEN_READWRITE,
  SQLITE_SYNC_NORMAL,
} from '../constant'
import { check, ignoredDataView } from './common'

async function* pagify(stream: ReadableStream<Uint8Array>): AsyncGenerator<Uint8Array> {
  const chunks: Uint8Array[] = []
  const reader = stream.getReader()

  // read file header
  while (chunks.reduce((sum, chunk) => sum + chunk.byteLength, 0) < 32) {
    const { done, value } = await reader.read()
    if (done) {
      throw new Error('Unexpected EOF')
    }
    chunks.push(value!)
  }

  let copyOffset = 0
  const header = new DataView(new ArrayBuffer(32))
  for (const chunk of chunks) {
    const src = chunk.subarray(0, header.byteLength - copyOffset)
    const dst = new Uint8Array(header.buffer, copyOffset)
    dst.set(src)
    copyOffset += src.byteLength
  }

  if (new TextDecoder().decode(header.buffer.slice(0, 16)) !== 'SQLite format 3\x00') {
    throw new Error('Not a SQLite database file')
  }

  const pageSize = (field => field === 1 ? 65536 : field)(header.getUint16(16))
  const pageCount = header.getUint32(28)
  // console.log(`${pageCount} pages, ${pageSize} bytes each, ${pageCount * pageSize} bytes total`)

  // copy pages
  for (let i = 0; i < pageCount; ++i) {
    while (chunks.reduce((sum, chunk) => sum + chunk.byteLength, 0) < pageSize) {
      const { done, value } = await reader.read()
      if (done) {
        throw new Error('Unexpected EOF')
      }
      chunks.push(value!)
    }

    let page: Uint8Array
    if (chunks[0]?.byteLength >= pageSize) {
      page = chunks[0].subarray(0, pageSize)
      chunks[0] = chunks[0].subarray(pageSize)
      if (!chunks[0].byteLength) {
        chunks.shift()
      }
    } else {
      let copyOffset = 0
      page = new Uint8Array(pageSize)
      while (copyOffset < pageSize) {
        const src = chunks[0].subarray(0, pageSize - copyOffset)
        const dst = new Uint8Array(page.buffer, copyOffset)
        dst.set(src)
        copyOffset += src.byteLength

        chunks[0] = chunks[0].subarray(src.byteLength)
        if (!chunks[0].byteLength) {
          chunks.shift()
        }
      }
    }

    yield page
  }

  const { done } = await reader.read()
  if (!done) {
    throw new Error('Unexpected data after last page')
  }
}

export async function importDatabaseStream(
  vfs: FacadeVFS,
  path: string,
  stream: ReadableStream<Uint8Array>,
): Promise<void> {
  const onFinally: (() => Promisable<any>)[] = []
  try {
    const fileId = 1234
    const flags = SQLITE_OPEN_MAIN_DB | SQLITE_OPEN_CREATE | SQLITE_OPEN_READWRITE
    await check(vfs.jOpen(path, fileId, flags, ignoredDataView()))
    onFinally.push(() => vfs.jClose(fileId))

    // open a transaction
    await check(vfs.jLock(fileId, SQLITE_LOCK_SHARED))
    onFinally.push(() => vfs.jUnlock(fileId, SQLITE_LOCK_NONE))
    await check(vfs.jLock(fileId, SQLITE_LOCK_RESERVED))
    onFinally.push(() => vfs.jUnlock(fileId, SQLITE_LOCK_SHARED))
    await check(vfs.jLock(fileId, SQLITE_LOCK_EXCLUSIVE))

    const ignored = ignoredDataView()
    await vfs.jFileControl(fileId, SQLITE_FCNTL_BEGIN_ATOMIC_WRITE, ignored)

    // truncate file
    await check(vfs.jTruncate(fileId, 0))

    // write pages
    let iOffset = 0
    for await (const page of pagify(stream)) {
      await check(vfs.jWrite(fileId, page, iOffset))
      iOffset += page.byteLength
    }

    await vfs.jFileControl(fileId, SQLITE_FCNTL_COMMIT_ATOMIC_WRITE, ignored)
    await vfs.jFileControl(fileId, SQLITE_FCNTL_SYNC, ignored)
    await vfs.jSync(fileId, SQLITE_SYNC_NORMAL)
  } finally {
    while (onFinally.length) {
      await onFinally.pop()!()
    }
  }
}

/**
 * Import database from `File` or `ReadableStream`
 * @param vfs SQLite VFS
 * @param path db path
 * @param data existing database
 */
export async function importDatabase(vfs: FacadeVFS, path: string, data: File | ReadableStream): Promise<void> {
  return await importDatabaseStream(
    vfs,
    path,
    data instanceof File ? data.stream() : data,
  )
}
