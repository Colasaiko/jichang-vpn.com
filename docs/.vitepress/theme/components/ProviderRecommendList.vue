<script setup lang="ts">
import { ref, computed } from 'vue'
import rawProviders from '../../data/providers.json'
import brandEditorial from '../../data/brand-editorial.json'

// 本站主推品牌
const TOP_PICK = 'feiv'

// 品牌文章里的一句话点评
const oneLiner = (slug: string): string =>
  (brandEditorial as Record<string, { oneLiner?: string }>)[slug]?.oneLiner || ''

interface Plan {
  name: string
  traffic: string
  monthly?: string | null
  quarterly?: string | null
  semiannual?: string | null
  annual?: string | null
  oneTime?: string | null
}

interface Provider {
  name: string
  slug: string
  coupon?: string | null
  couponDiscount?: string | null
  plans?: Plan[]
  features?: string[]
  aiSupport?: string
  streamingSupport?: string
  clientSupport?: string
  bestFor?: string[]
  logo?: string
  targetUrl?: string
  updatedAt?: string
}

interface Props {
  featuredOnly?: boolean
  showAllLink?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  featuredOnly: false,
  showAllLink: false
})

// 13 designated recommended brands in exact priority order
const featuredSlugs = [
  'feiv',           // 飞V
  'muguangjiasu',   // 暮光
  'weifengwangluo', // 微风
  'feimaoyun',      // 飞猫
  'dalao',          // 大佬
  'firefly',        // firefly
  'lingmao',        // 灵猫
  'shanyue',        // 闪跃
  'wuyoulianjie',   // 无忧
  'kuajieyun',      // 跨界
  'sogoyun',        // SOGO 云
  'lingdongyun',    // 灵动云
  'yinxingren'      // 隐形人
]

const baseProviders = computed<Provider[]>(() => {
  if (props.featuredOnly) {
    // Only return the 9 priority brands in exact order
    return featuredSlugs
      .map(slug => (rawProviders as Provider[]).find(p => p.slug === slug))
      .filter((p): p is Provider => Boolean(p))
  }
  return rawProviders as Provider[]
})

// Filter criteria
const searchQuery = ref('')
const selectedTag = ref('全部')

const popularTags = [
  '全部',
  'IPLC专线',
  '低预算',
  '大流量',
  '不限时套餐',
  '多设备不限'
]

// Extract minimum price
function getEntryPrice(item: Provider): { price: string; period: string } {
  if (!item.plans || item.plans.length === 0) {
    return { price: '详见官网', period: '' }
  }
  for (const plan of item.plans) {
    if (plan.monthly) {
      return { price: plan.monthly, period: '/月起' }
    }
  }
  for (const plan of item.plans) {
    if (plan.annual) {
      return { price: plan.annual, period: '/年起' }
    }
  }
  for (const plan of item.plans) {
    if (plan.oneTime) {
      return { price: plan.oneTime, period: '/不限时' }
    }
  }
  return { price: '按需选购', period: '' }
}

// Check tag matching
function hasTag(item: Provider, tag: string): boolean {
  if (tag === '全部') return true
  if (tag === 'IPLC专线') {
    return (
      (item.bestFor && item.bestFor.some(t => t.includes('专线'))) ||
      (item.features && item.features.some(f => f.includes('IPLC') || f.includes('专线')))
    )
  }
  return !!(item.bestFor && item.bestFor.some(t => t.includes(tag)))
}

// Filtered list
const filteredProviders = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  return baseProviders.value.filter(item => {
    const matchTag = hasTag(item, selectedTag.value)
    const matchQuery =
      !query ||
      item.name.toLowerCase().includes(query) ||
      (item.coupon && item.coupon.toLowerCase().includes(query)) ||
      (item.features && item.features.some(f => f.toLowerCase().includes(query))) ||
      (item.bestFor && item.bestFor.some(b => b.toLowerCase().includes(query)))
    return matchTag && matchQuery
  })
})
</script>

