export async function runSQL(run: (sql: string, parameters?: any[]) => Promise<any>): Promise<void> {
  await run('CREATE TABLE if not exists t1(a INTEGER, b INTEGER, c VARCHAR);')
  await run('INSERT INTO t1 VALUES(1, 19147, \'nineteen thousand one hundred forty-seven\');')
  await run('INSERT INTO t1 VALUES(2, 26008, \'twenty-six thousand eight\');')
  await run('INSERT INTO t1 VALUES(3, 46582, \'forty-six thousand five hundred eighty-two\');')
  console.log(await run('select * from t1'))
}
export async function runSQLStream(
  run: (sql: string, parameters?: any[]) => Promise<any>,
  stream: (onData: (data: any) => void, sql: string, parameters?: any[]) => Promise<any>,
  onData: (data: any) => void,
): Promise<void> {
  await run('CREATE TABLE if not exists t1(a INTEGER, b INTEGER, c VARCHAR);')
  await run('INSERT INTO t1 VALUES(1, 19147, \'nineteen thousand one hundred forty-seven\');')
  await run('INSERT INTO t1 VALUES(2, 26008, \'twenty-six thousand eight\');')
  await run('INSERT INTO t1 VALUES(3, 46582, \'forty-six thousand five hundred eighty-two\');')
  await stream(onData, 'select * from t1')
}
