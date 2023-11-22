/**
 * check if IndexedDB and Web Locks API supported,
 * also is the **minimum version** of browser
 */
export function isIdbSupported() {
  return 'locks' in navigator
}

/**
 * check if [OPFS SyncAccessHandle](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemSyncAccessHandle) supported
 */
export async function isOpfsSupported(): Promise<boolean> {
  // must call and test, see https://stackoverflow.com/questions/76113945/file-system-access-api-on-safari-ios-createsyncaccesshandle-unknownerror-i
  const inner = async () => {
    const root = await navigator?.storage.getDirectory?.()
    if (!root) {
      return false
    }
    try {
      const handle = await root.getFileHandle('_CHECK', { create: true })
      // @ts-expect-error check
      const access = await handle.createSyncAccessHandle()
      access.close()
      return true
    } catch {
      return false
    } finally {
      await root.removeEntry('_CHECK')
    }
  }
  if ('importScripts' in globalThis) {
    return inner()
  }
  try {
    if (typeof Worker === 'undefined') {
      return false
    }

    const url = URL.createObjectURL(
      new Blob(
        [`(${inner})().then(postMessage)`],
        { type: 'text/javascript' },
      ),
    )
    const worker = new Worker(url)

    const result = await new Promise<boolean>((resolve, reject) => {
      worker.onmessage = ({ data }) => {
        resolve(data)
      }
      worker.onerror = (err) => {
        err.preventDefault()
        reject(false)
      }
    })

    worker.terminate()
    URL.revokeObjectURL(url)

    return result
  } catch {
    return false
  }
}

/**
 * check `new Worker(url, { type: 'module' })` support
 *
 * {@link https://stackoverflow.com/questions/62954570/javascript-feature-detect-module-support-for-web-workers Reference}
 */
export function isModuleWorkerSupport(): boolean {
  let supports = false
  try {
    new Worker('data:,', {
      // @ts-expect-error check assign
      get type() {
        supports = true
      },
    }).terminate()
  } finally {
    // eslint-disable-next-line no-unsafe-finally
    return supports
  }
}
