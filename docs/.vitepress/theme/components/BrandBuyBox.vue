<script setup lang="ts">
// 品牌文章的购买入口：桌面端放在「本页目录」下方（随侧栏固定），手机端为底部悬浮条
// 品牌页 frontmatter 写 brand: <slug> 即会显示
import { computed, ref } from 'vue'
import { useData } from 'vitepress'
import providers from '../../data/providers.json'
import brandEditorial from '../../data/brand-editorial.json'
import BrandPromo from './BrandPromo.vue'

const props = withDefaults(defineProps<{ variant?: 'aside' | 'bar' }>(), { variant: 'aside' })

interface Provider {
  slug: string
  name: string
  logo?: string
  coupon?: string | null
  couponDiscount?: string | null
  startPrice?: string
  targetUrl?: string
}
interface Editorial {
  oneLiner?: string
  pros?: string[]
  couponNote?: string
}

const { frontmatter } = useData()
const brand = computed(() => {
  const slug = frontmatter.value.brand
  if (!slug) return null
  const p = (providers as Provider[]).find((x) => x.slug === slug)
  if (!p || !p.targetUrl) return null
  const ed = (brandEditorial as Record<string, Editorial>)[slug] || {}
  return { ...p, ed }
})

const copied = ref(false)
const copyCoupon = async () => {
  if (!brand.value?.coupon) return
  try {
    await navigator.clipboard.writeText(brand.value.coupon)
    copied.value = true
    setTimeout(() => (copied.value = false), 1800)
  } catch {
    copied.value = false
  }
}
// 去掉 markdown 粗体与过长的说明，侧栏只放短句
const short = (t: string) => t.replace(/\*\*/g, '').split(/[，；（]/)[0]
</script>

<template>
  <div v-if="brand && props.variant === 'aside'" class="buybox">
    <div class="buybox-head">
      <img v-if="brand.logo" :src="brand.logo" :alt="brand.name + ' Logo'" width="36" height="36" class="buybox-logo no-zoom" />
      <div>
        <div class="buybox-name">{{ brand.name }}</div>
        <div v-if="brand.startPrice" class="buybox-price">{{ brand.startPrice }}</div>
      </div>
    </div>
    <p v-if="brand.ed.oneLiner" class="buybox-line">{{ brand.ed.oneLiner }}</p>
    <ul v-if="brand.ed.pros?.length" class="buybox-pros">
      <li v-for="p in brand.ed.pros.slice(0, 3)" :key="p">{{ short(p) }}</li>
    </ul>
    <BrandPromo mini />
    <button v-if="brand.coupon" type="button" class="buybox-coupon" :title="brand.ed.couponNote || '点击复制优惠码'" @click="copyCoupon">
      <span>优惠码 <code>{{ brand.coupon }}</code> {{ brand.couponDiscount }}</span>
      <span class="buybox-copy">{{ copied ? '已复制' : '复制' }}</span>
    </button>
    <a :href="brand.targetUrl" target="_blank" rel="nofollow noopener noreferrer sponsored" class="buybox-btn">访问{{ brand.name }}官网 ↗</a>
  </div>

  <div v-else-if="brand && props.variant === 'bar'" class="buybar">
    <div class="buybar-info">
      <strong>{{ brand.name }}</strong>
      <span v-if="brand.startPrice" class="buybar-price">{{ brand.startPrice }}</span>
      <button v-if="brand.coupon" type="button" class="buybar-coupon" @click="copyCoupon">
        {{ copied ? '已复制' : brand.coupon }}
      </button>
    </div>
    <a :href="brand.targetUrl" target="_blank" rel="nofollow noopener noreferrer sponsored" class="buybar-btn">去官网 ↗</a>
  </div>
</template>

<style scoped>
.buybox {
  margin-top: 1.25rem;
  padding: 0.9rem;
  border: 1.5px solid var(--vp-c-brand-1);
  border-radius: var(--site-radius-md);
  background: var(--vp-c-brand-soft);
  font-size: 0.8rem;
  line-height: 1.5;
}
.buybox-head { display: flex; align-items: center; gap: 0.6rem; }
.buybox-logo { border-radius: 9px; object-fit: cover; flex-shrink: 0; }
.buybox-name { font-size: 0.95rem; font-weight: 700; color: var(--site-text-primary); }
.buybox-price { font-size: 0.78rem; font-weight: 600; color: var(--vp-c-brand-1); }
.buybox-line { margin: 0.6rem 0 0.4rem; color: var(--site-text-secondary); }
.buybox-pros { margin: 0 0 0.7rem; padding-left: 1rem; color: var(--site-text-secondary); }
.buybox-pros li { margin: 0.15rem 0; }
.buybox-coupon {
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 0.6rem;
  padding: 0.4rem 0.55rem;
  border: 1px dashed #f59e0b;
  border-radius: var(--site-radius-sm);
  background: rgba(245, 158, 11, 0.1);
  color: var(--site-text-primary);
  font-size: 0.78rem;
  cursor: pointer;
  text-align: left;
}
.buybox-copy { flex-shrink: 0; font-weight: 600; color: #f59e0b; }
.buybox-btn,
.buybar-btn {
  display: block;
  text-align: center;
  padding: 0.5rem 0.75rem;
  border-radius: var(--site-radius-sm);
  background: var(--vp-c-brand-1);
  color: #ffffff !important;
  font-weight: 700;
  text-decoration: none !important;
  transition: background 0.15s ease;
}
.buybox-btn:hover,
.buybar-btn:hover { background: var(--vp-c-brand-2); }

/* 屏幕不够高时只留价格、优惠码和按钮，免得按钮被挤出屏幕 */
@media (max-height: 900px) {
  .buybox-pros { display: none; }
  .buybox-line { margin-bottom: 0.6rem; }
}

/* 手机与平板：侧栏不显示时用底部悬浮条 */
.buybar { display: none; }
@media (max-width: 1279px) {
  .buybar {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 30;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    padding: 0.6rem 16px calc(0.6rem + env(safe-area-inset-bottom));
    border-top: 1px solid var(--site-border-color);
    background: var(--vp-c-bg);
    box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.12);
  }
}
.buybar-info { display: flex; align-items: center; gap: 0.5rem; min-width: 0; flex-wrap: wrap; font-size: 0.85rem; }
.buybar-price { color: var(--vp-c-brand-1); font-weight: 600; }
.buybar-coupon {
  padding: 0.1rem 0.45rem;
  border: 1px dashed #f59e0b;
  border-radius: var(--site-radius-sm);
  background: rgba(245, 158, 11, 0.1);
  color: var(--site-text-primary);
  font-family: var(--vp-font-family-mono);
  font-size: 0.78rem;
  cursor: pointer;
}
.buybar-btn { flex-shrink: 0; padding: 0.45rem 0.9rem; }
</style>
