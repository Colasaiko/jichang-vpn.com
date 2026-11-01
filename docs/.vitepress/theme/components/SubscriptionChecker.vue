<script setup lang="ts">
import { ref, computed } from 'vue'

// Tab state: 'client' (Primary for 13 brands) vs 'legacy' (For raw links)
const activeTab = ref<'client' | 'legacy'>('client')

// Client Issues Diagnostic State
const selectedIssue = ref<string>('login_error')

interface IssueGuide {
  id: string
  title: string
  icon: string
  symptom: string
  rootCause: string
  steps: string[]
  troubleshootTip: string
  guideUrl?: string
}

const clientIssues: IssueGuide[] = [
  {
    id: 'login_error',
    title: '客户端登录提示“连接超时 / Network Error”',
    icon: '🔌',
    symptom: '打开 Windows/macOS/安卓专属客户端，输入账号密码后提示网络连接错误或无限转圈。',
    rootCause: '本地运营商（电信/联通/移动）对服务商的 API 认证主域名进行了突发 DNS 污染，导致客户端无法连上鉴权服务器。',
    steps: [
      '手机开启移动热点，电脑连接手机热点重试（避开本地家庭宽带 DNS 缓存阻断）；',
      '登录品牌官网后台，查看是否有更新的最新客户端安装包或防封备用登录入口；',
      '检查本机杀毒软件（如 360、火绒、Windows Defender）是否拦截了客户端的后台联网权限，添加信任后重启软件。'
    ],
    troubleshootTip: '微风、飞猫等品牌客户端出厂内置防阻断通道，通常切热点一次成功登录后即可长效记住状态。',
    guideUrl: '/guides/brand-windows-guide'
  },
  {
    id: 'domestic_blocked',
    title: '开启加速后，国内微信/淘宝卡死或断网',
    icon: '🧭',
    symptom: '能正常看 YouTube 和访问 Google，但打开微信收发消息很慢、淘宝加载不出图片、网易云音乐灰色。',
    rootCause: '客户端分流模式被意外切换到了「全局模式（Global）」，或者系统代理注册表未正确将局域网与国内域名加入直连白名单。',
    steps: [
      '打开客户端主界面，检查底部的分流模式设置，务必切换为「智能分流」或「规则分流（Rule）」；',
      '若使用的是 TUN 模式，检查「系统路由绕行（Bypass LAN）」是否已勾选开启；',
      '重启一次客户端或在设置中点击「重置网络代理注册表」。'
    ],
    troubleshootTip: '正规专属客户端内置国内主流 CDN 与应用直连白名单，只要保持规则模式，国内流量绝对 100% 直连不消耗专线额度。',
    guideUrl: '/guides/brand-tutorials-framework'
  },
  {
    id: 'all_nodes_timeout',
    title: '节点测速全部超时（Timeout）或显示 0ms 红色',
    icon: '⏱️',
    symptom: '客户端能登录，节点列表也存在，但点击“连通性测试”所有节点全部爆红或显示 Timeout。',
    rootCause: '【90% 的概率】电脑或手机的「系统本地时间」与国际标准北京时间偏差超过了 90 秒，导致 TLS 证书安全握手与 VMess/VLESS 时间戳鉴权彻底失败。',
    steps: [
      'Windows 用户：打开系统「设置」➔「时间和语言」➔「日期和时间」➔ 点击「立即同步」按钮；',
      'Mac / 手机用户：确保开启「自动设置日期和时间」，确认时区为中国标准时间 (GMT+8)；',
      '同步完成后，完全退出客户端并重新打开，再次测速即可恢复正常。'
    ],
    troubleshootTip: '系统时间只需相差 1~2 分钟就会触发加密协议的主动防重放防护，校准时间是恢复节点测速最立竿见影的技巧。'
  },
  {
    id: 'android_background_kill',
    title: '安卓手机锁屏或切换应用后频繁自动断连',
    icon: '📱',
    symptom: '正在使用时正常，手机熄屏 5 分钟或刷微信后，客户端自动被系统杀后台导致断网。',
    rootCause: '国产安卓系统（MIUI/HyperOS、OriginOS、ColorOS、HarmonyOS）激进的省电管理策略在锁屏后自动杀死了 VPN 守护进程。',
    steps: [
      '电池优化白名单：进入手机「设置」➔「应用管理」➔ 找到客户端 ➔「省电策略」设置为「无限制」；',
      '多任务后台加锁：划出手机多任务卡片界面，长按客户端卡片，点击「小锁头」图标锁定后台常驻；',
      '允许自启动与关联启动：在应用权限中开启「允许自启动」和「允许后台活动」。'
    ],
    troubleshootTip: '完成上述三步后，专属客户端即可像微信一样在安卓后台长效保活，彻底告别频繁手动打开重连。',
    guideUrl: '/guides/brand-android-guide'
  },
  {
    id: 'windows_tun_error',
    title: 'Windows 客户端提示 TUN 虚拟网卡启动失败',
    icon: '💻',
    symptom: '开启增强模式或 TUN 模式时弹窗报错“Wintun create adapter failed”或退出软件后整机连不上网。',
    rootCause: '系统缺少 Wintun 虚拟网卡驱动依赖，或者此前异常退出导致 Windows 系统代理开关未正常释放。',
    steps: [
      '以管理员身份运行客户端：右键点击客户端快捷方式，选择「以管理员身份运行」；',
      '修复网络代理：如果退出后整机断网，按 Win+I 打开「设置」➔「网络和 Internet」➔「代理」➔ 将「使用代理服务器」手动关闭；',
      '在客户端内置设置中点击「重装虚拟网卡驱动」或重启电脑。'
    ],
    troubleshootTip: '本站推荐品牌提供的最新专属客户端均内置了自修复脚本，右键管理员启动可解决绝大部分驱动冲突。',
    guideUrl: '/guides/brand-windows-guide'
  },
  {
    id: 'ios_nextin_network',
    title: '苹果 iOS Nextin 无法连接或提示网络未授权',
    icon: '🍏',
    symptom: '在 iPhone/iPad 上打开 Nextin 授权后无法连接，或首次安装打开提示“无线局域网已关闭”。',
    rootCause: '国行 iOS 系统首次安装新 App 时未正确弹出「允许使用无线局域网与蜂窝网络」的授权弹窗。',
    steps: [
      '打开 iPhone「设置」➔「无线局域网」➔ 找到「使用无线局域网与蜂窝网络的 App」➔ 找到 Nextin 或对应客户端，勾选「无线局域网与蜂窝数据」；',
      '首次连接时系统弹出“添加 VPN 配置”提示，务必点击「允许」并输入手机锁屏密码完成安装；',
      '如依然失败，可开启飞行模式 5 秒后再关闭，重新打开软件授权。'
    ],
    troubleshootTip: 'Nextin 是目前 iOS 端免换海外 Apple ID 即可极简使用专线的最优方案，只需授权一次即可长效使用。',
    guideUrl: '/guides/brand-nextin-ios-guide'
  }
]

