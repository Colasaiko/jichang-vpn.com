<script setup lang="ts">
import { ref } from 'vue'

export interface CompareItem {
  name: string
  tag?: string
  lineType: string
  bandwidth?: string
  protocols: string
  entryPrice: string
  coupon?: string
  trafficHighlight?: string
  streaming?: string
  targetUser: string
  wikiUrl?: string
  affUrl?: string
}

interface Props {
  caption?: string
  badgeText?: string
  items?: CompareItem[]
}

const defaultItems: CompareItem[] = []

const props = withDefaults(defineProps<Props>(), {
  caption: '9 大主力推荐方案技术特性横向比对',
  badgeText: '官网参数横向对照',
  items: () => []
})

const displayItems = props.items && props.items.length ? props.items : defaultItems

// View mode: 'grid' (卡片矩阵) or 'list' (横向清单)
const viewMode = ref<'grid' | 'list'>('grid')
</script>

<template>
  <div class="compare-container">
    <!-- Header with caption and view toggle -->
    <div v-if="caption" class="compare-header">
      <div class="caption-wrapper">
        <h3 class="compare-caption">{{ caption }}</h3>
        <p class="compare-subcaption">9 大主力品牌核心参数对比 · 全局自适应换行 · 无需横向滑动</p>
      </div>
      <div class="header-right-actions">
        <div class="view-toggle-bar">
          <button 
            type="button" 
            class="toggle-btn" 
            :class="{ active: viewMode === 'grid' }"
            @click="viewMode = 'grid'"
            title="切换为卡片矩阵视图"
          >
            <span class="btn-icon">▦</span> 卡片矩阵
          </button>
          <button 
            type="button" 
            class="toggle-btn" 
            :class="{ active: viewMode === 'list' }"
            @click="viewMode = 'list'"
            title="切换为详细清单视图"
          >
            <span class="btn-icon">▤</span> 详细清单
          </button>
        </div>
      </div>
    </div>

    <!-- Mode 1: Auto-wrapping Grid View (卡片矩阵模式 - 自动换行) -->
    <div v-if="viewMode === 'grid'" class="compare-grid-view">
      <div 
        v-for="(item, idx) in displayItems" 
        :key="idx" 
        class="brand-compare-card"
        :class="{ 'featured-lead-card': idx === 0 }"
      >
        <!-- Card Head -->
        <div class="card-head">
          <div class="rank-name-box">
            <span class="rank-pill">{{ idx + 1 }}</span>
            <div class="title-meta">
              <strong class="brand-name">{{ item.name }}</strong>
              <span v-if="item.tag" class="brand-tag">{{ item.tag }}</span>
            </div>
          </div>
          <div class="card-price-badge">
            <span class="price-val">{{ item.entryPrice }}</span>
            <span v-if="item.coupon" class="coupon-pill">{{ item.coupon }}</span>
          </div>
        </div>

        <!-- Card Metrics List -->
        <div class="card-specs-list">
          <div class="spec-row">
            <span class="spec-label">线路架构:</span>
            <span class="spec-value">
              <span class="line-pill">{{ item.lineType }}</span>
              <span v-if="item.bandwidth" class="bandwidth-text">({{ item.bandwidth }})</span>
            </span>
          </div>

          <div class="spec-row">
            <span class="spec-label">核心协议:</span>
            <span class="spec-value">{{ item.protocols }}</span>
          </div>

          <div class="spec-row">
            <span class="spec-label">流量特色:</span>
            <span class="spec-value">{{ item.trafficHighlight || item.streaming || '-' }}</span>
          </div>

          <div class="spec-row highlight-spec">
            <span class="spec-label">选型差异:</span>
            <span class="spec-value target-desc">{{ item.targetUser }}</span>
          </div>
        </div>

        <!-- Card Footer Actions -->
        <div class="card-actions-footer">
          <a v-if="item.wikiUrl" :href="item.wikiUrl" class="btn-wiki">
            Wiki 技术档案
          </a>
          <a v-if="item.affUrl" :href="item.affUrl" target="_blank" rel="nofollow noopener noreferrer sponsored" class="btn-aff">
            访问官网直达 ↗
          </a>
        </div>
      </div>
    </div>

    <!-- Mode 2: Auto-wrapping List View (详细清单模式 - 自动换行) -->
    <div v-else class="compare-list-view">
      <div 
        v-for="(item, idx) in displayItems" 
        :key="idx" 
        class="list-compare-item"
        :class="{ 'featured-lead-item': idx === 0 }"
      >
        <!-- Item Header -->
        <div class="list-item-header">
          <div class="list-brand-left">
            <span class="rank-pill">{{ idx + 1 }}</span>
            <strong class="brand-name">{{ item.name }}</strong>
            <span v-if="item.tag" class="brand-tag">{{ item.tag }}</span>
          </div>
          <div class="list-price-right">
            <span class="price-val">{{ item.entryPrice }}</span>
            <span v-if="item.coupon" class="coupon-pill">{{ item.coupon }}</span>
            <div class="list-actions-inline">
              <a v-if="item.wikiUrl" :href="item.wikiUrl" class="btn-wiki-sm">Wiki 档案</a>
              <a v-if="item.affUrl" :href="item.affUrl" target="_blank" rel="nofollow noopener noreferrer sponsored" class="btn-aff-sm">直达 ↗</a>
            </div>
          </div>
        </div>

        <!-- Item Specs Grid (Responsive & Auto-wrapping) -->
        <div class="list-specs-grid">
          <div class="list-spec-col">
            <span class="col-label">线路架构与带宽</span>
            <div class="col-val">
              <span class="line-pill">{{ item.lineType }}</span>
              <span v-if="item.bandwidth" class="sub-text">{{ item.bandwidth }}</span>
            </div>
          </div>
          <div class="list-spec-col">
            <span class="col-label">协议与倍率</span>
            <div class="col-val">{{ item.protocols }}</div>
          </div>
          <div class="list-spec-col">
            <span class="col-label">流量方案亮点</span>
            <div class="col-val">{{ item.trafficHighlight || item.streaming || '-' }}</div>
          </div>
          <div class="list-spec-col col-highlight">
            <span class="col-label">核心选型定位（对比结论）</span>
            <div class="col-val font-medium">{{ item.targetUser }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Comparison Summary Footer -->
    <div class="compare-footer-summary">
      <span class="footer-tip-icon">💡</span>
      <div class="footer-tip-text">
        <strong>快速选型结论</strong>：大多数人首选 <strong>飞V</strong>（港台日新全专线、全节点 1x、不限设备，官方客户端登录即用，新用户用 <code>fly20</code> 约 ¥20 起）；只看最低价可以看 <strong>无忧链接</strong>（折后约 ¥15.2 起）/ <strong>微风网络</strong>（清风年付 ¥99）；全家大流量看 <strong>跨界云</strong>（1800 GB 月付 ¥130）；需要韩国、东南亚、欧洲节点看 <strong>飞猫云</strong>。
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Container: 100% width, zero horizontal overflow */
.compare-container {
  margin: 2rem 0;
  background: var(--site-card-bg);
  border: 1px solid var(--site-border-color);
  border-radius: var(--site-radius-lg);
  box-shadow: var(--site-card-shadow);
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow: hidden;
}

/* Header */
.compare-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.2rem 1.4rem;
  background: var(--site-bg-subtle);
  border-bottom: 1px solid var(--site-border-color);
  flex-wrap: wrap;
  gap: 0.85rem;
}

