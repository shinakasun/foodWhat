let allFoods = [];
let allTrivias = [];
let allJokes = [];

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
let breakfastMode = localStorage.getItem('breakfast_mode') === 'true';          // 早餐模式開關
let breakfastPromptDate = localStorage.getItem('breakfast_prompt_date') || '';  // 最後一次詢問早餐模式的日期
let currentTheme = localStorage.getItem('app_theme') || 'default';

let guildQuest = JSON.parse(localStorage.getItem('guild_quest') || 'null');
let unlockedAuras = JSON.parse(localStorage.getItem('unlocked_auras') || '[]');
let activeAura = localStorage.getItem('active_aura') || null;
let tempSelectedQuestType = null;
let auraToastTimer = null;
let confirmModalTimer = null;
let lastMealName = null; // 上一次的餐時 (跨餐時自動更新標題)
let lastQuestCoolingState = null; // 任務區上一次是否為冷卻中 (用來偵測冷卻結束)

// 盲盒上限改為 6 個，若先前已解鎖 7 或 8 則收斂至 6
let currentDisplayedFoods = JSON.parse(localStorage.getItem('current_displayed_foods') || '[]');
if (currentDisplayedFoods.length > 6) {
  currentDisplayedFoods = currentDisplayedFoods.slice(0, 6);
  localStorage.setItem('current_displayed_foods', JSON.stringify(currentDisplayedFoods));
}
let currentFavoriteFood = null;

const MAX_DRAW = 20;
let drawState = JSON.parse(localStorage.getItem('draw_state') || JSON.stringify({ count: MAX_DRAW, timestamp: Date.now() }));
if (drawState.count > MAX_DRAW) drawState.count = MAX_DRAW;

// 冷知識與笑話每 1 小時 (3600 秒) 自動刷新一次
const ONE_HOUR_MS = 60 * 60 * 1000;
let lastTriviaRefreshTime = parseInt(localStorage.getItem('last_trivia_refresh_time') || '0');
let lastJokeRefreshTime = parseInt(localStorage.getItem('last_joke_refresh_time') || '0');

let currentTriviaIndex = -1;
let currentJokeIndex = -1;
let selectedFoodForConfirm = null;
let pendingCongratModalData = null;

let dislikeSearchQuery = '';
let bannedSearchQuery = '';
let isComposing = false;

const ONLINE_FOODS_URL = 'https://shinakasun.github.io/foodWhatDataBase/foods.json';
const ONLINE_TRIVIAS_URL = 'https://shinakasun.github.io/foodWhatDataBase/trivias.json';
// 早餐食物在食物資料庫中的標籤名稱（若資料庫實際用別的名稱，只需改這裡）
const BREAKFAST_TAG = 'breakfast';

const ONLINE_JOKES_URL = 'https://shinakasun.github.io/foodWhatDataBase/jokes.json';

const QUEST_CONFIG = {
  cold:      { label: '❄️ 凜冬陣地', shortName: '凜冬陣地', icon: '❄️', auraName: '極寒靈氣', btnLabel: '❄️ 極寒靈氣', cardClass: 'border-blue-200 bg-blue-50/50 text-blue-900' },
  hot:       { label: '🔥 灼熱地城', shortName: '灼熱地城', icon: '🔥', auraName: '灼熱靈氣', btnLabel: '🔥 灼熱靈氣', cardClass: 'border-rose-200 bg-rose-50/50 text-rose-900' },
  snack:     { label: '🍡 小惡魔城', shortName: '小惡魔城', icon: '🍡', auraName: '迅捷靈氣', btnLabel: '⚡ 迅捷靈氣', cardClass: 'border-amber-200 bg-amber-50/50 text-amber-900' },
  fried:     { label: '🌋 罪惡熔爐', shortName: '罪惡熔爐', icon: '🌋', auraName: '罪惡靈氣', btnLabel: '🌋 罪惡靈氣', cardClass: 'border-orange-200 bg-orange-50/50 text-orange-900' }
};
const ALL_QUEST_TYPES = ['cold', 'hot', 'snack', 'fried'];

// 黎明城 / 黎明靈氣已取消：清掉舊存檔中可能殘留的相關資料
if (guildQuest && !QUEST_CONFIG[guildQuest.type]) {
  guildQuest = null;
  localStorage.removeItem('guild_quest');
}
unlockedAuras = unlockedAuras.filter(t => ALL_QUEST_TYPES.includes(t));
localStorage.setItem('unlocked_auras', JSON.stringify(unlockedAuras));
if (activeAura && !ALL_QUEST_TYPES.includes(activeAura)) {
  activeAura = null;
  localStorage.setItem('active_aura', '');
}

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

// 盲盒上限為 6 個 (Lv.9 達到上限)；最高等級解鎖笑話區
const LEVEL_UNLOCKS = [
  { level: 1,  name: "初始狀態 (3選項)",        expNeeded: 0,   unlockDesc: "初始開局" },
  { level: 2,  name: "解鎖第四選項",            expNeeded: 5,   unlockDesc: "第四個盲盒選項" },
  { level: 3,  name: "解鎖主題與個人最愛",      expNeeded: 12,  unlockDesc: "👍 喜歡按鈕、⭐ 個人最愛區與主題風格切換" },
  { level: 4,  name: "解鎖冒險者公會",          expNeeded: 20,  unlockDesc: "🛡️ 冒險者公會副本挑戰系統" },
  { level: 5,  name: "解鎖統計按鈕",            expNeeded: 30,  unlockDesc: "📊 數據統計中心" },
  { level: 6,  name: "解鎖冷知識區",            expNeeded: 42,  unlockDesc: "💡 冷知識區 (每小時自動刷新)" },
  { level: 7,  name: "解鎖第五選項",            expNeeded: 56,  unlockDesc: "第五個盲盒選項" },
  { level: 8,  name: "解鎖討厭按鈕",            expNeeded: 72,  unlockDesc: "👎 討厭按鈕與黑名單" },
  { level: 9,  name: "解鎖第六選項 (盲盒上限)", expNeeded: 90,  unlockDesc: "第六個盲盒選項 (盲盒數量達上限 6 個)" },
  { level: 10, name: "解鎖笑話區 (最高等級)",   expNeeded: 200, unlockDesc: "😂 笑話區 (最高等級解鎖，每小時自動刷新)" }
];
// 最高等級（笑話區在此等級解鎖）。之後要增減等級，只需改上面的 LEVEL_UNLOCKS
const MAX_LEVEL = LEVEL_UNLOCKS[LEVEL_UNLOCKS.length - 1].level;

