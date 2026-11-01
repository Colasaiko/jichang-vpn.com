<script setup lang="ts">
// 各品牌每 GB 价格排名与本月价格变动，数据来自 providers.json 的 plans 和 priceHistory
import { computed } from 'vue'
import providers from '../../data/providers.json'

interface Plan { name: string; traffic: string; monthly: string | null }
interface History { date: string; plan: string; traffic: string; monthly: string }
interface Provider {
  slug: string
  name: string
  coupon?: string | null
  couponDiscount?: string | null
  plans: Plan[]
  priceHistory?: History[]
}

const num = (v: unknown) => {
  const n = parseFloat(String(v ?? '').replace(/[¥,\s]/g, ''))
  return Number.isFinite(n) ? n : null
}
const gb = (t: string) => {
  const m = String(t || '').match(/([\d.]+)\s*(TB|GB|G)/i)
  return m ? parseFloat(m[1]) * (/T/i.test(m[2]) ? 1000 : 1) : null
}
const rateOf = (d?: string | null) => {
  const m = String(d || '').match(/(\d+(?:\.\d+)?)\s*折/)
  if (!m) return 1
  const v = parseFloat(m[1])
  return v >= 10 ? v / 100 : v / 10
}
const perGb = (n: number) => `¥${n < 0.1 ? n.toFixed(3) : n.toFixed(2)}`

interface Row { slug: string; name: string; plan: string; traffic: string; monthly: string | null; unit: number; net: number; coupon?: string | null }

// 每家取单价最低的常规月付档（不含定制、独享专线）
const rows = computed<Row[]>(() =>
  (providers as Provider[])
    .map((p): Row | null => {
      const best = p.plans
        .map((x) => ({ ...x, m: num(x.monthly), g: gb(x.traffic) }))
        .filter((x) => x.m && x.g && !/定制|独享|专线/.test(x.name))
        .sort((a, b) => a.m! / a.g! - b.m! / b.g!)[0]
      if (!best) return null
      const unit = best.m! / best.g!
      return { slug: p.slug, name: p.name, plan: best.name, traffic: best.traffic, monthly: best.monthly, unit, net: unit * rateOf(p.couponDiscount), coupon: p.coupon }
    })
    .filter((r): r is Row => r !== null)
    .sort((a, b) => a.unit - b.unit)
)

// 比较每家最近两次价格记录
const changes = computed(() =>
  (providers as Provider[]).flatMap((p) => {
    const h = p.priceHistory || []
    if (h.length < 2) return []
    const [prev, cur] = h.slice(-2)
    const a = num(cur.monthly)!, b = num(prev.monthly)!
    if (a === b) return []
    return [{ name: p.name, slug: p.slug, text: `${prev.monthly} → ${cur.monthly}`, up: a > b, date: cur.date }]
  })
)
const since = computed(() => {
  const ds = (providers as Provider[]).flatMap((p) => (p.priceHistory || []).map((h) => h.date)).sort()
  return ds.length ? { first: ds[0], last: ds[ds.length - 1] } : null
})
const ym = (d: string) => `${d.slice(0, 4)} 年 ${Number(d.slice(5, 7))} 月`
</script>

<template>
  <div class="ppg">
    <div class="ppg-changes">
      <strong>本月价格变动：</strong>
      <template v-if="changes.length">
        <span v-for="c in changes" :key="c.slug" class="ppg-change" :class="c.up ? 'is-up' : 'is-down'">
          <a :href="`/brands/${c.slug}`">{{ c.name }}</a> {{ c.up ? '↑ 涨价' : '↓ 降价' }} {{ c.text }}
        </span>
      </template>
      <span v-else-if="since">暂无。本站从 {{ ym(since.first) }}开始每月记录各品牌入门价，下个月起这里会列出涨价和降价的品牌。</span>
    </div>

    <ol class="ppg-list">
      <li class="ppg-row ppg-header" aria-hidden="true">
        <span>排名</span><span>品牌</span><span>单价最低的月付档</span><span>官网价 / GB</span><span>用优惠码后 / GB</span>
      </li>
      <li v-for="(r, i) in rows" :key="r.slug" class="ppg-row">
        <span class="ppg-rank">{{ i + 1 }}</span>
        <a class="ppg-name" :href="`/brands/${r.slug}`">{{ r.name }}</a>
        <span class="ppg-plan">{{ r.plan }} · {{ r.traffic }} · {{ r.monthly }}</span>
        <span class="ppg-unit"><em>官网价</em>{{ perGb(r.unit) }}/GB</span>
        <span class="ppg-net"><em>用优惠码后</em>{{ r.coupon ? `${perGb(r.net)}/GB` : '无优惠码' }}</span>
      </li>
    </ol>
    <p v-if="since" class="ppg-note">按各品牌官网月付标价计算（不含独享专线和定制套餐），数据日期 {{ since.last }}。单价低不代表线路好，选的时候还要看线路类型和倍率。</p>
  </div>
</template>

<style scoped>
.ppg-changes {
  padding: 0.75rem 1rem;
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  font-size: 0.92rem;
  line-height: 1.8;
}
.ppg-change {
  margin-right: 0.9rem;
}
.ppg-change.is-up { color: #dc2626; }
.ppg-change.is-down { color: #16a34a; }
.ppg-list {
  margin: 1rem 0 0 !important;
  padding: 0 !important;
  list-style: none !important;
}
.ppg-row {
  display: grid;
  grid-template-columns: 2.5rem 7rem minmax(0, 1fr) 7.5rem 8rem;
  gap: 0.75rem;
  align-items: center;
  margin: 0 !important;
  padding: 0.6rem 0.75rem;
  border-bottom: 1px solid var(--vp-c-divider);
  font-size: 0.92rem;
}
.ppg-header {
  color: var(--vp-c-text-2);
  font-size: 0.8rem;
  font-weight: 600;
}
.ppg-rank {
  font-weight: 700;
  color: var(--vp-c-brand-1);
}
.ppg-name {
  font-weight: 600;
}
.ppg-plan {
  color: var(--vp-c-text-2);
}
.ppg-unit, .ppg-net { font-variant-numeric: tabular-nums; }
.ppg-net { color: var(--vp-c-brand-1); font-weight: 600; }
.ppg-row em { display: none; font-style: normal; }
.ppg-note {
  color: var(--vp-c-text-2);
  font-size: 0.85rem;
}
@media (max-width: 640px) {
  .ppg-header { display: none; }
  .ppg-row {
    grid-template-columns: 2rem minmax(0, 1fr);
    gap: 0.15rem 0.6rem;
  }
  .ppg-rank { grid-row: span 4; align-self: start; }
  .ppg-plan, .ppg-unit, .ppg-net { grid-column: 2; font-size: 0.85rem; }
  .ppg-row em { display: inline; margin-right: 0.4rem; color: var(--vp-c-text-2); font-weight: 400; }
}
</style>
