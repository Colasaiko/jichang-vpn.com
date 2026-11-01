<script setup lang="ts">
// 机场品牌并排对比：宽屏为等宽列（不左右滚动），窄屏按对比项逐条列出各品牌
import { ref, computed } from 'vue'
import rawProviders from '../../data/providers.json'
import brandEditorial from '../../data/brand-editorial.json'

interface Provider {
  name: string
  slug: string
  logo?: string
  lineType?: string
  startPrice?: string
  coupon?: string | null
  couponDiscount?: string | null
  clientSupport?: string
  aiSupport?: string
  streamingSupport?: string
  targetUrl?: string
  plans?: Array<{ name: string; traffic: string; monthly?: string | null; oneTime?: string | null }>
}
interface Editorial {
  oneLiner?: string
  client?: string
  fit?: string[]
}

const MAX = 4
const TOP_PICK = 'feiv'
const FOCUS = ['kuajieyun', 'sogoyun', 'lingdongyun', 'yinxingren']
const editorial = brandEditorial as Record<string, Editorial>
const allProviders = (rawProviders as Provider[]).filter((p) => editorial[p.slug])

const selectedSlugs = ref<string[]>(['feiv', 'weifengwangluo', 'dalao'])
const highlightDiffOnly = ref(false)
const brandToAdd = ref('')

const presets = [
  { label: '⭐ 飞V 与热门品牌', slugs: ['feiv', 'weifengwangluo', 'feimaoyun'] },
  { label: '💰 低价入门', slugs: ['wuyoulianjie', 'muguangjiasu', 'dalao'] },
  { label: '📦 大流量', slugs: ['kuajieyun', 'feiv', 'wuyoulianjie'] },
  { label: '🔧 支持 Clash 订阅', slugs: ['sogoyun', 'lingdongyun'] }
]

function addBrand() {
  if (brandToAdd.value && !selectedSlugs.value.includes(brandToAdd.value) && selectedSlugs.value.length < MAX) {
    selectedSlugs.value.push(brandToAdd.value)
  }
  brandToAdd.value = ''
}
function removeBrand(slug: string) {
  selectedSlugs.value = selectedSlugs.value.filter((s) => s !== slug)
}
function setPreset(slugs: string[]) {
  selectedSlugs.value = [...slugs]
}

const selected = computed(() =>
  selectedSlugs.value.map((s) => allProviders.find((p) => p.slug === s)).filter((p): p is Provider => Boolean(p))
)

const unknown = (v?: string) => !v || /未提供/.test(v)
const CLIENT_LABEL: Record<string, string> = {
  'official-only': '官方客户端（订阅防泄露）',
  official: '官方客户端',
  subscription: '支持订阅（Clash / 小火箭）'
}

interface Row { key: string; label: string; value: (p: Provider) => string }
const rows: Row[] = [
  { key: 'verdict', label: '一句话点评', value: (p) => editorial[p.slug]?.oneLiner || '-' },
  { key: 'line', label: '线路类型', value: (p) => p.lineType || '官网未说明' },
  { key: 'price', label: '起步价', value: (p) => p.startPrice ? `${p.startPrice}${p.coupon ? '（用优惠码后）' : ''}` : '以官网为准' },
  { key: 'coupon', label: '优惠码', value: (p) => (p.coupon ? `${p.coupon}（${p.couponDiscount || '优惠'}）` : '暂无') },
  { key: 'client', label: '客户端', value: (p) => CLIENT_LABEL[editorial[p.slug]?.client || ''] || '以官网为准' },
  { key: 'device', label: '设备数', value: (p) => (unknown(p.clientSupport) ? '官网未明确说明' : p.clientSupport!) },
  {
    key: 'onetime',
    label: '不限时流量包',
    value: (p) => (p.plans?.some((x) => x.oneTime || /不限时|永久|一次性/.test(x.name)) ? '有' : '没有，只有周期套餐')
  },
  { key: 'ai', label: 'ChatGPT / Claude', value: (p) => (unknown(p.aiSupport) ? '官网未明确说明' : p.aiSupport!) },
  { key: 'stream', label: 'Netflix / Disney+', value: (p) => (unknown(p.streamingSupport) ? '官网未明确说明' : p.streamingSupport!) },
  { key: 'fit', label: '最适合', value: (p) => editorial[p.slug]?.fit?.[0] || '-' }
]

const isDiff = (row: Row) => selected.value.length > 1 && selected.value.some((p) => row.value(p) !== row.value(selected.value[0]))
const visibleRows = computed(() => rows.filter((r) => !highlightDiffOnly.value || isDiff(r)))
const gridStyle = computed(() => ({ '--brand-cols': String(Math.max(selected.value.length, 1)) }))
</script>

