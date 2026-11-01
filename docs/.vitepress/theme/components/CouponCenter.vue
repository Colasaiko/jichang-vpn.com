<script setup lang="ts">
import { ref, computed } from 'vue'
import rawProviders from '../../data/providers.json'

interface Provider {
  name: string
  slug: string
  coupon?: string | null
  couponDiscount?: string | null
  affUrl?: string
  logo?: string
  lineType?: string
  startPrice?: string
  features?: string[]
}

interface CouponItem {
  name: string
  slug: string
  coupon: string
  discount: string
  discountRate: number // numeric for sorting/filtering (e.g. 0.7 for 7折)
  affUrl: string
  logo?: string
  lineType: string
  startPrice: string
  isFeatured: boolean
  features: string[]
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
  dalao: '/guides/dalao-guide',
  firefly: '/guides/firefly-guide',
  lingmao: '/guides/lingmao-guide',
  shanyue: '/guides/shanyue-guide',
  wuyoulianjie: '/guides/wuyou-guide',
  kuajieyun: '/guides/kuajie-guide',
  sogoyun: '/brands/sogoyun',
  lingdongyun: '/brands/lingdongyun',
  yinxingren: '/brands/yinxingren',
  feiv: '/brands/feiv'
}

function getBrandGuideUrl(slug: string): string {
  return guideMap[slug] || `/brands/${slug}`
}

// Parse discount text like "7折", "85折", "8折", "9折"
function parseDiscountRate(str?: string | null): number {
  if (!str) return 0.85
  const clean = str.replace('折', '').trim()
  const val = parseFloat(clean)
  if (isNaN(val)) return 0.85
  if (val > 10) return val / 100 // e.g. 85 -> 0.85
  return val / 10 // e.g. 7 -> 0.7, 8 -> 0.8
}

// Extract valid coupons
const allCoupons = computed<CouponItem[]>(() => {
  const providers = rawProviders as Provider[]
  const list: CouponItem[] = []

  for (const p of providers) {
    if (!p.coupon) continue
    const isFeatured = featuredSlugs.includes(p.slug)
    const lineType = p.lineType || (p.features?.some(f => f.includes('IPLC') || f.includes('专线')) ? 'IPLC' : '中转')
    const discount = p.couponDiscount || '官方特惠'
    const discountRate = parseDiscountRate(p.couponDiscount)

    list.push({
      name: p.name,
      slug: p.slug,
      coupon: p.coupon,
      discount,
      discountRate,
      affUrl: `/go/${p.slug}/`,
      logo: p.logo,
      lineType,
      startPrice: p.startPrice || '详见官网',
      isFeatured,
      features: p.features || []
    })
  }

  // Strictly sort by user's designated ranking order (featuredSlugs)
  return list.sort((a, b) => {
    const indexA = featuredSlugs.indexOf(a.slug)
    const indexB = featuredSlugs.indexOf(b.slug)
    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB
    }
    if (indexA !== -1) return -1
    if (indexB !== -1) return 1
    return a.discountRate - b.discountRate
  })
})

// Filter states
const searchQuery = ref('')
const selectedDiscountFilter = ref<'all' | 'deep' | 'standard' | 'featured'>('all')

const filteredCoupons = computed(() => {
  return allCoupons.value.filter(item => {
    // Search query
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.trim().toLowerCase()
      const matchName = item.name.toLowerCase().includes(q)
      const matchSlug = item.slug.toLowerCase().includes(q)
      const matchCode = item.coupon.toLowerCase().includes(q)
      if (!matchName && !matchSlug && !matchCode) return false
    }

    // Discount Filter
    if (selectedDiscountFilter.value === 'featured' && !item.isFeatured) return false
    if (selectedDiscountFilter.value === 'deep' && item.discountRate > 0.75) return false // 7折 ~ 7.5折
    if (selectedDiscountFilter.value === 'standard' && (item.discountRate < 0.76 || item.discountRate > 0.88)) return false

    return true
  })
})

// Clipboard feedback
const copiedCode = ref<string | null>(null)
function copyCoupon(code: string) {
  navigator.clipboard.writeText(code).then(() => {
    copiedCode.value = code
    setTimeout(() => {
      copiedCode.value = null
    }, 2000)
  })
}
</script>

