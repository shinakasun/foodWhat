let allFoods = [];
let allTrivias = [];
let currentFilter = 'all';

let userExp = parseInt(localStorage.getItem('user_exp') || '0');
let userLevel = parseInt(localStorage.getItem('user_level') || '1');
let lastEatTime = parseInt(localStorage.getItem('last_eat_time') || '0');

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

const MAX_DRAW = 9999;
let drawState = JSON.parse(localStorage.getItem('draw_state') || JSON.stringify({ count: MAX_DRAW, timestamp: Date.now() }));
let selectedFoodForConfirm = null;

const ONLINE_FOODS_URL = 'https://shinakasun.github.io/foodWhatDataBase/foods.json';
const ONLINE_TRIVIAS_URL = 'https://shinakasun.github.io/foodWhatDataBase/trivias.json';

const ELEMENT_MAP = {
  elementMetal: { name: '金', icon: '🪙', class: 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-800' },
  elementWood:  { name: '木', icon: '🪵', class: 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800' },
  elementWater: { name: '水', icon: '💧', class: 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-800' },
  elementFire:  { name: '火', icon: '🔥', class: 'text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:border-rose-800' },
  elementEarth: { name: '土', icon: '⛰️', class: 'text-yellow-700 bg-yellow-50 border-yellow-200 dark:bg-yellow-950/40 dark:border-yellow-800' }
};

const LEVEL_UNLOCKS = [
  { level: 1, name: "初始狀態 (3選項)", expNeeded: 0, unlockDesc: "初始開局" },
  { level: 2, name: "解鎖第四選項", expNeeded: 5, unlockDesc: "第四個盲盒選項" },
  { level: 3, name: "解鎖喜歡按鈕", expNeeded: 12, unlockDesc: "👍 喜歡按鈕與深色模式" },
  { level: 4, name: "解鎖個人最愛精選", expNeeded: 20, unlockDesc: "⭐ 個人最愛精選鎖定區" },
  { level: 5, name: "解鎖統計按鈕", expNeeded: 30, unlockDesc: "📊 數據統計中心" },
  { level: 6, name: "解鎖美食冷知識", expNeeded: 42, unlockDesc: "💡 每日美食冷知識區" },
  { level: 7, name: "解鎖第五選項", expNeeded: 56, unlockDesc: "第五個盲盒選項" },
  { level: 8, name: "解鎖討厭按鈕", expNeeded: 72, unlockDesc: "👎 討厭按鈕與黑名單" },
  { level: 9, name: "解鎖第六選項", expNeeded: 90, unlockDesc: "第六個盲盒選項" },
  { level: 10, name: "解鎖第七選項", expNeeded: 110, unlockDesc: "第七個盲盒選項" },
  { level: 11, name: "解鎖第八選項", expNeeded: 135, unlockDesc: "第八個盲盒選項" },
  { level: 12, name: "解鎖第九選項", expNeeded: 165, unlockDesc: "第九個盲盒選項 (完全體)" },
  { level: 13, name: "解鎖一整套篩選按鈕", expNeeded: 200, unlockDesc: "🥗 全情境美食篩選按鈕組" }
];

async function initApp() {
  toggleDarkMode(isDarkMode);
  setupEventListeners();

  await Promise.all([fetchFoods(), fetchTrivias()]);
  checkAndUpdateCooldown();
  updateLevelAndUI(false);

  if (!userBirth) {
    showBirthModal();
  } else {
    updateFortuneText();
    filterAndDraw(false);
  }
  
  setInterval(updateCountersAndTimer, 1000);
}

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

  if (nextTier) {
    const spanExp = nextTier.expNeeded - currentTier.expNeeded;
    const currentProgress = userExp - currentTier.expNeeded;
    const pct = Math.min(100, Math.max(0, (currentProgress / spanExp) * 100));
    expText.innerText = `經驗值: ${userExp} / ${nextTier.expNeeded}`;
    expBar.style.width = `${pct}%`;
  } else {
    expText.innerText = `經驗值: ${userExp} (已滿級)`;
    expBar.style.width = `100%`;
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
  document.getElementById('modal-levelup').classList.remove('hidden');
}

function applyFeatureUnlocks() {
  const triviaLocked = document.getElementById('trivia-locked-box');
  const triviaWrapper = document.getElementById('trivia-wrapper');
  if (userLevel >= 6 && settingsPushTrivia) {
    triviaLocked.classList.add('hidden');
    triviaWrapper.classList.remove('hidden');
    renderRandomTrivia();
  } else if (userLevel >= 6) {
    triviaLocked.classList.add('hidden');
    triviaWrapper.classList.add('hidden');
  } else {
    triviaLocked.classList.remove('hidden');
    triviaWrapper.classList.add('hidden');
  }

  const filterLocked = document.getElementById('filter-locked-box');
  const filterBar = document.getElementById('filter-bar');
  if (userLevel >= 13) {
    filterLocked.classList.add('hidden');
    filterBar.classList.remove('hidden');
  } else {
    filterLocked.classList.remove('hidden');
    filterBar.classList.add('hidden');
  }

  const statBtn = document.getElementById('btn-stats-action');
  if (userLevel >= 5) {
    statBtn.className = "px-2.5 py-1 text-xs rounded-xl border transition flex items-center gap-1 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-indigo-500";
    statBtn.innerHTML = "📊 統計";
  } else {
    statBtn.className = "px-2.5 py-1 text-xs rounded-xl border transition flex items-center gap-1 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700";
    statBtn.innerHTML = "🔒 📊 統計";
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
  if (userLevel >= 4) {
    favLabel.innerText = '⭐ 個人最愛精選';
    favLabel.className = 'text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1';
    if (favLocked) favLocked.classList.add('hidden');
  } else {
    favLabel.innerText = '❓ 個人最愛精選 (Lv.4 解鎖)';
    favLabel.className = 'text-xs font-bold text-slate-400 dark:text-slate-600 flex items-center gap-1';
    if (favLocked) favLocked.classList.remove('hidden');
  }
}

window.checkFeatureLock = function(featureKey) {
  const reqLevels = {
    stats: 5,
    trivia: 6,
    filters: 13,
    favorite: 4,
    like: 3,
    dislike: 8
  };
  const reqNames = {
    stats: "📊 數據統計中心 (Lv.5)",
    trivia: "💡 美食冷知識 (Lv.6)",
    filters: "🥗 篩選按鈕組 (Lv.13)",
    favorite: "⭐ 個人最愛精選 (Lv.4)",
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

// 3. 保留冷知識標題，內文無微型標題
function renderRandomTrivia() {
  if (userLevel < 6) return;
  const triviaWrapper = document.getElementById('trivia-wrapper');
  if (!settingsPushTrivia || allTrivias.length === 0) {
    triviaWrapper.classList.add('hidden');
    return;
  }
  const random = allTrivias[Math.floor(Math.random() * allTrivias.length)];
  document.getElementById('trivia-content').innerText = random.content;
  triviaWrapper.classList.remove('hidden');
}

window.refreshTriviaWithCoin = function() {
  if (drawState.count <= 0) {
    alert('刷新水晶不足！請觀看廣告補充。');
    return;
  }
  drawState.count--;
  saveState();
  updateCountersAndTimer();
  renderRandomTrivia();
};

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

function calculateElement(year) {
  if (!year) return { name: '土', key: 'elementEarth' };
  const lastDigit = year % 10;
  if (lastDigit === 0 || lastDigit === 1) return { name: '金', key: 'elementMetal' };
  if (lastDigit === 2 || lastDigit === 3) return { name: '水', key: 'elementWater' };
  if (lastDigit === 4 || lastDigit === 5) return { name: '木', key: 'elementWood' };
  if (lastDigit === 6 || lastDigit === 7) return { name: '火', key: 'elementFire' };
  return { name: '土', key: 'elementEarth' };
}

function updateFortuneText() {
  if (!userBirth) return;
  const element = calculateElement(userBirth.year);
  document.getElementById('fortune-text').innerText = `✨ 本命五行【${element.name}】啟動，今日開運屬性加權中！`;
}

function showBirthModal() {
  document.getElementById('modal-overlay').classList.remove('hidden');
  document.getElementById('modal-birth').classList.remove('hidden');
}

window.saveBirthdate = function() {
  const year = parseInt(document.getElementById('input-year').value);
  const month = parseInt(document.getElementById('input-month').value);
  const day = parseInt(document.getElementById('input-day').value);

  if (!year || !month || !day) {
    alert('請完整填寫西元出生年月日！');
    return;
  }

  userBirth = { year, month, day };
  localStorage.setItem('user_birth', JSON.stringify(userBirth));
  closeModal();
  updateFortuneText();
  filterAndDraw(false);
};

window.openSettingsModal = function() {
  if (userBirth) {
    document.getElementById('setting-year').value = userBirth.year;
    document.getElementById('setting-month').value = userBirth.month;
    document.getElementById('setting-day').value = userBirth.day;
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
  const year = parseInt(document.getElementById('setting-year').value);
  const month = parseInt(document.getElementById('setting-month').value);
  const day = parseInt(document.getElementById('setting-day').value);

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
    btn.innerText = '🎬 看廣告 +10 刷新水晶';
    alert('🎉 感謝觀看！刷新水晶已增加 10 個！');
  }, 2000);
};

function setupEventListeners() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.filter-btn').forEach(b => {
        b.className = 'filter-btn px-3 py-1 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full text-sm whitespace-nowrap transition';
      });
      e.target.className = 'filter-btn px-3 py-1 bg-indigo-600 text-white rounded-full text-sm whitespace-nowrap transition';
      currentFilter = e.target.getAttribute('data-tag');
    });
  });

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
    });
  }

  const confirmOnly = document.getElementById('btn-confirm-only');
  const confirmMap = document.getElementById('btn-confirm-map');
  if (confirmOnly) confirmOnly.onclick = () => handleConfirm(false);
  if (confirmMap) confirmMap.onclick = () => handleConfirm(true);
}

