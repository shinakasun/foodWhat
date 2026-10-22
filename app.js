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
let isDarkMode = localStorage.getItem('dark_mode') === 'true';

let guildQuest = JSON.parse(localStorage.getItem('guild_quest') || 'null'); 
let unlockedAuras = JSON.parse(localStorage.getItem('unlocked_auras') || '[]'); 
let activeAura = localStorage.getItem('active_aura') || null; 
let tempSelectedQuestType = null;
let auraToastTimer = null;

let currentDisplayedFoods = [];

const MAX_DRAW = 9999;
let drawState = JSON.parse(localStorage.getItem('draw_state') || JSON.stringify({ count: MAX_DRAW, timestamp: Date.now() }));
let lastTriviaAutoTime = parseInt(localStorage.getItem('last_trivia_auto_time') || Date.now());
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

// 1. 日本九星氣學資料庫與判定機制
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

// 九星氣學判定演算法（考量立春 2/4）
function calculateKyusei(year, month, day) {
  let calcYear = year;
  // 立春前屬前一年
  if (month < 2 || (month === 2 && day < 4)) {
    calcYear = year - 1;
  }

  // 年份數字總和折算為個位數
  let sum = String(calcYear).split('').reduce((acc, num) => acc + parseInt(num), 0);
  while (sum >= 10) {
    sum = String(sum).split('').reduce((acc, num) => acc + parseInt(num), 0);
  }

  // 1999(含)前用 11 扣減，2000(含)後用 10 扣減
  let starNum = (calcYear <= 1999) ? (11 - sum) : (10 - sum);
  while (starNum <= 0) starNum += 9;
  while (starNum > 9) starNum -= 9;

  return KYUSEI_DATA[starNum] || KYUSEI_DATA[3];
}

// 日辰五行轉化演算法（本命五行 + 當日日期 -> 今日推薦食補屬性）
function getTodayFortuneAnalysis(userElementKey) {
  const today = new Date();
  const y = today.getFullYear();
  const m = today.getMonth() + 1;
  const d = today.getDate();

  // 日辰 Hash 偏移量 (0~4)
  const dayHash = (y * 13 + m * 31 + d) % 5;
  const elemKeys = ['elementMetal', 'elementWood', 'elementWater', 'elementFire', 'elementEarth'];
  const userIdx = elemKeys.indexOf(userElementKey);

  // 0: 生我(相生), 1: 同我(旺本), 2: 我生(洩秀), 3: 克我(官鬼), 4: 我克(財星)
  const relationType = (dayHash + 5) % 5; 
  
  // 決定今日開運建議的食物屬性
  const targetIdx = (userIdx + relationType) % 5;
  const targetElementKey = elemKeys[targetIdx];
  const targetElemInfo = ELEMENT_MAP[targetElementKey];

  const relationTexts = [
    `今日氣場源源不絕滋養本命，順勢而為，建議享用【${targetElemInfo.name}屬性】食物，可獲得額外經驗值！`,
    `今日同氣相求、氣場大旺，同屬強本，建議享用【${targetElemInfo.name}屬性】食物，可獲得額外經驗值！`,
    `今日適逢通明發越之局，才華外露，建議享用【${targetElemInfo.name}屬性】食物，可獲得額外經驗值！`,
    `今日局勢頗具挑戰、需穩固陣腳，建議享用【${targetElemInfo.name}屬性】食物以禦外敵，可獲得額外經驗值！`,
    `今日適逢財星大開局，利於開闢新局，建議享用【${targetElemInfo.name}屬性】食物收斂成果，可獲得額外經驗值！`
  ];

  return {
    targetElementKey: targetElementKey,
    targetElementName: targetElemInfo.name,
    text: relationTexts[relationType]
  };
}

const LEVEL_UNLOCKS = [
  { level: 1, name: "初始狀態 (3選項)", expNeeded: 0, unlockDesc: "初始開局" },
  { level: 2, name: "解鎖第四選項", expNeeded: 5, unlockDesc: "第四個盲盒選項" },
  { level: 3, name: "解鎖喜歡按鈕與個人最愛", expNeeded: 12, unlockDesc: "👍 喜歡按鈕、⭐ 個人最愛區與深色模式" },
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

async function initApp() {
  toggleDarkMode(isDarkMode);
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
    filterAndDraw(true);
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
    const mealFull = getMealFullPrefix();
    titleEl.innerHTML = `<span>歡迎回來</span><br><span class="text-indigo-600 dark:text-indigo-400">${mealFull}${userSelectedTitle} ▼</span>`;
  }
}

