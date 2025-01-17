// Copy from wa-sqlite@1.0.5/src/types/index.d.ts, fix some errors
/* eslint-disable */

export interface SQLiteAPI {
  /**
   * Bind a collection of values to a statement
   *
   * This convenience function binds values from either an array or object
   * to a prepared statement with placeholder parameters.
   *
   * Array example using numbered parameters (numbering is implicit in
   * this example):
   * ```
   * const sql = 'INSERT INTO tbl VALUES (?, ?, ?)';
   * for await (const stmt of sqlite3.statements(db, sql) {
   *   sqlite3.bind_collection(stmt, [42, 'hello', null]);
   *   ...
   * }
   * ```
   *
   * Object example using named parameters (':', '@', or '$' prefixes
   * are allowed):
   * ```
   * const sql = 'INSERT INTO tbl VALUES (?, ?, ?)';
   * for await (const stmt of sqlite3.statements(db, sql) {
   *   sqlite3.bind_collection(stmt, {
   *     '@foo': 42,
   *     '@bar': 'hello',
   *     '@baz': null,
   *   });
   *   ...
   * }
   * ```
   *
   * Note that SQLite bindings are indexed beginning with 1, but when
   * binding values from an array `a` the values begin with `a[0]`.
   * @param stmt prepared statement pointer
   * @param bindings
   * @returns `SQLITE_OK` (throws exception on error)
   */
  bind_collection(
    stmt: number,
    bindings: { [index: string]: SQLiteCompatibleType | null } | Array<SQLiteCompatibleType | null>
  ): number;

  /**
   * Bind value to prepared statement
   *
   * This convenience function calls the appropriate `bind_*` function
   * based on the type of `value`. Note that binding indices begin with 1.
   * @param stmt prepared statement pointer
   * @param i binding index
   * @param value
   * @returns `SQLITE_OK` (throws exception on error)
   */
  bind(stmt: number, i: number, value: SQLiteCompatibleType | null): number;

  /**
   * Bind blob to prepared statement parameter
   *
   * Note that binding indices begin with 1.
   * @see https://www.sqlite.org/c3ref/bind_blob.html
   * @param stmt prepared statement pointer
   * @param i binding index
   * @param value
   * @returns `SQLITE_OK` (throws exception on error)
   */
  bind_blob(stmt: number, i: number, value: Uint8Array | Array<number>): number;

  /**
   * Bind number to prepared statement parameter
   *
   * Note that binding indices begin with 1.
   * @see https://www.sqlite.org/c3ref/bind_blob.html
   * @param stmt prepared statement pointer
   * @param i binding index
   * @param value
   * @returns `SQLITE_OK` (throws exception on error)
   */
  bind_double(stmt: number, i: number, value: number): number;

  /**
  * Bind number to prepared statement parameter
  *
  * Note that binding indices begin with 1.
  * @see https://www.sqlite.org/c3ref/bind_blob.html
  * @param stmt prepared statement pointer
  * @param i binding index
  * @param value
  * @returns `SQLITE_OK` (throws exception on error)
  */
  bind_int(stmt: number, i: number, value: number): number;

  /**
  * Bind number to prepared statement parameter
  *
  * Note that binding indices begin with 1.
  * @see https://www.sqlite.org/c3ref/bind_blob.html
  * @param stmt prepared statement pointer
  * @param i binding index
  * @param value
  * @returns `SQLITE_OK` (throws exception on error)
  */
  bind_int64(stmt: number, i: number, value: bigint): number;

  /**
 * Bind null to prepared statement
 *
 * Note that binding indices begin with 1.
 * @see https://www.sqlite.org/c3ref/bind_blob.html
 * @param stmt prepared statement pointer
 * @param i binding index
 * @returns `SQLITE_OK` (throws exception on error)
 */
  bind_null(stmt: number, i: number): number;

  /**
   * Get number of bound parameters
   * @see https://www.sqlite.org/c3ref/bind_parameter_count.html
   * @param stmt prepared statement pointer
   * @returns number of statement binding locations
   */
  bind_parameter_count(stmt: number): number;

  /**
   * Get name of bound parameter
   *
   * Note that binding indices begin with 1.
   * @see https://www.sqlite.org/c3ref/bind_parameter_name.html
   * @param stmt prepared statement pointer
   * @param i binding index
   * @returns binding name
   */
  bind_parameter_name(stmt: number, i: number): string;

