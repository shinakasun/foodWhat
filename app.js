這是一套針對您最新 4 項需求全面升級與重構的完整 **`index.html`** 與 **`app.js`** 程式碼。

---

### ✨ 本次更新亮點摘要

1. **正式版介面優化（隱藏廣告與計時）**：
* 開通正式版後，畫面最底部的「看廣告按鈕 (`#btn-watch-ad`)」與「下一次自動補充倒數計時器 (`#next-refresh-time`)」將**徹底從 DOM 隱藏**，打造完全無廣告干擾的純淨介面。


2. **統計中心：討厭與禁用清單升級（卷軸 + 實時動態搜尋）**：
* 「👎 討厭的食物名單」**與**「⛔ 完全禁用的食物名單」兩區塊皆設定固定高度與滾動條 (`max-h-48 overflow-y-auto`)。
* **關鍵字即時篩選**：各新增獨立的搜尋輸入框。輸入 `肉` 即實時比對所有含「肉」的品項；續打 `絲`（`肉絲`）會即時精準過濾出含「肉絲」的品項。


3. **五大季節主題風格全面重新配色**：
* 🌸 **夜櫻風格 (`theme-night-sakura`)**：深邃黑灰背景、櫻花粉柔美按鈕、按鈕文字清晰顯示為純黑色。
* 🌿 **春天風格 (`theme-spring`)**：清新青草綠背景、亮白/柔白主題按鈕、搭配充滿盎然生機的春天調性 UI。
* 🌊 **夏天風格 (`theme-summer`)**：沁涼水藍色背景、質感沙灘金黃按鈕、搭配夏日海洋風格 UI。
* 🍁 **秋天風格 (`theme-autumn`)**：溫暖楓葉橘黃背景、質感沙灘色按鈕、搭配濃郁秋意調性 UI。
* ❄️ **新增冬天風格 (`theme-winter`)**：冰晶雪藍背景、冰爽雪白按鈕與清透深藍色 UI，呈現極致冬日質感。



---

### 📄 1. 完整的 `index.html`

