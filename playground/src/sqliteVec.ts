import { initSQLite, useMemoryStorage } from '../../src'

export interface PaletteColor {
  name: string
  hex: string
}

export interface VectorMatch extends PaletteColor {
  distance: number
}

export interface VectorSearchResult {
  sqliteVersion: string
  vecVersion: string
  queryMs: number
  matches: VectorMatch[]
}

export const PALETTE: readonly PaletteColor[] = [
  { name: 'Coral', hex: '#ee7059' },
  { name: 'Terracotta', hex: '#c65d3b' },
  { name: 'Peach', hex: '#f4b899' },
  { name: 'Rose', hex: '#df8ca4' },
  { name: 'Honey', hex: '#e5b544' },
  { name: 'Sage', hex: '#9aaf88' },
  { name: 'Forest', hex: '#3a7256' },
  { name: 'Teal', hex: '#429b99' },
  { name: 'Sky', hex: '#85bce3' },
  { name: 'Cobalt', hex: '#4866bb' },
  { name: 'Lavender', hex: '#b49acb' },
  { name: 'Slate', hex: '#626e80' },
]

export const VECTOR_SEARCH_SQL = `SELECT name, hex, distance
FROM palette
WHERE rgb MATCH vec_f32(?) AND k = ?
ORDER BY distance`

/** Simple RGB features, not model-generated embeddings or perceptual color distance. */
export function colorToVector(hex: string): [number, number, number] {
  if (!/^#[\da-f]{6}$/i.test(hex)) {
    throw new Error('Choose a six-digit hex color.')
  }
  return [
    Number.parseInt(hex.slice(1, 3), 16) / 255,
    Number.parseInt(hex.slice(3, 5), 16) / 255,
    Number.parseInt(hex.slice(5, 7), 16) / 255,
  ]
}

export async function searchColors(
  hex: string,
  k: number,
  wasmUrl: string,
): Promise<VectorSearchResult> {
  const vector = colorToVector(hex)
  if (!Number.isInteger(k) || k < 1 || k > PALETTE.length) {
    throw new Error(`Choose between 1 and ${PALETTE.length} neighbors.`)
  }

  // A separate in-memory database keeps the showcase out of the storage demos.
  const db = await initSQLite(useMemoryStorage({ url: wasmUrl }))
  try {
    const [versions] = await db.run('SELECT sqlite_version() AS sqlite, vec_version() AS vec')
    await db.run('CREATE VIRTUAL TABLE palette USING vec0(rgb float[3], +name TEXT, +hex TEXT)')
    await db.run('BEGIN')
    for (const color of PALETTE) {
      await db.run('INSERT INTO palette(rgb, name, hex) VALUES (vec_f32(?), ?, ?)', [
        JSON.stringify(colorToVector(color.hex)),
        color.name,
        color.hex,
      ])
    }
    await db.run('COMMIT')

    const started = performance.now()
    const rows = await db.run(VECTOR_SEARCH_SQL, [JSON.stringify(vector), k])
    const queryMs = performance.now() - started
    const matches = rows.map((row): VectorMatch => {
      if (
        typeof row.name !== 'string' ||
        typeof row.hex !== 'string' ||
        typeof row.distance !== 'number'
      ) {
        throw new TypeError('Unexpected sqlite-vec search result.')
      }
      return { name: row.name, hex: row.hex, distance: row.distance }
    })

    return {
      sqliteVersion: String(versions?.sqlite),
      vecVersion: String(versions?.vec),
      queryMs,
      matches,
    }
  } finally {
    await db.close()
  }
}