  /**
  * Bind string to prepared statement
  *
  * Note that binding indices begin with 1.
  * @see https://www.sqlite.org/c3ref/bind_blob.html
  * @param stmt prepared statement pointer
  * @param i binding index
  * @param value
  * @returns `SQLITE_OK` (throws exception on error)
  */
  bind_text(stmt: number, i: number, value: string): number;

  /**
   * Get count of rows modified by last insert/update
   * @see https://www.sqlite.org/c3ref/changes.html
   * @param db database pointer
   * @returns number of rows modified
   */
  changes(db: number): number;

  /**
   * Reset all bindings on a prepared statement.
   * @see https://www.sqlite.org/c3ref/clear_bindings.html
   * @param stmt prepared statement pointer
   * @returns `SQLITE_OK` (throws exception on error)
   */
  clear_bindings(stmt: number): number;

  /**
   * Close database connection
   * @see https://www.sqlite.org/c3ref/close.html
   * @param db database pointer
   * @returns `SQLITE_OK` (throws exception on error)
   */
  close(db: number): Promise<number>;

  /**
   * Call the appropriate `column_*` function based on the column type
   *
   * The type is determined by calling {@link column_type}, which may
   * not match the type declared in `CREATE TABLE`. Note that if the column
   * value is a blob then as with `column_blob` the result may be invalid
   * after the next SQLite call; copy if it needs to be retained.
   *
   * Integer values are returned as Number if within the min/max safe
   * integer bounds, otherwise they are returned as BigInt.
   * @param stmt prepared statement pointer
   * @param i column index
   * @returns column value
   */
  column(stmt: number, i: number): SQLiteCompatibleType;

  /**
   * Extract a column value from a row after a prepared statment {@link step}
   *
   * The contents of the returned buffer may be invalid after the
   * next SQLite call. Make a copy of the data (e.g. with `.slice()`)
   * if longer retention is required.
   * @see https://www.sqlite.org/c3ref/column_blob.html
   * @param stmt prepared statement pointer
   * @param i column index
   * @returns column value
   */
  column_blob(stmt: number, i: number): Uint8Array;

  /**
   * Get storage size for column text or blob
   * @see https://www.sqlite.org/c3ref/column_blob.html
   * @param stmt prepared statement pointer
   * @param i column index
   * @returns number of bytes in column text or blob
   */
  column_bytes(stmt: number, i: number): number;

  /**
   * Get number of columns for a prepared statement
   * @see https://www.sqlite.org/c3ref/column_blob.html
   * @param stmt prepared statement pointer
   * @returns number of columns
   */
  column_count(stmt: number): number;

  /**
   * Extract a column value from a row after a prepared statment {@link step}
   * @see https://www.sqlite.org/c3ref/column_blob.html
   * @param stmt prepared statement pointer
   * @param i column index
   * @returns column value
   */
  column_double(stmt: number, i: number): number;

  /**
   * Extract a column value from a row after a prepared statment {@link step}
   * @see https://www.sqlite.org/c3ref/column_blob.html
   * @param stmt prepared statement pointer
   * @param i column index
   * @returns column value
   */
  column_int(stmt: number, i: number): number;

  /**
   * Extract a column value from a row after a prepared statment {@link step}
   * @see https://www.sqlite.org/c3ref/column_blob.html
   * @param stmt prepared statement pointer
   * @param i column index
   * @returns column value
   */
  column_int64(stmt: number, i: number): bigint;

  /**
  * Get a column name for a prepared statement
  * @see https://www.sqlite.org/c3ref/column_blob.html
  * @param stmt prepared statement pointer
  * @param i column index
  * @returns column name
  */
  column_name(stmt: number, i: number): string;

  /**
   * Get names for all columns of a prepared statement
   *
   * This is a convenience function that calls {@link column_count} and
   * {@link column_name}.
   * @param stmt
   * @returns array of column names
   */
  column_names(stmt: number): Array<string>;

  /**
   * Extract a column value from a row after a prepared statment {@link step}
   * @see https://www.sqlite.org/c3ref/column_blob.html
   * @param stmt prepared statement pointer
   * @param i column index
   * @returns column value
   */
  column_text(stmt: number, i: number): string;

