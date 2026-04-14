import { access, mkdir, writeFile } from 'node:fs/promises'

import { ofetch } from 'ofetch'
import { x } from 'tar'

const githubProxy = process.env.GITHUB || 'github.com'
const REPO = 'subframe7536/sqwab'
const cliTag = process.argv[2]

type GitHubTag = {
  name: string
}

async function getLatestTag(): Promise<string | null> {
  if (cliTag) {
    if (!cliTag.startsWith('v')) {
      return `v${cliTag}`
    }
    return cliTag
  }
  const apiURL = `https://api.github.com/repos/${REPO}/tags`
  try {
    const tags = await ofetch<GitHubTag[]>(apiURL)
    if (tags.length === 0) {
      throw new Error('No tags found in the repository.')
    }

    const latestTag = tags[0].name
    console.log(JSON.stringify(tags[0]))
    return latestTag
  } catch (error) {
    console.error('Error fetching latest tag:', error)
    return null
  }
}

async function exists(path: string): Promise<boolean> {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

async function downloadAndExtractRelease(tag: string | null, outputDir: string): Promise<void> {
  if (!tag) {
    return
  }

  await mkdir(outputDir, { recursive: true })
  const releaseUrl = `https://github.com/${REPO}/releases/${tag}`
  const downloadUrl = `https://${githubProxy}/${REPO}/releases/download/${tag}/wa-sqlite.dist.tgz`
  const target = `wasqlite-fts5-${tag}.tgz`

  if (!await exists(target)) {
    console.log(`Downloading from ${downloadUrl}`)
    const file = await ofetch<ArrayBuffer>(downloadUrl, {
      method: 'GET',
      responseType: 'arrayBuffer',
      headers: {
        'Accept': 'application/gzip',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      },
    })
    await writeFile(target, new Uint8Array(file))
  }

  console.log('Extracting...')
  await x({
    file: target,
    cwd: outputDir,
  })

  console.log('Updating README.md')

  await writeFile(
    `${outputDir}/README.md`,
    `# wa-sqlite fts5\n\nDownload from https://github.com/${REPO}\n\nTag [\`${tag}\`](${releaseUrl})\n`,
    'utf-8',
  )
}

getLatestTag()
  .then(tag => downloadAndExtractRelease(tag, 'wa-sqlite-fts5'))
  .then(() => console.log('Done!'))
  .catch(error => console.error('Error:', error))
