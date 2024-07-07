declare module 'wa-sqlite/src/examples/IDBBatchAtomicVFS.js' {
  export class IDBBatchAtomicVFS {
    static create(name: string, module: any, options: any): Promise<SQLiteVFS>
  }
}

declare module 'wa-sqlite/src/examples/OPFSCoopSyncVFS.js' {
  export class OPFSCoopSyncVFS {
    static create(name: string, module: any): Promise<SQLiteVFS>
  }
}
