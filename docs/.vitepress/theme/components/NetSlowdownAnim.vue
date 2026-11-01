<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'

type Scene = 'peak' | 'holiday' | 'cable'

const props = withDefaults(defineProps<{ scene: Scene }>(), { scene: 'peak' })

// Each scene alternates between a normal phase and a problem phase.
const SCENES = {
  peak: {
    title: '晚高峰拥堵',
    subtitle: 'EVENING PEAK · 20:00 – 23:30',
    normal: { label: '白天 · 正常', latency: 45, loss: 0 },
    problem: { label: '晚高峰 · 拥堵', latency: 210, loss: 8 },
    notes: [
      '晚上大家同时上网，运营商的国际出口带宽被挤满，数据包要排队，排不上的会被丢弃。',
      '公网中转线路受影响最明显；专线不走公网国际出口，受晚高峰影响通常较小。'
    ]
  },
  holiday: {
    title: '节假日拥堵',
    subtitle: 'HOLIDAY TRAFFIC · 24H',
    normal: { label: '平日', latency: 0, loss: 0 },
    problem: { label: '节假日', latency: 0, loss: 0 },
    notes: [
      '平日只在晚上 8 点到 11 点半拥堵；春节、国庆等长假大家整天在家，拥堵会从下午一直持续到深夜。',
      '返乡后用的是小城镇宽带或手机流量，本地网络本身也更容易成为瓶颈。'
    ]
  },
  cable: {
    title: '台风 · 地震 · 海缆',
    subtitle: 'SUBMARINE CABLE · REROUTE',
    normal: { label: '海缆正常', latency: 40, loss: 0 },
    problem: { label: '海缆受损 · 绕行', latency: 165, loss: 3 },
    notes: [
      '跨境流量依靠海底光缆。地震、台风天气下的事故或船锚都可能损坏海缆，流量只能绕行更远的线路。',
      '绕路让延迟升高、可用带宽变少；抢修船要等风浪平息后才能作业，修复通常需要数周。'
    ]
  }
} as const

const cfg = computed(() => SCENES[props.scene])

const root = ref<HTMLElement | null>(null)
const svg = ref<SVGSVGElement | null>(null)
const problem = ref(false)
const latency = ref(0)
const loss = ref(0)
const hour = ref(0) // holiday scene clock, 0–24

let phaseTimer: ReturnType<typeof setInterval> | undefined
let raf = 0
let visible = false
let reduced = false
let tweenFrom = 0
let tweenTo = 0
let tweenStart = 0
let lastFrame = 0

const PHASE_MS = 4500
const DAY_MS = 9000

// Illustrative congestion curves (0–1) for the holiday chart, not measured data
function gauss(x: number, mu: number, s: number) {
  return Math.exp(-((x - mu) ** 2) / (2 * s * s))
}
function weekday(h: number) {
  return Math.min(1, 0.18 + 0.12 * gauss(h, 12.5, 1.6) + 0.62 * gauss(h, 21.6, 1.5))
}
function holiday(h: number) {
  // Holidays are at least as busy as a weekday at every hour, and stay busy for longer
  return Math.min(0.96, Math.max(weekday(h) + 0.06, 0.22 + 0.42 * gauss(h, 15.5, 3.6) + 0.52 * gauss(h, 21.2, 2.3)))
}

const CH = { x0: 46, x1: 452, y0: 236, y1: 56 }
const hx = (h: number) => CH.x0 + (h / 24) * (CH.x1 - CH.x0)
const vy = (v: number) => CH.y0 - v * (CH.y0 - CH.y1)
const THRESHOLD = 0.62

function curvePath(fn: (h: number) => number) {
  let d = ''
  for (let i = 0; i <= 96; i++) {
    const h = (i / 96) * 24
    d += `${i ? 'L' : 'M'}${hx(h).toFixed(1)} ${vy(fn(h)).toFixed(1)} `
  }
  return d
}
const weekdayPath = curvePath(weekday)
const holidayPath = curvePath(holiday)