<template>
  <div class="coupon-center">
    <!-- Header Banner -->
    <div class="coupon-hero-card">
      <div class="hero-content">
        <span class="hero-badge">官方核验 · 实时更新</span>
        <h2 class="hero-title">2026 机场官方专属优惠码查询中心</h2>
        <p class="hero-desc">
          本站严选 9 大主力专线机场官方专属优惠码。结账时输入对应折扣码即可立享 <strong>7折 至 9折</strong> 现金直减，一键点击复制，省钱避坑。
        </p>
      </div>
      <div class="hero-stats">
        <div class="stat-box">
          <span class="stat-number">{{ allCoupons.length }}</span>
          <span class="stat-label">可用官方券码</span>
        </div>
        <div class="stat-box">
          <span class="stat-number">7 折</span>
          <span class="stat-label">最高立减力度</span>
        </div>
      </div>
    </div>

    <!-- Search & Filters -->
    <div class="coupon-filter-bar">
      <div class="search-wrap">
        <span class="search-icon">🔍</span>
        <input
          v-model="searchQuery"
          type="text"
          class="coupon-search-input"
          placeholder="快速搜索品牌名或券码（如：微风、飞猫、暮光、7折...）"
        />
        <button v-if="searchQuery" class="clear-btn" @click="searchQuery = ''">×</button>
      </div>

      <div class="tag-filters">
        <button
          class="tag-pill"
          :class="{ active: selectedDiscountFilter === 'all' }"
          @click="selectedDiscountFilter = 'all'"
        >全部优惠券 ({{ allCoupons.length }})</button>
        <button
          class="tag-pill"
          :class="{ active: selectedDiscountFilter === 'featured' }"
          @click="selectedDiscountFilter = 'featured'"
        >⭐ 精选推荐 13 家</button>
        <button
          class="tag-pill"
          :class="{ active: selectedDiscountFilter === 'deep' }"
          @click="selectedDiscountFilter = 'deep'"
        >🔥 7折超值神券</button>
        <button
          class="tag-pill"
          :class="{ active: selectedDiscountFilter === 'standard' }"
          @click="selectedDiscountFilter = 'standard'"
        >⚡ 8折-9折主流</button>
      </div>
    </div>

    <!-- Coupons Grid -->
    <div v-if="filteredCoupons.length > 0" class="coupon-grid">
      <div
        v-for="item in filteredCoupons"
        :key="item.slug"
        class="coupon-ticket-card"
        :class="{ 'featured-ticket': item.isFeatured }"
      >
        <!-- Top Half: Brand & Discount -->
        <div class="ticket-header">
          <div class="brand-left">
            <img v-if="item.logo" :src="item.logo" :alt="item.name" class="ticket-logo" />
            <div>
              <div class="ticket-brand-row">
                <h4 class="ticket-brand-name">{{ item.name }}</h4>
                <span v-if="item.isFeatured" class="featured-pill">精选品牌</span>
              </div>
              <span class="ticket-line-text">{{ item.lineType }} 专线 · {{ item.startPrice }}</span>
            </div>
          </div>
          <div class="discount-badge-box">
            <span class="discount-rate-num">{{ item.discount }}</span>
          </div>
        </div>

        <!-- Ticket Divider with Punch Holes -->
        <div class="ticket-divider">
          <span class="punch-hole left-hole"></span>
          <span class="dashed-line"></span>
          <span class="punch-hole right-hole"></span>
        </div>

        <!-- Bottom Half: Coupon Code & Copy Action -->
        <div class="ticket-body">
          <div class="coupon-display-box" @click="copyCoupon(item.coupon)">
            <div class="code-inner">
              <span class="code-label">专属优惠码</span>
              <span class="code-value">{{ item.coupon }}</span>
            </div>
            <button class="btn-copy" :class="{ 'btn-copied': copiedCode === item.coupon }">
              {{ copiedCode === item.coupon ? '✓ 已复制' : '复制券码' }}
            </button>
          </div>

          <div class="ticket-footer-actions">
            <a :href="item.affUrl" target="_blank" rel="nofollow noopener noreferrer sponsored" class="btn-use-coupon">
              直达官网使用 →
            </a>
            <a :href="getBrandGuideUrl(item.slug)" class="btn-ticket-guide">
              技术档案与指南
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty Search -->
    <div v-else class="coupon-empty-box">
      <span class="empty-emoji">🎟️</span>
      <h3>未找到匹配的优惠码</h3>
      <p>尝试缩短关键词或切换过滤标签查看全部可用优惠券。</p>
      <button class="reset-filter-btn" @click="searchQuery = ''; selectedDiscountFilter = 'all'">
        清除搜索条件
      </button>
    </div>

    <!-- Usage Guide & Tips -->
    <div class="coupon-faq-card">
      <h3 class="faq-card-title">📖 机场优惠码使用说明与避坑指南</h3>
      <div class="faq-grid">
        <div class="faq-item">
          <h4>1. 优惠码在哪里输入？</h4>
          <p>在机场官网“购买订阅 / 商店”选定心仪套餐后，点击进入“结算页面 (Checkout)”，在右侧或下方的“折价券 / 优惠码 (Promo Code)”输入框中粘贴券码，点击“应用”即可实时看到折后总价。</p>
        </div>
        <div class="faq-item">
          <h4>2. 为什么提示“优惠码无效或已过期”？</h4>
          <p>请核对套餐周期：部分超值 7 折神券仅限“年付”或“半年付”使用；若选了月付或单次不限时流量包可能无法激活。复制时请注意不要包含前后多余的空格。</p>
        </div>
        <div class="faq-item">
          <h4>3. 优惠码可以重复使用吗？</h4>
          <p>大部分机场优惠码为首购特惠券，仅限新购订单生效；部分机场支持老用户续费时重复输入优惠码。具体以各机场结账页实时抵扣结果为准。</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.coupon-center {
  margin: 1.5rem 0 3rem;
  font-family: var(--vp-font-family-base);
}

