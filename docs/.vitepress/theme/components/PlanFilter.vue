<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import rawProviders from '../../data/providers.json'

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
  relationship?: string
  affUrl?: string
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
  lineType?: string
  startPrice?: string
}

interface FlattenedPlan {
  providerName: string
  providerSlug: string
  logo?: string
  planName: string
  trafficRaw: string
  trafficGB: number // parsed traffic in GB
  period: 'monthly' | 'quarterly' | 'semiannual' | 'annual' | 'oneTime'
  periodLabel: string
  price: number // numeric price
  priceDisplay: string
  monthlyEquiv: number // price per month
  pricePerGB: number // price per GB
  coupon?: string | null
  couponDiscount?: string | null
  discountedPrice?: number
  features: string[]
  affUrl: string
  lineType: string
  isFeatured: boolean
}

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

const guideMap: Record<string, string> = {
  weifengwangluo: '/guides/weifeng-guide',
  feimaoyun: '/guides/feimao-guide',
  muguangjiasu: '/guides/muguang-guide',
  dalao: '/brands/dalao',
  firefly: '/guides/firefly-guide',
  lingmao: '/guides/lingmao-guide',
  shanyue: '/guides/shanyue-guide',
  wuyoulianjie: '/guides/wuyou-guide',
  kuajieyun: '/guides/kuajie-guide'
}

function getBrandGuideUrl(slug: string): string {
  return guideMap[slug] || `/brands/${slug}`
}

function parseTraffic(trafficStr?: string | null): number {
  if (!trafficStr) return 0
  const upper = trafficStr.toUpperCase()
  const numMatch = upper.match(/([\d.]+)/)
  if (!numMatch) return 0
  const num = parseFloat(numMatch[1])
  if (upper.includes('TB') || upper.includes('T')) {
    return num * 1024
  }
  return num
}

function parsePrice(priceStr?: string | null): number | null {
  if (!priceStr) return null
  const numMatch = priceStr.match(/([\d.]+)/)
  return numMatch ? parseFloat(numMatch[1]) : null
}

// Flatten all plans across providers for precise filtering
const allPlans = computed<FlattenedPlan[]>(() => {
  const list: FlattenedPlan[] = []
  const providers = rawProviders as Provider[]

  for (const p of providers) {
    if (!p.plans || p.plans.length === 0) continue
    const isFeatured = featuredSlugs.includes(p.slug)
    const lineType = p.lineType || (p.features?.some(f => f.includes('IPLC') || f.includes('专线')) ? 'IPLC' : '中转')
    const features = p.features || []
    const officialUrl = `/go/${p.slug}/`

    for (const plan of p.plans) {
      const trafficGB = parseTraffic(plan.traffic)

      // Monthly
      const mPrice = parsePrice(plan.monthly)
      if (mPrice !== null && mPrice > 0) {
        list.push({
          providerName: p.name,
          providerSlug: p.slug,
          logo: p.logo,
          planName: plan.name,
          trafficRaw: plan.traffic,
          trafficGB,
          period: 'monthly',
          periodLabel: '月付',
          price: mPrice,
          priceDisplay: `¥${mPrice.toFixed(2)}/月`,
          monthlyEquiv: mPrice,
          pricePerGB: trafficGB > 0 ? mPrice / trafficGB : 0,
          coupon: p.coupon,
          couponDiscount: p.couponDiscount,
          features,
          affUrl: officialUrl,
          lineType,
          isFeatured
        })
      }

      // Quarterly
      const qPrice = parsePrice(plan.quarterly)
      if (qPrice !== null && qPrice > 0) {
        const mEq = qPrice / 3
        list.push({
          providerName: p.name,
          providerSlug: p.slug,
          logo: p.logo,
          planName: plan.name,
          trafficRaw: plan.traffic,
          trafficGB,
          period: 'quarterly',
          periodLabel: '季付',
          price: qPrice,
          priceDisplay: `¥${qPrice.toFixed(2)}/季`,
          monthlyEquiv: mEq,
          pricePerGB: trafficGB > 0 ? mEq / trafficGB : 0,
          coupon: p.coupon,
          couponDiscount: p.couponDiscount,
          features,
          affUrl: officialUrl,
          lineType,
          isFeatured
        })
      }

      // Annual
      const aPrice = parsePrice(plan.annual)
      if (aPrice !== null && aPrice > 0) {
        const mEq = aPrice / 12
        list.push({
          providerName: p.name,
          providerSlug: p.slug,
          logo: p.logo,
          planName: plan.name,
          trafficRaw: plan.traffic,
          trafficGB,
          period: 'annual',
          periodLabel: '年付',
          price: aPrice,
          priceDisplay: `¥${aPrice.toFixed(2)}/年`,
          monthlyEquiv: mEq,
          pricePerGB: trafficGB > 0 ? mEq / trafficGB : 0,
          coupon: p.coupon,
          couponDiscount: p.couponDiscount,
          features,
          affUrl: officialUrl,
          lineType,
          isFeatured
        })
      }

      // One Time (不限时)
      const oPrice = parsePrice(plan.oneTime)
      if (oPrice !== null && oPrice > 0) {
        list.push({
          providerName: p.name,
          providerSlug: p.slug,
          logo: p.logo,
          planName: plan.name,
          trafficRaw: plan.traffic,
          trafficGB,
          period: 'oneTime',
          periodLabel: '不限时',
          price: oPrice,
          priceDisplay: `¥${oPrice.toFixed(2)} 一次性`,
          monthlyEquiv: oPrice / 12, // nominal for comparison
          pricePerGB: trafficGB > 0 ? oPrice / trafficGB : 0,
          coupon: p.coupon,
          couponDiscount: p.couponDiscount,
          features,
          affUrl: officialUrl,
          lineType,
          isFeatured
        })
      }
    }
  }

  return list
})