const hourLabel = computed(() => {
  const h = Math.floor(hour.value)
  const m = Math.floor((hour.value - h) * 60 / 10) * 10
  return `${String(h % 24).padStart(2, '0')}:${String(m).padStart(2, '0')}`
})
const wdNow = computed(() => weekday(hour.value))
const hdNow = computed(() => holiday(hour.value))
const level = (v: number) => (v >= THRESHOLD ? '拥堵' : v >= 0.42 ? '偏慢' : '顺畅')

function setPhase(p: boolean) {
  problem.value = p
  const target = p ? cfg.value.problem : cfg.value.normal
  tweenFrom = latency.value
  tweenTo = target.latency
  tweenStart = performance.now()
  loss.value = target.loss
}

function frame(now: number) {
  const t = Math.min(1, (now - tweenStart) / 900)
  const e = 1 - (1 - t) ** 3
  latency.value = Math.round(tweenFrom + (tweenTo - tweenFrom) * e)
  if (props.scene === 'holiday' && lastFrame) {
    hour.value = (hour.value + ((now - lastFrame) / DAY_MS) * 24) % 24
  }
  lastFrame = now
  raf = requestAnimationFrame(frame)
}

function start() {
  if (reduced || phaseTimer) return
  svg.value?.unpauseAnimations?.()
  lastFrame = 0
  raf = requestAnimationFrame(frame)
  if (props.scene !== 'holiday') {
    phaseTimer = setInterval(() => setPhase(!problem.value), PHASE_MS)
  }
}

function stop() {
  if (phaseTimer) clearInterval(phaseTimer)
  phaseTimer = undefined
  cancelAnimationFrame(raf)
  svg.value?.pauseAnimations?.()
}

let io: IntersectionObserver | undefined

onMounted(() => {
  reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduced) {
    // Static frame: show the problem state so the diagram still makes its point
    problem.value = true
    latency.value = cfg.value.problem.latency
    loss.value = cfg.value.problem.loss
    hour.value = 21
    svg.value?.pauseAnimations?.()
    return
  }
  setPhase(false)
  latency.value = cfg.value.normal.latency
  hour.value = 6
  io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting
    visible ? start() : stop()
  }, { threshold: 0.15 })
  if (root.value) io.observe(root.value)
})

onBeforeUnmount(() => {
  stop()
  io?.disconnect()
})

watch(() => props.scene, () => setPhase(false))

const statusLabel = computed(() => (problem.value ? cfg.value.problem.label : cfg.value.normal.label))
</script>