<template>
  <div class="recommend-portal-container">
    <!-- Filter and Search Header -->
    <div class="filter-controls-card">
      <div class="search-input-wrapper">
        <svg class="search-icon" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
        </svg>
        <input
          v-model="searchQuery"
          type="search"
          :placeholder="featuredOnly ? '搜索 13 家精选推荐品牌...' : '在全部 13 家品牌库中搜索...'"
          class="recommend-search-input"
          aria-label="筛选机场品牌"
        />
        <button
          v-if="searchQuery"
          @click="searchQuery = ''"
          class="clear-input-btn"
          aria-label="清空筛选"
        >
          &times;
        </button>
      </div>

      <!-- Quick Scenario Pills -->
      <div class="tags-filter-row">
        <span class="tags-label">场景速选:</span>
        <div class="tags-group">
          <button
            v-for="tag in popularTags"
            :key="tag"
            @click="selectedTag = tag"
            :class="['tag-filter-btn', { active: selectedTag === tag }]"
          >
            {{ tag }}
          </button>
        </div>
      </div>
      <div class="result-count-tip">
        <template v-if="featuredOnly">
          本站核心精选推荐 <strong>{{ baseProviders.length }}</strong> 家主力品牌，当前筛选展示 <strong>{{ filteredProviders.length }}</strong> 家
        </template>
        <template v-else>
          品牌资料库共归档 <strong>{{ baseProviders.length }}</strong> 家品牌，当前展示 <strong>{{ filteredProviders.length }}</strong> 家
        </template>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="filteredProviders.length === 0" class="empty-state-box">
      未找到符合条件的品牌，可尝试清空搜索关键词或更换标签。
    </div>

    <!-- Provider Cards Grid: Wrap without horizontal scroll -->
    <div class="provider-auto-wrap-list">
      <article
        v-for="item in filteredProviders"
        :key="item.slug"
        :class="['provider-item-card', { 'is-top-pick': item.slug === TOP_PICK }]"
      >
        <!-- Top row: Brand header and price -->
        <div class="card-head">
          <div class="brand-title-wrap">
            <h3 class="brand-heading">{{ item.name }}</h3>
            <span v-if="item.slug === TOP_PICK" class="top-pick-pill">⭐ 本站主推</span>
            <span v-if="item.couponDiscount" class="discount-pill">
              优惠 {{ item.couponDiscount }}
            </span>
          </div>

          <div class="price-badge-wrap">
            <span class="price-number">{{ getEntryPrice(item).price }}</span>
            <span class="price-period">{{ getEntryPrice(item).period }}</span>
          </div>
        </div>

        <!-- One-line verdict from the brand article -->
        <p v-if="oneLiner(item.slug)" class="verdict-line">
          <span class="verdict-label">本站点评</span>{{ oneLiner(item.slug) }}
        </p>

        <!-- Coupon code if present -->
        <div v-if="item.coupon" class="coupon-notice-row">
          <span class="coupon-label">专属优惠码:</span>
          <code class="coupon-code">{{ item.coupon }}</code>
          <span v-if="item.couponDiscount" class="coupon-desc">({{ item.couponDiscount }}立减)</span>
        </div>

        <!-- Feature bullets -->
        <div v-if="item.features && item.features.length" class="features-section">
          <ul class="features-list">
            <li v-for="(feat, fIdx) in item.features.slice(0, 4)" :key="fIdx">
              <span class="check-mark">✓</span>
              <span>{{ feat }}</span>
            </li>
          </ul>
        </div>

        <!-- Tags / Best for -->
        <div v-if="item.bestFor && item.bestFor.length" class="tags-wrap">
          <span v-for="tag in item.bestFor" :key="tag" class="bestfor-chip">
            #{{ tag }}
          </span>
        </div>

        <!-- Client & Device Info -->
        <div v-if="item.clientSupport" class="support-info-row">
          <span class="support-label">客户端支持:</span>
          <span class="support-val">{{ item.clientSupport }}</span>
        </div>

        <!-- Action buttons (wrapped and mobile tap-friendly) -->
        <div class="card-actions-wrap">
          <a
            :href="'/go/' + item.slug + '/'"
            target="_blank" rel="nofollow noopener noreferrer sponsored"
            class="action-btn-primary"
          >
            访问官网直达 ↗
          </a>
          <a
            :href="'/brands/' + item.slug"
            class="action-btn-secondary"
          >
            看完整分析 →
          </a>
        </div>
      </article>
    </div>

    <!-- Optional banner pointing to all brands Wiki -->
    <div v-if="showAllLink" class="all-brands-banner">
      <div class="banner-text">
        <h4 class="banner-title">📚 寻找更多服务商或特定线路？</h4>
        <p class="banner-desc">
          本页仅呈现 <strong>9 大主力推荐</strong>。如果您需要查阅全部 <strong>13 家品牌资料</strong>，欢迎移步品牌资料库。
        </p>
      </div>
      <a href="/brands/" class="banner-link-btn">
        查看全部品牌资料库（9 大主力 + 4 家重点） &rarr;
      </a>
    </div>
  </div>
</template>

