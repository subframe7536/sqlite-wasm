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
export function isOpfsSupported(): Promise<boolean> {
  const inner = async () => {
    const root = await navigator?.storage.getDirectory?.()
    if (!root) {
      return false
    }
    const checkFileName = '_CHECK'
    try {
      const handle = await root.getFileHandle(checkFileName, { create: true })
      return 'createSyncAccessHandle' in handle
    } catch {
      return false
    } finally {
      await root.removeEntry(checkFileName)
    }
  }
  const isInWorker = globalThis && 'importScripts' in globalThis
  return isInWorker
    ? inner()
    : runWithWorker(`(${inner})().then(postMessage)`)
}

/**
 * check `new Worker(url, { type: 'module' }) support`
 */
export function isModuleWorkerSupport(): Promise<boolean> {
  return runWithWorker('postMessage(true)')
}

/**
 * check `new Worker(url, { type: 'module' }) support`
 */
function runWithWorker(code: string): Promise<boolean> {
  return new Promise<boolean>((resolve, reject) => {
    if (typeof Worker === 'undefined') {
      resolve(false)
    }

    const url = URL.createObjectURL(
      new Blob(
        [`onmessage=()=>{${code}}`],
        { type: 'text/javascript' },
      ),
    )

    const worker = new Worker(url, { type: 'module' })

    worker.onmessage = ({ data }) => {
      URL.revokeObjectURL(url)
      worker.terminate()
      resolve(data)
    }

    worker.onerror = () => {
      worker.terminate()
      reject(false)
    }

    worker.postMessage('')
  }).catch(() => false)
}