<template>
  <div class="brand-comparator">
    <!-- 控制区 -->
    <div class="bc-controls">
      <div class="bc-title-row">
        <div>
          <h3 class="bc-title">⚖️ 机场品牌并排对比</h3>
          <p class="bc-sub">最多选 {{ MAX }} 家，资料整理自各品牌官网，本站未做实际测速。</p>
        </div>
        <div v-if="selectedSlugs.length < MAX" class="bc-add">
          <select v-model="brandToAdd" class="bc-select" aria-label="添加对比品牌">
            <option value="" disabled>+ 添加品牌</option>
            <option v-for="p in allProviders.filter((x) => !selectedSlugs.includes(x.slug))" :key="p.slug" :value="p.slug">
              {{ p.name }}
            </option>
          </select>
          <button class="bc-add-btn" :disabled="!brandToAdd" @click="addBrand">添加</button>
        </div>
      </div>

      <div class="bc-presets">
        <button v-for="ps in presets" :key="ps.label" class="bc-chip" @click="setPreset(ps.slugs)">{{ ps.label }}</button>
        <label class="bc-diff">
          <input v-model="highlightDiffOnly" type="checkbox" />
          <span>只看不同的项目</span>
        </label>
      </div>
    </div>

    <div v-if="selected.length" class="bc-grid" :style="gridStyle">
      <!-- 品牌表头 -->
      <div class="bc-row bc-head">
        <div class="bc-label"></div>
        <div v-for="p in selected" :key="p.slug" class="bc-brand" :class="{ 'is-top': p.slug === TOP_PICK }">
          <button v-if="selected.length > 1" class="bc-remove" :title="'移除 ' + p.name" @click="removeBrand(p.slug)">×</button>
          <img v-if="p.logo" :src="p.logo" :alt="p.name + ' Logo'" width="40" height="40" class="bc-logo no-zoom" />
          <div class="bc-name">{{ p.name }}</div>
          <span v-if="p.slug === TOP_PICK" class="bc-pill top">⭐ 本站主推</span>
          <span v-else class="bc-pill">{{ FOCUS.includes(p.slug) ? '重点品牌' : '主力品牌' }}</span>
        </div>
      </div>

      <!-- 对比项 -->
      <div v-for="row in visibleRows" :key="row.key" class="bc-row" :class="{ 'is-diff': isDiff(row) }">
        <div class="bc-label">{{ row.label }}</div>
        <div v-for="p in selected" :key="p.slug + row.key" class="bc-cell" :class="{ 'is-top': p.slug === TOP_PICK }">
          <span class="bc-cell-brand">{{ p.name }}</span>
          <span class="bc-cell-val">{{ row.value(p) }}</span>
        </div>
      </div>

      <!-- 购买与文章 -->
      <div class="bc-row bc-actions">
        <div class="bc-label">去看看</div>
        <div v-for="p in selected" :key="p.slug + 'act'" class="bc-cell" :class="{ 'is-top': p.slug === TOP_PICK }">
          <span class="bc-cell-brand">{{ p.name }}</span>
          <div class="bc-btns">
            <a v-if="p.targetUrl" :href="p.targetUrl" target="_blank" rel="nofollow noopener noreferrer sponsored" class="bc-btn primary">访问官网 ↗</a>
            <a :href="'/brands/' + p.slug" class="bc-btn">完整分析</a>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="bc-empty">
      <p>请至少选择 1 个品牌。</p>
      <button class="bc-chip" @click="setPreset(presets[0].slugs)">恢复默认组合</button>
    </div>
  </div>
</template>

<style scoped>
.brand-comparator { margin: 1.5rem 0 2rem; }

.bc-controls {
  padding: 1.1rem 1.25rem;
  margin-bottom: 1rem;
  border: 1px solid var(--site-border-color);
  border-radius: var(--site-radius-lg);
  background: var(--site-card-bg);
}
.bc-title-row { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: flex-start; gap: 0.75rem; }
.bc-title { margin: 0; font-size: 1.1rem; font-weight: 700; color: var(--site-text-primary); }
.bc-sub { margin: 0.25rem 0 0; font-size: 0.82rem; color: var(--site-text-muted); }
.bc-add { display: flex; gap: 0.5rem; }
.bc-select {
  padding: 0.4rem 0.6rem;
  border: 1px solid var(--site-border-color);
  border-radius: var(--site-radius-sm);
  background: var(--site-bg-canvas);
  color: var(--site-text-primary);
  font-size: 0.85rem;
}
.bc-add-btn {
  padding: 0.4rem 0.9rem;
  border-radius: var(--site-radius-sm);
  background: var(--vp-c-brand-1);
  color: #fff;
  font-size: 0.85rem;
  font-weight: 600;
}
.bc-add-btn:disabled { opacity: 0.45; cursor: not-allowed; }
.bc-presets { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem; margin-top: 0.9rem; }
.bc-chip {
  padding: 0.3rem 0.8rem;
  border: 1px solid var(--site-border-color);
  border-radius: var(--site-radius-full);
  background: var(--site-bg-subtle);
  color: var(--site-text-secondary);
  font-size: 0.82rem;
  transition: border-color 0.15s, color 0.15s;
}
.bc-chip:hover { border-color: var(--vp-c-brand-1); color: var(--vp-c-brand-1); }
.bc-diff { display: inline-flex; align-items: center; gap: 0.35rem; margin-left: auto; font-size: 0.82rem; color: var(--site-text-secondary); cursor: pointer; }

