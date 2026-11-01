<script setup lang="ts">
import { ref, computed } from 'vue'

interface SearchItem {
  title: string
  category: string
  url: string
  keywords: string
  summary: string
}

const defaultDatabase: SearchItem[] = [
  {
    title: '网络工具技术选型全景与选型指标',
    category: '推荐专区',
    url: '/recommendations/',
    keywords: '机场推荐 专线 BGP IPLC 选型 流媒体',
    summary: '建立客观选型模型，深入比对线路架构、延迟表现与冗余容灾。'
  },
  {
    title: '微风网络 - 品牌技术档案',
    category: '品牌资料',
    url: '/brands/weifengwangluo',
    keywords: '微风网络 机场 IPLC 专线 不限速 清风年付 99 优惠码 weifeng90 9折',
    summary: '全 IPLC 专线，不限设备，清风年付 ¥99，支持不限时套餐。'
  },
  {
    title: '飞猫云 - 品牌技术档案',
    category: '品牌资料',
    url: '/brands/feimaoyun',
    keywords: '飞猫云 机场 IPLC 专线 大带宽 2.5Gbps 流媒体',
    summary: '全 IPLC 专线网络，最高 2.5Gbps 稳定速率，多端不限制设备连接。'
  },
  {
    title: '暮光加速 - 品牌技术档案',
    category: '品牌资料',
    url: '/brands/muguangjiasu',
    keywords: '暮光加速 机场 BGP 智能调度 专线架构 优惠码 mm88 8折',
    summary: 'BGP 多线路智能调度与专线架构，全程不限速，全节点 1x 计费倍率。'
  },
  {
    title: '大佬云 - 品牌技术档案',
    category: '品牌资料',
    url: '/brands/dalao',
    keywords: '大佬云 机场 IPLC 专线 不限设备 优惠码 dly888 7折',
    summary: '全 IPLC 专线，不限同时在线设备，单节点峰值至高 2.5Gbps，专属七折优惠。'
  },
  {
    title: 'firefly - 品牌技术档案',
    category: '品牌资料',
    url: '/brands/firefly',
    keywords: 'firefly 机场 IPLC 专线 大流量 优惠码 8折',
    summary: '不限速、不限设备数，提供年付与不限时大流量专线套餐。'
  },
  {
    title: 'SOGO 云 - 品牌技术档案',
    category: '品牌资料',
    url: '/brands/sogoyun',
    keywords: 'SOGO云 IEPL 专线 三网智能接入 7折优惠',
    summary: 'IEPL 内网专线架构，三网智能接入与多节点冗余支持。'
  },
  {
    title: '现代网络传输协议对比与解析',
    category: 'VPN 知识',
    url: '/vpn/protocol-guide',
    keywords: 'WireGuard Shadowsocks Trojan Hysteria2 协议 加密 性能',
    summary: '拆解常见翻墙与安全传输协议的底层机制与适用网络环境。'
  },
  {
    title: 'Clash 分流规则体系与策略组深度指南',
    category: 'Clash 教程',
    url: '/clash/config-rules',
    keywords: 'Clash Verge Meta 规则 分流 策略组 GEOIP 订阅',
    summary: '由浅入深讲解规则匹配顺序、策略组嵌套与常见漏流排查。'
  },
  {
    title: '跨平台网络诊断与延迟故障排除手册',
    category: '综合指南',
    url: '/guides/network-optimization',
    keywords: '网络诊断 MTR Ping 丢包 DNS 污染 排错',
    summary: '全套技术诊断流程，定位本地网络、中继跳数与服务端异常。'
  },
  {
    title: '2026 年现代网络协议与传输优化发展趋势',
    category: '博客文章',
    url: '/blog/2026-tech-trends',
    keywords: '技术趋势 HTTP3 QUIC 传输协议 前沿 洞察',
    summary: '探讨 QUIC 广泛落地背景下的网络工具演进路径与行业观察。'
  }
]

const searchQuery = ref('')
const selectedCategory = ref('全部')

const categories = ['全部', '推荐专区', '品牌资料', 'VPN 知识', 'Clash 教程', '综合指南', '博客文章']

const filteredResults = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  return defaultDatabase.filter(item => {
    const matchCategory = selectedCategory.value === '全部' || item.category === selectedCategory.value
    const matchQuery = !query ||
      item.title.toLowerCase().includes(query) ||
      item.keywords.toLowerCase().includes(query) ||
      item.summary.toLowerCase().includes(query)
    return matchCategory && matchQuery
  })
})
</script>