<template>
  <figure ref="root" class="nsa" :class="{ 'is-problem': problem }">
    <header class="nsa-head">
      <h4 class="nsa-title">{{ cfg.title }}</h4>
      <p class="nsa-sub">{{ cfg.subtitle }}</p>
    </header>

    <!-- 1. Evening peak: households → international gateway → overseas site -->
    <svg v-if="scene === 'peak'" ref="svg" class="nsa-svg" viewBox="0 0 480 300" role="img"
      aria-label="晚高峰时，大量用户的数据挤在运营商国际出口排队，延迟升高并出现丢包；专线不经过公网出口">
      <defs>
        <path id="pk-a" d="M78 62 L196 132 L262 132 L392 132" />
        <path id="pk-b" d="M78 132 L196 132 L262 132 L392 132" />
        <path id="pk-c" d="M78 202 L196 132 L262 132 L392 132" />
        <path id="pk-l" d="M78 214 C 150 282, 320 282, 400 168" />
      </defs>

      <!-- households -->
      <g v-for="(y, i) in [62, 132, 202]" :key="i" class="ico">
        <path :d="`M30 ${y + 14} L30 ${y - 4} L48 ${y - 18} L66 ${y - 4} L66 ${y + 14} Z`" />
        <rect :x="43" :y="y + 2" width="10" height="12" />
      </g>
      <text x="48" y="246" class="lbl" text-anchor="middle">家庭宽带</text>

      <!-- links -->
      <path d="M78 62 L196 132 M78 132 L196 132 M78 202 L196 132" class="wire" />
      <path d="M262 132 L392 132" class="wire" :class="{ hot: problem }" />
      <path d="M78 214 C 150 282, 320 282, 400 168" class="wire lease" />
      <text x="240" y="282" class="lbl lease-lbl" text-anchor="middle">专线（不经过公网出口）</text>

      <!-- overseas server -->
      <g class="ico">
        <rect v-for="(y, i) in [100, 124, 148]" :key="i" x="394" :y="y" width="62" height="18" rx="4" />
        <circle v-for="(y, i) in [109, 133, 157]" :key="'d' + i" cx="404" :cy="y" r="2.5" />
      </g>
      <text x="425" y="190" class="lbl" text-anchor="middle">海外网站</text>

      <!-- packets: normal -->
      <g v-if="!problem" class="pkt">
        <circle v-for="(p, i) in ['pk-a', 'pk-b', 'pk-c']" :key="p" r="4.5">
          <animateMotion dur="2.4s" repeatCount="indefinite" :begin="`-${i * 0.8}s`"><mpath :href="`#${p}`" /></animateMotion>
        </circle>
      </g>
      <!-- packets: peak -->
      <g v-else class="pkt">
        <circle v-for="n in 9" :key="n" r="4.5">
          <animateMotion dur="3.6s" repeatCount="indefinite" :begin="`-${n * 0.4}s`"
            keyPoints="0;0.45;0.5;1" keyTimes="0;0.3;0.75;1" calcMode="linear">
            <mpath :href="`#pk-${['a', 'b', 'c'][n % 3]}`" />
          </animateMotion>
        </circle>
        <!-- queue at the gateway -->
        <circle v-for="n in 5" :key="'q' + n" :cx="190 - n * 11" :cy="132 + (n % 2 ? -5 : 5)" r="4" class="queue"
          :style="{ animationDelay: `${n * 0.15}s` }" />
        <!-- dropped packets -->
        <circle v-for="n in 3" :key="'x' + n" :cx="170 + n * 9" cy="140" r="4" class="drop"
          :style="{ animationDelay: `${n * 0.7}s` }" />
      </g>
      <!-- leased line keeps flowing in both phases -->
      <g class="pkt lease-pkt">
        <circle v-for="n in 2" :key="'l' + n" r="4">
          <animateMotion dur="2.6s" repeatCount="indefinite" :begin="`-${n * 1.3}s`"><mpath href="#pk-l" /></animateMotion>
        </circle>
      </g>

      <!-- gateway drawn last so packets pass behind it -->
      <rect x="196" y="108" width="66" height="48" rx="10" class="node" :class="{ hot: problem }" />
      <text x="229" y="137" class="lbl strong" text-anchor="middle">国际出口</text>
    </svg>

    <!-- 2. Holiday: 24h congestion curve, weekday vs holiday -->
    <svg v-else-if="scene === 'holiday'" ref="svg" class="nsa-svg" viewBox="0 0 480 300" role="img"
      aria-label="一天 24 小时的拥堵示意曲线：平日只在晚上拥堵，节假日从下午到深夜都处于拥堵线以上">
      <line :x1="CH.x0" :y1="CH.y0" :x2="CH.x1" :y2="CH.y0" class="axis" />
      <g v-for="h in [0, 6, 12, 18, 24]" :key="h">
        <line :x1="hx(h)" :y1="CH.y0" :x2="hx(h)" :y2="CH.y0 + 5" class="axis" />
        <text :x="hx(h)" :y="CH.y0 + 20" class="lbl" text-anchor="middle">{{ h }}时</text>
      </g>
      <line :x1="CH.x0" :y1="vy(THRESHOLD)" :x2="CH.x1" :y2="vy(THRESHOLD)" class="limit" />
      <text :x="CH.x0 + 4" :y="vy(THRESHOLD) - 7" class="lbl limit-lbl">拥堵线</text>

      <path :d="`${holidayPath} L${CH.x1} ${CH.y0} L${CH.x0} ${CH.y0} Z`" class="area" />
      <path :d="weekdayPath" class="curve weekday" />
      <path :d="holidayPath" class="curve holiday" />

      <line :x1="hx(hour)" :y1="CH.y1 - 8" :x2="hx(hour)" :y2="CH.y0" class="cursor" />
      <circle :cx="hx(hour)" :cy="vy(wdNow)" r="5" class="dot weekday" />
      <circle :cx="hx(hour)" :cy="vy(hdNow)" r="5.5" class="dot holiday" :class="{ hot: hdNow >= THRESHOLD }" />

      <g class="legend">
        <line x1="60" y1="30" x2="80" y2="30" class="curve weekday" />
        <text x="86" y="34" class="lbl">平日</text>
        <line x1="130" y1="30" x2="150" y2="30" class="curve holiday" />
        <text x="156" y="34" class="lbl">春节 / 国庆等长假</text>
      </g>
    </svg>

    <!-- 3. Submarine cable: direct route breaks, traffic detours -->
    <svg v-else ref="svg" class="nsa-svg" viewBox="0 0 480 300" role="img"
      aria-label="海缆受损时，跨境流量从原本较短的海缆改为绕行更远的线路，延迟升高">
      <defs>
        <path id="cb-direct" d="M104 132 C 190 112, 290 112, 376 132" />
        <path id="cb-detour" d="M104 150 C 150 278, 330 278, 376 150" />
      </defs>
      <!-- land masses -->
      <path d="M0 40 L70 46 L96 90 L104 140 L92 200 L60 250 L0 262 Z" class="land" />
      <path d="M480 52 L410 60 L384 100 L376 140 L392 196 L430 240 L480 248 Z" class="land" />
      <text x="40" y="150" class="lbl strong" text-anchor="middle">国内</text>
      <text x="438" y="150" class="lbl strong" text-anchor="middle">香港 / 日本</text>
      <!-- sea -->
      <path v-for="(y, i) in [78, 196, 230]" :key="i" :d="`M150 ${y} q 12 -6 24 0 t 24 0 t 24 0 t 24 0 t 24 0 t 24 0 t 24 0`" class="wave" />

      <path d="M104 132 C 190 112, 290 112, 376 132" class="cable" :class="{ broken: problem }" />
      <path d="M104 150 C 150 278, 330 278, 376 150" class="cable detour" :class="{ active: problem }" />
      <text x="240" y="104" class="lbl" text-anchor="middle">直连海缆</text>
      <text x="240" y="268" class="lbl" text-anchor="middle">绕行线路（更远）</text>

      <!-- typhoon + break mark -->
      <g v-if="problem">
        <g class="storm" transform="translate(240 60)">
          <g class="spin">
            <circle r="7" class="storm-eye" />
            <path d="M0 -7 C 14 -18, 30 -6, 26 8" class="storm-arm" />
            <path d="M0 7 C -14 18, -30 6, -26 -8" class="storm-arm" />
          </g>
        </g>
        <g class="break" transform="translate(240 117)">
          <path d="M-7 -7 L7 7 M7 -7 L-7 7" />
        </g>
      </g>

      <g class="pkt">
        <circle v-for="n in 3" :key="(problem ? 'd' : 'n') + n" r="4.5">
          <animateMotion :dur="problem ? '3.4s' : '1.8s'" repeatCount="indefinite" :begin="`-${n * (problem ? 1.1 : 0.6)}s`">
            <mpath :href="problem ? '#cb-detour' : '#cb-direct'" />
          </animateMotion>
        </circle>
      </g>
    </svg>

    <!-- readouts -->
    <div v-if="scene !== 'holiday'" class="nsa-stats">
      <span class="pill">{{ statusLabel }}</span>
      <span class="stat"><em>延迟</em><b>{{ latency }}</b> ms</span>
      <span class="stat"><em>丢包</em><b>{{ loss }}</b>%</span>
    </div>
    <div v-else class="nsa-stats">
      <span class="pill clock">{{ hourLabel }}</span>
      <span class="stat"><em>平日</em><b :class="{ warn: wdNow >= THRESHOLD }">{{ level(wdNow) }}</b></span>
      <span class="stat"><em>长假</em><b :class="{ warn: hdNow >= THRESHOLD }">{{ level(hdNow) }}</b></span>
    </div>

    <figcaption class="nsa-notes">
      <p v-for="(n, i) in cfg.notes" :key="i">{{ n }}</p>
      <span class="nsa-tag">示意图 · 数值仅用于说明原理</span>
    </figcaption>
  </figure>
