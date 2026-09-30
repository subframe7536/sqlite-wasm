import wasmUrl from '../../wa-sqlite-fts5/wa-sqlite.wasm?url'

import { colorToVector, PALETTE, searchColors, VECTOR_SEARCH_SQL } from './sqliteVec'
import type { VectorMatch } from './sqliteVec'

const form = document.querySelector<HTMLFormElement>('#vec-search')!
const controls = form.querySelector<HTMLFieldSetElement>('fieldset')!
const colorInput = form.querySelector<HTMLInputElement>('#vec-color')!
const neighborsInput = form.querySelector<HTMLSelectElement>('#vec-neighbors')!
const button = form.querySelector<HTMLButtonElement>('button[type="submit"]')!
const vectorOutput = document.querySelector<HTMLOutputElement>('#vec-vector')!
const status = document.querySelector<HTMLParagraphElement>('#vec-status')!
const results = document.querySelector<HTMLOListElement>('#vec-results')!
const samples = document.querySelector<HTMLDivElement>('#vec-samples')!
const sqlOutput = document.querySelector<HTMLElement>('#vec-sql')!

function updateVector(): void {
  vectorOutput.value = `${colorInput.value.toUpperCase()} → [${colorToVector(colorInput.value)
    .map((value) => value.toFixed(3))
    .join(', ')}]`
}

function renderMatch(match: VectorMatch): HTMLLIElement {
  const item = document.createElement('li')
  const swatch = document.createElement('span')
  swatch.className = 'swatch'
  swatch.style.backgroundColor = match.hex
  swatch.setAttribute('aria-hidden', 'true')
  const name = document.createElement('strong')
  name.textContent = match.name
  const hex = document.createElement('code')
  hex.textContent = match.hex.toUpperCase()
  const distance = document.createElement('span')
  distance.className = 'distance'
  distance.textContent = `L2 ${match.distance.toFixed(4)}`
  item.append(swatch, name, hex, distance)
  return item
}

async function search(): Promise<void> {
  if (controls.disabled) {
    return
  }
  controls.disabled = true
  results.setAttribute('aria-busy', 'true')
  results.replaceChildren()
  button.textContent = 'Searching…'
  status.classList.remove('error')
  status.textContent = 'Loading bundled WASM and searching with sqlite-vec…'
  try {
    const result = await searchColors(colorInput.value, Number(neighborsInput.value), wasmUrl)
    results.replaceChildren(...result.matches.map(renderMatch))
    status.textContent = `sqlite-vec ${result.vecVersion} · SQLite ${result.sqliteVersion} · ${PALETTE.length} vectors · ${result.queryMs.toFixed(2)} ms query`
  } catch (error) {
    status.classList.add('error')
    status.textContent = `Vector search failed: ${error instanceof Error ? error.message : String(error)}. Ensure wa-sqlite-fts5 includes sqlite-vec (pnpm run update).`
  } finally {
    controls.disabled = false
    results.setAttribute('aria-busy', 'false')
    button.textContent = 'Find nearest colors'
  }
}

for (const color of PALETTE) {
  const sample = document.createElement('button')
  sample.type = 'button'
  sample.className = 'palette-sample'
  sample.style.backgroundColor = color.hex
  sample.title = `${color.name} (${color.hex.toUpperCase()})`
  sample.setAttribute('aria-label', `Search for ${color.name}`)
  sample.addEventListener('click', () => {
    if (controls.disabled) {
      return
    }
    colorInput.value = color.hex
    updateVector()
    void search()
  })
  samples.append(sample)
}

sqlOutput.textContent = `CREATE VIRTUAL TABLE palette USING vec0(
  rgb float[3], +name TEXT, +hex TEXT
);

INSERT INTO palette(rgb, name, hex)
VALUES (vec_f32('[0.933, 0.439, 0.349]'), 'Coral', '#ee7059');

${VECTOR_SEARCH_SQL};
-- Bind the query RGB vector as JSON and the neighbor count.`

colorInput.addEventListener('input', updateVector)
colorInput.addEventListener('change', () => void search())
neighborsInput.addEventListener('change', () => void search())
form.addEventListener('submit', (event) => {
  event.preventDefault()
  void search()
})

updateVector()
void search()
