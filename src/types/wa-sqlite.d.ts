declare module 'wa-sqlite/src/examples/IDBBatchAtomicVFS.js' {
  export type IDBBatchAtomicVFSOptions = {
    /**
     * patched options for `navigator.locks.request()`
     * @default 'shared+hint'
     */
    lockPolicy?: 'exclusive' | 'shared' | 'shared+hint'
    /**
     * timeout for the lock
     * @default Infinity
     */
    lockTimeout?: number
  }

  export class IDBBatchAtomicVFS {
    static create(name: string, module: any, options: IDBBatchAtomicVFSOptions): Promise<SQLiteVFS>
  }
}
declare module 'wa-sqlite/src/examples/OPFSCoopSyncVFS.js' {
  export class OPFSCoopSyncVFS {
    static create(name: string, module: any): Promise<SQLiteVFS>
  }
}
