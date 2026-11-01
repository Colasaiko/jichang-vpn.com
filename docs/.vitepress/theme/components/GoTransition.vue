<script setup lang="ts">
import { ref, computed } from 'vue'
import rawProviders from '../../data/providers.json'

interface Provider {
  name: string
  slug: string
  logo?: string
  lineType?: string
  startPrice?: string
  coupon?: string | null
  couponDiscount?: string | null
  targetUrl?: string
  features?: string[]
}

const props = defineProps<{
  slug: string
}>()

const providers = rawProviders as Provider[]

const extraProviders: Record<string, Provider> = {
  nanocloud: {
    name: 'NanoCloud',
    slug: 'nanocloud',
    logo: '/favicon.svg',
    lineType: '公网直连 / IPv6双栈',
    startPrice: '¥1.00 / 月 (100GB)',
    coupon: '加入TG享受内部优惠',
    couponDiscount: '内部特惠',
    targetUrl: 'https://edu.uodoo.bid/auth/register?code=P7gzTydW',
    features: [
      '安卓手机需要给Nano通知权限才能连接',
      '每个价钱有自己的同时支持多少设备',
      '添加TG频道享受内部优惠折扣'
    ]
  },
  phantom: {
    name: 'Phantom',
    slug: 'phantom',
    logo: '/favicon.svg',
    lineType: '公网直连 / VLESS抗丢包',
    startPrice: '¥1.00 / 月 (100GB)',
    coupon: null,
    couponDiscount: null,
    targetUrl: 'https://pin.dianping.men/auth/register?code=Cv2pH8HA',
    features: [
      '支持 VLESS / TUIC / Hysteria2 抗丢包协议',
      '全节点覆盖亚太与美西',
      '支持微信与支付宝付款'
    ]
  }
}

const isExtraBrand = computed(() => !!extraProviders[props.slug])

const provider = computed(() => {
  return providers.find(p => p.slug === props.slug) || extraProviders[props.slug] || {
    name: '官方合作伙伴',
    slug: props.slug,
    logo: '/favicon.svg',
    lineType: '专线',
    startPrice: '详见官网',
    targetUrl: '/',
    coupon: null,
    couponDiscount: null
  }
})

const guideMap: Record<string, string> = {
  weifengwangluo: '/guides/weifeng-guide',
  feimaoyun: '/guides/feimao-guide',
  muguangjiasu: '/guides/muguang-guide',
  dalao: '/guides/dalao-guide',
  firefly: '/guides/firefly-guide',
  lingmao: '/guides/lingmao-guide',
  shanyue: '/guides/shanyue-guide',
  wuyoulianjie: '/guides/wuyou-guide',
  kuajieyun: '/guides/kuajie-guide'
}

function getBrandGuideUrl(slug: string): string {
  return guideMap[slug] || `/brands/${slug}`
}

const copied = ref(false)
function copyCode(code: string) {
  if (!code) return
  navigator.clipboard.writeText(code).then(() => {
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2500)
  })
}
</script>