```html
<!DOCTYPE html>
<html lang="zh-TW" id="html-root" class="theme-default">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>吃什麼 2 - 九星氣學開運版</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = { darkMode: 'class' };
  </script>
  <style>
    /* 跑馬燈動畫 */
    @keyframes marquee {
      0%, 20% { transform: translateX(0); }
      80%, 100% { transform: translateX(var(--marquee-distance)); }
    }
    .animate-marquee {
      display: inline-block;
      animation: marquee var(--marquee-duration) linear infinite;
    }

    /* 隱藏預設滾動條但保持滾動 */
    .scrollbar-none::-webkit-scrollbar { display: none; }
    .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }

    /* Custom Scrollbar for list modals */
    .custom-scroll::-webkit-scrollbar { width: 4px; }
    .custom-scroll::-webkit-scrollbar-track { background: transparent; }
    .custom-scroll::-webkit-scrollbar-thumb { background: rgba(156, 163, 175, 0.4); border-radius: 4px; }

    /* 🎨 主題風格定義 */
    /* 1. 深色風格 */
    html.theme-dark { color-scheme: dark; }
    html.theme-dark body { background-color: #020617; color: #f8fafc; }
    html.theme-dark .app-card { background-color: #0f172a; border-color: #1e293b; color: #f8fafc; }

    /* 2. 夜櫻風格 (背景黑灰、按鈕櫻花粉、按鈕文字純黑) */
    html.theme-night-sakura { color-scheme: dark; }
    html.theme-night-sakura body { background-color: #121216; color: #fce7f3; }
    html.theme-night-sakura .app-card { background-color: #1a1820; border-color: #3b2737; color: #fce7f3; }
    html.theme-night-sakura button,
    html.theme-night-sakura select { background-color: #fbcfe8 !important; color: #000000 !important; border-color: #f472b6 !important; font-weight: 700 !important; }
    html.theme-night-sakura button:hover { background-color: #f472b6 !important; }
    
    /* 3. 春天風格 (背景青草綠、按鈕偏向白色、春天質感) */
    html.theme-spring body { background-color: #15803d; color: #14532d; }
    html.theme-spring .app-card { background-color: #f0fdf4; border-color: #bbf7d0; color: #14532d; }
    html.theme-spring button,
    html.theme-spring select { background-color: #ffffff !important; color: #166534 !important; border-color: #86efac !important; font-weight: 700 !important; }
    html.theme-spring button:hover { background-color: #dc2626; color: #ffffff !important; }

    /* 4. 夏天風格 (背景水藍色、按鈕沙灘色、夏日海洋感) */
    html.theme-summer body { background-color: #0284c7; color: #0c4a6e; }
    html.theme-summer .app-card { background-color: #f0f9ff; border-color: #bae6fd; color: #0c4a6e; }
    html.theme-summer button,
    html.theme-summer select { background-color: #fef08a !important; color: #713f12 !important; border-color: #fde047 !important; font-weight: 700 !important; }
    html.theme-summer button:hover { background-color: #facc15 !important; }

    /* 5. 秋天風格 (背景橘黃色、按鈕沙灘色、濃郁秋意感) */
    html.theme-autumn body { background-color: #ea580c; color: #431407; }
    html.theme-autumn .app-card { background-color: #fff7ed; border-color: #ffedd5; color: #431407; }
    html.theme-autumn button,
    html.theme-autumn select { background-color: #fef08a !important; color: #713f12 !important; border-color: #fde047 !important; font-weight: 700 !important; }
    html.theme-autumn button:hover { background-color: #facc15 !important; }

    /* 6. 新增：冬天風格 (背景冰塊水藍色、冰晶雪亮 UI) */
    html.theme-winter body { background-color: #38bdf8; color: #0f172a; }
    html.theme-winter .app-card { background-color: #f0f9ff; border-color: #e0f2fe; color: #0369a1; }
    html.theme-winter button,
    html.theme-winter select { background-color: #ffffff !important; color: #0284c7 !important; border-color: #bae6fd !important; font-weight: 700 !important; }
    html.theme-winter button:hover { background-color: #e0f2fe !important; }
  </style>
</head>
<body id="body-root" class="bg-slate-100 text-slate-800 min-h-screen flex flex-col items-center p-4 transition-colors duration-200">
  <div class="app-card w-full max-w-md bg-white rounded-2xl shadow-xl p-6 mt-6 relative transition-colors duration-200">
    
    <!-- 頂部標題與頭銜區 -->
    <div class="flex justify-between items-start mb-3">
      <div id="title-container" onclick="openTitleModal()" class="cursor-pointer group select-none" title="點擊更換頭銜">
        <h1 id="app-main-title" class="text-xl font-bold leading-tight group-hover:text-indigo-600 transition">
          <span>歡迎您！</span><br>
          <span class="text-indigo-600 dark:text-indigo-400">食物迷途旅人 ▼</span>
        </h1>
      </div>
      <div class="flex items-center gap-1.5">
        <button id="btn-stats-action" onclick="openStatsModal()" class="flex flex-col items-center justify-center px-2 py-1 text-xs rounded-xl border transition bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700 min-w-[42px] hidden" title="統計中心 (Lv.5 解鎖)">
          <span class="text-sm">🔒</span>
          <span class="text-[10px] mt-0.5 leading-none">統計</span>
        </button>
        <button onclick="openSettingsModal()" class="flex flex-col items-center justify-center px-2 py-1 text-xs rounded-xl border transition bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-500 min-w-[42px]" title="系統設定">
          <span class="text-sm">⚙️</span>
          <span class="text-[10px] mt-0.5 leading-none">設定</span>
        </button>
      </div>
    </div>

    <!-- 頂部：等級 + 經驗條 + 水晶與狀態提示 -->
    <div class="flex items-center gap-2 mb-2">
      <div id="user-level-badge" class="px-2.5 py-1 rounded-lg bg-amber-400 text-black font-extrabold text-sm shadow-sm flex items-center justify-center min-w-[48px]">
        Lv.1
      </div>

      <div class="flex-grow">
        <div class="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1">
          <span id="exp-text">經驗值: 0 / 5</span>
        </div>
        <div class="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
          <div id="exp-bar" class="bg-indigo-600 h-full w-0 transition-all duration-300"></div>
        </div>
      </div>

      <!-- 右側水晶卡片 -->
      <div class="flex flex-col items-center min-w-[76px]">
        <div id="coin-counter-badge" class="w-full px-2.5 py-1.5 rounded-lg bg-blue-500 text-white font-extrabold text-sm shadow-sm flex items-center justify-center gap-1 whitespace-nowrap">
          <span class="text-base">💎</span> <span id="coin-counter-val">20</span>
        </div>
        <span id="coin-timer-subtext" class="text-[9px] font-bold text-slate-400 dark:text-slate-500 mt-0.5 leading-none whitespace-nowrap">
          ✨ 已達上限
        </span>
      </div>
    </div>

    <!-- 冷卻提示文案 -->
    <div id="cooldown-timer-bar" class="text-[11px] text-amber-600 dark:text-amber-400 font-medium mb-2 hidden">
      ⏳ 下一次額外的經驗值：<span id="cooldown-countdown">00:00:00</span>
    </div>

    <!-- 本命與今日局勢區 -->
    <div class="p-3 bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-xl mb-3">
      <div class="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-bold text-indigo-900 dark:text-indigo-200 mb-1">
        <div class="flex items-center gap-1 whitespace-nowrap">
          <span>本命：</span>
          <span id="user-element-tag" class="px-1.5 py-0.5 rounded bg-indigo-600 text-white text-[11px]">未設定</span>
        </div>
        <span class="text-indigo-300 dark:text-indigo-700">|</span>
        <div class="flex items-center gap-1 whitespace-nowrap">
          <span>局勢：</span>
          <span id="user-relation-tag" class="px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-[11px]">未設定</span>
        </div>
      </div>
      <p id="fortune-text" class="text-xs text-indigo-700 dark:text-indigo-300 leading-relaxed font-medium">✨ 正在解析今日日辰氣場...</p>
    </div>
    
    <!-- 美食冷知識區 (Lv.6 解鎖) -->
    <div id="trivia-locked-box" onclick="checkFeatureLock('trivia')" class="mb-3 p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-700 text-xs text-slate-400 dark:text-slate-500 text-center cursor-pointer hover:bg-slate-200 transition hidden">
      ❓ <strong>[已鎖定] 美食冷知識區</strong> (Lv.6 解鎖)
    </div>
    <div id="trivia-wrapper" class="mb-3 hidden relative">
      <div id="trivia-box" class="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-900 dark:text-amber-200 flex items-center gap-3">
        <div class="flex-grow min-w-0 flex flex-col h-[76px]">
          <div class="font-bold text-amber-800 dark:text-amber-300 text-xs mb-1 flex items-center gap-1 shrink-0">
            💡 美食冷知識
          </div>
          <div class="overflow-y-auto pr-1 flex-grow scrollbar-none">
            <p id="trivia-content" class="text-slate-700 dark:text-slate-300 leading-relaxed text-[11px]"></p>
          </div>
        </div>
        <div class="flex flex-col items-center justify-center shrink-0 min-w-[68px] border-l border-amber-200/60 dark:border-amber-900/40 pl-3">
          <button onclick="refreshTriviaWithCoin()" class="w-10 h-10 rounded-xl bg-amber-200 hover:bg-amber-300 dark:bg-amber-900 dark:hover:bg-amber-800 text-amber-950 dark:text-amber-100 font-bold transition flex items-center justify-center shadow-sm active:scale-95" title="換一個冷知識">
            <span class="text-lg">🔄</span>
          </button>
          <span id="trivia-countdown-text" class="text-[9px] text-amber-800 dark:text-amber-300 font-bold text-center mt-1 leading-tight whitespace-nowrap">
            💎 -1<br>換一個
          </span>
        </div>
      </div>
      <div id="toast-exp-floating" class="absolute -top-6 right-8 bg-amber-500 text-white text-[11px] font-extrabold px-2 py-0.5 rounded-full shadow-lg opacity-0 transition-all duration-500 pointer-events-none">
        💎 -1
      </div>
    </div>

    <!-- 冒險者公會區 -->
    <div id="guild-locked-box" onclick="checkFeatureLock('guild')" class="mb-3 p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-700 text-xs text-slate-400 dark:text-slate-500 text-center cursor-pointer hover:bg-slate-200 transition hidden">
      🔒 <strong>[已鎖定] 冒險者公會</strong> (Lv.4 解鎖)
    </div>
    <div id="guild-wrapper" class="mb-3 hidden">
      <div id="guild-banner" onclick="handleGuildClick()" class="p-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-bold shadow-md cursor-pointer hover:opacity-95 transition flex justify-between items-center">
        <div>
          <div id="guild-banner-title" class="text-sm font-extrabold">冒險者公會</div>
          <div id="guild-banner-sub" class="text-[10px] text-indigo-200 font-normal">點擊接取副本任務，贏取稀有靈氣！</div>
        </div>
        <span class="text-sm">▶</span>
      </div>
    </div>

    <!-- 靈氣開關區 -->
    <div id="aura-container" class="relative mb-3 hidden">
      <div id="toast-aura-floating" class="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900/95 dark:bg-slate-100 dark:text-slate-900 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-xl opacity-0 transition-all duration-300 pointer-events-none whitespace-nowrap text-center leading-tight z-20">
        靈氣已切換
      </div>
      <div id="aura-control-panel" class="flex items-center gap-1.5 overflow-x-auto pb-1">
        <span class="text-[11px] font-bold text-slate-400 dark:text-slate-500 whitespace-nowrap">靈氣：</span>
        <button id="aura-btn-cold" onclick="toggleAura('cold')" class="px-2.5 py-1 text-[11px] rounded-lg border transition font-bold whitespace-nowrap bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700">❄️ 極寒靈氣 (未解鎖)</button>
        <button id="aura-btn-hot" onclick="toggleAura('hot')" class="px-2.5 py-1 text-[11px] rounded-lg border transition font-bold whitespace-nowrap bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700">🔥 灼熱靈氣 (未解鎖)</button>
        <button id="aura-btn-snack" onclick="toggleAura('snack')" class="px-2.5 py-1 text-[11px] rounded-lg border transition font-bold whitespace-nowrap bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700">⚡ 迅捷靈氣 (未解鎖)</button>
      </div>
    </div>

    <!-- 盲盒選項區 -->
    <div id="guide-target-food" class="rounded-2xl transition-all duration-300 p-1">
      <div id="food-container" class="space-y-2 min-h-[160px]">
        <div class="p-4 border dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-800 text-center text-slate-500">載入中...</div>
      </div>
    </div>

    <!-- 個人最愛精選區 -->
    <div id="favorite-section-wrapper" class="mt-4 pt-4 border-t border-dashed border-slate-200 dark:border-slate-800 hidden">
      <div class="flex items-center justify-between mb-2">
        <span id="favorite-label" class="text-xs font-bold text-slate-400 dark:text-slate-600 flex items-center gap-1">❓ 個人最愛精選 (未解鎖)</span>
      </div>
      <div id="favorite-container">
        <div id="favorite-locked-box" onclick="checkFeatureLock('favorite')" class="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-700 text-xs text-slate-400 dark:text-slate-500 text-center cursor-pointer hover:bg-slate-200 transition">
          🔒 達到 Lv.3 解鎖個人最愛鎖定區
        </div>
      </div>
    </div>

    <!-- 隨機抽選按鈕區 -->
    <div id="guide-target-button" class="relative mt-6 rounded-2xl transition-all duration-300 p-1">
      <button id="draw-btn" class="w-full py-3 bg-orange-700 hover:bg-orange-800 active:bg-orange-900 text-white font-bold rounded-xl shadow-lg transition flex flex-col items-center justify-center">
        <span class="text-lg">🎲 隨機抽選 (-1 💎)</span>
      </button>
      <div id="toast-draw-exp-floating" class="absolute -top-7 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-[11px] font-extrabold px-3 py-0.5 rounded-full shadow-lg opacity-0 transition-all duration-500 pointer-events-none whitespace-nowrap">
        ✨ 經驗值 +1
      </div>
    </div>
    
    <!-- 底部輔助經驗條 -->
    <div class="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
      <div class="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1">
        <span id="footer-exp-text">目前進度: 0 / 5</span>
        <span id="footer-next-unlock" class="font-medium text-indigo-600 dark:text-indigo-400">解鎖進度條</span>
      </div>
      <div class="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
        <div id="footer-exp-bar" class="bg-indigo-600 h-full w-0 transition-all duration-300"></div>
      </div>
    </div>

    <!-- 看廣告按鈕列（正式版解鎖時直接隱藏） -->
    <div id="ad-banner-row" class="flex items-center justify-between mt-2 px-1">
      <span id="next-refresh-time" class="text-xs text-slate-500 dark:text-slate-400">下一次自動補充：10:00</span>
      <button id="btn-watch-ad" onclick="simulateWatchAd()" class="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold rounded-lg text-xs shadow transition flex items-center gap-1">
        🎬 看廣告 +10 💎
      </button>
    </div>
  </div>

  <!-- 引導模式遮罩 -->
  <div id="guide-overlay" class="fixed inset-0 bg-slate-950/80 backdrop-blur-xs hidden z-40 transition-opacity duration-300"></div>

  <!-- 彈窗 Modal 區塊 -->
  <div id="modal-overlay" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm hidden flex items-center justify-center p-4 z-50">
    
    <!-- 初次進入：生日彈窗 -->
    <div id="modal-birth" class="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-sm shadow-2xl hidden">
      <h2 class="text-lg font-bold text-slate-800 dark:text-white mb-2">歡迎來到吃什麼 2</h2>
      <p class="text-xs text-slate-500 dark:text-slate-400 mb-4">請選擇您的西元出生年月日，將為您解析九星氣學本命星：</p>
      <div class="grid grid-cols-3 gap-2 mb-4">
        <select id="select-birth-year" onchange="adjustBirthDays('select-birth')" class="p-2.5 border dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-bold focus:outline-none"></select>
        <select id="select-birth-month" onchange="adjustBirthDays('select-birth')" class="p-2.5 border dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-bold focus:outline-none"></select>
        <select id="select-birth-day" class="p-2.5 border dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-bold focus:outline-none"></select>
      </div>
      <button onclick="saveBirthdate()" class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition">開始解析命盤</button>
    </div>

    <!-- 九星氣學診斷結果彈窗 -->
    <div id="modal-kyusei-result" class="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-sm text-center shadow-2xl hidden">
      <div class="text-4xl mb-2">🔮</div>
      <h2 class="text-lg font-bold text-slate-800 dark:text-white mb-3">九星氣學本命診斷</h2>
      <div class="p-4 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 rounded-xl mb-4 space-y-2 text-left">
        <div class="text-sm font-extrabold text-indigo-900 dark:text-indigo-200" id="kyusei-star-name">根據九星氣學 您屬於：三碧木星</div>
        <div class="text-xs font-bold text-indigo-700 dark:text-indigo-300" id="kyusei-element-name">對應五行：木</div>
        <div class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pt-1 border-t border-indigo-100 dark:border-indigo-900" id="kyusei-traits">特質：萌芽、雷鳴、衝勁、活力</div>
      </div>
      <button onclick="confirmKyuseiResult()" class="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition">
        展開今日美食冒險！
      </button>
    </div>

    <!-- 引導模式教學彈窗 -->
    <div id="modal-onboarding-guide" class="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-sm text-center shadow-2xl hidden z-50">
      <div class="text-4xl mb-2">🍱</div>
      <h2 class="text-lg font-bold text-slate-800 dark:text-white mb-3">新手探索指南</h2>
      <div class="p-4 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-xl mb-4 text-slate-700 dark:text-slate-200 text-xs leading-relaxed font-medium">
        這裡面有出現你想吃的東西嗎？<br>如果沒有的話，按一下<strong class="text-amber-600 dark:text-amber-400">隨機抽選按鈕</strong>再抽一次喔！
      </div>
      <button onclick="finishOnboardingGuide()" class="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition">
        我知道了，開始抽選！
      </button>
    </div>

    <!-- 升級慶祝彈窗 -->
    <div id="modal-levelup" class="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-sm text-center shadow-2xl hidden">
      <div class="text-4xl mb-2">⭐</div>
      <h2 class="text-xl font-bold text-slate-800 dark:text-white mb-2" id="levelup-title">升至 Lv.2！</h2>
      <p id="levelup-desc" class="text-slate-600 dark:text-slate-300 font-medium mb-2"></p>
      <div id="levelup-dislike-tip" class="bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 p-3 rounded-xl mb-4 leading-snug hidden">
        <div class="text-xs font-bold text-amber-800 dark:text-amber-200 mb-1">被討厭的食物會降低出現機率</div>
        <div class="text-[11px] text-amber-700 dark:text-amber-400">但它還是有可能會出現🤷</div>
      </div>
      <button onclick="closeLevelUpModal()" class="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition">
        耶! 我越來越會吃了!
      </button>
    </div>

    <!-- 頭銜更換 Modal -->
    <div id="modal-title" class="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-sm shadow-2xl hidden text-left">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-bold text-slate-800 dark:text-white">🏷️ 選擇您的旅人頭銜</h2>
        <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600">✕</button>
      </div>
      <p class="text-xs text-slate-500 dark:text-slate-400 mb-3">選擇喜愛的頭銜（系統將自動搭配當前時段）：</p>
      <div id="title-options-list" class="space-y-2 mb-4 text-xs font-medium"></div>
      <button onclick="closeModal()" class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition text-sm">確認</button>
    </div>

    <!-- 冒險者公會 Modal -->
    <div id="modal-guild-list" class="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-sm shadow-2xl hidden text-left">
      <div class="flex justify-between items-center mb-3">
        <h2 class="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-1.5">🛡️ 冒險者公會佈告欄</h2>
        <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600">✕</button>
      </div>
      <p id="guild-modal-subtext" class="text-xs text-slate-500 dark:text-slate-400 mb-3">選擇一項副本任務進行挑戰：</p>
      <div id="guild-quest-list-container" class="space-y-2.5 mb-4"></div>
      <div class="space-y-2">
        <button id="btn-abandon-quest" onclick="abandonQuest()" class="w-full py-2 bg-rose-100 hover:bg-rose-200 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 font-bold rounded-xl transition text-xs hidden">
          🗑️ 放棄當前任務
        </button>
        <button onclick="closeModal()" class="w-full py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition text-sm">關閉</button>
      </div>
    </div>

    <!-- 冒險者公會：接受任務 Modal -->
    <div id="modal-guild-accept" class="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-sm text-center shadow-2xl hidden">
      <div class="text-3xl mb-2" id="accept-quest-icon">❄️</div>
      <h2 class="text-lg font-bold text-slate-800 dark:text-white mb-1" id="accept-quest-title">是否接受：凜冬陣地？</h2>
      <p class="text-xs text-slate-500 dark:text-slate-400 mb-3" id="accept-quest-desc">完成後將獲取極寒靈氣！</p>
      <div class="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-slate-600 dark:text-slate-300 mb-4 text-left space-y-1">
        <div>📌 <strong>任務目標</strong>：選取任務食物 3 次</div>
        <div>⚡ <strong>特殊規則</strong>：需在額外經驗值「未冷卻」時選取才計入進度！</div>
        <div class="text-amber-600 dark:text-amber-400 font-bold mt-1">⚠️ 接受任務期間將自動關閉並禁用靈氣！</div>
      </div>
      <div class="space-y-2">
        <button onclick="confirmAcceptQuest()" class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition text-sm">接受任務</button>
        <button onclick="openGuildModal()" class="w-full py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition text-sm">返回</button>
      </div>
    </div>

    <!-- 冒險者公會：任務完成 Modal -->
    <div id="modal-guild-complete" class="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-sm text-center shadow-2xl hidden">
      <div class="text-4xl mb-2">🎉</div>
      <h2 class="text-xl font-bold text-slate-800 dark:text-white mb-2">副本任務大成功！</h2>
      <p class="text-xs text-slate-600 dark:text-slate-300 font-medium mb-3" id="complete-reward-text">恭喜完成挑戰，解鎖了稀有靈氣！</p>
      <div class="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl text-amber-700 dark:text-amber-300 text-xs font-bold mb-4">
        ✨ 解鎖新能力：可在上方開啟靈氣開關！
      </div>
      <button onclick="claimQuestReward()" class="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-lg transition">領取靈氣獎勵</button>
    </div>

    <!-- 食物確認 Modal -->
    <div id="modal-confirm-step1" class="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-sm text-center shadow-2xl hidden">
      <h2 class="text-lg font-bold text-slate-800 dark:text-white mb-2" id="confirm-title">確定要吃 XXX 嗎？</h2>
      <div id="confirm-element-bonus-hint" class="mb-3 p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl text-amber-800 dark:text-amber-300 text-xs font-bold leading-relaxed hidden">
        🔥 食物屬性符合今日開運建議！確認選擇可額外獲得 +5 經驗值！
      </div>
      <div class="space-y-3">
        <div>
          <button id="btn-confirm-only" class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition">確定</button>
          <div id="hint-exp-confirm" class="text-xs font-bold text-amber-600 dark:text-amber-400 mt-1.5">（確定選擇可獲得 +5 經驗值）</div>
        </div>
        <div>
          <button id="btn-confirm-map" class="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition">確定 + 地圖搜尋</button>
          <div id="hint-exp-map" class="text-xs font-bold text-amber-600 dark:text-amber-400 mt-1.5">（確定選擇可獲得 +5 經驗值）</div>
        </div>
        <button onclick="closeModal()" class="w-full py-2.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition">算了換一個</button>
      </div>
    </div>

    <!-- 成功祝賀 Modal -->
    <div id="modal-confirm-step2" class="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-sm text-center shadow-2xl hidden">
      <div class="text-4xl mb-2">🎉</div>
      <h2 class="text-xl font-bold text-slate-800 dark:text-white mb-2">可喜可賀！</h2>
      <p id="congrat-text" class="text-slate-600 dark:text-slate-300 font-medium mb-2">今天就吃 XXX 吧！</p>
      <div id="exp-reward-box" class="mb-4 p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl text-amber-700 dark:text-amber-300 text-xs font-bold leading-relaxed">
        ✨ 經驗值 +5
      </div>
      <button id="btn-final-action" class="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition">耶！</button>
    </div>

    <!-- 提示未成為正式版的彈窗 (禁用按鈕點擊用) -->
    <div id="modal-vip-required" class="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-sm text-center shadow-2xl hidden">
      <div class="text-4xl mb-2">🔒</div>
      <h2 class="text-lg font-bold text-slate-800 dark:text-white mb-2">需要解鎖正式版</h2>
      <p class="text-xs text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
        永久封禁食物功能為<strong class="text-amber-600 dark:text-amber-400">正式版 (VIP)</strong> 專屬特權！升級正式版即可徹底將討厭的食物從抽取池中永久移除。
      </p>
      <div class="space-y-2">
        <button onclick="closeModal(); openVipStoreModal();" class="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition text-sm shadow-md">
          ⭐ 查看正式版說明與升級
        </button>
        <button onclick="closeModal()" class="w-full py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition text-xs">
          我知道了
        </button>
      </div>
    </div>

    <!-- 正式版 (VIP) 功能說明與購買確認 Modal -->
    <div id="modal-vip-store" class="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-sm shadow-2xl hidden text-left">
      <div class="flex justify-between items-center mb-3">
        <h2 class="text-lg font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
          ⭐ 升級正式版 (VIP 尊榮特權)
        </h2>
        <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600">✕</button>
      </div>
      <p class="text-xs text-slate-500 dark:text-slate-400 mb-4">一次解鎖，享受最純粹的美食決策體驗：</p>
      <div class="space-y-3 mb-5 text-xs">
        <div class="flex items-start gap-2.5 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900">
          <span class="text-base shrink-0">🚫</span>
          <div>
            <div class="font-bold text-amber-900 dark:text-amber-200">永久封禁討厭食物</div>
            <div class="text-[11px] text-amber-700 dark:text-amber-400">點擊禁用按鈕可徹底從抽取池過濾，100% 不再出現！</div>
          </div>
        </div>
        <div class="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <span class="text-base shrink-0">🎬</span>
          <div>
            <div class="font-bold text-slate-800 dark:text-white">無須看廣告直接補充水晶</div>
            <div class="text-[11px] text-slate-500 dark:text-slate-400">告別廣告與次數限制，隨時保持充足水晶刷新盲盒與冷知識。</div>
          </div>
        </div>
      </div>
      <div class="space-y-2">
        <button onclick="confirmBuyVIP()" class="w-full py-3 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-extrabold rounded-xl shadow-lg transition text-sm flex justify-center items-center gap-1">
          <span>確定購買正式版 (直接開通測試)</span>
        </button>
        <button onclick="closeModal()" class="w-full py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition text-xs">
          取消
        </button>
      </div>
    </div>

    <!-- 設定面板 Modal -->
    <div id="modal-settings" class="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-sm shadow-2xl hidden text-left">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-bold text-slate-800 dark:text-white">⚙️ 系統設定</h2>
        <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600">✕</button>
      </div>
      <div class="space-y-4 text-sm max-h-[70vh] overflow-y-auto pr-1">
        <!-- 佈景主題選單 (新增冬天風格) -->
        <div id="setting-theme-wrapper" class="opacity-50">
          <div class="flex justify-between items-center mb-1">
            <span class="text-slate-700 dark:text-slate-300 font-medium">🎨 佈景主題：</span>
            <span id="lock-theme" class="text-[10px] text-amber-500">(🔒 Lv.3 解鎖)</span>
          </div>
          <select id="setting-theme-select" onchange="changeTheme(this.value)" class="w-full p-2 border dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-bold focus:outline-none" disabled>
            <option value="default">☀️ 預設風格 (Default)</option>
            <option value="dark">🌙 深色模式 (Dark Mode)</option>
            <option value="night-sakura">🌸 夜櫻風格 (Night Sakura)</option>
            <option value="spring">🌿 春天風格 (Spring Meadow)</option>
            <option value="summer">🌊 夏天風格 (Summer Ocean)</option>
            <option value="autumn">🍁 秋天風格 (Autumn Maple)</option>
            <option value="winter">❄️ 冬天風格 (Winter Ice)</option>
          </select>
        </div>

        <!-- 忌食名單設定 -->
        <div>
          <span class="text-slate-700 dark:text-slate-300 block mb-1 font-medium">🚫 忌食設定：</span>
          <div class="grid grid-cols-2 gap-2 text-xs">
            <label class="flex items-center gap-1.5"><input type="checkbox" value="beef" class="meat-taboo accent-indigo-600"> 忌吃牛肉 (beef)</label>
            <label class="flex items-center gap-1.5"><input type="checkbox" value="pork" class="meat-taboo accent-indigo-600"> 忌吃豬肉 (pork)</label>
            <label class="flex items-center gap-1.5"><input type="checkbox" value="mutton" class="meat-taboo accent-indigo-600"> 忌吃羊肉 (mutton)</label>
            <label class="flex items-center gap-1.5"><input type="checkbox" value="shrimp" class="meat-taboo accent-indigo-600"> 忌吃蝦子 (shrimp)</label>
            <label class="flex items-center gap-1.5"><input type="checkbox" value="crab" class="meat-taboo accent-indigo-600"> 忌吃螃蟹 (crab)</label>
          </div>
        </div>

        <div>
          <span class="text-slate-700 dark:text-slate-300 block mb-1 font-medium">🎂 出生年月日 (連動九星氣學)：</span>
          <div class="grid grid-cols-3 gap-2">
            <select id="select-setting-year" onchange="adjustBirthDays('select-setting')" class="p-2 border dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-xs font-bold focus:outline-none"></select>
            <select id="select-setting-month" onchange="adjustBirthDays('select-setting')" class="p-2 border dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-xs font-bold focus:outline-none"></select>
            <select id="select-setting-day" class="p-2 border dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-xs font-bold focus:outline-none"></select>
          </div>
        </div>

        <div class="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3">
          <div class="flex justify-between items-center">
            <span class="text-slate-700 dark:text-slate-300">顯示食物冷知識</span>
            <input type="checkbox" id="setting-push-trivia" onchange="toggleTriviaBox(this.checked)" class="w-4 h-4 accent-indigo-600">
          </div>
        </div>

        <div class="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <button onclick="openVipStoreModal()" class="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition text-xs shadow">⭐ 正式版</button>
          <button onclick="resetCooldownForTest()" class="w-full py-2 bg-indigo-100 dark:bg-indigo-950/60 hover:bg-indigo-200 text-indigo-700 dark:text-indigo-300 font-bold rounded-xl transition text-xs">⚡ [測試] 歸零額外經驗值冷卻</button>
          <button onclick="clearLocalStorage()" class="w-full py-2 bg-rose-100 hover:bg-rose-200 text-rose-600 font-bold rounded-xl transition text-xs">🗑️ [測試] 清空 LocalStorage</button>
        </div>
      </div>
      <button onclick="saveSettings()" class="w-full mt-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition text-sm">儲存設定</button>
    </div>

    <!-- 統計數據 Modal（討厭與禁用名單皆包含搜尋框與滾動視窗） -->
    <div id="modal-stats" class="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-sm shadow-2xl hidden text-left">
      <div class="flex justify-between items-center mb-3">
        <h2 class="text-lg font-bold text-slate-800 dark:text-white">📊 數據統計中心</h2>
        <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600">✕</button>
      </div>

      <div class="space-y-4 max-h-[70vh] overflow-y-auto pr-1 text-xs custom-scroll">
        <div>
          <h3 class="font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">🕒 近期選擇過的食物 (近 5 筆)</h3>
          <div id="stats-recent-list" class="space-y-1 text-slate-600 dark:text-slate-400"></div>
        </div>

        <div class="border-t border-slate-100 dark:border-slate-800 pt-3">
          <h3 class="font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">🏆 美食選擇排行榜 (前 10 名)</h3>
          <div id="stats-ranking-list" class="space-y-1 text-slate-600 dark:text-slate-400"></div>
        </div>

        <!-- 👎 討厭的食物名單（含即時搜尋與卷軸視窗） -->
        <div class="border-t border-slate-100 dark:border-slate-800 pt-3">
          <button onclick="toggleDislikeSection()" class="w-full py-2 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition flex justify-between items-center text-xs">
            <span id="dislike-toggle-label">👎 討厭的食物名單</span>
            <span id="dislike-toggle-arrow">▼</span>
          </button>
          
          <div id="stats-dislike-container" class="mt-2 space-y-2 hidden">
            <!-- 搜尋框 -->
            <input type="text" id="search-dislike-input" oninput="renderStatsDislikes()" placeholder="🔍 搜尋討厭的食物..." class="w-full p-2 text-xs rounded-lg border dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500">
            <!-- 可拖拉卷軸視窗 -->
            <div id="stats-dislike-list" class="max-h-48 overflow-y-auto space-y-1.5 pr-1 custom-scroll"></div>
          </div>
        </div>

        <!-- ⛔ 完全禁用的食物 (正式版 - 含即時搜尋與卷軸視窗) -->
        <div class="border-t border-slate-100 dark:border-slate-800 pt-3">
          <div class="flex justify-between items-center mb-1">
            <h3 class="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">⛔ 完全禁用的食物 (正式版)</h3>
            <span id="vip-status-badge" class="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400 font-medium">免費版</span>
          </div>
          
          <div id="stats-banned-wrapper" class="space-y-2 mt-2">
            <!-- 搜尋框 -->
            <input type="text" id="search-banned-input" oninput="renderStatsBanned()" placeholder="🔍 搜尋禁用的食物..." class="w-full p-2 text-xs rounded-lg border dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 hidden">
            <!-- 可拖拉卷軸視窗 -->
            <div id="stats-banned-list" class="max-h-48 overflow-y-auto space-y-1.5 pr-1 custom-scroll"></div>
          </div>
        </div>
      </div>
    </div>

  </div>

  <script src="app.js"></script>
</body>
</html>

```

