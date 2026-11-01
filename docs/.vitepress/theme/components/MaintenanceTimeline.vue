<script setup lang="ts">
import { ref, computed } from 'vue'

interface TimelineItem {
  date: string
  title: string
  brand: string
  category: 'maintenance' | 'kernel' | 'promo' | 'expansion'
  categoryLabel: string
  status: 'completed' | 'ongoing' | 'upcoming'
  statusLabel: string
  content: string
  actionAdvice: string
  link?: string
}

const activeFilter = ref<'all' | 'maintenance' | 'kernel' | 'promo' | 'expansion'>('all')

const timelineData: TimelineItem[] = [
  {
    date: '2026-10-30',
    title: '俄罗斯被曝考虑限制境外流量，欧美 VPN 监管仍在推进',
    brand: '政策与监管',
    category: 'maintenance',
    categoryLabel: '监管动态',
    status: 'ongoing',
    statusLabel: '持续观察',
    content: '俄罗斯数字发展部被曝研究让境外流量全部经过 TSPU 并按用户设上限（单一信源、未定案）；犹他州 VPN 位置条款已于 9 月被法院暂停；欧盟反盗版封锁令尚无正式提案。',
    actionAdvice: '以上都还没有落地，对国内用户暂无直接影响；黑五海外 VPN 便宜，但国内直连稳定性一般，建议先月付体验。',
    link: '/blog/daily-monitor-2026-10-30'
  },
  {
    date: '2026-10-29',
    title: '高校 VPN 管控传闻与欧盟版权封锁令草案动向',
    brand: '政策与监管',
    category: 'maintenance',
    categoryLabel: '监管动态',
    status: 'ongoing',
    statusLabel: '持续观察',
    content: '外媒报道国内高校加强校园网 VPN 审计与纪律提示；欧盟版权改革方案草案探讨是否要求 VPN 承担反盗版流量过滤义务；Proton 提前打响黑五促销。',
    actionAdvice: '高校用户推荐使用手机移动网络或具备规则分流的专属客户端；海外黑五大促虽便宜但国内直连体验一般，建议优先选择国内专线服务。',
    link: '/blog/daily-monitor-2026-10-29'
  },
  {
    date: '2026-10-29',
    title: '本站品牌库聚焦：9 大主力与 4 家重点品牌',
    brand: '本站资料库',
    category: 'expansion',
    categoryLabel: '精选聚焦',
    status: 'completed',
    statusLabel: '已更新',
    content: '为保障站点轻量高速与搜索引擎抓取效率，品牌库精简为 9 大主力（飞V、暮光加速、微风网络、飞猫云、大佬云、firefly、灵猫、闪跃、无忧链接）和 4 家重点品牌（跨界云、SOGO 云、灵动云、隐形人），资料整理自各品牌官网，同步更新优惠码。',
    actionAdvice: '下单前以品牌官网结算页显示的价格为准，优惠码可在优惠券中心一键复制。',
    link: '/brands/'
  },
  {
    date: '2026-10-26',
    title: 'Proton VPN 开启 2026 黑五促销 (2 年套餐约 70%~75% OFF)',
    brand: 'Proton VPN',
    category: 'promo',
    categoryLabel: '促销特惠',
    status: 'ongoing',
    statusLabel: '进行中',
    content: '活动持续至 11 月 30 日，2 年 VPN Plus 套餐折扣幅度因地区而异，结算时自动生效，无需优惠码。海外商业 VPN 主要面向海外用户的隐私保护，在国内跨境使用的稳定性不如专线机场。',
    actionAdvice: '需要海外 VPN 做隐私保护的用户可以考虑；在国内跨境加速建议先看对比文章。',
    link: '/blog/black-friday-vpn-vs-airport-guide'
  },
  {
    date: '2026-10-23',
    title: 'Windows 11 Always On VPN 故障被重新标记为未修复',
    brand: 'Microsoft Windows',
    category: 'maintenance',
    categoryLabel: '系统故障',
    status: 'ongoing',
    statusLabel: '待修复',
    content: '9 月安全更新后，Windows 11 24H2 及以上版本的 Always On VPN 可能卡在“正在连接”。微软 10 月 13 日误标为已解决，随后更正，10 月更新并未修复。',
    actionAdvice: '企业管理员可把 VPN 配置改为固定单一隧道协议作为临时方案；个人用户的机场客户端不受此问题影响。',
    link: '/blog/daily-monitor-2026-10-27'
  },
  {
    date: '2026-10-21',
    title: 'Mihomo (Clash Meta) 内核 v1.19.33 稳定版发布',
    brand: 'Mihomo 核心生态',
    category: 'kernel',
    categoryLabel: '内核升级',
    status: 'completed',
    statusLabel: '已发布',
    content: '包含 crypto/tls 相关 CVE 安全修复、内置 Shadowsocks 监听器修复，以及重载配置后 fake-ip 分配状态异常的修复。',
    actionAdvice: '等待所用客户端发布集成新内核的正式版后再升级，不建议手动替换内核文件。',
    link: '/blog/daily-monitor-2026-10-27'
  },
  {
    date: '2026-10-09',
    title: 'Clash Verge Rev v2.5.8 正式版发布',
    brand: 'Clash Verge Rev',
    category: 'kernel',
    categoryLabel: '客户端更新',
    status: 'completed',
    statusLabel: '已发布',
    content: '9 月下旬至 10 月上旬连续发布 v2.5.6、v2.5.7、v2.5.8 三个版本，v2.5.8 为当前最新正式版。',
    actionAdvice: '只从官方 GitHub Releases 页面下载，不要使用来路不明的“汉化版”。',
    link: '/blog/clash-verge-rev-install-subscription-guide'
  },
  {
    date: '2026-10-02',
    title: 'Claude 收紧香港、俄罗斯地区 VPN 访问',
    brand: 'Anthropic Claude',
    category: 'maintenance',
    categoryLabel: '风控动态',
    status: 'ongoing',
    statusLabel: '持续中',
    content: '10 月初起，不少香港用户通过 VPN 使用的 Claude 账号被停用，俄罗斯用户也有类似反馈。两地均不在官方支持地区内，Anthropic 未公开宣布新政策。',
    actionAdvice: '固定使用同一个低滥用的原生 IP 节点，避免频繁切换地区。',
    link: '/blog/ai-account-ban-native-ip-guide'
  }
]