<template>
  <div class="search-panel-container">
    <div class="search-box-wrapper">
      <div class="search-input-group">
        <svg class="search-icon" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
        </svg>
        <input
          v-model="searchQuery"
          type="search"
          placeholder="快速检索知识库、品牌档案或配置教程..."
          class="search-input"
          aria-label="站内快捷检索"
        />
        <button
          v-if="searchQuery"
          @click="searchQuery = ''"
          class="search-clear-btn"
          aria-label="清空输入"
        >
          &times;
        </button>
      </div>

      <!-- Quick category pills -->
      <div class="category-filter-bar">
        <button
          v-for="cat in categories"
          :key="cat"
          @click="selectedCategory = cat"
          :class="['filter-pill', { active: selectedCategory === cat }]"
        >
          {{ cat }}
        </button>
      </div>
    </div>

    <!-- Results display -->
    <div class="search-results-list">
      <div v-if="filteredResults.length === 0" class="no-results-box">
        <p>未找到符合「{{ searchQuery }}」的知识条目，可尝试缩短关键词或切换分类分类。</p>
      </div>

      <a
        v-for="(item, idx) in filteredResults"
        :key="idx"
        :href="item.url"
        class="result-item-card"
      >
        <div class="result-top">
          <span class="result-category">{{ item.category }}</span>
          <span class="result-link-hint">查看文档 &rarr;</span>
        </div>
        <h4 class="result-title">{{ item.title }}</h4>
        <p class="result-summary">{{ item.summary }}</p>
      </a>
    </div>
  </div>
</template>

<style scoped>
.search-panel-container {
  margin: 1.5rem 0 2.5rem;
}

.search-box-wrapper {
  background: var(--site-card-bg);
  border: 1px solid var(--site-border-color);
  border-radius: var(--site-radius-lg);
  padding: 1.25rem;
  box-shadow: var(--site-card-shadow);
  margin-bottom: 1.25rem;
}

.search-input-group {
  display: flex;
  align-items: center;
  position: relative;
  border: 1px solid var(--site-border-subtle);
  border-radius: var(--site-radius-md);
  background: var(--site-bg-canvas);
  padding: 0.5rem 0.85rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.search-input-group:focus-within {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 2px var(--vp-c-brand-soft);
}

.search-icon {
  width: 18px;
  height: 18px;
  color: var(--site-text-muted);
  margin-right: 0.5rem;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 0.95rem;
  color: var(--site-text-primary);
}

.search-clear-btn {
  background: transparent;
  border: none;
  font-size: 1.2rem;
  line-height: 1;
  color: var(--site-text-muted);
  cursor: pointer;
  padding: 0 0.25rem;
}

.category-filter-bar {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.filter-pill {
  border: 1px solid var(--site-border-color);
  background: var(--site-bg-subtle);
  color: var(--site-text-secondary);
  font-size: 0.825rem;
  padding: 0.25rem 0.75rem;
  border-radius: var(--site-radius-full);
  cursor: pointer;
  transition: all 0.15s ease;
}

.filter-pill:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.filter-pill.active {
  background: var(--vp-c-brand-1);
  color: #ffffff;
  border-color: var(--vp-c-brand-1);
}

.search-results-list {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.result-item-card {
  display: block;
  background: var(--site-card-bg);
  border: 1px solid var(--site-card-border);
  border-radius: var(--site-radius-md);
  padding: 1rem 1.25rem;
  text-decoration: none !important;
  color: inherit;
  transition: transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
}

.result-item-card:hover {
  transform: translateX(4px);
  border-color: var(--vp-c-brand-1);
  box-shadow: var(--site-card-shadow);
}

.result-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.4rem;
}

.result-category {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
  padding: 0.1rem 0.45rem;
  border-radius: var(--site-radius-sm);
}

.result-link-hint {
  font-size: 0.8rem;
  color: var(--site-text-muted);
}

.result-title {
  margin: 0 0 0.35rem 0;
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--site-text-primary);
}

.result-summary {
  margin: 0;
  font-size: 0.875rem;
  color: var(--site-text-secondary);
  line-height: 1.5;
}

.no-results-box {
  padding: 2rem;
  text-align: center;
  color: var(--site-text-muted);
  background: var(--site-bg-subtle);
  border-radius: var(--site-radius-md);
  border: 1px dashed var(--site-border-color);
}
</style>