// Filter states
const selectedBudget = ref<'all' | 'under15' | '15to30' | '30to60' | 'above60'>('all')
const selectedTraffic = ref<'all' | 'under100' | '100to300' | '300to600' | 'above600'>('all')
const selectedPeriod = ref<'all' | 'monthly' | 'quarterly' | 'annual' | 'oneTime'>('all')
const selectedLine = ref<'all' | 'IPLC' | '中转'>('all')
const onlyFeatured = ref(false)
const sortBy = ref<'default' | 'priceAsc' | 'priceDesc' | 'trafficDesc' | 'valueAsc'>('default')
const searchKeyword = ref('')

// View mode: 'grid' (cards) vs 'table' (compact list)
const viewMode = ref<'grid' | 'table'>('grid')

// Pagination states
const currentPage = ref(1)
const pageSize = ref<number>(12) // 12, 24, 48, or 0 (all)
const isFilterExpanded = ref(true)

// Quick Preset Handlers
function applyPreset(type: 'featured' | 'iplc' | 'cheap' | 'onetime' | 'large') {
  resetFilters()
  if (type === 'featured') {
    onlyFeatured.value = true
  } else if (type === 'iplc') {
    selectedLine.value = 'IPLC'
  } else if (type === 'cheap') {
    selectedBudget.value = 'under15'
  } else if (type === 'onetime') {
    selectedPeriod.value = 'oneTime'
  } else if (type === 'large') {
    selectedTraffic.value = '300to600'
  }
}

// Reset filters
function resetFilters() {
  selectedBudget.value = 'all'
  selectedTraffic.value = 'all'
  selectedPeriod.value = 'all'
  selectedLine.value = 'all'
  onlyFeatured.value = false
  sortBy.value = 'default'
  searchKeyword.value = ''
  currentPage.value = 1
}

// Active filter count
const activeFilterCount = computed(() => {
  let count = 0
  if (searchKeyword.value.trim()) count++
  if (selectedBudget.value !== 'all') count++
  if (selectedTraffic.value !== 'all') count++
  if (selectedPeriod.value !== 'all') count++
  if (selectedLine.value !== 'all') count++
  if (onlyFeatured.value) count++
  return count
})

// Filtered and sorted plans
const filteredPlans = computed(() => {
  let res = allPlans.value.filter(plan => {
    // Search keyword
    if (searchKeyword.value.trim()) {
      const q = searchKeyword.value.trim().toLowerCase()
      const matchName = plan.providerName.toLowerCase().includes(q)
      const matchPlan = plan.planName.toLowerCase().includes(q)
      if (!matchName && !matchPlan) return false
    }

    // Featured only
    if (onlyFeatured.value && !plan.isFeatured) {
      return false
    }

    // Budget (monthly equivalent)
    if (selectedBudget.value === 'under15' && plan.monthlyEquiv >= 15) return false
    if (selectedBudget.value === '15to30' && (plan.monthlyEquiv < 15 || plan.monthlyEquiv > 30)) return false
    if (selectedBudget.value === '30to60' && (plan.monthlyEquiv < 30 || plan.monthlyEquiv > 60)) return false
    if (selectedBudget.value === 'above60' && plan.monthlyEquiv <= 60) return false

    // Traffic
    if (selectedTraffic.value === 'under100' && plan.trafficGB >= 100) return false
    if (selectedTraffic.value === '100to300' && (plan.trafficGB < 100 || plan.trafficGB > 300)) return false
    if (selectedTraffic.value === '300to600' && (plan.trafficGB < 300 || plan.trafficGB > 600)) return false
    if (selectedTraffic.value === 'above600' && plan.trafficGB <= 600) return false

    // Period
    if (selectedPeriod.value !== 'all' && plan.period !== selectedPeriod.value) return false

    // Line Type
    if (selectedLine.value === 'IPLC' && plan.lineType !== 'IPLC') return false
    if (selectedLine.value === '中转' && plan.lineType === 'IPLC') return false

    return true
  })

  // Sorting
  if (sortBy.value === 'priceAsc') {
    res = [...res].sort((a, b) => a.monthlyEquiv - b.monthlyEquiv)
  } else if (sortBy.value === 'priceDesc') {
    res = [...res].sort((a, b) => b.monthlyEquiv - a.monthlyEquiv)
  } else if (sortBy.value === 'trafficDesc') {
    res = [...res].sort((a, b) => b.trafficGB - a.trafficGB)
  } else if (sortBy.value === 'valueAsc') {
    res = [...res].sort((a, b) => a.pricePerGB - b.pricePerGB)
  } else {
    // Default: featured first, then lower price
    res = [...res].sort((a, b) => {
      if (a.isFeatured && !b.isFeatured) return -1
      if (!a.isFeatured && b.isFeatured) return 1
      return a.monthlyEquiv - b.monthlyEquiv
    })
  }

  return res
})

