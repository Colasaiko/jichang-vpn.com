import fs from 'fs'
import path from 'path'

const brandsDir = path.resolve('docs/brands')
const files = fs.readdirSync(brandsDir).filter(f => f.endsWith('.md'))

let updatedCount = 0

files.forEach(file => {
  const filePath = path.join(brandsDir, file)
  const slug = path.basename(file, '.md')
  let content = fs.readFileSync(filePath, 'utf8')

  if (file === 'index.md') {
    // In index.md table, update direct external affiliate links to /go/[slug]/
    content = content.replace(/\[访问官网 ↗\]\(https?:\/\/[^)]+\)/g, (match, offset) => {
      // Find previous brand slug in the line
      return match
    })
    // Let's replace specifically for the known brands in index.md
    content = content.replace(/\[访问官网 ↗\]\(https?:\/\/edp01\.breezenetaff\.com\/[^\)]+\)/g, '[访问官网 ↗](/go/weifengwangluo/)')
    content = content.replace(/\[访问官网 ↗\]\(https?:\/\/flycat1\.flycatvipaff\.cc\/[^\)]+\)/g, '[访问官网 ↗](/go/feimaoyun/)')
    content = content.replace(/\[访问官网 ↗\]\(https?:\/\/a01vipaff\.dalaoyunaff\.com\/[^\)]+\)/g, '[访问官网 ↗](/go/dalao/)')
    fs.writeFileSync(filePath, content, 'utf8')
    return
  }

  // In individual brand pages: replace external button href with /go/[slug]/
  const regex = /<a href="https?:\/\/[^"]+" target="_blank" rel="[^"]*" class="portal-btn-primary">访问\s*([^<]+)\s*官网 ↗<\/a>/g
  if (regex.test(content)) {
    content = content.replace(regex, `<a href="/go/${slug}/" class="portal-btn-primary">访问 $1 官网 ↗</a>`)
    fs.writeFileSync(filePath, content, 'utf8')
    updatedCount++
  }
})

console.log('Updated', updatedCount, 'brand pages to route through /go/[slug]/')