  /**
   * Get column type for a prepared statement
   *
   * Note that this type may not match the type declared in `CREATE TABLE`.
   * @see https://www.sqlite.org/c3ref/column_blob.html
   * @param stmt prepared statement pointer
   * @param i column index
   * @returns enumeration value for type
   */
  column_type(stmt: number, i: number): number;

  /**
   * Register a commit hook
   *
   * @see https://www.sqlite.org/c3ref/commit_hook.html
   *
   * @param db database pointer
   * @param callback If a non-zero value is returned, commit is converted into
   * a rollback; disables callback when null
   */
  commit_hook(
    db: number,
    callback: (() => number) | null): void;

  /**
   * Create or redefine SQL functions
   *
   * The application data passed is ignored. Use closures instead.
   *
   * If any callback function returns a Promise, that function must
   * be declared `async`, i.e. it must allow use of `await`.
   * @see https://sqlite.org/c3ref/create_function.html
   * @param db database pointer
   * @param zFunctionName
   * @param nArg number of function arguments
   * @param eTextRep text encoding (and other flags)
   * @param pApp application data (ignored)
   * @param xFunc
   * @param xStep
   * @param xFinal
   * @returns `SQLITE_OK` (throws exception on error)
   */
  create_function(
    db: number,
    zFunctionName: string,
    nArg: number,
    eTextRep: number,
    pApp: number,
    xFunc?: (context: number, values: Uint32Array) => void | Promise<void>,
    xStep?: (context: number, values: Uint32Array) => void | Promise<void>,
    xFinal?: (context: number) => void | Promise<void>): number;

  /**
   * Get number of columns in current row of a prepared statement
   * @see https://www.sqlite.org/c3ref/data_count.html
   * @param stmt prepared statement pointer
   * @returns number of columns
   */
  data_count(stmt: number): number;

  /**
   * One-step query execution interface
   *
   * The implementation of this function uses {@link row}, which makes a
   * copy of blobs and returns BigInt for integers outside the safe integer
   * bounds for Number.
   * @see https://www.sqlite.org/c3ref/exec.html
   * @param db database pointer
   * @param zSQL queries
   * @param callback called for each output row
   * @returns Promise resolving to `SQLITE_OK` (rejects on error)
   */
  exec(
    db: number,
    zSQL: string,
    callback?: (row: Array<SQLiteCompatibleType | null>, columns: string[]) => void
  ): Promise<number>;

  /**
   * Destroy a prepared statement object compiled by {@link statements}
   * with the `unscoped` option set to `true`
   *
   * This function does *not* throw on error.
   * @see https://www.sqlite.org/c3ref/finalize.html
   * @param stmt prepared statement pointer
   * @returns Promise resolving to `SQLITE_OK` or error status
   */
  finalize(stmt: number): Promise<number>;

  /**
   * Test for autocommit mode
   * @see https://sqlite.org/c3ref/get_autocommit.html
   * @param db database pointer
   * @returns Non-zero if autocommit mode is on, zero otherwise
   */
  get_autocommit(db: number): number;

  /**
   * Get SQLite library version
   * @see https://www.sqlite.org/c3ref/libversion.html
   * @returns version string, e.g. '3.35.5'
   */
  libversion(): string;

  /**
   * Get SQLite library version
   * @see https://www.sqlite.org/c3ref/libversion.html
   * @returns version number, e.g. 3035005
   */
  libversion_number(): number

  /**
   * Set a usage limit on a connection.
   * @see https://www.sqlite.org/c3ref/limit.html
   * @param db database pointer
   * @param id limit category
   * @param newVal
   * @returns previous setting
   */
  limit(
    db: number,
    id: number,
    newVal: number): number;

  /**
   * Opening a new database connection.
   *
   * Note that this function differs from the C API in that it
   * returns the Promise-wrapped database pointer (instead of a
   * result code).
   * @see https://sqlite.org/c3ref/open.html
   * @param zFilename
   * @param iFlags `SQLite.SQLITE_OPEN_CREATE | SQLite.SQLITE_OPEN_READWRITE` (0x6) if omitted
   * @param zVfs VFS name
   * @returns Promise-wrapped database pointer.
   */
  open_v2(
    zFilename: string,
    iFlags?: number,
    zVfs?: string
  ): Promise<number>;

