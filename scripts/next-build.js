/* eslint-disable no-console */

const { spawnSync } = require('child_process')
const fs = require('fs')
const path = require('path')

function getNextCliScript() {
  return path.join(__dirname, '..', 'node_modules', 'next', 'dist', 'bin', 'next')
}

function runNextBuild() {
  const nextCli = getNextCliScript()
  const res = spawnSync(process.execPath, [nextCli, 'build'], {
    cwd: path.join(__dirname, '..'),
    env: process.env,
    stdio: 'inherit'
  })

  return res
}

function tryFixExdev500Html() {
  const root = path.join(__dirname, '..')
  const exportDir = path.join(root, '.next', 'export')
  const pagesDir = path.join(root, '.next', 'server', 'pages')

  const candidates = ['500.html', '404.html']
  let copiedAny = false

  fs.mkdirSync(pagesDir, { recursive: true })

  for (const file of candidates) {
    const src = path.join(exportDir, file)
    const dst = path.join(pagesDir, file)
    if (!fs.existsSync(src)) continue
    try {
      fs.renameSync(src, dst)
      copiedAny = true
      continue
    } catch (err) {
      if (err && err.code === 'EXDEV') {
        fs.copyFileSync(src, dst)
        copiedAny = true
        continue
      }
      throw err
    }
  }

  return copiedAny
}

const result = runNextBuild()

if (result.status === 0) {
  process.exit(0)
}

if (result.error) {
  process.stderr.write(String(result.error.stack || result.error.message || result.error) + '\n')
  process.exit(1)
}

try {
  const root = path.join(__dirname, '..')
  const src500 = path.join(root, '.next', 'export', '500.html')
  const dst500 = path.join(root, '.next', 'server', 'pages', '500.html')
  const looksLikeExdev500 = fs.existsSync(src500) && !fs.existsSync(dst500)

  if (!looksLikeExdev500) {
    process.exit(result.status || 1)
  }

  const fixed = tryFixExdev500Html()
  if (fixed) {
    console.warn(
      '\n[next-build wrapper] Applied EXDEV fallback for `.next/export/{500,404}.html`.\n' +
        'This is a filesystem quirk; on normal hosts Next.js can `rename()` these files.'
    )
    process.exit(0)
  }
} catch (e) {
  // If it's not the known EXDEV quirk, preserve the original build failure code.
}

process.exit(result.status || 1)
