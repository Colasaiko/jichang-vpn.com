<script setup lang="ts">
// 免费美区 Apple ID 共享：本站自有账号 + 外部共享来源链接，数据来自 apple-ids.json
// 自有账号只显示已填写的；账号密码只在浏览器里渲染（不写进静态 HTML），避免被搜索引擎收录；勾选使用须知后才能查看
import { computed, onMounted, ref } from 'vue'
import data from '../../data/apple-ids.json'

interface Account {
  id: string
  region: string
  account: string
  password: string
  status: 'ok' | 'locked' | 'pending'
  checkedAt: string
  purchased: string[]
  note: string
}

interface External { name: string; url: string; desc: string; note: string }

// 只显示已经填了账号的位置；一个都没有时整块自有账号区不显示
const accounts = (data.accounts as Account[]).filter((a) => a.account)
const external = (data.external || []) as External[]
const mounted = ref(false)
onMounted(() => (mounted.value = true))

const agreed = ref(false)
const revealed = ref<Record<string, boolean>>({})
const copied = ref('')

const okCount = computed(() => accounts.filter((a) => a.status === 'ok' && a.account).length)
const STATUS = {
  ok: { text: '✅ 可用', cls: 'is-ok' },
  locked: { text: '🔒 维护中', cls: 'is-locked' },
  pending: { text: '⏳ 整理中', cls: 'is-pending' }
}
const statusOf = (a: Account) => STATUS[a.account ? a.status : 'pending']

const copy = async (key: string, text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    copied.value = key
    setTimeout(() => (copied.value = ''), 1600)
  } catch {
    copied.value = ''
  }
}
const mask = (s: string) => (s ? s.slice(0, 2) + '•'.repeat(Math.max(4, s.length - 4)) + s.slice(-2) : '')
</script>

<template>
  <div class="aid">
    <div v-if="external.length" class="aid-ext">
      <a v-for="e in external" :key="e.url" :href="e.url" target="_blank" rel="nofollow noopener noreferrer" class="aid-ext-card">
        <span class="aid-ext-head">
          <span class="aid-ext-name">🍎 {{ e.name }}</span>
          <span class="aid-ext-go">前往查看 ↗</span>
        </span>
        <span class="aid-ext-desc">{{ e.desc }}</span>
        <span class="aid-ext-note">{{ e.note }}进去后同样<strong>只在 App Store 登录</strong>，不要登录 iCloud。</span>
      </a>
    </div>

    <template v-if="accounts.length">
    <h3 class="aid-own-title">本站自有账号</h3>
    <div class="aid-summary">
      <span>共 <strong>{{ accounts.length }}</strong> 个账号，<strong class="aid-ok-num">{{ okCount }}</strong> 个可用</span>
      <span class="aid-date">更新于 {{ data.updatedAt }}</span>
    </div>

    <label class="aid-agree">
      <input v-model="agreed" type="checkbox" />
      <span>我已阅读下方「使用须知」：<strong>只在 App Store 里登录</strong>，不在「设置」里登录 iCloud，不改密码、不开双重认证，下载完就退出。</span>
    </label>

    <div class="aid-grid">
      <div v-for="a in accounts" :key="a.id" class="aid-card">
        <div class="aid-head">
          <span class="aid-region">🇺🇸 {{ a.region }} Apple ID</span>
          <span class="aid-status" :class="statusOf(a).cls">{{ statusOf(a).text }}</span>
        </div>

        <template v-if="a.account && a.status === 'ok'">
          <div class="aid-row">
            <span class="aid-label">账号</span>
            <code class="aid-value">{{ mounted ? (agreed ? a.account : mask(a.account)) : '••••••' }}</code>
            <button type="button" class="aid-btn" :disabled="!agreed" @click="copy(a.id + 'a', a.account)">{{ copied === a.id + 'a' ? '已复制' : '复制' }}</button>
          </div>
          <div class="aid-row">
            <span class="aid-label">密码</span>
            <code class="aid-value">{{ mounted && agreed && revealed[a.id] ? a.password : '••••••••' }}</code>
            <button type="button" class="aid-btn" :disabled="!agreed" @click="revealed[a.id] = !revealed[a.id]">{{ revealed[a.id] ? '隐藏' : '显示' }}</button>
            <button type="button" class="aid-btn" :disabled="!agreed" @click="copy(a.id + 'p', a.password)">{{ copied === a.id + 'p' ? '已复制' : '复制' }}</button>
          </div>
          <p v-if="a.purchased.length" class="aid-meta">已购应用：{{ a.purchased.join('、') }}</p>
          <p class="aid-meta">最后检测：{{ a.checkedAt || data.updatedAt }}<template v-if="a.note"> · {{ a.note }}</template></p>
        </template>
        <p v-else-if="a.account" class="aid-empty">账号正在维护（可能被锁或刚改密码），请稍后再来，或先用其他账号。</p>
        <p v-else class="aid-empty">账号整理中，近期更新。等不及的话，可以照下方教程花 5 分钟注册自己的美区 Apple ID。</p>
      </div>
    </div>

    <p v-if="!agreed" class="aid-hint">👆 先勾选上面的使用须知，才能复制账号和查看密码。</p>
    <p class="aid-notice">{{ data.notice }}</p>
    </template>
  </div>