<style scoped>
.recommend-portal-container {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  margin: 1.5rem 0 3rem;
  overflow-x: hidden;
}

/* Filter controls card */
.filter-controls-card {
  background: var(--site-card-bg);
  border: 1px solid var(--site-border-color);
  border-radius: var(--site-radius-lg);
  padding: 1.25rem;
  box-shadow: var(--site-card-shadow);
  margin-bottom: 1.75rem;
  box-sizing: border-box;
  width: 100%;
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  background: var(--site-bg-canvas);
  border: 1px solid var(--site-border-subtle);
  border-radius: var(--site-radius-md);
  padding: 0.6rem 0.85rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  width: 100%;
  box-sizing: border-box;
}

.search-input-wrapper:focus-within {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 2px var(--vp-c-brand-soft);
}

.search-icon {
  width: 18px;
  height: 18px;
  color: var(--site-text-muted);
  margin-right: 0.6rem;
  flex-shrink: 0;
}

.recommend-search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 0.95rem;
  color: var(--site-text-primary);
  width: 100%;
  min-width: 0;
}

.clear-input-btn {
  background: transparent;
  border: none;
  font-size: 1.25rem;
  line-height: 1;
  color: var(--site-text-muted);
  cursor: pointer;
  padding: 0 0.3rem;
}

.tags-filter-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.tags-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--site-text-muted);
  white-space: nowrap;
}

.tags-group {
  display: flex;
  gap: 0.45rem;
  flex-wrap: wrap;
}

.tag-filter-btn {
  font-size: 0.825rem;
  padding: 0.3rem 0.75rem;
  border-radius: var(--site-radius-full);
  background: var(--site-bg-subtle);
  border: 1px solid var(--site-border-color);
  color: var(--site-text-secondary);
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.tag-filter-btn:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.tag-filter-btn.active {
  background: var(--vp-c-brand-1);
  color: #ffffff;
  border-color: var(--vp-c-brand-1);
}

.result-count-tip {
  margin-top: 0.85rem;
  font-size: 0.825rem;
  color: var(--site-text-muted);
}

.result-count-tip strong {
  color: var(--vp-c-brand-1);
}

/* Empty state */
.empty-state-box {
  padding: 2.5rem 1rem;
  text-align: center;
  color: var(--site-text-muted);
  background: var(--site-bg-subtle);
  border: 1px dashed var(--site-border-subtle);
  border-radius: var(--site-radius-md);
  margin: 1.5rem 0;
}

/* Auto-wrapping Provider Cards List */
.provider-auto-wrap-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.25rem;
  width: 100%;
  box-sizing: border-box;
}

.provider-item-card {
  background: var(--site-card-bg);
  border: 1px solid var(--site-card-border);
  border-radius: var(--site-radius-lg);
  padding: 1.35rem;
  box-shadow: var(--site-card-shadow);
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  box-sizing: border-box;
  width: 100%;
  overflow-wrap: break-word;
  word-break: break-word;
}

.provider-item-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--site-card-shadow-hover);
  border-color: var(--vp-c-brand-1);
}

.provider-item-card.is-top-pick {
  border: 1.5px solid var(--vp-c-brand-1);
  background: linear-gradient(var(--vp-c-brand-soft), var(--vp-c-brand-soft)), var(--site-card-bg);
}

.top-pick-pill {
  display: inline-block;
  padding: 0.1rem 0.5rem;
  border-radius: var(--site-radius-full);
  font-size: 0.75rem;
  font-weight: 700;
  color: #ffffff;
  background: var(--vp-c-brand-1);
  white-space: nowrap;
}

.card-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}

.brand-title-wrap {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.brand-heading {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--site-text-primary);
  line-height: 1.3;
}

.discount-pill {
  font-size: 0.725rem;
  font-weight: 600;
  background: #ef4444;
  color: #ffffff;
  padding: 0.15rem 0.5rem;
  border-radius: var(--site-radius-full);
  white-space: nowrap;
}

.price-badge-wrap {
  text-align: right;
  white-space: nowrap;
}

.price-number {
  font-size: 1.35rem;
  font-weight: 800;
  color: var(--vp-c-brand-1);
}

.price-period {
  font-size: 0.8rem;
  color: var(--site-text-muted);
}

.verdict-line {
  margin: 0 0 0.85rem;
  font-size: 0.92rem;
  font-weight: 600;
  line-height: 1.55;
  color: var(--site-text-primary);
}

.verdict-label {
  display: inline-block;
  margin-right: 0.45rem;
  padding: 0.05rem 0.45rem;
  border-radius: var(--site-radius-sm);
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
  vertical-align: 0.1em;
}