.coupon-hero-card {
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.12) 0%, rgba(245, 158, 11, 0.12) 100%);
  border: 1px solid rgba(37, 99, 235, 0.25);
  border-radius: var(--site-radius-lg);
  padding: 1.75rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.hero-content {
  flex: 1;
  min-width: 280px;
}

.hero-badge {
  display: inline-block;
  background: #f59e0b;
  color: #ffffff;
  padding: 0.15rem 0.55rem;
  border-radius: var(--site-radius-full);
  font-size: 0.78rem;
  font-weight: 700;
  margin-bottom: 0.65rem;
}

.hero-title {
  margin: 0 0 0.5rem;
  font-size: 1.45rem;
  font-weight: 800;
  color: var(--site-text-primary);
  line-height: 1.3;
}

.hero-desc {
  margin: 0;
  font-size: 0.92rem;
  color: var(--site-text-secondary);
  line-height: 1.6;
}

.hero-stats {
  display: flex;
  gap: 1.25rem;
}

.stat-box {
  background: var(--site-bg-surface);
  border: 1px solid var(--site-border-color);
  padding: 0.85rem 1.25rem;
  border-radius: var(--site-radius-md);
  text-align: center;
  box-shadow: var(--site-card-shadow);
}

.stat-number {
  display: block;
  font-size: 1.65rem;
  font-weight: 900;
  color: var(--vp-c-brand-1);
  line-height: 1.1;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--site-text-muted);
  font-weight: 600;
}

/* Filter Bar */
.coupon-filter-bar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.search-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 1rem;
  font-size: 1.1rem;
  color: var(--site-text-muted);
}

.coupon-search-input {
  width: 100%;
  padding: 0.75rem 2.5rem 0.75rem 2.85rem;
  border-radius: var(--site-radius-full);
  border: 1px solid var(--site-border-color);
  background: var(--site-card-bg);
  color: var(--site-text-primary);
  font-size: 0.95rem;
  outline: none;
  box-shadow: var(--site-card-shadow);
  transition: border-color 0.2s, box-shadow 0.2s;
}

.coupon-search-input:focus {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 3px var(--vp-c-brand-soft);
}

.clear-btn {
  position: absolute;
  right: 1.2rem;
  background: transparent;
  border: none;
  font-size: 1.3rem;
  color: var(--site-text-muted);
  cursor: pointer;
}

.tag-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag-pill {
  background: var(--site-bg-subtle);
  border: 1px solid var(--site-border-color);
  color: var(--site-text-secondary);
  padding: 0.4rem 0.95rem;
  border-radius: var(--site-radius-full);
  font-size: 0.88rem;
  cursor: pointer;
  transition: all 0.15s ease;
  font-weight: 500;
}

.tag-pill:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.tag-pill.active {
  background: var(--vp-c-brand-1);
  color: #ffffff;
  border-color: var(--vp-c-brand-1);
  font-weight: 600;
}

/* Coupon Tickets Grid */
.coupon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(310px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

.coupon-ticket-card {
  background: var(--site-card-bg);
  border: 1px solid var(--site-border-color);
  border-radius: var(--site-radius-lg);
  overflow: hidden;
  box-shadow: var(--site-card-shadow);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  display: flex;
  flex-direction: column;
}

.coupon-ticket-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--site-card-shadow-hover);
  border-color: #f59e0b;
}

.coupon-ticket-card.featured-ticket {
  border-color: rgba(37, 99, 235, 0.4);
}

