import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { fetch } from 'ofetch'
import { x } from 'tar'

// Read GitHub proxy from environment variable
const githubProxy = process.env.GITHUB || 'github.com'
const REPO = 'subframe7536/sqwab'
const cliTag = process.argv[2]
async function getLatestTag() {
  if (cliTag) {
    if (!cliTag.startsWith('v')) {
      return `v${cliTag}`
    }
    return cliTag
  }
  const apiURL = `https://api.github.com/repos/${REPO}/tags`
  try {
    const response = await fetch(apiURL)
    if (!response.ok) {
      throw new Error(`Failed to fetch tags: ${response.statusText}`)
    }

    const tags = await response.json()
    if (tags.length === 0) {
      throw new Error('No tags found in the repository.')
    }

    // The tags are returned in chronological order, so the first one is the latest
    const latestTag = tags[0].name
    console.log(JSON.stringify(tags[0]))
    return latestTag
  } catch (error) {
    console.error('Error fetching latest tag:', error)
    return null
  }
}

async function downloadAndExtractRelease(tag, outputDir) {
  if (!tag) {
    return
  }
  if (existsSync(outputDir)) {
    rmSync(outputDir, { recursive: true })
  }
  mkdirSync(outputDir, { recursive: true })
  const releaseUrl = `https://github.com/${REPO}/releases/${tag}`
  const downloadUrl = `https://${githubProxy}/${REPO}/releases/download/${tag}/wa-sqlite.dist.tgz`
  const target = `wasqlite-fts5-${tag}.tgz`
  if (existsSync(target)) {
    rmSync(target)
  }
  if (!existsSync(target)) {
    console.log(`Downloading from ${downloadUrl}`)
    const resp = await fetch(downloadUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/gzip',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      },
    })

    if (!resp.ok) {
      throw new Error(`Download fail: ${resp.statusText}`)
    }

    writeFileSync(target, new Uint8Array(await resp.arrayBuffer()))
  }

  console.log('Extracting...')
  await x({
    file: target,
    cwd: outputDir,
  })

  console.log('Updating README.md')

  writeFileSync(
    `${outputDir}/README.md`,
    `# wa-sqlite fts5\n\nDownload from https://github.com/${REPO}\n\nTag [\`${tag}\`](${releaseUrl})\n`,
    'utf-8',
  )
}

getLatestTag()
  .then(tag => downloadAndExtractRelease(tag, 'wa-sqlite-fts5'))
  .then(() => console.log('Done!'))
  .catch(error => console.error('Error:', error))