  /**
   * Specify callback to be invoked between long-running queries
   *
   * The application data passed is ignored. Use closures instead.
   *
   * If any callback function returns a Promise, that function must
   * be declared `async`, i.e. it must allow use of `await`.
   * @param db database pointer
   * @param nProgressOps target number of database operations between handler invocations
   * @param handler
   * @param userData
   */
  progress_handler<T extends number | Promise<number>>(db: number, nProgressOps: number, handler: (userData: any) => T, userData: unknown): T;

  /**
   * Reset a prepared statement object
   * @see https://www.sqlite.org/c3ref/reset.html
   * @param stmt prepared statement pointer
   * @returns Promise-wrapped `SQLITE_OK` (rejects on error)
   */
  reset(stmt: number): Promise<number>;

  /**
   * Convenience function to call `result_*` based of the type of `value`
   * @param context context pointer
   * @param value
   */
  result(context: number, value: (SQLiteCompatibleType | number[]) | null): void;

  /**
   * Set the result of a function or vtable column
   * @see https://sqlite.org/c3ref/result_blob.html
   * @param context context pointer
   * @param value
   */
  result_blob(context: number, value: Uint8Array | number[]): void;

  /**
   * Set the result of a function or vtable column
   * @see https://sqlite.org/c3ref/result_blob.html
   * @param context context pointer
   * @param value
   */
  result_double(context: number, value: number): void;

  /**
   * Set the result of a function or vtable column
   * @see https://sqlite.org/c3ref/result_blob.html
   * @param context context pointer
   * @param value
   */
  result_int(context: number, value: number): void;

  /**
   * Set the result of a function or vtable column
   * @see https://sqlite.org/c3ref/result_blob.html
   * @param context context pointer
   * @param value
   */
  result_int64(context: number, value: bigint): void;

  /**
   * Set the result of a function or vtable column
   * @see https://sqlite.org/c3ref/result_blob.html
   * @param context context pointer
   */
  result_null(context: number): void;

  /**
   * Set the result of a function or vtable column
   * @see https://sqlite.org/c3ref/result_blob.html
   * @param context context pointer
   * @param value
   */
  result_text(context: number, value: string): void;

  /**
   * Get all column data for a row from a prepared statement step
   *
   * This convenience function will return a copy of any blob, unlike
   * {@link column_blob} which returns a value referencing volatile WASM
   * memory with short validity. Like {@link column}, it will return a
   * BigInt for integers outside the safe integer bounds for Number.
   * @param stmt prepared statement pointer
   * @returns row data
   */
  row(stmt: number): Array<SQLiteCompatibleType | null>;

  /**
   * Register a callback function that is invoked to authorize certain SQL statement actions.
   * @see https://www.sqlite.org/c3ref/set_authorizer.html
   * @param db database pointer
   * @param authFunction
   * @param userData
   */
  set_authorizer(
    db: number,
    authFunction: (userData: any, iActionCode: number, param3: string | null, param4: string | null, param5: string | null, param6: string | null) => number | Promise<number>,
    userData: any): number;

  /**
   * Get statement SQL
   * @see https://www.sqlite.org/c3ref/expanded_sql.html
   * @param stmt prepared statement pointer
   * @returns SQL
   */
  sql(stmt: number): string;

  /**
   * SQL statement iterator
   *
   * This function manages statement compilation by creating an async
   * iterator that yields a prepared statement handle on each iteration.
   * It is typically used with a `for await` loop (in an async function),
   * like this:
   * ```javascript
   * // Compile one statement on each iteration of this loop.
   * for await (const stmt of sqlite3.statements(db, sql)) {
   *   // Bind parameters here if using SQLite placeholders.
   *
   *   // Execute the statement with this loop.
   *   while (await sqlite3.step(stmt) === SQLite.SQLITE_ROW) {
   *     // Collect row data here.
   *   }
   *
   *   // Change bindings, reset, and execute again if desired.
   * }
   * ```
   *
   * By default, the lifetime of a yielded prepared statement is managed
   * automatically by the iterator, ending at the end of each iteration.
   * {@link finalize} should *not* be called on a statement provided by
   * the iterator unless the `unscoped` option is set to `true` (that
   * option is provided for applications that wish to manage statement
   * lifetimes manually).
   *
   * If using the iterator manually, i.e. by calling its `next`
   * method, be sure to call the `return` method if iteration
   * is abandoned before completion (`for await` and other implicit
   * traversals provided by Javascript do this automatically)
   * to ensure that all allocated resources are released.
   * @see https://www.sqlite.org/c3ref/prepare.html
   * @param db database pointer
   * @param sql
   * @param options
   */
  statements(db: number, sql: string, options?: SQLitePrepareOptions): AsyncIterable<number>;

