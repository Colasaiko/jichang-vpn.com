import fs from 'fs'
import path from 'path'

const providersPath = path.resolve('docs/.vitepress/data/providers.json')
const providers = JSON.parse(fs.readFileSync(providersPath, 'utf8'))

const goDir = path.resolve('docs/go')
if (!fs.existsSync(goDir)) {
  fs.mkdirSync(goDir, { recursive: true })
}

providers.forEach(p => {
  const brandDir = path.join(goDir, p.slug)
  if (!fs.existsSync(brandDir)) {
    fs.mkdirSync(brandDir, { recursive: true })
  }

  const content = [
    '---',
    'layout: doc',
    `title: 前往${p.name}官网`,
    `description: 您即将离开机场VPN 前往 ${p.name} 官方网站。赞助说明与专属优惠码。`,
    'head:',
    '  - - meta',
    '    - name: robots',
    '      content: noindex, nofollow',
    '---',
    '',
    `<GoTransition slug="${p.slug}" />`,
    ''
  ].join('\n')

  fs.writeFileSync(path.join(brandDir, 'index.md'), content, 'utf8')
})

const brandListLinks = providers
  .map(p => `- [${p.name} (${p.lineType || '专线'})](/go/${p.slug}/)`)
  .join('\n')

const rootContent = [
  '---',
  'layout: doc',
  'title: 品牌官网跳转中心',
  'description: 机场VPN 品牌官网跳转与赞助说明。',
  'head:',
  '  - - meta',
  '    - name: robots',
  '      content: noindex, nofollow',
  '---',
  '',
  '# 品牌官网安全跳转中心',
  '',
  '<div class="site-breadcrumbs">',
  '  <a href="/">首页</a>',
  '  <span class="sep">/</span>',
  '  <span class="current">官网跳转中心</span>',
  '</div>',
  '',
  '::: info 💡 赞助与佣金透明声明',
  '本站提供第三方服务商官网安全中继跳转。若您通过本站链接选购套餐，我们可能会从服务商处获得一笔微薄的推荐佣金以维持本站日常运营。这笔佣金完全由服务商承担，**绝不会增加您的任何购买金额**（在结账页输入本站专属优惠码还可享受现金直减特惠）。',
  ':::',
  '',
  '## 快速前往合作服务商官网',
  '',
  brandListLinks,
  ''
].join('\n')

fs.writeFileSync(path.join(goDir, 'index.md'), rootContent, 'utf8')
console.log('Successfully generated go pages for', providers.length, 'brands!')
