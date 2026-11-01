import fs from 'fs'
import path from 'path'

const filePath = path.resolve('docs/.vitepress/data/providers.json')
const providers = JSON.parse(fs.readFileSync(filePath, 'utf8'))

for (const p of providers) {
  // 1. Replace bestFor tags
  if (p.bestFor) {
    p.bestFor = p.bestFor.map(tag => {
      if (tag === '4K流媒体') return '流媒体解锁'
      return tag
    })
  }

  // 2. Clean features
  if (p.features) {
    p.features = p.features.map(f => {
      let str = f
      // Replace typical exaggerated slogans
      str = str.replace(/4K流畅Netfilx\/Hulu\/Hbo\/Disney\+\/HUGO等观影体验/g, '支持 Netflix、Hulu、Disney+ 等主流海外流媒体播放')
      str = str.replace(/Netflix \/ Hulu \/ HBO \/ Disney\+ \/ DAZN 等主流流媒体完整解锁，4K 即点即播，支持 8K 资源/g, '支持 Netflix、Disney+、HBO 等主流海外流媒体超清播放')
      str = str.replace(/智能负载｜晚高峰不限速｜4K 秒开/g, '智能负载均衡，晚高峰网络调优，支持主流海外流媒体播放')
      str = str.replace(/Netflix \/ Disney\+ \/ HBO \/ DAZN 全平台解锁秒开/g, '支持 Netflix、Disney+、HBO 等主流海外流媒体播放')
      str = str.replace(/全球主流流媒体与内容平台全解锁，4K \/ 8K 稳定播放/g, '支持主流流媒体与多媒体平台超清播放')
      str = str.replace(/全能解锁｜全线解锁海外流媒体，4K 秒开，完美兼容 8K/g, '全线路优化，支持主流海外流媒体超清播放')
      str = str.replace(/4K 秒开/g, '超清播放')
      str = str.replace(/4K流畅/g, '支持超清播放')
      str = str.replace(/秒开/g, '快速加载')
      return str
    })
  }

  // 3. Clean streamingSupport if needed
  if (p.streamingSupport) {
    p.streamingSupport = p.streamingSupport.replace(/4K/g, '超清')
  }
}

fs.writeFileSync(filePath, JSON.stringify(providers, null, 2), 'utf8')
console.log('Successfully refined marketing wording in providers.json!')