.caption-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.compare-caption {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--site-text-primary);
  border: none;
  padding: 0;
}

.compare-subcaption {
  margin: 0;
  font-size: 0.825rem;
  color: var(--site-text-muted);
}

.header-right-actions {
  display: flex;
  align-items: center;
}

/* View Mode Toggle Buttons */
.view-toggle-bar {
  display: inline-flex;
  background: var(--site-bg-canvas);
  border: 1px solid var(--site-border-color);
  border-radius: var(--site-radius-sm);
  padding: 2px;
}

.toggle-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.75rem;
  font-size: 0.8rem;
  font-weight: 600;
  border: none;
  background: transparent;
  color: var(--site-text-secondary);
  border-radius: var(--site-radius-sm);
  cursor: pointer;
  transition: all 0.2s ease;
}

.toggle-btn:hover {
  color: var(--vp-c-brand-1);
}

.toggle-btn.active {
  background: var(--vp-c-brand-1);
  color: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
}

.btn-icon {
  font-size: 0.9rem;
  line-height: 1;
}

/* ========================================================
   Mode 1: Grid View (Auto-wrapping responsive cards)
   ======================================================== */
.compare-grid-view {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(285px, 1fr));
  gap: 1rem;
  padding: 1.2rem;
  box-sizing: border-box;
  width: 100%;
}