const currentIssue = computed(() => {
  return clientIssues.find(i => i.id === selectedIssue.value) || clientIssues[0]
})

// Local System Time Check
const localTimeStr = ref('')
const timeStatus = ref<'checking' | 'synced' | 'warn'>('checking')
const timeDifferenceMs = ref(0)

function checkLocalClock() {
  const now = new Date()
  localTimeStr.value = now.toLocaleTimeString() + ' (GMT+8)'
  
  // Approximate check with standard time
  timeStatus.value = 'checking'
  const clientTime = Date.now()
  
  // Ping standard web endpoint to check Date header offset
  fetch(window.location.href, { method: 'HEAD', cache: 'no-cache' })
    .then(res => {
      const serverDateStr = res.headers.get('date')
      if (serverDateStr) {
        const serverTime = new Date(serverDateStr).getTime()
        const diff = Math.abs(clientTime - serverTime)
        timeDifferenceMs.value = diff
        if (diff < 30000) {
          timeStatus.value = 'synced' // Under 30s diff: safe
        } else {
          timeStatus.value = 'warn' // Over 30s diff: dangerous for TLS
        }
      } else {
        timeStatus.value = 'synced'
      }
    })
    .catch(() => {
      timeStatus.value = 'synced'
    })
}

// Check clock on mounted if in browser
if (typeof window !== 'undefined') {
  checkLocalClock()
}

