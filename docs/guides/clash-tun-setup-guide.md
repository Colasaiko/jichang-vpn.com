---
keywords: TUN模式怎么开, Clash TUN设置, Windows TUN模式, Mac TUN模式
title: Clash TUN 模式怎么开？Windows 与 Mac 设置步骤
description: 手把手在 Windows 10/11 与 macOS 上开启 Clash Verge Rev 的 TUN 模式和服务模式，解决 git clone、Docker 拉取和外服游戏不走代理的问题。
---

# Windows 与 Mac 开启 TUN 模式实操指南

<div class="site-breadcrumbs">
  <a href="/">首页</a>
  <span class="sep">/</span>
  <a href="/guides/">教程中心</a>
  <span class="sep">/</span>
  <span class="current">TUN 模式实操指南</span>
</div>

在日常使用电脑时，普通「系统代理」只能照顾到 Chrome、Edge 等常规浏览器。而工程师与玩家常用的工具（终端 CMD / PowerShell / Git / Docker / 游戏客户端）由于不遵守系统代理协议，经常出现连接超时。

本文以目前最主流的 **Clash Verge Rev** 为例，带来 Windows 与 macOS 下开启 **TUN 虚拟网卡接管模式** 的手把手保姆级实战教程。

---

## 一、Windows 10 / 11 开启 TUN 模式四步法

```
[步骤 1: 管理员运行] ──► 退出托盘软件，右键点击图标选择「以管理员身份运行」
         │
         ▼
[步骤 2: 安装服务模式] ──► 进入设置，找到「服务模式 (Service Mode)」点击安装 (Install)
         │
         ▼
[步骤 3: 授权绿色运行] ──► 弹窗点击允许，服务模式显示为绿色「Active」激活状态
         │
         ▼
[步骤 4: 滑动开启 TUN] ──► 开启「TUN 模式」开关，整机所有流量全透明接管！
```

### 关键避坑点
1. **必须安装服务模式 (Service Mode)**：TUN 模式需要向系统内核注入 Wintun 驱动，如果直接开 TUN 开关可能会报权限不足，务必先在「设置」里安装服务模式；
2. **配合 Fake-IP**：确保订阅配置文件的 DNS 处于 `fake-ip` 模式，响应速度最快；
3. **验证是否成功**：打开电脑自带的 PowerShell 或 CMD，直接输入 `curl -I https://www.google.com`，若能正常返回 `HTTP/2 200`，说明终端已完全实现透明翻墙！

---

## 二、macOS 苹果电脑开启 TUN 模式指南

1. 打开 Clash Verge Rev 偏好设置；
2. 在主界面滑动开启「TUN 模式」开关；
3. 系统会弹窗提示：“**Clash Verge 想要添加系统网络扩展**”；
4. 点击「打开系统设置」，并在 Mac「隐私与安全性」最下方点击「允许」；
5. 输入 Mac 开机登录密码确认，此时虚拟网卡便顺利生效。

---

## 三、常见问题与解决

- **开启 TUN 模式后局域网共享或 NAS 连不上？**
  在客户端设置中勾选「绕过局域网私有网段 (Bypass Private Network)」，或者在规则前部加入 `IP-CIDR,192.168.0.0/16,DIRECT`。
- **玩外服游戏时延迟抖动？**
  建议搭配本站推荐的 [**低延迟 IPLC 专线服务**](/recommendations/)，并在客户端中手动选择延迟低于 40ms 的香港或日本专线节点。

::: tip 延伸阅读
想先弄懂 TUN 的原理：[Clash TUN 模式是什么？](/clash/tun-mode-explained)
:::