---

### 💻 2. 完整的 `app.js`

```javascript
let allFoods = [];
let allTrivias = [];

let userExp = parseInt(localStorage.getItem('user_exp') || '0');
let userLevel = parseInt(localStorage.getItem('user_level') || '1');
let lastEatTime = parseInt(localStorage.getItem('last_eat_time') || '0');
let userSelectedTitle = localStorage.getItem('user_title') || '迷途旅人';

let userLikes = JSON.parse(localStorage.getItem('user_likes') || '[]');
let userDislikes = JSON.parse(localStorage.getItem('user_dislikes') || '[]');
let userBanned = JSON.parse(localStorage.getItem('user_banned') || '[]');
let foodHistory = JSON.parse(localStorage.getItem('food_history') || '[]');
let foodCounts = JSON.parse(localStorage.getItem('food_counts') || '{}');

let userTaboos = JSON.parse(localStorage.getItem('user_taboos') || '[]');
let isVIP = localStorage.getItem('is_vip') === 'true';
let userBirth = JSON.parse(localStorage.getItem('user_birth') || 'null');
let settingsPushTrivia = localStorage.getItem('push_trivia') !== 'false';
let currentTheme = localStorage.getItem('app_theme') || 'default';

let guildQuest = JSON.parse(localStorage.getItem('guild_quest') || 'null'); 
let unlockedAuras = JSON.parse(localStorage.getItem('unlocked_auras') || '[]'); 
let activeAura = localStorage.getItem('active_aura') || null; 
let tempSelectedQuestType = null;
let auraToastTimer = null;

let hasTriggeredAutoRefreshThisCycle = false; 
let currentDisplayedFoods = JSON.parse(localStorage.getItem('current_displayed_foods') || '[]');

const MAX_DRAW = 20;
let drawState = JSON.parse(localStorage.getItem('draw_state') || JSON.stringify({ count: MAX_DRAW, timestamp: Date.now() }));
if (drawState.count > MAX_DRAW) drawState.count = MAX_DRAW;

let currentTriviaIndex = -1;
let selectedFoodForConfirm = null;
let pendingCongratModalData = null;

const ONLINE_FOODS_URL = 'https://shinakasun.github.io/foodWhatDataBase/foods.json';
const ONLINE_TRIVIAS_URL = 'https://shinakasun.github.io/foodWhatDataBase/trivias.json';

const ELEMENT_MAP = {
  elementMetal: { name: '金', icon: '🪙', class: 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-800' },
  elementWood:  { name: '木', icon: '🪵', class: 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800' },
  elementWater: { name: '水', icon: '💧', class: 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-800' },
  elementFire:  { name: '火', icon: '🔥', class: 'text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:border-rose-800' },
  elementEarth: { name: '土', icon: '⛰️', class: 'text-yellow-700 bg-yellow-50 border-yellow-200 dark:bg-yellow-950/40 dark:border-yellow-800' }
};

const KYUSEI_DATA = {
  1: { star: '一白水星', elementKey: 'elementWater', name: '水', traits: '柔軟、流動、沉靜、適應力強' },
  2: { star: '二黑土星', elementKey: 'elementEarth', name: '土', traits: '包容、大地、穩重、滋養' },
  3: { star: '三碧木星', elementKey: 'elementWood',  name: '木', traits: '萌芽、雷鳴、衝勁、活力' },
  4: { star: '四綠木星', elementKey: 'elementWood',  name: '木', traits: '風吹、柔順、人緣、調和' },
  5: { star: '五黃土星', elementKey: 'elementEarth', name: '土', traits: '帝王、核心、重組、強大' },
  6: { star: '六白金星', elementKey: 'elementMetal', name: '金', traits: '堅硬、天道、完美、領導' },
  7: { star: '七赤金星', elementKey: 'elementMetal', name: '金', traits: '喜悅、澤水、社交、美食' },
  8: { star: '八白土星', elementKey: 'elementEarth', name: '土', traits: '高山、停止、變革、轉折' },
  9: { star: '九紫火星', elementKey: 'elementFire',  name: '火', traits: '熱情、光明、智慧、華麗' }
};

function calculateKyusei(year, month, day) {
  let calcYear = year;
  if (month < 2 || (month === 2 && day < 4)) calcYear = year - 1;
  let sum = String(calcYear).split('').reduce((acc, num) => acc + parseInt(num), 0);
  while (sum >= 10) sum = String(sum).split('').reduce((acc, num) => acc + parseInt(num), 0);
  let starNum = (calcYear <= 1999) ? (11 - sum) : (10 - sum);
  while (starNum <= 0) starNum += 9;
  while (starNum > 9) starNum -= 9;
  return KYUSEI_DATA[starNum] || KYUSEI_DATA[3];
}

function buildElementBadge(elementKey) {
  const elem = ELEMENT_MAP[elementKey] || { name: '屬性', icon: '✨', class: 'bg-indigo-100 text-indigo-800' };
  return `<span class="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] font-bold border ${elem.class}">${elem.icon} ${elem.name}屬性</span>`;
}

const FORTUNE_SPELLS = {
  elementMetal: {
    0: { relation: '生我 (相生)', text: '「土能生金，今日坤土滋養乾金，積厚成勢，食 TARGET_BADGE 食物如土培珍寶，財源滾滾！」', target: 'elementEarth' },
    1: { relation: '同我 (旺本)', text: '「今日乾金氣場剛健，同氣相求，食 TARGET_BADGE 食物強化本命，無堅不摧、威震八方！」', target: 'elementMetal' },
    2: { relation: '我生 (洩秀)', text: '「金能生水，今日金溫水軟、靈感泉湧，食 TARGET_BADGE 食物抒發英銳，智謀大顯！」', target: 'elementWater' },
    3: { relation: '克我 (官鬼/挑戰)', text: '「今日烈火熔金、逢官鬼鍛造，食 TARGET_BADGE 食物化火生金、轉危為安！」', target: 'elementEarth' },
    4: { relation: '我克 (財星)', text: '「金能克木，今日金銳伐木、斬獲頗豐，食 TARGET_BADGE 食物如斧斤入林，收穫滿載！」', target: 'elementWood' }
  },
  elementWood: {
    0: { relation: '生我 (相生)', text: '「水能生木，今日甘霖潤澤本命，順勢而為，食 TARGET_BADGE 食物助生木氣，運勢水到渠成！」', target: 'elementWater' },
    1: { relation: '同我 (旺本)', text: '「今日木氣大旺，同氣相求，食 TARGET_BADGE 食物強化本命，參天立地、木秀於林！」', target: 'elementWood' },
    2: { relation: '我生 (洩秀)', text: '「木能生火，今日適逢木火通明之局，才華外露，食 TARGET_BADGE 食物抒發才智，大展鴻圖！」', target: 'elementFire' },
    3: { relation: '克我 (官鬼/挑戰)', text: '「今日金氣剋木，需以土培根、穩固陣腳，食 TARGET_BADGE 食物厚德載物以禦外敵！」', target: 'elementEarth' },
    4: { relation: '我克 (財星)', text: '「今日逢木克土之財星局，利於開闢新局，食 TARGET_BADGE 食物收斂成果、聚財納福！」', target: 'elementMetal' }
  },
  elementWater: {
    0: { relation: '生我 (相生)', text: '「金能生水，今日金天思真、源頭活水，食 TARGET_BADGE 食物源源不絕，運勢源遠流長！」', target: 'elementMetal' },
    1: { relation: '同我 (旺本)', text: '「今日百川匯海、水勢滔滔，食 TARGET_BADGE 食物融合本命，上善若水、無往不利！」', target: 'elementWater' },
    2: { relation: '我生 (洩秀)', text: '「水能生木，今日水潤木榮、萬物萌發，食 TARGET_BADGE 食物條達氣機，生機勃勃！」', target: 'elementWood' },
    3: { relation: '克我 (官鬼/挑戰)', text: '「今日厚土禦水、逢貴人管束，食 TARGET_BADGE 食物溫暖寒凍、驅散陰霾、逢凶化吉！」', target: 'elementFire' },
    4: { relation: '我克 (財星)', text: '「水能克火，今日水火相濟、財星入命，食 TARGET_BADGE 食物招財進寶、紅紅火火！」', target: 'elementFire' }
  },
  elementFire: {
    0: { relation: '生我 (相生)', text: '「木能生火，今日薪火相傳、勢不可擋，食 TARGET_BADGE 食物添磚加柴，事業扶搖直上！」', target: 'elementWood' },
    1: { relation: '同我 (旺本)', text: '「今日烈火燎原、赫赫炎炎，食 TARGET_BADGE 食物激發熱情，光明磊落、氣貫長虹！」', target: 'elementFire' },
    2: { relation: '我生 (洩秀)', text: '「火能生土，今日火結成土、化為萬物，食 TARGET_BADGE 食物沉澱智慧，成果結實纍纍！」', target: 'elementEarth' },
    3: { relation: '克我 (官鬼/挑戰)', text: '「今日水來克火、需木來通關，食 TARGET_BADGE 食物化水為木、轉禍為福！」', target: 'elementWood' },
    4: { relation: '我克 (財星)', text: '「火能克金，今日烈火煉金、熔鑄萬物，食 TARGET_BADGE 食物精煉財源，金玉滿堂！」', target: 'elementMetal' }
  },
  elementEarth: {
    0: { relation: '生我 (相生)', text: '「火能生土，今日丹鳳朝陽、溫養大地，食 TARGET_BADGE 食物注入能量，厚積薄發！」', target: 'elementFire' },
    1: { relation: '同我 (旺本)', text: '「今日重山複嶺、基業堅如磐石，食 TARGET_BADGE 食物穩固本命，安如泰山！」', target: 'elementEarth' },
    2: { relation: '我生 (洩秀)', text: '「土能生金，今日淘金於土、奇珍現世，食 TARGET_BADGE 食物彰顯價值，卓爾不群！」', target: 'elementMetal' },
    3: { relation: '克我 (官鬼/挑戰)', text: '「今日木來破土、需火來化解，食 TARGET_BADGE 食物焚木生土、轉危為安！」', target: 'elementFire' },
    4: { relation: '我克 (財星)', text: '「土能克水，今日築堤禦水、聚水為池，食 TARGET_BADGE 食物守住財庫，大富大貴！」', target: 'elementWater' }
  }
};

function getTodayFortuneAnalysis(userElementKey) {
  const today = new Date();
  const dayHash = (today.getFullYear() * 13 + (today.getMonth() + 1) * 31 + today.getDate()) % 5;
  const spell = (FORTUNE_SPELLS[userElementKey] || FORTUNE_SPELLS['elementWood'])[dayHash];
  return {
    relationLabel: spell.relation,
    targetElementKey: spell.target,
    text: spell.text.replace('TARGET_BADGE', buildElementBadge(spell.target))
  };
}

const LEVEL_UNLOCKS = [
  { level: 1, name: "初始狀態 (3選項)", expNeeded: 0, unlockDesc: "初始開局" },
  { level: 2, name: "解鎖第四選項", expNeeded: 5, unlockDesc: "第四個盲盒選項" },
  { level: 3, name: "解鎖主題與個人最愛", expNeeded: 12, unlockDesc: "👍 喜歡按鈕、⭐ 個人最愛區與主題風格切換" },
  { level: 4, name: "解鎖冒險者公會", expNeeded: 20, unlockDesc: "🛡️ 冒險者公會副本挑戰系統" },
  { level: 5, name: "解鎖統計按鈕", expNeeded: 30, unlockDesc: "📊 數據統計中心" },
  { level: 6, name: "解鎖美食冷知識", expNeeded: 42, unlockDesc: "💡 每日美食冷知識區" },
  { level: 7, name: "解鎖第五選項", expNeeded: 56, unlockDesc: "第五個盲盒選項" },
  { level: 8, name: "解鎖討厭按鈕", expNeeded: 72, unlockDesc: "👎 討厭按鈕與黑名單" },
  { level: 9, name: "解鎖第六選項", expNeeded: 90, unlockDesc: "第六個盲盒選項" },
  { level: 10, name: "解鎖第七選項", expNeeded: 110, unlockDesc: "第七個盲盒選項" },
  { level: 11, name: "解鎖第八選項", expNeeded: 135, unlockDesc: "第八個盲盒選項" },
  { level: 12, name: "解鎖第九選項", expNeeded: 165, unlockDesc: "第九個盲盒選項 (完全體)" },
  { level: 13, name: "解鎖高等冒險", expNeeded: 200, unlockDesc: "🥗 冒險者精通" }
];

function getNextOptionUnlockRequirement() {
  if (userLevel === 1) return { nextCount: 4, reqLevel: 2 };
  if (userLevel === 6) return { nextCount: 5, reqLevel: 7 };
  if (userLevel === 8) return { nextCount: 6, reqLevel: 9 };
  if (userLevel === 9) return { nextCount: 7, reqLevel: 10 };
  if (userLevel === 10) return { nextCount: 8, reqLevel: 11 };
  if (userLevel === 11) return { nextCount: 9, reqLevel: 12 };
  return null;
}

async function initApp() {
  changeTheme(currentTheme);
  setupEventListeners();
  initDateSelectors('select-birth');
  initDateSelectors('select-setting');

  await Promise.all([fetchFoods(), fetchTrivias()]);
  checkAndUpdateCooldown();
  updateLevelAndUI(false);
  updateMainTitle();

  if (!userBirth) {
    showBirthModal();
  } else {
    updateFortuneText();
    filterAndDraw(false);
  }
  setInterval(updateCountersAndTimer, 1000);
}

function getMealFullPrefix() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 11) return "早餐";
  else if (hour >= 11 && hour < 16) return "午餐";
  else if (hour >= 16 && hour < 23) return "晚餐";
  else return "宵夜";
}

function updateMainTitle() {
  const titleEl = document.getElementById('app-main-title');
  if (!titleEl) return;
  if (!userBirth) {
    titleEl.innerHTML = `<span>歡迎您！</span><br><span class="text-indigo-600 dark:text-indigo-400">食物迷途旅人 ▼</span>`;
  } else {
    titleEl.innerHTML = `<span>歡迎回來</span><br><span class="text-indigo-600 dark:text-indigo-400">${getMealFullPrefix()}${userSelectedTitle} ▼</span>`;
  }
}

window.openTitleModal = function() {
  const listEl = document.getElementById('title-options-list');
  const mealFull = getMealFullPrefix();
  const baseTitles = ["迷途旅人", "愛好者", "尋覓者"];
  listEl.innerHTML = baseTitles.map(t => {
    const isSelected = userSelectedTitle === t;
    return `
      <div onclick="selectTitle('${t}')" class="p-2.5 rounded-xl border cursor-pointer flex justify-between items-center transition ${
        isSelected ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-700 dark:text-indigo-300 font-bold' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
      }">
        <span>${mealFull}${t}</span>
        ${isSelected ? '<span class="text-indigo-600">✓</span>' : ''}
      </div>
    `;
  }).join('');
  document.getElementById('modal-overlay').classList.remove('hidden');
  document.getElementById('modal-title').classList.remove('hidden');
};

window.selectTitle = function(title) {
  userSelectedTitle = title;
  localStorage.setItem('user_title', title);
  updateMainTitle();
  closeModal();
};

function initDateSelectors(prefix) {
  const yearSel = document.getElementById(`${prefix}-year`);
  const monthSel = document.getElementById(`${prefix}-month`);
  const daySel = document.getElementById(`${prefix}-day`);
  if (!yearSel || !monthSel || !daySel) return;

  const currentYear = new Date().getFullYear();
  yearSel.innerHTML = '';
  for (let y = currentYear; y >= 1920; y--) yearSel.add(new Option(`${y} 年`, y));
  yearSel.value = 1990;

  monthSel.innerHTML = '';
  for (let m = 1; m <= 12; m++) monthSel.add(new Option(`${m} 月`, m));
  monthSel.value = 1;

  adjustBirthDays(prefix);
}

window.adjustBirthDays = function(prefix) {
  const yearSel = document.getElementById(`${prefix}-year`);
  const monthSel = document.getElementById(`${prefix}-month`);
  const daySel = document.getElementById(`${prefix}-day`);
  if (!yearSel || !monthSel || !daySel) return;

  const y = parseInt(yearSel.value) || 1990;
  const m = parseInt(monthSel.value) || 1;
  const savedDay = parseInt(daySel.value) || 1;
  const daysInMonth = new Date(y, m, 0).getDate();
  daySel.innerHTML = '';
  for (let d = 1; d <= daysInMonth; d++) daySel.add(new Option(`${d} 日`, d));
  daySel.value = Math.min(savedDay, daysInMonth);
};

function updateLevelAndUI(shouldCheckLevelUp = true) {
  let oldLevel = userLevel;
  let currentLv = 1;
  for (let i = LEVEL_UNLOCKS.length - 1; i >= 0; i--) {
    if (userExp >= LEVEL_UNLOCKS[i].expNeeded) {
      currentLv = LEVEL_UNLOCKS[i].level;
      break;
    }
  }
  userLevel = currentLv;
  localStorage.setItem('user_level', userLevel);

  if (shouldCheckLevelUp && userLevel > oldLevel) {
    const tier = LEVEL_UNLOCKS.find(l => l.level === userLevel);
    showLevelUpModal(userLevel, tier ? tier.unlockDesc : "新功能");
  }

  const currentTier = LEVEL_UNLOCKS.find(l => l.level === userLevel) || LEVEL_UNLOCKS[0];
  const nextTier = LEVEL_UNLOCKS.find(l => l.level === userLevel + 1);
  
  document.getElementById('user-level-badge').innerText = `Lv.${userLevel}`;
  const expText = document.getElementById('exp-text');
  const expBar = document.getElementById('exp-bar');
  const footerExpText = document.getElementById('footer-exp-text');
  const footerNextUnlock = document.getElementById('footer-next-unlock');
  const footerExpBar = document.getElementById('footer-exp-bar');

  if (nextTier) {
    const spanExp = nextTier.expNeeded - currentTier.expNeeded;
    const currentProgress = userExp - currentTier.expNeeded;
    const pct = Math.min(100, Math.max(0, (currentProgress / spanExp) * 100));
    expText.innerText = `經驗值: ${userExp} / ${nextTier.expNeeded}`;
    expBar.style.width = `${pct}%`;
    if (footerExpText) footerExpText.innerText = `目前進度: ${userExp} / ${nextTier.expNeeded}`;
    if (footerNextUnlock) footerNextUnlock.innerText = `下一解鎖: ${nextTier.name}`;
    if (footerExpBar) footerExpBar.style.width = `${pct}%`;
  } else {
    expText.innerText = `經驗值: ${userExp} (已滿級)`;
    expBar.style.width = `100%`;
    if (footerExpText) footerExpText.innerText = `經驗值: ${userExp} (已滿級)`;
    if (footerNextUnlock) footerNextUnlock.innerText = `已解鎖全部功能`;
    if (footerExpBar) footerExpBar.style.width = `100%`;
  }
  applyFeatureUnlocks();
}

function showLevelUpModal(lv, desc) {
  document.getElementById('levelup-title').innerText = `升至 Lv.${lv}！`;
  document.getElementById('levelup-desc').innerText = `🎉 恭喜解鎖了：${desc}！`;
  document.getElementById('levelup-dislike-tip').classList.toggle('hidden', lv !== 8);
  document.getElementById('modal-overlay').classList.remove('hidden');
  document.getElementById('modal-confirm-step2').classList.add('hidden');
  document.getElementById('modal-levelup').classList.remove('hidden');
}

window.closeLevelUpModal = function() {
  document.getElementById('modal-levelup').classList.add('hidden');
  if (pendingCongratModalData) {
    showCongratModal(pendingCongratModalData.foodName, pendingCongratModalData.expMsg, pendingCongratModalData.needMap);
    pendingCongratModalData = null;
  } else {
    closeModal();
  }
};

function applyFeatureUnlocks() {
  // 1. 正式版隱藏看廣告按鈕與計時器列
  const adRow = document.getElementById('ad-banner-row');
  if (adRow) {
    if (isVIP) adRow.classList.add('hidden');
    else adRow.classList.remove('hidden');
  }

  const triviaLocked = document.getElementById('trivia-locked-box');
  const triviaWrapper = document.getElementById('trivia-wrapper');
  if (userLevel >= 6 && settingsPushTrivia) {
    triviaLocked.classList.add('hidden');
    triviaWrapper.classList.remove('hidden');
    if (document.getElementById('trivia-content').innerText === '') renderRandomTrivia();
  } else if (userLevel === 5) {
    triviaLocked.classList.remove('hidden');
    triviaWrapper.classList.add('hidden');
  } else {
    triviaLocked.classList.add('hidden');
    triviaWrapper.classList.add('hidden');
  }

  const guildLocked = document.getElementById('guild-locked-box');
  const guildWrapper = document.getElementById('guild-wrapper');
  if (userLevel >= 4) {
    guildLocked.classList.add('hidden');
    guildWrapper.classList.remove('hidden');
    updateGuildBannerUI();
  } else if (userLevel === 3) {
    guildLocked.classList.remove('hidden');
    guildWrapper.classList.add('hidden');
  } else {
    guildLocked.classList.add('hidden');
    guildWrapper.classList.add('hidden');
  }

  const auraContainer = document.getElementById('aura-container');
  if (unlockedAuras.length > 0) {
    auraContainer.classList.remove('hidden');
    updateAuraButtonsUI();
  } else {
    auraContainer.classList.add('hidden');
  }

  const statBtn = document.getElementById('btn-stats-action');
  if (userLevel >= 5) {
    statBtn.classList.remove('hidden');
    statBtn.className = "flex flex-col items-center justify-center px-2 py-1 text-xs rounded-xl border transition bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-indigo-500 min-w-[42px]";
    statBtn.innerHTML = '<span class="text-sm">📊</span><span class="text-[10px] mt-0.5 leading-none">統計</span>';
  } else if (userLevel === 4) {
    statBtn.classList.remove('hidden');
    statBtn.className = "flex flex-col items-center justify-center px-2 py-1 text-xs rounded-xl border transition bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700 min-w-[42px]";
    statBtn.innerHTML = '<span class="text-sm">🔒</span><span class="text-[10px] mt-0.5 leading-none">統計</span>';
  } else {
    statBtn.classList.add('hidden');
  }

  const themeWrapper = document.getElementById('setting-theme-wrapper');
  const themeSelect = document.getElementById('setting-theme-select');
  const themeLocker = document.getElementById('lock-theme');
  if (userLevel >= 3) {
    themeWrapper.classList.remove('opacity-50');
    themeSelect.disabled = false;
    themeLocker.innerText = '';
  }

  const favWrapper = document.getElementById('favorite-section-wrapper');
  const favLabel = document.getElementById('favorite-label');
  const favLocked = document.getElementById('favorite-locked-box');
  if (userLevel >= 3) {
    favWrapper.classList.remove('hidden');
    favLabel.innerText = '⭐ 個人最愛精選';
    favLabel.className = 'text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1';
    if (favLocked) favLocked.classList.add('hidden');
  } else if (userLevel === 2) {
    favWrapper.classList.remove('hidden');
    favLabel.innerText = '❓ 個人最愛精選 (Lv.3 解鎖)';
    favLabel.className = 'text-xs font-bold text-slate-400 dark:text-slate-600 flex items-center gap-1';
    if (favLocked) favLocked.classList.remove('hidden');
  } else {
    favWrapper.classList.add('hidden');
  }
}

function updateGuildBannerUI() {
  const banner = document.getElementById('guild-banner');
  const titleEl = document.getElementById('guild-banner-title');
  const subEl = document.getElementById('guild-banner-sub');
  if (!guildQuest) {
    banner.className = "p-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-bold shadow-md cursor-pointer hover:opacity-95 transition flex justify-between items-center";
    titleEl.innerText = "冒險者公會";
    subEl.innerText = "點擊接取副本任務，贏取稀有靈氣！";
  } else {
    const questNames = { cold: '❄️ 凜冬陣地', hot: '🔥 灼熱地城', snack: '🍡 小惡魔城' };
    banner.className = "p-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white text-xs font-bold shadow-md cursor-pointer hover:opacity-95 transition flex justify-between items-center";
    titleEl.innerText = `⚔️ 進行中任務：${questNames[guildQuest.type]}`;
    subEl.innerText = `任務進度：${guildQuest.progress} / 3 (點擊查看詳情)`;
  }
}

window.handleGuildClick = function() {
  if (guildQuest && guildQuest.progress >= 3) openCompleteQuestModal();
  else openGuildModal();
};

window.openGuildModal = function() {
  const container = document.getElementById('guild-quest-list-container');
  const subtext = document.getElementById('guild-modal-subtext');
  const abandonBtn = document.getElementById('btn-abandon-quest');
  container.innerHTML = '';
  const remainingQuests = ['cold', 'hot', 'snack'].filter(t => !unlockedAuras.includes(t));

  if (guildQuest) {
    abandonBtn.classList.remove('hidden');
    subtext.innerText = "當前正在執行的副本任務：";
    const questNames = { cold: '❄️ 凜冬陣地', hot: '🔥 灼熱地城', snack: '🍡 小惡魔城' };
    container.innerHTML = `
      <div class="p-3.5 rounded-xl border-2 border-amber-500 bg-amber-50/70 dark:bg-amber-950/40">
        <div class="flex justify-between items-center mb-1">
          <div class="text-xs font-black text-amber-900 dark:text-amber-200">${questNames[guildQuest.type]}</div>
          <span class="text-xs font-bold text-amber-600">進度: ${guildQuest.progress} / 3</span>
        </div>
      </div>
    `;
  } else if (remainingQuests.length === 0) {
    abandonBtn.classList.add('hidden');
    subtext.innerText = "";
    container.innerHTML = `<div class="p-6 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center text-slate-500 my-2">暫時沒有新的任務</div>`;
  } else {
    abandonBtn.classList.add('hidden');
    subtext.innerText = "選擇一項副本任務進行挑戰：";
    [
      { type: 'cold', title: '❄️ 凜冬陣地', reward: '極寒靈氣', bgClass: 'border-blue-200 bg-blue-50/50 text-blue-900' },
      { type: 'hot', title: '🔥 灼熱地城', reward: '灼熱靈氣', bgClass: 'border-rose-200 bg-rose-50/50 text-rose-900' },
      { type: 'snack', title: '🍡 小惡魔城', reward: '迅捷靈氣', bgClass: 'border-amber-200 bg-amber-50/50 text-amber-900' }
    ].filter(q => !unlockedAuras.includes(q.type)).forEach(q => {
      container.innerHTML += `
        <div onclick="openAcceptQuestModal('${q.type}')" class="p-3 rounded-xl border ${q.bgClass} cursor-pointer transition flex justify-between items-center">
          <div>
            <div class="text-xs font-bold">${q.title}</div>
            <div class="text-[10px] opacity-80">任務獎勵：${q.reward}</div>
          </div>
          <span class="text-xs font-bold">接取 ▶</span>
        </div>
      `;
    });
  }
  document.getElementById('modal-overlay').classList.remove('hidden');
  document.getElementById('modal-guild-list').classList.remove('hidden');
  document.getElementById('modal-guild-accept').classList.add('hidden');
  document.getElementById('modal-guild-complete').classList.add('hidden');
};

window.abandonQuest = function() {
  if (confirm('確定要放棄當前的副本任務嗎？進度將會歸零。')) {
    guildQuest = null;
    localStorage.removeItem('guild_quest');
    updateGuildBannerUI();
    filterAndDraw(false);
    openGuildModal();
    showAuraToast("已放棄任務");
  }
};

window.openAcceptQuestModal = function(type) {
  tempSelectedQuestType = type;
  const icons = { cold: '❄️', hot: '🔥', snack: '🍡' };
  const names = { cold: '凜冬陣地', hot: '灼熱地城', snack: '小惡魔城' };
  const auras = { cold: '極寒靈氣', hot: '灼熱靈氣', snack: '迅捷靈氣' };
  document.getElementById('accept-quest-icon').innerText = icons[type];
  document.getElementById('accept-quest-title').innerText = `是否接受：${names[type]}？`;
  document.getElementById('accept-quest-desc').innerText = `完成後將獲取${auras[type]}！`;
  document.getElementById('modal-guild-list').classList.add('hidden');
  document.getElementById('modal-guild-accept').classList.remove('hidden');
};

window.confirmAcceptQuest = function() {
  if (!tempSelectedQuestType) return;
  guildQuest = { type: tempSelectedQuestType, progress: 0 };
  localStorage.setItem('guild_quest', JSON.stringify(guildQuest));
  activeAura = null;
  localStorage.setItem('active_aura', '');
  updateAuraButtonsUI();
  closeModal();
  updateGuildBannerUI();
  filterAndDraw(false);
  showAuraToast("成功接取任務！任務期間已自動關閉靈氣");
};

function openCompleteQuestModal() {
  const auras = { cold: '極寒靈氣', hot: '灼熱靈氣', snack: '迅捷靈氣' };
  document.getElementById('complete-reward-text').innerText = `恭喜完成挑戰，獲得了獎勵：${auras[guildQuest.type]}！`;
  document.getElementById('modal-overlay').classList.remove('hidden');
  document.getElementById('modal-guild-complete').classList.remove('hidden');
}

window.claimQuestReward = function() {
  if (!guildQuest) return;
  if (!unlockedAuras.includes(guildQuest.type)) {
    unlockedAuras.push(guildQuest.type);
    localStorage.setItem('unlocked_auras', JSON.stringify(unlockedAuras));
  }
  activeAura = null;
  localStorage.setItem('active_aura', '');
  guildQuest = null;
  localStorage.removeItem('guild_quest');
  closeModal();
  updateGuildBannerUI();
  applyFeatureUnlocks();
  filterAndDraw(false);
  showAuraToast(`🎉 成功領取獎勵：解鎖了新靈氣！`);
};

window.toggleAura = function(auraType) {
  if (!unlockedAuras.includes(auraType)) return;
  if (guildQuest) { showAuraToast("⚔️ 任務進行中無法開啟靈氣"); return; }
  activeAura = (activeAura === auraType) ? null : auraType;
  localStorage.setItem('active_aura', activeAura || '');
  updateAuraButtonsUI();
  if (activeAura) triggerAuraTextToast(auraType);
  else showAuraToast("靈氣已關閉");
};

function triggerAuraTextToast(type) {
  const texts = {
    cold: '極寒靈氣開啟<br>下一次隨機抽選只會出現清爽的食物囉！',
    hot: '灼熱靈氣開啟<br>下一次隨機抽選只會出現熱呼呼的食物囉！',
    snack: '迅捷靈氣開啟<br>下一次隨機抽選只會出現點心/輕食囉！'
  };
  showAuraToast(texts[type]);
}

function updateAuraButtonsUI() {
  ['cold', 'hot', 'snack'].forEach(t => {
    const btn = document.getElementById(`aura-btn-${t}`);
    if (!btn) return;
    const labels = { cold: '❄️ 極寒靈氣', hot: '🔥 灼熱靈氣', snack: '⚡ 迅捷靈氣' };
    if (!unlockedAuras.includes(t)) {
      btn.className = "px-2.5 py-1 text-[11px] rounded-lg border transition font-bold whitespace-nowrap bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 opacity-60";
      btn.innerText = `${labels[t]} (未解鎖)`;
    } else if (activeAura === t) {
      btn.className = "px-2.5 py-1 text-[11px] rounded-lg border transition font-bold whitespace-nowrap bg-indigo-600 text-white border-indigo-600 shadow-sm";
      btn.innerText = labels[t];
    } else {
      btn.className = "px-2.5 py-1 text-[11px] rounded-lg border transition font-bold whitespace-nowrap bg-white dark:bg-slate-900 text-indigo-600 border-indigo-200 hover:bg-indigo-50";
      btn.innerText = labels[t];
    }
  });
}

function showAuraToast(htmlContent) {
  const toast = document.getElementById('toast-aura-floating');
  if (!toast) return;
  if (auraToastTimer) clearTimeout(auraToastTimer);
  toast.innerHTML = htmlContent;
  toast.classList.remove('opacity-0', '-translate-y-2');
  toast.classList.add('opacity-100', '-translate-y-4');
  auraToastTimer = setTimeout(() => {
    toast.classList.remove('opacity-100', '-translate-y-4');
    toast.classList.add('opacity-0');
  }, 2000);
}

window.resetCooldownForTest = function() {
  lastEatTime = 0;
  localStorage.setItem('last_eat_time', '0');
  closeModal();
  updateCountersAndTimer();
  filterAndDraw(false);
  alert('⚡ [測試功能] 經驗值冷卻與冷知識倒數已成功歸零！');
};

window.checkFeatureLock = function(featureKey) {
  const reqLevels = { stats: 5, trivia: 6, guild: 4, favorite: 3, like: 3, dislike: 8 };
  const reqNames = { stats: "📊 數據統計中心 (Lv.5)", trivia: "💡 美食冷知識 (Lv.6)", guild: "🛡️ 冒險者公會 (Lv.4)", favorite: "⭐ 個人最愛精選 (Lv.3)", like: "👍 喜歡按鈕 (Lv.3)", dislike: "👎 討厭按鈕 (Lv.8)" };
  if (userLevel < (reqLevels[featureKey] || 1)) {
    alert(`🔒 此功能尚未解鎖！\n需要達到 【${reqNames[featureKey]}】 才能使用（目前 Lv.${userLevel}）。`);
  }
};

function getUnlockBoxCount() {
  if (userLevel >= 12) return 9;
  if (userLevel >= 11) return 8;
  if (userLevel >= 10) return 7;
  if (userLevel >= 9) return 6;
  if (userLevel >= 7) return 5;
  if (userLevel >= 2) return 4;
  return 3;
}

async function fetchFoods() {
  try {
    const res = await fetch(`${ONLINE_FOODS_URL}?t=${Date.now()}`);
    if (!res.ok) throw new Error('食物資料載入失敗');
    allFoods = await res.json();
  } catch (err) {
    document.getElementById('food-container').innerHTML = `<div class="text-center py-6 text-red-500 font-bold">無法連線至食物資料庫</div>`;
  }
}

async function fetchTrivias() {
  try {
    const res = await fetch(`${ONLINE_TRIVIAS_URL}?t=${Date.now()}`);
    if (!res.ok) return;
    allTrivias = await res.json();
    if (userLevel >= 6 && settingsPushTrivia) renderRandomTrivia();
  } catch (err) {}
}

function renderRandomTrivia() {
  if (userLevel < 6) return;
  const triviaWrapper = document.getElementById('trivia-wrapper');
  if (!settingsPushTrivia || allTrivias.length === 0) {
    triviaWrapper.classList.add('hidden');
    return;
  }
  let availableTrivias = allTrivias;
  if (currentTriviaIndex >= 0 && allTrivias.length > 1) {
    availableTrivias = allTrivias.filter((_, idx) => idx !== currentTriviaIndex);
  }
  const selectedTrivia = availableTrivias[Math.floor(Math.random() * availableTrivias.length)];
  currentTriviaIndex = allTrivias.indexOf(selectedTrivia);
  document.getElementById('trivia-content').innerText = selectedTrivia.content;
  triviaWrapper.classList.remove('hidden');
}

window.refreshTriviaWithCoin = function() {
  if (!isVIP && drawState.count <= 0) {
    alert('刷新水晶不足！可購買正式版享有無限水晶，或看廣告補充。');
    return;
  }
  if (!isVIP) {
    drawState.count--;
    saveState();
    showExpToast('toast-exp-floating');
  }
  renderRandomTrivia();
  updateCountersAndTimer();
};

function showExpToast(elementId) {
  const toast = document.getElementById(elementId);
  if (!toast) return;
  toast.classList.remove('opacity-0');
  toast.classList.add('-translate-y-3', 'opacity-100');
  setTimeout(() => {
    toast.classList.remove('-translate-y-3', 'opacity-100');
    toast.classList.add('opacity-0');
  }, 1000);
}

window.toggleTriviaBox = function(show) {
  if (userLevel < 6) { alert('🔒 美食冷知識區尚未解鎖！'); return; }
  settingsPushTrivia = show;
  localStorage.setItem('push_trivia', show);
  if (show) renderRandomTrivia();
  else document.getElementById('trivia-wrapper').classList.add('hidden');
};

function updateFortuneText() {
  if (!userBirth) return;
  const kyusei = calculateKyusei(userBirth.year, userBirth.month, userBirth.day);
  const fortune = getTodayFortuneAnalysis(kyusei.elementKey);
  document.getElementById('user-element-tag').innerText = `${kyusei.star} [${kyusei.name}]`;
  document.getElementById('user-relation-tag').innerText = fortune.relationLabel;
  document.getElementById('fortune-text').innerHTML = fortune.text;
}

function showBirthModal() {
  document.getElementById('modal-overlay').classList.remove('hidden');
  document.getElementById('modal-birth').classList.remove('hidden');
}

window.saveBirthdate = function() {
  const year = parseInt(document.getElementById('select-birth-year').value);
  const month = parseInt(document.getElementById('select-birth-month').value);
  const day = parseInt(document.getElementById('select-birth-day').value);
  if (!year || !month || !day) { alert('請完整選擇您的出生年月日！'); return; }

  userBirth = { year, month, day };
  localStorage.setItem('user_birth', JSON.stringify(userBirth));
  const kyusei = calculateKyusei(year, month, day);
  document.getElementById('kyusei-star-name').innerText = `根據九星氣學 您屬於：${kyusei.star}`;
  document.getElementById('kyusei-element-name').innerText = `對應五行：${kyusei.name}`;
  document.getElementById('kyusei-traits').innerText = `特質：${kyusei.traits}`;

  document.getElementById('modal-birth').classList.add('hidden');
  document.getElementById('modal-kyusei-result').classList.remove('hidden');
};

window.confirmKyuseiResult = function() {
  document.getElementById('modal-kyusei-result').classList.add('hidden');
  updateMainTitle();
  updateFortuneText();
  filterAndDraw(true);
  startOnboardingGuide();
};

function startOnboardingGuide() {
  document.getElementById('guide-overlay').classList.remove('hidden');
  document.getElementById('modal-onboarding-guide').classList.remove('hidden');
  document.getElementById('guide-target-food').className += ' relative z-50 bg-white dark:bg-slate-900 shadow-2xl ring-4 ring-indigo-500/50';
  document.getElementById('guide-target-button').className += ' relative z-50 bg-white dark:bg-slate-900 shadow-2xl ring-4 ring-indigo-500/50';
}

window.finishOnboardingGuide = function() {
  document.getElementById('guide-overlay').classList.add('hidden');
  document.getElementById('modal-onboarding-guide').classList.add('hidden');
  document.getElementById('modal-overlay').classList.add('hidden');
  document.getElementById('guide-target-food').className = 'rounded-2xl transition-all duration-300 p-1';
  document.getElementById('guide-target-button').className = 'relative mt-6 rounded-2xl transition-all duration-300 p-1';
};

window.openSettingsModal = function() {
  if (userBirth) {
    document.getElementById('select-setting-year').value = userBirth.year;
    document.getElementById('select-setting-month').value = userBirth.month;
    adjustBirthDays('select-setting');
    document.getElementById('select-setting-day').value = userBirth.day;
  }
  document.getElementById('setting-push-trivia').checked = settingsPushTrivia;
  document.getElementById('setting-theme-select').value = currentTheme;
  document.querySelectorAll('.meat-taboo').forEach(checkbox => {
    checkbox.checked = userTaboos.includes(checkbox.value);
  });
  document.getElementById('modal-overlay').classList.remove('hidden');
  document.getElementById('modal-settings').classList.remove('hidden');
};

window.saveSettings = function() {
  const year = parseInt(document.getElementById('select-setting-year').value);
  const month = parseInt(document.getElementById('select-setting-month').value);
  const day = parseInt(document.getElementById('select-setting-day').value);
  if (year && month && day) {
    userBirth = { year, month, day };
    localStorage.setItem('user_birth', JSON.stringify(userBirth));
  }
  userTaboos = [];
  document.querySelectorAll('.meat-taboo:checked').forEach(checkbox => userTaboos.push(checkbox.value));
  localStorage.setItem('user_taboos', JSON.stringify(userTaboos));
  closeModal();
  updateMainTitle();
  updateFortuneText();
};

window.openStatsModal = function() {
  if (userLevel < 5) { alert('🔒 統計中心尚未解鎖！需要達到 Lv.5。'); return; }
  renderStatsRecent();
  renderStatsRanking();
  renderStatsDislikes();
  renderStatsBanned();
  document.getElementById('modal-overlay').classList.remove('hidden');
  document.getElementById('modal-stats').classList.remove('hidden');
};

function renderStatsRecent() {
  const container = document.getElementById('stats-recent-list');
  if (foodHistory.length === 0) { container.innerHTML = '<p class="text-slate-400 italic py-2">尚未有選擇紀錄</p>'; return; }
  container.innerHTML = foodHistory.slice(-5).reverse().map(item => `
    <div class="flex justify-between items-center p-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg">
      <span class="font-medium text-slate-700 dark:text-slate-200">${item.name}</span>
      <span class="text-[10px] text-slate-400">${item.time}</span>
    </div>
  `).join('');
}

function renderStatsRanking() {
  const container = document.getElementById('stats-ranking-list');
  const sorted = Object.entries(foodCounts).map(([foodName, count]) => ({ foodName, count })).sort((a, b) => b.count - a.count).slice(0, 10);
  if (sorted.length === 0) { container.innerHTML = '<p class="text-slate-400 italic py-2">尚未產生排名數據</p>'; return; }
  container.innerHTML = sorted.map((item, index) => `
    <div class="flex justify-between items-center p-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg">
      <span class="font-medium text-slate-700 dark:text-slate-200">No.${index + 1} ${item.foodName}</span>
      <span class="text-[11px] font-bold text-amber-600">${item.count} 次</span>
    </div>
  `).join('');
}

// 👎 討厭的食物清單：支援實時搜尋與卷軸
function renderStatsDislikes() {
  document.getElementById('dislike-toggle-label').innerText = `👎 討厭的食物名單 (${userDislikes.length} 項)`;
  const container = document.getElementById('stats-dislike-list');
  const searchInput = document.getElementById('search-dislike-input');
  const query = searchInput ? searchInput.value.trim().toLowerCase() : '';

  let filtered = userDislikes;
  if (query) {
    filtered = userDislikes.filter(foodName => foodName.toLowerCase().includes(query));
  }

  if (userDislikes.length === 0) { 
    container.innerHTML = '<p class="text-slate-400 italic py-2">目前沒有被標記為 👎 討厭的食物</p>'; 
    return; 
  }

  if (filtered.length === 0) {
    container.innerHTML = '<p class="text-slate-400 italic py-2 text-center">找不到符合條件的討厭食物</p>';
    return;
  }

  container.innerHTML = filtered.map(foodName => `
    <div class="flex justify-between items-center p-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg">
      <span class="text-slate-700 dark:text-slate-200">${foodName}</span>
      <button onclick="unmarkDislike('${foodName}')" class="text-[11px] text-rose-500 border border-rose-200 px-2 py-0.5 rounded">解封</button>
    </div>
  `).join('');
}

window.toggleDislikeSection = function() {
  const container = document.getElementById('stats-dislike-container');
  const arrow = document.getElementById('dislike-toggle-arrow');
  container.classList.toggle('hidden');
  arrow.innerText = container.classList.contains('hidden') ? '▼' : '▲';
};

window.unmarkDislike = function(foodName) {
  userDislikes = userDislikes.filter(i => i !== foodName);
  localStorage.setItem('user_dislikes', JSON.stringify(userDislikes));
  renderStatsDislikes();
  filterAndDraw(false);
};

// ⛔ 正式版禁用食物清單：支援實時搜尋與卷軸
function renderStatsBanned() {
  const container = document.getElementById('stats-banned-list');
  const searchInput = document.getElementById('search-banned-input');
  const badge = document.getElementById('vip-status-badge');
  const query = searchInput ? searchInput.value.trim().toLowerCase() : '';

  if (isVIP) {
    badge.innerText = '⭐ 正式版已啟用';
    badge.className = 'text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 dark:text-amber-300 font-bold';
    if (searchInput) searchInput.classList.remove('hidden');
  } else {
    badge.innerText = '免費版 (未啟用)';
    badge.className = 'text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 font-medium';
    if (searchInput) searchInput.classList.add('hidden');
  }

  if (!isVIP) {
    container.innerHTML = `<div class="p-2.5 border border-amber-200 rounded-xl bg-amber-50 text-amber-800 text-[11px] text-center">🔒 升級正式版即可將食物完全禁用！</div>`;
    return;
  }

  let filtered = userBanned;
  if (query) {
    filtered = userBanned.filter(foodName => foodName.toLowerCase().includes(query));
  }

  if (userBanned.length === 0) { 
    container.innerHTML = '<p class="text-slate-400 italic py-2">目前沒有被完全禁用的食物</p>'; 
    return; 
  }

  if (filtered.length === 0) {
    container.innerHTML = '<p class="text-slate-400 italic py-2 text-center">找不到符合條件的禁用食物</p>';
    return;
  }

  container.innerHTML = filtered.map(foodName => `
    <div class="flex justify-between items-center p-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg">
      <span class="text-slate-700 dark:text-slate-200">${foodName}</span>
      <button onclick="unmarkBanned('${foodName}')" class="text-[11px] text-indigo-500 border border-indigo-200 px-2 py-0.5 rounded">解除禁用</button>
    </div>
  `).join('');
}

window.unmarkBanned = function(foodName) {
  userBanned = userBanned.filter(i => i !== foodName);
  localStorage.setItem('user_banned', JSON.stringify(userBanned));
  renderStatsBanned();
  filterAndDraw(false);
};

window.openVipStoreModal = function() {
  document.getElementById('modal-overlay').classList.remove('hidden');
  document.getElementById('modal-settings').classList.add('hidden');
  document.getElementById('modal-vip-store').classList.remove('hidden');
};

window.confirmBuyVIP = function() {
  isVIP = true;
  localStorage.setItem('is_vip', 'true');
  alert('🎉 恭喜您成功開通正式版！已解鎖無須看廣告補充水晶與完全禁用討厭食物功能。');
  closeModal();
  applyFeatureUnlocks();
  filterAndDraw(false);
};

window.changeTheme = function(themeName) {
  if (userLevel < 3 && themeName !== 'default') {
    alert('🔒 佈景主題切換尚未解鎖！需要達到 Lv.3。');
    document.getElementById('setting-theme-select').value = 'default';
    return;
  }
  currentTheme = themeName;
  localStorage.setItem('app_theme', themeName);
  const htmlRoot = document.getElementById('html-root');
  htmlRoot.className = `theme-${themeName}`;
  if (themeName === 'dark' || themeName === 'night-sakura') htmlRoot.classList.add('dark');
  else htmlRoot.classList.remove('dark');
};

window.clearLocalStorage = function() {
  if (confirm('確定要清空所有 LocalStorage 資料並重置 App 嗎？')) {
    localStorage.clear();
    location.reload();
  }
};

window.simulateWatchAd = function() {
  if (isVIP) {
    alert('⭐ 您已是正式版會員，享有無限水晶，無需觀看廣告！');
    return;
  }
  const btn = document.getElementById('btn-watch-ad');
  btn.disabled = true;
  btn.innerText = '⏳ 廣告播放中...';
  setTimeout(() => {
    drawState.count = Math.min(MAX_DRAW, drawState.count + 10);
    saveState();
    updateCountersAndTimer();
    btn.disabled = false;
    btn.innerText = '🎬 看廣告 +10 💎';
    alert('🎉 感謝觀看！刷新水晶已增加！');
  }, 2000);
};

function setupEventListeners() {
  const drawBtn = document.getElementById('draw-btn');
  if (drawBtn) {
    drawBtn.addEventListener('click', () => {
      if (!isVIP && drawState.count <= 0) {
        alert('刷新水晶不足！可購買正式版獲得無限水晶，或看廣告補充。');
        return;
      }
      if (!isVIP) {
        drawState.count--;
        saveState();
      }
      userExp += 1;
      localStorage.setItem('user_exp', userExp);
      updateLevelAndUI(true);
      filterAndDraw(true); 
      showExpToast('toast-draw-exp-floating');
    });
  }
  document.getElementById('btn-confirm-only').onclick = () => handleConfirm(false);
  document.getElementById('btn-confirm-map').onclick = () => handleConfirm(true);
}

function filterAndDraw(isDrawn = false) {
  if (allFoods.length === 0) return;
  const kyusei = userBirth ? calculateKyusei(userBirth.year, userBirth.month, userBirth.day) : KYUSEI_DATA[3];
  const fortune = getTodayFortuneAnalysis(kyusei.elementKey);

  if (isDrawn || currentDisplayedFoods.length === 0) {
    let pool = [...allFoods];
    if (userTaboos.length > 0) {
      pool = pool.filter(f => !f.tags || !userTaboos.some(taboo => f.tags.includes(taboo)));
    }
    // 過濾已完全禁用的食物
    pool = pool.filter(f => !userBanned.includes(f.id));

    if (activeAura) {
      pool = pool.filter(f => f.tags && f.tags.includes(activeAura));
    }
    currentDisplayedFoods = weightedSample(pool, getUnlockBoxCount(), fortune.targetElementKey);
    localStorage.setItem('current_displayed_foods', JSON.stringify(currentDisplayedFoods));
  }

  const favoriteOne = (userLevel >= 3) ? sampleFavorite() : null;
  renderMainUI(currentDisplayedFoods);
  renderFavoriteUI(favoriteOne);
  updateCountersAndTimer();
}

function weightedSample(list, k, targetElementKey) {
  let tempPool = [...list];
  let result = [];
  for (let i = 0; i < k; i++) {
    if (tempPool.length === 0) break;
    let totalWeight = tempPool.reduce((acc, item) => {
      let weight = userDislikes.includes(item.id) ? 0.2 : 1.0;
      if (item.element === targetElementKey) weight *= 2.0;
      return acc + weight;
    }, 0);
    let randomNum = Math.random() * totalWeight;
    let weightSum = 0;
    for (let j = 0; j < tempPool.length; j++) {
      let item = tempPool[j];
      let weight = userDislikes.includes(item.id) ? 0.2 : 1.0;
      if (item.element === targetElementKey) weight *= 2.0;
      weightSum += weight;
      if (randomNum <= weightSum) {
        result.push(item);
        tempPool.splice(j, 1);
        break;
      }
    }
  }
  return result;
}

function sampleFavorite() {
  if (userLevel < 3) return null;
  const likedFoods = allFoods.filter(f => userLikes.includes(f.id));
  if (likedFoods.length === 0) return null;
  return likedFoods[Math.floor(Math.random() * likedFoods.length)];
}

function renderMainUI(foods) {
  const container = document.getElementById('food-container');
  container.innerHTML = '';
  if (foods.length === 0) { container.innerHTML = '<p class="text-slate-400 text-center py-6">沒有符合條件的食物！</p>'; return; }

  foods.forEach((food, index) => {
    if (index === 0 && guildQuest && guildQuest.progress < 3) {
      container.appendChild(createGuildQuestCardHTML());
    }
    container.appendChild(createFoodCardHTML(food));
  });

  const nextReq = getNextOptionUnlockRequirement();
  if (nextReq) {
    const lockedCard = document.createElement('div');
    lockedCard.className = 'p-3 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl bg-slate-100/60 dark:bg-slate-800/40 text-slate-400 flex justify-between items-center text-xs font-bold cursor-pointer hover:bg-slate-200/50 transition';
    lockedCard.onclick = () => alert(`🔒 達到 Lv.${nextReq.reqLevel} 即可解鎖第 ${nextReq.nextCount} 個盲盒選項！`);
    lockedCard.innerHTML = `
      <div class="flex items-center gap-2">
        <span>🔒</span>
        <span>第 ${nextReq.nextCount} 個盲盒選項 (升至 Lv.${nextReq.reqLevel} 解鎖)</span>
      </div>
      <span class="text-[10px] bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded">鎖定中</span>
    `;
    container.appendChild(lockedCard);
  }
}

function createGuildQuestCardHTML() {
  const now = Date.now();
  const cooldownMs = 4 * 60 * 60 * 1000;
  const isCoolingDown = (now - lastEatTime < cooldownMs);
  const card = document.createElement('div');
  
  if (isCoolingDown) {
    card.className = 'p-3.5 border border-dashed border-amber-300 rounded-xl bg-amber-50/50 flex justify-between items-center opacity-75';
    card.innerHTML = `
      <div class="flex items-center gap-2">
        <span>⏳</span>
        <div class="font-bold text-sm text-amber-800">任務目標尋找中...</div>
      </div>
      <span class="text-[10px] font-bold text-amber-600 bg-amber-100 px-2.5 py-1 rounded">冷卻中</span>
    `;
  } else {
    const targetTag = guildQuest.type;
    const eligibleFoods = allFoods.filter(f => f.tags && f.tags.includes(targetTag));
    const targetFood = eligibleFoods.length > 0 ? eligibleFoods[Math.floor(Math.random() * eligibleFoods.length)] : { id: '神祕任務料理', element: 'elementMetal' };
    const foodName = targetFood.id;
    const safeId = btoa(encodeURIComponent("guild_" + foodName)).replace(/=/g, '');
    const elemInfo = ELEMENT_MAP[targetFood.element] || { name: '未知', icon: '❓', class: 'text-slate-500 bg-slate-100' };

    card.className = 'p-3.5 border-2 border-indigo-500 rounded-xl bg-indigo-50/70 flex justify-between items-center shadow-sm cursor-pointer hover:bg-indigo-100 transition gap-2';
    card.onclick = () => openFoodConfirmModal(foodName);
    card.innerHTML = `
      <div class="flex items-center gap-2.5 min-w-0 flex-1">
        <span>🎯</span>
        <div class="min-w-0 flex-1 overflow-hidden">
          <div class="text-[10px] font-bold text-indigo-500 leading-none mb-1">任務目標：</div>
          <div class="overflow-hidden whitespace-nowrap w-full relative" id="marquee-container-${safeId}">
            <div class="font-black text-sm text-indigo-900 inline-block" id="marquee-text-${safeId}">${foodName}</div>
          </div>
        </div>
      </div>
      <span class="text-[10px] px-1.5 py-0.5 rounded border font-medium flex items-center gap-0.5 shrink-0 ${elemInfo.class}">
        <span>${elemInfo.icon}</span><span>${elemInfo.name}</span>
      </span>
    `;
    setTimeout(() => initMarqueeForCard(safeId), 50);
  }
  return card;
}

function renderFavoriteUI(food) {
  const container = document.getElementById('favorite-container');
  if (userLevel < 3) {
    container.innerHTML = `<div id="favorite-locked-box" onclick="checkFeatureLock('favorite')" class="p-3 rounded-xl bg-slate-100 border border-dashed border-slate-300 text-xs text-slate-400 text-center cursor-pointer hover:bg-slate-200 transition">🔒 達到 Lv.3 解鎖個人最愛鎖定區</div>`;
    return;
  }
  container.innerHTML = '';
  if (!food) {
    container.innerHTML = `<div class="p-3 border border-amber-200 rounded-xl bg-amber-50 text-amber-700 text-xs text-center">💡 點擊上方食物旁的 👍 按鈕，按下「隨機抽選」即可為您鎖定喜愛美食！</div>`;
    return;
  }
  const card = createFoodCardHTML(food);
  card.className += ' border-amber-300 bg-amber-50/60';
  container.appendChild(card);
}

function createFoodCardHTML(food) {
  const foodName = food.id;
  const safeId = btoa(encodeURIComponent(foodName)).replace(/=/g, '');
  const isLiked = userLikes.includes(foodName);
  const isDisliked = userDislikes.includes(foodName);
  const isBanned = userBanned.includes(foodName);
  const elemInfo = ELEMENT_MAP[food.element] || { name: '未知', icon: '❓', class: 'text-slate-500 bg-slate-100' };

  const card = document.createElement('div');
  card.id = `food-card-${safeId}`;
  card.className = 'p-3 border dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-800 flex justify-between items-center shadow-sm hover:bg-slate-100 transition gap-1.5';
  
  const likeBtnClass = isLiked ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 hover:bg-slate-200';
  const dislikeBtnClass = isDisliked ? 'bg-amber-500 text-white border-amber-500 shadow-sm' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 hover:bg-slate-200';
  
  const likeAction = (userLevel >= 3) ? `togglePreference('${foodName.replace(/'/g, "\\'")}', 'like')` : `checkFeatureLock('like')`;
  const dislikeAction = (userLevel >= 8) ? `togglePreference('${foodName.replace(/'/g, "\\'")}', 'dislike')` : `checkFeatureLock('dislike')`;

  const likeDisplay = (userLevel >= 3) ? '👍' : '🔒';
  const dislikeDisplay = (userLevel >= 8) ? '👎' : '🔒';

  let banBtnClass = 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 hover:bg-slate-200';
  let banDisplay = '🔒 ⛔';
  let banAction = `openVipRequiredModal()`;

  if (isVIP) {
    banDisplay = isBanned ? '🚫 已禁' : '⛔ 禁用';
    banAction = `toggleBanFood('${foodName.replace(/'/g, "\\'")}')`;
    if (isBanned) banBtnClass = 'bg-rose-600 text-white border-rose-600 shadow-sm';
  }

  card.innerHTML = `
    <div class="cursor-pointer flex-1 min-w-0 flex items-center gap-1.5 overflow-hidden" onclick="openFoodConfirmModal('${foodName.replace(/'/g, "\\'")}')">
      <div class="overflow-hidden whitespace-nowrap flex-1 relative" id="marquee-container-${safeId}">
        <h3 class="font-bold text-sm text-slate-800 dark:text-white inline-block" id="marquee-text-${safeId}" title="${foodName}">
          ${foodName}
        </h3>
      </div>
      <span class="text-[10px] px-1.5 py-0.5 rounded border font-medium flex items-center gap-0.5 shrink-0 ${elemInfo.class}">
        <span>${elemInfo.icon}</span><span>${elemInfo.name}</span>
      </span>
    </div>
    <div class="flex items-center gap-1 shrink-0">
      <button onclick="${likeAction}" class="px-2 py-1 text-xs rounded-lg border transition ${likeBtnClass}" title="喜歡">
        ${likeDisplay}
      </button>
      <button onclick="${dislikeAction}" class="px-2 py-1 text-xs rounded-lg border transition ${dislikeBtnClass}" title="討厭">
        ${dislikeDisplay}
      </button>
      <button onclick="${banAction}" class="px-2 py-1 text-xs rounded-lg border transition ${banBtnClass}" title="永久禁用">
        ${banDisplay}
      </button>
    </div>
  `;
  setTimeout(() => initMarqueeForCard(safeId), 50);
  return card;
}

