export class OPFSAnyContextVFS {
  static create(
    name: string,
    module: any,
    options: any,
    rootDirectoryHandle: FileSystemDirectoryHandle,
  ): Promise<OPFSAnyContextVFS>

  getPathComponents(path: string, create?: boolean): Promise<[FileSystemDirectoryHandle, string]>
}
