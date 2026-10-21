let allFoods = [];
let currentFilter = 'all';

let userLikes = JSON.parse(localStorage.getItem('user_likes') || '[]');
let userDislikes = JSON.parse(localStorage.getItem('user_dislikes') || '[]');
let isVIP = localStorage.getItem('is_vip') === 'true';

const MAX_DRAW = 9999;
let drawState = JSON.parse(localStorage.getItem('draw_state') || JSON.stringify({ count: MAX_DRAW, timestamp: Date.now() }));

let selectedFoodForConfirm = null; // 當前被點擊的食物紀錄

const ONLINE_DATABASE_URL = 'https://shinakasun.github.io/foodWhatDataBase/foods.json';

async function initApp() {
  try {
    const res = await fetch(`${ONLINE_DATABASE_URL}?t=${Date.now()}`);
    if (!res.ok) throw new Error(`HTTP 錯誤！狀態碼：${res.status}`);
    
    allFoods = await res.json();
    checkAndUpdateCooldown();
    setupEventListeners();
    
    filterAndDraw(false);
    setInterval(updateCounterUI, 1000);
  } catch (err) {
    console.error('線上資料庫讀取失敗：', err);
    document.getElementById('food-container').innerHTML = `
      <div class="text-center py-6 text-red-500 font-bold">無法連線至遠端資料庫</div>
    `;
  }
}

function setupEventListeners() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.filter-btn').forEach(b => {
        b.className = 'filter-btn px-3 py-1 bg-slate-200 text-slate-700 rounded-full text-sm whitespace-nowrap transition';
      });
      e.target.className = 'filter-btn px-3 py-1 bg-indigo-600 text-white rounded-full text-sm whitespace-nowrap transition';
      currentFilter = e.target.getAttribute('data-tag');
    });
  });

  document.getElementById('draw-btn').addEventListener('click', () => {
    if (drawState.count <= 0) {
      alert('今日次數已用完！');
      return;
    }
    drawState.count--;
    saveState();
    filterAndDraw(true);
  });

  // 彈窗按鈕綁定
  document.getElementById('btn-confirm-only').addEventListener('click', () => handleConfirm(false));
  document.getElementById('btn-confirm-map').addEventListener('click', () => handleConfirm(true));
  document.getElementById('btn-cancel').addEventListener('click', closeModal);
}

// 核心過濾與加權抽樣邏輯
function filterAndDraw(isDrawn) {
  let pool = [...allFoods];

  if (isVIP) {
    pool = pool.filter(f => !userDislikes.includes(f.id));
  }

  if (currentFilter !== 'all') {
    pool = pool.filter(f => f.tags && f.tags.includes(currentFilter));
  }

  const selected5 = weightedSample(pool, 5);
  const favoriteOne = sampleFavorite();

  renderMainUI(selected5);
  renderFavoriteUI(favoriteOne);
  updateCounterUI();
}

function weightedSample(list, k) {
  let tempPool = [...list];
  let result = [];

  for (let i = 0; i < k; i++) {
    if (tempPool.length === 0) break;

    let totalWeight = tempPool.reduce((acc, item) => {
      let weight = userDislikes.includes(item.id) ? 0.2 : 1.0;
      return acc + weight;
    }, 0);

    let randomNum = Math.random() * totalWeight;
    let weightSum = 0;

    for (let j = 0; j < tempPool.length; j++) {
      let item = tempPool[j];
      let weight = userDislikes.includes(item.id) ? 0.2 : 1.0;
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
      <div class="p-3 border border-amber-200 rounded-xl bg-amber-50 text-amber-700 text-xs text-center">
        💡 點擊上方食物旁的 👍 按鈕，此處將為您鎖定喜愛美食！
      </div>
    `;
    return;
  }

  const card = createFoodCardHTML(food, true);
  card.className += ' border-amber-300 bg-amber-50/60';
  container.appendChild(card);
}

function createFoodCardHTML(food, isFavoriteSlot) {
  const isLiked = userLikes.includes(food.id);
  const isDisliked = userDislikes.includes(food.id);

  const card = document.createElement('div');
  card.id = `food-card-${food.id}`;
  card.className = 'p-3 border rounded-xl bg-slate-50 flex justify-between items-center shadow-sm hover:bg-slate-100 transition';
  
  const likeBtnClass = isLiked 
    ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm' 
    : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200';

  const dislikeBtnClass = isDisliked 
    ? 'bg-rose-500 text-white border-rose-500 shadow-sm' 
    : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200';

  card.innerHTML = `
    <div class="cursor-pointer flex-grow" onclick="openFoodConfirmModal(${food.id})">
      <h3 class="font-bold text-slate-800">${food.name}</h3>
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

// 1. 點擊喜好按鈕：不自動刷新個人最愛精選，僅更新 DOM 燈號狀態與記憶體
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
        : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
    }`;
  });

  dislikeBtns.forEach(btn => {
    btn.className = `px-2.5 py-1 text-xs rounded-lg border transition ${
      isDisliked 
        ? 'bg-rose-500 text-white border-rose-500 shadow-sm' 
        : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
    }`;
  });
}

// 2. 點擊食物開啟確認 Modal 邏輯
window.openFoodConfirmModal = function(id) {
  selectedFoodForConfirm = allFoods.find(f => f.id === id);
  if (!selectedFoodForConfirm) return;

  document.getElementById('confirm-title').innerText = `確定要吃 ${selectedFoodForConfirm.name} 嗎？`;
  document.getElementById('modal-step1').classList.remove('hidden');
  document.getElementById('modal-step2').classList.add('hidden');
  document.getElementById('modal-overlay').classList.remove('hidden');
};

// 處理點擊「確定」或「確定 + 地圖搜尋」
function handleConfirm(needMap) {
  if (!selectedFoodForConfirm) return;

  // 自動變成喜歡 (若不在喜歡清單內)
  if (!userLikes.includes(selectedFoodForConfirm.id)) {
    userLikes.push(selectedFoodForConfirm.id);
    userDislikes = userDislikes.filter(i => i !== selectedFoodForConfirm.id);
    localStorage.setItem('user_likes', JSON.stringify(userLikes));
    localStorage.setItem('user_dislikes', JSON.stringify(userDislikes));
    updateButtonUI(selectedFoodForConfirm.id);
  }

  // 切換至第二階段祝賀 Modal
  document.getElementById('modal-step1').classList.add('hidden');
  document.getElementById('modal-step2').classList.remove('hidden');
  document.getElementById('congrat-text').innerText = `今天就吃 ${selectedFoodForConfirm.name} 吧！`;

  const finalBtn = document.getElementById('btn-final-action');
  
  if (needMap) {
    finalBtn.innerText = '耶！找找！';
    finalBtn.onclick = () => {
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedFoodForConfirm.name)}`;
      window.open(url, '_blank');
      closeModal();
    };
  } else {
    finalBtn.innerText = '耶！';
    finalBtn.onclick = closeModal;
  }
}

function closeModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
  document.getElementById('modal-step1').classList.add('hidden');
  document.getElementById('modal-step2').classList.add('hidden');
  selectedFoodForConfirm = null;
}

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

initApp();
