<script setup lang="ts">
interface BrandProps {
  name: string
  tagline?: string
  badge?: string
  protocols?: string[]
  features?: string[]
  entryPrice?: string
  billingCycle?: string
  detailUrl?: string
  affiliateUrl?: string
  isDemo?: boolean
}

const props = withDefaults(defineProps<BrandProps>(), {
  tagline: '',
  badge: '演示品牌',
  protocols: () => ['Shadowsocks', 'Vless', 'Hysteria2'],
  features: () => ['多线BGP中继', '流媒体解锁', '多平台客户端'],
  entryPrice: '¥15',
  billingCycle: '月起',
  detailUrl: '',
  affiliateUrl: '',
  isDemo: true
})
</script>

<template>
  <div class="brand-card">
    <div class="brand-card-header">
      <div class="brand-header-info">
        <h3 class="brand-name">{{ name }}</h3>
        <span v-if="badge" class="brand-badge">{{ badge }}</span>
      </div>
      <div v-if="entryPrice" class="brand-price">
        <span class="price-val">{{ entryPrice }}</span>
        <span class="price-cycle">/{{ billingCycle }}</span>
      </div>
    </div>

    <p v-if="tagline" class="brand-tagline">{{ tagline }}</p>

    <div v-if="protocols && protocols.length" class="brand-protocols">
      <span class="protocol-label">支持协议:</span>
      <div class="protocol-tags">
        <span v-for="proto in protocols" :key="proto" class="proto-tag">
          {{ proto }}
        </span>
      </div>
    </div>

    <ul v-if="features && features.length" class="brand-features">
      <li v-for="(feat, index) in features" :key="index">
        <svg class="check-icon" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
        </svg>
        <span>{{ feat }}</span>
      </li>
    </ul>

    <div v-if="isDemo" class="brand-demo-note">
      * 注：本卡片为规范演示数据，非真实商业评级
    </div>

    <div class="brand-card-actions">
      <a v-if="detailUrl" :href="detailUrl" class="brand-btn-detail">查看资料库</a>
      <a v-if="affiliateUrl" :href="affiliateUrl" target="_blank" rel="nofollow noopener noreferrer sponsored" class="brand-btn-visit">
        访问官网 ↗
      </a>
    </div>
  </div>
</template>

<style scoped>
.brand-card {
  background: var(--site-card-bg);
  border: 1px solid var(--site-card-border);
  border-radius: var(--site-radius-lg);
  padding: 1.5rem;
  box-shadow: var(--site-card-shadow);
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  position: relative;
  overflow: hidden;
  margin-bottom: 1.5rem;
}

.brand-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--site-card-shadow-hover);
  border-color: var(--vp-c-brand-1);
}

.brand-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.brand-header-info {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
}

.brand-name {
  margin: 0;
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--site-text-primary);
  letter-spacing: -0.01em;
}

.brand-badge {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.2rem 0.6rem;
  border-radius: var(--site-radius-full);
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
}

.brand-price {
  text-align: right;
  white-space: nowrap;
}

.price-val {
  font-size: 1.45rem;
  font-weight: 800;
  color: var(--site-text-primary);
}

.price-cycle {
  font-size: 0.85rem;
  color: var(--site-text-muted);
}

.brand-tagline {
  margin: 0 0 1rem 0;
  font-size: 0.95rem;
  color: var(--site-text-secondary);
  line-height: 1.5;
}

.brand-protocols {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.protocol-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--site-text-muted);
}

.protocol-tags {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.proto-tag {
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.15rem 0.5rem;
  border-radius: var(--site-radius-sm);
  background: var(--site-bg-subtle);
  color: var(--site-text-secondary);
  border: 1px solid var(--site-border-color);
}

.brand-features {
  list-style: none;
  padding: 0;
  margin: 0 0 1.25rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.brand-features li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: var(--site-text-secondary);
  line-height: 1.4;
}

.check-icon {
  width: 16px;
  height: 16px;
  color: var(--vp-c-teal);
  flex-shrink: 0;
}

.brand-demo-note {
  font-size: 0.75rem;
  color: var(--site-text-muted);
  margin-bottom: 1rem;
  font-style: italic;
}

.brand-card-actions {
  margin-top: auto;
  display: flex;
  gap: 0.75rem;
}

.brand-btn-detail {
  flex: 1;
  text-align: center;
  padding: 0.55rem 0.85rem;
  border-radius: var(--site-radius-md);
  font-size: 0.9rem;
  font-weight: 600;
  background: var(--site-bg-subtle);
  color: var(--site-text-primary);
  border: 1px solid var(--site-border-subtle);
  text-decoration: none;
  transition: all 0.2s ease;
}

.brand-btn-detail:hover {
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
  text-decoration: none;
}

.brand-btn-visit {
  flex: 1;
  text-align: center;
  padding: 0.55rem 0.85rem;
  border-radius: var(--site-radius-md);
  font-size: 0.9rem;
  font-weight: 600;
  background: var(--vp-c-brand-1);
  color: #ffffff !important;
  border: 1px solid transparent;
  text-decoration: none;
  transition: opacity 0.2s ease;
}

.brand-btn-visit:hover {
  opacity: 0.9;
  text-decoration: none;
}
</style>
