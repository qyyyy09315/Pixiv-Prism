# 💎 Pixiv-Prism (棱镜)

<p align="center">
  <img src="https://img.shields.io/badge/Pixiv-Prism-0096fa?style=for-the-badge&logo=pixiv&logoColor=white" alt="Pixiv-Prism" />
  <a href="https://greasyfork.org/zh-CN/scripts/603856-pixiv-prism"><img src="https://img.shields.io/badge/Greasy%20Fork-603856-red?style=for-the-badge&logo=greasyfork" alt="Greasy Fork" /></a>
  <img src="https://img.shields.io/badge/Version-v1.1.0-blue?style=for-the-badge" alt="Version" />
  <img src="https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge" alt="License" />
  <img src="https://img.shields.io/badge/Platform-Tampermonkey%20%7C%20Violentmonkey-orange?style=for-the-badge" alt="Platform" />
  <img src="https://img.shields.io/badge/Status-Active-brightgreen?style=for-the-badge" alt="Status" />
</p>

<p align="center">
  <b>精美、轻量、高可用的 Pixiv 免会员热度排序与全站图片极速加载工具</b><br>
  如棱镜折射光谱般，瞬间汇聚社区高光画作，彻底告别碎图与加载缓慢。
</p>

---

## 🌟 为什么选择 Pixiv-Prism？

在浏览 Pixiv 时，普通用户无法使用官方按热度排序（Premium 会员特权），且国内直连环境下经常遇到图片加载极慢、连接重置或大图变成“碎图裂开”的问题。目前社区现有方案普遍存在缺陷：
* **传统单图遍历脚本**：对所有作品高频发请求，触发 Cloudflare **429 Too Many Requests** 速率限制，导致大面积失效或卡死。
* **图片加载脆断**：官方 CDN 域名 `i.pximg.net` 受到严重网络干扰，稍有波动大图直接渲染成破损图标，没有任何重试或容灾机制。

**Pixiv-Prism 专为极致体验打造，集成两大核心引擎**：

### 💎 引擎 1：纯净双层渐进式排序架构
1. **纯净搜索框（Clean Input Box）**：绝不污染搜索输入框，用户输入什么就是什么，无任何多余标签干扰。
2. **现代胶囊粗筛（Zero Network Cost）**：采用 Pixiv 官方 Charcoal 风格圆角胶囊栏，一键切换 `500+`、`1000+`、`5000+`、`10000+`、`50000+` 收藏门槛，秒级直达全站高赞神作。
3. **单页就地重排（In-Place Sorter）**：点击「⚡ 按热度重排当前页」，脚本并发安全抓取真实收藏数（并发 2 + 随机延迟，彻底杜绝 429），在卡片右上角直观展示 `❤️ 12.5k` 高光角标，并按点赞数从大到小无损排列 DOM 网格。
4. **现代 SPA 深度适配**：无缝监听 `history.pushState`、`history.replaceState` 与 `MutationObserver`，站内跳转无需 F5 刷新！

### 🚀 引擎 2：智能图片加速与碎图自动容灾系统 (Auto-Heal Engine)
1. **全局碎图自愈 (Auto-Heal on Error)**：采用事件捕获机制监控页面所有图片。一旦任何插画、缩略图或头像因网络抖动加载失败，脚本瞬间无感将其切换为全球高速 CDN 镜像（`i.pixiv.re`），碎图秒级复活！
2. **大图详情页专属悬浮工具条**：进入 `/artworks/:id` 详情页，右下角自动唤起「💎 棱镜加速」面板：
   * **⚡ 高速加载**：一键将当前页面的所有画作切为高速 CDN 镜像，告别转圈与断流。
   * **🔍 无损原图**：一键在新标签页免代理满速查看当前插画的原画无损大图！

---

## 📸 运行实测截图

*(由 ZCode 内置真实 Chromium 浏览器环境实测渲染)*

* **原生嵌入效果**：完全融入 Pixiv 现代设计系统，自动自适应浅色与深色主题。
* **高光胶囊与角标**：选中标签即时高亮，卡片右上角自动贴附赞数角标并就地重排。

---

## 🚀 安装与使用

### 方式 1：通过 Greasy Fork 安装（最推荐，官方首选商店）
👉 **[点击前往 Greasy Fork 安装 Pixiv-Prism](https://greasyfork.org/zh-CN/scripts/603856-pixiv-prism)**

### 方式 2：GitHub / CDN 一键直装（Tampermonkey / Violentmonkey）
只要你的浏览器已安装 [Tampermonkey (篡改猴)](https://www.tampermonkey.net/) 或 [Violentmonkey (暴力猴)](https://violentmonkey.github.io/)，点击下方任意直链即可触发自动安装：

* 🔗 **[点击一键安装 Pixiv-Prism (GitHub 直链)](https://raw.githubusercontent.com/qyyyy09315/Pixiv-Prism/main/pixiv-prism.user.js)**
* ⚡ **[国内 CDN 加速安装直链 (jsDelivr)](https://fastly.jsdelivr.net/gh/qyyyy09315/Pixiv-Prism@main/pixiv-prism.user.js)**

*(脚本内置 `@updateURL`，安装后后续 GitHub 版本更新将由 Tampermonkey 自动静默拉取升级)*

### 方式 2：手动复制安装
1. 打开 [`pixiv-prism.user.js`](https://github.com/qyyyy09315/Pixiv-Prism/blob/main/pixiv-prism.user.js) 查看源码并全选复制。
2. 打开 Tampermonkey 管理面板 -> “添加新脚本” -> 粘贴覆盖并保存（Ctrl + S）。
3. 访问任意 [Pixiv 搜索页](https://www.pixiv.net/)（如搜索任意角色）即可立即体验！

---

## ⚠️ 免责声明与版权合规政策 (Disclaimer & Fair Use)

1. **非官方产品声明**：
   * 本项目（Pixiv-Prism）与 pixiv Inc. 无任何关联，并非官方出品。`Pixiv` 为 pixiv Inc. 在日本及其他国家/地区的注册商标。
2. **纯粹的技术研究与学术交流用途**：
   * 本项目的代码实现仅供 **Web 前端逆向机制研究、SPA 单页生命周期控制、DOM 异步重排算法以及防限流缓存设计** 的学习与学术交流使用。
   * **严禁将本项目用于任何形式的商业盈利、黑灰产采集、数据倒卖或破坏 pixiv 官方正常运营的用途**。
3. **创作者知识产权保护**：
   * 本项目不存储、不修改、不分发任何插画、漫画、小说等美术资源。所有媒体版权严格归原插画师及 pixiv 官方所有。请支持正版插画师与 Pixiv Premium 官方会员。
4. **服务器友好原则（Fair Use）**：
   * 本工具内置严格的速率限制器（Rate Limiter）和客户端本地缓存机制，确保请求频次低于正常人类浏览水平，绝不向官方服务器发起恶意高频爬取。
   * 使用者须自行承担因违规高频滥用而产生的一切连带责任。
5. **侵权移除（DMCA / Takedown Policy）**：
   * 若相关权益人认为本项目源码侵犯了您的合法权益，请通过 GitHub Issue 联系维护者，我们将在核实后依法依规第一时间进行处理或下线。

---

## 📄 开源许可证

本项目基于 [MIT License](./LICENSE) 协议开源。