window.openTitleModal = function() {
  const listEl = document.getElementById('title-options-list');
  const mealFull = getMealFullPrefix();

  const baseTitles = ["迷途旅人", "愛好者", "尋覓者"];

  listEl.innerHTML = baseTitles.map(t => {
    const isSelected = userSelectedTitle === t;
    const displayName = `${mealFull}${t}`;
    return `
      <div onclick="selectTitle('${t}')" class="p-2.5 rounded-xl border cursor-pointer flex justify-between items-center transition ${
        isSelected ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-700 dark:text-indigo-300 font-bold' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
      }">
        <span>${displayName}</span>
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
  for (let y = currentYear; y >= 1920; y--) {
    yearSel.add(new Option(`${y} 年`, y));
  }
  yearSel.value = 1990;

  monthSel.innerHTML = '';
  for (let m = 1; m <= 12; m++) {
    monthSel.add(new Option(`${m} 月`, m));
  }
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
  for (let d = 1; d <= daysInMonth; d++) {
    daySel.add(new Option(`${d} 日`, d));
  }
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
  
  const badge = document.getElementById('user-level-badge');
  badge.innerText = `Lv.${userLevel}`;

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
  
  const dislikeTip = document.getElementById('levelup-dislike-tip');
  if (lv === 8) {
    dislikeTip.classList.remove('hidden');
  } else {
    dislikeTip.classList.add('hidden');
  }

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
  const triviaLocked = document.getElementById('trivia-locked-box');
  const triviaWrapper = document.getElementById('trivia-wrapper');
  if (userLevel >= 6 && settingsPushTrivia) {
    triviaLocked.classList.add('hidden');
    triviaWrapper.classList.remove('hidden');
    if (document.getElementById('trivia-content').innerText === '') {
      renderRandomTrivia();
    }
  } else if (userLevel >= 6) {
    triviaLocked.classList.add('hidden');
    triviaWrapper.classList.add('hidden');
  } else {
    triviaLocked.classList.remove('hidden');
    triviaWrapper.classList.add('hidden');
  }

  const guildLocked = document.getElementById('guild-locked-box');
  const guildWrapper = document.getElementById('guild-wrapper');
  if (userLevel >= 4) {
    guildLocked.classList.add('hidden');
    guildWrapper.classList.remove('hidden');
    updateGuildBannerUI();
  } else {
    guildLocked.classList.remove('hidden');
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
    statBtn.className = "flex flex-col items-center justify-center px-2 py-1 text-xs rounded-xl border transition bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-indigo-500 min-w-[42px]";
    statBtn.innerHTML = '<span class="text-sm">📊</span><span class="text-[10px] mt-0.5 leading-none">統計</span>';
  } else {
    statBtn.className = "flex flex-col items-center justify-center px-2 py-1 text-xs rounded-xl border transition bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700 min-w-[42px]";
    statBtn.innerHTML = '<span class="text-sm">🔒</span><span class="text-[10px] mt-0.5 leading-none">統計</span>';
  }

  const dmWrapper = document.getElementById('setting-darkmode-wrapper');
  const dmCheckbox = document.getElementById('setting-darkmode');
  const dmLocker = document.getElementById('lock-darkmode');
  if (userLevel >= 3) {
    dmWrapper.classList.remove('opacity-50');
    dmCheckbox.disabled = false;
    dmLocker.innerText = '';
  }

  const favLabel = document.getElementById('favorite-label');
  const favLocked = document.getElementById('favorite-locked-box');
  if (userLevel >= 3) {
    favLabel.innerText = '⭐ 個人最愛精選';
    favLabel.className = 'text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1';
    if (favLocked) favLocked.classList.add('hidden');
  } else {
    favLabel.innerText = '❓ 個人最愛精選 (Lv.3 解鎖)';
    favLabel.className = 'text-xs font-bold text-slate-400 dark:text-slate-600 flex items-center gap-1';
    if (favLocked) favLocked.classList.remove('hidden');
  }
}

function updateGuildBannerUI() {
  const banner = document.getElementById('guild-banner');
  const titleEl = document.getElementById('guild-banner-title');
  const subEl = document.getElementById('guild-banner-sub');

  if (!guildQuest) {
    banner.className = "p-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-bold shadow-md cursor-pointer hover:opacity-95 transition flex justify-between items-center";
    titleEl.innerText = "🛡️ 冒險者公會";
    subEl.innerText = "點擊接取副本任務，贏取稀有靈氣！";
  } else {
    const questNames = { cold: '❄️ 凜冬陣地', hot: '🔥 灼熱地城', snack: '🍡 小惡魔城' };
    banner.className = "p-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white text-xs font-bold shadow-md cursor-pointer hover:opacity-95 transition flex justify-between items-center";
    titleEl.innerText = `⚔️ 進行中任務：${questNames[guildQuest.type]}`;
    subEl.innerText = `任務進度：${guildQuest.progress} / 3 (點擊查看詳情)`;
  }
}

window.handleGuildClick = function() {
  if (guildQuest && guildQuest.progress >= 3) {
    openCompleteQuestModal();
  } else {
    openGuildModal();
  }
};

window.openGuildModal = function() {
  const container = document.getElementById('guild-quest-list-container');
  const subtext = document.getElementById('guild-modal-subtext');
  const abandonBtn = document.getElementById('btn-abandon-quest');

  container.innerHTML = '';

  const ALL_QUEST_TYPES = ['cold', 'hot', 'snack'];
  const remainingQuests = ALL_QUEST_TYPES.filter(t => !unlockedAuras.includes(t));

  if (guildQuest) {
    abandonBtn.classList.remove('hidden');
    subtext.innerText = "當前正在執行的副本任務：";

    const questNames = { cold: '❄️ 凜冬陣地', hot: '🔥 灼熱地城', snack: '🍡 小惡魔城' };
    const auras = { cold: '極寒靈氣', hot: '灼熱靈氣', snack: '迅捷靈氣' };

    container.innerHTML = `
      <div class="p-3.5 rounded-xl border-2 border-amber-500 bg-amber-50/70 dark:bg-amber-950/40">
        <div class="flex justify-between items-center mb-1">
          <div class="text-xs font-black text-amber-900 dark:text-amber-200">${questNames[guildQuest.type]}</div>
          <span class="text-xs font-bold text-amber-600">進度: ${guildQuest.progress} / 3</span>
        </div>
        <div class="text-[10px] text-amber-700 dark:text-amber-400">完成可解鎖：${auras[guildQuest.type]}</div>
      </div>
    `;
  } else if (remainingQuests.length === 0) {
    abandonBtn.classList.add('hidden');
    subtext.innerText = "";

    container.innerHTML = `
      <div class="p-6 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center text-slate-500 dark:text-slate-400 my-2">
        <div class="text-3xl mb-2">☕</div>
        <div class="text-sm font-bold text-slate-700 dark:text-slate-200 mb-1">暫時沒有新的任務</div>
        <div class="text-xs text-slate-400">過段時間再來看看吧</div>
      </div>
    `;
  } else {
    abandonBtn.classList.add('hidden');
    subtext.innerText = "選擇一項副本任務進行挑戰：";

    const questConfigs = [
      { type: 'cold', title: '❄️ 凜冬陣地', reward: '極寒靈氣', bgClass: 'border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/30 hover:bg-blue-100 text-blue-900 dark:text-blue-200 text-blue-600' },
      { type: 'hot', title: '🔥 灼熱地城', reward: '灼熱靈氣', bgClass: 'border-rose-200 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/30 hover:bg-rose-100 text-rose-900 dark:text-rose-200 text-rose-600' },
      { type: 'snack', title: '🍡 小惡魔城', reward: '迅捷靈氣', bgClass: 'border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/30 hover:bg-amber-100 text-amber-900 dark:text-amber-200 text-amber-600' }
    ];

    questConfigs.filter(q => !unlockedAuras.includes(q.type)).forEach(q => {
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
  const type = guildQuest.type;
  if (!unlockedAuras.includes(type)) {
    unlockedAuras.push(type);
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

  if (guildQuest) {
    showAuraToast("⚔️ 任務進行中無法開啟靈氣");
    return;
  }

  if (activeAura === auraType) {
    activeAura = null;
    showAuraToast("靈氣已關閉");
  } else {
    activeAura = auraType;
    triggerAuraTextToast(auraType);
  }
  localStorage.setItem('active_aura', activeAura || '');
  updateAuraButtonsUI();
};

function triggerAuraTextToast(type) {
  const texts = {
    cold: '極寒靈氣開啟<br>下一次隨機抽選只會出現清爽的食物囉！',
    hot: '灼熱靈氣開啟<br>下一次隨機抽選只會出現熱呼呼的食物囉！',
    snack: '迅捷靈氣開啟<br>下一次隨機抽選只會出現點心/輕食囉！'
  };
  showAuraToast(texts[type] || '靈氣已啟動！');
}

function updateAuraButtonsUI() {
  const types = ['cold', 'hot', 'snack'];
  const labels = { cold: '❄️ 極寒靈氣', hot: '🔥 灼熱靈氣', snack: '⚡ 迅捷靈氣' };

  types.forEach(t => {
    const btn = document.getElementById(`aura-btn-${t}`);
    if (!btn) return;

    if (!unlockedAuras.includes(t)) {
      btn.className = "px-2.5 py-1 text-[11px] rounded-lg border transition font-bold whitespace-nowrap bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700 opacity-60";
      btn.innerText = `${labels[t]} (未解鎖)`;
    } else if (activeAura === t) {
      btn.className = "px-2.5 py-1 text-[11px] rounded-lg border transition font-bold whitespace-nowrap bg-indigo-600 text-white border-indigo-600 shadow-sm";
      btn.innerText = labels[t]; 
    } else {
      btn.className = "px-2.5 py-1 text-[11px] rounded-lg border transition font-bold whitespace-nowrap bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50";
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
  alert('⚡ [測試功能] 經驗值冷卻已成功歸零！現在選擇食物可獲得經驗值與推進任務進度。');
};

window.checkFeatureLock = function(featureKey) {
  const reqLevels = {
    stats: 5,
    trivia: 6,
    guild: 4,
    favorite: 3,
    like: 3,
    dislike: 8
  };
  const reqNames = {
    stats: "📊 數據統計中心 (Lv.5)",
    trivia: "💡 美食冷知識 (Lv.6)",
    guild: "🛡️ 冒險者公會 (Lv.4)",
    favorite: "⭐ 個人最愛精選 (Lv.3)",
    like: "👍 喜歡按鈕 (Lv.3)",
    dislike: "👎 討厭按鈕 (Lv.8)"
  };

  const needed = reqLevels[featureKey] || 1;
  if (userLevel < needed) {
    alert(`🔒 此功能尚未解鎖！\n需要達到 【${reqNames[featureKey]}】 才能使用（目前 Lv.${userLevel}）。`);
  }
};

function getUnlockBoxCount() {
  if (userLevel >= 12) return 9;
  if (userLevel === 11) return 8;
  if (userLevel === 10) return 7;
  if (userLevel === 9) return 6;
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
    console.error(err);
    document.getElementById('food-container').innerHTML = `
      <div class="text-center py-6 text-red-500 font-bold">無法連線至食物資料庫</div>
    `;
  }
}

async function fetchTrivias() {
  try {
    const res = await fetch(`${ONLINE_TRIVIAS_URL}?t=${Date.now()}`);
    if (!res.ok) return;
    allTrivias = await res.json();
    if (userLevel >= 6 && settingsPushTrivia) renderRandomTrivia();
  } catch (err) {
    console.warn('遠端冷知識讀取失敗');
  }
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

  const randomIndex = Math.floor(Math.random() * availableTrivias.length);
  const selectedTrivia = availableTrivias[randomIndex];
  currentTriviaIndex = allTrivias.indexOf(selectedTrivia);

  document.getElementById('trivia-content').innerText = selectedTrivia.content;
  triviaWrapper.classList.remove('hidden');
}

window.refreshTriviaWithCoin = function() {
  if (drawState.count <= 0) {
    alert('刷新水晶不足！請觀看廣告補充。');
    return;
  }
  drawState.count--;
  saveState();

  userExp += 1;
  localStorage.setItem('user_exp', userExp);
  updateLevelAndUI(true);

  lastTriviaAutoTime = Date.now();
  localStorage.setItem('last_trivia_auto_time', lastTriviaAutoTime);

  updateCountersAndTimer();
  renderRandomTrivia();
  showExpToast('toast-exp-floating');
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
  if (userLevel < 6) {
    alert('🔒 美食冷知識區尚未解鎖！');
    return;
  }
  settingsPushTrivia = show;
  localStorage.setItem('push_trivia', show);
  if (show) renderRandomTrivia();
  else document.getElementById('trivia-wrapper').classList.add('hidden');
};

// 1. 更新主介面的本命五行標籤與每日運勢分析提示
function updateFortuneText() {
  if (!userBirth) return;
  
  const kyusei = calculateKyusei(userBirth.year, userBirth.month, userBirth.day);
  const fortune = getTodayFortuneAnalysis(kyusei.elementKey);

  const tagEl = document.getElementById('user-element-tag');
  if (tagEl) {
    tagEl.innerText = `${kyusei.star} [${kyusei.name}]`;
  }

  const fortuneEl = document.getElementById('fortune-text');
  if (fortuneEl) {
    fortuneEl.innerText = fortune.text;
  }
}

function showBirthModal() {
  document.getElementById('modal-overlay').classList.remove('hidden');
  document.getElementById('modal-birth').classList.remove('hidden');
}

// 1. 輸入生日後的九星診斷流程
window.saveBirthdate = function() {
  const year = parseInt(document.getElementById('select-birth-year').value);
  const month = parseInt(document.getElementById('select-birth-month').value);
  const day = parseInt(document.getElementById('select-birth-day').value);

  if (!year || !month || !day) {
    alert('請完整選擇您的出生年月日！');
    return;
  }

  userBirth = { year, month, day };
  localStorage.setItem('user_birth', JSON.stringify(userBirth));

  // 計算九星氣學結果並顯示彈窗
  const kyusei = calculateKyusei(year, month, day);
  document.getElementById('kyusei-star-name').innerText = `根據九星氣學 您屬於：${kyusei.star}`;
  document.getElementById('kyusei-element-name').innerText = `對應五行：${kyusei.name}`;
  document.getElementById('kyusei-traits').innerText = `特質：${kyusei.traits}`;

  document.getElementById('modal-birth').classList.add('hidden');
  document.getElementById('modal-kyusei-result').classList.remove('hidden');
};

window.confirmKyuseiResult = function() {
  closeModal();
  updateMainTitle();
  updateFortuneText();
  filterAndDraw(true);
};

window.openSettingsModal = function() {
  if (userBirth) {
    document.getElementById('select-setting-year').value = userBirth.year;
    document.getElementById('select-setting-month').value = userBirth.month;
    adjustBirthDays('select-setting');
    document.getElementById('select-setting-day').value = userBirth.day;
  }
  document.getElementById('setting-push-trivia').checked = settingsPushTrivia;
  document.getElementById('setting-darkmode').checked = isDarkMode;

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
  document.querySelectorAll('.meat-taboo:checked').forEach(checkbox => {
    userTaboos.push(checkbox.value);
  });
  localStorage.setItem('user_taboos', JSON.stringify(userTaboos));

  closeModal();
  updateMainTitle();
  updateFortuneText();
};

window.openStatsModal = function() {
  if (userLevel < 5) {
    alert('🔒 統計中心尚未解鎖！需要達到 Lv.5。');
    return;
  }
  renderStatsRecent();
  renderStatsRanking();
  renderStatsDislikes();
  renderStatsBanned();

  document.getElementById('modal-overlay').classList.remove('hidden');
  document.getElementById('modal-stats').classList.remove('hidden');
};

function renderStatsRecent() {
  const container = document.getElementById('stats-recent-list');
  if (foodHistory.length === 0) {
    container.innerHTML = '<p class="text-slate-400 italic py-2">尚未有選擇紀錄</p>';
    return;
  }
  const recent5 = foodHistory.slice(-5).reverse();
  container.innerHTML = recent5.map(item => `
    <div class="flex justify-between items-center p-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg">
      <span class="font-medium text-slate-700 dark:text-slate-200">${item.name}</span>
      <span class="text-[10px] text-slate-400">${item.time}</span>
    </div>
  `).join('');
}

function renderStatsRanking() {
  const container = document.getElementById('stats-ranking-list');
  const sorted = Object.entries(foodCounts)
    .map(([id, count]) => ({ id: parseInt(id), count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  if (sorted.length === 0) {
    container.innerHTML = '<p class="text-slate-400 italic py-2">尚未產生排名數據</p>';
    return;
  }

  container.innerHTML = sorted.map((item, index) => {
    const food = allFoods.find(f => f.id === item.id);
    const name = food ? food.name : `食物 #${item.id}`;
    return `
      <div class="flex justify-between items-center p-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg">
        <span class="font-medium text-slate-700 dark:text-slate-200">No.${index + 1} ${name}</span>
        <span class="text-[11px] font-bold text-amber-600 dark:text-amber-400">${item.count} 次</span>
      </div>
    `;
  }).join('');
}