window.openVipRequiredModal = function() {
  document.getElementById('modal-overlay').classList.remove('hidden');
  document.getElementById('modal-vip-required').classList.remove('hidden');
};

window.toggleBanFood = function(foodName) {
  if (userBanned.includes(foodName)) {
    userBanned = userBanned.filter(i => i !== foodName);
  } else {
    userBanned.push(foodName);
  }
  localStorage.setItem('user_banned', JSON.stringify(userBanned));
  filterAndDraw(false);
};

function initMarqueeForCard(safeId) {
  const container = document.getElementById(`marquee-container-${safeId}`);
  const textEl = document.getElementById(`marquee-text-${safeId}`);
  if (!container || !textEl) return;
  const containerWidth = container.clientWidth;
  const textWidth = textEl.scrollWidth;
  if (textWidth > containerWidth) {
    const distance = containerWidth - textWidth - 10;
    textEl.style.setProperty('--marquee-distance', `${distance}px`);
    textEl.style.setProperty('--marquee-duration', `${Math.max(3, Math.abs(distance) * 0.05) + 2}s`);
    textEl.classList.add('animate-marquee');
  }
}

window.togglePreference = function(foodName, type) {
  if (type === 'like') {
    if (userLevel < 3) { alert('🔒 喜歡按鈕需達到 Lv.3 才能使用！'); return; }
    if (userLikes.includes(foodName)) userLikes = userLikes.filter(i => i !== foodName);
    else { userLikes.push(foodName); userDislikes = userDislikes.filter(i => i !== foodName); }
  } else if (type === 'dislike') {
    if (userLevel < 8) { alert('🔒 討厭按鈕需達到 Lv.8 才能使用！'); return; }
    if (userDislikes.includes(foodName)) userDislikes = userDislikes.filter(i => i !== foodName);
    else { userDislikes.push(foodName); userLikes = userLikes.filter(i => i !== foodName); }
  }
  localStorage.setItem('user_likes', JSON.stringify(userLikes));
  localStorage.setItem('user_dislikes', JSON.stringify(userDislikes));
  filterAndDraw(false);
};

