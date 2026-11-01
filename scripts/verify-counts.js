import fs from 'fs'

const htmlRec = fs.readFileSync('docs/.vitepress/dist/recommendations/index.html', 'utf8')
const brandRegex = /<h3 class="brand-heading"[^>]*>(.*?)<\/h3>/g
let m
const recBrands = []
while ((m = brandRegex.exec(htmlRec)) !== null) {
  recBrands.push(m[1])
}
console.log('Count in /recommendations/:', recBrands.length)
console.log('Brands in /recommendations/:', recBrands.map((b, i) => `${i + 1}. ${b}`).join(' | '))

const htmlBrands = fs.readFileSync('docs/.vitepress/dist/brands/index.html', 'utf8')
const brandRegex2 = /<h3 class="brand-heading"[^>]*>(.*?)<\/h3>/g
const allBrands = []
while ((m = brandRegex2.exec(htmlBrands)) !== null) {
  allBrands.push(m[1])
}
console.log('Count in /brands/:', allBrands.length)
