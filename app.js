// ⚠️ 請替換為你在「階段一」產出的真實 GitHub API 網址
const API_URL = 'https://shinakasun.github.io/foodWhatDatabase/foods.json';

let allFoods = [];

// 啟動時向遠端 API 抓取 foods.json
async function initApp() {
  try {
    const response = await fetch(API_URL);
    allFoods = await response.json();
    renderFoodList(allFoods);
  } catch (error) {
    console.error('資料抓取失敗：', error);
    document.getElementById('food-list').innerHTML = '<p class="text-red-500 text-center">無法載入資料庫</p>';
  }
}

// 渲染食物清單至畫面上
function renderFoodList(foods) {
  const container = document.getElementById('food-list');
  container.innerHTML = '';

  foods.forEach(food => {
    const card = document.createElement('div');
    card.className = 'p-4 border rounded-xl bg-slate-50 flex justify-between items-center shadow-sm';
    card.innerHTML = `
      <div>
        <h3 class="font-bold text-slate-800">${food.name}</h3>
        <p class="text-xs text-slate-500 mt-1">標籤: ${food.tags.join(', ')}</p>
      </div>
      <button class="text-xs text-red-400 hover:text-red-600 border border-red-200 px-2 py-1 rounded-lg">隱藏</button>
    `;
    container.appendChild(card);
  });
}

// 執行初始化
initApp();