.brand-compare-card {
  background: var(--site-bg-canvas);
  border: 1px solid var(--site-border-color);
  border-radius: var(--site-radius-md);
  padding: 1.1rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-sizing: border-box;
  width: 100%;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.brand-compare-card:hover {
  transform: translateY(-2px);
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.featured-lead-card {
  border-color: var(--vp-c-brand-soft);
  background: linear-gradient(180deg, var(--site-bg-subtle) 0%, var(--site-bg-canvas) 100%);
}

/* Card Head */
.card-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.6rem;
  margin-bottom: 0.85rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--site-border-color);
  flex-wrap: wrap;
}

.rank-name-box {
  display: flex;
  align-items: flex-start;
  gap: 0.55rem;
}

.rank-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  font-size: 0.75rem;
  font-weight: 700;
  flex-shrink: 0;
  margin-top: 2px;
}

.title-meta {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.brand-name {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--site-text-primary);
  line-height: 1.3;
}

.brand-tag {
  display: inline-block;
  font-size: 0.72rem;
  color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
  padding: 0.1rem 0.4rem;
  border-radius: var(--site-radius-sm);
  font-weight: 500;
  width: fit-content;
}

.card-price-badge {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}

.price-val {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--vp-c-brand-1);
  white-space: nowrap;
}

.coupon-pill {
  font-size: 0.72rem;
  background: var(--vp-c-green-soft, #e6f7ed);
  color: var(--vp-c-green-1, #137333);
  padding: 0.1rem 0.45rem;
  border-radius: var(--site-radius-sm);
  font-weight: 600;
  white-space: nowrap;
}

/* Card Specs List */
.card-specs-list {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  font-size: 0.85rem;
  margin-bottom: 1rem;
}

.spec-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.6rem;
  word-break: break-word;
  white-space: normal;
}

.spec-label {
  color: var(--site-text-muted);
  font-size: 0.8rem;
  flex-shrink: 0;
}

.spec-value {
  color: var(--site-text-secondary);
  text-align: right;
  line-height: 1.4;
  word-break: break-word;
}

.line-pill {
  font-size: 0.75rem;
  padding: 0.12rem 0.45rem;
  border-radius: var(--site-radius-sm);
  background: var(--vp-c-teal-soft);
  color: var(--vp-c-teal);
  font-weight: 600;
  display: inline-block;
}

.bandwidth-text {
  font-size: 0.78rem;
  color: var(--site-text-muted);
  margin-left: 0.25rem;
}

.highlight-spec {
  background: var(--site-bg-subtle);
  padding: 0.5rem 0.6rem;
  border-radius: var(--site-radius-sm);
  margin-top: 0.2rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.highlight-spec .spec-label {
  color: var(--vp-c-brand-1);
  font-weight: 600;
}

.highlight-spec .target-desc {
  text-align: left;
  color: var(--site-text-primary);
  font-size: 0.825rem;
}

/* Card Actions Footer */
.card-actions-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  padding-top: 0.75rem;
  border-top: 1px dashed var(--site-border-color);
  margin-top: auto;
}

.btn-wiki {
  font-size: 0.825rem;
  font-weight: 600;
  color: var(--vp-c-brand-1);
  text-decoration: none;
  padding: 0.3rem 0.5rem;
}

.btn-wiki:hover {
  text-decoration: underline;
}

.btn-aff {
  font-size: 0.825rem;
  font-weight: 600;
  color: #fff;
  background: var(--vp-c-brand-1);
  padding: 0.35rem 0.75rem;
  border-radius: var(--site-radius-sm);
  text-decoration: none;
  transition: opacity 0.2s ease;
}

.btn-aff:hover {
  opacity: 0.9;
}

/* ========================================================
   Mode 2: List View (Auto-wrapping wide items)
   ======================================================== */
.compare-list-view {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  padding: 1.2rem;
  box-sizing: border-box;
  width: 100%;
}

.list-compare-item {
  background: var(--site-bg-canvas);
  border: 1px solid var(--site-border-color);
  border-radius: var(--site-radius-md);
  padding: 1.1rem;
  box-sizing: border-box;
  width: 100%;
  transition: border-color 0.2s ease;
}

.list-compare-item:hover {
  border-color: var(--vp-c-brand-1);
}

.list-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--site-border-color);
  margin-bottom: 0.85rem;
}

