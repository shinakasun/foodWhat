let allFoods = [];
let currentFilter = 'all';

// 偏好清單 (Likes & Dislikes) 與 VIP 狀態
let userLikes = JSON.parse(localStorage.getItem('user_likes') || '[]');
let userDislikes = JSON.parse(localStorage.getItem('user_dislikes') || '[]');
let isVIP = localStorage.getItem('is_vip') === 'true'; // 預設非 VIP

const MAX_DRAW = 9999;
let drawState = JSON.parse(localStorage.getItem('draw_state') || JSON.stringify({ count: MAX_DRAW, timestamp: Date.now() }));

// 遠端資料庫網址
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
}

// 核心過濾與加權抽樣邏輯
function filterAndDraw(isDrawn) {
  let pool = [...allFoods];

  // 1. VIP 玩家直接過濾「不喜歡」；非 VIP 玩家保留但降低權重
  if (isVIP) {
    pool = pool.filter(f => !userDislikes.includes(f.id));
  }

  // 2. 情境標籤過濾
  if (currentFilter !== 'all') {
    pool = pool.filter(f => f.tags && f.tags.includes(currentFilter));
  }

  // 3. 算子加權抽樣前 5 樣 (不喜歡的權重 0.2，普通的權重 1.0)
  const selected5 = weightedSample(pool, 5);

  // 4. 抽樣精選最愛欄位
  const favoriteOne = sampleFavorite();

  renderMainUI(selected5);
  renderFavoriteUI(favoriteOne);
  updateCounterUI();
}

// 權重隨機抽樣 (Weighted Random Sampling)
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

// 抽樣固定最愛項目
function sampleFavorite() {
  const likedFoods = allFoods.filter(f => userLikes.includes(f.id));
  if (likedFoods.length === 0) return null;
  return likedFoods[Math.floor(Math.random() * likedFoods.length)];
}

// 渲染前 5 個卡片
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

// 渲染個人最愛精選卡片
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

// 建立單一食物卡片 HTML 的共用函數
function createFoodCardHTML(food, isFavoriteSlot) {
  const isLiked = userLikes.includes(food.id);
  const isDisliked = userDislikes.includes(food.id);

  const card = document.createElement('div');
  card.id = `food-card-${food.id}`;
  card.className = 'p-3 border rounded-xl bg-slate-50 flex justify-between items-center shadow-sm hover:bg-slate-100 transition';
  
  // 2 & 3. 喜歡與不喜歡按鈕的白灰底色與按壓亮起樣式設定
  const likeBtnClass = isLiked 
    ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm' 
    : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200';

  const dislikeBtnClass = isDisliked 
    ? 'bg-rose-500 text-white border-rose-500 shadow-sm' 
    : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200';

  card.innerHTML = `
    <div class="cursor-pointer flex-grow" onclick="openGoogleMap('${food.name}')">
      <h3 class="font-bold text-slate-800">${food.name}</h3>
    </div>
    <div class="flex items-center gap-1.5 ml-2">
      <!-- 👍 按鈕 -->
      <button id="like-btn-${food.id}" onclick="togglePreference(${food.id}, 'like')" 
        class="px-2.5 py-1 text-xs rounded-lg border transition ${likeBtnClass}">
        👍
      </button>
      <!-- 👎 按鈕 -->
      <button id="dislike-btn-${food.id}" onclick="togglePreference(${food.id}, 'dislike')" 
        class="px-2.5 py-1 text-xs rounded-lg border transition ${dislikeBtnClass}">
        👎
      </button>
    </div>
  `;
  return card;
}

// 1. 切換喜好狀態 (不自動觸發抽籤刷新，僅更新 DOM 按鈕外觀與數據)
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

  // 僅更新畫面上該品項對應的按鈕狀態，不重新觸發全頁抽籤
  updateButtonUI(id);

  // 如果喜好清單改變，僅重新渲染「個人最愛精選」區塊
  const favoriteOne = sampleFavorite();
  renderFavoriteUI(favoriteOne);
};

// 單一按鈕視覺狀態即時更新
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

window.openGoogleMap = function(foodName) {
  const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(foodName)}`;
  window.open(url, '_blank');
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
