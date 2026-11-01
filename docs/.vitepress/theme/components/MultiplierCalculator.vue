<script setup lang="ts">
import { ref, computed } from 'vue'

// 1. Positive Calculation State
const planTrafficInput = ref<number>(200) // Plan traffic in GB
const selectedMultiplier = ref<number>(1.0) // Selected multiplier

const presetTraffics = [50, 100, 200, 500, 1000]
const presetMultipliers = [0.1, 0.2, 0.5, 1.0, 1.5, 2.0, 3.0, 5.0]

// Real physical usable traffic
const effectiveTrafficGB = computed<number>(() => {
  if (selectedMultiplier.value <= 0 || planTrafficInput.value <= 0) return 0
  return planTrafficInput.value / selectedMultiplier.value
})

// Real usage scenarios based on effectiveTrafficGB
const scenarioStats = computed(() => {
  const gb = effectiveTrafficGB.value
  return {
    youtube4kHours: (gb / 7.0).toFixed(1), // ~7GB per hour 4K 60fps
    youtube1080pHours: (gb / 1.8).toFixed(1), // ~1.8GB per hour 1080p
    tiktokHours: (gb / 0.8).toFixed(1), // ~800MB per hour
    webBrowsingDays: (gb / 0.2).toFixed(0), // ~200MB per day
    losslessSongs: Math.floor(gb / 0.035), // ~35MB per lossless song
    steamGames: (gb / 50).toFixed(1) // ~50GB per AAA game
  }
})

// 2. Reverse Calculation State (Download target to plan deduction)
const targetDownloadGB = ref<number>(50)
const reverseCalculations = computed(() => {
  const dl = targetDownloadGB.value || 0
  return [
    { mult: 0.1, deducted: (dl * 0.1).toFixed(1), label: '0.1x 极限下载节点', tag: '省流量神级' },
    { mult: 0.2, deducted: (dl * 0.2).toFixed(1), label: '0.2x 大盘冷门节点', tag: '超划算' },
    { mult: 0.5, deducted: (dl * 0.5).toFixed(1), label: '0.5x 闲时优化节点', tag: '省一半' },
    { mult: 1.0, deducted: (dl * 1.0).toFixed(1), label: '1.0x 标准日常专线', tag: '标准扣费' },
    { mult: 1.5, deducted: (dl * 1.5).toFixed(1), label: '1.5x 优质解锁节点', tag: '稍贵' },
    { mult: 2.0, deducted: (dl * 2.0).toFixed(1), label: '2.0x 极速低延迟专线', tag: '双倍消耗' },
    { mult: 3.0, deducted: (dl * 3.0).toFixed(1), label: '3.0x 原生住宅/独立节点', tag: '慎用于大下载' }
  ]
})
</script>