function getNextOptionUnlockRequirement() {
  if (userLevel === 1) return { nextCount: 4, reqLevel: 2 };
  if (userLevel === 6) return { nextCount: 5, reqLevel: 7 };
  if (userLevel === 8) return { nextCount: 6, reqLevel: 9 };
  return null;
}

async function initApp() {
  const now = Date.now();
  if (!lastTriviaRefreshTime) {
    lastTriviaRefreshTime = now;
    localStorage.setItem('last_trivia_refresh_time', String(lastTriviaRefreshTime));
  }
  if (!lastJokeRefreshTime) {
    lastJokeRefreshTime = now;
    localStorage.setItem('last_joke_refresh_time', String(lastJokeRefreshTime));
  }

  changeTheme(currentTheme);
  setupEventListeners();
  initDateSelectors('select-birth');
  initDateSelectors('select-setting');

  await Promise.all([fetchFoods(), fetchTrivias(), fetchJokes()]);
  checkAndUpdateCooldown();
  updateLevelAndUI(false);
  updateMainTitle();
  updateAdSectionVisibility();

  if (!userBirth) {
    showBirthModal();
  } else {
    updateFortuneText();
    if (currentDisplayedFoods.length === 0) {
      renderEmptyState();
    } else {
      renderMainUI(currentDisplayedFoods);
      if (currentFavoriteFood) renderFavoriteUI(currentFavoriteFood);
    }
  }
  maybeShowBreakfastPrompt();
  updateCountersAndTimer();
  setInterval(updateCountersAndTimer, 1000);
}

function renderEmptyState() {
  const container = document.getElementById('food-container');
  container.innerHTML = `<div class="p-6 border dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-800 text-center text-slate-400 text-xs">尚未進行隨機抽選，請點擊下方按鈕開始！</div>`;
  const favContainer = document.getElementById('favorite-container');
  if (userLevel >= 3 && favContainer) {
    favContainer.innerHTML = `<div class="p-3 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 text-xs text-center">尚未抽選，按下「隨機抽選」後將在此顯示精選美食</div>`;
  }
}

function updateAdSectionVisibility() {
  const adWrapper = document.getElementById('ad-section-wrapper');
  if (!adWrapper) return;
  if (isVIP) {
    adWrapper.classList.add('hidden');
  } else {
    adWrapper.classList.remove('hidden');
  }
}

// 早餐時段：05:00 ~ 10:59
function isBreakfastTime() {
  const hour = new Date().getHours();
  return hour >= 5 && hour < 11;
}

// 早餐模式只在早餐時段內生效，過了早餐時段自動回到一般模式（不會更動已儲存的開關）
function isBreakfastModeActive() {
  return breakfastMode && isBreakfastTime();
}

function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

// 早餐時段打開 APP 時詢問是否進入早餐模式（同一天只問一次）
function maybeShowBreakfastPrompt() {
  if (!userBirth || !isBreakfastTime()) return;
  if (breakfastPromptDate === getTodayKey()) return;
  document.getElementById('modal-overlay').classList.remove('hidden');
  document.getElementById('modal-breakfast').classList.remove('hidden');
}

window.answerBreakfastPrompt = function(enter) {
  breakfastMode = !!enter;
  breakfastPromptDate = getTodayKey();
  localStorage.setItem('breakfast_mode', String(breakfastMode));
  localStorage.setItem('breakfast_prompt_date', breakfastPromptDate);
  closeModal();
};

window.toggleBreakfastMode = function(on) {
  breakfastMode = !!on;
  localStorage.setItem('breakfast_mode', String(breakfastMode));
};

// 當前餐時：早餐 / 午餐 / 晚餐 / 宵夜
function getMealName() {
  const hour = new Date().getHours();
  if (isBreakfastTime()) return "早餐";
  else if (hour >= 11 && hour < 16) return "午餐";
  else if (hour >= 16 && hour < 23) return "晚餐";
  else return "宵夜";
}

function getMealTimeDynamicText() {
  return `吃${getMealName()}囉!`;
}

// 預設的三個稱號，顯示時會自動加上當前餐時（例如「晚餐尋覓者」）
const BASE_TITLES = ["迷途旅人", "愛好者", "尋覓者"];

function getDisplayTitle() {
  return BASE_TITLES.includes(userSelectedTitle) ? `${getMealName()}${userSelectedTitle}` : userSelectedTitle;
}

// 時間格式 HH:MM:SS
function formatHMS(ms) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(total / 3600), m = Math.floor((total % 3600) / 60), s = total % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function updateMainTitle() {
  const titleEl = document.getElementById('app-main-title');
  if (!titleEl) return;
  if (!userBirth) {
    titleEl.innerHTML = `<span>歡迎您！</span><br><span class="text-indigo-600 dark:text-indigo-400">食物迷途旅人 ▼</span>`;
  } else {
    titleEl.innerHTML = `<span>歡迎回來 ${getMealTimeDynamicText()}</span><br><span class="text-indigo-600 dark:text-indigo-400">${getDisplayTitle()} ▼</span>`;
  }
}

const TITLE_TIERS = [
  { threshold: 50, titleSuffix: '化身' },
  { threshold: 30, titleSuffix: '半神' },
  { threshold: 20, titleSuffix: '帝王' },
  { threshold: 15, titleSuffix: '聖人' },
  { threshold: 9,  titleSuffix: '宗師' },
  { threshold: 6,  titleSuffix: '大師' },
  { threshold: 3,  titleSuffix: '專家' },
  { threshold: 1,  titleSuffix: '愛好者' }
];