function renderStatsDislikes() {
  const label = document.getElementById('dislike-toggle-label');
  label.innerText = `👎 不喜歡的食物名單 (${userDislikes.length} 項)`;

  const container = document.getElementById('stats-dislike-list');
  if (userDislikes.length === 0) {
    container.innerHTML = '<p class="text-slate-400 italic py-2">目前沒有被標記為 👎 不喜歡的食物</p>';
    return;
  }

  container.innerHTML = userDislikes.map(id => {
    const food = allFoods.find(f => f.id === id);
    const name = food ? food.name : `食物 #${id}`;
    return `
      <div class="flex justify-between items-center p-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg">
        <span class="text-slate-700 dark:text-slate-200">${name}</span>
        <button onclick="unmarkDislike(${id})" class="text-[11px] text-rose-500 hover:text-rose-700 border border-rose-200 dark:border-rose-800 px-2 py-0.5 rounded">解封</button>
      </div>
    `;
  }).join('');
}

window.toggleDislikeSection = function() {
  const container = document.getElementById('stats-dislike-container');
  const arrow = document.getElementById('dislike-toggle-arrow');
  const isHidden = container.classList.contains('hidden');
  if (isHidden) {
    container.classList.remove('hidden');
    arrow.innerText = '▲';
  } else {
    container.classList.add('hidden');
    arrow.innerText = '▼';
  }
};