<template>
  <div class="multiplier-calculator">
    <!-- Hero / Concept Banner -->
    <div class="calc-concept-banner">
      <div class="concept-icon">🧮</div>
      <div>
        <h3 class="concept-title">为什么必须懂“流量倍率”？</h3>
        <p class="concept-desc">
          机场扣费公式：<strong>扣除套餐流量 = 实际产生物理流量 × 节点倍率</strong>。<br />
          使用 <strong>0.2x 节点</strong> 时，200G 套餐可实际下载 <strong>1,000G</strong> 物理数据；而在 <strong>2.0x 节点</strong> 下，200G 套餐只能传输 <strong>100G</strong> 数据！
        </p>
      </div>
    </div>

    <!-- Mode 1: Positive Calculator -->
    <div class="calc-card">
      <div class="card-heading">
        <span class="step-num">1</span>
        <h3 class="card-title">套餐可用实际物理流量推算</h3>
      </div>

      <div class="calc-form-grid">
        <!-- Input 1: Plan Traffic -->
        <div class="form-group">
          <label class="form-label">
            <span>你的套餐标称流量 (GB)</span>
            <span class="current-badge">{{ planTrafficInput }} GB</span>
          </label>
          <div class="input-with-presets">
            <input
              v-model.number="planTrafficInput"
              type="number"
              min="1"
              max="10000"
              class="num-input"
              placeholder="输入流量数值"
            />
            <div class="preset-pills">
              <button
                v-for="val in presetTraffics"
                :key="val"
                class="preset-pill"
                :class="{ active: planTrafficInput === val }"
                @click="planTrafficInput = val"
              >
                {{ val >= 1000 ? `${val / 1000}TB` : `${val}G` }}
              </button>
            </div>
          </div>
        </div>

        <!-- Input 2: Node Multiplier -->
        <div class="form-group">
          <label class="form-label">
            <span>当前连接节点倍率</span>
            <span class="current-badge highlight">{{ selectedMultiplier }}x 倍率</span>
          </label>
          <div class="input-with-presets">
            <div class="preset-pills mult-presets">
              <button
                v-for="m in presetMultipliers"
                :key="m"
                class="preset-pill"
                :class="{ active: selectedMultiplier === m }"
                @click="selectedMultiplier = m"
              >
                {{ m }}x
              </button>
            </div>
            <div class="slider-wrap">
              <input
                v-model.number="selectedMultiplier"
                type="range"
                min="0.1"
                max="5.0"
                step="0.1"
                class="range-slider"
              />
              <span class="slider-val">{{ selectedMultiplier }}x</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Real Usable Result Display -->
      <div class="result-highlight-box">
        <div class="result-left">
          <span class="result-label">最终可用的真实物理流量</span>
          <div class="result-number-row">
            <span class="result-huge-number">{{ effectiveTrafficGB.toFixed(1) }}</span>
            <span class="result-unit">GB</span>
          </div>
          <p class="result-subtext">
            相当于套餐标称值的
            <strong>{{ ((1 / selectedMultiplier) * 100).toFixed(0) }}%</strong>
            可用性
          </p>
        </div>
        <div class="result-right">
          <div class="formula-chip">
            公式：{{ planTrafficInput }} GB ÷ {{ selectedMultiplier }}x = {{ effectiveTrafficGB.toFixed(1) }} GB
          </div>
        </div>
      </div>

      <!-- Scenario Metrics Grid -->
      <h4 class="scenario-heading">🎬 该物理流量在常见场景下能用多久？</h4>
      <div class="scenario-grid">
        <div class="scenario-item">
          <div class="sc-icon">🍿</div>
          <div class="sc-info">
            <span class="sc-name">YouTube / Netflix 4K 播放</span>
            <span class="sc-val">{{ scenarioStats.youtube4kHours }} 小时</span>
            <span class="sc-rate">(约 7.0 GB/小时)</span>
          </div>
        </div>

        <div class="scenario-item">
          <div class="sc-icon">📺</div>
          <div class="sc-info">
            <span class="sc-name">1080P 高清视频播放</span>
            <span class="sc-val">{{ scenarioStats.youtube1080pHours }} 小时</span>
            <span class="sc-rate">(约 1.8 GB/小时)</span>
          </div>
        </div>

        <div class="scenario-item">
          <div class="sc-icon">📱</div>
          <div class="sc-info">
            <span class="sc-name">TikTok / Reels 短视频刷屏</span>
            <span class="sc-val">{{ scenarioStats.tiktokHours }} 小时</span>
            <span class="sc-rate">(约 800 MB/小时)</span>
          </div>
        </div>

        <div class="scenario-item">
          <div class="sc-icon">💻</div>
          <div class="sc-info">
            <span class="sc-name">网页查资料、推特与办公</span>
            <span class="sc-val">{{ scenarioStats.webBrowsingDays }} 天</span>
            <span class="sc-rate">(约 200 MB/天)</span>
          </div>
        </div>

        <div class="scenario-item">
          <div class="sc-icon">🎵</div>
          <div class="sc-info">
            <span class="sc-name">Spotify / Apple Music 无损</span>
            <span class="sc-val">{{ scenarioStats.losslessSongs }} 首</span>
            <span class="sc-rate">(约 35 MB/首)</span>
          </div>
        </div>

        <div class="scenario-item">
          <div class="sc-icon">🎮</div>
          <div class="sc-info">
            <span class="sc-name">Steam 3A 大型游戏下载</span>
            <span class="sc-val">{{ scenarioStats.steamGames }} 款</span>
            <span class="sc-rate">(按 50 GB/款 计)</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Mode 2: Reverse Task Calculator -->
    <div class="calc-card">
      <div class="card-heading">
        <span class="step-num">2</span>
        <h3 class="card-title">反向计算：下载特定大文件需要消耗多少套餐额度？</h3>
      </div>
      <p class="card-desc">
        输入你要下载的大文件大小（例如游戏、离线视频合集、系统镜像），查看在不同倍率节点下各扣除多少套餐流量：
      </p>

      <div class="reverse-input-bar">
        <label>待下载物理文件大小：</label>
        <div class="reverse-input-wrap">
          <input
            v-model.number="targetDownloadGB"
            type="number"
            min="1"
            max="2000"
            class="num-input reverse-num"
          />
          <span class="unit-text">GB</span>
        </div>
      </div>

      <!-- Reverse Table -->
      <div class="reverse-table-wrap">
        <table class="reverse-table">
          <thead>
            <tr>
              <th>节点倍率</th>
              <th>线路定位</th>
              <th>实际扣除套餐流量</th>
              <th>对比 1.0x 标准消耗</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in reverseCalculations" :key="item.mult">
              <td>
                <span class="mult-bold">{{ item.mult }}x</span>
              </td>
              <td>
                <span class="line-label-text">{{ item.label }}</span>
                <span class="reverse-tag">{{ item.tag }}</span>
              </td>
              <td>
                <span class="deducted-val">{{ item.deducted }} GB</span>
              </td>
              <td>
                <span
                  class="diff-badge"
                  :class="{
                    'diff-save': item.mult < 1.0,
                    'diff-neutral': item.mult === 1.0,
                    'diff-cost': item.mult > 1.0
                  }"
                >
                  {{ item.mult < 1.0 ? `节省 ${(100 - item.mult * 100).toFixed(0)}%` : (item.mult === 1.0 ? '基准' : `多扣 ${(item.mult * 100 - 100).toFixed(0)}%`) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Multiplier Strategy & Tips -->
    <div class="calc-card tips-card">
      <h3 class="tips-heading">💡 资深玩家的“倍率白嫖与省流秘籍”</h3>
      <div class="tips-grid">
        <div class="tip-box">
          <div class="tip-badge green-badge">下载利器 · 0.1x ~ 0.2x</div>
          <h4>大文件下载首选低倍率</h4>
          <p>更新 Steam 几十 GB 的游戏补丁或下载开发工具链时，切到 0.2x 节点。下载 50GB 仅扣 10GB 套餐流量，省下 80% 额度！</p>
        </div>

        <div class="tip-box">
          <div class="tip-badge blue-badge">主力常驻 · 1.0x</div>
          <h4>日常影音浏览保持 1.0x 标准专线</h4>
          <p>看 YouTube 4K、网页办公和社交软件保持在 1.0x IPLC 内网专线。既享受极速与超低延迟，计费又最透明标准。</p>
        </div>

        <div class="tip-box">
          <div class="tip-badge red-badge">精准使用 · 2.0x ~ 3.0x</div>
          <h4>高倍率节点切忌后台挂着下大文件</h4>
          <p>2.0x 节点通常是高成本的原生住宅 IP 或独立游戏专线。用来看 4K 或下大文件会让流量以两到三倍速度光速蒸发！</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.multiplier-calculator {
  margin: 1.5rem 0 3rem;
  font-family: var(--vp-font-family-base);
}

.calc-concept-banner {
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(13, 148, 136, 0.1) 100%);
  border: 1px solid rgba(37, 99, 235, 0.25);
  border-radius: var(--site-radius-lg);
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 2rem;
}

.concept-icon {
  font-size: 2.2rem;
  line-height: 1;
}

.concept-title {
  margin: 0 0 0.35rem;
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--site-text-primary);
}