const filteredTimeline = computed(() => {
  if (activeFilter.value === 'all') return timelineData
  return timelineData.filter(item => item.category === activeFilter.value)
})
</script>

<template>
  <div class="maintenance-timeline">
    <!-- Header -->
    <div class="timeline-hero-card">
      <div class="hero-left">
        <span class="hero-badge">📢 行业动态时间线</span>
        <h2 class="hero-title">网络工具与行业动态时间线</h2>
        <p class="hero-desc">
          汇总<strong>内核与客户端版本、系统故障、AI 风控与促销活动</strong>等经过核实的动态，以及本站品牌库的更新记录。
        </p>
      </div>
    </div>

    <!-- Filter Pills -->
    <div class="timeline-filter-bar">
      <button
        class="filter-tab-pill"
        :class="{ active: activeFilter === 'all' }"
        @click="activeFilter = 'all'"
      >全部动态 ({{ timelineData.length }})</button>
      <button
        class="filter-tab-pill"
        :class="{ active: activeFilter === 'maintenance' }"
        @click="activeFilter = 'maintenance'"
      >⚠️ 故障与风控</button>
      <button
        class="filter-tab-pill"
        :class="{ active: activeFilter === 'kernel' }"
        @click="activeFilter = 'kernel'"
      >🛠️ 内核与客户端</button>
      <button
        class="filter-tab-pill"
        :class="{ active: activeFilter === 'expansion' }"
        @click="activeFilter = 'expansion'"
      >📚 本站收录更新</button>
      <button
        class="filter-tab-pill"
        :class="{ active: activeFilter === 'promo' }"
        @click="activeFilter = 'promo'"
      >🎉 大促与优惠活动</button>
    </div>

    <!-- Timeline Body -->
    <div class="timeline-container">
      <div
        v-for="(item, idx) in filteredTimeline"
        :key="idx"
        class="timeline-item"
      >
        <!-- Timeline Left Node Marker -->
        <div class="timeline-marker">
          <div class="marker-dot" :class="`dot-${item.category}`"></div>
          <div class="marker-line" v-if="idx < filteredTimeline.length - 1"></div>
        </div>

        <!-- Timeline Card Content -->
        <div class="timeline-card">
          <div class="timeline-card-head">
            <div class="meta-row">
              <span class="date-badge">{{ item.date }}</span>
              <span class="brand-tag">{{ item.brand }}</span>
              <span class="category-badge" :class="`badge-${item.category}`">
                {{ item.categoryLabel }}
              </span>
            </div>
            <span class="status-indicator" :class="`status-${item.status}`">
              {{ item.statusLabel }}
            </span>
          </div>

          <h3 class="event-title">{{ item.title }}</h3>
          <p class="event-content">{{ item.content }}</p>

          <div class="advice-box">
            <span class="advice-icon">💡</span>
            <span class="advice-text"><strong>用户应对建议：</strong>{{ item.actionAdvice }}</span>
          </div>

          <div class="card-bottom" v-if="item.link">
            <a :href="item.link" class="btn-read-more">
              查看深度详情 / 教程指引 →
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.maintenance-timeline {
  margin: 1.5rem 0 3rem;
  font-family: var(--vp-font-family-base);
}

