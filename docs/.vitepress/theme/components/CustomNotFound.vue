<script setup lang="ts">
import { ref, computed } from 'vue'

interface SitemapItem {
  title: string
  desc: string
  link: string
  badge?: string
}

interface SitemapCategory {
  category: string
  icon: string
  items: SitemapItem[]
}

const sitemapData: SitemapCategory[] = [
  {
    category: '核心精选与选型排行',
    icon: '🌟',
    items: [
      {
        title: '网站首页 (Home)',
        desc: '机场推荐、品牌资料、教程与工具总览',
        link: '/'
      },
      {
        title: '9 大主力机场推荐',
        desc: '以第三方视角整理官网价格、线路与优惠码，帮你挑出合适的机场',
        link: '/recommendations/',
        badge: '热门'
      },
      {
        title: '机场品牌资料库（9 大主力 + 4 家重点）',
        desc: '全量收录机场资费、节点规模、协议支持与优惠码档案',
        link: '/brands/'
      }
    ]
  },
  {
    category: '8 大实用网络工具箱',
    icon: '🧰',
    items: [
      {
        title: '工具箱总览控制台',
        desc: '一站式网络工具导航与使用指引',
        link: '/tools/'
      },
      {
        title: '机场套餐智能筛选器',
        desc: '根据预算、月付/年付周期、线路类型智能匹配专属套餐',
        link: '/tools/plan-filter',
        badge: '高频推荐'
      },
      {
        title: '机场流量倍率计算器',
        desc: '换算不同倍率节点的真实流量消耗与实际每 GB 成本',
        link: '/tools/multiplier-calculator'
      },
      {
        title: '机场优惠码查询中心',
        desc: '实时汇总各大品牌最新可用折扣码与限时立减福利',
        link: '/tools/coupon-center',
        badge: '实时省钱'
      },
      {
        title: '订阅链接格式检查器',
        desc: '检测订阅链接安全性、提取有效节点参数与协议类型',
        link: '/tools/subscription-checker'
      },
      {
        title: '机场品牌多维对比工具',
        desc: '支持自选多家品牌，并排对比线路架构、并发限制与起步价',
        link: '/tools/brand-comparator'
      },
      {
        title: 'AI / 流媒体解锁查询',
        desc: '查询各大机场对 ChatGPT、Claude、Netflix、Disney+ 解锁状态',
        link: '/tools/unlock-checker'
      },
      {
        title: '行业维护与公告时间线',
        desc: '追踪各大机场节点割接、机房升级与突发故障动态',
        link: '/tools/timeline'
      }
    ]
  },
  {
    category: '全平台客户端实战教程',
    icon: '📱',
    items: [
      {
        title: 'Windows 客户端配置指南',
        desc: 'Clash Verge Rev 极速安装、订阅导入与系统代理设置',
        link: '/blog/clash-verge-rev-install-subscription-guide',
        badge: 'PC 必读'
      },
      {
        title: 'macOS 客户端配置指南',
        desc: 'Mac 端客户端安装、Apple Silicon 与权限配置',
        link: '/guides/brand-mac-guide'
      },
      {
        title: 'iOS (小火箭) 客户端实操',
        desc: 'Shadowrocket 节点导入、按需连接与分流规则配置',
        link: '/clash/ios-shadowrocket-stash',
        badge: 'iPhone'
      },
      {
        title: 'Android 客户端配置指南',
        desc: 'Clash Meta / Surfboard 安装包获取与订阅自动化更新',
        link: '/clash/android-client-guide'
      },
      {
        title: '软路由与全屋网关代理',
        desc: 'OpenWrt / PassWall / 旁路由全景透明代理网络部署',
        link: '/guides/router-gateway-guide'
      }
    ]
  },
  {
    category: '深度科普博文与排错手册',
    icon: '📚',
    items: [
      {
        title: '机场与 VPN 有什么区别？新手怎么选',
        desc: '从底层协议、抗封锁机制到隐私模型深度对比',
        link: '/blog/vpn-vs-airport-difference',
        badge: '新手入门'
      },
      {
        title: '机场新手入门：从选套餐到连接成功',
        desc: '零基础闭坑指南，分步指导完成首次科学上网配置',
        link: '/blog/airport-beginner-getting-started-guide'
      },
      {
        title: '机场怎么选？购买前必须检查的避坑清单',
        desc: '辨别套壳机场、虚假专线与跑路风险的 6 大核验维度',
        link: '/blog/how-to-choose-airport-checklist'
      },
      {
        title: '月付、年付和不限时流量包深度对比',
        desc: '根据实际用量模型挑选最划算的计费周期',
        link: '/blog/billing-cycles-comparison-guide'
      },
      {
        title: 'Claude / AI 封号与原生 IP 避坑实战',
        desc: '解析机房 IP 风控机制，选用高纯净度原生节点应对 AI 封号',
        link: '/blog/ai-account-ban-native-ip-guide',
        badge: 'AI 必备'
      },
      {
        title: '节点有延迟但打不开网页排错指南',
        desc: '解析 DNS 污染、TUN 虚拟网卡劫持与系统代理排错步骤',
        link: '/blog/node-has-latency-cannot-open-webpage-fix'
      },
      {
        title: '机场速度慢怎么办？排查实战手册',
        desc: '定位运营商 QoS 限速、晚高峰拥堵与本地 WiFi 瓶颈',
        link: '/blog/airport-slow-speed-troubleshooting'
      },
      {
        title: '机场订阅导入失败怎么办？全平台排错',
        desc: '处理 Base64 解析异常、SSL 证书报错与订阅链接转换',
        link: '/blog/airport-subscription-import-failed-troubleshooting'
      },
      {
        title: '2026 协议演进趋势与技术前瞻',
        desc: 'VLESS-XTLS、Hysteria2、TUIC 与自适应抗封锁协议演进',
        link: '/blog/2026-tech-trends'
      },
      {
        title: '每日行业简报 · 10/30',
        desc: 'VPN 监管、客户端更新与机场价格优惠动态',
        link: '/blog/daily-monitor-2026-10-30'
      }
    ]
  },
  {
    category: '站点机制与服务准则',
    icon: 'ℹ️',
    items: [
      {
        title: '关于本站与资料来源',
        desc: '本站如何以第三方视角整理各品牌官网的价格、线路与优惠码，以及推广声明',
        link: '/about/'
      },
      {
        title: '隐私政策与数据安全准则',
        desc: '纯静态网站，不设注册登录，说明本站如何处理访问数据',
        link: '/privacy/'
      }
    ]
  }
]

