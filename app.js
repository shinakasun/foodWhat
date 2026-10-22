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

// 冒險者公會與靈氣系統狀態
let guildQuest = JSON.parse(localStorage.getItem('guild_quest') || 'null'); // { type: 'cold'|'hot'|'snack', progress: 0 }
let unlockedAuras = JSON.parse(localStorage.getItem('unlocked_auras') || '[]'); // ['cold', 'hot', 'snack']
let activeAura = localStorage.getItem('active_aura') || null; // 'cold' | 'hot' | 'snack' | null
let tempSelectedQuestType = null;

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
        isSelected ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-700 dark:text-indigo-300 font-bold' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-150'
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

  // 冒險者公會解鎖控制 (Lv.4)
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

  // 靈氣開關區控制 (解鎖任一靈氣後顯示)
  const auraPanel = document.getElementById('aura-control-panel');
  if (unlockedAuras.length > 0) {
    auraPanel.classList.remove('hidden');
    updateAuraButtonsUI();
  } else {
    auraPanel.classList.add('hidden');
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

// 冒險者公會介面更新
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

// 點擊公會區域
window.handleGuildClick = function() {
  if (guildQuest) {
    // 若已有任務，點擊顯示進度或提示
    if (guildQuest.progress >= 3) {
      openCompleteQuestModal();
    } else {
      const questNames = { cold: '凜冬陣地', hot: '灼熱地城', snack: '小惡魔城' };
      alert(`⚔️ 當前任務【${questNames[guildQuest.type]}】進行中！\n已完成進度：${guildQuest.progress} / 3\n提示：需在經驗值未冷卻時選取對應食物才算完成喔！`);
    }
  } else {
    openGuildModal();
  }
};

window.openGuildModal = function() {
  document.getElementById('modal-overlay').classList.remove('hidden');
  document.getElementById('modal-guild-list').classList.remove('hidden');
  document.getElementById('modal-guild-accept').classList.add('hidden');
  document.getElementById('modal-guild-complete').classList.add('hidden');
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
  closeModal();
  updateGuildBannerUI();
  filterAndDraw(false);
  showAuraToast(`成功接取任務！任務目標已出現於公會區`);
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
  // 結算後自動啟用該靈氣
  activeAura = type;
  localStorage.setItem('active_aura', type);

  guildQuest = null;
  localStorage.removeItem('guild_quest');

  closeModal();
  updateGuildBannerUI();
  applyFeatureUnlocks();
  filterAndDraw(false);
  showAuraToast(`🎉 成功領取獎勵！已自動為您開啟對應靈氣！`);
};

// 靈氣開關與提示 Toast
window.toggleAura = function(auraType) {
  if (!unlockedAuras.includes(auraType)) return;

  if (activeAura === auraType) {
    activeAura = null;
    showAuraToast("靈氣已關閉");
  } else {
    activeAura = auraType;
    const auraNames = { cold: '極寒靈氣 (鎖定 cold 標籤食物)', hot: '灼熱靈氣 (鎖定 hot 標籤食物)', snack: '迅捷靈氣 (鎖定 snack 標籤食物)' };
    showAuraToast(`✨ 啟動${auraNames[auraType]}`);
  }
  localStorage.setItem('active_aura', activeAura || '');
  updateAuraButtonsUI();
  filterAndDraw(false);
};

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
      btn.innerText = `${labels[t]} (開啟中)`;
    } else {
      btn.className = "px-2.5 py-1 text-[11px] rounded-lg border transition font-bold whitespace-nowrap bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50";
      btn.innerText = `${labels[t]} (已解鎖)`;
    }
  });
}

function showAuraToast(text) {
  const toast = document.getElementById('aura-toast');
  if (!toast) return;
  toast.innerText = text;
  toast.classList.remove('opacity-0');
  toast.classList.add('opacity-100', 'translate-y-2');

  setTimeout(() => {
    toast.classList.remove('opacity-100', 'translate-y-2');
    toast.classList.add('opacity-0');
  }, 2500);
}

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
  const year = parseInt(document.getElementById('select-birth-year').value);
  const month = parseInt(document.getElementById('select-birth-month').value);
  const day = parseInt(document.getElementById('select-birth-day').value);

  if (!year || !month || !day) {
    alert('請完整選擇您的出生年月日！');
    return;
  }

  userBirth = { year, month, day };
  localStorage.setItem('user_birth', JSON.stringify(userBirth));
  closeModal();
  updateMainTitle();
  updateFortuneText();
  filterAndDraw(false);
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
    badge.className = 'text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 dark:text-amber-950 dark:text-amber-300 font-bold';
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

