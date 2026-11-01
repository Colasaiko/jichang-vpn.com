import fs from 'fs'
import path from 'path'

function getFiles(dir) {
  let results = []
  const list = fs.readdirSync(dir)
  list.forEach(file => {
    file = path.join(dir, file)
    const stat = fs.statSync(file)
    if (stat && stat.isDirectory()) results = results.concat(getFiles(file))
    else if (file.endsWith('.html')) results.push(file)
  })
  return results
}

const distDir = path.resolve('docs/.vitepress/dist')
const htmlFiles = getFiles(distDir)
console.log('Total HTML pages:', htmlFiles.length)
let deadCount = 0
htmlFiles.forEach(f => {
  const content = fs.readFileSync(f, 'utf8')
  const hrefs = [...content.matchAll(/href="(\/[^"#?]*)/g)].map(m => m[1])
  hrefs.forEach(h => {
    if (h.startsWith('/')) {
      let target = path.join(distDir, h)
      if (h.endsWith('/')) target = path.join(target, 'index.html')
      else if (!path.extname(target)) {
        if (fs.existsSync(target + '.html')) target = target + '.html'
        else target = path.join(target, 'index.html')
      }
      if (!fs.existsSync(target)) {
        console.error('Broken link in ' + path.relative(distDir, f) + ' -> ' + h)
        deadCount++
      }
    }
  })
})
if (deadCount === 0) console.log('All internal links verified: 0 broken links!')
