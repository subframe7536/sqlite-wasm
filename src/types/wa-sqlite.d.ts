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