.concept-desc {
  margin: 0;
  font-size: 0.92rem;
  color: var(--site-text-secondary);
  line-height: 1.6;
}

.calc-card {
  background: var(--site-card-bg);
  border: 1px solid var(--site-border-color);
  border-radius: var(--site-radius-lg);
  padding: 1.75rem;
  margin-bottom: 2rem;
  box-shadow: var(--site-card-shadow);
}

.card-heading {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  margin-bottom: 1.25rem;
}

.step-num {
  background: var(--vp-c-brand-1);
  color: #ffffff;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.88rem;
  font-weight: 700;
}

.card-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--site-text-primary);
}

.card-desc {
  margin: -0.5rem 0 1.25rem;
  font-size: 0.92rem;
  color: var(--site-text-secondary);
}

.calc-form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.form-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--site-text-secondary);
}

.current-badge {
  background: var(--site-bg-subtle);
  border: 1px solid var(--site-border-color);
  padding: 0.15rem 0.5rem;
  border-radius: var(--site-radius-full);
  font-size: 0.82rem;
  font-weight: 700;
}

.current-badge.highlight {
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
}

.input-with-presets {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.num-input {
  padding: 0.65rem 0.9rem;
  border-radius: var(--site-radius-md);
  border: 1px solid var(--site-border-color);
  background: var(--site-bg-surface);
  color: var(--site-text-primary);
  font-size: 1.1rem;
  font-weight: 700;
  outline: none;
  transition: border-color 0.2s;
}

.num-input:focus {
  border-color: var(--vp-c-brand-1);
}

.preset-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.preset-pill {
  background: var(--site-bg-subtle);
  border: 1px solid var(--site-border-color);
  color: var(--site-text-secondary);
  padding: 0.25rem 0.65rem;
  border-radius: var(--site-radius-md);
  font-size: 0.82rem;
  cursor: pointer;
  transition: all 0.15s;
}

.preset-pill:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.preset-pill.active {
  background: var(--vp-c-brand-1);
  color: #ffffff;
  border-color: var(--vp-c-brand-1);
  font-weight: 600;
}

.slider-wrap {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.25rem;
}

.range-slider {
  flex: 1;
  accent-color: var(--vp-c-brand-1);
  cursor: pointer;
}

.slider-val {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--vp-c-brand-1);
  min-width: 38px;
}

