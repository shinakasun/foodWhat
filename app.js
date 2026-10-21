let allFoods = [];
let currentFilter = 'all';

let userLikes = JSON.parse(localStorage.getItem('user_likes') || '[]');
let userDislikes = JSON.parse(localStorage.getItem('user_dislikes') || '[]');
let userBanned = JSON.parse(localStorage.getItem('user_banned') || '[]');
let foodHistory = JSON.parse(localStorage.getItem('food_history') || '[]');
let foodCounts = JSON.parse(localStorage.getItem('food_counts') || '{}');

let userTaboos = JSON.parse(localStorage.getItem('user_taboos') || '[]');
let isVIP = localStorage.getItem('is_vip') === 'true';
let userBirth = JSON.parse(localStorage.getItem('user_birth') || 'null');
let settingsPushZodiac = localStorage.getItem('push_zodiac') === 'true';
let settingsPushTrivia = localStorage.getItem('push_trivia') === 'true';
let isDarkMode = localStorage.getItem('dark_mode') === 'true';

const MAX_DRAW = 9999;
let drawState = JSON.parse(localStorage.getItem('draw_state') || JSON.stringify({ count: MAX_DRAW, timestamp: Date.now() }));
let selectedFoodForConfirm = null;

const ONLINE_DATABASE_URL = 'https://shinakasun.github.io/foodWhatDataBase/foods.json';

const ELEMENT_MAP = {
  elementMetal: { name: '金', icon: '🪙', class: 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-800' },
  elementWood:  { name: '木', icon: '🪵', class: 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800' },
  elementWater: { name: '水', icon: '💧', class: 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-800' },
  elementFire:  { name: '火', icon: '🔥', class: 'text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:border-rose-800' },
  elementEarth: { name: '土', icon: '⛰️', class: 'text-yellow-700 bg-yellow-50 border-yellow-200 dark:bg-yellow-950/40 dark:border-yellow-800' }
};

async function initApp() {
  toggleDarkMode(isDarkMode);
  setupEventListeners(); // 優先綁定按鈕事件，確保「統計」與「設定」永遠可點擊

  try {
    const res = await fetch(`${ONLINE_DATABASE_URL}?t=${Date.now()}`);
    if (!res.ok) throw new Error(`HTTP 錯誤！狀態碼：${res.status}`);
    
    allFoods = await res.json();
    checkAndUpdateCooldown();

    // 檢查生日狀況，無生日則開彈窗，有生日則正常運算
    if (!userBirth) {
      showBirthModal();
    } else {
      updateFortuneText();
      filterAndDraw(false);
    }
    
    setInterval(updateCounterUI, 1000);
  } catch (err) {
    console.error('線上資料庫讀取失敗：', err);
    document.getElementById('food-container').innerHTML = `
      <div class="text-center py-6 text-red-500 font-bold">無法連線至遠端資料庫，請檢查網路連線</div>
    `;
  }
}

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
  document.getElementById('setting-push-zodiac').checked = settingsPushZodiac;
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

  settingsPushZodiac = document.getElementById('setting-push-zodiac').checked;
  settingsPushTrivia = document.getElementById('setting-push-trivia').checked;
  localStorage.setItem('push_zodiac', settingsPushZodiac);
  localStorage.setItem('push_trivia', settingsPushTrivia);

  userTaboos = [];
  document.querySelectorAll('.meat-taboo:checked').forEach(checkbox => {
    userTaboos.push(checkbox.value);
  });
  localStorage.setItem('user_taboos', JSON.stringify(userTaboos));

  closeModal();
  updateFortuneText();
};

window.openStatsModal = function() {
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
    .slice(0, 5);

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
  isDarkMode = isDark;
  localStorage.setItem('dark_mode', isDark);
  const htmlRoot = document.getElementById('html-root');
  if (isDark) {
    htmlRoot.classList.add('dark');
  } else {
    htmlRoot.classList.remove('dark');
  }
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
        alert('今日次數已用完！');
        return;
      }
      drawState.count--;
      saveState();
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

  if (currentFilter !== 'all') {
    pool = pool.filter(f => f.tags && f.tags.includes(currentFilter));
  }

  const selected5 = weightedSample(pool, 5, userElement.key);
  const favoriteOne = sampleFavorite();

  renderMainUI(selected5);
  renderFavoriteUI(favoriteOne);
  updateCounterUI();
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

  card.innerHTML = `
    <div class="cursor-pointer flex-grow flex items-center gap-2" onclick="openFoodConfirmModal(${food.id})">
      <h3 class="font-bold text-slate-800 dark:text-white">${food.name}</h3>
      <span class="text-[10px] px-1.5 py-0.5 rounded-md border font-medium flex items-center gap-0.5 ${elemInfo.class}">
        <span>${elemInfo.icon}</span>
        <span>${elemInfo.name}</span>
      </span>
    </div>
    <div class="flex items-center gap-1.5 ml-2">
      <button id="like-btn-${food.id}" onclick="togglePreference(${food.id}, 'like')" 
        class="px-2.5 py-1 text-xs rounded-lg border transition ${likeBtnClass}">
        👍
      </button>
      <button id="dislike-btn-${food.id}" onclick="togglePreference(${food.id}, 'dislike')" 
        class="px-2.5 py-1 text-xs rounded-lg border transition ${dislikeBtnClass}">
        👎
      </button>
    </div>
  `;
  return card;
}

window.togglePreference = function(id, type) {
  if (type === 'like') {
    if (userLikes.includes(id)) {
      userLikes = userLikes.filter(i => i !== id);
    } else {
      userLikes.push(id);
      userDislikes = userDislikes.filter(i => i !== id);
    }
  } else if (type === 'dislike') {
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
    btn.className = `px-2.5 py-1 text-xs rounded-lg border transition ${
      isLiked 
        ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm' 
        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-200'
    }`;
  });

  dislikeBtns.forEach(btn => {
    btn.className = `px-2.5 py-1 text-xs rounded-lg border transition ${
      isDisliked 
        ? 'bg-rose-500 text-white border-rose-500 shadow-sm' 
        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-200'
    }`;
  });
}

