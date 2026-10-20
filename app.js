// ⚠️ 請替換為你在「階段一」產出的真實 GitHub API 網址
const API_URL = 'https://shinakasun.github.io/foodWhatDataBase/foods.json';

let allFoods = [];
let currentFilter = 'all';
let hiddenIds = JSON.parse(localStorage.getItem('hidden_foods') || '[]');

// 每日 20 次與冷卻控制常數
const MAX_DRAW = 20;
let drawState = JSON.parse(localStorage.getItem('draw_state') || JSON.stringify({ count: MAX_DRAW, timestamp: Date.now() }));

async function initApp() {
  try {
    const res = await fetch('./foods.json');
    allFoods = await res.json();
    checkAndUpdateCooldown();
    setupEventListeners();
    filterAndDraw(false); // 初始化不扣次數
  } catch (err) {
    console.error(err);
    document.getElementById('food-container').innerHTML = '<p class="text-red-500 text-center">資料庫載入失敗</p>';
  }
}

// 綁定按鈕點擊事件
function setupEventListeners() {
  // 篩選器按鈕切換
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.filter-btn').forEach(b => {
        b.className = 'filter-btn px-3 py-1 bg-slate-200 text-slate-700 rounded-full text-sm whitespace-nowrap transition';
      });
      e.target.className = 'filter-btn px-3 py-1 bg-indigo-600 text-white rounded-full text-sm whitespace-nowrap transition';
      currentFilter = e.target.getAttribute('data-tag');
      filterAndDraw(false);
    });
  });

  // 抽籤按鈕
  document.getElementById('draw-btn').addEventListener('click', () => {
    if (drawState.count <= 0) {
      alert('今日次數已用完，或請等待 10 分鐘冷卻補充！');
      return;
    }
    drawState.count--;
    saveState();
    filterAndDraw(true);
  });
}

// 核心過濾與隨機抽樣邏輯 (一次抽 5 樣)
function filterAndDraw(isDrawn) {
  // 1. 過濾掉黑名單（localStorage 隱藏的項目）
  let available = allFoods.filter(f => !hiddenIds.includes(f.id));

  // 2. 套用情境標籤篩選
  if (currentFilter !== 'all') {
    available = available.filter(f => f.tags && f.tags.includes(currentFilter));
  }

  // 3. 隨機亂數抽樣 5 樣 (若總數不足 5 樣則全取)
  const shuffled = available.sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, 5);

  renderUI(selected);
  updateCounterUI();
}

// 渲染畫面
function renderUI(foods) {
  const container = document.getElementById('food-container');
  container.innerHTML = '';

  if (foods.length === 0) {
    container.innerHTML = '<p class="text-slate-400 text-center py-8">沒有符合條件的食物，換個篩選試試看！</p>';
    return;
  }

  foods.forEach(food => {
    const card = document.createElement('div');
    card.className = 'p-3 border rounded-xl bg-slate-50 flex justify-between items-center shadow-sm hover:bg-slate-100 transition';
    card.innerHTML = `
      <div class="cursor-pointer flex-grow" onclick="openGoogleMap('${food.name}')">
        <h3 class="font-bold text-slate-800">${food.name}</h3>
        <p class="text-xs text-slate-400 mt-0.5">點擊直接導航搜尋 🗺️</p>
      </div>
      <button onclick="hideFood(${food.id})" class="text-xs text-red-400 hover:text-red-600 border border-red-200 px-2 py-1 rounded-lg ml-2">隱藏</button>
    `;
    container.appendChild(card);
  });
}

// 點擊項目直接跳轉 Google Maps 搜尋附近美食
window.openGoogleMap = function(foodName) {
  const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(foodName)}附近美食`;
  window.open(url, '_blank');
};

// 永久隱藏功能 (寫入 LocalStorage)
window.hideFood = function(id) {
  if (!hiddenIds.includes(id)) {
    hiddenIds.push(id);
    localStorage.setItem('hidden_foods', JSON.stringify(hiddenIds));
    filterAndDraw(false);
  }
};

// 10分鐘冷卻與次數補充機制
function checkAndUpdateCooldown() {
  const now = Date.now();
  const diffMinutes = (now - drawState.timestamp) / (1000 * 60);
  
  // 每過 10 分鐘補充 5 次，最多回到 20 次
  if (diffMinutes >= 10 && drawState.count < MAX_DRAW) {
    const addCount = Math.floor(diffMinutes / 10) * 5;
    drawState.count = Math.min(MAX_DRAW, drawState.count + addCount);
    drawState.timestamp = now;
    saveState();
  }
}

function updateCounterUI() {
  document.getElementById('counter-text').innerText = `剩餘刷新次數：${drawState.count} / ${MAX_DRAW}`;
}

function saveState() {
  localStorage.setItem('draw_state', JSON.stringify(drawState));
}

// 啟動初始化
initApp();