// Total pages
const totalPages = computed(() => {
  if (pageSize.value === 0) return 1
  return Math.ceil(filteredPlans.value.length / pageSize.value) || 1
})

// Paginated plans to render in DOM
const paginatedPlans = computed(() => {
  if (pageSize.value === 0) return filteredPlans.value
  const start = (currentPage.value - 1) * pageSize.value
  return filteredPlans.value.slice(start, start + pageSize.value)
})

// Display range
const startItemIndex = computed(() => {
  if (filteredPlans.value.length === 0) return 0
  return (currentPage.value - 1) * pageSize.value + 1
})

const endItemIndex = computed(() => {
  if (pageSize.value === 0) return filteredPlans.value.length
  return Math.min(currentPage.value * pageSize.value, filteredPlans.value.length)
})

// Reset to page 1 on filter changes
watch(
  [selectedBudget, selectedTraffic, selectedPeriod, selectedLine, onlyFeatured, sortBy, searchKeyword, pageSize],
  () => {
    currentPage.value = 1
  }
)

function scrollToResults() {
  nextTick(() => {
    const el = document.getElementById('plan-results-anchor')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  })
}

function setPage(p: number) {
  if (p < 1 || p > totalPages.value) return
  currentPage.value = p
  scrollToResults()
}

// Generate compact visible page numbers
const visiblePageNumbers = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  const pages: (number | string)[] = []

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    pages.push(1)
    if (current > 3) pages.push('...')

    const start = Math.max(2, current - 1)
    const end = Math.min(total - 1, current + 1)
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    if (current < total - 2) pages.push('...')
    pages.push(total)
  }
  return pages
})

// Copy coupon feedback
const copiedCoupon = ref<string | null>(null)
function copyCode(code: string) {
  if (!code) return
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    navigator.clipboard.writeText(code).then(() => {
      copiedCoupon.value = code
      setTimeout(() => {
        copiedCoupon.value = null
      }, 2000)
    })
  }
}
</script>

