// Crea/actualiza public/version.json con timestamp y short SHA
// y define VITE_APP_VERSION en .env.production.local
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { execSync } from 'child_process'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

function getShortSHA () {
  try {
    return execSync('git rev-parse --short HEAD').toString().trim()
  } catch {
    return ''
  }
}

const ts = new Date().toISOString().replace(/[:.]/g, '-')
const sha = getShortSHA()
const version = `${ts}${sha ? '-' + sha : ''}`

// Asegura directorio public/
const publicDir = `${__dirname}/../public`
if (!existsSync(publicDir)) mkdirSync(publicDir, { recursive: true })

// Escribe version.json
const versionJsonPath = `${publicDir}/version.json`
writeFileSync(versionJsonPath, JSON.stringify({ version }, null, 2))

// Define VITE_APP_VERSION para usar en logs/telemetría
const envProdLocalPath = `${__dirname}/../.env.production.local`
writeFileSync(envProdLocalPath, `VITE_APP_VERSION=${version}\n`)

console.log('[build] version.json =>', version)