/* Result Box */
.result-highlight-box {
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.08) 0%, rgba(13, 148, 136, 0.08) 100%);
  border: 1px solid rgba(37, 99, 235, 0.25);
  border-radius: var(--site-radius-lg);
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.result-label {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--site-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.result-number-row {
  display: flex;
  align-items: baseline;
  gap: 0.4rem;
  margin: 0.25rem 0;
}

.result-huge-number {
  font-size: 3rem;
  font-weight: 900;
  color: var(--vp-c-brand-1);
  line-height: 1;
}

.result-unit {
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--site-text-primary);
}

.result-subtext {
  margin: 0;
  font-size: 0.9rem;
  color: var(--site-text-secondary);
}

.formula-chip {
  background: var(--site-bg-surface);
  border: 1px solid var(--site-border-color);
  padding: 0.6rem 1rem;
  border-radius: var(--site-radius-md);
  font-family: var(--vp-font-family-mono);
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--site-text-primary);
}

/* Scenario Grid */
.scenario-heading {
  margin: 0 0 1rem;
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--site-text-primary);
}

.scenario-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1rem;
}

.scenario-item {
  background: var(--site-bg-subtle);
  border: 1px solid var(--site-border-color);
  border-radius: var(--site-radius-md);
  padding: 1rem;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.sc-icon {
  font-size: 1.8rem;
  line-height: 1;
}

.sc-info {
  display: flex;
  flex-direction: column;
}

.sc-name {
  font-size: 0.8rem;
  color: var(--site-text-muted);
  margin-bottom: 0.2rem;
}

.sc-val {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--site-text-primary);
}

.sc-rate {
  font-size: 0.75rem;
  color: var(--site-text-muted);
}

/* Reverse Table */
.reverse-input-bar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}

.reverse-input-bar label {
  font-weight: 600;
  color: var(--site-text-primary);
}

.reverse-input-wrap {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.reverse-num {
  width: 100px;
  padding: 0.45rem 0.75rem;
  font-size: 1.05rem;
}

.unit-text {
  font-weight: 700;
  color: var(--site-text-primary);
}

.reverse-table-wrap {
  overflow-x: auto;
}

.reverse-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.92rem;
}

.reverse-table th {
  background: var(--site-bg-subtle);
  padding: 0.75rem 1rem;
  text-align: left;
  font-weight: 600;
  color: var(--site-text-secondary);
  border-bottom: 2px solid var(--site-border-color);
}

.reverse-table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--site-border-color);
  color: var(--site-text-primary);
}

.mult-bold {
  font-family: var(--vp-font-family-mono);
  font-weight: 800;
  color: var(--vp-c-brand-1);
}

.line-label-text {
  margin-right: 0.5rem;
}

.reverse-tag {
  background: var(--site-bg-subtle);
  font-size: 0.75rem;
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  color: var(--site-text-muted);
}

.deducted-val {
  font-weight: 800;
  color: #e11d48;
}

.diff-badge {
  font-size: 0.8rem;
  padding: 0.15rem 0.5rem;
  border-radius: var(--site-radius-full);
  font-weight: 600;
}

.diff-save {
  background: rgba(13, 148, 136, 0.15);
  color: var(--vp-c-teal);
}

.diff-neutral {
  background: rgba(100, 116, 139, 0.15);
  color: var(--site-text-muted);
}

.diff-cost {
  background: rgba(225, 29, 72, 0.12);
  color: #e11d48;
}

/* Tips Grid */
.tips-heading {
  margin: 0 0 1.25rem;
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--site-text-primary);
}

.tips-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1.25rem;
}

.tip-box {
  background: var(--site-bg-subtle);
  border: 1px solid var(--site-border-color);
  border-radius: var(--site-radius-md);
  padding: 1.25rem;
}

.tip-badge {
  display: inline-block;
  font-size: 0.75rem;
  padding: 0.15rem 0.5rem;
  border-radius: var(--site-radius-full);
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.green-badge {
  background: rgba(13, 148, 136, 0.15);
  color: var(--vp-c-teal);
}

.blue-badge {
  background: rgba(37, 99, 235, 0.12);
  color: var(--vp-c-brand-1);
}

.red-badge {
  background: rgba(225, 29, 72, 0.12);
  color: #e11d48;
}

.tip-box h4 {
  margin: 0 0 0.4rem;
  font-size: 0.98rem;
  font-weight: 700;
  color: var(--site-text-primary);
}

.tip-box p {
  margin: 0;
  font-size: 0.85rem;
  color: var(--site-text-secondary);
  line-height: 1.6;
}

@media (max-width: 768px) {
  .calc-form-grid {
    grid-template-columns: 1fr;
  }
  .result-huge-number {
    font-size: 2.3rem;
  }
}
</style>
