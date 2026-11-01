<script setup lang="ts">
// 本站主推品牌（飞V）的推荐区块，品牌库与推荐页共用
import BrandPromo from './BrandPromo.vue'

withDefaults(defineProps<{ heading?: string }>(), {
  heading: '如果只看一家，我们优先推荐'
})
</script>

<template>
  <div class="top-pick-box">
    <img src="/images/logos/飞V.webp" alt="飞V FlyV Logo" width="64" height="64" class="top-pick-logo" />
    <div class="top-pick-body">
      <p class="top-pick-lead">
        {{ heading }}<strong>飞V</strong>：港台日新四个地区都是 IEPL / IPLC 专线，常规套餐全节点 1x 倍率、不限同时在线设备，官方客户端下载登录就能用，不用折腾订阅和规则。
      </p>
      <ul class="top-pick-points">
        <li><strong>线路</strong>：香港、台湾 IEPL，日本、新加坡 IPLC / IEPL，美国 BGP 直连</li>
        <li><strong>价格</strong>：入门 150 GB 月付 ¥25，新用户首单用优惠码 <code>fly20</code> 打 8 折约 ¥20（每个账号限用一次）；另有年付轻量版 ¥99/年</li>
        <li><strong>套餐</strong>：四档周期套餐最长三年付，用 fly20 后 8 折（如入门三年付 ¥675 → ¥540），另有不限时流量包和独享原生 IP 专线</li>
        <li><strong>隐私保护</strong>：官方客户端登录即用，不对外发放订阅链接，避免订阅外泄被人盗用，节点更稳定</li>
      </ul>
      <BrandPromo slug="feiv" compact />
      <div class="top-pick-actions">
        <a href="/go/feiv/" target="_blank" rel="nofollow noopener noreferrer sponsored" class="portal-btn-primary">访问飞V官网 ↗</a>
        <a href="/brands/feiv" class="portal-btn-secondary">看飞V完整分析</a>
      </div>
      <p class="top-pick-note">资料整理自飞V官网；飞V是本站的推广合作品牌，通过本站链接购买本站可能获得佣金，不影响你的价格。</p>
    </div>
  </div>
</template>