// 核心盲盒過濾與生成邏輯 (整合靈氣與任務過濾)
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

  // 靈氣啟用時鎖定對應 tag
  if (activeAura) {
    pool = pool.filter(f => f.tags && f.tags.includes(activeAura));
  }

  const boxCount = getUnlockBoxCount();
  const selectedBoxes = weightedSample(pool, boxCount, userElement.key);
  const favoriteOne = (userLevel >= 3) ? sampleFavorite() : null;

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
    // 檢查是否為第一個盲盒，且目前有進行中的冒險者任務
    if (index === 0 && guildQuest && guildQuest.progress < 3) {
      container.appendChild(createGuildQuestCardHTML());
    }
    container.appendChild(createFoodCardHTML(food, false));
  });
}

// 建立任務卡片 (放置於第一個盲盒上方)
function createGuildQuestCardHTML() {
  const now = Date.now();
  const cooldownMs = 4 * 60 * 60 * 1000;
  const isCoolingDown = (now - lastEatTime < cooldownMs);

  const questNames = { cold: '❄️ 凜冬陣地 (cold)', hot: '🔥 灼熱地城 (hot)', snack: '🍡 小惡魔城 (snack)' };
  const card = document.createElement('div');
  
  if (isCoolingDown) {
    card.className = 'p-3 border border-dashed border-amber-300 dark:border-amber-800 rounded-xl bg-amber-50/50 dark:bg-amber-950/30 flex justify-between items-center opacity-75';
    card.innerHTML = `
      <div class="flex items-center gap-2">
        <span class="text-lg">⏳</span>
        <div>
          <div class="font-bold text-xs text-amber-800 dark:text-amber-300">任務目標尋找中...</div>
          <div class="text-[10px] text-slate-500">經驗值冷卻中，無法選取任務目標</div>
        </div>
      </div>
      <span class="text-[10px] font-bold text-amber-600 bg-amber-100 dark:bg-amber-900 px-2 py-1 rounded">冷卻中</span>
    `;
  } else {
    // 隨機抽選一筆符合任務標籤的食物作為任務目標
    const targetTag = guildQuest.type;
    const eligibleFoods = allFoods.filter(f => f.tags && f.tags.includes(targetTag));
    const targetFood = eligibleFoods.length > 0 ? eligibleFoods[Math.floor(Math.random() * eligibleFoods.length)] : { id: 999, name: '神祕任務料理', element: 'elementMetal' };

    card.className = 'p-3 border-2 border-indigo-500 dark:border-indigo-600 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 flex justify-between items-center shadow-sm cursor-pointer hover:bg-indigo-100 transition';
    card.onclick = () => openFoodConfirmModal(targetFood.id);
    card.innerHTML = `
      <div class="flex items-center gap-2">
        <span class="text-xl">🎯</span>
        <div>
          <div class="font-extrabold text-xs text-indigo-900 dark:text-indigo-200">任務目標：${targetFood.name}</div>
          <div class="text-[10px] text-indigo-600 dark:text-indigo-400">點擊選取此任務目標 (進度: ${guildQuest.progress}/3)</div>
        </div>
      </div>
      <span class="text-[10px] font-bold text-white bg-indigo-600 px-2.5 py-1 rounded-lg shadow-sm whitespace-nowrap">前往挑戰</span>
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

  const userElement = userBirth ? calculateElement(userBirth.year) : { key: 'elementEarth' };
  const isMatchedElement = selectedFoodForConfirm.element === userElement.key;

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

  const userElement = userBirth ? calculateElement(userBirth.year) : { key: 'elementEarth' };
  const isMatchedElement = selectedFoodForConfirm.element === userElement.key;

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
  const isCoolingDown = (now - lastEatTime < cooldownMs);
  let gainedExp = 0;
  let expMsg = "";

  if (!isCoolingDown) {
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

    // 冒險者公會任務進度判定：需在經驗值未冷卻時選取對應標籤食物
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