.ticket-header {
  padding: 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.brand-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.ticket-logo {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  object-fit: cover;
  border: 1px solid var(--site-border-color);
  background: #ffffff;
}

.ticket-brand-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.ticket-brand-name {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--site-text-primary);
}

.featured-pill {
  background: rgba(37, 99, 235, 0.12);
  color: var(--vp-c-brand-1);
  font-size: 0.7rem;
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  font-weight: 700;
}

.ticket-line-text {
  font-size: 0.78rem;
  color: var(--site-text-muted);
}

.discount-badge-box {
  background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%);
  color: #ffffff;
  padding: 0.35rem 0.75rem;
  border-radius: var(--site-radius-md);
  box-shadow: 0 3px 8px rgba(245, 158, 11, 0.3);
}

.discount-rate-num {
  font-size: 1.15rem;
  font-weight: 900;
  letter-spacing: -0.02em;
}

/* Punch Hole Divider */
.ticket-divider {
  position: relative;
  height: 20px;
  display: flex;
  align-items: center;
}

.dashed-line {
  width: 100%;
  border-top: 2px dashed var(--site-border-color);
  margin: 0 15px;
}

.punch-hole {
  position: absolute;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--site-bg-canvas);
  border: 1px solid var(--site-border-color);
}

.left-hole {
  left: -8px;
}

.right-hole {
  right: -8px;
}

/* Ticket Body */
.ticket-body {
  padding: 1rem 1.25rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: auto;
}

.coupon-display-box {
  background: var(--site-bg-subtle);
  border: 1px dashed var(--site-border-color);
  border-radius: var(--site-radius-md);
  padding: 0.65rem 0.9rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.coupon-display-box:hover {
  background: rgba(245, 158, 11, 0.08);
  border-color: #f59e0b;
}

.code-inner {
  display: flex;
  flex-direction: column;
}

.code-label {
  font-size: 0.72rem;
  color: var(--site-text-muted);
}

.code-value {
  font-family: var(--vp-font-family-mono);
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--site-text-primary);
  letter-spacing: 0.04em;
}

.btn-copy {
  background: #f59e0b;
  color: #ffffff;
  border: none;
  padding: 0.35rem 0.75rem;
  border-radius: var(--site-radius-sm);
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-copy:hover {
  opacity: 0.9;
}

.btn-copied {
  background: var(--vp-c-teal) !important;
}

.ticket-footer-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-use-coupon {
  flex: 2;
  background: var(--vp-c-brand-1);
  color: #ffffff !important;
  text-align: center;
  padding: 0.5rem 0.75rem;
  border-radius: var(--site-radius-md);
  font-size: 0.88rem;
  font-weight: 600;
  text-decoration: none !important;
  transition: background 0.2s;
}

.btn-use-coupon:hover {
  background: var(--vp-c-brand-2);
}

.btn-ticket-guide {
  flex: 1;
  background: var(--site-bg-subtle);
  color: var(--site-text-secondary) !important;
  border: 1px solid var(--site-border-color);
  text-align: center;
  padding: 0.5rem 0.5rem;
  border-radius: var(--site-radius-md);
  font-size: 0.85rem;
  font-weight: 500;
  text-decoration: none !important;
  transition: all 0.2s;
}

.btn-ticket-guide:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1) !important;
}

/* Empty */
.coupon-empty-box {
  background: var(--site-card-bg);
  border: 1px dashed var(--site-border-color);
  border-radius: var(--site-radius-lg);
  padding: 3.5rem 1.5rem;
  text-align: center;
  margin-bottom: 2.5rem;
}

.empty-emoji {
  font-size: 2.5rem;
}

.reset-filter-btn {
  margin-top: 1rem;
  background: var(--site-bg-subtle);
  border: 1px solid var(--site-border-color);
  padding: 0.4rem 0.95rem;
  border-radius: var(--site-radius-md);
  cursor: pointer;
  font-size: 0.88rem;
}

/* FAQ */
.coupon-faq-card {
  background: var(--site-card-bg);
  border: 1px solid var(--site-border-color);
  border-radius: var(--site-radius-lg);
  padding: 1.75rem;
  box-shadow: var(--site-card-shadow);
}

.faq-card-title {
  margin: 0 0 1.25rem;
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--site-text-primary);
}

.faq-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.25rem;
}

.faq-item h4 {
  margin: 0 0 0.4rem;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--site-text-primary);
}

.faq-item p {
  margin: 0;
  font-size: 0.85rem;
  color: var(--site-text-secondary);
  line-height: 1.6;
}
</style>