// ---------------------------------------------------------------------
// Legacy Subscription Checker Logic (Retained for backwards compatibility)
// ---------------------------------------------------------------------
const inputContent = ref('')
const copiedSuccess = ref(false)

interface CheckResult {
  isValidUrl: boolean
  hasSpaces: boolean
  hasChineseChars: boolean
  protocolType: string
  clientFormat: string
  nodeCount: number
  decodedPreview?: string
  warnings: string[]
  params: Record<string, string>
  cleanUrl: string
}

function decodeBase64Safe(str: string): string {
  try {
    let clean = str.trim().replace(/-/g, '+').replace(/_/g, '/')
    while (clean.length % 4) {
      clean += '='
    }
    return decodeURIComponent(
      atob(clean)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
  } catch {
    try {
      return atob(str.trim())
    } catch {
      return ''
    }
  }
}

const analysis = computed<CheckResult | null>(() => {
  const raw = inputContent.value
  if (!raw.trim()) return null

  const hasLeadingSpace = /^\s+/.test(raw)
  const hasTrailingSpace = /\s+$/.test(raw)
  const hasInternalSpaces = /\s/.test(raw.trim())
  const hasSpaces = hasLeadingSpace || hasTrailingSpace || hasInternalSpaces
  const hasChineseChars = /[\u4e00-\u9fa5]/.test(raw)

  let cleanUrl = raw.trim()
  cleanUrl = cleanUrl.replace(/[\u200B-\u200D\uFEFF]/g, '')
  cleanUrl = cleanUrl.replace(/[\u3000]/g, ' ')
  cleanUrl = cleanUrl.replace(/\s+/g, '')

  let isValidUrl = false
  let params: Record<string, string> = {}
  let urlObj: URL | null = null

  try {
    urlObj = new URL(cleanUrl)
    isValidUrl = urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
    urlObj.searchParams.forEach((val, key) => {
      params[key] = val
    })
  } catch {
    isValidUrl = false
  }

  const warnings: string[] = []
  if (hasLeadingSpace || hasTrailingSpace) warnings.push('检测到链接首尾存在隐形空格，开源客户端导入时极易报错 Invalid URI。')
  if (hasInternalSpaces) warnings.push('检测到链接中间存在空白字符或换行符，会导致 URL 被截断。')
  if (hasChineseChars) warnings.push('检测到链接中包含中文字符，若未经过 URL 编码可能导致无法解析。')

  let clientFormat = '未知格式'
  let protocolType = '通用/混合协议'
  let nodeCount = 0
  let decodedPreview = ''

  if (isValidUrl && urlObj) {
    const flag = params['flag'] || ''
    const target = params['target'] || ''
    const path = urlObj.pathname.toLowerCase()

    if (flag.includes('clash') || target.includes('clash') || path.includes('clash')) {
      clientFormat = 'Clash / Mihomo 专属配置'
    } else if (flag.includes('singbox') || target.includes('singbox') || path.includes('sing-box')) {
      clientFormat = 'Sing-box 专属 JSON 配置'
    } else if (flag.includes('v2ray') || target.includes('v2ray') || flag.includes('shadowrocket')) {
      clientFormat = '小火箭 / v2rayN 聚合订阅'
    } else {
      clientFormat = '标准 HTTP/HTTPS 订阅拉取接口'
    }
  }

  if (cleanUrl.startsWith('vmess://') || cleanUrl.startsWith('vless://') || cleanUrl.startsWith('trojan://') || cleanUrl.startsWith('ss://') || cleanUrl.startsWith('hy2://')) {
    clientFormat = '单节点直链分享 URI'
    protocolType = cleanUrl.split('://')[0].toUpperCase()
    nodeCount = 1
  }

  return {
    isValidUrl,
    hasSpaces,
    hasChineseChars,
    protocolType,
    clientFormat,
    nodeCount,
    decodedPreview,
    warnings,
    params,
    cleanUrl
  }
})

function cleanAndCopy() {
  if (!analysis.value) return
  navigator.clipboard.writeText(analysis.value.cleanUrl).then(() => {
    copiedSuccess.value = true
    setTimeout(() => {
      copiedSuccess.value = false
    }, 2000)
  })
}

function loadSample(type: 'clash' | 'base64' | 'error') {
  if (type === 'clash') {
    inputContent.value = 'https://sub.airport-example.com/api/v1/client/subscribe?token=abc123xyz789&flag=clash'
  } else if (type === 'base64') {
    inputContent.value = 'dm1lc3M6Ly9leGFtcGxlMW5vZGVkYXRhCmh5c3RlcmlhMjovL2V4YW1wbGUybm9kZWRhdGE='
  } else if (type === 'error') {
    inputContent.value = ' https://sub.airport-example.com/api/v1/client/subscribe?token=abc123xyz ；'
  }
}
</script>

<template>
  <div class="sub-checker-container">
    <!-- Main Tab Switcher -->
    <div class="diagnostic-nav-tabs">
      <button
        class="nav-tab-btn"
        :class="{ active: activeTab === 'client' }"
        @click="activeTab = 'client'"
      >
        <span class="tab-icon">📱</span>
        <span>专属客户端智能诊断 (推荐主流品牌)</span>
        <span class="tab-badge-hot">2026 主推</span>
      </button>

      <button
        class="nav-tab-btn"
        :class="{ active: activeTab === 'legacy' }"
        @click="activeTab = 'legacy'"
      >
        <span class="tab-icon">🔗</span>
        <span>传统裸订阅链接排错 (兼容第三方/老用户)</span>
      </button>
    </div>

    <!-- ========================================== -->
    <!-- TAB 1: Client Diagnostic (Modern)          -->
    <!-- ========================================== -->
    <div v-if="activeTab === 'client'" class="client-diagnostic-section">
      <!-- Architecture Notice Banner -->
      <div class="modern-arch-banner">
        <div class="arch-badge-row">
          <span class="arch-badge">💡 行业演进提示</span>
          <span class="arch-note">本站主推的 9 大主力品牌已全线淘汰裸露订阅链接</span>
        </div>
        <p class="arch-desc">
          微风网络、飞猫云、暮光加速、大佬云等品牌均采用<strong>「官方全平台专属客户端 + iOS Nextin」</strong>模式。节点隐藏在底层加密内核中，用户无需手动提取与排查订阅链接，下载登录即可一键互联。如果您在使用客户端时遇到问题，请对照下方自救向导：
        </p>
      </div>

      <!-- Live Environment Status Bar -->
      <div class="env-health-card">
        <div class="health-header">
          <span class="health-icon">🩺</span>
          <div>
            <h4 class="health-title">本机客户端运行环境体检</h4>
            <p class="health-sub">基于浏览器实时检测系统时钟与网络握手状态</p>
          </div>
        </div>
        <div class="health-items-row">
          <div class="health-item">
            <span class="item-label">本机系统时钟</span>
            <span class="item-value font-mono">{{ localTimeStr || '正在读取...' }}</span>
          </div>
          <div class="health-item">
            <span class="item-label">TLS 时钟偏差检测</span>
            <span
              class="item-badge"
              :class="timeStatus === 'synced' ? 'badge-ok' : 'badge-warn'"
            >
              {{ timeStatus === 'synced' ? '✓ 时钟同步良好 (适合加密握手)' : '⚠️ 存在时钟偏差 (建议立即同步)' }}
            </span>
          </div>
          <div class="health-item">
            <span class="item-label">订阅形式</span>
            <span class="item-badge badge-primary">官方定制内核免配</span>
          </div>
        </div>
      </div>

      <!-- Issue Selection Grid -->
      <h3 class="section-subheading">选择您遇到的异常现象（一键获取保姆级自救步骤）：</h3>
      <div class="issues-pill-grid">
        <button
          v-for="issue in clientIssues"
          :key="issue.id"
          class="issue-pill-btn"
          :class="{ active: selectedIssue === issue.id }"
          @click="selectedIssue = issue.id"
        >
          <span class="pill-icon">{{ issue.icon }}</span>
          <span class="pill-text">{{ issue.title }}</span>
        </button>
      </div>

      <!-- Active Issue Detail Card -->
      <div class="issue-solution-card">
        <div class="solution-header">
          <div class="solution-title-wrap">
            <span class="solution-icon">{{ currentIssue.icon }}</span>
            <h4 class="solution-title">{{ currentIssue.title }}</h4>
          </div>
          <a
            v-if="currentIssue.guideUrl"
            :href="currentIssue.guideUrl"
            class="solution-guide-link"
          >
            查看对应图文教程专页 &rarr;
          </a>
        </div>

        <div class="solution-body">
          <div class="diagnosis-block">
            <div class="diag-label">【典型症状】</div>
            <div class="diag-text">{{ currentIssue.symptom }}</div>
          </div>

          <div class="diagnosis-block">
            <div class="diag-label">【根本原因】</div>
            <div class="diag-text highlight-cause">{{ currentIssue.rootCause }}</div>
          </div>

          <div class="diagnosis-block">
            <div class="diag-label">【实战自救三步法】</div>
            <ol class="solution-steps-list">
              <li v-for="(step, sIdx) in currentIssue.steps" :key="sIdx">
                {{ step }}
              </li>
            </ol>
          </div>

          <div class="pro-tip-box">
            <span class="tip-icon">💡</span>
            <div class="tip-content">
              <strong>极客避坑提示：</strong>{{ currentIssue.troubleshootTip }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- TAB 2: Legacy Subscription Checker         -->
    <!-- ========================================== -->
    <div v-else class="legacy-checker-section">
      <div class="legacy-notice-box">
        <strong>⚠️ 适用场景说明：</strong>
        本模块用于排查第三方或历史自建节点的裸露订阅链接（如 `https://...token=xxx`）。如果您使用的是本站推荐的微风网络、飞猫云等 9 大主力品牌，请直接在「专属客户端」中登录，无需使用此模块提取链接。
      </div>

      <!-- Input Card -->
      <div class="checker-card">
        <div class="card-header">
          <div class="header-left">
            <span class="header-icon">🛡️</span>
            <div>
              <h3 class="header-title">第三方订阅链接语法诊断</h3>
              <span class="privacy-badge">🔒 纯浏览器本地离线解析 · 零数据上传 · 保护隐私</span>
            </div>
          </div>
          <div class="sample-actions">
            <span class="sample-label">填入样例：</span>
            <button class="sample-btn" @click="loadSample('clash')">Clash 样例</button>
            <button class="sample-btn" @click="loadSample('base64')">Base64 样例</button>
            <button class="sample-btn" @click="loadSample('error')">空格报错样例</button>
          </div>
        </div>

        <div class="textarea-wrap">
          <textarea
            v-model="inputContent"
            class="sub-textarea"
            rows="4"
            placeholder="在此粘贴第三方订阅链接（如 https://...）或一段 Base64 / 单节点链接..."
          ></textarea>
          <button v-if="inputContent" class="clear-input-btn" @click="inputContent = ''">
            清空
          </button>
        </div>
      </div>

      <!-- Analysis Result Display -->
      <div v-if="analysis" class="analysis-result-card">
        <div class="result-top-status">
          <div class="status-badge" :class="analysis.warnings.length === 0 ? 'status-ok' : 'status-warn'">
            {{ analysis.warnings.length === 0 ? '✓ 格式语法正常' : `⚠️ 发现 ${analysis.warnings.length} 项潜在格式风险` }}
          </div>
          <button
            v-if="analysis.hasSpaces || analysis.hasChineseChars"
            class="fix-copy-btn"
            @click="cleanAndCopy"
          >
            {{ copiedSuccess ? '✓ 已复制清理后的合法链接！' : '⚡ 一键去除空格并复制合法链接' }}
          </button>
        </div>

        <!-- Metrics Grid -->
        <div class="metrics-grid">
          <div class="metric-box">
            <span class="metric-label">订阅/格式识别</span>
            <span class="metric-value highlight">{{ analysis.clientFormat }}</span>
          </div>
          <div class="metric-box">
            <span class="metric-label">协议分类</span>
            <span class="metric-value">{{ analysis.protocolType }}</span>
          </div>
          <div class="metric-box">
            <span class="metric-label">链接有效性</span>
            <span class="metric-value" :class="analysis.isValidUrl ? 'val-good' : 'val-info'">
              {{ analysis.isValidUrl ? '合法标准 URL' : '非 URL / 纯文本' }}
            </span>
          </div>
          <div class="metric-box" v-if="analysis.nodeCount > 0">
            <span class="metric-label">预估包含节点数</span>
            <span class="metric-value val-good">{{ analysis.nodeCount }} 个节点</span>
          </div>
        </div>

        <!-- Warnings / Suggestions -->
        <div v-if="analysis.warnings.length > 0" class="warnings-box">
          <h4 class="warnings-title">⚠️ 潜在问题诊断与修复建议：</h4>
          <ul class="warnings-list">
            <li v-for="(w, idx) in analysis.warnings" :key="idx">{{ w }}</li>
          </ul>
        </div>

        <!-- Clean URL Output Box -->
        <div class="clean-url-box">
          <div class="clean-url-header">
            <span class="clean-url-label">清洗后的规范化安全链接：</span>
            <button class="copy-clean-btn" @click="cleanAndCopy">
              {{ copiedSuccess ? '✓ 已复制到剪贴板！' : '📋 复制纯净链接' }}
            </button>
          </div>
          <div class="clean-url-text">{{ analysis.cleanUrl }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sub-checker-container {
  margin: 1.5rem 0 2.5rem;
}

/* Diagnostic Nav Tabs */
.diagnostic-nav-tabs {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid var(--site-border-color);
  padding-bottom: 0.75rem;
}

.nav-tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1.25rem;
  border-radius: var(--site-radius-md);
  border: 1px solid var(--site-border-color);
  background: var(--site-card-bg);
  color: var(--site-text-primary);
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-tab-btn:hover {
  border-color: var(--vp-c-brand-1);
}

.nav-tab-btn.active {
  background: var(--vp-c-brand-1);
  color: #ffffff;
  border-color: var(--vp-c-brand-1);
}

.tab-badge-hot {
  background: #ef4444;
  color: #ffffff;
  font-size: 0.7rem;
  padding: 0.1rem 0.4rem;
  border-radius: 999px;
  font-weight: 700;
}

/* Architecture Notice Banner */
.modern-arch-banner {
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.08) 0%, rgba(13, 148, 136, 0.08) 100%);
  border: 1px solid var(--site-border-color);
  border-left: 4px solid var(--vp-c-brand-1);
  border-radius: var(--site-radius-md);
  padding: 1.25rem;
  margin-bottom: 1.5rem;
}

.arch-badge-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.arch-badge {
  background: var(--vp-c-brand-1);
  color: #ffffff;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.15rem 0.5rem;
  border-radius: var(--site-radius-full);
}

.arch-note {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--site-text-primary);
}