window.unmarkDislike = function(id) {
  userDislikes = userDislikes.filter(i => i !== id);
  localStorage.setItem('user_dislikes', JSON.stringify(userDislikes));
  renderStatsDislikes();
  updateButtonUI(id);
};

function renderStatsBanned() {
  const container = document.getElementById('stats-banned-list');
  const badge = document.getElementById('vip-status-badge');
  if (isVIP) {
    badge.innerText = '⭐ VIP 已啟用';
    badge.className = 'text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 font-bold';
  } else {
    badge.innerText = '免費版 (未啟用)';
    badge.className = 'text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400 font-medium';
  }
  if (!isVIP) {
    container.innerHTML = `
      <div class="p-2.5 border border-amber-200 dark:border-amber-900 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 text-[11px] text-center">
        🔒 升級正式版 (VIP) 即可將不喜歡的食物徹底過濾禁用！
      </div>
    `;
    return;
  }
  if (userBanned.length === 0) {
    container.innerHTML = '<p class="text-slate-400 italic py-2">目前沒有被完全禁用的食物</p>';
    return;
  }
  container.innerHTML = userBanned.map(id => {
    const food = allFoods.find(f => f.id === id);
    const name = food ? food.name : `食物 #${id}`;
    return `
      <div class="flex justify-between items-center p-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg">
        <span class="text-slate-700 dark:text-slate-200">${name}</span>
        <button onclick="unmarkBanned(${id})" class="text-[11px] text-indigo-500 hover:text-indigo-700 border border-indigo-200 dark:border-indigo-800 px-2 py-0.5 rounded">解除禁用</button>
      </div>
    `;
  }).join('');
}

