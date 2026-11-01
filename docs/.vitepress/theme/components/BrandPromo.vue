<script setup lang="ts">
// 品牌限时活动框：读取 providers.json 的 promo 字段，活动结束后自动隐藏
// 品牌页按 frontmatter.brand 显示；其他页面可传 slug
import { computed, onMounted, ref } from 'vue'
import { useData } from 'vitepress'
import providers from '../../data/providers.json'

const props = defineProps<{ slug?: string; compact?: boolean; mini?: boolean }>()

interface Promo {
  title: string
  code: string
  discount: string
  start: string
  end: string
  audience?: string
  limit?: string
  scope?: string
  highlight?: string
  source?: string
  post?: string
}
interface Provider {
  slug: string
  name: string
  targetUrl?: string
  promo?: Promo
}

const { frontmatter } = useData()
const brand = computed(() => {
  const slug = props.slug || frontmatter.value.brand
  return (providers as Provider[]).find((x) => x.slug === slug && x.promo) || null
})

// 活动时间按北京时间计算；构建时先用构建时间，进入页面后按访问者当前时间刷新
const now = ref(Date.now())
onMounted(() => (now.value = Date.now()))
const startAt = computed(() => brand.value ? Date.parse(`${brand.value.promo!.start}T00:00:00+08:00`) : 0)
const endAt = computed(() => brand.value ? Date.parse(`${brand.value.promo!.end}T23:59:59+08:00`) : 0)
const status = computed(() => {
  if (!brand.value) return null
  if (now.value > endAt.value) return 'ended'
  return now.value < startAt.value ? 'upcoming' : 'active'
})
const md = (d: string) => `${Number(d.slice(5, 7))} 月 ${Number(d.slice(8, 10))} 日`
const sd = (d: string) => `${Number(d.slice(5, 7))}/${Number(d.slice(8, 10))}`

const copied = ref(false)
const copy = async () => {
  try {
    await navigator.clipboard.writeText(brand.value!.promo!.code)
    copied.value = true
    setTimeout(() => (copied.value = false), 1800)
  } catch {
    copied.value = false
  }
}
</script>

<template>
  <!-- 侧栏购买框里的一行小条 -->
  <button v-if="brand && status !== 'ended' && mini" type="button" class="promo-mini" :title="`${brand.promo!.audience}，${brand.promo!.limit}，点击复制`" @click="copy">
    <span class="promo-mini-text">
      <span class="promo-mini-tag">{{ status === 'active' ? '🔥 进行中' : '⏰ 双十一' }}</span>
      {{ sd(brand.promo!.start) }}~{{ sd(brand.promo!.end) }} · <code>{{ brand.promo!.code }}</code> {{ brand.promo!.discount }}，老用户也能用
    </span>
    <span class="promo-mini-copy">{{ copied ? '已复制' : '复制' }}</span>
  </button>
  <div v-else-if="brand && status !== 'ended'" class="promo-box" :class="{ 'is-compact': compact }">
    <div class="promo-head">
      <span class="promo-badge">{{ status === 'active' ? '🔥 活动进行中' : '⏰ 即将开始' }}</span>
      <strong class="promo-title">{{ brand.promo!.title }}</strong>
      <span class="promo-date">{{ md(brand.promo!.start) }} ~ {{ md(brand.promo!.end) }}</span>
    </div>
    <p class="promo-text">
      活动期间结算时填写优惠码
      <button type="button" class="promo-code" title="点击复制" @click="copy"><code>{{ brand.promo!.code }}</code> {{ copied ? '已复制' : '复制' }}</button>
      享 <strong>{{ brand.promo!.discount }}</strong>，{{ brand.promo!.audience }}，{{ brand.promo!.limit }}。<template v-if="!compact && brand.promo!.scope">{{ brand.promo!.scope }}。</template><template v-if="!compact && brand.promo!.highlight">{{ brand.promo!.highlight }}</template>
    </p>
    <p v-if="!compact" class="promo-note">
      消息来源：{{ brand.promo!.source }}（{{ brand.name }}是本站的推广合作品牌）。活动时间和截止时间以官网公告和结算页为准。
      <a v-if="brand.promo!.post" :href="brand.promo!.post">看活动详情 →</a>
    </p>
    <div v-if="!compact" class="promo-actions">
      <a :href="brand.targetUrl" target="_blank" rel="nofollow noopener noreferrer sponsored" class="portal-btn-primary">访问{{ brand.name }}官网 ↗</a>
    </div>
  </div>
</template>

<style scoped>
.promo-mini {
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 0.6rem;
  padding: 0.4rem 0.55rem;
  border: 1px dashed #ef4444;
  border-radius: var(--site-radius-sm);
  background: rgba(239, 68, 68, 0.1);
  color: var(--site-text-primary);
  font-size: 0.75rem;
  line-height: 1.5;
  text-align: left;
  cursor: pointer;
}
.promo-mini-tag {
  font-weight: 700;
  color: #ef4444;
}
.promo-mini code {
  padding: 0 0.2rem;
  background: none;
  color: #ef4444;
  font-weight: 700;
}
.promo-mini-copy {
  flex-shrink: 0;
  font-weight: 600;
  color: #ef4444;
}
.promo-box {
  margin: 1.25rem 0;
  padding: 1rem 1.15rem;
  border: 1px solid rgba(239, 68, 68, 0.45);
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(245, 158, 11, 0.08));
}
.promo-box.is-compact {
  margin: 0.75rem 0 0;
  padding: 0.7rem 0.9rem;
}
.promo-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem 0.75rem;
}
.promo-badge {
  padding: 0.1rem 0.55rem;
  border-radius: 999px;
  background: #ef4444;
  color: #fff;
  font-size: 0.78rem;
  font-weight: 600;
}
.promo-title {
  font-size: 1.02rem;
}
.promo-date {
  color: var(--vp-c-text-2);
  font-size: 0.88rem;
}
.promo-text {
  margin: 0.6rem 0 0;
  line-height: 1.75;
}
.promo-code {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0 0.45rem;
  border: 1px dashed #ef4444;
  border-radius: 6px;
  color: #ef4444;
  font-size: 0.85rem;
  cursor: pointer;
}
.promo-code code {
  background: none;
  color: inherit;
  font-weight: 700;
}
.promo-note {
  margin: 0.5rem 0 0;
  color: var(--vp-c-text-2);
  font-size: 0.85rem;
  line-height: 1.7;
}
.promo-actions {
  margin-top: 0.75rem;
}
</style>
