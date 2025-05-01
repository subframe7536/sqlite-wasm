import type { FacadeVFS, Promisable } from '../types'
import type { OPFSAnyContextVFS } from '../vfs/fs-handle'

import { SQLITE_OK } from '../constant'

export async function check(code: Promisable<number>): Promise<void> {
  if (await code !== SQLITE_OK) {
    throw new Error(`Error code: ${await code}`)
  }
}

export function ignoredDataView(): DataView {
  return new DataView(new ArrayBuffer(4))
}

export async function getHandle(vfs: FacadeVFS, path: string, create?: boolean): Promise<FileSystemFileHandle> {
  let root: FileSystemDirectoryHandle
  if ((vfs as any).releaser instanceof FileSystemDirectoryHandle) {
    [root] = await (vfs as unknown as OPFSAnyContextVFS).getPathComponents(path, create)
  } else {
    root = await navigator.storage.getDirectory()
  }
  return await root.getFileHandle(path, { create })
}

export function isFsHandleVFS(vfs: FacadeVFS): boolean {
  return 'releaser' in vfs
}
