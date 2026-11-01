import fs from 'fs'
import path from 'path'

const providers = JSON.parse(fs.readFileSync('docs/.vitepress/data/providers.json', 'utf8'))
const editorial = JSON.parse(fs.readFileSync('docs/.vitepress/data/brand-editorial.json', 'utf8'))
const brandsDir = path.resolve('docs/brands')
const REVIEWED_AT = '2026-11-01'

if (!fs.existsSync(brandsDir)) {
  fs.mkdirSync(brandsDir, { recursive: true })
}

// 各品牌客户端教程
const GUIDES = {
  dalao: '/guides/dalao-guide',
  feimaoyun: '/guides/feimao-guide',
  firefly: '/guides/firefly-guide',
  kuajieyun: '/guides/kuajie-guide',
  lingmao: '/guides/lingmao-guide',
  muguangjiasu: '/guides/muguang-guide',
  shanyue: '/guides/shanyue-guide',
  weifengwangluo: '/guides/weifeng-guide',
  wuyoulianjie: '/guides/wuyou-guide'
}

const num = (v) => {
  if (v == null) return null
  const n = parseFloat(String(v).replace(/[¥,\s]/g, ''))
  return Number.isFinite(n) ? n : null
}
// "150 GB" / "1.8TB" / "65 GB/月" → GB
const gb = (t) => {
  const m = String(t || '').match(/([\d.]+)\s*(TB|GB|G)/i)
  if (!m) return null
  return parseFloat(m[1]) * (/T/i.test(m[2]) ? 1000 : 1)
}
const yuan = (n) => '¥' + (Math.round(n * 100) / 100).toLocaleString('zh-CN', { maximumFractionDigits: 2 })
const perGb = (n) => `¥${n < 0.1 ? n.toFixed(3) : n.toFixed(2)}/GB`
// "8折" → 0.8, "85折" → 0.85
const discountRate = (d) => {
  const m = String(d || '').match(/(\d+(?:\.\d+)?)\s*折/)
  if (!m) return null
  const v = parseFloat(m[1])
  return v >= 10 ? v / 100 : v / 10
}
const list = (arr) => arr.map((t) => `- ${t}`).join('\n')
const SECTION = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十']
const h2 = (i, text, en) => `## ${SECTION[i]}、${text}（${en}）`
const CLIENT_LABEL = { 'official-only': '官方客户端（订阅防泄露）', subscription: '支持订阅（Clash / 小火箭）', official: '官方客户端' }
const TOP_PICK = 'feiv'

// 每个品牌的入门月付（折后）与客户端类型，用于「和同类品牌比」
const isRegular = (p) => !/定制|独享|专线/.test(p.name)
const entryOf = (p) => {
  const ms = (p.plans || []).map((x) => ({ m: num(x.monthly), g: gb(x.traffic), name: x.name }))
    .filter((x) => x.m && x.g && isRegular(x))
  if (!ms.length) return null
  const c = ms.sort((a, b) => a.m - b.m)[0]
  const r = discountRate(p.couponDiscount) || 1
  return { ...c, net: c.m * r }
}
const summary = Object.fromEntries(providers.map((p) => [p.slug, { p, entry: entryOf(p) }]))