<template>
  <div class="go-transition-container">
    <!-- Main Card -->
    <div class="go-card">
      <!-- Brand Header -->
      <div class="brand-hero-row">
        <img
          v-if="provider.logo"
          :src="provider.logo"
          :alt="provider.name"
          class="brand-hero-logo"
        />
        <div class="brand-hero-meta">
          <div class="brand-title-line">
            <h2 class="brand-title-text">{{ provider.name }}</h2>
            <span class="line-badge">{{ provider.lineType || 'IPLC专线' }}</span>
          </div>
          <p class="brand-price-text">入门参考：{{ provider.startPrice }}</p>
        </div>
      </div>

      <div class="divider-line"></div>

      <!-- Outbound Notice & Commission Disclosure (明确说明佣金不增加用户费用) -->
      <div class="disclosure-alert-box">
        <div class="disclosure-header">
          <span class="alert-icon">💡</span>
          <h4 class="alert-heading">赞助与佣金透明化特别说明</h4>
        </div>
        <p class="alert-desc">
          您即将离开<strong>「机场VPN」</strong>前往<strong>【{{ provider.name }}】</strong>官方网站。若您通过本站链接选购套餐，我们可能会从服务商处获得一笔微薄的推广佣金，用以支付本站独立测试服务器、海外多节点测速带宽以及工具箱持续维护的日常开销。
        </p>
        <div class="guarantee-chip">
          <span class="shield-icon">🛡️</span>
          <span>
            <strong>郑重承诺：</strong>推荐佣金完全由服务商承担，<strong>绝不会增加您的任何购买金额</strong>。结账时输入专属优惠码还可享受现金直减！
          </span>
        </div>
      </div>

      <!-- Coupon Area if present -->
      <div v-if="provider.coupon" class="coupon-highlight-card">
        <div class="coupon-meta-left">
          <span class="coupon-label">官方专属折扣码</span>
          <span class="coupon-code-value">{{ provider.coupon }}</span>
          <span class="coupon-discount-badge">{{ provider.couponDiscount || '官方特惠' }} 立减</span>
        </div>
        <button
          type="button"
          class="btn-copy-coupon"
          :class="{ 'btn-copied': copied }"
          @click="copyCode(provider.coupon)"
        >
          {{ copied ? '✓ 已复制券码！' : '复制优惠码' }}
        </button>
      </div>

      <!-- Manual Action Button (用户自己按，绝不自动跳转) -->
      <div class="action-section">
        <a
          :href="provider.targetUrl"
          target="_blank"
          rel="nofollow noopener noreferrer sponsored"
          class="btn-continue-outbound"
        >
          继续前往 {{ provider.name }} 官方网站 ↗
        </a>
        <p class="compliance-hint">
          ✓ 本页面已严格遵循 <code>noindex</code>, <code>nofollow</code>, <code>noopener</code>, <code>sponsored</code> 安全规范，非自动重定向。
        </p>
      </div>

      <!-- Secondary Links -->
      <div class="secondary-nav-row">
        <template v-if="!isExtraBrand">
          <a :href="'/brands/' + provider.slug" class="sec-link">
            📖 查看 {{ provider.name }} 技术档案
          </a>
          <span class="sec-dot">·</span>
          <a :href="getBrandGuideUrl(provider.slug)" class="sec-link">
            📱 客户端配置教程
          </a>
          <span class="sec-dot">·</span>
        </template>
        <template v-else>
          <a href="/blog/yiyuan-jichang-nanocloud-phantom-guide" class="sec-link">
            📖 查看一元机场技术与避坑分析
          </a>
          <span class="sec-dot">·</span>
        </template>
        <a href="/recommendations/" class="sec-link">
          ⚡ 返回机场推荐榜
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.go-transition-container {
  max-width: 680px;
  margin: 2rem auto 4rem;
  font-family: var(--vp-font-family-base);
}

.go-card {
  background: var(--site-card-bg);
  border: 1px solid var(--site-border-color);
  border-radius: var(--site-radius-lg);
  padding: 2.25rem 2rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04);
}

.brand-hero-row {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.brand-hero-logo {
  width: 64px;
  height: 64px;
  border-radius: 14px;
  object-fit: cover;
  border: 1px solid var(--site-border-color);
  background: #ffffff;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.brand-hero-meta {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.brand-title-line {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  flex-wrap: wrap;
}

.brand-title-text {
  margin: 0 !important;
  padding: 0 !important;
  border: none !important;
  font-size: 1.5rem !important;
  font-weight: 800;
  color: var(--site-text-primary);
}

.line-badge {
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  padding: 0.15rem 0.55rem;
  border-radius: var(--site-radius-full);
  font-size: 0.75rem;
  font-weight: 700;
}

.brand-price-text {
  margin: 0;
  font-size: 0.9rem;
  color: var(--site-text-muted);
}

.divider-line {
  height: 1px;
  background: var(--site-border-color);
  margin: 1.5rem 0;
}

/* Disclosure Box */
.disclosure-alert-box {
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.05) 0%, rgba(13, 148, 136, 0.05) 100%);
  border: 1px solid rgba(37, 99, 235, 0.2);
  border-radius: var(--site-radius-md);
  padding: 1.25rem 1.4rem;
  margin-bottom: 1.5rem;
}