window.openFoodConfirmModal = function(foodName) {
  selectedFoodForConfirm = allFoods.find(f => f.id === foodName);
  if (!selectedFoodForConfirm) return;

  const kyusei = userBirth ? calculateKyusei(userBirth.year, userBirth.month, userBirth.day) : KYUSEI_DATA[3];
  const fortune = getTodayFortuneAnalysis(kyusei.elementKey);
  document.getElementById('confirm-title').innerText = `確定要吃 ${selectedFoodForConfirm.id} 嗎？`;
  document.getElementById('confirm-element-bonus-hint').classList.toggle('hidden', selectedFoodForConfirm.element !== fortune.targetElementKey);

  updateConfirmModalExpText();
  document.getElementById('modal-overlay').classList.remove('hidden');
  document.getElementById('modal-confirm-step1').classList.remove('hidden');
  document.getElementById('modal-confirm-step2').classList.add('hidden');
  document.getElementById('modal-birth').classList.add('hidden');
  document.getElementById('modal-kyusei-result').classList.add('hidden');
  document.getElementById('modal-onboarding-guide').classList.add('hidden');
  document.getElementById('modal-settings').classList.add('hidden');
  document.getElementById('modal-stats').classList.add('hidden');
  document.getElementById('modal-levelup').classList.add('hidden');
  document.getElementById('modal-title').classList.add('hidden');
  document.getElementById('modal-guild-list').classList.add('hidden');
  document.getElementById('modal-guild-accept').classList.add('hidden');
  document.getElementById('modal-guild-complete').classList.add('hidden');
  document.getElementById('modal-vip-required').classList.add('hidden');
  document.getElementById('modal-vip-store').classList.add('hidden');
};