// Generate one third-party brand article per provider. Facts come from providers.json
// (compiled from each brand's official site); opinions come from brand-editorial.json.
for (const item of providers) {
  const filePath = path.join(brandsDir, `${item.slug}.md`)
  // 手工维护的品牌页（frontmatter 含 manual: true）不覆盖
  if (fs.existsSync(filePath) && /^manual:\s*true\s*$/m.test(fs.readFileSync(filePath, 'utf8').split(/\n---/)[0])) {
    console.log(`Skip manual page: ${item.slug}`)
    continue
  }
  const ed = editorial[item.slug]
  if (!ed) {
    console.log(`No editorial for ${item.slug}, skipped`)
    continue
  }
  const name = item.name
  const fullName = ed.nameAlt ? `${name}（${ed.nameAlt}）` : name
  const updatedAt = item.updatedAt || '2026-10-27'
  const hasLogo = item.logo && fs.existsSync(path.join('docs/public', item.logo))
  const plans = item.plans || []
  const rate = discountRate(item.couponDiscount)

  // ---------- Pricing analysis ----------
  const monthlyPlans = plans
    .map((p) => ({ ...p, m: num(p.monthly), g: gb(p.traffic) }))
    .filter((p) => p.m && p.g && !/定制|独享|专线/.test(p.name))
  const cheapest = [...monthlyPlans].sort((a, b) => a.m - b.m)[0]
  const bestValue = [...monthlyPlans].sort((a, b) => a.m / a.g - b.m / b.g)[0]
  const cycleRates = { quarterly: [], semiannual: [], annual: [] }
  const pricierCycles = []
  for (const p of plans) {
    const g = gb(p.traffic)
    // 同一套餐的月付价；季付/年付单独成档的品牌，按相同流量找对应的月付档
    const m = num(p.monthly) || monthlyPlans.find((x) => x.g === g)?.m
    if (!m || !g || /定制|独享|专线/.test(p.name)) continue
    for (const [k, months, label] of [['quarterly', 3, '季付'], ['semiannual', 6, '半年付'], ['annual', 12, '年付']]) {
      const v = num(p[k])
      if (!v) continue
      const r = v / (m * months)
      if (r > 1.001) pricierCycles.push(`「${p.name}」${label} ${yuan(v)}，高于按月付 ${months} 个月的 ${yuan(m * months)}`)
      else cycleRates[k].push(r)
    }
  }
  const rateText = (arr) => {
    if (!arr.length) return null
    const lo = Math.min(...arr), hi = Math.max(...arr)
    const f = (r) => `${Math.round(r * 100)}%`
    return lo === hi || Math.abs(hi - lo) < 0.01 ? `约为月付总价的 ${f(lo)}` : `约为月付总价的 ${f(lo)}~${f(hi)}`
  }
  const oneTimePlans = plans.map((p) => ({ ...p, o: num(p.oneTime), g: gb(p.traffic) })).filter((p) => p.o && p.g && !/定制/.test(p.name))
  const unpriced = plans.filter((p) => !['monthly', 'quarterly', 'semiannual', 'annual', 'oneTime'].some((k) => num(p[k])))

  const priceNotes = []
  if (cheapest) {
    priceNotes.push(`**入门门槛**：最便宜的月付套餐是「${cheapest.name}」，${cheapest.traffic} / ${yuan(cheapest.m)}（约 ${perGb(cheapest.m / cheapest.g)}）${rate ? `，用优惠码后约 ${yuan(cheapest.m * rate)}` : ''}。`)
  }
  if (bestValue && bestValue !== cheapest) {
    priceNotes.push(`**单价最低的月付档**：「${bestValue.name}」，${bestValue.traffic} / ${yuan(bestValue.m)}，约 ${perGb(bestValue.m / bestValue.g)}。流量用得多的话，买高档位更划算。`)
  }
  const cyc = [
    ['季付', rateText(cycleRates.quarterly)],
    ['半年付', rateText(cycleRates.semiannual)],
    ['年付', rateText(cycleRates.annual)]
  ].filter(([, v]) => v)
  if (cyc.length) priceNotes.push(`**长周期折扣**：${cyc.map(([k, v]) => `${k}${v}`).join('，')}。`)
  if (pricierCycles.length) priceNotes.push(`**注意**：${pricierCycles.join('；')}，长周期反而更贵，买之前在结算页核对一下。`)
  if (oneTimePlans.length) {
    const r = oneTimePlans.map((p) => p.o / p.g)
    const lo = Math.min(...r), hi = Math.max(...r)
    priceNotes.push(`**不限时流量包**：约 ${lo === hi ? perGb(lo) : `${perGb(lo)} ~ ${perGb(hi)}`}，单价比周期套餐高，但流量不过期，适合用量少或当备用。`)
  }
  if (unpriced.length) {
    priceNotes.push(`**未公开标价**：${unpriced.map((p) => `「${p.name}」`).join('、')}官网未列出价格，需要到官网查看或咨询客服。`)
  }

  // 本站每月记录一次入门月付价，和上一次相比标出涨跌
  const history = item.priceHistory || []
  const historyRows = history.map((h, i) => {
    const prev = history[i - 1]
    const a = num(h.monthly)
    const b = prev ? num(prev.monthly) : null
    let change = i === 0 ? '开始记录' : '持平'
    if (prev && a > b) change = `↑ 涨价 ${yuan(a - b)}`
    else if (prev && a < b) change = `↓ 降价 ${yuan(b - a)}`
    else if (prev && (h.plan !== prev.plan || h.traffic !== prev.traffic)) change = '入门套餐有调整'
    const c = h.coupon ? `\`${h.coupon}\`（${h.couponDiscount}）` : '无'
    return `| ${h.date} | ${h.plan} | ${h.traffic} | ${h.monthly} | ${c} | ${change} |`
  }).reverse()
  const since = history.length ? history[0].date.slice(0, 7).replace('-', ' 年 ') + ' 月' : ''
  const historyTable = historyRows.length
    ? [
        '### 价格记录（本站整理）',
        '',
        `本站每月对照${name}官网记录一次入门月付价和优惠码，价格有涨跌会在这里标出来。`,
        '',
        '| 记录日期 | 入门套餐 | 流量 | 月付 | 优惠码 | 变动 |',
        '| :--- | :--- | :--- | :--- | :--- | :--- |',
        ...historyRows,
        '',
        `${history.length === 1 ? `本站从 ${since}开始记录，之后每月更新。` : ''}各品牌的每 GB 价格排名见 [品牌资料库](/brands/#price-per-gb)。`
      ].join('\n')
    : ''

  const hasSemiannual = plans.some((p) => num(p.semiannual))
  const plansTable = plans.length
    ? (hasSemiannual
      ? '| 套餐名称 | 流量 | 月付 | 季付 | 半年付 | 年付 | 一次性（不限时） |\n| :--- | :--- | :--- | :--- | :--- | :--- | :--- |'
      : '| 套餐名称 | 流量 | 月付 | 季付 | 年付 | 一次性（不限时） |\n| :--- | :--- | :--- | :--- | :--- | :--- |') + '\n' +
      plans.map((p) => {
        const cells = [p.monthly, p.quarterly, ...(hasSemiannual ? [p.semiannual] : []), p.annual, p.oneTime]
        return `| **${p.name || '-'}** | ${p.traffic || '-'} | ${cells.map((c) => (num(c) ? c : '-')).join(' | ')} |`
      }).join('\n')
    : `*本站暂未收录${name}的套餐明细，请以官网套餐页为准。*`

  // ---------- Facts ----------
  const startPriceText = item.startPrice
    ? `${item.startPrice}${ed.startPriceNote ? `（${ed.startPriceNote}）` : item.coupon ? '（使用优惠码后）' : ''}`
    : null
  const unknown = (v) => !v || /未提供/.test(v)
  const facts = [
    ['线路类型', item.lineType],
    ['参考起步价', startPriceText],
    ['设备限制', unknown(item.clientSupport) ? '官网未明确说明' : item.clientSupport],
    ['流媒体', unknown(item.streamingSupport) ? '官网未明确说明' : item.streamingSupport],
    ['AI 工具', unknown(item.aiSupport) ? '官网未明确说明' : item.aiSupport],
    ['优惠码', item.coupon ? `\`${item.coupon}\`（${item.couponDiscount || '折扣'}）` : '暂无公开优惠码']
  ].filter(([, v]) => v)
  const tagsText = (item.bestFor || []).map((t) => `<span class="site-chip teal">#${t}</span>`).join(' ')

  // ---------- How ----------
  const guide = GUIDES[item.slug]
  let clientText
  if (ed.client === 'official-only') {
    clientText = ed.clientNote
  } else if (ed.client === 'subscription') {
    clientText = `${name}支持用订阅链接导入第三方客户端。常用客户端的教程：\n\n- [Clash Verge Rev 安装与订阅导入](/blog/clash-verge-rev-install-subscription-guide)\n- [iPhone 怎么用机场订阅](/blog/iphone-ios-airport-subscription-guide)\n- [安卓手机导入机场订阅](/blog/android-airport-subscription-guide)`
  } else {
    clientText = `${name}提供官方客户端，在用户中心下载、用账号登录即可使用；是否同时提供订阅链接，以官网为准。${guide ? `\n\n完整的分平台操作见 [${name}使用教程：Windows、Mac、安卓与 iOS](${guide})。` : ''}${item.macDownload ? `\n\nmacOS 用户也可以从官网的 [macOS 下载入口](${item.macDownload}) 获取客户端。` : ''}`
  }
  const howSteps = [
    `点击文末按钮进入${name}官网，注册账号；`,
    `第一次购买建议先选**月付或最小的套餐**试用；`,
    item.coupon ? `在结算页填写优惠码 \`${item.coupon}\`，确认折扣生效后付款；` : '完成付款；',
    ed.client === 'subscription' ? '在用户中心复制订阅链接，导入客户端；' : '在用户中心下载客户端，用账号登录；',
    '选择节点连接，在晚高峰（20:00~23:00）多用几天，确认速度满意再考虑长周期。'
  ]

  // ---------- FAQ ----------
  const hasOneTime = oneTimePlans.length > 0 || plans.some((p) => /不限时|永久|一次性/.test(p.name))
  const faq = [
    item.coupon && {
      q: `${name}的优惠码是多少？怎么用？`,
      a: `优惠码是 \`${item.coupon}\`（${item.couponDiscount}）${ed.couponNote ? `，${ed.couponNote}` : ''}。在结算页的优惠码栏填写即可${cheapest && rate ? `，例如「${cheapest.name}」月付折后约 ${yuan(cheapest.m * rate)}` : ''}。能否叠加、是否限新用户，以结算页显示为准。`
    },
    {
      q: `${name}可以同时登录几台设备？`,
      a: unknown(item.clientSupport) ? '官网没有明确说明同时在线设备数，多设备使用前建议先问客服。' : `官网资料显示：${item.clientSupport}。`
    },
    {
      q: `${name}有不限时流量包吗？`,
      a: hasOneTime
        ? `有。${oneTimePlans.length ? oneTimePlans.map((p) => `「${p.name}」${p.traffic} ${yuan(p.o)}`).join('、') + '。' : '具体价格官网未公开，请到官网查看。'}不限时流量包用完为止，不按月清零。`
        : '本站收录的资料中没有一次性不限时流量包，只有周期套餐。'
    },
    {
      q: `${name}能用 Clash 或小火箭吗？`,
      a: ed.client === 'official-only'
        ? `不需要。${name}用官方客户端登录，分流规则已内置；为保护隐私、防止订阅外泄被盗用，${name}不对外发放订阅链接，所以也不支持导入 Clash、小火箭。`
        : ed.client === 'subscription'
          ? '可以。官网说明支持用订阅链接导入 Clash、Shadowrocket 等第三方客户端。'
          : `${name}主要通过官方客户端使用，是否提供订阅链接以官网为准。`
    },
    ...(ed.faq || [])
  ].filter(Boolean)

  const descParts = [item.lineType, item.startPrice, item.coupon && `优惠码 ${item.coupon} ${item.couponDiscount || ''}`.trim()]
    .filter(Boolean).join('，')

  // ---------- 按用量怎么选 ----------
  const priceWithCoupon = (m) => (rate ? `${yuan(m)}（折后约 ${yuan(m * rate)}）` : yuan(m))
  const pickMonthly = (minGb) => [...monthlyPlans].filter((p) => p.g >= minGb).sort((a, b) => a.m - b.m)[0]
  const annualLite = plans
    .map((p) => ({ ...p, y: num(p.annual), g: gb(p.traffic) }))
    .filter((p) => p.y && p.g && !num(p.monthly) && isRegular(p))
    .sort((a, b) => a.y - b.y)[0]
  const usageRows = []
  const light = annualLite || pickMonthly(0)
  if (light) {
    usageRows.push(['轻度：查资料、刷社交，每月 100 GB 以内', `「${light.name}」${light.traffic}`, light.y ? `年付 ${yuan(light.y)}（月均约 ${yuan(light.y / 12)}）` : `月付 ${priceWithCoupon(light.m)}`])
  }
  const mid = pickMonthly(200)
  if (mid && mid !== light) usageRows.push(['中度：高清视频、AI 工具，每月 200~300 GB', `「${mid.name}」${mid.traffic}`, `月付 ${priceWithCoupon(mid.m)}`])
  const heavy = pickMonthly(600)
  if (heavy && heavy !== mid) usageRows.push(['重度：4K、下载、多人共用，每月 600 GB 以上', `「${heavy.name}」${heavy.traffic}`, `月付 ${priceWithCoupon(heavy.m)}`])
  const spare = [...oneTimePlans].sort((a, b) => a.o - b.o)[0]
  if (spare) usageRows.push(['偶尔用 / 当备用线路', `「${spare.name}」${spare.traffic}`, `一次性 ${yuan(spare.o)}，不过期`])
  const usageTable = usageRows.length
    ? `| 你的用量 | 建议套餐 | 价格 |\n| :--- | :--- | :--- |\n${usageRows.map((r) => `| ${r.join(' | ')} |`).join('\n')}`
    : ''

  // ---------- 和同类品牌比：本品牌 + 飞V + 入门价最接近的两家 ----------
  const me = summary[item.slug]
  const others = providers
    .filter((p) => p.slug !== item.slug && p.slug !== TOP_PICK && summary[p.slug].entry && editorial[p.slug])
    .sort((a, b) => Math.abs(summary[a.slug].entry.net - (me.entry?.net ?? 0)) - Math.abs(summary[b.slug].entry.net - (me.entry?.net ?? 0)))
    .slice(0, 2)
  const peers = [item, ...(item.slug === TOP_PICK ? [] : [summary[TOP_PICK].p]), ...others]
  const compareTable = `| 品牌 | 线路 | 入门月付（折后） | 优惠码 | 客户端 | 一句话 |\n| :--- | :--- | :--- | :--- | :--- | :--- |\n` +
    peers.map((p) => {
      const en = summary[p.slug].entry
      const label = p.slug === item.slug ? `**${p.name}**（本文）` : `[${p.name}](/brands/${p.slug})${p.slug === TOP_PICK ? ' ⭐' : ''}`
      return `| ${label} | ${p.lineType} | ${en ? `${yuan(en.net)}（${en.traffic || en.g + ' GB'}）` : '-'} | ${p.coupon ? `\`${p.coupon}\` ${p.couponDiscount}` : '暂无'} | ${CLIENT_LABEL[editorial[p.slug].client] || '-'} | ${editorial[p.slug].oneLiner || ''} |`
    }).join('\n')

  // ---------- 一分钟看懂 ----------
  const quickBox = [
    `- **一句话**：${ed.oneLiner}`,
    `- **入门价**：${startPriceText || '以官网为准'}`,
    `- **最适合**：${ed.fit[0]}`,
    `- **不太适合**：${ed.notFit[0]}`
  ].join('\n')

  const beforeBuy = [
    '先买月付或最小的套餐，在自己的网络环境下多用几天，尤其是晚高峰（20:00~23:00），满意再续长周期；',
    unknown(item.clientSupport) ? '官网没有写明设备数限制，多设备使用前先问客服；' : null,
    pricierCycles.length ? '部分套餐的长周期价格比按月买还贵，结算前核对一下总价；' : null,
    '价格、套餐和节点随时可能调整，以官网结算页为准。'
  ].filter(Boolean)

  const topPickTip = item.slug === TOP_PICK ? '' : `
::: tip 还在比较？看看本站主推的飞V
飞V 港台日新四个地区都是 IEPL / IPLC 专线，常规套餐 1x 倍率、不限设备，官方客户端登录即用，新用户首单用 \`fly20\` 约 ¥20。适合想要装好就能用的人。[看飞V完整分析 →](/brands/feiv)
:::
`

  // 文章内的购买按钮（顶部、中段）
  const couponTxt = item.coupon ? `，结算时填写优惠码 <code>${item.coupon}</code>（${item.couponDiscount}）` : ''
  const ctaBox = (text) => item.targetUrl
    ? `<div class="brand-cta">
  <p>${text}</p>
  <a href="${item.targetUrl}" target="_blank" rel="nofollow noopener noreferrer sponsored" class="portal-btn-primary">访问 ${name} 官网 ↗</a>
</div>
`
    : ''

  const content = `---
brand: ${item.slug}
outline: [2, 2]
title: ${fullName}怎么样？优缺点、套餐价格与适合人群
description: ${name}怎么样？${descParts}。整理官网套餐价格与特点，分析优缺点、适合人群和购买方法，帮你判断值不值得买。
keywords: ${name}, ${name}怎么样, ${name}机场, ${name}优缺点, ${name}官网${item.coupon ? `, ${name}优惠码` : ''}${ed.nameAlt ? `, ${ed.nameAlt}` : ''}
date: ${updatedAt}
lastUpdated: ${REVIEWED_AT}
---

# ${fullName}怎么样？官网资料、优缺点与选购建议

<div class="site-breadcrumbs">
  <a href="/">首页</a>
  <span class="sep">/</span>
  <a href="/recommendations/">机场推荐</a>
  <span class="sep">/</span>
  <a href="/brands/">品牌资料</a>
  <span class="sep">/</span>
  <span class="current">${name}</span>
</div>
${hasLogo ? `
<img src="${item.logo}" alt="${name} Logo" width="72" height="72" style="border-radius: 16px; object-fit: cover; margin: 1rem 0 0;" />
` : ''}
::: info 资料来源
本文的套餐、价格与服务说明整理自 **${name}官网**公开资料（资料日期 **${updatedAt}**），优缺点与建议为本站根据这些资料做的分析，**本站未对${name}做实际测速**。本站是独立的第三方资料站，不是${name}官方，价格与服务以官网结算页为准。[了解本站与推广声明](/about/)
:::

${item.coupon ? `<div class="demo-disclaimer-box" style="background: rgba(245, 158, 11, 0.08); border-color: #f59e0b;">
  <strong>🎁 优惠码：</strong> 结算时输入 <code>${item.coupon}</code>，可享 <strong>${item.couponDiscount || '折扣'}</strong> 优惠${ed.couponNote ? `（${ed.couponNote}）` : ''}。${item.couponVerifiedAt ? `<br><small>✅ 本站于 ${item.couponVerifiedAt} 对照官网核对，优惠码仍可使用。</small>` : ''}${item.couponScreenshots ? `
  <div class="coupon-proof">
${item.couponScreenshots.items.map((s) => `    <figure>
      <img src="${s.src}" alt="${name}优惠码 ${item.coupon} 结算页截图：${s.caption}" width="${s.width}" height="${s.height}" loading="lazy" />
      <figcaption>${s.caption}</figcaption>
    </figure>`).join('\n')}
    <p class="coupon-proof-note">本站 ${item.couponScreenshots.date} 结算页截图（截图未付款，已隐去账号信息）</p>
  </div>` : ''}
</div>
` : ''}
${item.promo ? '<BrandPromo />\n\n' : ''}::: tip 一分钟看懂${name}
${quickBox}
:::

${ctaBox(`<strong>已经想好了？</strong>直接去${name}官网注册${couponTxt}。`)}
${h2(0, `${name}是什么？`, 'What')}

${ed.what}

| 项目 | 内容 |
| :--- | :--- |
${facts.map(([k, v]) => `| ${k} | ${v} |`).join('\n')}
${tagsText ? `\n**适合场景**：${tagsText}\n` : ''}
${h2(1, '为什么值得关注？', 'Why')}

${ed.why}
${ed.scenarios ? `
### 典型使用场景

${list(ed.scenarios)}
` : ''}
${h2(2, '主要特点', 'Features')}

以下根据${name}官网介绍整理，本站未逐项实测：

${list(ed.features)}
${ed.extraFeatures ? `\n${ed.extraFeatures}\n` : ''}
${h2(3, '套餐与价格', 'Pricing')}

${plansTable}
${ed.extraPricing ? `\n${ed.extraPricing}\n` : ''}
### 价格怎么看

${list(priceNotes)}

以上单价按官网标价计算，未计入优惠码。想横向对比各家价格，可以用 [机场套餐筛选器](/tools/plan-filter)。
${historyTable ? `\n${historyTable}\n` : ''}${usageTable ? `
### 按用量怎么选

${usageTable}
` : ''}
${ctaBox(`<strong>看好套餐了？</strong>${item.startPrice ? `入门 ${item.startPrice}` : ''}${couponTxt}，建议先买月付试用。`)}
${h2(4, '怎么购买和使用？', 'How')}

${howSteps.map((s, i) => `${i + 1}. ${s}`).join('\n')}

${clientText}

::: warning 购买前注意
${beforeBuy.map((s, i) => `${i + 1}. ${s}`).join('\n')}
:::

${h2(5, '优点', 'Pros')}

${list(ed.pros)}

${h2(6, '缺点', 'Cons')}

${list(ed.cons)}

${h2(7, '适合谁？', 'Who')}

**适合：**

${list(ed.fit)}

**不太适合：**

${list(ed.notFit)}

### 和同类品牌比

${compareTable}

入门月付取各品牌最便宜的月付套餐，有优惠码的按折后价计算。

${h2(8, '常见问题', 'FAQ')}

${faq.map((f) => `**${f.q}**\n\n${f.a}`).join('\n\n')}

${h2(9, `总结：${name}值得买吗？`, 'Verdict')}

${ed.verdict}
${topPickTip}
价格、套餐和节点会随时调整，本页资料可能滞后，**购买前请以官网结算页为准**。想看其他品牌，可以到 [机场推荐](/recommendations/) 或 [品牌资料库](/brands/) 横向比较。

<div style="margin-top: 2rem; display: flex; gap: 1rem; flex-wrap: wrap;">
  ${item.targetUrl ? `<a href="${item.targetUrl}" target="_blank" rel="noopener noreferrer sponsored" class="portal-btn-primary">访问 ${name} 官网 ↗</a>` : ''}
  <a href="/recommendations/" class="portal-btn-secondary">返回推荐列表</a>
  <a href="/brands/" class="portal-btn-secondary">查看全部品牌资料</a>
</div>
`
  fs.writeFileSync(filePath, content, 'utf8')
  console.log(`Generated ${item.slug}`)
}