  /**
   * Evaluate an SQL statement
   * @see https://www.sqlite.org/c3ref/step.html
   * @param stmt prepared statement pointer
   * @returns Promise resolving to `SQLITE_ROW` or `SQLITE_DONE`
   * (rejects on error)
   */
  step(stmt: number): Promise<number>;

  /**
  * Register an update hook
  *
  * The callback is invoked whenever a row is updated, inserted, or deleted
  * in a rowid table on this connection.
  * @see https://www.sqlite.org/c3ref/update_hook.html
  *
  * updateType is one of:
  * - SQLITE_DELETE: 9
  * - SQLITE_INSERT: 18
  * - SQLITE_UPDATE: 23
  * @see https://www.sqlite.org/c3ref/c_alter_table.html
  *
  * @param db database pointer
  * @param callback
  */
  update_hook(
    db: number,
    callback: (updateType: number, dbName: string | null, tblName: string | null, rowid: bigint) => void): void;

  /**
   * Extract a value from `sqlite3_value`
   *
   * This is a convenience function that calls the appropriate `value_*`
   * function based on its type. Note that if the value is a blob then as
   * with `value_blob` the result may be invalid after the next SQLite call.
   *
   * Integer values are returned as Number if within the min/max safe
   * integer bounds, otherwise they are returned as BigInt.
   * @param pValue `sqlite3_value` pointer
   * @returns value
   */
  value(pValue: number): SQLiteCompatibleType;

  /**
   * Extract a value from `sqlite3_value`
   *
   * The contents of the returned buffer may be invalid after the
   * next SQLite call. Make a copy of the data (e.g. with `.slice()`)
   * if longer retention is required.
   * @see https://sqlite.org/c3ref/value_blob.html
   * @param pValue `sqlite3_value` pointer
   * @returns value
   */
  value_blob(pValue: number): Uint8Array;

  /**
   * Get blob or text size for value
   * @see https://sqlite.org/c3ref/value_blob.html
   * @param pValue `sqlite3_value` pointer
   * @returns size
   */
  value_bytes(pValue: number): number;

  /**
   * Extract a value from `sqlite3_value`
   * @see https://sqlite.org/c3ref/value_blob.html
   * @param pValue `sqlite3_value` pointer
   * @returns value
   */
  value_double(pValue: number): number;

  /**
   * Extract a value from `sqlite3_value`
   * @see https://sqlite.org/c3ref/value_blob.html
   * @param pValue `sqlite3_value` pointer
   * @returns value
   */
  value_int(pValue: number): number;

  /**
   * Extract a value from `sqlite3_value`
   * @see https://sqlite.org/c3ref/value_blob.html
   * @param pValue `sqlite3_value` pointer
   * @returns value
   */
  value_int64(pValue: number): bigint;

  /**
   * Extract a value from `sqlite3_value`
   * @see https://sqlite.org/c3ref/value_blob.html
   * @param pValue `sqlite3_value` pointer
   * @returns value
   */
  value_text(pValue: number): string;

  /**
   * Get type of `sqlite3_value`
   * @see https://sqlite.org/c3ref/value_blob.html
   * @param pValue `sqlite3_value` pointer
   * @returns enumeration value for type
   */
  value_type(pValue: number): number;

  /**
   * Register a new Virtual File System.
   *
   * @see https://www.sqlite.org/c3ref/vfs_find.html
   * @param vfs VFS object
   * @param makeDefault
   * @returns `SQLITE_OK` (throws exception on error)
   */
  vfs_register(vfs: SQLiteVFS, makeDefault?: boolean): number;
}