<template>
  <div class="smart-plan-filter">
    <!-- Preset Shortcuts Banner -->
    <div class="quick-preset-bar">
      <span class="preset-label">⚡ 常用快捷直达：</span>
      <div class="preset-pills">
        <button
          class="preset-btn"
          :class="{ active: onlyFeatured }"
          @click="applyPreset('featured')"
        >
          🌟 9 大主力
        </button>
        <button
          class="preset-btn"
          :class="{ active: selectedLine === 'IPLC' }"
          @click="applyPreset('iplc')"
        >
          ⚡ 纯 IPLC 专线
        </button>
        <button
          class="preset-btn"
          :class="{ active: selectedBudget === 'under15' }"
          @click="applyPreset('cheap')"
        >
          💰 ¥15 内入门白菜
        </button>
        <button
          class="preset-btn"
          :class="{ active: selectedPeriod === 'oneTime' }"
          @click="applyPreset('onetime')"
        >
          📦 不限时备用包
        </button>
        <button
          class="preset-btn"
          :class="{ active: selectedTraffic === '300to600' }"
          @click="applyPreset('large')"
        >
          🚀 300G+ 大流量
        </button>
        <button
          v-if="activeFilterCount > 0"
          class="preset-btn reset-preset-btn"
          @click="resetFilters"
        >
          ↺ 还原全部
        </button>
      </div>
    </div>

    <!-- Filter Bar Card -->
    <div class="filter-controls-card">
      <div class="filter-header">
        <div class="filter-title-wrap">
          <span class="filter-icon">🔍</span>
          <h3 class="filter-title">套餐参数精准筛选</h3>
          <span class="plan-count-badge">匹配 {{ filteredPlans.length }} 款套餐</span>
          <span v-if="activeFilterCount > 0" class="active-count-tag">
            已启用 {{ activeFilterCount }} 个条件
          </span>
        </div>
        <div class="filter-header-actions">
          <button
            class="toggle-filter-btn"
            @click="isFilterExpanded = !isFilterExpanded"
            :title="isFilterExpanded ? '收起筛选面板' : '展开筛选面板'"
          >
            {{ isFilterExpanded ? '收起条件 ▲' : '展开条件 ▼' }}
          </button>
          <button class="reset-btn" @click="resetFilters" title="重置全部筛选条件">
            ↺ 重置
          </button>
        </div>
      </div>

      <!-- Keyword Search (Always Visible) -->
      <div class="filter-row search-row">
        <label class="row-label">关键词速查</label>
        <div class="search-input-wrap">
          <input
            v-model="searchKeyword"
            type="text"
            class="filter-search-input"
            placeholder="输入品牌或套餐关键词（如：微风、星耀、清风、不限时、9yun...）"
          />
          <button v-if="searchKeyword" class="clear-search-btn" @click="searchKeyword = ''">×</button>
        </div>
      </div>

      <!-- Collapsible Detailed Filters -->
      <div v-show="isFilterExpanded" class="collapsible-filters-wrap">
        <!-- Budget Selector -->
        <div class="filter-row">
          <label class="row-label">预算区间</label>
          <div class="pill-group">
            <button
              class="filter-pill"
              :class="{ active: selectedBudget === 'all' }"
              @click="selectedBudget = 'all'"
            >全部预算</button>
            <button
              class="filter-pill"
              :class="{ active: selectedBudget === 'under15' }"
              @click="selectedBudget = 'under15'"
            >&lt; ¥15/月 (白菜入门)</button>
            <button
              class="filter-pill"
              :class="{ active: selectedBudget === '15to30' }"
              @click="selectedBudget = '15to30'"
            >¥15 - ¥30/月 (主流优选)</button>
            <button
              class="filter-pill"
              :class="{ active: selectedBudget === '30to60' }"
              @click="selectedBudget = '30to60'"
            >¥30 - ¥60/月 (高阶专线)</button>
            <button
              class="filter-pill"
              :class="{ active: selectedBudget === 'above60' }"
              @click="selectedBudget = 'above60'"
            >&gt; ¥60/月 (尊享旗舰)</button>
          </div>
        </div>

        <!-- Traffic Requirement -->
        <div class="filter-row">
          <label class="row-label">月流量需求</label>
          <div class="pill-group">
            <button
              class="filter-pill"
              :class="{ active: selectedTraffic === 'all' }"
              @click="selectedTraffic = 'all'"
            >不限流量</button>
            <button
              class="filter-pill"
              :class="{ active: selectedTraffic === 'under100' }"
              @click="selectedTraffic = 'under100'"
            >&lt; 100 GB (轻度备用)</button>
            <button
              class="filter-pill"
              :class="{ active: selectedTraffic === '100to300' }"
              @click="selectedTraffic = '100to300'"
            >100 - 300 GB (日常办公)</button>
            <button
              class="filter-pill"
              :class="{ active: selectedTraffic === '300to600' }"
              @click="selectedTraffic = '300to600'"
            >300 - 600 GB (追剧与AI)</button>
            <button
              class="filter-pill"
              :class="{ active: selectedTraffic === 'above600' }"
              @click="selectedTraffic = 'above600'"
            >&gt; 600 GB / 1TB+ (超大流量)</button>
          </div>
        </div>

        <!-- Payment Period -->
        <div class="filter-row">
          <label class="row-label">付款周期</label>
          <div class="pill-group">
            <button
              class="filter-pill"
              :class="{ active: selectedPeriod === 'all' }"
              @click="selectedPeriod = 'all'"
            >全部周期</button>
            <button
              class="filter-pill"
              :class="{ active: selectedPeriod === 'monthly' }"
              @click="selectedPeriod = 'monthly'"
            >按月付 (灵活无顾虑)</button>
            <button
              class="filter-pill"
              :class="{ active: selectedPeriod === 'quarterly' }"
              @click="selectedPeriod = 'quarterly'"
            >季付 (省心过渡)</button>
            <button
              class="filter-pill"
              :class="{ active: selectedPeriod === 'annual' }"
              @click="selectedPeriod = 'annual'"
            >年付 (极限折扣)</button>
            <button
              class="filter-pill"
              :class="{ active: selectedPeriod === 'oneTime' }"
              @click="selectedPeriod = 'oneTime'"
            >不限时包 (备用神器)</button>
          </div>
        </div>

        <!-- Line & Toggles -->
        <div class="filter-row bottom-controls">
          <div class="inline-control">
            <label class="row-label">线路类型</label>
            <div class="pill-group">
              <button
                class="filter-pill"
                :class="{ active: selectedLine === 'all' }"
                @click="selectedLine = 'all'"
              >全部线路</button>
              <button
                class="filter-pill"
                :class="{ active: selectedLine === 'IPLC' }"
                @click="selectedLine = 'IPLC'"
              >⚡ IPLC/IEPL 内网专线</button>
              <button
                class="filter-pill"
                :class="{ active: selectedLine === '中转' }"
                @click="selectedLine = '中转'"
              >🌐 BGP优质中转</button>
            </div>
          </div>

          <div class="inline-control checkbox-control">
            <label class="checkbox-label">
              <input type="checkbox" v-model="onlyFeatured" />
              <span>仅看头部精选 9 大主力品牌</span>
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- Anchor for smooth scrolling -->
    <div id="plan-results-anchor" class="results-anchor"></div>

    <!-- Results Control Toolbar -->
    <div class="results-toolbar">
      <div class="toolbar-left">
        <span class="results-stat-text">
          共找到 <strong>{{ filteredPlans.length }}</strong> 款套餐
          <span v-if="pageSize > 0" class="page-range-tip">
            (展示第 {{ startItemIndex }} - {{ endItemIndex }} 款)
          </span>
        </span>
      </div>

      <div class="toolbar-right">
        <!-- Sort Control -->
        <div class="tool-item">
          <span class="tool-label">排序：</span>
          <select v-model="sortBy" class="filter-select">
            <option value="default">默认推荐排序</option>
            <option value="priceAsc">月均单价从低到高</option>
            <option value="priceDesc">月均单价从高到低</option>
            <option value="trafficDesc">流量从大到小</option>
            <option value="valueAsc">每GB性价比最高 (元/GB)</option>
          </select>
        </div>

        <!-- Page Size Selector -->
        <div class="tool-item">
          <span class="tool-label">每页：</span>
          <select v-model.number="pageSize" class="filter-select page-size-select">
            <option :value="12">12 款 (精简)</option>
            <option :value="24">24 款 (推荐)</option>
            <option :value="48">48 款 (较多)</option>
            <option :value="0">全部平铺</option>
          </select>
        </div>

        <!-- View Mode Switch -->
        <div class="view-mode-toggle">
          <button
            class="view-btn"
            :class="{ active: viewMode === 'grid' }"
            @click="viewMode = 'grid'"
            title="网格卡片视图"
          >
            🗂️ 卡片
          </button>
          <button
            class="view-btn"
            :class="{ active: viewMode === 'table' }"
            @click="viewMode = 'table'"
            title="紧凑表格对比视图"
          >
            📋 表格
          </button>
        </div>
      </div>
    </div>

    <!-- MODE 1: Grid Cards View -->
    <div v-if="filteredPlans.length > 0 && viewMode === 'grid'" class="plans-grid">
      <div
        v-for="item in paginatedPlans"
        :key="`${item.providerSlug}-${item.planName}-${item.period}`"
        class="plan-card"
        :class="{ 'featured-border': item.isFeatured }"
      >
        <!-- Card Header -->
        <div class="plan-card-top">
          <div class="brand-info">
            <img v-if="item.logo" :src="item.logo" :alt="item.providerName" class="brand-mini-logo" />
            <div v-else class="brand-fallback-icon">
              {{ item.providerName.slice(0, 2) }}
            </div>
            <div>
              <div class="brand-title-wrap">
                <span class="provider-title">{{ item.providerName }}</span>
                <span v-if="item.isFeatured" class="verified-tag">精选严选</span>
              </div>
              <h4 class="plan-heading">{{ item.planName }}</h4>
            </div>
          </div>
          <span class="line-badge" :class="item.lineType === 'IPLC' ? 'iplc-badge' : 'transit-badge'">
            {{ item.lineType }}
          </span>
        </div>

        <!-- Price & Traffic Metrics -->
        <div class="plan-metrics-box">
          <div class="metric-item">
            <span class="metric-label">套餐流量</span>
            <span class="metric-val traffic-val">{{ item.trafficRaw }}</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">结算价格</span>
            <span class="metric-val price-val">{{ item.priceDisplay }}</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">折合单月</span>
            <span class="metric-val month-equiv">¥{{ item.monthlyEquiv.toFixed(1) }} /月</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">单价估算</span>
            <span class="metric-val gb-equiv">¥{{ item.pricePerGB.toFixed(3) }} /GB</span>
          </div>
        </div>

        <!-- Features list -->
        <ul class="plan-features">
          <li v-for="(feat, fIdx) in item.features.slice(0, 2)" :key="fIdx">
            ✓ {{ feat }}
          </li>
        </ul>

        <!-- Coupon row if available -->
        <div v-if="item.coupon" class="plan-coupon-box">
          <span class="coupon-tag-badge">{{ item.couponDiscount || '优惠码' }}</span>
          <span class="coupon-code-text">{{ item.coupon }}</span>
          <button class="copy-coupon-btn" @click="copyCode(item.coupon)">
            {{ copiedCoupon === item.coupon ? '已复制！' : '复制券码' }}
          </button>
        </div>

        <!-- Action Buttons -->
        <div class="plan-card-actions">
          <a :href="item.affUrl" target="_blank" rel="nofollow noopener noreferrer sponsored" class="btn-buy-primary">
            直达官网选购 →
          </a>
          <a :href="getBrandGuideUrl(item.providerSlug)" class="btn-view-guide">
            技术档案
          </a>
        </div>
      </div>
    </div>

    <!-- MODE 2: Compact Table View (Very convenient for quick scanning) -->
    <div v-else-if="filteredPlans.length > 0 && viewMode === 'table'" class="compact-table-wrap">
      <table class="compact-plan-table">
        <thead>
          <tr>
            <th>品牌 / 套餐</th>
            <th>线路</th>
            <th>流量配额</th>
            <th>计费周期</th>
            <th>结算实付</th>
            <th>折合月费</th>
            <th>优惠码</th>
            <th class="th-actions">操作直达</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in paginatedPlans"
            :key="`tbl-${item.providerSlug}-${item.planName}-${item.period}`"
            :class="{ 'featured-row': item.isFeatured }"
          >
            <td class="td-brand">
              <div class="table-brand-cell">
                <img v-if="item.logo" :src="item.logo" :alt="item.providerName" class="table-brand-icon" />
                <div class="table-brand-text">
                  <div class="table-provider-name">
                    {{ item.providerName }}
                    <span v-if="item.isFeatured" class="table-featured-pill">精选</span>
                  </div>
                  <div class="table-plan-name">{{ item.planName }}</div>
                </div>
              </div>
            </td>
            <td>
              <span class="line-badge" :class="item.lineType === 'IPLC' ? 'iplc-badge' : 'transit-badge'">
                {{ item.lineType }}
              </span>
            </td>
            <td class="td-traffic">{{ item.trafficRaw }}</td>
            <td class="td-period">
              <span class="period-pill">{{ item.periodLabel }}</span>
            </td>
            <td class="td-price">{{ item.priceDisplay }}</td>
            <td class="td-equiv">
              <strong>¥{{ item.monthlyEquiv.toFixed(1) }}</strong> <span class="sub-mo">/月</span>
            </td>
            <td class="td-coupon">
              <div v-if="item.coupon" class="table-coupon-cell">
                <code class="table-coupon-code">{{ item.coupon }}</code>
                <button
                  class="table-copy-btn"
                  @click="copyCode(item.coupon)"
                  title="点击复制优惠码"
                >
                  {{ copiedCoupon === item.coupon ? '✓' : '复制' }}
                </button>
              </div>
              <span v-else class="text-muted-dash">-</span>
            </td>
            <td class="td-actions">
              <a :href="item.affUrl" target="_blank" rel="nofollow noopener noreferrer sponsored" class="table-buy-btn">
                直达 →
              </a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state-box">
      <div class="empty-icon">📂</div>
      <h3>没有找到完全匹配该条件的套餐</h3>
      <p>建议放宽预算区间、月流量限制或取消部分勾选项重新筛选。</p>
      <button class="reset-btn empty-reset" @click="resetFilters">
        重置所有筛选条件
      </button>
    </div>

    <!-- Pagination Navigation Bar -->
    <div v-if="filteredPlans.length > 0 && pageSize > 0 && totalPages > 1" class="pagination-bar">
      <div class="pagination-info">
        <span>第 {{ currentPage }} / {{ totalPages }} 页</span>
      </div>

      <div class="pagination-buttons">
        <button
          class="page-nav-btn"
          :disabled="currentPage <= 1"
          @click="setPage(currentPage - 1)"
        >
          ← 上一页
        </button>

        <template v-for="(p, pIndex) in visiblePageNumbers" :key="pIndex">
          <span v-if="p === '...'" class="page-ellipsis">...</span>
          <button
            v-else
            class="page-num-btn"
            :class="{ active: p === currentPage }"
            @click="setPage(p as number)"
          >
            {{ p }}
          </button>
        </template>

        <button
          class="page-nav-btn"
          :disabled="currentPage >= totalPages"
          @click="setPage(currentPage + 1)"
        >
          下一页 →
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.smart-plan-filter {
  margin: 1.5rem 0 3rem;
  font-family: var(--vp-font-family-base);
}

