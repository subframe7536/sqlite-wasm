import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { fetch } from 'ofetch'
import { x } from 'tar'

async function downloadAndExtractRelease(tag, releaseUrl, outputDir) {
  // Ensure output directory exists
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true })
  }

  const resp = await fetch(releaseUrl, {
    method: 'GET',
    headers: {
      Accept: 'application/gzip',
    },
  })

  if (!resp.ok) {
    throw new Error(`Cannot downlaod from ${releaseUrl}`)
  }

  const target = `${outputDir}/wasqlite-fts5-${tag}.tgz`
  try {
    console.log('Starting download and extraction...')
    writeFileSync(target, new Uint8Array(await resp.arrayBuffer()))

    await x({
      file: target,
      cwd: outputDir,
    })

    console.log('Extraction completed')

    writeFileSync(`${outputDir}/README.md`, `# wa-sqlite fts5\n\nDownload from https://github.com/subframe7536/sqwab\n\nTag v${tag}\n`, 'utf-8')
  } catch (error) {
    console.error(error)
  } finally {
    if (existsSync(target)) {
      rmSync(target)
    }
  }
}

// Read GitHub proxy from environment variable
const githubProxy = process.env.GITHUB || 'github.com'

let tag = process.argv[2]
if (!tag) {
  console.error('Error: no tag. Usage: node ./download.mjs v1731642572')
  console.log('Please check out https://github.com/subframe7536/sqwab/releases')
  process.exit(1)
}
if (!tag.startsWith('v')) {
  tag = `v${tag}`
}

const releaseUrl = `https://${githubProxy}/subframe7536/sqwab/releases/download/${tag}/wa-sqlite.dist.tgz`
downloadAndExtractRelease(tag, releaseUrl, 'wa-sqlite-fts5')
  .then(() => console.log('Done!'))
  .catch(error => console.error('Error:', error))