</template>

<style scoped>
.aid-ext { display: grid; gap: 0.75rem; }
.aid-ext-card {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 0.9rem 1rem;
  border: 1.5px solid var(--vp-c-brand-1);
  border-radius: 12px;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-text-1) !important;
  text-decoration: none !important;
  transition: transform 0.15s ease;
}
.aid-ext-card:hover { transform: translateY(-2px); }
.aid-ext-head { display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
.aid-ext-name { font-weight: 700; font-size: 1rem; }
.aid-ext-go {
  padding: 0.2rem 0.75rem;
  border-radius: 8px;
  background: var(--vp-c-brand-1);
  color: #fff;
  font-size: 0.85rem;
  font-weight: 600;
}
.aid-ext-desc { font-size: 0.9rem; }
.aid-ext-note { color: var(--vp-c-text-2); font-size: 0.82rem; line-height: 1.6; }
.aid-own-title { margin: 1.5rem 0 0.5rem !important; font-size: 1rem; }
.aid-summary {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.5rem;
  font-size: 0.92rem;
}
.aid-ok-num { color: #16a34a; }
.aid-date { color: var(--vp-c-text-2); }
.aid-agree {
  display: flex;
  gap: 0.6rem;
  align-items: flex-start;
  margin: 0.9rem 0;
  padding: 0.75rem 0.9rem;
  border: 1px solid rgba(245, 158, 11, 0.5);
  border-radius: 10px;
  background: rgba(245, 158, 11, 0.08);
  font-size: 0.9rem;
  line-height: 1.7;
  cursor: pointer;
}
.aid-agree input { margin-top: 0.4rem; flex-shrink: 0; }
.aid-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 280px), 1fr));
  gap: 0.9rem;
}
.aid-card {
  padding: 0.9rem 1rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
}
.aid-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.6rem;
}
.aid-region { font-weight: 700; }
.aid-status {
  padding: 0.05rem 0.5rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 600;
  white-space: nowrap;
}
.aid-status.is-ok { background: rgba(22, 163, 74, 0.15); color: #16a34a; }
.aid-status.is-locked { background: rgba(239, 68, 68, 0.15); color: #ef4444; }
.aid-status.is-pending { background: var(--vp-c-default-soft); color: var(--vp-c-text-2); }
.aid-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin: 0.35rem 0;
}
.aid-label { flex-shrink: 0; width: 2.2rem; color: var(--vp-c-text-2); font-size: 0.85rem; }
.aid-value {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.85rem;
}
.aid-btn {
  flex-shrink: 0;
  padding: 0.1rem 0.5rem;
  border: 1px solid var(--vp-c-brand-1);
  border-radius: 6px;
  color: var(--vp-c-brand-1);
  font-size: 0.78rem;
  cursor: pointer;
}
.aid-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.aid-meta { margin: 0.3rem 0 0 !important; color: var(--vp-c-text-2); font-size: 0.8rem; }
.aid-empty { margin: 0 !important; color: var(--vp-c-text-2); font-size: 0.88rem; line-height: 1.7; }
.aid-hint { margin: 0.75rem 0 0; color: #f59e0b; font-size: 0.88rem; }
.aid-notice { margin: 0.5rem 0 0; color: var(--vp-c-text-2); font-size: 0.82rem; }
</style>
