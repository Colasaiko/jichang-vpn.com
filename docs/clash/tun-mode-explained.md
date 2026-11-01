---
keywords: TUN模式, Clash TUN, 虚拟网卡, 终端不走代理
title: Clash TUN 模式是什么？游戏和终端为什么要开
description: 深度剖析系统代理 (System Proxy) 与 TUN 虚拟网卡模式的底层差异。解释为什么终端 git clone 报错、Docker 拉取超时与游戏无法代理，详解 Windows/macOS 下开启 TUN 的实战避坑指南。
---

# TUN 模式深度解析：为什么命令行与游戏必须开启 TUN？

<div class="site-breadcrumbs">
  <a href="/">首页</a>
  <span class="sep">/</span>
  <a href="/clash/">Clash 教程框架</a>
  <span class="sep">/</span>
  <span class="current">TUN 模式深度解析</span>
</div>

很多刚接触 Clash 或代理工具的用户，都经历过下面这些令人抓狂的场景：
- 🌐 **浏览器明明能正常打开 Google 和 YouTube**；
- 💻 但一打开电脑终端（CMD / PowerShell / Terminal），运行 `git clone` 却疯狂报超时：`Failed to connect to github.com port 443: Timed out`；
- 🐳 运行 `docker pull` 拉取官方镜像卡死在第一步；
- 🎮 打开 Steam 登录、Discord 语音频道、外服游戏客户端（如 Apex、英雄联盟外服），依然显示“网络连接中断”！

“**为什么我开了代理，却只有浏览器有效果，其他很多软件完全不走代理？**”

答案就在于：你使用的是传统的**系统代理（System Proxy）**，而没有开启 **TUN 虚拟网卡模式（TUN Mode）**。本文为你彻底剖析两者的技术分界线。

---

## 一、核心原理对比：系统代理 vs TUN 虚拟网卡

```
【传统系统代理 (System Proxy)】
[应用程序发起请求]
       │
       ├─► 遵守系统代理的软件 (Chrome / Edge / 微信) ──► 自动发送至 127.0.0.1:7890 ──► Clash 转发成功
       │
       └─► 不遵守系统代理的软件 (终端 Git / Docker / 游戏等) ──► 直接往本地公网硬冲 ──► ❌ 无法连接/超时失败！

【TUN 虚拟网卡模式 (TUN Mode)】
[整机所有软件 (无论是否遵从代理协议)]
       │
       ▼ (所有第 3 层 IP 数据包无死角捕获)
[操作系统内核级虚拟网卡 (TUN Adapter)] ──► 全盘引流给 Mihomo 内核 ──► 智能规则分流出海 ──►  全盘成功！
```

### 1. 系统代理（System Proxy）：脆弱的“君子协议”
- **工作机制**：开启系统代理后，Clash 会在本地开启一个 HTTP / SOCKS5 代理端口（默认通常是 `127.0.0.1:7890`），并在 Windows 的“Internet 选项”或 macOS 的“网络代理设置”中打上勾。
- **致命软肋**：**系统代理本质上是一个“君子协议”**。只有主动读取系统环境设置的应用程序（比如 Chrome、Firefox、Office 等常规软件）才会把流量交给 7890 端口。
- **漏网之鱼**：底层的终端开发工具（Git、Curl、Wget、Docker Daemon、Pip、NPM）、几乎所有的 PC 外服端游、虚拟机（VMware / WSL2）以及某些未规范适配的专用软件，**压根不会去读取系统的 HTTP 代理设置**，而是固执地直接向外发送普通的 TCP/UDP 数据包，结果必然直接撞墙超时！

---

### 2. TUN 模式：强行接管整机的“内核级交警”
- **工作机制**：TUN（Network Tunnel）是操作系统内核支持的一种**虚拟点对点网络适配器**。
- **强制接管**：开启 TUN 模式后，系统会在本地生成一块名为 `Meta` 或 `Wintun` 的虚拟网卡，并将系统的默认网关（Default Gateway）路由直接指向这块虚拟网卡。
- **无死角捕获**：在操作系统的第 3 层（网络层 / IP 层）拦截进出网卡的所有原始数据包。无论是浏览器、命令行、游戏还是后台进程，**只要发出数据包，统统被强制重定向捕获至代理内核**，彻底消灭任何漏网之鱼。

