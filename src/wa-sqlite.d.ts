declare module 'wa-sqlite/src/examples/IDBBatchAtomicVFS.js' {

  export class IDBBatchAtomicVFS extends SQLiteVFS {
    constructor(idbDatabaseName: string, options?: object)
  }
}
declare module 'wa-sqlite/src/examples/AccessHandlePoolVFS.js' {
  export class AccessHandlePoolVFS extends SQLiteVFS {
    constructor(directoryPath: string)
    isReady: Promise<void>
  }
}

declare class SQLiteVFS {
  /** Maximum length of a file path in UTF-8 bytes (default 64) */
  mxPathName?: number

  /** @see https://sqlite.org/c3ref/io_methods.html */
  xClose(fileId: number): number

  /** @see https://sqlite.org/c3ref/io_methods.html */
  xRead(fileId: number, pData: Uint8Array, iOffset: number): number

  /** @see https://sqlite.org/c3ref/io_methods.html */
  xWrite(fileId: number, pData: Uint8Array, iOffset: number): number

  /** @see https://sqlite.org/c3ref/io_methods.html */
  xTruncate(fileId: number, iSize: number): number

  /** @see https://sqlite.org/c3ref/io_methods.html */
  xSync(fileId: number, flags: number): number

  /** @see https://sqlite.org/c3ref/io_methods.html */
  xFileSize(fileId: number, pSize64: DataView): number

  /** @see https://sqlite.org/c3ref/io_methods.html */
  xLock(fileId: number, flags: number): number

  /** @see https://sqlite.org/c3ref/io_methods.html */
  xUnlock(fileId: number, flags: number): number

  /** @see https://sqlite.org/c3ref/io_methods.html */
  xCheckReservedLock(fileId: number, pResOut: DataView): number

  /** @see https://sqlite.org/c3ref/io_methods.html */
  xFileControl(fileId: number, flags: number, pOut: DataView): number

  /** @see https://sqlite.org/c3ref/io_methods.html */
  xDeviceCharacteristics(fileId: number): number

  /** @see https://sqlite.org/c3ref/vfs.html */
  xOpen(name: string | null, fileId: number, flags: number, pOutFlags: DataView): number

  /** @see https://sqlite.org/c3ref/vfs.html */
  xDelete(name: string, syncDir: number): number

  /** @see https://sqlite.org/c3ref/vfs.html */
  xAccess(name: string, flags: number, pResOut: DataView): number
}