function updateConfirmModalExpText() {
  if (!selectedFoodForConfirm) return;
  const kyusei = userBirth ? calculateKyusei(userBirth.year, userBirth.month, userBirth.day) : KYUSEI_DATA[3];
  const fortune = getTodayFortuneAnalysis(kyusei.elementKey);
  const isMatchedElement = selectedFoodForConfirm.element === fortune.targetElementKey;
  const now = Date.now();
  const cooldownMs = 4 * 60 * 60 * 1000;
  const elapsedEat = now - lastEatTime;
  const hintConfirm = document.getElementById('hint-exp-confirm');
  const hintMap = document.getElementById('hint-exp-map');

  if (elapsedEat < cooldownMs) {
    const remainEatMs = cooldownMs - elapsedEat;
    const timeStr = `${String(Math.floor(remainEatMs / 3600000)).padStart(2, '0')}:${String(Math.floor((remainEatMs % 3600000) / 60000)).padStart(2, '0')}:${String(Math.floor((remainEatMs % 60000) / 1000)).padStart(2, '0')}`;
    hintConfirm.innerText = `⏳ 經驗值冷卻中（還剩 ${timeStr} 可獲得經驗值）`;
    hintMap.innerText = `⏳ 經驗值冷卻中（還剩 ${timeStr} 可獲得經驗值）`;
  } else {
    let expectedExp = isMatchedElement ? 10 : 5;
    hintConfirm.innerText = `✨ 確定選擇可獲得 +${expectedExp} 經驗值`;
    hintMap.innerText = `✨ 確定選擇可獲得 +${expectedExp} 經驗值`;
  }
}

