import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { createSSRApp, h } from 'vue'
import { renderToString } from '@vue/server-renderer'

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
const [archive] = JSON.parse(execFileSync('npm', ['pack', '--dry-run', '--ignore-scripts', '--json'], { encoding: 'utf8' }))
const files = new Set(archive.files.map(file => file.path))

for (const exported of [pkg.main, pkg.module, pkg.types, pkg.exports['./style.css']])
  assert.ok(files.has(exported.replace(/^\.\//, '')), `Missing published file: ${exported}`)

assert.ok(files.has('LICENSE'), 'The package must include its license')
assert.ok([...files].some(file => /^dist\/fr-.*\.js$/.test(file)), 'French locale chunk must be published')

const require = createRequire(import.meta.url)
const esm = await import(pkg.name)
const cjs = require(pkg.name)
assert.equal(typeof esm.default.install, 'function', 'ESM entry must export the Vue plugin')
assert.equal(typeof cjs.install, 'function', 'CommonJS entry must export the Vue plugin')
assert.equal(pkg.publishConfig.access, 'public')
for (const value of ['', [], { startDate: '2026-09-16', endDate: '2026-09-18' }]) {
  const html = await renderToString(createSSRApp({ render: () => h(esm.default, {
    modelValue: value,
    formatter: { date: 'YYYY-MM-DD', month: 'MMM' },
  }) }))
  assert.ok(html.includes('<input'), 'The picker must render on the server without browser globals')
}
const localizedHtml = await renderToString(createSSRApp({ render: () => h(esm.default, {
  modelValue: '2026-09-16',
  asSingle: true,
  i18n: 'fr',
  formatter: { date: 'YYYY-MM-DD', month: 'MMM' },
}) }))
assert.ok(localizedHtml.includes('value="2026-09-16"'), 'SSR must await locale loading and populate the selected date')
console.log(`Package verified: ${pkg.name}; ESM, CommonJS, types, CSS and locales are present.`)
