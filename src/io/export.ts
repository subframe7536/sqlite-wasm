// reference from https://github.com/rhashimoto/wa-sqlite/blob/master/demo/file/service-worker.js
import type { FacadeVFS, Promisable } from '../types'

import {
  SQLITE_LOCK_NONE,
  SQLITE_LOCK_SHARED,
  SQLITE_OPEN_MAIN_DB,
  SQLITE_OPEN_READONLY,
} from '../constant'
import { check, getHandle, ignoredDataView, isFsHandleVFS } from './common'

export function dumpVFS(
  vfs: FacadeVFS,
  path: string,
  onDone?: (vfs: FacadeVFS, path: string) => any,
): ReadableStream {
  const cleanupTasks: (() => Promisable<any>)[] = []
  let resolve: () => void
  let reject: (reason?: any) => void
  new Promise<void>((res, rej) => {
    resolve = res
    reject = rej
  }).finally(async () => {
    while (cleanupTasks.length) {
      await cleanupTasks.pop()!()
    }
    onDone?.(vfs, path)
  })

  const fileId = Math.floor(Math.random() * 0x100000000)
  let iOffset = 0
  let bytesRemaining = 0

  return new ReadableStream({
    async start(controller): Promise<void> {
      try {
        const flags = SQLITE_OPEN_MAIN_DB | SQLITE_OPEN_READONLY
        await check(vfs.jOpen(path, fileId, flags, ignoredDataView()))
        cleanupTasks.push(() => vfs.jClose(fileId))

        await check(vfs.jLock(fileId, SQLITE_LOCK_SHARED))
        cleanupTasks.push(() => vfs.jUnlock(fileId, SQLITE_LOCK_NONE))

        const fileSize = new DataView(new ArrayBuffer(8))
        await check(vfs.jFileSize(fileId, fileSize))
        bytesRemaining = Number(fileSize.getBigUint64(0, true))
      } catch (e) {
        controller.error(e)
        reject(e)
      }
    },

    async pull(controller): Promise<void> {
      if (bytesRemaining === 0) {
        controller.close()
        resolve()
        return
      }

      try {
        const chunkSize = Math.min(bytesRemaining, 65536)
        const buffer = new Uint8Array(chunkSize)
        await check(vfs.jRead(fileId, buffer, iOffset))
        controller.enqueue(buffer)

        iOffset += chunkSize
        bytesRemaining -= chunkSize
        if (bytesRemaining === 0) {
          controller.close()
          resolve()
        }
      } catch (e) {
        controller.error(e)
        reject(e)
      }
    },

    cancel(reason): void {
      reject(new Error(reason))
    },
  })
}

export async function exportDatabaseFromIDB(
  vfs: FacadeVFS,
  path: string,
): Promise<Uint8Array<ArrayBuffer>> {
  const stream = dumpVFS(vfs, path)
  const chunks: Uint8Array[] = []
  const reader = stream.getReader()
  let totalLength = 0

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) {
        break
      }

      chunks.push(value)
      totalLength += value.length
    }
  } finally {
    reader.releaseLock()
  }

  const result = new Uint8Array(totalLength)

  let position = 0
  for (const chunk of chunks) {
    result.set(chunk, position)
    position += chunk.length
  }

  return result
}

export async function exportDatabaseFromFsHandle(
  vfs: FacadeVFS,
  path: string,
): Promise<Uint8Array<ArrayBuffer>> {
  return await getHandle(vfs, path)
    .then(handle => handle.getFile())
    .then(file => file.arrayBuffer())
    .then(buf => new Uint8Array(buf))
}

/**
 * Export database to `Uint8Array`
 * @param vfs SQLite VFS
 * @param path database path
 */
export async function exportDatabase(
  vfs: FacadeVFS,
  path: string,
): Promise<Uint8Array<ArrayBuffer>> {
  return isFsHandleVFS(vfs)
    ? await exportDatabaseFromFsHandle(vfs, path)
    : await exportDatabaseFromIDB(vfs, path)
}