/* Quick Presets Bar */
.quick-preset-bar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}

.preset-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}

.preset-pills {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.preset-btn {
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-2);
  padding: 0.35rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.82rem;
  cursor: pointer;
  transition: all 0.15s ease;
  font-weight: 600;
}

.preset-btn:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.preset-btn.active {
  background: var(--vp-c-brand-1);
  color: #ffffff;
  border-color: var(--vp-c-brand-1);
}

.reset-preset-btn {
  border-style: dashed;
  color: var(--vp-c-text-3);
}

/* Filter Controls Card */
.filter-controls-card {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 14px;
  padding: 1.25rem 1.5rem;
  margin-bottom: 1.5rem;
}

.filter-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--vp-c-divider);
  padding-bottom: 0.85rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.filter-title-wrap {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
}

.filter-icon {
  font-size: 1.2rem;
}

.filter-title {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}

.plan-count-badge {
  background: rgba(37, 99, 235, 0.1);
  color: var(--vp-c-brand-1);
  padding: 0.2rem 0.65rem;
  border-radius: 9999px;
  font-size: 0.82rem;
  font-weight: 600;
}

.active-count-tag {
  background: rgba(16, 185, 129, 0.12);
  color: #059669;
  padding: 0.15rem 0.55rem;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 600;
}