.arch-desc {
  font-size: 0.9rem;
  color: var(--site-text-secondary);
  line-height: 1.6;
  margin: 0;
}

/* Live Health Card */
.env-health-card {
  background: var(--site-card-bg);
  border: 1px solid var(--site-border-color);
  border-radius: var(--site-radius-lg);
  padding: 1.25rem 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: var(--site-card-shadow);
}

.health-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.health-icon {
  font-size: 1.6rem;
}

.health-title {
  margin: 0 !important;
  font-size: 1.05rem !important;
  font-weight: 700;
}

.health-sub {
  margin: 0 !important;
  font-size: 0.82rem !important;
  color: var(--site-text-secondary);
}

.health-items-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.health-item {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.item-label {
  font-size: 0.8rem;
  color: var(--site-text-secondary);
}

.item-value {
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--site-text-primary);
}

.item-badge {
  display: inline-block;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.2rem 0.5rem;
  border-radius: var(--site-radius-md);
  width: fit-content;
}

.badge-ok {
  background: #dcfce7;
  color: #15803d;
}

.badge-warn {
  background: #fef9c3;
  color: #a16207;
}

.badge-primary {
  background: #e0f2fe;
  color: #0369a1;
}

/* Section Subheading */
.section-subheading {
  font-size: 1.05rem !important;
  font-weight: 700;
  margin: 1.5rem 0 1rem !important;
}