.coupon-notice-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.3);
  padding: 0.4rem 0.65rem;
  border-radius: var(--site-radius-sm);
  margin-bottom: 0.85rem;
  font-size: 0.825rem;
  flex-wrap: wrap;
}

.coupon-label {
  color: #d97706;
  font-weight: 600;
}

.coupon-code {
  background: var(--site-bg-surface);
  color: #b45309;
  font-weight: 700;
  padding: 0.1rem 0.45rem;
  border-radius: 4px;
  border: 1px dashed #d97706;
}

.coupon-desc {
  color: var(--site-text-muted);
  font-size: 0.78rem;
}

.features-section {
  margin-bottom: 0.85rem;
}

.features-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.features-list li {
  display: flex;
  align-items: baseline;
  gap: 0.45rem;
  font-size: 0.88rem;
  color: var(--site-text-secondary);
  line-height: 1.45;
}

.check-mark {
  color: var(--vp-c-teal);
  font-weight: bold;
  flex-shrink: 0;
}

.tags-wrap {
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
  margin-bottom: 0.85rem;
}

.bestfor-chip {
  font-size: 0.75rem;
  padding: 0.15rem 0.5rem;
  border-radius: var(--site-radius-sm);
  background: var(--site-bg-subtle);
  color: var(--site-text-muted);
  border: 1px solid var(--site-border-color);
}

.support-info-row {
  font-size: 0.8rem;
  color: var(--site-text-muted);
  margin-bottom: 1.1rem;
}

.support-label {
  font-weight: 600;
  margin-right: 0.3rem;
}

.card-actions-wrap {
  margin-top: auto;
  display: flex;
  gap: 0.65rem;
  flex-wrap: wrap;
  width: 100%;
}

.action-btn-primary {
  flex: 1 1 130px;
  text-align: center;
  padding: 0.6rem 0.9rem;
  border-radius: var(--site-radius-md);
  font-size: 0.9rem;
  font-weight: 600;
  background: var(--vp-c-brand-1);
  color: #ffffff !important;
  text-decoration: none !important;
  transition: opacity 0.2s ease, transform 0.15s ease;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.action-btn-primary:hover {
  opacity: 0.92;
  transform: translateY(-1px);
}

.action-btn-secondary {
  flex: 1 1 100px;
  text-align: center;
  padding: 0.6rem 0.9rem;
  border-radius: var(--site-radius-md);
  font-size: 0.9rem;
  font-weight: 600;
  background: var(--site-bg-subtle);
  border: 1px solid var(--site-border-subtle);
  color: var(--site-text-primary) !important;
  text-decoration: none !important;
  transition: all 0.2s ease;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.action-btn-secondary:hover {
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1) !important;
  border-color: var(--vp-c-brand-1);
}

/* All brands navigation banner */
.all-brands-banner {
  margin-top: 2.25rem;
  background: linear-gradient(135deg, var(--site-bg-subtle) 0%, var(--vp-c-brand-soft) 100%);
  border: 1px solid var(--site-border-color);
  border-radius: var(--site-radius-lg);
  padding: 1.5rem 1.75rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.banner-title {
  margin: 0 0 0.35rem 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--site-text-primary);
}

.banner-desc {
  margin: 0;
  font-size: 0.925rem;
  color: var(--site-text-secondary);
  line-height: 1.5;
}

.banner-link-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.7rem 1.4rem;
  border-radius: var(--site-radius-md);
  font-size: 0.925rem;
  font-weight: 600;
  background: var(--vp-c-brand-1);
  color: #ffffff !important;
  text-decoration: none !important;
  white-space: nowrap;
  transition: transform 0.15s ease, opacity 0.15s ease;
  min-height: 44px;
}

.banner-link-btn:hover {
  opacity: 0.92;
  transform: translateY(-1px);
}

/* Mobile full adaptation: Zero horizontal scroll, comfortable touch targets */
@media (max-width: 640px) {
  .provider-auto-wrap-list {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .filter-controls-card {
    padding: 1rem 0.85rem;
  }

  .tags-filter-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .card-actions-wrap {
    flex-direction: column;
  }

  .action-btn-primary,
  .action-btn-secondary {
    width: 100%;
    flex: none;
    min-height: 44px;
  }

  .all-brands-banner {
    flex-direction: column;
    align-items: stretch;
    padding: 1.25rem 1rem;
    text-align: left;
  }

  .banner-link-btn {
    width: 100%;
  }
}
</style>