.filter-header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.toggle-filter-btn {
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-brand-1);
  border-radius: 8px;
  padding: 0.35rem 0.75rem;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.toggle-filter-btn:hover {
  border-color: var(--vp-c-brand-1);
}

.reset-btn {
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-2);
  border-radius: 8px;
  padding: 0.35rem 0.75rem;
  font-size: 0.82rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.reset-btn:hover {
  color: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
}

.filter-row {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 1rem;
}

.row-label {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--vp-c-text-2);
}

.pill-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.filter-pill {
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-2);
  padding: 0.35rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.82rem;
  cursor: pointer;
  transition: all 0.15s ease;
  font-weight: 500;
}

.filter-pill:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.filter-pill.active {
  background: var(--vp-c-brand-1);
  color: #ffffff;
  border-color: var(--vp-c-brand-1);
  font-weight: 600;
}

.search-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.filter-search-input {
  width: 100%;
  padding: 0.55rem 0.9rem;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.2s ease;
}

.filter-search-input:focus {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}

.clear-search-btn {
  position: absolute;
  right: 0.75rem;
  background: transparent;
  border: none;
  font-size: 1.1rem;
  color: var(--vp-c-text-3);
  cursor: pointer;
}

.bottom-controls {
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  padding-top: 0.75rem;
  border-top: 1px dashed var(--vp-c-divider);
  margin-bottom: 0;
  gap: 0.75rem;
}