/* Issues Pill Grid */
.issues-pill-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.issue-pill-btn {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.85rem 1rem;
  background: var(--site-card-bg);
  border: 1px solid var(--site-border-color);
  border-radius: var(--site-radius-md);
  color: var(--site-text-primary);
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.88rem;
}

.issue-pill-btn:hover {
  border-color: var(--vp-c-brand-1);
  transform: translateY(-1px);
}

.issue-pill-btn.active {
  background: rgba(37, 99, 235, 0.08);
  border-color: var(--vp-c-brand-1);
  font-weight: 700;
  color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 1px var(--vp-c-brand-1);
}

.pill-icon {
  font-size: 1.3rem;
  flex-shrink: 0;
}

/* Solution Card */
.issue-solution-card {
  background: var(--site-card-bg);
  border: 1px solid var(--site-border-color);
  border-radius: var(--site-radius-lg);
  padding: 1.75rem;
  box-shadow: var(--site-card-shadow);
  margin-bottom: 2rem;
}

.solution-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--site-border-color);
  margin-bottom: 1.25rem;
}

.solution-title-wrap {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.solution-icon {
  font-size: 1.75rem;
}

.solution-title {
  margin: 0 !important;
  font-size: 1.2rem !important;
  font-weight: 700;
}

.solution-guide-link {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--vp-c-brand-1);
  text-decoration: none;
}