/* 对比网格：品牌列等分剩余宽度，内容自动换行，不会出现左右滚动 */
.bc-grid {
  border: 1px solid var(--site-border-color);
  border-radius: var(--site-radius-lg);
  background: var(--site-card-bg);
  overflow: hidden;
}
.bc-row {
  display: grid;
  grid-template-columns: 7.5rem repeat(var(--brand-cols), minmax(0, 1fr));
  border-top: 1px solid var(--site-border-color);
}
.bc-row:first-child { border-top: none; }
.bc-row.is-diff .bc-label { color: var(--vp-c-brand-1); }
.bc-label {
  padding: 0.75rem 0.85rem;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--site-text-secondary);
  background: var(--site-bg-subtle);
}
.bc-cell, .bc-brand {
  padding: 0.75rem 0.85rem;
  border-left: 1px solid var(--site-border-color);
  font-size: 0.86rem;
  line-height: 1.55;
  color: var(--site-text-primary);
  overflow-wrap: anywhere;
}
.bc-cell.is-top, .bc-brand.is-top { background: var(--vp-c-brand-soft); }
.bc-cell-brand { display: none; }

.bc-head .bc-label { background: transparent; }
.bc-brand { position: relative; display: flex; flex-direction: column; align-items: center; gap: 0.3rem; text-align: center; }
.bc-logo { border-radius: 10px; object-fit: cover; }
.bc-name { font-size: 0.95rem; font-weight: 700; }
.bc-pill {
  padding: 0.05rem 0.5rem;
  border-radius: var(--site-radius-full);
  font-size: 0.72rem;
  color: var(--site-text-muted);
  background: var(--site-bg-subtle);
  border: 1px solid var(--site-border-color);
}
.bc-pill.top { color: #fff; background: var(--vp-c-brand-1); border-color: var(--vp-c-brand-1); font-weight: 700; }
.bc-remove {
  position: absolute;
  top: 0.35rem;
  right: 0.45rem;
  width: 1.4rem;
  height: 1.4rem;
  border-radius: 50%;
  font-size: 0.95rem;
  line-height: 1;
  color: var(--site-text-muted);
}
.bc-remove:hover { color: #ef4444; background: rgba(239, 68, 68, 0.1); }

.bc-btns { display: flex; flex-direction: column; gap: 0.4rem; }
.bc-btn {
  display: block;
  padding: 0.4rem 0.5rem;
  border: 1px solid var(--site-border-color);
  border-radius: var(--site-radius-sm);
  text-align: center;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--site-text-primary) !important;
  text-decoration: none !important;
}
.bc-btn.primary { background: var(--vp-c-brand-1); border-color: var(--vp-c-brand-1); color: #fff !important; }
.bc-btn:hover { border-color: var(--vp-c-brand-1); }

.bc-empty { padding: 2rem; text-align: center; border: 1px dashed var(--site-border-color); border-radius: var(--site-radius-lg); }

/* 窄屏：每个对比项成为一块，逐行列出「品牌：内容」 */
@media (max-width: 640px) {
  .bc-diff { margin-left: 0; }
  .bc-head { display: flex; flex-wrap: wrap; gap: 0.5rem; padding: 0.75rem; }
  .bc-head .bc-label { display: none; }
  .bc-head .bc-brand {
    flex: 1 1 40%;
    flex-direction: row;
    justify-content: flex-start;
    gap: 0.45rem;
    padding: 0.5rem 1.8rem 0.5rem 0.6rem;
    border: 1px solid var(--site-border-color);
    border-radius: var(--site-radius-md);
    text-align: left;
  }
  .bc-head .bc-logo { width: 28px; height: 28px; }
  .bc-head .bc-pill { display: none; }
  .bc-row:not(.bc-head) { display: block; }
  .bc-row:not(.bc-head) .bc-label { padding: 0.55rem 0.85rem; }
  .bc-row:not(.bc-head) .bc-cell {
    display: grid;
    grid-template-columns: 5.5rem minmax(0, 1fr);
    gap: 0.5rem;
    border-left: none;
    border-top: 1px dashed var(--site-border-color);
    padding: 0.55rem 0.85rem;
  }
  .bc-cell-brand { display: block; font-weight: 700; color: var(--site-text-secondary); }
  .bc-btns { flex-direction: row; }
  .bc-btn { flex: 1; }
}
</style>