function handleConfirm(needMap) {
  if (!selectedFoodForConfirm) return;
  const foodName = selectedFoodForConfirm.id;
  const foodElement = selectedFoodForConfirm.element;
  const kyusei = userBirth ? calculateKyusei(userBirth.year, userBirth.month, userBirth.day) : KYUSEI_DATA[3];
  const fortune = getTodayFortuneAnalysis(kyusei.elementKey);
  const timeStr = new Date().toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  foodHistory.push({ name: foodName, time: timeStr });
  foodCounts[foodName] = (foodCounts[foodName] || 0) + 1;
  localStorage.setItem('food_history', JSON.stringify(foodHistory));
  localStorage.setItem('food_counts', JSON.stringify(foodCounts));

  if (userLevel >= 3 && !userLikes.includes(foodName)) {
    userLikes.push(foodName);
    localStorage.setItem('user_likes', JSON.stringify(userLikes));
  }

  const now = Date.now();
  const isCoolingDown = (now - lastEatTime < (4 * 60 * 60 * 1000));
  let gainedExp = 0;
  let expMsg = "";

  if (!isCoolingDown) {
    gainedExp += 5;
    expMsg = "✨ 經驗值 +5";
    if (foodElement === fortune.targetElementKey) {
      gainedExp += 5;
      expMsg += "<br><span class='text-amber-600 font-extrabold'>🔥 契合今日開運食補 經驗值額外+5！</span>";
    }
    userExp += gainedExp;
    lastEatTime = now;
    hasTriggeredAutoRefreshThisCycle = false;
    localStorage.setItem('user_exp', userExp);
    localStorage.setItem('last_eat_time', lastEatTime);

    if (guildQuest && guildQuest.progress < 3 && selectedFoodForConfirm.tags && selectedFoodForConfirm.tags.includes(guildQuest.type)) {
      guildQuest.progress++;
      localStorage.setItem('guild_quest', JSON.stringify(guildQuest));
      expMsg += `<br><span class='text-indigo-600 font-extrabold'>⚔️ 副本任務進度 +1 (${guildQuest.progress}/3)</span>`;
      if (guildQuest.progress >= 3) expMsg += `<br><span class='text-amber-500 font-extrabold'>🎉 恭喜完成副本挑戰！點擊公會即可領取靈氣！</span>`;
    }
  } else {
    expMsg = "⏳ 4小時冷卻中，本次確認未獲得經驗值";
  }

  let oldLevel = userLevel;
  let currentLv = 1;
  for (let i = LEVEL_UNLOCKS.length - 1; i >= 0; i--) {
    if (userExp >= LEVEL_UNLOCKS[i].expNeeded) { currentLv = LEVEL_UNLOCKS[i].level; break; }
  }

  document.getElementById('modal-confirm-step1').classList.add('hidden');
  if (currentLv > oldLevel) {
    userLevel = currentLv;
    localStorage.setItem('user_level', userLevel);
    pendingCongratModalData = { foodName, expMsg, needMap };
    showLevelUpModal(userLevel, LEVEL_UNLOCKS.find(l => l.level === userLevel).unlockDesc);
  } else {
    showCongratModal(foodName, expMsg, needMap);
  }
  updateLevelAndUI(false);
  updateGuildBannerUI();
  filterAndDraw(false);
}