const searchQuery = ref('')

const filteredCategories = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return sitemapData

  return sitemapData
    .map((cat) => ({
      ...cat,
      items: cat.items.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.desc.toLowerCase().includes(query) ||
          cat.category.toLowerCase().includes(query)
      )
    }))
    .filter((cat) => cat.items.length > 0)
})

const goBack = () => {
  if (typeof window !== 'undefined' && window.history.length > 1) {
    window.history.back()
  } else if (typeof window !== 'undefined') {
    window.location.href = '/'
  }
}
</script>

<template>
  <div class="custom-404-container">
    <!-- 404 Hero Section -->
    <header class="error-hero">
      <div class="error-badge">
        <span class="error-dot"></span>
        404 错误 · 页面未找到
      </div>
      <h1 class="error-title">看来你进入到错误页面</h1>
      <p class="error-subtitle">
        抱歉！你尝试访问的链接可能已经失效、被移除，或者输入的网址有误。<br />
        不用担心，我们在下方为你整理了完整的<strong>全站核心网站地图</strong>，你可以直接搜索或选择感兴趣的内容前往：
      </p>

      <!-- Quick Action Buttons -->
      <div class="error-actions">
        <a href="/" class="btn-primary">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          返回网站首页
        </a>
        <a href="/recommendations/" class="btn-secondary">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
          查看 9 大主力机场榜
        </a>
        <button class="btn-outline" @click="goBack" type="button">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          返回上一页
        </button>
      </div>
    </header>

    <!-- Interactive Sitemap Filter -->
    <section class="sitemap-section">
      <div class="sitemap-header-row">
        <div class="sitemap-title-group">
          <h2 class="sitemap-title">
            <span class="sitemap-icon">🗺️</span>
            全站网站地图（点击快速直达）
          </h2>
          <span class="sitemap-meta">收录全站核心页面、工具与精选博文</span>
        </div>
        <div class="sitemap-search-wrap">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="在网站地图中快速检索..."
            class="sitemap-search-input"
            aria-label="在网站地图中检索"
          />
          <button
            v-if="searchQuery"
            class="sitemap-search-clear"
            @click="searchQuery = ''"
            title="清空搜索"
          >
            ✕
          </button>
        </div>
      </div>

      <!-- Categories & Cards -->
      <div v-if="filteredCategories.length > 0" class="sitemap-categories">
        <article
          v-for="cat in filteredCategories"
          :key="cat.category"
          class="sitemap-category-card"
        >
          <div class="category-header">
            <span class="category-icon">{{ cat.icon }}</span>
            <h3 class="category-name">{{ cat.category }}</h3>
            <span class="category-count">{{ cat.items.length }} 篇/项</span>
          </div>

          <ul class="category-item-list">
            <li v-for="item in cat.items" :key="item.link" class="category-item">
              <a :href="item.link" class="item-link">
                <div class="item-head">
                  <span class="item-title">{{ item.title }}</span>
                  <span v-if="item.badge" class="item-badge">{{ item.badge }}</span>
                </div>
                <p class="item-desc">{{ item.desc }}</p>
              </a>
            </li>
          </ul>
        </article>
      </div>

      <!-- Empty State -->
      <div v-else class="sitemap-empty">
        <p class="empty-icon">🔍</p>
        <p class="empty-title">未找到与 "{{ searchQuery }}" 相关的页面</p>
        <p class="empty-desc">建议更换关键词，或点击下方按钮返回首页查看完整索引。</p>
        <button class="btn-secondary" @click="searchQuery = ''">清除搜索条件</button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.custom-404-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 48px 20px 80px;
}