.inline-control {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
  cursor: pointer;
  user-select: none;
}

.results-anchor {
  scroll-margin-top: 80px;
}

/* Results Toolbar */
.results-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  padding: 0.65rem 1rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.results-stat-text {
  font-size: 0.88rem;
  color: var(--vp-c-text-2);
}

.results-stat-text strong {
  color: var(--vp-c-brand-1);
}

.page-range-tip {
  font-size: 0.82rem;
  color: var(--vp-c-text-3);
  margin-left: 0.35rem;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  flex-wrap: wrap;
}

.tool-item {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.tool-label {
  font-size: 0.82rem;
  color: var(--vp-c-text-3);
}

.filter-select {
  padding: 0.35rem 0.65rem;
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 0.82rem;
  outline: none;
  cursor: pointer;
}

.page-size-select {
  font-weight: 600;
}

.view-mode-toggle {
  display: flex;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  overflow: hidden;
  background: var(--vp-c-bg);
}

.view-btn {
  background: transparent;
  border: none;
  padding: 0.35rem 0.65rem;
  font-size: 0.8rem;
  cursor: pointer;
  color: var(--vp-c-text-2);
  transition: all 0.15s ease;
  font-weight: 500;
}

.view-btn.active {
  background: var(--vp-c-brand-1);
  color: #ffffff;
  font-weight: 600;
}

/* Card Grid Layout */
.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(310px, 1fr));
  gap: 1.25rem;
}

.plan-card {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.plan-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06);
  border-color: var(--vp-c-brand-1);
}

.plan-card.featured-border {
  border-color: rgba(37, 99, 235, 0.35);
}

.plan-card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.85rem;
}

.brand-info {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.brand-mini-logo {
  width: 38px;
  height: 38px;
  border-radius: 8px;
  object-fit: cover;
  border: 1px solid var(--vp-c-divider);
  background: #ffffff;
}

.brand-fallback-icon {
  width: 38px;
  height: 38px;
  border-radius: 8px;
  background: var(--vp-c-brand-1);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.82rem;
  font-weight: 700;
}

.brand-title-wrap {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.provider-title {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--vp-c-text-2);
}

.verified-tag {
  background: rgba(16, 185, 129, 0.15);
  color: #059669;
  font-size: 0.7rem;
  padding: 0.1rem 0.35rem;
  border-radius: 4px;
  font-weight: 600;
}

.plan-heading {
  margin: 0.15rem 0 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}

.line-badge {
  font-size: 0.72rem;
  padding: 0.15rem 0.5rem;
  border-radius: 9999px;
  font-weight: 600;
  white-space: nowrap;
}

.iplc-badge {
  background: rgba(37, 99, 235, 0.12);
  color: var(--vp-c-brand-1);
  border: 1px solid rgba(37, 99, 235, 0.25);
}

.transit-badge {
  background: rgba(100, 116, 139, 0.12);
  color: var(--vp-c-text-2);
}

.plan-metrics-box {
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 0.65rem 0.85rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  margin-bottom: 0.85rem;
}

.metric-item {
  display: flex;
  flex-direction: column;
}

.metric-label {
  font-size: 0.72rem;
  color: var(--vp-c-text-3);
}

.metric-val {
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}

.traffic-val {
  color: var(--vp-c-brand-1);
}

.price-val {
  color: #e11d48;
}

.month-equiv {
  font-size: 0.85rem;
}

.gb-equiv {
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
}

.plan-features {
  list-style: none;
  padding: 0;
  margin: 0 0 0.85rem;
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}

.plan-coupon-box {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(245, 158, 11, 0.1);
  border: 1px dashed rgba(245, 158, 11, 0.35);
  padding: 0.35rem 0.65rem;
  border-radius: 6px;
  margin-bottom: 0.85rem;
}

.coupon-tag-badge {
  background: #f59e0b;
  color: #ffffff;
  font-size: 0.7rem;
  padding: 0.1rem 0.35rem;
  border-radius: 4px;
  font-weight: 600;
}

.coupon-code-text {
  font-family: monospace;
  font-weight: 700;
  color: #b45309;
  font-size: 0.85rem;
  flex: 1;
}

.copy-coupon-btn {
  background: #ffffff;
  border: 1px solid #f59e0b;
  color: #b45309;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.copy-coupon-btn:hover {
  background: #f59e0b;
  color: #ffffff;
}

.plan-card-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: auto;
}