</template>

<style scoped>
.nsa {
  --nsa-bg: #0b0b0f;
  --nsa-line: #3a3d45;
  --nsa-ink: #c9ccd3;
  --nsa-muted: #858a94;
  --nsa-yellow: #ffd43b;
  --nsa-red: #ff4d6d;
  --nsa-teal: #2dd4bf;
  --nsa-green: #4ade80;
  margin: 1.75rem 0;
  padding: 1.5rem 1.25rem 1.1rem;
  background: var(--nsa-bg);
  border: 1px solid #23252b;
  border-radius: 18px;
  color: var(--nsa-ink);
}

.nsa-head {
  text-align: center;
}
.vp-doc .nsa-title {
  margin: 0;
  color: var(--nsa-yellow);
  font-size: 1.75rem;
  font-weight: 800;
  letter-spacing: 0.02em;
  line-height: 1.2;
}
.vp-doc .nsa-sub {
  margin: 0.35rem 0 0;
  color: var(--nsa-muted);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.22em;
}

.nsa-svg {
  display: block;
  width: 100%;
  height: auto;
  margin: 0.75rem 0 0.25rem;
  overflow: visible;
}

/* line-art shared */
.ico rect, .ico path { fill: none; stroke: var(--nsa-muted); stroke-width: 1.6; }
.ico circle { fill: var(--nsa-muted); }
.lbl { fill: var(--nsa-muted); font-size: 13px; font-weight: 600; }
.lbl.strong { fill: var(--nsa-ink); }
.wire { fill: none; stroke: var(--nsa-line); stroke-width: 2; stroke-dasharray: 3 5; transition: stroke 0.6s; }
.wire.hot { stroke: var(--nsa-red); stroke-dasharray: none; stroke-width: 2.5; }
.wire.lease { stroke: var(--nsa-teal); stroke-opacity: 0.55; stroke-dasharray: 6 5; }
.lease-lbl { fill: var(--nsa-teal); }
.node { fill: #111318; stroke: var(--nsa-muted); stroke-width: 1.8; transition: stroke 0.6s, fill 0.6s; }
.node.hot { stroke: var(--nsa-red); fill: #2a1219; }

.pkt circle { fill: var(--nsa-yellow); }
.is-problem .pkt circle { fill: var(--nsa-red); }
.pkt.lease-pkt circle, .is-problem .pkt.lease-pkt circle { fill: var(--nsa-teal); }

.queue { fill: var(--nsa-red); animation: nsa-pulse 1.2s ease-in-out infinite; }
.drop { fill: var(--nsa-red); animation: nsa-drop 2.1s ease-in infinite; }

@keyframes nsa-pulse {
  0%, 100% { opacity: 0.35; }
  50% { opacity: 1; }
}
@keyframes nsa-drop {
  0% { transform: translateY(0); opacity: 0; }
  15% { opacity: 1; }
  100% { transform: translateY(70px); opacity: 0; }
}

/* holiday chart */
.axis { stroke: var(--nsa-line); stroke-width: 1.5; }
.limit { stroke: var(--nsa-red); stroke-width: 1.5; stroke-dasharray: 5 5; opacity: 0.8; }
.limit-lbl { fill: var(--nsa-red); }
.curve { fill: none; stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; }
.curve.weekday { stroke: var(--nsa-muted); }
.curve.holiday { stroke: var(--nsa-yellow); }
.area { fill: rgba(255, 212, 59, 0.08); }
.cursor { stroke: var(--nsa-ink); stroke-width: 1.2; opacity: 0.45; }
.dot.weekday { fill: var(--nsa-muted); }
.dot.holiday { fill: var(--nsa-yellow); }
.dot.holiday.hot { fill: var(--nsa-red); }

/* cable scene */
.land { fill: #15171c; stroke: var(--nsa-line); stroke-width: 1.5; }
.wave { fill: none; stroke: #1f2a36; stroke-width: 1.5; }
.cable { fill: none; stroke: var(--nsa-yellow); stroke-width: 3; transition: stroke 0.6s, opacity 0.6s; }
.cable.broken { stroke: var(--nsa-red); stroke-dasharray: 10 8; opacity: 0.6; }
.cable.detour { stroke: var(--nsa-line); stroke-width: 2; stroke-dasharray: 3 6; }
.cable.detour.active { stroke: var(--nsa-yellow); stroke-width: 3; stroke-dasharray: none; }
.storm-eye { fill: none; stroke: var(--nsa-ink); stroke-width: 2; }
.storm-arm { fill: none; stroke: var(--nsa-ink); stroke-width: 2.5; stroke-linecap: round; }
.spin { animation: nsa-spin 1.6s linear infinite; }
.break path { stroke: var(--nsa-red); stroke-width: 3.5; stroke-linecap: round; }
.break { animation: nsa-pulse 0.9s ease-in-out infinite; }

@keyframes nsa-spin {
  to { transform: rotate(360deg); }
}

/* readouts */
.nsa-stats {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 0.6rem 1.25rem;
  margin-top: 0.35rem;
}
.pill {
  padding: 0.2rem 0.75rem;
  border-radius: 999px;
  border: 1px solid var(--nsa-green);
  color: var(--nsa-green);
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  transition: color 0.6s, border-color 0.6s;
}
.is-problem .pill { color: var(--nsa-red); border-color: var(--nsa-red); }
.pill.clock { color: var(--nsa-ink); border-color: var(--nsa-line); font-variant-numeric: tabular-nums; }
.stat { font-size: 0.82rem; color: var(--nsa-muted); }
.stat em { font-style: normal; margin-right: 0.35rem; }
.stat b {
  color: var(--nsa-ink);
  font-size: 1.15rem;
  font-variant-numeric: tabular-nums;
  transition: color 0.6s;
}
.is-problem .stat b, .stat b.warn { color: var(--nsa-red); }

.nsa-notes {
  margin-top: 1rem;
  padding-top: 0.85rem;
  border-top: 1px solid #1d1f25;
}
.vp-doc .nsa-notes p {
  margin: 0 0 0.45rem;
  font-size: 0.88rem;
  line-height: 1.7;
  color: var(--nsa-ink);
}
.nsa-tag {
  display: inline-block;
  font-size: 0.72rem;
  color: var(--nsa-muted);
}

@media (max-width: 640px) {
  .nsa { padding: 1.1rem 0.75rem 0.9rem; border-radius: 14px; }
  .vp-doc .nsa-title { font-size: 1.4rem; }
  .vp-doc .nsa-sub { font-size: 0.62rem; letter-spacing: 0.16em; }
  .lbl { font-size: 15px; }
}

@media (prefers-reduced-motion: reduce) {
  .queue, .drop, .spin, .break { animation: none; }
}
</style>
