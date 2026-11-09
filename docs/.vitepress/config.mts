import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, type HeadConfig } from 'vitepress'
import providers from './data/providers.json'

// 推广链接：品牌推广域名、官网下载地址与站内 /go/ 跳转页
const AFF_HOSTS = new Set(
  providers
    .flatMap((p: { targetUrl?: string; macDownload?: string }) => [p.targetUrl, p.macDownload])
    .map((u) => { try { return new URL(u as string).host } catch { return '' } })
    .filter(Boolean)
)
const AFF_REL = 'nofollow noopener noreferrer sponsored'
const isAffHref = (href: string) => {
  if (/^\/go\/[a-z]/.test(href)) return true
  try {
    const u = new URL(href.replace(/&amp;/g, '&'))
    // 品牌推广域名，或带邀请码的注册链接
    return AFF_HOSTS.has(u.host) || /[?&#].*code=/.test(u.search + u.hash)
  } catch { return false }
}
// 给 <a> 标签补上新窗口打开与 nofollow / sponsored
const fixAffTag = (tag: string) => {
  const href = (tag.match(/href="([^"]*)"/) || [])[1] || ''
  if (!isAffHref(href)) return tag
  return tag
    .replace(/\s+(target|rel)="[^"]*"/g, '')
    .replace(/>$/, ` target="_blank" rel="${AFF_REL}">`)
}
const fixAffHtml = (html: string) => html.replace(/<a\b[^>]*>/g, fixAffTag)

// 官方正式生产域名配置
const SITE_URL = process.env.SITE_URL || 'https://jichang-vpn.com'

// ---------- Sitemap：按栏目设定优先级与更新频率，并附上页面里的图片 ----------
const DOCS_DIR = fileURLToPath(new URL('..', import.meta.url))
type ChangeFreq = 'daily' | 'weekly' | 'monthly' | 'yearly'
const SITEMAP_RULES: [RegExp, number, ChangeFreq][] = [
  [/^$/, 1.0, 'daily'],
  [/^recommendations\/$/, 0.9, 'weekly'],
  [/^brands\/$/, 0.9, 'weekly'],
  [/^brands\//, 0.8, 'weekly'],
  [/^tools\/(free-us-apple-id|coupon-center)$/, 0.8, 'weekly'],
  [/^blog\/feiv-double-eleven/, 0.8, 'daily'],
  [/^tools\//, 0.7, 'monthly'],
  [/^blog\/daily-monitor/, 0.5, 'monthly'],
  [/^(blog|guides|clash|vpn)\/$/, 0.7, 'weekly'],
  [/^(blog|guides|clash|vpn)\//, 0.6, 'monthly'],
  [/^(about|privacy)\/$/, 0.3, 'yearly']
]
const sitemapRule = (url: string) => SITEMAP_RULES.find(([re]) => re.test(url)) || [null, 0.5, 'monthly' as ChangeFreq]
// 找到网址对应的 Markdown 源文件，取出文中引用的站内图片
const sourceOf = (url: string) =>
  [`${url}.md`, `${url}index.md`, `${url}/index.md`].map((p) => path.join(DOCS_DIR, p)).find((p) => fs.existsSync(p))
const imagesOf = (url: string) => {
  const file = sourceOf(url)
  if (!file) return []
  const src = fs.readFileSync(file, 'utf8')
  const found = [
    ...[...src.matchAll(/!\[[^\]]*\]\((\/images\/[^)\s]+)/g)].map((m) => m[1]),
    ...[...src.matchAll(/<img[^>]*\ssrc="(\/images\/[^"]+)"/g)].map((m) => m[1])
  ]
  return [...new Set(found)]
    .filter((p) => fs.existsSync(path.join(DOCS_DIR, 'public', p)))
    .map((p) => ({ url: SITE_URL + encodeURI(p) }))
}
const SITE_NAME = '机场VPN'
const DEFAULT_DESC = '机场VPN - 专注于网络传输协议、网络节点工具选型与技术实战的中文博客与 Wiki 知识库'
const OG_IMAGE_URL = `${SITE_URL}/images/og-image.jpg`

export default defineConfig({
  lang: 'zh-CN',
  title: SITE_NAME,
  description: DEFAULT_DESC,
  cleanUrls: true,

  // 推广链接统一加 target="_blank" rel="nofollow noopener noreferrer sponsored"
  markdown: {
    config(md) {
      // 在整篇 Markdown 渲染完成后处理，避免被 VitePress 自带的链接规则覆盖
      const render = md.render.bind(md)
      md.render = (src, env) => fixAffHtml(render(src, env))
    }
  },
  lastUpdated: true,

  // XML Sitemap 自动生成（依赖生产域名）
  sitemap: {
    hostname: SITE_URL,
    // 跳转页 /go/ 已设 noindex，不放进 sitemap；其余页面补上优先级、更新频率和图片
    transformItems: (items) =>
      items
        .filter((item) => !/^\/?(go(\/|$)|404)/.test(item.url))
        .map((item) => {
          const url = item.url.replace(/^\//, '')
          const [, priority, changefreq] = sitemapRule(url)
          const img = imagesOf(url)
          return { ...item, priority, changefreq, ...(img.length ? { img } : {}) }
        })
        .sort((a, b) => b.priority - a.priority || a.url.localeCompare(b.url))
  },

  head: [
    ['link', { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' }],
    ['meta', { name: 'theme-color', content: '#2563eb' }],
    ['meta', { name: 'author', content: '技术编辑部' }],
    ['meta', { name: 'robots', content: 'index, follow' }],
    ['meta', { property: 'og:image', content: OG_IMAGE_URL }],
    ['meta', { property: 'og:image:width', content: '1200' }],
    ['meta', { property: 'og:image:height', content: '630' }],
    ['meta', { property: 'og:image:type', content: 'image/jpeg' }],
    ['meta', { name: 'twitter:image', content: OG_IMAGE_URL }]
  ],

  // 针对技术 SEO：静态注入 Canonical、Open Graph、Twitter Card 及 JSON-LD 结构化数据
  transformHead(context) {
    const { pageData, siteData } = context
    const cleanPath = pageData.relativePath === 'index.md'
      ? '/'
      : '/' + pageData.relativePath.replace(/((^|\/)index)?\.md$/, '$2')

    const pageUrl = `${SITE_URL}${cleanPath}`
    // 与 VitePress 保持一致：titleTemplate: false 的页面直接使用自带站名的标题
    const pageTitle = !pageData.title
      ? siteData.title
      : pageData.frontmatter.titleTemplate === false
        ? pageData.title
        : `${pageData.title} | ${siteData.title}`
    const pageDescription = pageData.description || siteData.description
    // Keywords：优先 frontmatter.keywords，其次 tags
    const fmKeywords = pageData.frontmatter.keywords ?? pageData.frontmatter.tags
    const pageKeywords = Array.isArray(fmKeywords) ? fmKeywords.join(', ') : (fmKeywords || '')

    const heads: HeadConfig[] = [
      ...(pageKeywords ? [['meta', { name: 'keywords', content: pageKeywords }] as HeadConfig] : []),
      // 自引用 Canonical
      ['link', { rel: 'canonical', href: pageUrl }],

      // Open Graph 元标记
      ['meta', { property: 'og:type', content: pageData.frontmatter.layout === 'home' ? 'website' : 'article' }],
      ['meta', { property: 'og:site_name', content: siteData.title }],
      ['meta', { property: 'og:title', content: pageTitle }],
      ['meta', { property: 'og:description', content: pageDescription }],
      ['meta', { property: 'og:url', content: pageUrl }],
      ['meta', { property: 'og:locale', content: 'zh_CN' }],

      // Twitter Cards 元标记
      ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
      ['meta', { name: 'twitter:title', content: pageTitle }],
      ['meta', { name: 'twitter:description', content: pageDescription }],
      ['meta', { property: 'og:image', content: OG_IMAGE_URL }],
      ['meta', { property: 'og:image:alt', content: pageTitle }],
      ['meta', { property: 'og:image:type', content: 'image/jpeg' }],
      ['meta', { property: 'og:image:width', content: '1200' }],
      ['meta', { property: 'og:image:height', content: '630' }],
      ['meta', { name: 'twitter:image', content: OG_IMAGE_URL }],
      ['meta', { name: 'twitter:image:alt', content: pageTitle }]
    ]

    // 结构化数据：BreadcrumbList (面包屑)
    const breadcrumbItems = [
      {
        '@type': 'ListItem',
        position: 1,
        name: '首页',
        item: SITE_URL + '/'
      }
    ]

    const pathSegments = cleanPath.split('/').filter(Boolean)
    if (pathSegments.length > 0) {
      let currentPath = SITE_URL
      pathSegments.forEach((segment, index) => {
        currentPath += `/${segment}`
        const segmentName = getSectionName(segment) || pageData.title || segment
        breadcrumbItems.push({
          '@type': 'ListItem',
          position: index + 2,
          name: index === pathSegments.length - 1 && pageData.title ? pageData.title : segmentName,
          item: currentPath
        })
      })
    }

    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbItems
    }

    heads.push([
      'script',
      { type: 'application/ld+json' },
      JSON.stringify(breadcrumbSchema)
    ])

    // 文章与技术文章结构化数据 (Article / TechArticle)
    const isArticlePage = cleanPath.startsWith('/blog/') ||
      cleanPath.startsWith('/clash/') ||
      cleanPath.startsWith('/vpn/') ||
      cleanPath.startsWith('/guides/') ||
      cleanPath.startsWith('/brands/')

    if (isArticlePage && pageData.relativePath !== 'index.md' && !pageData.relativePath.endsWith('/index.md')) {
      const articleSchema = {
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        headline: pageData.title || SITE_NAME,
        description: pageDescription,
        url: pageUrl,
        inLanguage: 'zh-CN',
        author: {
          '@type': 'Organization',
          name: '机场VPN 团队'
        },
        publisher: {
          '@type': 'Organization',
          name: SITE_NAME,
          url: SITE_URL
        },
        datePublished: pageData.frontmatter.date || '2026-01-01',
        dateModified: pageData.frontmatter.lastUpdated || pageData.frontmatter.date || '2026-01-01',
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': pageUrl
        }
      }

      heads.push([
        'script',
        { type: 'application/ld+json' },
        JSON.stringify(articleSchema)
      ])
    }

    return heads
  },

  themeConfig: {
    siteTitle: '机场VPN',
    logo: { src: '/favicon.svg', alt: '机场VPN' },

    nav: [
      { text: '首页', link: '/' },
      { text: '机场推荐', link: '/recommendations/' },
      { text: '品牌资料', link: '/brands/' },
      {
        text: '实用工具',
        items: [
          { text: '工具箱总览 (8大工具)', link: '/tools/' },
          { text: '套餐智能筛选器', link: '/tools/plan-filter' },
          { text: '流量倍率计算器', link: '/tools/multiplier-calculator' },
          { text: '优惠码查询中心', link: '/tools/coupon-center' },
          { text: '订阅链接格式检查器', link: '/tools/subscription-checker' },
          { text: '品牌横向多维对比', link: '/tools/brand-comparator' },
          { text: 'AI / 流媒体解锁查询', link: '/tools/unlock-checker' },
          { text: '行业动态时间线', link: '/tools/timeline' },
          { text: '免费美区 Apple ID', link: '/tools/free-us-apple-id' }
        ]
      },
      { text: 'VPN 知识', link: '/vpn/' },
      { text: 'Clash 教程', link: '/clash/' },
      { text: '综合指南', link: '/guides/' },
      { text: '博客文章', link: '/blog/' },
      {
        text: '关于',
        items: [
          { text: '关于本站', link: '/about/' },
          { text: '隐私政策', link: '/privacy/' }
        ]
      }
    ],

    sidebar: {
      '/recommendations/': [
        {
          text: '机场与线路选型',
          items: [
            { text: '10月精选机场推荐', link: '/recommendations/' },
            { text: '飞V', link: '/brands/feiv' },
            { text: '暮光加速', link: '/brands/muguangjiasu' },
            { text: '微风网络', link: '/brands/weifengwangluo' },
            { text: '飞猫云', link: '/brands/feimaoyun' },
            { text: '大佬云', link: '/brands/dalao' },
            { text: 'firefly', link: '/brands/firefly' },
            { text: '灵猫', link: '/brands/lingmao' },
            { text: '闪跃', link: '/brands/shanyue' },
            { text: '无忧链接', link: '/brands/wuyoulianjie' },
            { text: '跨界云', link: '/brands/kuajieyun' },
            { text: 'SOGO 云', link: '/brands/sogoyun' },
            { text: '灵动云', link: '/brands/lingdongyun' },
            { text: '隐形人', link: '/brands/yinxingren' }
          ]
        },
        {
          text: '全量品牌资料库',
          items: [
            { text: '查看全部 13 家品牌资料 →', link: '/brands/' }
          ]
        }
      ],
      '/brands/': [
        {
          text: '品牌技术档案库',
          items: [
            { text: '品牌库总览（9 大主力 + 4 家重点）', link: '/brands/' }
          ]
        },
        {
          text: '9大主力精选品牌',
          collapsed: false,
          items: [
            { text: '飞V', link: '/brands/feiv' },
            { text: '暮光加速', link: '/brands/muguangjiasu' },
            { text: '微风网络', link: '/brands/weifengwangluo' },
            { text: '飞猫云', link: '/brands/feimaoyun' },
            { text: '大佬云', link: '/brands/dalao' },
            { text: 'firefly', link: '/brands/firefly' },
            { text: '灵猫', link: '/brands/lingmao' },
            { text: '闪跃', link: '/brands/shanyue' },
            { text: '无忧链接', link: '/brands/wuyoulianjie' }
          ]
        },
        {
          text: '重点精选品牌 (4家)',
          collapsed: false,
          items: [
            { text: '跨界云', link: '/brands/kuajieyun' },
            { text: 'SOGO 云', link: '/brands/sogoyun' },
            { text: '灵动云', link: '/brands/lingdongyun' },
            { text: '隐形人', link: '/brands/yinxingren' }
          ]
        }
      ],
      '/vpn/': [
        {
          text: 'VPN 与协议知识全景',
          items: [
            { text: '协议知识全景框架', link: '/vpn/' }
          ]
        },
        {
          text: '核心认知与避坑专题',
          collapsed: false,
          items: [
            { text: 'VPN 与机场有什么区别？', link: '/blog/vpn-vs-airport-difference' },
            { text: '找机场订阅链接怎么用？为什么没有？', link: '/vpn/custom-client-vs-open-source' },
            { text: '海外商业 VPN 为何频繁失效？', link: '/vpn/why-commercial-vpns-fail' },
            { text: '免费 VPN 致命陷阱与隐私风险', link: '/vpn/free-vpn-risks' },
            { text: '游戏加速器 vs 专线机场选型', link: '/vpn/game-accelerator-vs-proxy' }
          ]
        },
        {
          text: '专线技术与协议演进',
          collapsed: false,
          items: [
            { text: '什么是 IPLC / IEPL 专线？', link: '/vpn/iplc-iepl-explained' },
            { text: '原生 IP 与流媒体/AI 解锁机理', link: '/vpn/streaming-ai-unlock' },
            { text: '协议横向对比与技术矩阵', link: '/vpn/protocol-guide' },
            { text: 'WireGuard vs 传统 VPN', link: '/vpn/wireguard-vs-traditional' },
            { text: 'Hysteria2 弱网加速专题', link: '/vpn/quic-hysteria' }
          ]
        }
      ],
      '/clash/': [
        {
          text: 'Clash 核心框架与运行原理',
          items: [
            { text: 'Clash 客户端与知识全景', link: '/clash/' },
            { text: '为什么品牌不提供 Clash 订阅？(专属/Nextin)', link: '/clash/why-custom-clients-over-clash' },
            { text: 'Clash 停更后用什么？2026 选型', link: '/clash/clash-alternatives-2026' },
            { text: 'TUN 模式深度解析 (游戏/Git必备)', link: '/clash/tun-mode-explained' }
          ]
        },
        {
          text: '全平台客户端实战教程',
          collapsed: false,
          items: [
            { text: 'Clash Verge Rev 新手实操 (Win/Mac)', link: '/blog/clash-verge-rev-install-subscription-guide' },
            { text: 'Android 安卓端 CMFA vs Flclash', link: '/clash/android-client-guide' },
            { text: 'iOS 苹果端小火箭与 Stash 指南', link: '/clash/ios-shadowrocket-stash' }
          ]
        },
        {
          text: '规则编排与排错进阶',
          collapsed: false,
          items: [
            { text: '连不上/超时/网页打不开排错', link: '/clash/troubleshooting-guide' },
            { text: '分流规则与策略组深度指南', link: '/clash/config-rules' },
            { text: 'Fake-IP 与 DNS 泄露防范实战', link: '/clash/dns-leak-prevention' }
          ]
        }
      ],
      '/guides/': [
        {
          text: '综合教程中心',
          items: [
            { text: '教程中心总览', link: '/guides/' },
            { text: '品牌客户端通用工作流', link: '/guides/brand-tutorials-framework' },
            { text: 'Windows 专属客户端图文教程', link: '/guides/brand-windows-guide' },
            { text: 'macOS 专属客户端图文教程', link: '/guides/brand-mac-guide' },
            { text: 'Android 专属客户端图文教程', link: '/guides/brand-android-guide' },
            { text: 'iOS 苹果端 Nextin 教程', link: '/guides/brand-nextin-ios-guide' }
          ]
        },
        {
          text: '主推品牌实战教程 (9大品牌)',
          collapsed: false,
          items: [
            { text: '暮光加速上手教程', link: '/guides/muguang-guide' },
            { text: '微风网络上手教程', link: '/guides/weifeng-guide' },
            { text: '飞猫云上手教程', link: '/guides/feimao-guide' },
            { text: '大佬云上手教程', link: '/guides/dalao-guide' },
            { text: 'firefly 上手教程', link: '/guides/firefly-guide' },
            { text: '灵猫上手教程', link: '/guides/lingmao-guide' },
            { text: '闪跃上手教程', link: '/guides/shanyue-guide' },
            { text: '无忧链接上手教程', link: '/guides/wuyou-guide' },
            { text: '跨界云上手教程', link: '/guides/kuajie-guide' }
          ]
        },
        {
          text: 'VPN 核心与网络调优教程',
          collapsed: false,
          items: [
            { text: '跨平台网络诊断与延迟排错', link: '/guides/network-optimization' },
            { text: 'MTU 参数调优与防断流实战', link: '/guides/mtu-latency-tuning' },
            { text: '全平台 DNS 泄露检测与修复', link: '/guides/dns-leak-test-guide' }
          ]
        },
        {
          text: 'Clash 与客户端进阶实战',
          collapsed: false,
          items: [
            { text: 'TUN 虚拟网卡模式实操指南', link: '/guides/clash-tun-setup-guide' },
            { text: '家庭软路由旁路由透明网关', link: '/guides/router-gateway-guide' }
          ]
        }
      ],
      '/blog/': [
        {
          text: '📰 行业动态与每日简报',
          collapsed: false,
          items: [
            { text: '每日监控简报 · 10/30', link: '/blog/daily-monitor-2026-10-30' },
            { text: '每日监控简报 · 10/29', link: '/blog/daily-monitor-2026-10-29' },
            { text: '每日监控简报 · 10/27', link: '/blog/daily-monitor-2026-10-27' }
          ]
        },
        {
          text: '梯子与科学上网大词专题',
          collapsed: false,
          items: [
            { text: '2026 梯子推荐与科学上网工具选型', link: '/blog/ladder-vpn-proxy-recommendation-guide' },
            { text: '机场和 VPN 有什么区别？新手怎么选', link: '/blog/vpn-vs-airport-difference' },
            { text: '机场新手入门：从选套餐到连接成功', link: '/blog/airport-beginner-getting-started-guide' },
            { text: '机场怎么选？购买前检查这几个项目', link: '/blog/how-to-choose-airport-checklist' }
          ]
        },
        {
          text: '客户端专属订阅选型',
          collapsed: false,
          items: [
            { text: 'Clash 机场推荐：适合 Verge Rev 与 Mihomo', link: '/blog/clash-airport-recommendations' },
            { text: 'Shadowrocket 小火箭机场推荐', link: '/blog/shadowrocket-airport-recommendations' },
            { text: 'v2rayN 与 sing-box / Stash 机场推荐', link: '/blog/v2rayn-singbox-stash-airport-guide' },
            { text: 'Clash Verge Rev 安装与订阅导入教程', link: '/blog/clash-verge-rev-install-subscription-guide' },
            { text: 'Android 手机如何导入机场订阅', link: '/blog/android-airport-subscription-guide' },
            { text: 'iPhone 如何使用机场订阅', link: '/blog/iphone-ios-airport-subscription-guide' },
            { text: '机场订阅导入失败报错排查手册', link: '/blog/airport-subscription-import-failed-troubleshooting' }
          ]
        },
        {
          text: '套餐计费与折扣选型',
          collapsed: false,
          items: [
            { text: '2026 机场优惠码与折扣码领取指南', link: '/blog/airport-coupons-discounts-guide' },
            { text: '按量计费与不限时机场推荐', link: '/blog/pay-as-you-go-no-expiry-airport-guide' },
            { text: '高性价比与便宜机场选型避坑', link: '/blog/budget-cheap-airport-selection-guide' },
            { text: '一元机场与一分机场深度实测', link: '/blog/yiyuan-jichang-nanocloud-phantom-guide' },
            { text: '月付、年付和不限时流量包怎么选', link: '/blog/billing-cycles-comparison-guide' },
            { text: '2026 黑五 VPN 与专线机场对比', link: '/blog/black-friday-vpn-vs-airport-guide' }
          ]
        },
        {
          text: '线路架构与场景专线',
          collapsed: false,
          items: [
            { text: '专线机场选型：IPLC、IEPL 与中转区别', link: '/blog/iplc-iepl-dedicated-line-airport-guide' },
            { text: 'ChatGPT 与 Claude 生产力机场推荐', link: '/blog/chatgpt-claude-ai-airport-guide' },
            { text: 'Claude/AI 封号与原生 IP 避坑', link: '/blog/ai-account-ban-native-ip-guide' },
            { text: '流媒体解锁机场推荐：Netflix / Disney+', link: '/blog/streaming-netflix-disney-unlock-airport-guide' },
            { text: 'TikTok 与跨境电商外贸专线机场', link: '/blog/tiktok-cross-border-ecommerce-airport-guide' },
            { text: '2026 协议演进趋势 (QUIC/HTTP3)', link: '/blog/2026-tech-trends' }
          ]
        },
        {
          text: '长尾问题排查与运维自救',
          collapsed: false,
          items: [
            { text: '节点全红、显示超时或断连怎么办', link: '/blog/airport-nodes-all-red-timeout-fix-guide' },
            { text: '机场节点地区怎么选？五大地区对比', link: '/blog/how-to-choose-airport-node-locations-guide' },
            { text: '机场测速为什么和实际体验不一样', link: '/blog/airport-speed-test-tools-and-real-experience-guide' },
            { text: '机场跑路前兆识别与备用容灾策略', link: '/blog/airport-exit-scam-signs-and-disaster-recovery-guide' },
            { text: '机场在线设备数与账号共享规则', link: '/blog/airport-device-limit-and-account-sharing-guide' },
            { text: '节点有延迟但打不开网页怎么办', link: '/blog/node-has-latency-cannot-open-webpage-fix' },
            { text: '机场速度慢怎么办？如何判断问题在哪', link: '/blog/airport-slow-speed-troubleshooting' },
            { text: '机场为什么突然变慢？（动图图解）', link: '/blog/why-network-slow-peak-holiday-weather' }
          ]
        }
      ],
      '/tools/': [
        {
          text: '实用网络工具箱',
          collapsed: false,
          items: [
            { text: '工具箱总览 (8大工具)', link: '/tools/' },
            { text: '机场套餐智能筛选器', link: '/tools/plan-filter' },
            { text: '机场流量倍率计算器', link: '/tools/multiplier-calculator' },
            { text: '机场优惠码查询中心', link: '/tools/coupon-center' },
            { text: '订阅链接格式检查器', link: '/tools/subscription-checker' },
            { text: '机场品牌多维对比工具', link: '/tools/brand-comparator' },
            { text: 'AI / 流媒体解锁查询', link: '/tools/unlock-checker' },
            { text: '行业动态时间线', link: '/tools/timeline' },
            { text: '免费美区 Apple ID 共享', link: '/tools/free-us-apple-id' }
          ]
        },
        {
          text: '配套选型与排错指南',
          collapsed: false,
          items: [
            { text: '机场购买前检查清单', link: '/blog/how-to-choose-airport-checklist' },
            { text: '月付年付与不限时模型', link: '/blog/billing-cycles-comparison-guide' },
            { text: '机场和 VPN 深度区别', link: '/blog/vpn-vs-airport-difference' },
            { text: '机场速度慢排查实战', link: '/blog/airport-slow-speed-troubleshooting' },
            { text: '订阅导入失败排查手册', link: '/blog/airport-subscription-import-failed-troubleshooting' }
          ]
        }
      ]
    },

    search: {
      provider: 'local',
      options: {
        translations: {
          button: {
            buttonText: '搜索文档与文章',
            buttonAriaLabel: '搜索文档与文章'
          },
          modal: {
            noResultsText: '未找到相关结果',
            resetButtonTitle: '清除搜索条件',
            footer: {
              selectText: '选择',
              navigateText: '切换',
              closeText: '关闭'
            }
          }
        }
      }
    },

    outline: {
      level: [2, 3],
      label: '本页目录'
    },

    docFooter: {
      prev: '上一篇',
      next: '下一篇'
    },

    lastUpdated: {
      text: '最后更新于'
    },

    darkModeSwitchLabel: '深色外观',
    lightModeSwitchTitle: '切换为浅色模式',
    darkModeSwitchTitle: '切换为深色模式',
    returnToTopLabel: '返回顶部',
    sidebarMenuLabel: '目录菜单',

    notFound: {
      title: '看来你进入到错误页面',
      quote: '您访问的页面不存在或已被移除。不用担心，请参考下方全站网站地图快速找到所需内容。',
      linkLabel: '返回网站首页',
      linkText: '返回网站首页'
    }
  }
})

function getSectionName(segment: string): string {
  const map: Record<string, string> = {
    recommendations: '机场推荐',
    brands: '品牌资料',
    vpn: 'VPN 知识',
    clash: 'Clash 教程',
    guides: '综合指南',
    blog: '博客文章',
    about: '关于本站',
    privacy: '隐私政策'
  }
  return map[segment] || segment
}