function showCongratModal(foodName, expMsg, needMap) {
  document.getElementById('modal-confirm-step2').classList.remove('hidden');
  document.getElementById('congrat-text').innerText = `今天就吃 ${foodName} 吧！`;
  document.getElementById('exp-reward-box').innerHTML = expMsg;
  const finalBtn = document.getElementById('btn-final-action');
  if (needMap) {
    finalBtn.innerText = '耶！找找！';
    finalBtn.onclick = () => { window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(foodName)}`, '_blank'); closeModal(); };
  } else {
    finalBtn.innerText = '耶！';
    finalBtn.onclick = closeModal;
  }
}

window.closeModal = function() {
  document.getElementById('modal-overlay').classList.add('hidden');
  document.querySelectorAll('#modal-overlay > div').forEach(m => m.classList.add('hidden'));
  selectedFoodForConfirm = null;
  pendingCongratModalData = null;
};

function checkAndUpdateCooldown() {
  const diffMs = Date.now() - drawState.timestamp;
  const intervalMs = 10 * 60 * 1000;
  if (diffMs >= intervalMs && drawState.count < MAX_DRAW) {
    const intervalsPassed = Math.floor(diffMs / intervalMs);
    drawState.count = Math.min(MAX_DRAW, drawState.count + (intervalsPassed * 5));
    drawState.timestamp += intervalsPassed * intervalMs;
    saveState();
  }
}

function updateCountersAndTimer() {
  checkAndUpdateCooldown();
  const now = Date.now();
  const remainEatMs = Math.max(0, (4 * 60 * 60 * 1000) - (now - lastEatTime));
  
  const triviaCountdownEl = document.getElementById('trivia-countdown-text');
  if (triviaCountdownEl) {
    if (lastEatTime === 0 || remainEatMs === 0) {
      triviaCountdownEl.innerHTML = `💎 -1<br>換一個`;
      if (lastEatTime !== 0 && remainEatMs === 0 && !hasTriggeredAutoRefreshThisCycle) {
        hasTriggeredAutoRefreshThisCycle = true;
        renderRandomTrivia();
      }
    } else {
      const timeStr = `${String(Math.floor(remainEatMs / 3600000)).padStart(2, '0')}:${String(Math.floor((remainEatMs % 3600000) / 60000)).padStart(2, '0')}:${String(Math.floor((remainEatMs % 60000) / 1000)).padStart(2, '0')}`;
      triviaCountdownEl.innerHTML = `${timeStr}<br>後自動刷新`;
    }
  }

  const coinValEl = document.getElementById('coin-counter-val');
  if (coinValEl) coinValEl.innerText = isVIP ? '∞' : drawState.count;

  const coinSubtextEl = document.getElementById('coin-timer-subtext');
  const remainingMs = (10 * 60 * 1000) - ((now - drawState.timestamp) % (10 * 60 * 1000));
  const timeStr = `${String(Math.floor(remainingMs / 60000)).padStart(2, '0')}:${String(Math.floor((remainingMs % 60000) / 1000)).padStart(2, '0')}`;

  if (coinSubtextEl) {
    if (isVIP) {
      coinSubtextEl.innerText = '⭐ 正式版無限';
      coinSubtextEl.className = 'text-[9px] font-bold text-amber-500 mt-0.5 leading-none whitespace-nowrap';
    } else if (drawState.count >= MAX_DRAW) {
      coinSubtextEl.innerText = '✨ 已達上限';
    } else {
      coinSubtextEl.innerText = `⏳ 補充 ${timeStr}`;
    }
  }

  const timerBar = document.getElementById('cooldown-timer-bar');
  const countdownEl = document.getElementById('cooldown-countdown');
  if (timerBar && countdownEl && remainEatMs > 0 && lastEatTime !== 0) {
    countdownEl.innerText = `${String(Math.floor(remainEatMs / 3600000)).padStart(2, '0')}:${String(Math.floor((remainEatMs % 3600000) / 60000)).padStart(2, '0')}:${String(Math.floor((remainEatMs % 60000) / 1000)).padStart(2, '0')}`;
    timerBar.classList.remove('hidden');
  } else if (timerBar) {
    timerBar.classList.add('hidden');
  }
}

function saveState() {
  localStorage.setItem('draw_state', JSON.stringify(drawState));
}

initApp();

```
