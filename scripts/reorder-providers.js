import fs from 'fs'
import path from 'path'

const providersPath = path.resolve('docs/.vitepress/data/providers.json')
let list = JSON.parse(fs.readFileSync(providersPath, 'utf8'))

// 1. Add "大佬云" if not present
const dalaoExists = list.find(x => x.slug === 'dalao' || x.name.includes('大佬'))
const dalaoData = {
  name: '大佬云',
  slug: 'dalao',
  relationship: 'partner',
  affUrl: '/go/dalao/',
  coupon: 'dly888',
  couponDiscount: '7折',
  plans: [
    {
      name: '初云 · 入门版',
      traffic: '120 GB',
      monthly: '¥23.00',
      quarterly: '¥66.00',
      annual: '¥228.00',
      oneTime: null
    },
    {
      name: '凌云 · 基础版',
      traffic: '300 GB',
      monthly: '¥43.00',
      quarterly: '¥123.00',
      annual: '¥408.00',
      oneTime: null
    },
    {
      name: '御云 · 高级版',
      traffic: '600 GB',
      monthly: '¥73.00',
      quarterly: '¥210.00',
      annual: '¥696.00',
      oneTime: null
    },
    {
      name: '年付活动包',
      traffic: '60 GB',
      monthly: null,
      quarterly: null,
      annual: '¥96.00',
      oneTime: null
    },
    {
      name: '闲云 · 随心包',
      traffic: '78 GB',
      monthly: null,
      quarterly: null,
      annual: null,
      oneTime: '¥99.00'
    },
    {
      name: '悠云 · 长享包',
      traffic: '160 GB',
      monthly: null,
      quarterly: null,
      annual: null,
      oneTime: '¥199.00'
    }
  ],
  features: [
    '全IPLC专线，低延迟高速率',
    '不限制同时在线设备数',
    '周期订阅全节点x1倍率，单节点最高2.5Gbps',
    '原生IP解锁 Netflix、Disney+、ChatGPT、TikTok'
  ],
  aiSupport: '支持 ChatGPT、Claude 等主流 AI',
  streamingSupport: '支持 Netflix / Disney+ / TikTok 等流媒体',
  clientSupport: '不限设备同时在线',
  bestFor: [
    '专线低延迟',
    '多设备不限',
    '大流量',
    '不限时套餐',
    'AI生产力',
    '4K流媒体'
  ],
  updatedAt: '2026-10-09',
  logo: '/images/logos/dalao.webp',
  targetUrl: 'https://a01vipaff.dalaoyunaff.com/#/?code=4hRU02Tt'
}

if (!dalaoExists) {
  list.push(dalaoData)
}

// 2. The user specified top priority order:
// 飞V, 暮光, 微风, 飞猫, 大佬, firefly, 灵猫, 闪跃, 无忧, 跨界, SOGO 云, 灵动云, 隐形人
const prioritySlugs = [
  'feiv',           // 飞V
  'muguangjiasu',   // 暮光加速
  'weifengwangluo', // 微风网络
  'feimaoyun',      // 飞猫云
  'dalao',          // 大佬云
  'firefly',        // firefly
  'lingmao',        // 灵猫
  'shanyue',        // 闪跃
  'wuyoulianjie',   // 无忧链接
  'kuajieyun',      // 跨界云
  'sogoyun',        // SOGO 云
  'lingdongyun',    // 灵动云
  'yinxingren'      // 隐形人
]

const orderedList = []

// Add priority ones first in exact specified order
for (const slug of prioritySlugs) {
  const item = list.find(x => x.slug === slug)
  if (item) {
    orderedList.push(item)
  } else {
    console.warn('Could not find item with slug:', slug)
  }
}

// Add remaining ones
for (const item of list) {
  if (!prioritySlugs.includes(item.slug)) {
    orderedList.push(item)
  }
}

console.log('Total ordered providers:', orderedList.length)
console.log('Top 9 ordered providers:', orderedList.slice(0, 9).map((x, i) => `${i + 1}. ${x.name} (${x.slug})`).join(', '))

fs.writeFileSync(providersPath, JSON.stringify(orderedList, null, 2), 'utf8')
console.log('Updated docs/.vitepress/data/providers.json successfully!')