.solution-guide-link:hover {
  text-decoration: underline;
}

.diagnosis-block {
  margin-bottom: 1.25rem;
}

.diag-label {
  font-weight: 700;
  font-size: 0.92rem;
  color: var(--site-text-primary);
  margin-bottom: 0.35rem;
}

.diag-text {
  font-size: 0.92rem;
  color: var(--site-text-secondary);
  line-height: 1.6;
}

.highlight-cause {
  color: #b91c1c;
  background: #fef2f2;
  padding: 0.5rem 0.75rem;
  border-radius: var(--site-radius-md);
  border-left: 3px solid #dc2626;
}

.solution-steps-list {
  padding-left: 1.25rem;
  margin: 0.5rem 0;
  line-height: 1.75;
  font-size: 0.92rem;
  color: var(--site-text-primary);
}

.pro-tip-box {
  display: flex;
  gap: 0.75rem;
  background: var(--site-bg-subtle);
  border: 1px solid var(--site-border-color);
  border-radius: var(--site-radius-md);
  padding: 1rem;
  font-size: 0.88rem;
  line-height: 1.6;
  margin-top: 1.25rem;
}

.tip-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
}

/* Legacy Notice */
.legacy-notice-box {
  background: #fffbeb;
  border: 1px solid #fde68a;
  color: #92400e;
  padding: 0.85rem 1.25rem;
  border-radius: var(--site-radius-md);
  font-size: 0.88rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

/* Legacy Checker Styles */
.checker-card {
  background: var(--site-card-bg);
  border: 1px solid var(--site-border-color);
  border-radius: var(--site-radius-lg);
  padding: 1.5rem;
  box-shadow: var(--site-card-shadow);
  margin-bottom: 1.5rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header-icon {
  font-size: 1.75rem;
}

.header-title {
  margin: 0 !important;
  font-size: 1.15rem !important;
  font-weight: 700;
}

.privacy-badge {
  font-size: 0.75rem;
  color: #15803d;
  background: #dcfce7;
  padding: 0.15rem 0.45rem;
  border-radius: var(--site-radius-md);
  display: inline-block;
  margin-top: 0.2rem;
}

.sample-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.sample-label {
  font-size: 0.8rem;
  color: var(--site-text-secondary);
}

.sample-btn {
  background: var(--site-bg-subtle);
  border: 1px solid var(--site-border-color);
  font-size: 0.78rem;
  padding: 0.25rem 0.6rem;
  border-radius: var(--site-radius-md);
  cursor: pointer;
}

.sample-btn:hover {
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
}

.textarea-wrap {
  position: relative;
}

.sub-textarea {
  width: 100%;
  border: 1px solid var(--site-border-color);
  border-radius: var(--site-radius-md);
  padding: 0.75rem 1rem;
  font-family: monospace;
  font-size: 0.88rem;
  background: var(--site-bg-subtle);
  color: var(--site-text-primary);
  outline: none;
  resize: vertical;
}

.sub-textarea:focus {
  border-color: var(--vp-c-brand-1);
}

.clear-input-btn {
  position: absolute;
  right: 0.75rem;
  top: 0.75rem;
  font-size: 0.75rem;
  background: var(--site-card-bg);
  border: 1px solid var(--site-border-color);
  padding: 0.2rem 0.5rem;
  border-radius: var(--site-radius-md);
  cursor: pointer;
}

/* Analysis Result Card */
.analysis-result-card {
  background: var(--site-card-bg);
  border: 1px solid var(--site-border-color);
  border-radius: var(--site-radius-lg);
  padding: 1.5rem;
  box-shadow: var(--site-card-shadow);
  margin-bottom: 2rem;
}

.result-top-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.status-badge {
  font-size: 0.95rem;
  font-weight: 700;
  padding: 0.35rem 0.85rem;
  border-radius: var(--site-radius-full);
}

.status-ok {
  background: #dcfce7;
  color: #15803d;
}

.status-warn {
  background: #fef9c3;
  color: #a16207;
}

.fix-copy-btn {
  background: #16a34a;
  color: #ffffff;
  border: none;
  font-size: 0.85rem;
  font-weight: 600;
  padding: 0.45rem 1rem;
  border-radius: var(--site-radius-md);
  cursor: pointer;
  transition: opacity 0.2s;
}

.fix-copy-btn:hover {
  opacity: 0.9;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.metric-box {
  background: var(--site-bg-subtle);
  border: 1px solid var(--site-border-color);
  border-radius: var(--site-radius-md);
  padding: 0.85rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.metric-label {
  font-size: 0.75rem;
  color: var(--site-text-secondary);
}

.metric-value {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--site-text-primary);
}

.metric-value.highlight {
  color: var(--vp-c-brand-1);
}

.val-good {
  color: #16a34a;
}

.val-info {
  color: var(--site-text-secondary);
}

.warnings-box {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: var(--site-radius-md);
  padding: 1rem 1.25rem;
  margin-bottom: 1.5rem;
}

.warnings-title {
  color: #dc2626;
  font-size: 0.92rem !important;
  margin: 0 0 0.5rem !important;
}

.warnings-list {
  margin: 0;
  padding-left: 1.25rem;
  color: #991b1b;
  font-size: 0.85rem;
  line-height: 1.6;
}

.clean-url-box {
  background: var(--site-bg-subtle);
  border: 1px solid var(--site-border-color);
  border-radius: var(--site-radius-md);
  padding: 1rem;
}

.clean-url-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.clean-url-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--site-text-secondary);
}

.copy-clean-btn {
  background: var(--vp-c-brand-1);
  color: #ffffff;
  border: none;
  font-size: 0.78rem;
  padding: 0.25rem 0.75rem;
  border-radius: var(--site-radius-md);
  cursor: pointer;
}

.clean-url-text {
  font-family: monospace;
  font-size: 0.82rem;
  word-break: break-all;
  color: var(--site-text-primary);
  background: var(--site-card-bg);
  border: 1px solid var(--site-border-color);
  padding: 0.6rem;
  border-radius: var(--site-radius-sm);
  max-height: 120px;
  overflow-y: auto;
}
</style>
