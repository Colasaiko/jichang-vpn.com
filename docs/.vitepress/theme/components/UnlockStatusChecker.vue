<script setup lang="ts">
import { ref, computed } from 'vue'
import rawProviders from '../../data/providers.json'

interface Provider {
  name: string
  slug: string
  logo?: string
  lineType?: string
  aiSupport?: string
  streamingSupport?: string
  features?: string[]
  targetUrl?: string
  startPrice?: string
}

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

const allProviders = rawProviders as Provider[]

const selectedPlatform = ref<'all' | 'chatgpt' | 'claude' | 'netflix' | 'disney' | 'youtube' | 'tiktok'>('all')
const searchQuery = ref('')

const platforms = [
  { id: 'all', name: '全部服务', icon: '🌐' },
  { id: 'chatgpt', name: 'ChatGPT (OpenAI)', icon: '🤖' },
  { id: 'claude', name: 'Claude (Anthropic)', icon: '🧠' },
  { id: 'netflix', name: 'Netflix (奈飞全区)', icon: '🍿' },
  { id: 'disney', name: 'Disney+', icon: '🏰' },
  { id: 'youtube', name: 'YouTube Premium', icon: '📺' },
  { id: 'tiktok', name: 'TikTok / 社媒', icon: '📱' }
]

const filteredList = computed(() => {
  return allProviders.filter(p => {
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.trim().toLowerCase()
      if (!p.name.toLowerCase().includes(q) && !p.slug.toLowerCase().includes(q)) {
        return false
      }
    }
    return true
  })
})

type Level = 'good' | 'warn' | 'none'

// Each platform is matched against the brand's officially stated AI / streaming
// support text, so the matrix only repeats what the brand itself claims.
const platformRules: Record<string, { label: string; field: 'aiSupport' | 'streamingSupport'; names: RegExp; generic: RegExp }> = {
  chatgpt: { label: '🤖 ChatGPT', field: 'aiSupport', names: /ChatGPT|OpenAI/i, generic: /AI/i },
  claude: { label: '🧠 Claude', field: 'aiSupport', names: /Claude/i, generic: /AI/i },
  netflix: { label: '🍿 Netflix', field: 'streamingSupport', names: /Netflix|奈飞/i, generic: /流媒体/ },
  disney: { label: '🏰 Disney+', field: 'streamingSupport', names: /Disney/i, generic: /流媒体/ },
  youtube: { label: '📺 YouTube', field: 'streamingSupport', names: /YouTube/i, generic: /流媒体/ },
  tiktok: { label: '📱 TikTok', field: 'streamingSupport', names: /TikTok/i, generic: /流媒体/ }
}

function getPlatformStatus(p: Provider, platformId: string): { badge: string; level: Level } {
  const rule = platformRules[platformId]
  const text = p[rule.field] || ''
  if (!text || /未提供/.test(text)) return { badge: '官网未说明', level: 'none' }
  if (rule.names.test(text)) return { badge: '官网标注支持', level: 'good' }
  if (rule.generic.test(text)) return { badge: '官网称支持，未列明平台', level: 'warn' }
  return { badge: '官网未说明', level: 'none' }
}

const visiblePlatforms = computed(() =>
  selectedPlatform.value === 'all' ? Object.keys(platformRules) : [selectedPlatform.value]
)
</script>

