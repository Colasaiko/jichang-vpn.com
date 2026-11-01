import fs from 'fs'

const html = fs.readFileSync('docs/.vitepress/dist/recommendations/index.html', 'utf8')
const matches = [...html.matchAll(/<strong class="brand-name"[^>]*>([^<]+)<\/strong>/g)].map(m => m[1])
console.log('CompareTable brands rendered in Desktop Table:', matches.length)
console.log(matches.map((b, i) => `${i + 1}. ${b}`).join(' | '))

const mobMatches = [...html.matchAll(/<strong class="mob-card-title"[^>]*>([^<]+)<\/strong>/g)].map(m => m[1])
console.log('CompareTable brands rendered in Mobile Cards:', mobMatches.length)
console.log(mobMatches.map((b, i) => `${i + 1}. ${b}`).join(' | '))