.list-brand-left {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.list-price-right {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.list-actions-inline {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-left: 0.4rem;
}

.btn-wiki-sm {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--vp-c-brand-1);
  text-decoration: none;
  padding: 0.2rem 0.45rem;
}

.btn-aff-sm {
  font-size: 0.78rem;
  font-weight: 600;
  color: #fff;
  background: var(--vp-c-brand-1);
  padding: 0.25rem 0.6rem;
  border-radius: var(--site-radius-sm);
  text-decoration: none;
}

/* Specs Grid in List Mode: Responsive 4 cols -> 2 cols -> 1 col */
.list-specs-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.85rem;
  box-sizing: border-box;
  width: 100%;
}

.list-spec-col {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.85rem;
  word-break: break-word;
  white-space: normal;
}

.col-label {
  font-size: 0.78rem;
  color: var(--site-text-muted);
}

.col-val {
  color: var(--site-text-secondary);
  line-height: 1.4;
}

.col-val .sub-text {
  font-size: 0.78rem;
  color: var(--site-text-muted);
  display: block;
}

.col-highlight {
  background: var(--site-bg-subtle);
  padding: 0.5rem 0.65rem;
  border-radius: var(--site-radius-sm);
}

.col-highlight .col-label {
  color: var(--vp-c-brand-1);
  font-weight: 600;
}

.font-medium {
  font-weight: 500;
  color: var(--site-text-primary);
}

/* ========================================================
   Footer Summary
   ======================================================== */
.compare-footer-summary {
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  padding: 0.95rem 1.4rem;
  background: var(--site-bg-subtle);
  border-top: 1px solid var(--site-border-color);
  font-size: 0.825rem;
  line-height: 1.55;
  color: var(--site-text-secondary);
}

.footer-tip-icon {
  font-size: 1rem;
  flex-shrink: 0;
  margin-top: 1px;
}

/* ========================================================
   Responsive Breakpoints: Clean Auto-wrapping everywhere
   ======================================================== */
@media (max-width: 900px) {
  .list-specs-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .compare-grid-view {
    grid-template-columns: 1fr;
    padding: 0.85rem;
  }
  .compare-list-view {
    padding: 0.85rem;
  }
  .list-specs-grid {
    grid-template-columns: 1fr;
  }
  .list-item-header {
    flex-direction: column;
    align-items: flex-start;
  }
  .list-price-right {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