.btn-buy-primary {
  flex: 1.4;
  background: var(--vp-c-brand-1);
  color: #ffffff !important;
  text-align: center;
  padding: 0.45rem 0.75rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.15s ease;
}

.btn-buy-primary:hover {
  background: var(--vp-c-brand-2);
}

.btn-view-guide {
  flex: 1;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-2) !important;
  text-align: center;
  padding: 0.45rem 0.5rem;
  border-radius: 6px;
  font-size: 0.82rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.15s ease;
}

.btn-view-guide:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1) !important;
}

/* Compact Table Layout */
.compact-table-wrap {
  overflow-x: auto;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.compact-plan-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
  text-align: left;
}

.compact-plan-table th {
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  font-weight: 700;
  padding: 0.75rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
  white-space: nowrap;
}

.compact-plan-table td {
  padding: 0.75rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-1);
  vertical-align: middle;
}

.compact-plan-table tr:hover {
  background: var(--vp-c-bg);
}

.compact-plan-table tr.featured-row {
  background: rgba(37, 99, 235, 0.02);
}

.compact-plan-table tr.featured-row:hover {
  background: rgba(37, 99, 235, 0.06);
}

.table-brand-cell {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.table-brand-icon {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  object-fit: cover;
  border: 1px solid var(--vp-c-divider);
}

.table-brand-text {
  display: flex;
  flex-direction: column;
}

.table-provider-name {
  font-weight: 700;
  color: var(--vp-c-text-1);
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.table-featured-pill {
  font-size: 0.68rem;
  padding: 0.05rem 0.3rem;
  background: rgba(16, 185, 129, 0.15);
  color: #059669;
  border-radius: 4px;
}

.table-plan-name {
  font-size: 0.78rem;
  color: var(--vp-c-text-3);
}

.td-traffic {
  font-weight: 700;
  color: var(--vp-c-brand-1);
  white-space: nowrap;
}

.period-pill {
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  white-space: nowrap;
}

.td-price {
  font-weight: 700;
  color: #e11d48;
  white-space: nowrap;
}

.td-equiv {
  white-space: nowrap;
}

.td-equiv strong {
  font-size: 0.92rem;
  color: var(--vp-c-text-1);
}

.sub-mo {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
}

.table-coupon-cell {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.table-coupon-code {
  background: rgba(245, 158, 11, 0.12);
  color: #b45309;
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-family: monospace;
}

.table-copy-btn {
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-2);
  border-radius: 4px;
  padding: 0.15rem 0.4rem;
  font-size: 0.72rem;
  cursor: pointer;
}

.table-copy-btn:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.text-muted-dash {
  color: var(--vp-c-text-3);
}

.table-buy-btn {
  display: inline-block;
  background: var(--vp-c-brand-1);
  color: #ffffff !important;
  padding: 0.3rem 0.75rem;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 600;
  text-decoration: none;
  white-space: nowrap;
}

.table-buy-btn:hover {
  background: var(--vp-c-brand-2);
}

/* Pagination Bar */
.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 1.75rem;
  padding: 0.85rem 1.25rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  flex-wrap: wrap;
  gap: 1rem;
}

.pagination-info {
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
  font-weight: 500;
}

.pagination-buttons {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  flex-wrap: wrap;
}

.page-nav-btn {
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-1);
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.page-nav-btn:hover:not(:disabled) {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.page-nav-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-num-btn {
  min-width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-2);
  border-radius: 6px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.page-num-btn:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.page-num-btn.active {
  background: var(--vp-c-brand-1);
  color: #ffffff;
  border-color: var(--vp-c-brand-1);
}

.page-ellipsis {
  padding: 0 0.35rem;
  color: var(--vp-c-text-3);
  font-size: 0.85rem;
}

/* Empty State */
.empty-state-box {
  text-align: center;
  padding: 3rem 1.5rem;
  background: var(--vp-c-bg-soft);
  border: 1px dashed var(--vp-c-divider);
  border-radius: 14px;
}

.empty-icon {
  font-size: 2.5rem;
  margin-bottom: 0.75rem;
}

.empty-state-box h3 {
  margin: 0 0 0.5rem;
  font-size: 1.15rem;
  color: var(--vp-c-text-1);
}

.empty-state-box p {
  margin: 0 0 1.25rem;
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
}

.empty-reset {
  margin: 0 auto;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .results-toolbar {
    flex-direction: column;
    align-items: flex-start;
  }
  .toolbar-right {
    width: 100%;
    justify-content: space-between;
  }
  .pagination-bar {
    flex-direction: column;
    align-items: center;
  }
}
</style>