<template>
  <div class="unlock-checker">
    <!-- Header Hero -->
    <div class="unlock-hero-card">
      <div class="hero-text">
        <span class="hero-badge">官网资料整理 · 非实测</span>
        <h2 class="hero-title">AI 工具与海外流媒体解锁矩阵</h2>
        <p class="hero-desc">
          很多用户使用 ChatGPT / Claude 或看 Netflix 时会遇到 <strong>“Access Denied 1020”</strong>、验证码循环甚至账号风控。
          本表整理了各机场<strong>官网公开标注</strong>的 AI 与流媒体支持情况，方便快速比较。本站没有逐家实测，实际能否解锁取决于你连接的节点，购买前建议先月付试用。
        </p>
      </div>
    </div>

    <!-- Platform Tabs -->
    <div class="platform-tabs-bar">
      <button
        v-for="plat in platforms"
        :key="plat.id"
        class="platform-tab-btn"
        :class="{ active: selectedPlatform === plat.id }"
        @click="selectedPlatform = (plat.id as any)"
      >
        <span class="tab-icon">{{ plat.icon }}</span>
        <span>{{ plat.name }}</span>
      </button>
    </div>

    <!-- Search Input -->
    <div class="unlock-search-wrap">
      <input
        v-model="searchQuery"
        type="text"
        class="unlock-search-input"
        placeholder="搜索机场名称（如：微风、飞猫、大佬、Firefly...）"
      />
    </div>

    <!-- Providers Grid -->
    <div class="unlock-grid">
      <div
        v-for="item in filteredList"
        :key="item.slug"
        class="unlock-card"
      >
        <div class="unlock-card-head">
          <div class="brand-left">
            <img v-if="item.logo" :src="item.logo" :alt="item.name" class="unlock-logo" />
            <div>
              <h4 class="brand-name">{{ item.name }}</h4>
              <span class="line-tag">{{ item.lineType || '专线' }} · {{ item.startPrice }}</span>
            </div>
          </div>
          <span class="status-pill status-good">
            官网资料
          </span>
        </div>

        <!-- Platform Specific Status -->
        <div class="platform-details-box">
          <div v-for="pid in visiblePlatforms" :key="pid" class="detail-row">
            <span class="detail-name">{{ platformRules[pid].label }}:</span>
            <span class="detail-status" :class="getPlatformStatus(item, pid).level">{{ getPlatformStatus(item, pid).badge }}</span>
          </div>
        </div>

        <div class="unlock-tips-row">
          <span class="tips-icon">💡</span>
          <span class="tips-text">使用 Claude 时建议选美国、新加坡等官方支持地区的节点。</span>
        </div>

        <!-- Actions -->
        <div class="unlock-actions">
          <a
            :href="'/go/' + item.slug + '/'"
            target="_blank" rel="nofollow noopener noreferrer sponsored"
            class="btn-visit"
          >
            官网直达 ↗
          </a>
          <a :href="getBrandGuideUrl(item.slug)" class="btn-guide">
            Wiki 档案与教程
          </a>
        </div>
      </div>
    </div>

    <!-- Platform Risk Warning Box -->
    <div class="risk-card">
      <h3 class="risk-title">⚠️ 2026 AI 与流媒体防风控避坑三大法则</h3>
      <div class="risk-grid">
        <div class="risk-item">
          <h4>1. Claude 封号红线：坚决避开香港与俄罗斯节点</h4>
          <p>Anthropic 官方未开放中国香港及俄罗斯服务。用这两个地区的节点登录 Claude 很容易被风控停号，建议连接美国、英国或新加坡等支持地区的节点。</p>
        </div>
        <div class="risk-item">
          <h4>2. ChatGPT “Too many requests in 1 hour”</h4>
          <p>这说明该机房 IP 有几百个人同时在调用 OpenAI 网页端。切换到机场排序靠后、冷门的原生专线节点即可秒恢复。</p>
        </div>
        <div class="risk-item">
          <h4>3. Netflix 只能看自制剧？</h4>
          <p>这说明该节点被 Netflix 识别为了机房代理 IP（VPN 数据中心），锁了特定地区版权。选择标有“流媒体解锁”或“原生 IP”的节点即可解锁全区大片。</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.unlock-checker {
  margin: 1.5rem 0 3rem;
  font-family: var(--vp-font-family-base);
}

.unlock-hero-card {
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.12) 0%, rgba(147, 51, 234, 0.12) 100%);
  border: 1px solid rgba(37, 99, 235, 0.25);
  border-radius: var(--site-radius-lg);
  padding: 1.75rem 2rem;
  margin-bottom: 1.5rem;
}

.hero-badge {
  display: inline-block;
  background: var(--vp-c-brand-1);
  color: #ffffff;
  padding: 0.15rem 0.55rem;
  border-radius: var(--site-radius-full);
  font-size: 0.75rem;
  font-weight: 700;
  margin-bottom: 0.65rem;
}

