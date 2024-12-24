import type { FacadeVFS, Promisable } from '../types'
import { SQLITE_OK } from '../constant'

export async function check(code: Promisable<number>): Promise<void> {
  if (await code !== SQLITE_OK) {
    throw new Error(`Error code: ${await code}`)
  }
}

export function ignoredDataView(): DataView {
  return new DataView(new ArrayBuffer(4))
}
export async function getHandleFromPath(path: string): Promise<FileSystemFileHandle> {
  const root = await navigator.storage.getDirectory()
  const handle = await root.getFileHandle(path, { create: true })
  return handle
}

export function isOpfsVFS(vfs: FacadeVFS): boolean {
  return 'releaser' in vfs
}