window.unmarkBanned = function(id) {
  userBanned = userBanned.filter(i => i !== id);
  localStorage.setItem('user_banned', JSON.stringify(userBanned));
  renderStatsBanned();
};

window.toggleDarkMode = function(isDark) {
  if (userLevel < 3) {
    alert('🔒 深色模式尚未解鎖！');
    document.getElementById('setting-darkmode').checked = false;
    return;
  }
  isDarkMode = isDark;
  localStorage.setItem('dark_mode', isDark);
  const htmlRoot = document.getElementById('html-root');
  if (isDark) htmlRoot.classList.add('dark');
  else htmlRoot.classList.remove('dark');
};

window.buyVIP = function() {
  isVIP = true;
  localStorage.setItem('is_vip', 'true');
  alert('🎉 恭喜您升級為 VIP 正式版！已解鎖「完全過濾不喜歡選項」功能。');
  closeModal();
};

window.clearLocalStorage = function() {
  if (confirm('確定要清空所有 LocalStorage 資料並重置 App 嗎？')) {
    localStorage.clear();
    location.reload();
  }
};

window.simulateWatchAd = function() {
  const btn = document.getElementById('btn-watch-ad');
  btn.disabled = true;
  btn.innerText = '⏳ 廣告播放中...';

  setTimeout(() => {
    drawState.count += 10;
    saveState();
    updateCountersAndTimer();
    btn.disabled = false;
    btn.innerText = '🎬 看廣告 +10 💎';
    alert('🎉 感謝觀看！刷新水晶已增加 10 個！');
  }, 2000);
};

function setupEventListeners() {
  const drawBtn = document.getElementById('draw-btn');
  if (drawBtn) {
    drawBtn.addEventListener('click', () => {
      if (drawState.count <= 0) {
        alert('刷新水晶不足！請觀看廣告補充。');
        return;
      }
      drawState.count--;
      saveState();

      userExp += 1;
      localStorage.setItem('user_exp', userExp);
      updateLevelAndUI(true);

      filterAndDraw(true); 
      showExpToast('toast-draw-exp-floating');
    });
  }

  const confirmOnly = document.getElementById('btn-confirm-only');
  const confirmMap = document.getElementById('btn-confirm-map');
  if (confirmOnly) confirmOnly.onclick = () => handleConfirm(false);
  if (confirmMap) confirmMap.onclick = () => handleConfirm(true);
}

