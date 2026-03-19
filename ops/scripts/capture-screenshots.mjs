import fs from 'node:fs/promises'
import path from 'node:path'
import puppeteer from 'puppeteer-core'

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const baseUrl = 'http://192.168.1.50:8081'
const outDir = path.resolve('docs/assets/screenshots')

await fs.mkdir(outDir, { recursive: true })

const browser = await puppeteer.launch({
  executablePath: chromePath,
  headless: true,
  defaultViewport: { width: 1440, height: 900 },
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
})

const page = await browser.newPage()

await page.goto(`${baseUrl}/login`, { waitUntil: 'networkidle2' })
await page.screenshot({ path: path.join(outDir, 'login.png'), fullPage: true })

const [usernameInput, passwordInput] = await page.$$('input')
if (!usernameInput || !passwordInput) {
  throw new Error('No se encontraron los campos de login.')
}

await usernameInput.click({ clickCount: 3 })
await usernameInput.type('admin')
await passwordInput.click({ clickCount: 3 })
await passwordInput.type('Admin.1234')

await Promise.all([
  page.waitForFunction(() => window.location.pathname === '/', { timeout: 30000 }),
  page.locator('button').click(),
])

const pages = [
  ['dashboard', '/'],
  ['escribanos', '/escribanos'],
  ['usuarios', '/usuarios'],
  ['adjuntos', '/adjuntos'],
  ['auditoria', '/auditoria'],
]

for (const [name, route] of pages) {
  await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle2' })
  await page.screenshot({ path: path.join(outDir, `${name}.png`), fullPage: true })
}

await browser.close()
