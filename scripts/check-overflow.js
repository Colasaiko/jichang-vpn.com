import fs from 'fs'

const html = fs.readFileSync('docs/.vitepress/dist/recommendations/index.html', 'utf8')
const brandNames = [...html.matchAll(/<strong class="brand-name"[^>]*>([^<]+)<\/strong>/g)].map(m => m[1])
console.log('Brands found in HTML:', brandNames.length)
console.log([...new Set(brandNames)].map((b, i) => `${i + 1}. ${b}`).join(' | '))

const hasOverflowAuto = html.includes('overflow-x: auto') || html.includes('overflow-x:auto')
console.log('Contains overflow-x: auto ?', hasOverflowAuto)