function filterAndDraw(isDrawn) {
  if (allFoods.length === 0) return;

  let pool = [...allFoods];
  const userElement = userBirth ? calculateElement(userBirth.year) : { name: '土', key: 'elementEarth' };

  if (userTaboos.length > 0) {
    pool = pool.filter(f => {
      if (!f.tags) return true;
      return !userTaboos.some(taboo => f.tags.includes(taboo));
    });
  }

  if (isVIP) {
    pool = pool.filter(f => !userDislikes.includes(f.id) && !userBanned.includes(f.id));
  }

  if (userLevel >= 13 && currentFilter !== 'all') {
    pool = pool.filter(f => f.tags && f.tags.includes(currentFilter));
  }

  const boxCount = getUnlockBoxCount();
  const selectedBoxes = weightedSample(pool, boxCount, userElement.key);
  const favoriteOne = (userLevel >= 4) ? sampleFavorite() : null;

  renderMainUI(selectedBoxes);
  renderFavoriteUI(favoriteOne);
  updateCountersAndTimer();
}

function weightedSample(list, k, elementKey) {
  let tempPool = [...list];
  let result = [];

  for (let i = 0; i < k; i++) {
    if (tempPool.length === 0) break;

    let totalWeight = tempPool.reduce((acc, item) => {
      let weight = userDislikes.includes(item.id) ? 0.2 : 1.0;
      if (item.element === elementKey) weight *= 2.0;
      return acc + weight;
    }, 0);

    let randomNum = Math.random() * totalWeight;
    let weightSum = 0;

    for (let j = 0; j < tempPool.length; j++) {
      let item = tempPool[j];
      let weight = userDislikes.includes(item.id) ? 0.2 : 1.0;
      if (item.element === elementKey) weight *= 2.0;
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
  if (userLevel < 4) return null;
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

  foods.forEach(food => {
    container.appendChild(createFoodCardHTML(food, false));
  });
}

function renderFavoriteUI(food) {
  const container = document.getElementById('favorite-container');
  if (userLevel < 4) {
    container.innerHTML = `
      <div id="favorite-locked-box" onclick="checkFeatureLock('favorite')" class="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-700 text-xs text-slate-400 dark:text-slate-500 text-center cursor-pointer hover:bg-slate-200 transition">
        🔒 達到 Lv.4 解鎖個人最愛精選區
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

  const userElement = userBirth ? calculateElement(userBirth.year) : { key: 'elementEarth' };
  const isMatchedElement = selectedFoodForConfirm.element === userElement.key;

  document.getElementById('confirm-title').innerText = `確定要吃 ${selectedFoodForConfirm.name} 嗎？`;
  
  const hintBox = document.getElementById('confirm-element-bonus-hint');
  if (isMatchedElement) {
    hintBox.classList.remove('hidden');
  } else {
    hintBox.classList.add('hidden');
  }

  document.getElementById('modal-overlay').classList.remove('hidden');
  document.getElementById('modal-confirm-step1').classList.remove('hidden');
  document.getElementById('modal-confirm-step2').classList.add('hidden');
  document.getElementById('modal-birth').classList.add('hidden');
  document.getElementById('modal-settings').classList.add('hidden');
  document.getElementById('modal-stats').classList.add('hidden');
  document.getElementById('modal-levelup').classList.add('hidden');
};

function handleConfirm(needMap) {
  if (!selectedFoodForConfirm) return;

  const foodId = selectedFoodForConfirm.id;
  const foodName = selectedFoodForConfirm.name;
  const foodElement = selectedFoodForConfirm.element;
  const userElement = userBirth ? calculateElement(userBirth.year) : { key: 'elementEarth' };

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
  let gainedExp = 0;
  let expMsg = "";

  if (now - lastEatTime >= cooldownMs) {
    gainedExp += 5;
    expMsg = "✨ 經驗值 +5";

    if (foodElement === userElement.key) {
      gainedExp += 5;
      expMsg += "<br><span class='text-amber-600 dark:text-amber-300 font-extrabold'>🔥 食物屬性契合 經驗值額外+5！</span>";
    }

    userExp += gainedExp;
    lastEatTime = now;
    localStorage.setItem('user_exp', userExp);
    localStorage.setItem('last_eat_time', lastEatTime);
    updateLevelAndUI(true);
  } else {
    expMsg = "⏳ 4小時冷卻中，本次確認未獲得經驗值";
  }

  document.getElementById('modal-confirm-step1').classList.add('hidden');
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
  document.getElementById('modal-confirm-step1').classList.add('hidden');
  document.getElementById('modal-confirm-step2').classList.add('hidden');
  document.getElementById('modal-settings').classList.add('hidden');
  document.getElementById('modal-stats').classList.add('hidden');
  document.getElementById('modal-levelup').classList.add('hidden');
  selectedFoodForConfirm = null;
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

// 1. & 2. 藍色寶石刷新水晶餘額 UI 更新
function updateCountersAndTimer() {
  checkAndUpdateCooldown();
  
  const coinValEl = document.getElementById('coin-counter-val');
  if (coinValEl) {
    coinValEl.innerText = drawState.count;
  }

  const nextRefreshEl = document.getElementById('next-refresh-time');
  if (nextRefreshEl) {
    const now = Date.now();
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
    const now = Date.now();
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
}

function saveState() {
  localStorage.setItem('draw_state', JSON.stringify(drawState));
}

initApp();
