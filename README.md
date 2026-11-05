# 💎 Pixiv-Prism (棱镜)

<p align="center">
  <img src="https://img.shields.io/badge/Pixiv-Prism-0096fa?style=for-the-badge&logo=pixiv&logoColor=white" alt="Pixiv-Prism" />
  <img src="https://img.shields.io/badge/Version-v1.0.0-blue?style=for-the-badge" alt="Version" />
  <img src="https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge" alt="License" />
  <img src="https://img.shields.io/badge/Platform-Tampermonkey%20%7C%20Violentmonkey-orange?style=for-the-badge" alt="Platform" />
  <img src="https://img.shields.io/badge/Status-Active-brightgreen?style=for-the-badge" alt="Status" />
</p>

<p align="center">
  <b>精美、轻量、高可用的 Pixiv 免会员热度排序与高赞筛选工具</b><br>
  如棱镜折射光谱般，瞬间汇聚社区高光画作。
</p>

---

## 🌟 为什么选择 Pixiv-Prism？

在浏览 Pixiv 时，普通用户无法使用官方按热度排序（Premium 会员特权）。目前社区现有方案普遍存在两极分化的缺陷：
* **传统单图遍历脚本（如部分老旧油猴脚本）**：对页面所有作品无节制发起高频详情请求，短时间内触发 Cloudflare **429 Too Many Requests** 速率限制，导致作品批量显示“获取失败”或卡死。
* **简单标签修改脚本**：仅机械拼接 `users入り`，搜出来的结果内部依然按“发布时间”倒序混乱排列，无法做到从高到低精细排序；且在单页应用（SPA）路由跳转后经常丢失组件。

**Pixiv-Prism 采用「双层渐进式排序架构（Hybrid Progressive Ranking）」**，完美化解上述矛盾：

1. **层级 1：无感粗筛（Zero Network Cost）**
   * 采用现代原生 Charcoal 设计风格的胶囊标签栏（Pill Chips），支持一键切换 `500+`、`1000+`、`5000+`、`10000+`、`50000+` 收藏门槛。
   * 自动清洗旧标签，瞬间锁定全站高赞高质量作品池，零额外请求，绝无 429 风险。
2. **层级 2：单页就地重排引擎（In-Place Sorter）**
   * 点击「⚡ 按热度重排当前页」，脚本自动抓取当前可视作品的真实收藏数。
   * **智能客户端缓存**：基于 `sessionStorage` 记录收藏量，同张作品在标签页生命周期内零重复请求。
   * **低并发与微抖动保护**：严格限制并发为 2，并引入随机微延迟，彻底告别被官方封禁或拦截。
   * **高光角标与平滑重排**：在卡片右上角直观展示 `❤️ 12.5k`、`❤️ 5.8k` 彩色渐变角标，并按点赞数从大到小无损重新排列 DOM 网格。
3. **现代 SPA 深度适配**：
   * 监听 `history.pushState`、`history.replaceState` 与 `MutationObserver`，无论在站内如何点击作品并返回，工具栏始终毫秒级平滑常驻，无需 F5 刷新！

---

## 📸 运行实测截图

*(由 ZCode 内置真实 Chromium 浏览器环境实测渲染)*

* **原生嵌入效果**：完全融入 Pixiv 现代设计系统，自动自适应浅色与深色主题。
* **高光胶囊与角标**：选中标签即时高亮，卡片右上角自动贴附赞数角标并就地重排。

---

## 🚀 安装与使用

### 方式 1：一键安装（Tampermonkey / Violentmonkey）
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
