import { readFileSync, writeFileSync } from 'node:fs'

const upstreamTypesPath = './wa-sqlite/src/types/index.d.ts'
const facadeVFSPath = './wa-sqlite/src/FacadeVFS.js'
const typesOutputPath = './src/sqlite-types.d.ts'
const modulesOutputPath = './src/wa-sqlite-modules.d.ts'

const upstreamDeclarations = [
  'SQLiteCompatibleType',
  'SQLiteVFS',
  'SQLitePrepareOptions',
  'SQLiteAPI',
] as const

const moduleDeclarations = String.raw`
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
  const SQLiteESMFactory: (moduleArg?: { locateFile?: (path: string) => string }) => Promise<any>

  export default SQLiteESMFactory
}

declare module 'wa-sqlite-fts5/wa-sqlite-async.mjs' {
  const SQLiteAsyncESMFactory: (moduleArg?: {
    locateFile?: (path: string) => string
  }) => Promise<any>

  export default SQLiteAsyncESMFactory
}
`.trim()

function extractDeclaration(source: string, name: (typeof upstreamDeclarations)[number]): string {
  const typeStart = source.search(new RegExp(`(?:declare\\s+)?type\\s+${name}\\b`))
  if (typeStart >= 0) {
    const end = source.indexOf(';', typeStart)
    return source.slice(typeStart, end + 1)
  }

  const interfaceStart = source.search(new RegExp(`(?:declare\\s+)?interface\\s+${name}\\b`))
  if (interfaceStart < 0) {
    throw new Error(`Unable to find ${name} in ${upstreamTypesPath}`)
  }

  const bodyStart = source.indexOf('{', interfaceStart)
  let depth = 0
  for (let index = bodyStart; index < source.length; index++) {
    const char = source[index]
    if (char === '{') {
      depth++
    } else if (char === '}') {
      depth--
      if (depth === 0) {
        return source.slice(interfaceStart, index + 1)
      }
    }
  }

  throw new Error(`Unable to parse ${name} in ${upstreamTypesPath}`)
}

function toExportedDeclaration(declaration: string): string {
  return declaration.replace(/^(?:declare\s+)?(interface|type)\s+/, 'export $1 ')
}

function patchUpstreamDeclaration(declaration: string): string {
  return declaration
    .replace('changes(db): number;', 'changes(db: number): number;')
    .replace('close(db): Promise<number>;', 'close(db: number): Promise<number>;')
    .replace(
      /progress_handler\(\s*db:\s*number,\s*nProgressOps:\s*number,\s*handler:\s*\(userData:\s*any\)\s*=>\s*number\s*\|\s*Promise<number>,\s*userData,?\s*\);?/,
      'progress_handler(db: number, nProgressOps: number, handler: (userData: any) => number | Promise<number>, userData: any): void;',
    )
}

function toTypeAnnotation(jsDocType: string): string {
  return jsDocType
    .replace('string?', 'string | null')
    .replace('number|Promise<number>', 'number | Promise<number>')
}

function generateFacadeVFSDeclaration(source: string): string {
  const methods: string[] = []
  const methodPattern = /\/\*\*([\s\S]*?)\*\/\n\s+([a-zA-Z]\w*)\(([^)]*)\)\s*\{/g

  for (const match of source.matchAll(methodPattern)) {
    const [, jsdoc = '', methodName = '', rawParams = ''] = match
    if (!methodName || methodName === 'constructor' || methodName === 'hasAsyncMethod') {
      continue
    }
    if (!methodName.startsWith('j') && methodName !== 'getFilename') {
      continue
    }

    const params = rawParams
      .split(',')
      .map((param) => param.trim())
      .filter(Boolean)
      .map((param) => {
        const paramType = jsdoc.match(new RegExp(`@param \\{([^}]+)\\} ${param}\\b`))?.[1]
        if (!paramType) {
          throw new Error(`Unable to find JSDoc type for FacadeVFS.${methodName}(${param})`)
        }
        return `${param}: ${toTypeAnnotation(paramType)}`
      })
      .join(', ')

    const returnType = toTypeAnnotation(jsdoc.match(/@returns \{([^}]+)\}/)?.[1] ?? 'void')
    methods.push(`  ${methodName}(${params}): ${returnType}`)
  }

  if (methods.length === 0) {
    throw new Error(`Unable to generate FacadeVFS from ${facadeVFSPath}`)
  }

  return `export interface FacadeVFS extends SQLiteVFS {\n${methods.join('\n\n')}\n}`
}

function generateSQLiteTypes(): void {
  const upstreamTypes = readFileSync(upstreamTypesPath, 'utf8')
  const facadeVFS = readFileSync(facadeVFSPath, 'utf8')
  const sqliteDeclarations = upstreamDeclarations
    .map((name) =>
      patchUpstreamDeclaration(toExportedDeclaration(extractDeclaration(upstreamTypes, name))),
    )
    .join('\n\n')

  writeFileSync(
    typesOutputPath,
    `// Generated from ${upstreamTypesPath} and ${facadeVFSPath}. Do not edit manually.\n/* eslint-disable */\n\n${sqliteDeclarations}\n\n${generateFacadeVFSDeclaration(facadeVFS)}\n`,
  )
  writeFileSync(
    modulesOutputPath,
    `// Generated module declarations for vendored wa-sqlite entry points. Do not edit manually.\n\n${moduleDeclarations}\n`,
  )
}

generateSQLiteTypes()

export { generateSQLiteTypes }
