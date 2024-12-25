/* eslint-disable antfu/consistent-list-newline */
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
import { check, getHandleFromPath, ignoredDataView, isOpfsVFS } from './common'

const SQLITE_BINARY_HEADER = new Uint8Array([
  0x53, 0x51, 0x4C, 0x69, 0x74, 0x65, 0x20, 0x66, // SQLite f
  0x6F, 0x72, 0x6D, 0x61, 0x74, 0x20, 0x33, 0x00, // ormat 3\0
])

async function parseHeaderAndVerify(
  reader: ReadableStreamDefaultReader<Uint8Array<ArrayBufferLike>>,
): Promise<Uint8Array<ArrayBufferLike>> {
  const headerData = await readExactBytes(reader, 32)
  for (let i = 0; i < SQLITE_BINARY_HEADER.length; i++) {
    if (headerData[i] !== SQLITE_BINARY_HEADER[i]) {
      throw new Error('Not a SQLite database file')
    }
  }
  return headerData
}

async function readExactBytes(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  size: number,
): Promise<Uint8Array> {
  const result = new Uint8Array(size)
  let offset = 0

  while (offset < size) {
    const { done, value } = await reader.read()
    if (done) {
      throw new Error('Unexpected EOF')
    }

    const bytesToCopy = Math.min(size - offset, value!.length)
    result.set(value!.subarray(0, bytesToCopy), offset)
    offset += bytesToCopy
  }

  return result
}

async function* pagify(stream: ReadableStream<Uint8Array>): AsyncGenerator<Uint8Array> {
  const reader = stream.getReader()

  try {
    const headerData = await parseHeaderAndVerify(reader)

    const view = new DataView(headerData.buffer)
    const rawPageSize = view.getUint16(16)
    const pageSize = rawPageSize === 1 ? 65536 : rawPageSize
    const pageCount = view.getUint32(28)

    for (let i = 0; i < pageCount; i++) {
      yield await readExactBytes(reader, pageSize)
    }

    const { done } = await reader.read()
    if (!done) {
      throw new Error('Unexpected data after last page')
    }
  } finally {
    reader.releaseLock()
  }
}

export async function importDatabaseToIdb(
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

async function importDatabaseToOpfs(
  path: string,
  source: ReadableStream<Uint8Array>,
): Promise<void> {
  const handle = await getHandleFromPath(path, true)
  const [streamForVerify, streamData] = source.tee()

  await parseHeaderAndVerify(streamForVerify.getReader())

  const writable = await handle.createWritable()
  // `pipeTo()` will auto close `writable`
  await streamData.pipeTo(writable)
}

/**
 * Import database from `File` or `ReadableStream`
 * @param vfs SQLite VFS
 * @param path db path
 * @param data existing database
 */
export async function importDatabase(
  vfs: FacadeVFS,
  path: string,
  data: File | ReadableStream<Uint8Array>,
): Promise<void> {
  const stream = data instanceof globalThis.File ? data.stream() : data
  // is `OPFSCoopSyncVFS`
  if (isOpfsVFS(vfs)) {
    await importDatabaseToOpfs(path, stream)
  } else {
    await importDatabaseToIdb(vfs, path, stream)
  }
}
