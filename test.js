import * as fs from 'node:fs'

function findStringInBuffer(buffer, searchString) {
  const asciiString = buffer.toString('ascii')
  const position = asciiString.indexOf(searchString)

  if (position >= 0) {
    console.log(`- Found "${searchString}" at position: ${position}`)
  } else {
    console.log(`- "${searchString}" not found in the buffer.`)
  }
}

const path = './wa-sqlite-fts5/wa-sqlite.wasm'
const buf = fs.readFileSync(path)

console.log(`${path}:`)
findStringInBuffer(buf, '3.47')
findStringInBuffer(buf, '3.48')