.hero-title {
  margin: 0 0 0.5rem;
  font-size: 1.45rem;
  font-weight: 800;
  color: var(--site-text-primary);
}

.hero-desc {
  margin: 0;
  font-size: 0.92rem;
  color: var(--site-text-secondary);
  line-height: 1.6;
}

.platform-tabs-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
}

.platform-tab-btn {
  background: var(--site-bg-subtle);
  border: 1px solid var(--site-border-color);
  color: var(--site-text-secondary);
  padding: 0.45rem 0.95rem;
  border-radius: var(--site-radius-full);
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  transition: all 0.15s;
}

.platform-tab-btn:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.platform-tab-btn.active {
  background: var(--vp-c-brand-1);
  color: #ffffff;
  border-color: var(--vp-c-brand-1);
}

.unlock-search-wrap {
  margin-bottom: 1.5rem;
}

.unlock-search-input {
  width: 100%;
  padding: 0.65rem 1rem;
  border-radius: var(--site-radius-md);
  border: 1px solid var(--site-border-color);
  background: var(--site-card-bg);
  color: var(--site-text-primary);
  font-size: 0.92rem;
  outline: none;
  box-shadow: var(--site-card-shadow);
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.unlock-search-input:focus {
  border-color: var(--vp-c-brand-1);
}

.unlock-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(310px, 1fr));
  gap: 1.25rem;
  margin-bottom: 2.5rem;
}

.unlock-card {
  background: var(--site-card-bg);
  border: 1px solid var(--site-border-color);
  border-radius: var(--site-radius-lg);
  padding: 1.25rem;
  box-shadow: var(--site-card-shadow);
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.unlock-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--site-card-shadow-hover);
  border-color: var(--vp-c-brand-1);
}

.unlock-card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.brand-left {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.unlock-logo {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  object-fit: cover;
  border: 1px solid var(--site-border-color);
  background: #ffffff;
}

.brand-name {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--site-text-primary);
}

.line-tag {
  font-size: 0.75rem;
  color: var(--site-text-muted);
}

.status-pill {
  font-size: 0.75rem;
  padding: 0.15rem 0.5rem;
  border-radius: var(--site-radius-full);
  font-weight: 700;
}

.status-good {
  background: rgba(13, 148, 136, 0.15);
  color: var(--vp-c-teal);
}

.platform-details-box {
  background: var(--site-bg-subtle);
  border-radius: var(--site-radius-md);
  padding: 0.75rem 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  font-size: 0.82rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-name {
  color: var(--site-text-muted);
}

.detail-status.good {
  color: var(--vp-c-teal);
  font-weight: 600;
}

.detail-status.warn {
  color: var(--vp-c-warning-1);
  font-weight: 600;
}

.detail-status.none {
  color: var(--site-text-muted);
}

.unlock-tips-row {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.78rem;
  color: var(--site-text-secondary);
}

.unlock-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: auto;
}

.btn-visit {
  flex: 1;
  background: var(--vp-c-brand-1);
  color: #ffffff !important;
  text-align: center;
  padding: 0.45rem;
  border-radius: var(--site-radius-md);
  font-size: 0.85rem;
  font-weight: 600;
  text-decoration: none !important;
}

.btn-guide {
  flex: 1;
  background: var(--site-bg-subtle);
  border: 1px solid var(--site-border-color);
  color: var(--site-text-secondary) !important;
  text-align: center;
  padding: 0.45rem;
  border-radius: var(--site-radius-md);
  font-size: 0.82rem;
  text-decoration: none !important;
}

/* Risk Guide */
.risk-card {
  background: var(--site-card-bg);
  border: 1px solid var(--site-border-color);
  border-radius: var(--site-radius-lg);
  padding: 1.75rem;
  box-shadow: var(--site-card-shadow);
}

.risk-title {
  margin: 0 0 1.25rem;
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--site-text-primary);
}

.risk-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.25rem;
}

.risk-item h4 {
  margin: 0 0 0.35rem;
  font-size: 0.95rem;
  color: #e11d48;
}

.risk-item p {
  margin: 0;
  font-size: 0.85rem;
  color: var(--site-text-secondary);
  line-height: 1.6;
}
</style>
