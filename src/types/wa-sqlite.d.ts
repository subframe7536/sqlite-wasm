declare module 'wa-sqlite/src/examples/IDBBatchAtomicVFS.js' {
  export class IDBBatchAtomicVFS {
    static create(name: string, module: any, options: any): Promise<any>
  }
}

declare module 'wa-sqlite/src/examples/IDBMirrorVFS.js' {
  export class IDBMirrorVFS {
    static create(name: string, module: any): Promise<any>
  }
}

declare module 'wa-sqlite/src/examples/OPFSCoopSyncVFS.js' {
  export class OPFSCoopSyncVFS {
    static create(name: string, module: any): Promise<any>
  }
}

declare module 'wa-sqlite/src/examples/OPFSWriteAheadVFS.js' {
  export class OPFSWriteAheadVFS {
    static create(name: string, module: any, options?: any): Promise<any>
  }
}

declare module 'wa-sqlite/src/examples/MemoryVFS.js' {
  export class MemoryVFS {
    static create(name: string, module: any): Promise<any>
  }
}

declare module 'wa-sqlite-fts5/wa-sqlite.mjs' {
  declare const SQLiteESMFactory: (moduleArg?: {
    locateFile?: (path: string) => string
  }) => Promise<any>

  export default SQLiteESMFactory
}
declare module 'wa-sqlite-fts5/wa-sqlite-async.mjs' {
  declare const SQLiteAsyncESMFactory: (moduleArg?: {
    locateFile?: (path: string) => string
  }) => Promise<any>

  export default SQLiteAsyncESMFactory
}