function filterAndDraw(isDrawn = false) {
  if (allFoods.length === 0) return;

  const kyusei = userBirth ? calculateKyusei(userBirth.year, userBirth.month, userBirth.day) : KYUSEI_DATA[3];
  const fortune = getTodayFortuneAnalysis(kyusei.elementKey);

  if (isDrawn || currentDisplayedFoods.length === 0) {
    let pool = [...allFoods];

    if (userTaboos.length > 0) {
      pool = pool.filter(f => {
        if (!f.tags) return true;
        return !userTaboos.some(taboo => f.tags.includes(taboo));
      });
    }

    if (isVIP) {
      pool = pool.filter(f => !userDislikes.includes(f.id) && !userBanned.includes(f.id));
    }

    if (activeAura) {
      pool = pool.filter(f => f.tags && f.tags.includes(activeAura));
    }

    const boxCount = getUnlockBoxCount();
    // 依據今日開運建議的屬性進行加權抽樣
    currentDisplayedFoods = weightedSample(pool, boxCount, fortune.targetElementKey);
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
      // 今日開運屬性權重加倍！
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

  if (foods.length === 0) {
    container.innerHTML = '<p class="text-slate-400 text-center py-6">沒有符合條件的食物！</p>';
    return;
  }

  foods.forEach((food, index) => {
    if (index === 0 && guildQuest && guildQuest.progress < 3) {
      container.appendChild(createGuildQuestCardHTML());
    }
    container.appendChild(createFoodCardHTML(food, false));
  });
}

function createGuildQuestCardHTML() {
  const now = Date.now();
  const cooldownMs = 4 * 60 * 60 * 1000;
  const isCoolingDown = (now - lastEatTime < cooldownMs);

  const card = document.createElement('div');
  
  if (isCoolingDown) {
    card.className = 'p-3.5 border border-dashed border-amber-300 dark:border-amber-800 rounded-xl bg-amber-50/50 dark:bg-amber-950/30 flex justify-between items-center opacity-75';
    card.innerHTML = `
      <div class="flex items-center gap-2">
        <span class="text-xl">⏳</span>
        <div class="font-bold text-sm text-amber-800 dark:text-amber-300">任務目標尋找中...</div>
      </div>
      <span class="text-[10px] font-bold text-amber-600 bg-amber-100 dark:bg-amber-900 px-2.5 py-1 rounded">冷卻中</span>
    `;
  } else {
    const targetTag = guildQuest.type;
    const eligibleFoods = allFoods.filter(f => f.tags && f.tags.includes(targetTag));
    const targetFood = eligibleFoods.length > 0 ? eligibleFoods[Math.floor(Math.random() * eligibleFoods.length)] : { id: 999, name: '神祕任務料理', element: 'elementMetal' };

    card.className = 'p-3.5 border-2 border-indigo-500 dark:border-indigo-600 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 flex justify-between items-center shadow-sm cursor-pointer hover:bg-indigo-100 transition';
    card.onclick = () => openFoodConfirmModal(targetFood.id);
    card.innerHTML = `
      <div class="flex items-center gap-2">
        <span class="text-xl">🎯</span>
        <div class="font-black text-sm text-indigo-900 dark:text-indigo-200">任務目標：${targetFood.name}</div>
      </div>
      <span class="text-xs font-bold text-white bg-indigo-600 px-3 py-1 rounded-lg shadow-sm whitespace-nowrap">前往挑戰</span>
    `;
  }
  return card;
}

function renderFavoriteUI(food) {
  const container = document.getElementById('favorite-container');
  if (userLevel < 3) {
    container.innerHTML = `
      <div id="favorite-locked-box" onclick="checkFeatureLock('favorite')" class="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-700 text-xs text-slate-400 dark:text-slate-500 text-center cursor-pointer hover:bg-slate-200 transition">
        🔒 達到 Lv.3 解鎖個人最愛鎖定區
      </div>
    `;
    return;
  }

  container.innerHTML = '';
  if (!food) {
    container.innerHTML = `
      <div class="p-3 border border-amber-200 dark:border-amber-900 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-xs text-center">
        💡 點擊上方食物旁的 👍 按鈕，按下「隨機抽選」即可為您鎖定喜愛美食！
      </div>
    `;
    return;
  }

  const card = createFoodCardHTML(food, true);
  card.className += ' border-amber-300 dark:border-amber-700 bg-amber-50/60 dark:bg-amber-950/30';
  container.appendChild(card);
}

function createFoodCardHTML(food, isFavoriteSlot) {
  const isLiked = userLikes.includes(food.id);
  const isDisliked = userDislikes.includes(food.id);

  const elemInfo = ELEMENT_MAP[food.element] || { name: '未知', icon: '❓', class: 'text-slate-500 bg-slate-100 border-slate-200' };

  const card = document.createElement('div');
  card.id = `food-card-${food.id}`;
  card.className = 'p-3 border dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-800 flex justify-between items-center shadow-sm hover:bg-slate-100 dark:hover:bg-slate-750 transition';
  
  const likeBtnClass = isLiked 
    ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm' 
    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-200';

  const dislikeBtnClass = isDisliked 
    ? 'bg-rose-500 text-white border-rose-500 shadow-sm' 
    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-200';

  const likeAction = (userLevel >= 3) ? `togglePreference(${food.id}, 'like')` : `checkFeatureLock('like')`;
  const dislikeAction = (userLevel >= 8) ? `togglePreference(${food.id}, 'dislike')` : `checkFeatureLock('dislike')`;

  const likeDisplay = (userLevel >= 3) ? '👍' : '🔒';
  const dislikeDisplay = (userLevel >= 8) ? '👎' : '🔒';

  card.innerHTML = `
    <div class="cursor-pointer flex-grow flex items-center gap-2" onclick="openFoodConfirmModal(${food.id})">
      <h3 class="font-bold text-slate-800 dark:text-white">${food.name}</h3>
      <span class="text-[10px] px-1.5 py-0.5 rounded-md border font-medium flex items-center gap-0.5 ${elemInfo.class}">
        <span>${elemInfo.icon}</span>
        <span>${elemInfo.name}</span>
      </span>
    </div>
    <div class="flex items-center gap-1.5 ml-2">
      <button id="like-btn-${food.id}" onclick="${likeAction}" 
        class="px-2.5 py-1 text-xs rounded-lg border transition ${likeBtnClass}" title="${userLevel < 3 ? 'Lv.3 解鎖喜歡' : ''}">
        ${likeDisplay}
      </button>
      <button id="dislike-btn-${food.id}" onclick="${dislikeAction}" 
        class="px-2.5 py-1 text-xs rounded-lg border transition ${dislikeBtnClass}" title="${userLevel < 8 ? 'Lv.8 解鎖討厭' : ''}">
        ${dislikeDisplay}
      </button>
    </div>
  `;
  return card;
}

window.togglePreference = function(id, type) {
  if (type === 'like') {
    if (userLevel < 3) { alert('🔒 喜歡按鈕需達到 Lv.3 才能使用！'); return; }
    if (userLikes.includes(id)) {
      userLikes = userLikes.filter(i => i !== id);
    } else {
      userLikes.push(id);
      userDislikes = userDislikes.filter(i => i !== id);
    }
  } else if (type === 'dislike') {
    if (userLevel < 8) { alert('🔒 討厭按鈕需達到 Lv.8 才能使用！'); return; }
    if (userDislikes.includes(id)) {
      userDislikes = userDislikes.filter(i => i !== id);
    } else {
      userDislikes.push(id);
      userLikes = userLikes.filter(i => i !== id);
      if (isVIP && !userBanned.includes(id)) {
        userBanned.push(id);
        localStorage.setItem('user_banned', JSON.stringify(userBanned));
      }
    }
  }

  localStorage.setItem('user_likes', JSON.stringify(userLikes));
  localStorage.setItem('user_dislikes', JSON.stringify(userDislikes));
  updateButtonUI(id);
};

function updateButtonUI(id) {
  const isLiked = userLikes.includes(id);
  const isDisliked = userDislikes.includes(id);

  const likeBtns = document.querySelectorAll(`#like-btn-${id}`);
  const dislikeBtns = document.querySelectorAll(`#dislike-btn-${id}`);

  likeBtns.forEach(btn => {
    if (userLevel >= 3) {
      btn.className = `px-2.5 py-1 text-xs rounded-lg border transition ${
        isLiked ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-200'
      }`;
    }
  });

  dislikeBtns.forEach(btn => {
    if (userLevel >= 8) {
      btn.className = `px-2.5 py-1 text-xs rounded-lg border transition ${
        isDisliked ? 'bg-rose-500 text-white border-rose-500 shadow-sm' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-200'
      }`;
    }
  });
}

window.openFoodConfirmModal = function(id) {
  selectedFoodForConfirm = allFoods.find(f => f.id === id);
  if (!selectedFoodForConfirm) return;

  const kyusei = userBirth ? calculateKyusei(userBirth.year, userBirth.month, userBirth.day) : KYUSEI_DATA[3];
  const fortune = getTodayFortuneAnalysis(kyusei.elementKey);
  const isMatchedElement = selectedFoodForConfirm.element === fortune.targetElementKey;

  document.getElementById('confirm-title').innerText = `確定要吃 ${selectedFoodForConfirm.name} 嗎？`;
  
  const hintBox = document.getElementById('confirm-element-bonus-hint');
  if (isMatchedElement) {
    hintBox.classList.remove('hidden');
  } else {
    hintBox.classList.add('hidden');
  }

  updateConfirmModalExpText();

  document.getElementById('modal-overlay').classList.remove('hidden');
  document.getElementById('modal-confirm-step1').classList.remove('hidden');
  document.getElementById('modal-confirm-step2').classList.add('hidden');
  document.getElementById('modal-birth').classList.add('hidden');
  document.getElementById('modal-kyusei-result').classList.add('hidden');
  document.getElementById('modal-settings').classList.add('hidden');
  document.getElementById('modal-stats').classList.add('hidden');
  document.getElementById('modal-levelup').classList.add('hidden');
  document.getElementById('modal-title').classList.add('hidden');
  document.getElementById('modal-guild-list').classList.add('hidden');
  document.getElementById('modal-guild-accept').classList.add('hidden');
  document.getElementById('modal-guild-complete').classList.add('hidden');
};

function updateConfirmModalExpText() {
  if (!selectedFoodForConfirm) return;

  const kyusei = userBirth ? calculateKyusei(userBirth.year, userBirth.month, userBirth.day) : KYUSEI_DATA[3];
  const fortune = getTodayFortuneAnalysis(kyusei.elementKey);
  const isMatchedElement = selectedFoodForConfirm.element === fortune.targetElementKey;

  const now = Date.now();
  const cooldownMs = 4 * 60 * 60 * 1000;
  const elapsedEat = now - lastEatTime;
  const isCoolingDown = (elapsedEat < cooldownMs);

  const hintConfirm = document.getElementById('hint-exp-confirm');
  const hintMap = document.getElementById('hint-exp-map');

  if (isCoolingDown) {
    const remainEatMs = cooldownMs - elapsedEat;
    const hrs = Math.floor(remainEatMs / (1000 * 60 * 60));
    const mins = Math.floor((remainEatMs % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((remainEatMs % (1000 * 60)) / 1000);
    const timeStr = `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    const text = `⏳ 經驗值冷卻中（還剩 ${timeStr} 可獲得經驗值）`;
    hintConfirm.innerText = text;
    hintMap.innerText = text;
    hintConfirm.className = 'text-xs font-bold text-amber-600 dark:text-amber-400 mt-1.5';
    hintMap.className = 'text-xs font-bold text-amber-600 dark:text-amber-400 mt-1.5';
  } else {
    let expectedExp = 5;
    if (isMatchedElement) expectedExp += 5;
    const text = `✨ 確定選擇可獲得 +${expectedExp} 經驗值`;
    hintConfirm.innerText = text;
    hintMap.innerText = text;
    hintConfirm.className = 'text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1.5';
    hintMap.className = 'text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1.5';
  }
}

function handleConfirm(needMap) {
  if (!selectedFoodForConfirm) return;

  const foodId = selectedFoodForConfirm.id;
  const foodName = selectedFoodForConfirm.name;
  const foodElement = selectedFoodForConfirm.element;
  
  const kyusei = userBirth ? calculateKyusei(userBirth.year, userBirth.month, userBirth.day) : KYUSEI_DATA[3];
  const fortune = getTodayFortuneAnalysis(kyusei.elementKey);

  const timeStr = new Date().toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  foodHistory.push({ id: foodId, name: foodName, time: timeStr });
  foodCounts[foodId] = (foodCounts[foodId] || 0) + 1;

  localStorage.setItem('food_history', JSON.stringify(foodHistory));
  localStorage.setItem('food_counts', JSON.stringify(foodCounts));

  if (userLevel >= 3 && !userLikes.includes(foodId)) {
    userLikes.push(foodId);
    userDislikes = userDislikes.filter(i => i !== foodId);
    localStorage.setItem('user_likes', JSON.stringify(userLikes));
    localStorage.setItem('user_dislikes', JSON.stringify(userDislikes));
    updateButtonUI(foodId);
  }

  const now = Date.now();
  const cooldownMs = 4 * 60 * 60 * 1000;
  const isCoolingDown = (now - lastEatTime < cooldownMs);
  let gainedExp = 0;
  let expMsg = "";

  if (!isCoolingDown) {
    gainedExp += 5;
    expMsg = "✨ 經驗值 +5";

    // 符合今日開運屬性
    if (foodElement === fortune.targetElementKey) {
      gainedExp += 5;
      expMsg += "<br><span class='text-amber-600 dark:text-amber-300 font-extrabold'>🔥 契合今日開運食補 經驗值額外+5！</span>";
    }

    userExp += gainedExp;
    lastEatTime = now;
    localStorage.setItem('user_exp', userExp);
    localStorage.setItem('last_eat_time', lastEatTime);

    if (guildQuest && guildQuest.progress < 3) {
      if (selectedFoodForConfirm.tags && selectedFoodForConfirm.tags.includes(guildQuest.type)) {
        guildQuest.progress++;
        localStorage.setItem('guild_quest', JSON.stringify(guildQuest));
        expMsg += `<br><span class='text-indigo-600 dark:text-indigo-300 font-extrabold'>⚔️ 副本任務進度 +1 (${guildQuest.progress}/3)</span>`;

        if (guildQuest.progress >= 3) {
          expMsg += `<br><span class='text-amber-500 font-extrabold'>🎉 恭喜完成副本挑戰！點擊公會即可領取靈氣！</span>`;
        }
      }
    }
  } else {
    expMsg = "⏳ 4小時冷卻中，本次確認未獲得經驗值（副本任務進度未推進）";
  }

  let oldLevel = userLevel;
  let currentLv = 1;
  for (let i = LEVEL_UNLOCKS.length - 1; i >= 0; i--) {
    if (userExp >= LEVEL_UNLOCKS[i].expNeeded) {
      currentLv = LEVEL_UNLOCKS[i].level;
      break;
    }
  }

  document.getElementById('modal-confirm-step1').classList.add('hidden');

  if (currentLv > oldLevel) {
    userLevel = currentLv;
    localStorage.setItem('user_level', userLevel);
    pendingCongratModalData = { foodName, expMsg, needMap };
    const tier = LEVEL_UNLOCKS.find(l => l.level === userLevel);
    showLevelUpModal(userLevel, tier ? tier.unlockDesc : "新功能");
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
    finalBtn.onclick = () => {
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(foodName)}`;
      window.open(url, '_blank');
      closeModal();
    };
  } else {
    finalBtn.innerText = '耶！';
    finalBtn.onclick = closeModal;
  }
}

window.closeModal = function() {
  document.getElementById('modal-overlay').classList.add('hidden');
  document.getElementById('modal-birth').classList.add('hidden');
  document.getElementById('modal-kyusei-result').classList.add('hidden');
  document.getElementById('modal-confirm-step1').classList.add('hidden');
  document.getElementById('modal-confirm-step2').classList.add('hidden');
  document.getElementById('modal-settings').classList.add('hidden');
  document.getElementById('modal-stats').classList.add('hidden');
  document.getElementById('modal-levelup').classList.add('hidden');
  document.getElementById('modal-title').classList.add('hidden');
  document.getElementById('modal-guild-list').classList.add('hidden');
  document.getElementById('modal-guild-accept').classList.add('hidden');
  document.getElementById('modal-guild-complete').classList.add('hidden');
  selectedFoodForConfirm = null;
  pendingCongratModalData = null;
};

function checkAndUpdateCooldown() {
  const now = Date.now();
  const diffMs = now - drawState.timestamp;
  const intervalMs = 10 * 60 * 1000;
  
  if (diffMs >= intervalMs && drawState.count < MAX_DRAW) {
    const intervalsPassed = Math.floor(diffMs / intervalMs);
    const addCount = intervalsPassed * 5;
    drawState.count = Math.min(MAX_DRAW, drawState.count + addCount);
    drawState.timestamp = drawState.timestamp + (intervalsPassed * intervalMs);
    saveState();
  }
}

function updateCountersAndTimer() {
  checkAndUpdateCooldown();
  
  const now = Date.now();

  const triviaIntervalMs = 4 * 60 * 60 * 1000;
  if (userLevel >= 6 && settingsPushTrivia && now - lastTriviaAutoTime >= triviaIntervalMs) {
    renderRandomTrivia();
    lastTriviaAutoTime = now;
    localStorage.setItem('last_trivia_auto_time', lastTriviaAutoTime);
  }

  const coinValEl = document.getElementById('coin-counter-val');
  if (coinValEl) {
    coinValEl.innerText = drawState.count;
  }

  const nextRefreshEl = document.getElementById('next-refresh-time');
  if (nextRefreshEl) {
    const intervalMs = 10 * 60 * 1000;
    const elapsed = (now - drawState.timestamp) % intervalMs;
    const remainingMs = intervalMs - elapsed;
    
    const minutes = Math.floor(remainingMs / 60000);
    const seconds = Math.floor((remainingMs % 60000) / 1000);
    const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    nextRefreshEl.innerText = `下一次自動補充：${timeStr}`;
  }

  const timerBar = document.getElementById('cooldown-timer-bar');
  const countdownEl = document.getElementById('cooldown-countdown');
  if (timerBar && countdownEl) {
    const cooldownMs = 4 * 60 * 60 * 1000;
    const elapsedEat = now - lastEatTime;

    if (elapsedEat < cooldownMs) {
      const remainEatMs = cooldownMs - elapsedEat;
      const hrs = Math.floor(remainEatMs / (1000 * 60 * 60));
      const mins = Math.floor((remainEatMs % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((remainEatMs % (1000 * 60)) / 1000);
      countdownEl.innerText = `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      timerBar.classList.remove('hidden');
    } else {
      timerBar.classList.add('hidden');
    }
  }

  const confirmStep1 = document.getElementById('modal-confirm-step1');
  if (confirmStep1 && !confirmStep1.classList.contains('hidden')) {
    updateConfirmModalExpText();
  }
}

function saveState() {
  localStorage.setItem('draw_state', JSON.stringify(drawState));
}

initApp();
