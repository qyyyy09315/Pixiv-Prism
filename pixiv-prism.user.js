// ==UserScript==
// @name         Pixiv-Prism
// @name:zh-CN   Pixiv-Prism (棱镜 - 免会员热度排序与高赞筛选)
// @namespace    https://github.com/qyyyy09315/Pixiv-Prism
// @homepageURL  https://greasyfork.org/zh-CN/scripts/603856-pixiv-prism
// @supportURL   https://github.com/qyyyy09315/Pixiv-Prism/issues
// @updateURL    https://raw.githubusercontent.com/qyyyy09315/Pixiv-Prism/main/pixiv-prism.user.js
// @downloadURL  https://raw.githubusercontent.com/qyyyy09315/Pixiv-Prism/main/pixiv-prism.user.js
// @version      1.2.1
// @description  全站默认图片极速加载、底层防掉图自愈、修复卡片重排DOM撕裂、免会员按人气排序、纯净搜索框、一键免代理查看无损原图。仅供技术学习与学术交流使用。
// @author       qyyyy09315
// @match        https://www.pixiv.net/*
// @grant        GM_addStyle
// @run-at       document-end
// @license      MIT
// ==/UserScript==

/**
 * ⚠️ 免责声明与版权合规政策 (Disclaimer & Fair Use)
 * 1. 本项目 (Pixiv-Prism) 与 pixiv Inc. 无任何关联，并非官方产品。
 * 2. 源码仅供 Web 前端技术学习、接口机制分析与学术交流使用，严禁用于任何商业牟利。
 * 3. 搜索与展示的所有作品版权均归原插画师及 pixiv Inc. 所有。
 * 4. 内置安全限频（并发 2 + 随机延迟）与本地缓存保护，严格遵守服务器友好（Fair Use）原则。
 */