window.openTitleModal = function() {
  const listEl = document.getElementById('title-options-list');
  const baseTitles = BASE_TITLES;

  const sortedFoods = Object.entries(foodCounts)
    .map(([foodName, count]) => ({ foodName, count }))
    .sort((a, b) => b.count - a.count);

  let html = '';

  baseTitles.forEach(t => {
    const isSelected = userSelectedTitle === t;
    html += `
      <div onclick="selectTitle('${t}')" class="p-2.5 rounded-xl border cursor-pointer flex justify-between items-center transition ${
        isSelected ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-700 dark:text-indigo-300 font-bold' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
      }">
        <span>${t}</span>
        ${isSelected ? '<span class="text-indigo-600">✓</span>' : ''}
      </div>
    `;
  });

  sortedFoods.forEach(({ foodName, count }) => {
    const unlockedTitles = TITLE_TIERS.filter(tier => count >= tier.threshold).map(tier => `${foodName}${tier.titleSuffix}`);
    if (unlockedTitles.length === 0) return;

    const isGroupActive = unlockedTitles.includes(userSelectedTitle);

    html += `
      <div class="border dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 overflow-hidden">
        <div onclick="toggleTitleGroup('${foodName}')" class="p-2.5 cursor-pointer flex justify-between items-center hover:bg-slate-100 dark:hover:bg-slate-700/50 transition">
          <div class="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-200">
            <span>🍱 ${foodName}</span>
            <span class="text-[10px] text-slate-400 font-normal">(${count}次)</span>
            ${isGroupActive ? '<span class="text-xs text-indigo-600">●</span>' : ''}
          </div>
          <span id="title-arrow-${foodName}" class="text-xs text-slate-400 transition-transform">▼</span>
        </div>
        <div id="title-group-${foodName}" class="hidden p-2 pt-0 space-y-1.5 border-t border-slate-100 dark:border-slate-700/60 mt-1">
          ${unlockedTitles.map(t => {
            const isSelected = userSelectedTitle === t;
            return `
              <div onclick="selectTitle('${t}')" class="p-2 rounded-lg border cursor-pointer flex justify-between items-center transition text-xs ${
                isSelected ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-700 dark:text-indigo-300 font-bold' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
              }">
                <span>${t}</span>
                ${isSelected ? '<span class="text-indigo-600 font-bold">✓</span>' : ''}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  });

  listEl.innerHTML = html;
  document.getElementById('modal-overlay').classList.remove('hidden');
  document.getElementById('modal-title').classList.remove('hidden');
};

