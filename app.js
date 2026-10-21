let allFoods = [];
let currentFilter = 'all';
let hiddenIds = JSON.parse(localStorage.getItem('hidden_foods') || '[]');

// 1. 機會設為 9999 次方便測試
const MAX_DRAW = 9999;
let drawState = JSON.parse(localStorage.getItem('draw_state') || JSON.stringify({ count: MAX_DRAW, timestamp: Date.now() }));

// ⚠️ 請確認你的 GitHub Pages 遠端 API 網址正確
const ONLINE_DATABASE_URL = 'https://shinakasun.github.io/foodWhatDataBase/foods.json';

async function initApp() {
  try {
    const res = await fetch(`${ONLINE_DATABASE_URL}?t=${Date.now()}`);
    if (!res.ok) throw new Error(`HTTP 錯誤！狀態碼：${res.status}`);
    
    allFoods = await res.json();
    checkAndUpdateCooldown();
    setupEventListeners();
    
    // 初始化直接抽一次
    filterAndDraw(false);
    
    // 啟動倒數計時器監控
    setInterval(updateCounterUI, 1000);
  } catch (err) {
    console.error('線上資料庫讀取失敗：', err);
    document.getElementById('food-container').innerHTML = `
      <div class="text-center py-6">
        <p class="text-red-500 font-bold mb-1">無法連線至遠端資料庫</p>
        <p class="text-xs text-slate-400">請確認 GitHub API 網址或網路狀態</p>
      </div>
    `;
  }
}

// 綁定按鈕點擊事件
function setupEventListeners() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.filter-btn').forEach(b => {
        b.className = 'filter-btn px-3 py-1 bg-slate-200 text-slate-700 rounded-full text-sm whitespace-nowrap transition';
      });
      e.target.className = 'filter-btn px-3 py-1 bg-indigo-600 text-white rounded-full text-sm whitespace-nowrap transition';
      
      // 3. 選擇篩選器時，僅記錄篩選條件，不主動觸發抽籤刷新
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

// 核心過濾與隨機抽樣邏輯
function filterAndDraw(isDrawn) {
  let available = allFoods.filter(f => !hiddenIds.includes(f.id));

  if (currentFilter !== 'all') {
    available = available.filter(f => f.tags && f.tags.includes(currentFilter));
  }

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
    container.innerHTML = '<p class="text-slate-400 text-center py-8">沒有符合條件的食物！</p>';
    return;
  }

  foods.forEach(food => {
    const card = document.createElement('div');
    card.className = 'p-3 border rounded-xl bg-slate-50 flex justify-between items-center shadow-sm hover:bg-slate-100 transition';
    card.innerHTML = `
      <div class="cursor-pointer flex-grow" onclick="openGoogleMap('${food.name}')">
        <!-- 4. 去掉導航提示字樣，保持簡潔 -->
        <h3 class="font-bold text-slate-800">${food.name}</h3>
      </div>
      <!-- 5. 按鈕改為「永久隱藏」 -->
      <button onclick="hideFood(${food.id})" class="text-xs text-red-400 hover:text-red-600 border border-red-200 px-2 py-1 rounded-lg ml-2">永久隱藏</button>
    `;
    container.appendChild(card);
  });
}

// 2. 搜尋食物名稱時，去掉「附近美食」四字
window.openGoogleMap = function(foodName) {
  const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(foodName)}`;
  window.open(url, '_blank');
};

// 永久隱藏功能
window.hideFood = function(id) {
  if (!hiddenIds.includes(id)) {
    hiddenIds.push(id);
    localStorage.setItem('hidden_foods', JSON.stringify(hiddenIds));
    filterAndDraw(false);
  }
};

// 10 分鐘冷卻與補充次數邏輯
function checkAndUpdateCooldown() {
  const now = Date.now();
  const diffMs = now - drawState.timestamp;
  const intervalMs = 10 * 60 * 1000; // 10 分鐘
  
  if (diffMs >= intervalMs && drawState.count < MAX_DRAW) {
    const intervalsPassed = Math.floor(diffMs / intervalMs);
    const addCount = intervalsPassed * 5;
    drawState.count = Math.min(MAX_DRAW, drawState.count + addCount);
    // 保留剩餘未滿的時間戳記
    drawState.timestamp = drawState.timestamp + (intervalsPassed * intervalMs);
    saveState();
  }
}

// 6. 倒數計時器顯示
function updateCounterUI() {
  checkAndUpdateCooldown();
  
  const counterEl = document.getElementById('counter-text');
  if (drawState.count >= MAX_DRAW) {
    counterEl.innerText = `剩餘刷新次數：${drawState.count} / ${MAX_DRAW} (已充滿)`;
    return;
  }

  // 計算距離下一次補充的倒數時間 (每 10 分鐘補一次)
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