.timeline-hero-card {
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(13, 148, 136, 0.1) 100%);
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

.timeline-filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.filter-tab-pill {
  background: var(--site-bg-subtle);
  border: 1px solid var(--site-border-color);
  color: var(--site-text-secondary);
  padding: 0.4rem 0.95rem;
  border-radius: var(--site-radius-full);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.filter-tab-pill:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.filter-tab-pill.active {
  background: var(--vp-c-brand-1);
  color: #ffffff;
  border-color: var(--vp-c-brand-1);
}

/* Timeline */
.timeline-container {
  display: flex;
  flex-direction: column;
  position: relative;
}

.timeline-item {
  display: flex;
  gap: 1.25rem;
  margin-bottom: 1.75rem;
}

.timeline-marker {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 24px;
  flex-shrink: 0;
}

.marker-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 3px solid var(--site-card-bg);
  box-shadow: 0 0 0 2px var(--site-border-color);
  margin-top: 6px;
  z-index: 2;
}

.dot-maintenance {
  background: #f59e0b;
}

.dot-kernel {
  background: var(--vp-c-brand-1);
}

.dot-promo {
  background: #e11d48;
}

.dot-expansion {
  background: var(--vp-c-teal);
}

.marker-line {
  flex: 1;
  width: 2px;
  background: var(--site-border-color);
  margin: 6px 0;
}

.timeline-card {
  flex: 1;
  background: var(--site-card-bg);
  border: 1px solid var(--site-border-color);
  border-radius: var(--site-radius-lg);
  padding: 1.25rem 1.5rem;
  box-shadow: var(--site-card-shadow);
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.timeline-card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  flex-wrap: wrap;
}

.date-badge {
  font-family: var(--vp-font-family-mono);
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--vp-c-brand-1);
}

.brand-tag {
  background: var(--site-bg-subtle);
  border: 1px solid var(--site-border-color);
  padding: 0.1rem 0.45rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.category-badge {
  font-size: 0.72rem;
  padding: 0.1rem 0.45rem;
  border-radius: 4px;
  font-weight: 600;
}

.badge-maintenance {
  background: rgba(245, 158, 11, 0.15);
  color: #b45309;
}

.badge-kernel {
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
}

.badge-promo {
  background: rgba(225, 29, 72, 0.12);
  color: #e11d48;
}

.badge-expansion {
  background: rgba(13, 148, 136, 0.15);
  color: var(--vp-c-teal);
}

.status-indicator {
  font-size: 0.72rem;
  padding: 0.1rem 0.45rem;
  border-radius: var(--site-radius-full);
  font-weight: 700;
}

.status-completed {
  background: rgba(13, 148, 136, 0.15);
  color: var(--vp-c-teal);
}

.status-ongoing {
  background: rgba(245, 158, 11, 0.15);
  color: #d97706;
}

.event-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--site-text-primary);
}

.event-content {
  margin: 0;
  font-size: 0.88rem;
  color: var(--site-text-secondary);
  line-height: 1.6;
}

.advice-box {
  background: var(--site-bg-subtle);
  border-radius: var(--site-radius-md);
  padding: 0.65rem 0.85rem;
  display: flex;
  align-items: flex-start;
  gap: 0.4rem;
  font-size: 0.82rem;
  color: var(--site-text-secondary);
}

.advice-icon {
  font-size: 1rem;
  line-height: 1;
}

.card-bottom {
  margin-top: 0.25rem;
}

.btn-read-more {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--vp-c-brand-1);
  text-decoration: none;
}

.btn-read-more:hover {
  text-decoration: underline;
}
</style>