window.toggleTitleGroup = function(foodName) {
  const groupEl = document.getElementById(`title-group-${foodName}`);
  const arrowEl = document.getElementById(`title-arrow-${foodName}`);
  if (!groupEl) return;
  const isHidden = groupEl.classList.contains('hidden');
  groupEl.classList.toggle('hidden', !isHidden);
  arrowEl.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
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
  let descText = `🎉 恭喜解鎖了：${desc}！`;
  if (lv === 8 && isVIP) {
    descText += `<br><span class="text-amber-500 font-bold text-[11px]">（您已是VIP，討厭按鈕已自動隱藏以保留最大食物顯示空間！）</span>`;
  }
  document.getElementById('levelup-desc').innerHTML = descText;
  document.getElementById('levelup-dislike-tip').classList.toggle('hidden', lv !== 8 || isVIP);
  
  const levelupBtn = document.querySelector('#modal-levelup button');
  if (levelupBtn) levelupBtn.innerText = '耶!繼續吃!';

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
  // 冷知識區 (Lv.6 解鎖)
  const triviaLocked = document.getElementById('trivia-locked-box');
  const triviaWrapper = document.getElementById('trivia-wrapper');
  if (userLevel >= 6 && settingsPushTrivia) {
    triviaLocked.classList.add('hidden');
    triviaWrapper.classList.remove('hidden');
    if (document.getElementById('trivia-content').innerText === '') renderRandomTrivia(false);
  } else if (userLevel === 5) {
    triviaLocked.classList.remove('hidden');
    triviaWrapper.classList.add('hidden');
  } else {
    triviaLocked.classList.add('hidden');
    triviaWrapper.classList.add('hidden');
  }

  // 笑話區 (最高等級解鎖)
  const jokeLocked = document.getElementById('joke-locked-box');
  const jokeWrapper = document.getElementById('joke-wrapper');
  const jokeLevelEl = document.getElementById('joke-unlock-level');
  if (jokeLevelEl) jokeLevelEl.innerText = MAX_LEVEL;
  if (userLevel >= MAX_LEVEL && settingsPushTrivia) {
    jokeLocked.classList.add('hidden');
    jokeWrapper.classList.remove('hidden');
    if (document.getElementById('joke-content').innerText === '') renderRandomJoke(false);
  } else if (userLevel === MAX_LEVEL - 1) {
    jokeLocked.classList.remove('hidden');
    jokeWrapper.classList.add('hidden');
  } else {
    jokeLocked.classList.add('hidden');
    jokeWrapper.classList.add('hidden');
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

// 確保進行中任務擁有明確指定的單一目標食物，避免吃到其他同標籤食物就累積進度
function ensureGuildQuestTargetFood(excludeId = null) {
  if (!guildQuest || guildQuest.progress >= 3) return null;
  if (!guildQuest.currentTargetFood) {
    const eligibleFoods = allFoods.filter(f =>
      f.tags &&
      f.tags.includes(guildQuest.type) &&
      !userBanned.includes(f.id) &&
      (userTaboos.length === 0 || !userTaboos.some(taboo => f.tags.includes(taboo)))
    );
    let pool = eligibleFoods.length > 0 ? eligibleFoods : allFoods.filter(f => f.tags && f.tags.includes(guildQuest.type));
    // 重新抽選時盡量換成不同的目標
    if (excludeId && pool.length > 1) pool = pool.filter(f => f.id !== excludeId);
    const picked = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : { id: '神祕任務料理', element: 'elementMetal' };
    guildQuest.currentTargetFood = picked.id;
    localStorage.setItem('guild_quest', JSON.stringify(guildQuest));
  }
  return guildQuest.currentTargetFood;
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
    const cfg = QUEST_CONFIG[guildQuest.type] || QUEST_CONFIG.cold;
    banner.className = "p-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white text-xs font-bold shadow-md cursor-pointer hover:opacity-95 transition flex justify-between items-center";
    titleEl.innerText = `⚔️ 進行中任務：${cfg.label}`;
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

  const remainingQuests = ALL_QUEST_TYPES.filter(t => !unlockedAuras.includes(t));

  if (guildQuest) {
    abandonBtn.classList.remove('hidden');
    subtext.innerText = "當前正在執行的副本任務（僅食用指定任務目標才計入進度）：";
    const cfg = QUEST_CONFIG[guildQuest.type] || QUEST_CONFIG.cold;
    const eaten = Array.isArray(guildQuest.eaten) ? guildQuest.eaten : [];
    const eatenHtml = eaten.length === 0
      ? `<div class="text-[11px] text-slate-400 dark:text-slate-500">尚未吃過任何食物</div>`
      : `<div class="space-y-1 max-h-32 overflow-y-auto pr-1">` + eaten.slice().reverse().map(e => `
          <div class="flex justify-between items-center gap-2 text-[11px] text-slate-700 dark:text-slate-300">
            <span class="min-w-0 truncate">${e.counted ? '✅' : '▫️'} ${e.name}</span>
            <span class="shrink-0 text-[10px] text-slate-400">${e.time || ''}</span>
          </div>`).join('') + `</div>
        <div class="mt-1 text-[10px] text-slate-400 dark:text-slate-500">✅ 代表有計入任務進度</div>`;
    container.innerHTML = `
      <div class="p-3.5 rounded-xl border-2 border-amber-500 bg-amber-50/70 dark:bg-amber-950/40">
        <div class="flex justify-between items-center mb-1">
          <div class="text-xs font-black text-amber-900 dark:text-amber-200">${cfg.label}</div>
          <span class="text-xs font-bold text-amber-600">進度: ${guildQuest.progress} / 3</span>
        </div>
        <div class="mt-2 pt-2 border-t border-amber-200 dark:border-amber-900">
          <div class="text-[11px] font-bold text-amber-800 dark:text-amber-300 mb-1">📜 本次任務吃過的食物</div>
          ${eatenHtml}
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
    remainingQuests.forEach(type => {
      const cfg = QUEST_CONFIG[type];
      container.innerHTML += `
        <div onclick="openAcceptQuestModal('${type}')" class="p-3 rounded-xl border ${cfg.cardClass} cursor-pointer transition flex justify-between items-center">
          <div>
            <div class="text-xs font-bold">${cfg.label}</div>
            <div class="text-[10px] opacity-80">任務獎勵：${cfg.auraName}</div>
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
  const cfg = QUEST_CONFIG[type];
  document.getElementById('accept-quest-icon').innerText = cfg.icon;
  document.getElementById('accept-quest-title').innerText = `是否接受：${cfg.shortName}？`;
  document.getElementById('accept-quest-desc').innerText = `完成後將獲取${cfg.auraName}！`;
  document.getElementById('modal-guild-list').classList.add('hidden');
  document.getElementById('modal-guild-accept').classList.remove('hidden');
};

window.confirmAcceptQuest = function() {
  if (!tempSelectedQuestType) return;
  guildQuest = { type: tempSelectedQuestType, progress: 0, currentTargetFood: null, eaten: [] };
  ensureGuildQuestTargetFood();
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
  const cfg = QUEST_CONFIG[guildQuest.type] || QUEST_CONFIG.cold;
  document.getElementById('complete-reward-text').innerText = `恭喜完成挑戰，獲得了獎勵：${cfg.auraName}！`;
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
    cold:      '極寒靈氣開啟<br>下一次隨機抽選只會出現清爽的食物囉！',
    hot:       '灼熱靈氣開啟<br>下一次隨機抽選只會出現熱呼呼的食物囉！',
    snack:     '迅捷靈氣開啟<br>下一次隨機抽選只會出現點心/輕食囉！',
    fried:     '罪惡靈氣開啟<br>下一次隨機抽選只會出現油炸類食物囉！'
  };
  showAuraToast(texts[type]);
}

function updateAuraButtonsUI() {
  ALL_QUEST_TYPES.forEach(t => {
    const btn = document.getElementById(`aura-btn-${t}`);
    if (!btn) return;
    const label = QUEST_CONFIG[t].btnLabel;
    if (!unlockedAuras.includes(t)) {
      btn.className = "px-2.5 py-1 text-[11px] rounded-lg border transition font-bold whitespace-nowrap bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 opacity-60";
      btn.innerText = `${label} (未解鎖)`;
    } else if (activeAura === t) {
      btn.className = "px-2.5 py-1 text-[11px] rounded-lg border transition font-bold whitespace-nowrap bg-indigo-600 text-white border-indigo-600 shadow-sm";
      btn.innerText = label;
    } else {
      btn.className = "px-2.5 py-1 text-[11px] rounded-lg border transition font-bold whitespace-nowrap bg-white dark:bg-slate-900 text-indigo-600 border-indigo-200 hover:bg-indigo-50";
      btn.innerText = label;
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
  alert('⚡ [測試功能] 經驗值冷卻已成功歸零！');
};

window.checkFeatureLock = function(featureKey) {
  const reqLevels = { stats: 5, trivia: 6, guild: 4, favorite: 3, like: 3, dislike: 8, joke: MAX_LEVEL };
  const reqNames = {
    stats:    "📊 數據統計中心 (Lv.5)",
    trivia:   "💡 冷知識區 (Lv.6)",
    guild:    "🛡️ 冒險者公會 (Lv.4)",
    favorite: "⭐ 個人最愛精選 (Lv.3)",
    like:     "👍 喜歡按鈕 (Lv.3)",
    dislike:  "👎 討厭按鈕 (Lv.8)",
    joke:     `😂 笑話區 (Lv.${MAX_LEVEL} 滿級)`
  };
  if (userLevel < (reqLevels[featureKey] || 1)) {
    alert(`🔒 此功能尚未解鎖！\n需要達到 【${reqNames[featureKey]}】 才能使用（目前 Lv.${userLevel}）。`);
  }
};

// 食物盲盒數量上限改為 6 個
function getUnlockBoxCount() {
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
    if (currentDisplayedFoods.length > 0) {
      currentDisplayedFoods = currentDisplayedFoods.slice(0, 6).map(oldFood => {
        const latestFood = allFoods.find(f => f.id === oldFood.id);
        return latestFood ? latestFood : oldFood;
      });
      localStorage.setItem('current_displayed_foods', JSON.stringify(currentDisplayedFoods));
    }
  } catch (err) {
    document.getElementById('food-container').innerHTML = `<div class="text-center py-6 text-red-500 font-bold">無法連線至食物資料庫</div>`;
  }
}

async function fetchTrivias() {
  try {
    const res = await fetch(`${ONLINE_TRIVIAS_URL}?t=${Date.now()}`);
    if (!res.ok) return;
    allTrivias = await res.json();
    if (userLevel >= 6 && settingsPushTrivia) renderRandomTrivia(false);
  } catch (err) {}
}

async function fetchJokes() {
  try {
    const res = await fetch(`${ONLINE_JOKES_URL}?t=${Date.now()}`);
    if (!res.ok) throw new Error('jokes.json 載入失敗');
    const data = await res.json();
    allJokes = Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('載入 jokes.json 失敗:', err);
    allJokes = [];
  }
  if (userLevel >= MAX_LEVEL && settingsPushTrivia) renderRandomJoke(false);
}

function renderRandomTrivia(resetAutoTimer = true) {
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
  document.getElementById('trivia-content').innerText = typeof selectedTrivia === 'string' ? selectedTrivia : (selectedTrivia.content || '');
  if (resetAutoTimer) {
    lastTriviaRefreshTime = Date.now();
    localStorage.setItem('last_trivia_refresh_time', String(lastTriviaRefreshTime));
  }
  triviaWrapper.classList.remove('hidden');
}

function renderRandomJoke(resetAutoTimer = true) {
  if (userLevel < MAX_LEVEL) return;
  const jokeWrapper = document.getElementById('joke-wrapper');
  const jokeContentEl = document.getElementById('joke-content');
  if (!settingsPushTrivia) {
    jokeWrapper.classList.add('hidden');
    return;
  }
  if (allJokes.length === 0) {
    jokeContentEl.innerText = '無法載入笑話資料庫 (jokes.json)';
    jokeWrapper.classList.remove('hidden');
    return;
  }
  let availableJokes = allJokes;
  if (currentJokeIndex >= 0 && allJokes.length > 1) {
    availableJokes = allJokes.filter((_, idx) => idx !== currentJokeIndex);
  }
  const selectedJoke = availableJokes[Math.floor(Math.random() * availableJokes.length)];
  currentJokeIndex = allJokes.indexOf(selectedJoke);
  jokeContentEl.innerText = typeof selectedJoke === 'string' ? selectedJoke : (selectedJoke.content || selectedJoke.text || '');
  if (resetAutoTimer) {
    lastJokeRefreshTime = Date.now();
    localStorage.setItem('last_joke_refresh_time', String(lastJokeRefreshTime));
  }
  jokeWrapper.classList.remove('hidden');
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
  renderRandomTrivia(true);
  updateCountersAndTimer();
};

// 笑話區刷新水晶直接刷新
window.refreshJokeWithCoin = function() {
  if (!isVIP && drawState.count <= 0) {
    alert('刷新水晶不足！可購買正式版享有無限水晶，或看廣告補充。');
    return;
  }
  if (!isVIP) {
    drawState.count--;
    saveState();
    showExpToast('toast-joke-floating');
  }
  renderRandomJoke(true);
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
  if (userLevel < 6) { alert('🔒 冷知識與笑話區尚未解鎖！'); return; }
  settingsPushTrivia = show;
  localStorage.setItem('push_trivia', show);
  if (show) {
    renderRandomTrivia(false);
    if (userLevel >= MAX_LEVEL) renderRandomJoke(false);
  } else {
    document.getElementById('trivia-wrapper').classList.add('hidden');
    document.getElementById('joke-wrapper').classList.add('hidden');
  }
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
  document.getElementById('setting-breakfast-mode').checked = breakfastMode;
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
  renderDislikeManager();
  renderBannedManager();

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

function renderDislikeManager() {
  const container = document.getElementById('dislike-manager-section');
  if (!container) return;

  const filtered = userDislikes.filter(item => item.includes(dislikeSearchQuery));

  let html = '';
  if (userDislikes.length > 5) {
    html += `
      <div class="mb-2">
        <input type="text" id="dislike-search-input" value="${dislikeSearchQuery}" 
          oncompositionstart="isComposing=true" 
          oncompositionend="isComposing=false; onDislikeSearchInput(this.value)" 
          oninput="if(!isComposing) onDislikeSearchInput(this.value)" 
          placeholder="🔍 輸入關鍵字篩選討厭品項..." class="w-full p-2 border dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-white focus:outline-none">
      </div>
    `;
  }

  if (filtered.length === 0) {
    html += `<p class="text-slate-400 italic py-2 text-center">沒有符合條件的討厭品項</p>`;
  } else {
    const scrollClass = userDislikes.length > 5 ? 'max-h-40 overflow-y-auto pr-1 space-y-1.5 border border-slate-200 dark:border-slate-700 p-2 rounded-xl bg-slate-50/50 dark:bg-slate-800/50' : 'space-y-1.5';
    html += `<div class="${scrollClass}">`;
    html += filtered.map(foodName => `
      <div class="flex justify-between items-center p-1.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
        <span class="text-slate-700 dark:text-slate-200">${foodName}</span>
        <button onclick="removeDislikeItem('${foodName}')" class="text-[11px] text-rose-500 border border-rose-200 px-2 py-0.5 rounded hover:bg-rose-50">解除討厭</button>
      </div>
    `).join('');
    html += `</div>`;
  }
  container.innerHTML = html;
}

window.onDislikeSearchInput = function(val) {
  dislikeSearchQuery = val;
  renderDislikeManager();
};

window.removeDislikeItem = function(foodName) {
  userDislikes = userDislikes.filter(i => i !== foodName);
  localStorage.setItem('user_dislikes', JSON.stringify(userDislikes));
  renderDislikeManager();
  updateSingleFoodCardDOM(foodName);
};

function renderBannedManager() {
  const container = document.getElementById('banned-manager-section');
  const badge = document.getElementById('vip-status-badge');
  if (!container) return;

  if (isVIP) {
    badge.innerText = '⭐ 正式版已啟用';
    badge.className = 'text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 dark:text-amber-300 font-bold';
  } else {
    badge.innerText = '免費版 (未啟用)';
    badge.className = 'text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 font-medium';
  }

  if (!isVIP) {
    container.innerHTML = `<div class="p-2.5 border border-amber-200 rounded-xl bg-amber-50 text-amber-800 text-[11px] text-center">🔒 升級正式版即可將食物完全禁用！</div>`;
    return;
  }

  const filtered = userBanned.filter(item => item.includes(bannedSearchQuery));

  let html = '';
  if (userBanned.length > 5) {
    html += `
      <div class="mb-2">
        <input type="text" id="banned-search-input" value="${bannedSearchQuery}" 
          oncompositionstart="isComposing=true" 
          oncompositionend="isComposing=false; onBannedSearchInput(this.value)" 
          oninput="if(!isComposing) onBannedSearchInput(this.value)" 
          placeholder="🔍 輸入關鍵字篩選禁用品項..." class="w-full p-2 border dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-white focus:outline-none">
      </div>
    `;
  }

  if (filtered.length === 0) {
    html += `<p class="text-slate-400 italic py-2 text-center">目前沒有被完全禁用的食物</p>`;
  } else {
    const scrollClass = userBanned.length > 5 ? 'max-h-40 overflow-y-auto pr-1 space-y-1.5 border border-slate-200 dark:border-slate-700 p-2 rounded-xl bg-slate-50/50 dark:bg-slate-800/50' : 'space-y-1.5';
    html += `<div class="${scrollClass}">`;
    html += filtered.map(foodName => `
      <div class="flex justify-between items-center p-1.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
        <span class="text-slate-700 dark:text-slate-200">${foodName}</span>
        <button onclick="unmarkBanned('${foodName}')" class="text-[11px] text-indigo-500 border border-indigo-200 px-2 py-0.5 rounded hover:bg-indigo-50">解除禁用</button>
      </div>
    `).join('');
    html += `</div>`;
  }
  container.innerHTML = html;
}

window.onBannedSearchInput = function(val) {
  bannedSearchQuery = val;
  renderBannedManager();
};

window.unmarkBanned = function(foodName) {
  userBanned = userBanned.filter(i => i !== foodName);
  localStorage.setItem('user_banned', JSON.stringify(userBanned));
  renderBannedManager();
  updateSingleFoodCardDOM(foodName);
};

window.openVipStoreModal = function() {
  document.getElementById('modal-overlay').classList.remove('hidden');
  document.getElementById('modal-settings').classList.add('hidden');
  document.getElementById('modal-vip-store').classList.remove('hidden');
};

window.confirmBuyVIP = function() {
  isVIP = true;
  localStorage.setItem('is_vip', 'true');
  alert('🎉 恭喜您成功開通正式版！已隱藏廣告區塊、解鎖無限水晶、隱藏討厭按鈕以擴大食物顯示空間！');
  closeModal();
  updateAdSectionVisibility();
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
    alert('⭐ 您已是正式版會員，無需觀看廣告！');
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

  // 任務進行中：每次重新抽選，任務目標也一併重新抽選
  if (isDrawn && guildQuest && guildQuest.progress < 3) {
    const prevTarget = guildQuest.currentTargetFood;
    guildQuest.currentTargetFood = null;
    ensureGuildQuestTargetFood(prevTarget);
  }

  if (isDrawn || currentDisplayedFoods.length === 0) {
    let pool = [...allFoods];
    if (userTaboos.length > 0) {
      pool = pool.filter(f => !f.tags || !userTaboos.some(taboo => f.tags.includes(taboo)));
    }
    pool = pool.filter(f => !userBanned.includes(f.id));

    if (activeAura) {
      pool = pool.filter(f => f.tags && f.tags.includes(activeAura));
    }
    // 早餐模式：早餐時段內只抽帶有早餐標籤的食物（資料庫還沒有符合的早餐食物時，退回一般模式）
    if (isBreakfastModeActive()) {
      const breakfastPool = pool.filter(f => f.tags && f.tags.includes(BREAKFAST_TAG));
      if (breakfastPool.length > 0) pool = breakfastPool;
    }
    currentDisplayedFoods = weightedSample(pool, getUnlockBoxCount(), fortune.targetElementKey);
    localStorage.setItem('current_displayed_foods', JSON.stringify(currentDisplayedFoods));

    if (userLevel >= 3) {
      currentFavoriteFood = sampleFavorite();
    }
  }

  renderMainUI(currentDisplayedFoods);
  if (userLevel >= 3) {
    renderFavoriteUI(currentFavoriteFood);
  }
  updateCountersAndTimer();
}

function weightedSample(list, k, targetElementKey) {
  let tempPool = [...list];
  let result = [];
  for (let i = 0; i < k; i++) {
    if (tempPool.length === 0) break;
    let totalWeight = tempPool.reduce((acc, item) => {
      let weight = (!isVIP && userDislikes.includes(item.id)) ? 0.2 : 1.0;
      if (item.element === targetElementKey) weight *= 2.0;
      return acc + weight;
    }, 0);
    let randomNum = Math.random() * totalWeight;
    let weightSum = 0;
    for (let j = 0; j < tempPool.length; j++) {
      let item = tempPool[j];
      let weight = (!isVIP && userDislikes.includes(item.id)) ? 0.2 : 1.0;
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
  const cappedFoods = foods.slice(0, 6);
  if (cappedFoods.length === 0) { container.innerHTML = '<p class="text-slate-400 text-center py-6">沒有符合條件的食物！</p>'; return; }

  cappedFoods.forEach((food, index) => {
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
    // 冷卻中：整塊任務區被灰色覆蓋、無法點擊，也不透露目標食物
    card.className = 'relative overflow-hidden p-3.5 border-2 border-slate-300 rounded-xl bg-slate-100 flex justify-between items-center gap-2 shadow-sm select-none pointer-events-none cursor-not-allowed';
    card.innerHTML = `
      <div class="flex items-center gap-2.5 min-w-0 flex-1 opacity-60">
        <span>🎯</span>
        <div class="min-w-0 flex-1">
          <div class="text-[10px] font-bold text-slate-500 leading-none mb-1">任務指定目標：</div>
          <div class="font-black text-sm text-slate-500">？？？</div>
        </div>
      </div>
      <div class="absolute inset-0 flex items-center justify-center gap-1.5 bg-slate-500/70 text-white font-bold text-sm">
        <span>⏳</span><span>冷卻中</span><span id="quest-cooldown-countdown" class="font-mono">${formatHMS(cooldownMs - (now - lastEatTime))}</span>
      </div>
    `;
  } else {
    const foodName = ensureGuildQuestTargetFood() || '神祕任務料理';
    const targetFood = allFoods.find(f => f.id === foodName) || { id: foodName, element: 'elementMetal' };
    const safeId = btoa(encodeURIComponent("guild_" + foodName)).replace(/=/g, '');
    const elemInfo = ELEMENT_MAP[targetFood.element] || { name: '未知', icon: '❓', class: 'text-slate-500 bg-slate-100' };

    card.className = 'p-3.5 border-2 border-indigo-500 rounded-xl bg-indigo-50/70 flex justify-between items-center shadow-sm cursor-pointer hover:bg-indigo-100 transition gap-2';
    card.onclick = () => openFoodConfirmModal(foodName, true);
    card.innerHTML = `
      <div class="flex items-center gap-2.5 min-w-0 flex-1">
        <span>🎯</span>
        <div class="min-w-0 flex-1 overflow-hidden">
          <div class="text-[10px] font-bold text-indigo-500 leading-none mb-1">任務指定目標：</div>
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
    container.innerHTML = `<div class="p-3 border border-amber-200 rounded-xl bg-amber-50 text-amber-700 text-xs text-center">💡 尚未進行隨機抽選或無最愛品項，按下「隨機抽選」後將在此顯示精選美食！</div>`;
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
  card.className = 'p-3 border dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-800 flex justify-between items-center shadow-sm hover:bg-slate-100 transition gap-2';
  
  const likeBtnClass = isLiked ? 'like-active-btn shadow-sm' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 hover:bg-slate-200';
  const likeAction = (userLevel >= 3) ? `togglePreference('${foodName.replace(/'/g, "\\'")}', 'like')` : `checkFeatureLock('like')`;
  const likeDisplay = (userLevel >= 3) ? '👍' : '🔒';

  let dislikeButtonHTML = '';
  if (!isVIP) {
    const dislikeBtnClass = isDisliked ? 'dislike-active-btn shadow-sm' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 hover:bg-slate-200';
    const dislikeAction = (userLevel >= 8) ? `togglePreference('${foodName.replace(/'/g, "\\'")}', 'dislike')` : `checkFeatureLock('dislike')`;
    const dislikeDisplay = (userLevel >= 8) ? '👎' : '🔒';
    dislikeButtonHTML = `<button onclick="${dislikeAction}" class="px-2 py-1 text-xs rounded-lg border transition taboo-btn ${dislikeBtnClass}" title="討厭">${dislikeDisplay}</button>`;
  }

  let banBtnClass = 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 hover:bg-slate-200';
  let banDisplay = '🔒 ⛔';
  let banAction = `openVipRequiredModal()`;

  if (isVIP) {
    banDisplay = isBanned ? '🚫' : '⛔';
    banAction = `toggleBanFood('${foodName.replace(/'/g, "\\'")}')`;
    if (isBanned) banBtnClass = 'ban-active-btn shadow-sm';
  }

  card.innerHTML = `
    <div class="cursor-pointer flex-1 min-w-0 flex items-center gap-1.5 overflow-hidden" onclick="openFoodConfirmModal('${foodName.replace(/'/g, "\\'")}', false)">
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
      ${dislikeButtonHTML}
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
    userLikes = userLikes.filter(i => i !== foodName);
    localStorage.setItem('user_likes', JSON.stringify(userLikes));
  }
  localStorage.setItem('user_banned', JSON.stringify(userBanned));
  
  updateSingleFoodCardDOM(foodName);
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
    
    if (userLikes.includes(foodName)) {
      userLikes = userLikes.filter(i => i !== foodName);
    } else {
      userLikes.push(foodName);
      userDislikes = userDislikes.filter(i => i !== foodName);
      userBanned = userBanned.filter(i => i !== foodName);
    }
  } else if (type === 'dislike') {
    if (userLevel < 8) { alert('🔒 討厭按鈕需達到 Lv.8 才能使用！'); return; }
    
    if (userDislikes.includes(foodName)) {
      userDislikes = userDislikes.filter(i => i !== foodName);
    } else {
      userDislikes.push(foodName);
      userLikes = userLikes.filter(i => i !== foodName);
      userBanned = userBanned.filter(i => i !== foodName);
    }
  }

  localStorage.setItem('user_likes', JSON.stringify(userLikes));
  localStorage.setItem('user_dislikes', JSON.stringify(userDislikes));
  localStorage.setItem('user_banned', JSON.stringify(userBanned));
  
  updateSingleFoodCardDOM(foodName);
};

function updateSingleFoodCardDOM(foodName) {
  const cards = document.querySelectorAll(`[id^="food-card-"]`);
  
  cards.forEach(card => {
    const titleEl = card.querySelector('h3');
    if (titleEl && titleEl.title === foodName) {
      const isLiked = userLikes.includes(foodName);
      const isDisliked = userDislikes.includes(foodName);
      const isBanned = userBanned.includes(foodName);

      const buttons = card.querySelectorAll('button');
      let btnIdx = 0;
      const likeBtn = buttons[btnIdx++];
      if (likeBtn) {
        likeBtn.className = `px-2 py-1 text-xs rounded-lg border transition ${isLiked ? 'like-active-btn shadow-sm' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 hover:bg-slate-200'}`;
      }

      if (!isVIP) {
        const dislikeBtn = buttons[btnIdx++];
        if (dislikeBtn) {
          dislikeBtn.className = `px-2 py-1 text-xs rounded-lg border transition taboo-btn ${isDisliked ? 'dislike-active-btn shadow-sm' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 hover:bg-slate-200'}`;
        }
      }

      const banBtn = buttons[btnIdx++];
      if (banBtn && isVIP) {
        banBtn.innerText = isBanned ? '🚫' : '⛔';
        banBtn.className = `px-2 py-1 text-xs rounded-lg border transition ${isBanned ? 'ban-active-btn shadow-sm' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 hover:bg-slate-200'}`;
      }
    }
  });
}

window.openFoodConfirmModal = function(foodName, isFromGuildCard = false) {
  selectedFoodForConfirm = allFoods.find(f => f.id === foodName) || { id: foodName, element: 'elementMetal', tags: [] };
  selectedFoodForConfirm._fromGuildCard = isFromGuildCard;

  const kyusei = userBirth ? calculateKyusei(userBirth.year, userBirth.month, userBirth.day) : KYUSEI_DATA[3];
  const fortune = getTodayFortuneAnalysis(kyusei.elementKey);
  document.getElementById('confirm-title').innerText = `確定要吃 ${selectedFoodForConfirm.id} 嗎？`;
  document.getElementById('confirm-element-bonus-hint').classList.toggle('hidden', selectedFoodForConfirm.element !== fortune.targetElementKey);

  updateConfirmModalExpText();
  if (confirmModalTimer) clearInterval(confirmModalTimer);
  confirmModalTimer = setInterval(updateConfirmModalExpText, 1000);

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

  // 任務進行中：記錄本次任務期間吃過的每一道食物（counted = 有計入任務進度）
  let questEntry = null;
  if (guildQuest && guildQuest.progress < 3) {
    if (!Array.isArray(guildQuest.eaten)) guildQuest.eaten = [];
    questEntry = { name: foodName, counted: false, time: timeStr };
    guildQuest.eaten.push(questEntry);
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
    localStorage.setItem('user_exp', userExp);
    localStorage.setItem('last_eat_time', lastEatTime);

    // 嚴格比對：必須是任務區指定的目標食物 (guildQuest.currentTargetFood) 才累積進度
    if (guildQuest && guildQuest.progress < 3) {
      const targetFoodName = ensureGuildQuestTargetFood();
      if (foodName === targetFoodName) {
        guildQuest.progress++;
        if (questEntry) questEntry.counted = true;
        // 每次成功完成一步，抽出下一個新的指定任務目標食物
        if (guildQuest.progress < 3) {
          guildQuest.currentTargetFood = null;
          ensureGuildQuestTargetFood();
        }
        localStorage.setItem('guild_quest', JSON.stringify(guildQuest));
        expMsg += `<br><span class='text-indigo-600 font-extrabold'>⚔️ 副本任務進度 +1 (${guildQuest.progress}/3)</span>`;
        if (guildQuest.progress >= 3) expMsg += `<br><span class='text-amber-500 font-extrabold'>🎉 恭喜完成副本挑戰！點擊公會即可領取靈氣！</span>`;
      }
    }
  } else {
    expMsg = "⏳ 4小時冷卻中，本次確認未獲得經驗值";
  }
  if (questEntry) localStorage.setItem('guild_quest', JSON.stringify(guildQuest));

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
  renderMainUI(currentDisplayedFoods);
}

function showCongratModal(foodName, expMsg, needMap) {
  document.getElementById('modal-confirm-step2').classList.remove('hidden');
  document.getElementById('congrat-text').innerText = `今天就吃 ${foodName} 吧！`;
  document.getElementById('exp-reward-box').innerHTML = expMsg;
  const finalBtn = document.getElementById('btn-final-action');
  
  finalBtn.innerText = '耶!繼續吃!';

  if (needMap) {
    finalBtn.onclick = () => { window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(foodName)}`, '_blank'); closeModal(); };
  } else {
    finalBtn.onclick = closeModal;
  }
}

window.closeModal = function() {
  if (confirmModalTimer) {
    clearInterval(confirmModalTimer);
    confirmModalTimer = null;
  }
  document.getElementById('modal-overlay').classList.add('hidden');
  document.querySelectorAll('#modal-overlay > div').forEach(m => m.classList.add('hidden'));
  selectedFoodForConfirm = null;
  pendingCongratModalData = null;
};

function checkAndUpdateCooldown() {
  // 水晶已滿時，補充計時點持續跟著「現在」走；
  // 這樣第一次消耗水晶時，倒數才會從 10:00 重新開始，而不是被舊的計時點瞬間補滿
  if (drawState.count >= MAX_DRAW) {
    drawState.timestamp = Date.now();
    return;
  }
  const diffMs = Date.now() - drawState.timestamp;
  const intervalMs = 10 * 60 * 1000;
  if (diffMs >= intervalMs && drawState.count < MAX_DRAW) {
    const intervalsPassed = Math.floor(diffMs / intervalMs);
    drawState.count = Math.min(MAX_DRAW, drawState.count + (intervalsPassed * 5));
    drawState.timestamp += intervalsPassed * intervalMs;
    saveState();
  }
}

function formatHourCountdown(remainMs) {
  const totalSec = Math.max(0, Math.floor(remainMs / 1000));
  const hrs = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;
  if (hrs > 0) {
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function updateCountersAndTimer() {
  checkAndUpdateCooldown();
  const now = Date.now();
  const remainEatMs = Math.max(0, (4 * 60 * 60 * 1000) - (now - lastEatTime));

  // 冷知識：每 1 小時自動刷新一次 + 旁邊倒數計時器
  if (!lastTriviaRefreshTime) {
    lastTriviaRefreshTime = now;
    localStorage.setItem('last_trivia_refresh_time', String(lastTriviaRefreshTime));
  }
  let elapsedTrivia = now - lastTriviaRefreshTime;
  if (elapsedTrivia >= ONE_HOUR_MS) {
    const cycles = Math.floor(elapsedTrivia / ONE_HOUR_MS);
    lastTriviaRefreshTime += cycles * ONE_HOUR_MS;
    localStorage.setItem('last_trivia_refresh_time', String(lastTriviaRefreshTime));
    if (userLevel >= 6 && settingsPushTrivia && allTrivias.length > 0) {
      renderRandomTrivia(false);
    }
    elapsedTrivia = now - lastTriviaRefreshTime;
  }
  const remainTriviaMs = Math.max(0, ONE_HOUR_MS - elapsedTrivia);
  const triviaAutoTimerEl = document.getElementById('trivia-auto-timer');
  if (triviaAutoTimerEl) {
    triviaAutoTimerEl.innerText = `⏱️ ${formatHourCountdown(remainTriviaMs)}`;
  }

  // 笑話區：每 1 小時自動刷新一次 + 旁邊倒數計時器
  if (!lastJokeRefreshTime) {
    lastJokeRefreshTime = now;
    localStorage.setItem('last_joke_refresh_time', String(lastJokeRefreshTime));
  }
  let elapsedJoke = now - lastJokeRefreshTime;
  if (elapsedJoke >= ONE_HOUR_MS) {
    const cycles = Math.floor(elapsedJoke / ONE_HOUR_MS);
    lastJokeRefreshTime += cycles * ONE_HOUR_MS;
    localStorage.setItem('last_joke_refresh_time', String(lastJokeRefreshTime));
    if (userLevel >= MAX_LEVEL && settingsPushTrivia) {
      renderRandomJoke(false);
    }
    elapsedJoke = now - lastJokeRefreshTime;
  }
  const remainJokeMs = Math.max(0, ONE_HOUR_MS - elapsedJoke);
  const jokeAutoTimerEl = document.getElementById('joke-auto-timer');
  if (jokeAutoTimerEl) {
    jokeAutoTimerEl.innerText = `⏱️ ${formatHourCountdown(remainJokeMs)}`;
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

  const mealNow = getMealName();
  if (mealNow !== lastMealName) {
    lastMealName = mealNow;
    updateMainTitle();
  }

  // 任務區冷卻狀態改變 (例如冷卻剛結束) 時，重新繪製任務卡片
  const questCooling = remainEatMs > 0;
  if (questCooling !== lastQuestCoolingState) {
    const shouldRerender = lastQuestCoolingState !== null && guildQuest && guildQuest.progress < 3 && currentDisplayedFoods.length > 0;
    lastQuestCoolingState = questCooling;
    if (shouldRerender) renderMainUI(currentDisplayedFoods);
  }

  const questCountdownEl = document.getElementById('quest-cooldown-countdown');
  if (questCountdownEl && remainEatMs > 0) questCountdownEl.innerText = formatHMS(remainEatMs);

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