/* Hero Section */
.error-hero {
  text-align: center;
  padding: 40px 24px 48px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
  margin-bottom: 48px;
}

.error-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px;
  border-radius: 9999px;
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.5px;
  margin-bottom: 20px;
}

.error-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #ef4444;
  display: inline-block;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2);
}

.error-title {
  font-size: 32px;
  font-weight: 800;
  color: var(--vp-c-text-1);
  margin: 0 0 16px;
  line-height: 1.3;
}

@media (min-width: 640px) {
  .error-title {
    font-size: 40px;
  }
}

.error-subtitle {
  font-size: 16px;
  color: var(--vp-c-text-2);
  line-height: 1.7;
  max-width: 720px;
  margin: 0 auto 32px;
}

.error-subtitle strong {
  color: var(--vp-c-text-1);
}

.error-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
}

.btn-primary,
.btn-secondary,
.btn-outline {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 8px;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background: var(--vp-c-brand-1);
  color: #ffffff !important;
  border: 1px solid transparent;
}

.btn-primary:hover {
  background: var(--vp-c-brand-2);
  transform: translateY(-1px);
}

.btn-secondary {
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1) !important;
  border: 1px solid var(--vp-c-divider);
}

.btn-secondary:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1) !important;
  transform: translateY(-1px);
}

.btn-outline {
  background: transparent;
  color: var(--vp-c-text-2);
  border: 1px dashed var(--vp-c-divider);
}

.btn-outline:hover {
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  border-color: var(--vp-c-text-2);
}

/* Sitemap Section */
.sitemap-section {
  margin-top: 16px;
}

.sitemap-header-row {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 28px;
}

@media (min-width: 768px) {
  .sitemap-header-row {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

.sitemap-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin: 0 0 4px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.sitemap-meta {
  font-size: 13px;
  color: var(--vp-c-text-3);
}

.sitemap-search-wrap {
  position: relative;
  min-width: 260px;
  max-width: 360px;
}

.sitemap-search-input {
  width: 100%;
  padding: 10px 36px 10px 14px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.sitemap-search-input:focus {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}

.sitemap-search-clear {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--vp-c-text-3);
  font-size: 12px;
  cursor: pointer;
  padding: 4px;
}

.sitemap-search-clear:hover {
  color: var(--vp-c-text-1);
}

/* Categories Grid */
.sitemap-categories {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}

@media (min-width: 768px) {
  .sitemap-categories {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1100px) {
  .sitemap-categories {
    grid-template-columns: repeat(3, 1fr);
  }
}

.sitemap-category-card {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.sitemap-category-card:hover {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
}

.category-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 14px;
  margin-bottom: 12px;
  border-bottom: 1px solid var(--vp-c-divider);
}

.category-icon {
  font-size: 20px;
  line-height: 1;
}

.category-name {
  font-size: 16px;
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin: 0;
  flex: 1;
}

.category-count {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-3);
  border: 1px solid var(--vp-c-divider);
}

.category-item-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.category-item {
  display: flex;
}

.item-link {
  display: block;
  width: 100%;
  padding: 10px 12px;
  border-radius: 8px;
  background: var(--vp-c-bg);
  border: 1px solid transparent;
  text-decoration: none;
  transition: all 0.2s ease;
}

.item-link:hover {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-bg);
  transform: translateX(3px);
}

.item-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
}

.item-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--vp-c-brand-1);
  line-height: 1.4;
}

.item-link:hover .item-title {
  color: var(--vp-c-brand-2);
}

.item-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
  background: rgba(37, 99, 235, 0.1);
  color: var(--vp-c-brand-1);
  white-space: nowrap;
}

.item-desc {
  font-size: 12px;
  color: var(--vp-c-text-2);
  line-height: 1.5;
  margin: 0;
}

/* Empty State */
.sitemap-empty {
  text-align: center;
  padding: 60px 20px;
  background: var(--vp-c-bg-soft);
  border: 1px dashed var(--vp-c-divider);
  border-radius: 12px;
}

.empty-icon {
  font-size: 36px;
  margin-bottom: 12px;
}

.empty-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin-bottom: 6px;
}

.empty-desc {
  font-size: 14px;
  color: var(--vp-c-text-2);
  margin-bottom: 20px;
}
</style>
