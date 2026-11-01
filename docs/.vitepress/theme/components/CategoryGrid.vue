<script setup lang="ts">
export interface CategoryItem {
  title: string
  link: string
  description: string
  icon?: string
  tag?: string
  count?: string
}

const defaultCategories: CategoryItem[] = [
  {
    title: '机场推荐',
    link: '/recommendations/',
    description: '客观选型指南与方案筛选标准，涵盖线路架构与稳定性评估。',
    icon: '⚡',
    tag: '精选推荐',
    count: '核心专题'
  },
  {
    title: '品牌资料',
    link: '/brands/',
    description: '规范化的服务商技术档案、协议兼容性与历史沿革 Wiki。',
    icon: '📁',
    tag: 'Wiki 档案',
    count: '规范收录'
  },
  {
    title: 'VPN 知识',
    link: '/vpn/',
    description: '深入了解 WireGuard、OpenVPN、Shadowsocks 等网络传输原理。',
    icon: '🔒',
    tag: '基础架构',
    count: '知识库'
  },
  {
    title: 'Clash 教程',
    link: '/clash/',
    description: 'Clash Verge Rev、Meta 内核的分流规则配置与订阅转换实践。',
    icon: '🛠️',
    tag: '实战操作',
    count: '配置手册'
  },
  {
    title: '实用工具',
    link: '/tools/',
    description: '套餐智能筛选器、节点流量倍率计算器与全网优惠码查询中心。',
    icon: '🧮',
    tag: '智能计算',
    count: '免登录工具'
  },
  {
    title: '综合指南',
    link: '/guides/',
    description: '跨终端故障排查、DNS 泄露防护、跨境网络性能调优综合手册。',
    icon: '📚',
    tag: '高阶调优',
    count: '实用指引'
  },
  {
    title: '博客文章',
    link: '/blog/',
    description: '前沿网络协议演化、技术趋势解读与行业深度资讯剖析。',
    icon: '📰',
    tag: '技术洞察',
    count: '持续更新'
  }
]

interface Props {
  items?: CategoryItem[]
}

const props = withDefaults(defineProps<Props>(), {
  items: () => []
})

const categories = props.items && props.items.length ? props.items : defaultCategories
</script>

<template>
  <div class="category-grid">
    <a
      v-for="(cat, idx) in categories"
      :key="idx"
      :href="cat.link"
      class="category-card"
    >
      <div class="cat-card-top">
        <span class="cat-icon">{{ cat.icon }}</span>
        <span v-if="cat.tag" class="cat-tag">{{ cat.tag }}</span>
      </div>
      <h3 class="cat-title">{{ cat.title }}</h3>
      <p class="cat-desc">{{ cat.description }}</p>
      <div class="cat-card-bottom">
        <span class="cat-count">{{ cat.count }}</span>
        <span class="cat-arrow">
          进入专题 &rarr;
        </span>
      </div>
    </a>
  </div>
</template>

<style scoped>
.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.25rem;
  margin: 1.5rem 0 2.5rem;
}

.category-card {
  background: var(--site-card-bg);
  border: 1px solid var(--site-card-border);
  border-radius: var(--site-radius-lg);
  padding: 1.5rem;
  box-shadow: var(--site-card-shadow);
  text-decoration: none !important;
  color: inherit;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.category-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--site-card-shadow-hover);
  border-color: var(--vp-c-brand-1);
}

.cat-card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.85rem;
}

.cat-icon {
  font-size: 1.8rem;
  line-height: 1;
}

.cat-tag {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.15rem 0.55rem;
  border-radius: var(--site-radius-full);
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
}

.cat-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--site-text-primary);
}

.cat-desc {
  margin: 0 0 1.25rem 0;
  font-size: 0.925rem;
  color: var(--site-text-secondary);
  line-height: 1.6;
  flex-grow: 1;
}

.cat-card-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.75rem;
  border-top: 1px solid var(--site-border-color);
  font-size: 0.85rem;
}

.cat-count {
  color: var(--site-text-muted);
}

.cat-arrow {
  font-weight: 600;
  color: var(--vp-c-brand-1);
  transition: transform 0.15s ease;
}

.category-card:hover .cat-arrow {
  transform: translateX(4px);
}
</style>
