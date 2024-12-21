// reference from https://github.com/rhashimoto/wa-sqlite/blob/master/demo/file/service-worker.js
import type { FacadeVFS, Promisable, SQLiteDBCore } from '../types'
import {
  SQLITE_LOCK_NONE,
  SQLITE_LOCK_SHARED,
  SQLITE_OPEN_MAIN_DB,
  SQLITE_OPEN_READONLY,
} from '../constant'
import { check, ignoredDataView } from './common'

export function dumpReadableStream(vfs: FacadeVFS, path: string): ReadableStream {
  const source = getExistDataSource(vfs, path)
  source.isDone.finally(() => {
    vfs.close()
  })

  return new ReadableStream(source)
}

function getExistDataSource(
  vfs: FacadeVFS,
  path: string,
): UnderlyingDefaultSource & { isDone: Promise<void> } {
  let onDone: (() => Promisable<any>)[] = []
  let resolve!: () => void
  let reject!: (reason?: any) => void
  let isDone: Promise<void> = new Promise<void>((res, rej) => {
    resolve = res
    reject = rej
  }).finally(async () => {
    while (onDone.length) {
      await onDone.pop()!()
    }
  })
  let fileId = Math.floor(Math.random() * 0x100000000)
  let iOffset = 0
  let bytesRemaining = 0

  return {
    isDone,
    async start(controller: ReadableStreamDefaultController): Promise<void> {
      try {
        const flags = SQLITE_OPEN_MAIN_DB | SQLITE_OPEN_READONLY
        await check(vfs.jOpen(path, fileId, flags, ignoredDataView()))
        onDone.push(() => vfs.jClose(fileId))

        await check(vfs.jLock(fileId, SQLITE_LOCK_SHARED))
        onDone.push(() => vfs.jUnlock(fileId, SQLITE_LOCK_NONE))

        const fileSize = new DataView(new ArrayBuffer(8))
        await check(vfs.jFileSize(fileId, fileSize))
        bytesRemaining = Number(fileSize.getBigUint64(0, true))
      } catch (e) {
        controller.error(e)
        reject(e)
      }
    },

    async pull(controller: ReadableStreamDefaultController): Promise<void> {
      try {
        const buffer = new Uint8Array(Math.min(bytesRemaining, 65536))
        await check(vfs.jRead(fileId, buffer, iOffset))
        controller.enqueue(buffer)

        iOffset += buffer.byteLength
        bytesRemaining -= buffer.byteLength
        if (bytesRemaining === 0) {
          controller.close()
          resolve()
        }
      } catch (e) {
        controller.error(e)
        reject(e)
      }
    },

    cancel(reason: string): void {
      reject(new Error(reason))
    },
  }
}

export async function streamToUint8Array(stream: ReadableStream): Promise<Uint8Array> {
  const chunks: Uint8Array[] = []
  const reader = stream.getReader()

  while (true) {
    const { done, value } = await reader.read()
    if (done) {
      break
    }
    chunks.push(value)
  }

  // Combine all chunks into a single Uint8Array
  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0)
  const result = new Uint8Array(totalLength)
  let position = 0

  for (const chunk of chunks) {
    result.set(chunk, position)
    position += chunk.length
  }

  return result
}

/**
 * Export database to `Uint8Array`
 * @param vfs SQLite VFS
 * @param path database path
 */
export async function exportDatabase(vfs: FacadeVFS, path: string): Promise<Uint8Array> {
  return await streamToUint8Array(dumpReadableStream(vfs, path))
}