(function () {
  'use strict';

  // 全球高速公共 CDN 镜像源
  const FAST_IMG_MIRROR = 'https://i.pixiv.re';

  // ===================== [核心黑科技] 底层原型级图片请求拦截与全站默认加速 =====================
  // 在任何脚本与框架给图片赋值前，于网络栈底层瞬间将 pximg.net 重写为全球高速 CDN，彻底杜绝掉图
  function setupRootImageInterceptor() {
    try {
      const originalSrcDesc = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');
      if (originalSrcDesc && originalSrcDesc.set) {
        Object.defineProperty(HTMLImageElement.prototype, 'src', {
          set: function (val) {
            if (typeof val === 'string' && val.includes('pximg.net')) {
              val = val.replace(/https?:\/\/[^\/]*\.pximg\.net/, FAST_IMG_MIRROR);
              this.referrerPolicy = 'no-referrer';
            }
            return originalSrcDesc.set.call(this, val);
          },
          get: function () {
            return originalSrcDesc.get.call(this);
          },
          configurable: true,
        });
      }

      const originalSetAttribute = Element.prototype.setAttribute;
      Element.prototype.setAttribute = function (name, val) {
        if (name === 'src' && typeof val === 'string' && val.includes('pximg.net')) {
          val = val.replace(/https?:\/\/[^\/]*\.pximg\.net/, FAST_IMG_MIRROR);
          if (this.tagName === 'IMG') {
            this.referrerPolicy = 'no-referrer';
          }
        }
        return originalSetAttribute.call(this, name, val);
      };

      // 拦截大图链接点击（防止新标签页打开触发 403 防盗链）
      document.addEventListener(
        'click',
        function (e) {
          const targetA = e.target.closest('a');
          if (targetA && targetA.href && targetA.href.includes('pximg.net')) {
            targetA.referrerPolicy = 'no-referrer';
            targetA.href = targetA.href.replace(/https?:\/\/[^\/]*\.pximg\.net/, FAST_IMG_MIRROR);
          }
        },
        true
      );
    } catch (err) {
      console.warn('[Pixiv-Prism] 原型拦截器初始化降级:', err);
    }
  }

  // 立即在第一时间激活底层拦截器
  setupRootImageInterceptor();

  console.log(
    '%c[Pixiv-Prism v1.2.1]%c 全站默认图片极速加载 | 底层防掉图 | 网格卡片无损重排 | 纯净搜索框 | 尊重原创版权',
    'background: #0096fa; color: #fff; padding: 2px 6px; border-radius: 4px; font-weight: bold;',
    'color: #0096fa; margin-left: 6px;'
  );

  // ===================== 1. 样式系统 (支持深浅主题自适应) =====================
  const CSS_STYLES = `
    .prism-container {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
      margin: 12px 0 16px 0;
      padding: 10px 14px;
      background: var(--charcoal-surface1, rgba(255, 255, 255, 0.95));
      border: 1px solid var(--charcoal-border, rgba(0, 0, 0, 0.08));
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 13px;
      z-index: 100;
      transition: all 0.2s ease;
    }
    @media (prefers-color-scheme: dark) {
      .prism-container {
        background: var(--charcoal-surface1, #1f2328);
        border-color: var(--charcoal-border, #30363d);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      }
    }
    .prism-title {
      font-weight: 700;
      color: #0096fa;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      margin-right: 4px;
      user-select: none;
    }
    .prism-pills-group {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      align-items: center;
    }
    .prism-pill {
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      padding: 4px 10px;
      border-radius: 16px;
      background: var(--charcoal-surface2, rgba(0, 0, 0, 0.04));
      color: var(--charcoal-text2, #555);
      border: 1px solid transparent;
      font-weight: 500;
      transition: all 0.15s ease-in-out;
      user-select: none;
    }
    .prism-pill:hover {
      background: rgba(0, 150, 250, 0.12);
      color: #0096fa;
      border-color: rgba(0, 150, 250, 0.3);
      transform: translateY(-1px);
    }
    .prism-pill.active {
      background: #0096fa !important;
      color: #ffffff !important;
      font-weight: 600;
      box-shadow: 0 2px 6px rgba(0, 150, 250, 0.35);
    }
    .prism-action-btn {
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      margin-left: auto;
      padding: 5px 12px;
      border-radius: 8px;
      background: linear-gradient(135deg, #0096fa, #0077cc);
      color: #fff;
      font-weight: 600;
      border: none;
      box-shadow: 0 2px 6px rgba(0, 150, 250, 0.25);
      transition: all 0.2s ease;
    }
    .prism-action-btn:hover {
      opacity: 0.92;
      transform: translateY(-1px);
      box-shadow: 0 4px 10px rgba(0, 150, 250, 0.35);
    }
    .prism-action-btn:disabled {
      background: #ccc;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }
    .prism-badge {
      position: absolute;
      top: 6px;
      right: 6px;
      padding: 2px 6px;
      background: rgba(0, 0, 0, 0.72);
      backdrop-filter: blur(4px);
      color: #fff;
      font-size: 11px;
      font-weight: bold;
      border-radius: 6px;
      z-index: 10;
      display: flex;
      align-items: center;
      gap: 3px;
      pointer-events: none;
      box-shadow: 0 1px 4px rgba(0,0,0,0.3);
    }
    .prism-badge.top-tier {
      background: linear-gradient(135deg, rgba(255, 75, 75, 0.9), rgba(255, 130, 0, 0.9));
      box-shadow: 0 2px 8px rgba(255, 75, 75, 0.4);
    }
    .prism-badge.high-tier {
      background: linear-gradient(135deg, rgba(0, 150, 250, 0.9), rgba(0, 200, 255, 0.9));
    }
    /* 大图详情页悬浮加速面板 */
    .prism-artwork-bar {
      position: fixed;
      bottom: 28px;
      right: 28px;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 14px;
      background: var(--charcoal-surface1, rgba(255, 255, 255, 0.96));
      border: 1px solid var(--charcoal-border, rgba(0, 0, 0, 0.12));
      border-radius: 24px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      z-index: 9999;
      font-size: 12px;
      backdrop-filter: blur(8px);
      transition: all 0.2s ease;
    }
    @media (prefers-color-scheme: dark) {
      .prism-artwork-bar {
        background: var(--charcoal-surface1, rgba(31, 35, 40, 0.95));
        border-color: #30363d;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
      }
    }
    .prism-artwork-bar:hover {
      box-shadow: 0 6px 20px rgba(0, 150, 250, 0.3);
      transform: translateY(-2px);
    }
    .prism-mini-btn {
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px;
      border-radius: 14px;
      background: var(--charcoal-surface2, rgba(0, 0, 0, 0.05));
      color: var(--charcoal-text1, #333);
      font-weight: 600;
      border: 1px solid transparent;
      transition: all 0.15s ease;
      text-decoration: none;
    }
    @media (prefers-color-scheme: dark) {
      .prism-mini-btn {
        color: #eee;
        background: rgba(255, 255, 255, 0.08);
      }
    }
    .prism-mini-btn:hover {
      background: #0096fa;
      color: #fff;
    }
    .prism-mini-btn.active {
      background: #0096fa;
      color: #fff;
    }
  `;

  const styleEl = document.createElement('style');
  styleEl.textContent = CSS_STYLES;
  document.head.appendChild(styleEl);

  // ===================== 2. 配置与状态 =====================
  const USERS_TAGS = [
    { label: '全部', value: '' },
    { label: '⭐ 500+', value: '500users入り' },
    { label: '🌟 1000+', value: '1000users入り' },
    { label: '💖 5000+', value: '5000users入り' },
    { label: '👑 10000+', value: '10000users入り' },
    { label: '🏆 50000+', value: '50000users入り' }
  ];

  const CACHE_PREFIX = 'prism_bm_';
  let isSorting = false;

  // ===================== 3. 纯净搜索框维护与关键词解析 =====================
  function isSearchPage() {
    const path = window.location.pathname;
    return path.startsWith('/tags/') || path.includes('/search');
  }

  // 从当前 URL 解析完整词、纯净词及当前档位
  function parseCurrentSearchInfo() {
    const url = new URL(window.location.href);
    let fullWord = '';

    if (url.pathname.startsWith('/tags/')) {
      const parts = url.pathname.split('/');
      if (parts.length >= 3) {
        fullWord = decodeURIComponent(parts[2]);
      }
    } else {
      fullWord = url.searchParams.get('word') || url.searchParams.get('q') || '';
    }

    // 匹配类似 "5000users入り" 或 "users入り" 的标签
    const match = fullWord.match(/(\d+users入り|users入り)/);
    const activeTag = match ? match[0] : '';
    // 清洗掉 users入り 标签，获得纯净的关键词
    const cleanWord = fullWord.replace(/(\s*(\d+users入り|users入り)\s*)/g, ' ').trim();

    return { fullWord, cleanWord, activeTag };
  }

  /**
   * 核心体验升级：纯净搜索框 (Clean Input Box)
   * 自动清理页面顶部搜索框输入栏中的 "5000users入り"，让搜索栏始终干净展示纯净词，避免干扰用户视线和重复搜索
   */
  function sanitizeSearchInputs() {
    const { cleanWord, activeTag } = parseCurrentSearchInfo();
    if (!activeTag || !cleanWord) return;

    // 找到页面上的所有搜索输入框
    const inputs = document.querySelectorAll('input[type="text"], input[name="word"], input[placeholder*="搜索"]');
    inputs.forEach((input) => {
      if (input.value && input.value.includes('users入り')) {
        // 如果输入框当前未处于焦点状态，则将它还原为纯净词
        if (document.activeElement !== input) {
          input.value = cleanWord;
        }
      }
    });
  }

  // 跳转到带有新标签的搜索结果
  function navigateWithTag(targetTag) {
    const { cleanWord } = parseCurrentSearchInfo();
    const finalWord = targetTag ? `${cleanWord} ${targetTag}`.trim() : cleanWord;

    const url = new URL(window.location.href);
    if (url.pathname.startsWith('/tags/')) {
      // 保持 /artworks 或 /illustrations 等子路径
      const subPath = url.pathname.split('/')[3] || 'artworks';
      window.location.href = `/tags/${encodeURIComponent(finalWord)}/${subPath}${url.search}`;
    } else {
      url.searchParams.set('word', finalWord);
      url.searchParams.set('p', '1');
      window.location.href = url.toString();
    }
  }

  // ===================== 4. 现代 UI 渲染与挂载 =====================
  function renderPrismBar() {
    if (!isSearchPage()) return;

    // 清洗输入框残留
    sanitizeSearchInputs();

    if (document.getElementById('pixiv-prism-bar')) return;

    // 适配 Pixiv 现代单页：优先挂载在原生“按最新排序/按热门度排序”筛选栏正上方
    const sortBtnCandidate = Array.from(document.querySelectorAll('button')).find(
      (b) => b.textContent.includes('最新排序') || b.textContent.includes('最新の順') || b.textContent.includes('Sort')
    );
    const sortRow = sortBtnCandidate?.closest('div.flex') || sortBtnCandidate?.parentElement?.parentElement;

    const nextRoot = document.getElementById('__next');
    const mainArea =
      document.querySelector('main') ||
      document.querySelector('section') ||
      document.querySelector('ul');

    const targetAnchor = sortRow || mainArea || nextRoot || document.body;

    const { activeTag, cleanWord } = parseCurrentSearchInfo();
    if (!cleanWord && !activeTag) return;

    const container = document.createElement('div');
    container.id = 'pixiv-prism-bar';
    container.className = 'prism-container';

    // 标题区域
    const title = document.createElement('span');
    title.className = 'prism-title';
    title.innerHTML = `<span>💎</span> Pixiv-Prism:`;
    container.appendChild(title);

    // 胶囊按钮组
    const pillsGroup = document.createElement('div');
    pillsGroup.className = 'prism-pills-group';

    USERS_TAGS.forEach((item) => {
      const pill = document.createElement('span');
      pill.className = `prism-pill ${item.value === activeTag ? 'active' : ''}`;
      pill.textContent = item.label;
      pill.title = item.value ? `收藏门槛：>= ${item.value}（纯净过滤）` : '查看普通搜索结果';
      pill.addEventListener('click', () => {
        if (item.value !== activeTag) {
          navigateWithTag(item.value);
        }
      });
      pillsGroup.appendChild(pill);
    });
    container.appendChild(pillsGroup);

    // 右侧快速排序按钮
    const sortBtn = document.createElement('button');
    sortBtn.id = 'prism-sort-trigger';
    sortBtn.className = 'prism-action-btn';
    sortBtn.innerHTML = `<span>⚡</span> <span>按热度重排当前页</span>`;
    sortBtn.addEventListener('click', runInPlaceSort);
    container.appendChild(sortBtn);

    // 插入逻辑：优先插在主容器前，否则作为首子元素 prepend
    if (targetAnchor.parentNode && targetAnchor !== document.body && targetAnchor !== nextRoot) {
      targetAnchor.parentNode.insertBefore(container, targetAnchor);
    } else {
      targetAnchor.prepend(container);
    }
  }

  // ===================== 5. 就地重排引擎 (In-Place Sorter) =====================
  function findIllustCards() {
    const links = Array.from(document.querySelectorAll('a[href*="/artworks/"]'));
    const cards = [];
    const seenIds = new Set();

    for (const link of links) {
      const match = link.href.match(/\/artworks\/(\d+)/);
      if (match) {
        const id = match[1];
        if (seenIds.has(id)) continue;

        // 精准锁定 Pixiv 现代网格卡片根单元（col-span-2 或 li，确保图片和标题完整包含，绝不撕裂）
        const cardElement =
          link.closest('div.col-span-2') ||
          link.closest('div[class*="col-span"]') ||
          link.closest('li') ||
          link.closest('[type="illust"]');

        if (cardElement && cardElement.parentElement) {
          seenIds.add(id);
          cards.push({ id, element: cardElement, linkElement: link });
        }
      }
    }
    return cards;
  }

  async function fetchBookmarkCount(illustId) {
    const cached = sessionStorage.getItem(CACHE_PREFIX + illustId);
    if (cached !== null) {
      return parseInt(cached, 10);
    }

    try {
      const response = await fetch(`/ajax/illust/${illustId}?time=${Date.now()}`, {
        credentials: 'include'
      });
      if (response.status === 429) {
        console.warn(`[Pixiv-Prism] 触发限流保护 (429)，已暂停抓取 ID: ${illustId}`);
        return -1;
      }
      if (!response.ok) return 0;

      const data = await response.json();
      const count = data?.body?.bookmarkCount ?? 0;
      sessionStorage.setItem(CACHE_PREFIX + illustId, count.toString());
      return count;
    } catch (e) {
      console.error(`[Pixiv-Prism] 获取 ${illustId} 失败:`, e);
      return 0;
    }
  }

  function renderBadge(cardElement, count) {
    if (!cardElement) return;
    let badge = cardElement.querySelector('.prism-badge');
    if (!badge) {
      badge = document.createElement('div');
      badge.className = 'prism-badge';
      const computedPos = window.getComputedStyle(cardElement).position;
      if (computedPos === 'static') {
        cardElement.style.position = 'relative';
      }
      cardElement.appendChild(badge);
    }

    let displayCount = count;
    if (count >= 10000) {
      displayCount = (count / 10000).toFixed(1) + 'w';
    } else if (count >= 1000) {
      displayCount = (count / 1000).toFixed(1) + 'k';
    }

    if (count >= 10000) {
      badge.className = 'prism-badge top-tier';
    } else if (count >= 3000) {
      badge.className = 'prism-badge high-tier';
    } else {
      badge.className = 'prism-badge';
    }

    badge.innerHTML = `❤️ ${displayCount}`;
  }

  async function runInPlaceSort() {
    if (isSorting) return;
    const sortBtn = document.getElementById('prism-sort-trigger');
    const cards = findIllustCards();

    if (cards.length === 0) {
      alert('[Pixiv-Prism] 未在当前页面检测到作品卡片，请等待作品加载或向下滚动后再试！');
      return;
    }

    isSorting = true;
    if (sortBtn) {
      sortBtn.disabled = true;
      sortBtn.innerHTML = `<span>⏳</span> <span>正在分析热度 (0/${cards.length})...</span>`;
    }

    // 严控 429：限制并发为 2，每次请求后随机休眠 180~320ms
    const CONCURRENCY = 2;
    let completed = 0;
    const results = [];

    async function worker(index) {
      if (index >= cards.length) return;
      const card = cards[index];
      const count = await fetchBookmarkCount(card.id);

      results.push({ card, count });
      renderBadge(card.element, Math.max(count, 0));

      completed++;
      if (sortBtn) {
        sortBtn.innerHTML = `<span>⏳</span> <span>分析热度 (${completed}/${cards.length})...</span>`;
      }

      await new Promise((r) => setTimeout(r, 180 + Math.random() * 140));
      return worker(index + CONCURRENCY);
    }

    const workers = [];
    for (let i = 0; i < Math.min(CONCURRENCY, cards.length); i++) {
      workers.push(worker(i));
    }
    await Promise.all(workers);

    // 降序排序
    results.sort((a, b) => b.count - a.count);

    // 执行 DOM 重排
    const parentContainer = results[0].card.element.parentElement;
    if (parentContainer) {
      results.forEach((item) => {
        parentContainer.appendChild(item.card.element);
      });
    }

    if (sortBtn) {
      sortBtn.disabled = false;
      sortBtn.innerHTML = `<span>✅</span> <span>排序完成 (共 ${results.length} 项)</span>`;
      setTimeout(() => {
        sortBtn.innerHTML = `<span>⚡</span> <span>重新按热度排序</span>`;
        isSorting = false;
      }, 3000);
    } else {
      isSorting = false;
    }
  }

  // ===================== 6. 智能图片加速与碎图自动容灾系统 (Auto-Heal Engine) =====================
  /**
   * 全站主动图片扫描与自愈防截断 (Active Image Healer)
   * 自动遍历并修正页面上所有残存的 pximg.net 图片，处理网络中断导致的残损图
   */
  function scanAndHealImages() {
    const imgs = document.querySelectorAll('img');
    imgs.forEach((img) => {
      const src = img.getAttribute('src') || img.src;
      if (src && src.includes('pximg.net')) {
        img.dataset.prismHealed = 'true';
        img.referrerPolicy = 'no-referrer';
        img.src = src.replace(/https?:\/\/[^\/]*\.pximg\.net/, FAST_IMG_MIRROR);
      }
      // 防掉图截断二次检测：如果图片显示已完成但高度为0，加上重试参数重新拉取完整数据
      if (img.complete && img.naturalHeight === 0 && img.src && !img.dataset.prismRetried) {
        img.dataset.prismRetried = 'true';
        const separator = img.src.includes('?') ? '&' : '?';
        img.src = img.src + separator + 'prism_retry=' + Date.now();
      }
    });
  }

  /**
   * 全局碎图捕获与自愈 (Global Image Auto-Heal)
   * 采用全局事件捕获，一旦页面任何 <img> 加载失败（网络超时/SNI阻断/丢包），
   * 立即无感将其替换为全球高速 CDN 镜像 i.pixiv.re，彻底告别碎图！
   */
  function initImageAutoHeal() {
    window.addEventListener(
      'error',
      function (e) {
        if (e.target && e.target.tagName === 'IMG') {
          const img = e.target;
          const src = img.currentSrc || img.src;

          if (src && src.includes('pximg.net') && !img.dataset.prismHealed) {
            img.dataset.prismHealed = 'true';
            img.referrerPolicy = 'no-referrer';
            const healedSrc = src.replace(/https?:\/\/[^\/]*\.pximg\.net/, FAST_IMG_MIRROR);
            console.log('[Pixiv-Prism] 🚀 捕获到碎图，自动启动 CDN 镜像容灾自愈:', healedSrc);
            img.src = healedSrc;
          }
        }
      },
      true // 必须在捕获阶段捕获 error 事件
    );

    // 页面加载完成后主动扫描一次
    setTimeout(scanAndHealImages, 500);
  }

  /**
   * 大图详情页专属加速面板 (Artwork Detail Accelerator)
   * 在 /artworks/:id 详情页中，默认处于全速加速状态，并提供一键免代理打开无损原图
   */
  function renderArtworkAccelerator() {
    const isArtworkPage = window.location.pathname.startsWith('/artworks/');
    const existing = document.getElementById('prism-artwork-bar');

    if (!isArtworkPage) {
      if (existing) existing.remove();
      return;
    }

    // 详情页默认自动执行全量加速替换
    scanAndHealImages();

    if (existing) return;

    const bar = document.createElement('div');
    bar.id = 'prism-artwork-bar';
    bar.className = 'prism-artwork-bar';
    bar.innerHTML = `
      <span style="font-weight:700;color:#0096fa;display:inline-flex;align-items:center;gap:4px;">💎 棱镜加速</span>
      <span class="prism-mini-btn active" title="全站默认已自动开启高速 CDN 镜像加速，告别转圈与断流">⚡ 全速加速中</span>
      <button id="prism-open-original" class="prism-mini-btn" title="在新标签页免代理满速查看当前插画的原画无损大图">🔍 查看无损原图</button>
    `;

    document.body.appendChild(bar);

    // 绑定“无损原图”事件
    document.getElementById('prism-open-original')?.addEventListener('click', async () => {
      const match = window.location.pathname.match(/\/artworks\/(\d+)/);
      if (!match) return;
      const illustId = match[1];

      try {
        const res = await fetch(`/ajax/illust/${illustId}?time=${Date.now()}`, { credentials: 'include' });
        const json = await res.json();
        const originalUrl = json?.body?.urls?.original;
        if (originalUrl) {
          const fastOriginalUrl = originalUrl.replace(/https?:\/\/[^\/]*\.pximg\.net/, FAST_IMG_MIRROR);
          window.open(fastOriginalUrl, '_blank');
        } else {
          alert('[Pixiv-Prism] 未能提取到该插画的无损原图直链！');
        }
      } catch (e) {
        console.error('[Pixiv-Prism] 获取无损原图失败:', e);
      }
    });
  }

  // ===================== 7. SPA 路由与 DOM 变化监听 =====================
  function handlePageChange() {
    renderPrismBar();
    renderArtworkAccelerator();
  }

  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;

  history.pushState = function (...args) {
    const result = originalPushState.apply(this, args);
    setTimeout(handlePageChange, 300);
    return result;
  };

  history.replaceState = function (...args) {
    const result = originalReplaceState.apply(this, args);
    setTimeout(handlePageChange, 300);
    return result;
  };

  window.addEventListener('popstate', () => {
    setTimeout(handlePageChange, 300);
  });

  let observerTimer = null;
  const observer = new MutationObserver(() => {
    if (observerTimer) return;
    observerTimer = setTimeout(() => {
      observerTimer = null;
      handlePageChange();
    }, 400);
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // 启动全局碎图自动自愈系统
  initImageAutoHeal();

  // 初始挂载
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', handlePageChange);
  } else {
    handlePageChange();
  }
})();