---

## 二、哪些场景【必须】开启 TUN 模式？

| 应用场景 | 未开 TUN 模式（仅系统代理） | 开启 TUN 模式后 |
| :--- | :--- | :--- |
| **终端 Git 代码拉取** | `git clone` 持续连接超时 443 | 自动秒速克隆，无需手动配置 `git config --global http.proxy` |
| **Docker 镜像构建与拉取** | `docker build` 镜像源拉取失败 | 虚拟化层流量全部透明穿透，秒拉海外最新镜像 |
| **外服游戏对战与语音开黑** | 游戏客户端无法登录，Discord 语音卡红 | UDP 流量完整转发，外服联机平稳，语音极速连接 |
| **WSL2 / 虚拟机网络** | Linux 子系统与宿主机代理隔离断网 | 宿主机虚拟网卡直接接管 WSL2 流量，子系统直接翻墙 |
| **Python / Node 依赖安装** | `pip install` 或 `npm install` 频繁卡死 | 终端透明加速，开发依赖秒级下载 |

---

## 三、Windows 与 macOS 下开启 TUN 的实战指南 (以 Clash Verge Rev 为例)

### 1. Windows 端开启 TUN 避坑步骤
1. **授予管理员权限**：
   - 首次开启时，必须以**系统管理员身份（Run as Administrator）**运行客户端。
2. **安装服务模式（Service Mode）**：
   - 进入客户端「设置 (Settings)」页面，找到「服务模式 (Service Mode)」点击安装（Install），成功后左侧会显示绿色运行图标。
3. **打开 TUN 开关**：
   - 找到「TUN 模式」并滑动开启，此时系统托盘会提示已加载 Wintun 驱动。
4. **配合 Fake-IP 使用最佳**：
   - 确保配置文件中的 DNS 模式为 `fake-ip`，能实现 DNS 请求毫秒级返回，彻底杜绝本地 DNS 污染。

### 2. macOS 端开启 TUN 步骤
1. 点击开启「TUN 模式」，系统会弹窗提示“客户端正在尝试添加系统扩展/网络助理”；
2. 输入 Mac 开机密码授权，并在 macOS 系统设置的「隐私与安全性」中允许加载网络扩展，即可瞬间生效。

---

## 四、开启 TUN 模式后的常见疑问与注意事项

### Q1: 开启 TUN 模式后，国内网站会不会变慢或者被代理？
不会。TUN 模式只是负责将**全量数据包捕获给 Clash 内核**。捕获之后，内核依然会严格按照你的 `rules` 规则库（如 GeoIP、Direct 规则）进行智能裁决。**国内的微信、百度、淘宝依然是毫秒级直连**，只有被规则命中为海外的目标才会走节点代理。

### Q2: 开启 TUN 模式后，局域网打印机或 NAS 连不上了怎么办？
这是因为某些默认规则将局域网私有网段（`192.168.x.x` / `10.x.x.x`）误捕获。
**解决办法**：在客户端设置中的「绕过私有网络 / Bypass Private Network」打上勾，或者在规则最前部加上：
```yaml
rules:
  - IP-CIDR,192.168.0.0/16,DIRECT,no-resolve
  - IP-CIDR,10.0.0.0/8,DIRECT,no-resolve
  - IP-CIDR,127.0.0.0/8,DIRECT,no-resolve
```

---

## 五、总结

- 如果你只是偶尔用浏览器查查英文维基网页，普通的**系统代理**勉强够用；
- 但如果你是**软件工程师、外服游戏玩家、AI 深度创作者或学术科研人员**，**强烈建议常驻开启 TUN 虚拟网卡模式**，告别繁琐的终端环境变量配置，享受整机全透明的高速无感体验。

::: tip 延伸阅读
看完原理想直接动手：[Windows 与 Mac 开启 TUN 模式的步骤](/guides/clash-tun-setup-guide)
:::