window.openFoodConfirmModal = function(id) {
  selectedFoodForConfirm = allFoods.find(f => f.id === id);
  if (!selectedFoodForConfirm) return;

  document.getElementById('confirm-title').innerText = `確定要吃 ${selectedFoodForConfirm.name} 嗎？`;
  document.getElementById('modal-overlay').classList.remove('hidden');
  document.getElementById('modal-confirm-step1').classList.remove('hidden');
  document.getElementById('modal-confirm-step2').classList.add('hidden');
  document.getElementById('modal-birth').classList.add('hidden');
  document.getElementById('modal-settings').classList.add('hidden');
  document.getElementById('modal-stats').classList.add('hidden');
};

function handleConfirm(needMap) {
  if (!selectedFoodForConfirm) return;

  const foodId = selectedFoodForConfirm.id;
  const foodName = selectedFoodForConfirm.name;
  const timeStr = new Date().toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  foodHistory.push({ id: foodId, name: foodName, time: timeStr });
  foodCounts[foodId] = (foodCounts[foodId] || 0) + 1;

  localStorage.setItem('food_history', JSON.stringify(foodHistory));
  localStorage.setItem('food_counts', JSON.stringify(foodCounts));

  if (!userLikes.includes(foodId)) {
    userLikes.push(foodId);
    userDislikes = userDislikes.filter(i => i !== foodId);
    localStorage.setItem('user_likes', JSON.stringify(userLikes));
    localStorage.setItem('user_dislikes', JSON.stringify(userDislikes));
    updateButtonUI(foodId);
  }

  document.getElementById('modal-confirm-step1').classList.add('hidden');
  document.getElementById('modal-confirm-step2').classList.remove('hidden');
  document.getElementById('congrat-text').innerText = `今天就吃 ${foodName} 吧！`;

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

function updateCounterUI() {
  checkAndUpdateCooldown();
  const counterEl = document.getElementById('counter-text');
  if (!counterEl) return;
  if (drawState.count >= MAX_DRAW) {
    counterEl.innerText = `剩餘刷新次數：${drawState.count} / ${MAX_DRAW} (已充滿)`;
    return;
  }

  const now = Date.now();
  const intervalMs = 10 * 60 * 1000;
  const elapsed = (now - drawState.timestamp) % intervalMs;
  const remainingMs = intervalMs - elapsed;
  
  const minutes = Math.floor(remainingMs / 60000);
  const seconds = Math.floor((remainingMs % 60000) / 1000);
  const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  counterEl.innerText = `剩餘刷新次數：${drawState.count} / ${MAX_DRAW} (下一次補充：${timeStr})`;
}

function saveState() {
  localStorage.setItem('draw_state', JSON.stringify(drawState));
}

// 啟動初始化
initApp();
