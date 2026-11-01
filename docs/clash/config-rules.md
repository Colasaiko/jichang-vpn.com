---
keywords: Clash分流规则, Clash策略组, Clash规则, GEOIP
title: Clash 分流规则体系与策略组深度指南
description: 详细解读 Clash (Mihomo) 规则匹配顺序、策略组嵌套原理、Fake-IP DNS 机制以及防 DNS 污染与漏流的高级配置方案。
date: 2026-02-28
lastUpdated: 2026-03-08
---

# Clash 分流规则体系与策略组深度指南

<div class="site-breadcrumbs">
  <a href="/">首页</a>
  <span class="sep">/</span>
  <a href="/clash/">Clash 教程</a>
  <span class="sep">/</span>
  <span class="current">分流规则与策略组实战</span>
</div>

高效的分流配置能够确保国内流量直连快速响应、外网资源智能路由、流媒体与人工智能服务走指定合规出口。本文系统讲解 Clash 配置文件的底层逻辑与工程实战。

## 一、Clash 规则匹配顺序法则

Clash 的规则引擎遵循**自上而下、首项命中即停止（First-Match Wins）**的核心逻辑：

```
[传入网络数据包 (DNS 请求 / TCP SYN)]
            │
            ▼
[规则 1: DOMAIN-SUFFIX (首命中即退出)] ─── 是 ──► [指向策略组: PROXY]
            │ 否
            ▼
[规则 2: IP-CIDR (进行真实IP/FakeIP解析)] ─ 是 ──► [指向策略组: DIRECT]
            │ 否
            ▼
[规则 3: MATCH (兜底兜底)] ──────────────────────► [指向策略组: FINAL]
```

::: warning 常见误区：MATCH 规则位置
必须将 `MATCH` 放在整个 `rules` 列表的**最末行**。若误将 `MATCH,DIRECT` 放在靠前位置，其后的所有规则将长期无法被触发！
:::

## 二、标准配置结构示例 (YAML)

以下是一个现代且规范的 Clash 配置文件核心片段，包含 DNS、策略组与规则列表：

```yaml
# 1. 端口与常规模式
mixed-port: 7890
allow-lan: false
mode: rule
log-level: info
ipv6: false

# 2. 增强型 DNS 模块 (避免 DNS 污染与回环)
dns:
  enable: true
  listen: 0.0.0.0:1053
  enhanced-mode: fake-ip
  fake-ip-range: 198.18.0.1/16
  nameserver:
    - 223.5.5.5
    - 119.29.29.29
  fallback:
    - https://1.1.1.1/dns-query
    - https://8.8.8.8/dns-query

# 3. 策略组结构设计
proxy-groups:
  - name: 🚀 节点选择
    type: select
    proxies:
      - ♻️ 自动优选
      - 🇭🇰 香港专线
      - 🇯🇵 日本节点
      - 🇺🇸 美国节点
      - DIRECT

  - name: ♻️ 自动优选
    type: url-test
    url: http://www.gstatic.com/generate_204
    interval: 300
    tolerance: 50
    proxies:
      - 🇭🇰 香港专线
      - 🇯🇵 日本节点
      - 🇺🇸 美国节点

  - name: 🤖 AI 智能助手
    type: select
    proxies:
      - 🇺🇸 美国节点
      - 🇯🇵 日本节点
      - 🚀 节点选择

  - name: 🐟 漏网之鱼
    type: select
    proxies:
      - 🚀 节点选择
      - DIRECT

# 4. 分流规则列表
rules:
  # 本地与局域网直连
  - DOMAIN-KEYWORD,lan,DIRECT
  - IP-CIDR,127.0.0.0/8,DIRECT
  - IP-CIDR,192.168.0.0/16,DIRECT
  - IP-CIDR,10.0.0.0/8,DIRECT

  # AI 业务定向分流 (避免地域受限阻断)
  - DOMAIN-SUFFIX,openai.com,🤖 AI 智能助手
  - DOMAIN-SUFFIX,anthropic.com,🤖 AI 智能助手
  - DOMAIN-SUFFIX,oaistatic.com,🤖 AI 智能助手

  # 国内常见服务与 CDN 直连
  - GEOIP,CN,DIRECT
  - DOMAIN-SUFFIX,cn,DIRECT
  - DOMAIN-SUFFIX,baidu.com,DIRECT
  - DOMAIN-SUFFIX,qq.com,DIRECT

  # 最终兜底规则
  - MATCH,🐟 漏网之鱼
```

## 三、策略组类型及其适用场景

Clash 提供了多种策略组类型，灵活组合可实现自动化容灾与最佳体验：

1. **`select`（手动选择）**：在图形界面中手动指定当前出口节点，适合对 IP 稳定性有极高要求的业务。
2. **`url-test`（自动测速）**：定期向探测 URL 发起 HEAD 请求，自动选取延迟最低且健康的节点，推荐用于网页日常浏览。
3. **`fallback`（故障转移）**：按优先级依次尝试，仅在当前第一节点超时宕机时才自动切换至第二备用节点，特别适合远程办公与长连接会话。
4. **`load-balance`（负载均衡）**：将多个请求均匀散列到不同节点，适合高并发大带宽下载。

## 四、DNS 泄露防范与 TUN 模式调优

::: tip 生产排查技巧
如果发现在连接代理后，访问国内银行或流媒体服务频繁触发异地登录警告，通常是因为客户端开启了全局代理或规则配置不当导致的「漏流」。

推荐按照以下步骤排查：
1. 检查 `enhanced-mode` 是否设为 `fake-ip`。
2. 确认 `GEOIP,CN,DIRECT` 规则已生效，未被前面的通配规则拦截。
3. 更多诊断方法请参考 [网络诊断与延迟调优手册](/guides/network-optimization)。
:::

## 五、Clash 知识体系与相关推荐阅读

- **客户端安装与图文教程**：[Clash Verge Rev 零基础配置实操指南](/blog/clash-verge-rev-install-subscription-guide)
- **DNS 排查与防污染**：[Clash Fake-IP 机制与 DNS 泄露防范实战](/clash/dns-leak-prevention)
- **底层传输协议原理**：[VPN 与传输协议全景知识框架](/vpn/)
- **网络延迟与链路排错**：[跨平台网络诊断排错实战](/guides/network-optimization)
- **返回全景框架**：[返回 Clash 知识与客户端全景框架](/clash/)
