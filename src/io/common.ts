import type { Promisable } from '../types'
import { SQLITE_OK } from '../constant'

export async function check(code: Promisable<number>): Promise<void> {
  if (await code !== SQLITE_OK) {
    throw new Error(`Error code: ${await code}`)
  }
}

export function ignoredDataView(): DataView {
  return new DataView(new ArrayBuffer(4))
}