.disclosure-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.alert-icon {
  font-size: 1.25rem;
  line-height: 1;
}

.alert-heading {
  margin: 0 !important;
  padding: 0 !important;
  border: none !important;
  font-size: 1.05rem !important;
  font-weight: 700;
  color: var(--site-text-primary);
}

.alert-desc {
  margin: 0 0 0.85rem !important;
  font-size: 0.9rem !important;
  color: var(--site-text-secondary);
  line-height: 1.65;
}

.guarantee-chip {
  background: var(--site-bg-surface);
  border: 1px solid var(--site-border-color);
  padding: 0.65rem 0.85rem;
  border-radius: var(--site-radius-sm);
  font-size: 0.85rem;
  color: var(--site-text-primary);
  display: flex;
  align-items: flex-start;
  gap: 0.45rem;
  line-height: 1.5;
}

.shield-icon {
  font-size: 1.1rem;
  line-height: 1;
  color: var(--vp-c-teal);
}

/* Coupon Box */
.coupon-highlight-card {
  background: rgba(245, 158, 11, 0.08);
  border: 1px dashed #f59e0b;
  border-radius: var(--site-radius-md);
  padding: 1rem 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.75rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.coupon-meta-left {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.coupon-label {
  font-size: 0.75rem;
  color: var(--site-text-muted);
}

.coupon-code-value {
  font-family: var(--vp-font-family-mono);
  font-size: 1.35rem;
  font-weight: 800;
  color: var(--site-text-primary);
  letter-spacing: 0.04em;
}

.coupon-discount-badge {
  display: inline-block;
  background: #f59e0b;
  color: #ffffff;
  padding: 0.1rem 0.45rem;
  border-radius: 4px;
  font-size: 0.72rem;
  font-weight: 700;
  width: fit-content;
}

.btn-copy-coupon {
  background: #f59e0b;
  color: #ffffff;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: var(--site-radius-md);
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-copy-coupon:hover {
  opacity: 0.9;
}

.btn-copied {
  background: var(--vp-c-teal) !important;
}

/* Action Area (Manual click) */
.action-section {
  text-align: center;
  margin-bottom: 1.75rem;
}

.btn-continue-outbound {
  display: inline-block;
  width: 100%;
  box-sizing: border-box;
  background: var(--vp-c-brand-1);
  color: #ffffff !important;
  text-align: center;
  padding: 0.95rem 1.5rem;
  border-radius: var(--site-radius-md);
  font-size: 1.1rem;
  font-weight: 700;
  text-decoration: none !important;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
  transition: all 0.2s ease;
}

.btn-continue-outbound:hover {
  background: var(--vp-c-brand-2);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(37, 99, 235, 0.4);
}

.compliance-hint {
  margin: 0.65rem 0 0 !important;
  font-size: 0.78rem !important;
  color: var(--site-text-muted);
}

.compliance-hint code {
  font-size: 0.75rem;
  padding: 0.1rem 0.3rem;
  background: var(--site-bg-subtle);
  border: 1px solid var(--site-border-color);
  border-radius: 4px;
}

/* Secondary Links */
.secondary-nav-row {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.65rem;
  flex-wrap: wrap;
  padding-top: 1.25rem;
  border-top: 1px solid var(--site-border-color);
  font-size: 0.85rem;
}

.sec-link {
  color: var(--site-text-secondary) !important;
  text-decoration: none !important;
  transition: color 0.15s;
}

.sec-link:hover {
  color: var(--vp-c-brand-1) !important;
  text-decoration: underline !important;
}

.sec-dot {
  color: var(--site-text-muted);
}
</style>
