let planets = [];
let stars = [];
let shootingStars = []; // 用來存放目前畫面上的流星
let placeholderStars = []; // 存放未來作品的預留亮星
let constellations = []; // 存放星座連線群組
let astronaut; // 太空人
let satellite; // 衛星
let rockets = []; // 存放火箭的陣列

function setup() {
  // 設定畫布寬度與高度填滿整個視窗
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent('canvas-container'); // 將畫布綁定到 HTML 中的容器

  // 產生背景的點點繁星
  for (let i = 0; i < 200; i++) {
    // 設定星星的調色盤 (增加白色比例讓畫面和諧，並加入彩色)
    let palette = [[255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 180, 180], [255, 255, 150], [150, 220, 255], [180, 255, 180]];
    let col = random(palette);
    
    stars.push({ 
      x: random(width), y: random(height), size: random(1, 3), 
      r: col[0], g: col[1], b: col[2], angle: random(TWO_PI), speed: random(0.02, 0.05) 
    });
  }

  createConstellations(); // 產生星座連線

  // 初始化星球 (X座標, Y座標, 大小, 顏色, 作品名稱, 作品網址)
  // 請把 "project1.html" 等替換成你實際的作品網頁檔案路徑或網址
  planets.push(new Planet(0.3, 0.3, 80, color(255, 140, 105), "海草小魚灣", "https://zzx0525.github.io/0323/", 'fish')); // 珊瑚橘 (海草與魚)
  planets.push(new Planet(0.7, 0.5, 120, color(255, 220, 100), "閃電急急棒", "https://zzx0525.github.io/03330/", 'lightning')); // 閃電黃 (電流急急棒)
  planets.push(new Planet(0.4, 0.8, 70, color(180, 190, 200), "掃雷大師", "https://zzx0525.github.io/0331/", 'bomb')); // 銀灰色 (掃雷大師)
  planets.push(new Planet(0.12, 0.85, 90, color(255, 235, 180), "作品筆記", "https://hackmd.io/folders/ihiN0dVm3c3tsb9oq1WAU?nav=overview", 'note')); // 靠近邊緣的筆記本星球

  // 初始化預留給未來作品的亮星 (X比例, Y比例, 大小)
  placeholderStars.push(new PlaceholderStar(0.15, 0.6, 12));
  placeholderStars.push(new PlaceholderStar(0.8, 0.25, 15));
  placeholderStars.push(new PlaceholderStar(0.6, 0.85, 10));
  placeholderStars.push(new PlaceholderStar(0.85, 0.75, 14));

  // 初始化背景趣味裝飾：太空人、衛星、火箭
  astronaut = new Astronaut();
  satellite = new Satellite();
  for (let i = 0; i < 2; i++) {
    rockets.push(new Rocket());
  }
}

function draw() {
  background(35, 30, 60); // 偏紫色的夢幻童話宇宙背景

  // 繪製星座連線
  stroke(255, 255, 255, 40); // 半透明白線，讓它低調地融入背景
  strokeWeight(1);
  noFill();
  for (let group of constellations) {
    beginShape();
    for (let star of group) {
      vertex(star.x, star.y);
    }
    endShape();
  }

  // 繪製星星
  noStroke();
  for (let star of stars) {
    star.angle += star.speed; // 更新閃爍角度
    let alpha = map(sin(star.angle), -1, 1, 50, 255); // 讓透明度在 50 到 255 之間平滑變換，產生閃爍感
    fill(star.r, star.g, star.b, alpha);
    ellipse(star.x, star.y, star.size);
  }

  // 更新與繪製背景趣味裝飾
  astronaut.update();
  astronaut.display();
  satellite.update();
  satellite.display();
  for (let rocket of rockets) {
    rocket.update();
    rocket.display();
  }

  // 繪製預留未來作品的閃耀亮星
  for (let pStar of placeholderStars) {
    pStar.display();
  }

  // 隨機產生流星 (大約 2% 的機率每幀產生一顆)
  if (random(1) < 0.02) {
    shootingStars.push(new ShootingStar());
  }

  // 更新與繪製所有流星
  for (let i = shootingStars.length - 1; i >= 0; i--) {
    shootingStars[i].update();
    shootingStars[i].display();
    // 如果流星飛出畫面或完全變透明，就將它從陣列中移除
    if (shootingStars[i].isOffScreen()) {
      shootingStars.splice(i, 1);
    }
  }

  // 繪製星球並檢查滑鼠是否懸停
  let isHovering = false;
  for (let planet of planets) {
    planet.display();
    if (planet.checkHover(mouseX, mouseY)) {
      isHovering = true;
    }
  }
  
  // 檢查滑鼠是否指到火箭
  for (let rocket of rockets) {
    if (rocket.checkHover(mouseX, mouseY)) {
      isHovering = true;
    }
  }
  
  // 檢查滑鼠是否指到太空人
  if (astronaut.checkHover(mouseX, mouseY)) {
    isHovering = true;
  }
  
  // 檢查滑鼠是否指到衛星
  if (satellite.checkHover(mouseX, mouseY)) {
    isHovering = true;
  }
  
  // 若滑鼠指到星球，改變鼠標圖案
  if (isHovering) {
    cursor('pointer');
  } else {
    cursor('default');
  }
}

// 當滑鼠點擊星球時，更新 HTML 裡的 iframe 內容
function mousePressed() {
  // 1. 先檢查是否點擊到太空人
  if (astronaut.checkClick(mouseX, mouseY)) {
    return; // 若點到太空人觸發翻滾，則結束執行
  }

  // 2. 檢查是否點擊到衛星
  if (satellite.checkClick(mouseX, mouseY)) {
    return; // 若點到衛星觸發廣播波紋，則結束執行
  }

  // 3. 再檢查是否點擊到火箭
  for (let rocket of rockets) {
    if (rocket.checkClick(mouseX, mouseY)) {
      return; // 若點到火箭，觸發噴火加速並結束，不觸發星球點擊
    }
  }

  // 4. 最後檢查星球點擊
  for (let planet of planets) {
    if (planet.checkHover(mouseX, mouseY)) {
      let iframe = document.getElementById('project-iframe');
      if (iframe) {
            // 1. 先加上 CSS class 觸發宇宙縮小與橫向滑動的動畫
            document.getElementById('app-container').classList.add('show-project');
            
            // 先將 iframe 變透明，避免滑動時看到白底或舊作品
            iframe.style.opacity = '0';

            // 2. 等待轉場動畫放完 (800毫秒) 後，再載入新作品
            setTimeout(() => {
              iframe.onload = () => { iframe.style.opacity = '1'; }; // 載入完成後淡入顯示
              iframe.src = planet.url;
            }, 800);
      }
    }
  }
}

// --- 處理返回按鈕的動畫與清空 ---
function goBackToUniverse() {
  // 1. 移除 class 觸發返回滑動動畫
  document.getElementById('app-container').classList.remove('show-project');
  
  let iframe = document.getElementById('project-iframe');
  if (iframe) {
    // 2. 立即讓作品淡出
    iframe.style.opacity = '0';
    
    // 3. 等待滑回宇宙 (800毫秒) 後，清空 iframe 內容減輕瀏覽器負擔
    setTimeout(() => {
      iframe.onload = null; // 取消事件，避免 about:blank 觸發淡入
      iframe.src = 'about:blank';
    }, 800);
  }
}

// 當視窗大小改變時，自適應調整畫布大小
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

  // 清空並重新產生星星，確保整個新畫布範圍都有星星
  stars = [];
  for (let i = 0; i < 200; i++) {
    let palette = [[255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 180, 180], [255, 255, 150], [150, 220, 255], [180, 255, 180]];
    let col = random(palette);
    stars.push({ 
      x: random(width), y: random(height), size: random(1, 3), 
      r: col[0], g: col[1], b: col[2], angle: random(TWO_PI), speed: random(0.02, 0.05) 
    });
  }
  
  createConstellations(); // 視窗改變時重新產生星座連線
}

// --- 產生隨機星座連線的函式 ---
function createConstellations() {
  constellations = [];
  let numConstellations = floor(random(5, 10)); // 隨機產生 5~9 個星座群組
  
  for (let i = 0; i < numConstellations; i++) {
    let group = [];
    let startStar = random(stars); // 隨機挑一顆當作起點
    group.push(startStar);
    
    let nodes = floor(random(3, 7)); // 每個星座由 3~6 顆星組成
    let current = startStar;
    
    for (let j = 0; j < nodes; j++) {
      // 找尋距離適中的下一顆星星
      for (let star of stars) {
        if (!group.includes(star)) {
          let d = dist(current.x, current.y, star.x, star.y);
          if (d > 30 && d < 120) { // 確保線段長度適中，不會太短或太長
            group.push(star);
            current = star;
            break; // 找到一顆適合的就連過去，產生彎折的星圖形狀
          }
        }
      }
    }
    if (group.length > 2) { // 至少要 3 顆星連在一起才算星座
      constellations.push(group);
    }
  }
}

// --- 定義星球類別 ---
class Planet {
  constructor(xRatio, yRatio, size, col, name, url, type = 'default') {
    this.xRatio = xRatio; // 儲存相對 X 比例 (例如 0.3 表示寬度的 30%)
    this.yRatio = yRatio; // 儲存相對 Y 比例
    this.size = size;
    this.color = col;
    this.name = name;
    this.url = url;
    this.type = type; // 星球的特殊類型，預設為 'default'
    this.angle = random(TWO_PI); // 用來製作上下浮動動畫的初始角度

    // --- 根據星球類型，產生不同的可愛表面特徵 ---
    this.features = [];
    if (this.type === 'fish') {
      let featureCount = floor(random(2, 4)); // 2-3 隻小魚
      for (let i = 0; i < featureCount; i++) {
        this.features.push({
          x: random(-this.size * 0.25, this.size * 0.25),
          y: random(-this.size * 0.25, this.size * 0.25),
          size: random(this.size * 0.2, this.size * 0.3),
          angle: random(TWO_PI) // 每隻魚有自己的隨機方向
        });
      }
    } else if (this.type === 'lightning') {
      let featureCount = floor(random(2, 4)); // 2-3 個閃電圖案
      for (let i = 0; i < featureCount; i++) {
        this.features.push({
          x: random(-this.size * 0.2, this.size * 0.2),
          y: random(-this.size * 0.2, this.size * 0.2),
          size: random(this.size * 0.25, this.size * 0.4),
          angle: random(-PI / 8, PI / 8) // 讓閃電稍微有點傾斜變化
        });
      }
    } else if (this.type === 'bomb') {
      let featureCount = floor(random(1, 3)); // 1-2 顆炸彈
      for (let i = 0; i < featureCount; i++) {
        this.features.push({
          x: random(-this.size * 0.2, this.size * 0.2),
          y: random(-this.size * 0.2, this.size * 0.2),
          size: random(this.size * 0.3, this.size * 0.4),
          angle: random(-PI / 8, PI / 8) // 炸彈稍微傾斜
        });
      }
    } else if (this.type === 'note') {
      // 筆記本星球不使用隨機圓點，而是固定畫一個筆記圖案
    } else {
      // 預設的圓點
      let featureCount = floor(random(3, 6));
      for (let i = 0; i < featureCount; i++) {
        this.features.push({
          x: random(-this.size * 0.3, this.size * 0.3),
          y: random(-this.size * 0.1, this.size * 0.25)
        });
      }
    }
    this.sparkleAngle = 0; // 控制周圍小星星的旋轉角度
  }

  display() {
    // 根據當前畫布的寬高與比例，即時計算真實的 X 與 Y 座標
    let currentX = this.xRatio * width;
    let currentY = this.yRatio * height;

    // 讓星球產生緩慢的上下浮動效果
    let floatY = currentY + sin(this.angle) * 15;
    this.angle += 0.03; // 稍微加快一點浮動速度，看起來更活潑

    push();
    translate(currentX, floatY);

    // 滑鼠懸停時，在星球周圍畫可愛的旋轉小星星
    if (this.checkHover(mouseX, mouseY)) {
      this.sparkleAngle += 0.05;
      push();
      rotate(this.sparkleAngle);
      fill(255, 255, 150);
      noStroke();
      // 畫三顆圍繞的小黃星
      for (let i = 0; i < 3; i++) {
        let sx = cos(i * TWO_PI / 3) * (this.size / 2 + 15);
        let sy = sin(i * TWO_PI / 3) * (this.size / 2 + 15);
        ellipse(sx, sy, 8);
      }
      pop();
    }
    
    // 1. 畫出帶有粗邊框的星球基底 (貼紙風格)
    stroke(255); // 白色粗邊框
    strokeWeight(4);
    fill(this.color);
    ellipse(0, 0, this.size);
    
    // 限制內部繪圖不超出星球邊緣
    drawingContext.save();
    drawingContext.beginPath();
    drawingContext.arc(0, 0, this.size / 2, 0, Math.PI * 2);
    drawingContext.clip();

    // 2. 根據星球類型畫可愛的表面特徵
    noStroke();
    fill(255, 255, 255, 120);
    if (this.type === 'fish') {
      for (let feature of this.features) {
        push();
        translate(feature.x, feature.y);
        rotate(feature.angle);
        let fishSize = feature.size;
        // 魚身體
        ellipse(0, 0, fishSize, fishSize * 0.6);
        // 魚尾巴
        triangle(-fishSize * 0.4, 0, -fishSize * 0.7, -fishSize * 0.3, -fishSize * 0.7, fishSize * 0.3);
        pop();
      }
    } else if (this.type === 'lightning') {
      for (let feature of this.features) {
        push();
        translate(feature.x, feature.y);
        rotate(feature.angle);
        let s = feature.size;
        beginShape();
        vertex(s * 0.1, -s * 0.4);
        vertex(-s * 0.3, s * 0.05);
        vertex(-s * 0.05, s * 0.05);
        vertex(-s * 0.15, s * 0.4);
        vertex(s * 0.3, -s * 0.05);
        vertex(s * 0.05, -s * 0.05);
        endShape(CLOSE);
        pop();
      }
    } else if (this.type === 'bomb') {
      for (let feature of this.features) {
        push();
        translate(feature.x, feature.y);
        rotate(feature.angle);
        let s = feature.size;
        
        // 畫炸彈引線
        stroke(255);
        strokeWeight(2);
        line(0, -s * 0.4, s * 0.2, -s * 0.7);
        
        // 畫引線火花
        noStroke();
        fill(255, 200, 50);
        ellipse(s * 0.2, -s * 0.7, s * 0.2);
        
        // 畫炸彈圓形本體與上方突起
        fill(50);
        rectMode(CENTER);
        rect(0, -s * 0.4, s * 0.4, s * 0.15, 2);
        ellipse(0, 0, s);
        
        // 畫炸彈上的白色反光
        fill(255, 255, 255, 150);
        ellipse(-s * 0.15, -s * 0.15, s * 0.2);
        pop();
      }
    } else if (this.type === 'note') {
      push();
      let s = this.size;
      
      // 畫筆記本紙張
      fill(250, 245, 235);
      rectMode(CENTER);
      rect(0, 0, s * 0.5, s * 0.6, 5);
      
      // 畫筆記本書脊 (左側裝訂線)
      fill(80, 120, 180);
      rect(-s * 0.2, 0, s * 0.1, s * 0.6, 5, 0, 0, 5);
      
      // 畫紙上的橫線
      stroke(200);
      strokeWeight(2);
      line(-s * 0.05, -s * 0.15, s * 0.15, -s * 0.15);
      line(-s * 0.05, 0, s * 0.15, 0);
      line(-s * 0.05, s * 0.15, s * 0.15, s * 0.15);
      
      // 畫紅色的書籤
      noStroke();
      fill(255, 100, 100);
      beginShape();
      vertex(s * 0.1, -s * 0.3);
      vertex(s * 0.2, -s * 0.3);
      vertex(s * 0.2, -s * 0.15);
      vertex(s * 0.15, -s * 0.2);
      vertex(s * 0.1, -s * 0.15);
      endShape(CLOSE);
      pop();
    } else {
      for (let feature of this.features) {
        ellipse(feature.x, feature.y, feature.size);
      }
    }

    // 3. 畫月牙形的立體陰影 (增加童話插畫感)
    fill(0, 0, 0, 30);
    ellipse(this.size * 0.15, this.size * 0.15, this.size, this.size);

    // 4. 畫左上角的高光 (類似果凍或玻璃珠的反光)
    fill(255, 255, 255, 200);
    rotate(-PI / 4);
    ellipse(0, -this.size * 0.3, this.size * 0.5, this.size * 0.15);

    drawingContext.restore();
    pop(); // 恢復繪圖狀態

    // 畫星球下方的文字名稱 (加上可愛的半透明圓角背景框)
    push();
    let textY = floatY + this.size / 2 + 30;
    fill(255, 255, 255, 200);
    noStroke();
    rectMode(CENTER);
    rect(currentX, textY, textWidth(this.name) + 30, 26, 13);
    
    fill(80, 50, 80); // 柔和的深紫灰色文字
    textAlign(CENTER, CENTER);
    textSize(15);
    text(this.name, currentX, textY);
    pop();
  }

  checkHover(mx, my) {
    let currentX = this.xRatio * width;
    let currentY = this.yRatio * height;
    let floatY = currentY + sin(this.angle) * 15;
    let d = dist(mx, my, currentX, floatY);
    return d < this.size / 2; // 判斷滑鼠是否在星球半徑範圍內
  }
}

// --- 定義流星類別 ---
class ShootingStar {
  constructor() {
    this.x = random(width); // 隨機 X 起始位置
    this.y = random(-100, height / 3); // 傾向從畫面上半部產生
    this.length = random(10, 40); // 流星長度基數
    this.speedX = random(10, 20); // 往右下的水平速度
    this.speedY = random(5, 15);  // 往右下的垂直速度
    this.opacity = 255; // 初始透明度 (完全不透明)
    this.thickness = random(1, 3); // 流星粗細
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.opacity -= 3; // 每幀逐漸變暗，營造出尾巴消散的感覺
  }

  display() {
    stroke(255, 255, 255, this.opacity);
    strokeWeight(this.thickness);
    // 從目前座標往回畫一條線當作流星的尾巴
    line(this.x, this.y, this.x - this.speedX * (this.length / 10), this.y - this.speedY * (this.length / 10));
    noStroke(); // 畫完恢復為無邊框，以免影響星球與星星的繪圖
  }

  isOffScreen() {
    // 如果飛出畫面邊界或是完全透明了，就回傳 true
    return this.x > width + 100 || this.y > height + 100 || this.opacity <= 0;
  }
}

// --- 定義未來作品的預留星星類別 ---
class PlaceholderStar {
  constructor(xRatio, yRatio, size) {
    this.xRatio = xRatio; // 相對 X 比例
    this.yRatio = yRatio; // 相對 Y 比例
    this.baseSize = size; // 基礎大小
    this.angle = random(TWO_PI); // 控制閃爍動畫的初始角度
  }

  display() {
    let currentX = this.xRatio * width;
    let currentY = this.yRatio * height;

    this.angle += 0.05; // 閃爍與呼吸的速度
    let pulse = sin(this.angle) * 5; // 呼吸光暈的縮放變化量

    push();
    // 1. 畫柔和的發光外圈 (帶點鵝黃色的光暈)
    noStroke();
    fill(255, 255, 200, 80); 
    ellipse(currentX, currentY, this.baseSize + 15 + pulse);

    // 2. 畫星星本體 (實心白點)
    fill(255, 255, 255, 220);
    ellipse(currentX, currentY, this.baseSize);

    // 3. 畫童話感的十字星芒
    stroke(255, 255, 255, 150);
    strokeWeight(2);
    line(currentX - this.baseSize * 1.2, currentY, currentX + this.baseSize * 1.2, currentY);
    line(currentX, currentY - this.baseSize * 1.2, currentX, currentY + this.baseSize * 1.2);
    pop();
  }
}

// --- 定義趣味背景物件類別 (太空人、衛星、火箭) ---

class Astronaut {
  constructor() {
    this.x = random(width);
    this.y = random(height);
    this.angle = random(TWO_PI);
    this.speedX = random(-0.5, 0.5);
    this.speedY = random(-0.5, 0.5);
    this.rotSpeed = random(-0.01, 0.01);
    this.spinEndTime = 0; // 記錄翻轉結束時間
  }
  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    if (millis() < this.spinEndTime) {
      this.angle += 0.25; // 被點擊時快速翻滾
    } else {
      this.angle += this.rotSpeed; // 平常緩慢旋轉
    }
    this.wrap();
  }
  display() {
    push();
    translate(this.x, this.y);
    rotate(this.angle);
    noStroke();
    // 背包
    fill(220);
    rect(-15, -10, 30, 25, 5);
    // 身體
    fill(255);
    rect(-12, -5, 24, 30, 8);
    // 腳
    rect(-12, 15, 10, 15, 5);
    rect(2, 15, 10, 15, 5);
    // 手
    push();
    rotate(-PI/6);
    rect(-20, -5, 8, 15, 4);
    pop();
    push();
    rotate(PI/6);
    rect(12, -5, 8, 15, 4);
    pop();
    // 頭盔與玻璃面罩
    fill(255);
    ellipse(0, -10, 28, 28);
    fill(150, 200, 255);
    ellipse(0, -12, 20, 16);
    // 面罩反光
    fill(255);
    ellipse(4, -15, 4, 4);
    pop();
  }
  wrap() {
    if (this.x < -50) this.x = width + 50;
    if (this.x > width + 50) this.x = -50;
    if (this.y < -50) this.y = height + 50;
    if (this.y > height + 50) this.y = -50;
  }
  checkHover(mx, my) {
    return dist(mx, my, this.x, this.y) < 35; // 太空人的點擊範圍
  }
  checkClick(mx, my) {
    if (this.checkHover(mx, my)) {
      this.spinEndTime = millis() + 500; // 快速翻滾持續 0.5 秒 (大約轉一圈多)
      return true;
    }
    return false;
  }
}

class Satellite {
  constructor() {
    this.x = random(width);
    this.y = random(height);
    this.angle = random(TWO_PI);
    this.speedX = random(-0.8, 0.8);
    this.speedY = random(-0.8, 0.8);
    this.rotSpeed = random(-0.02, 0.02);
    this.isSignaling = false; // 是否正在發送訊號
    this.signalRadius = 0;    // 訊號波紋的半徑
    this.signalAlpha = 0;     // 訊號波紋的透明度
  }
  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.angle += this.rotSpeed;
    this.wrap();
  }
  display() {
    push();
    translate(this.x, this.y);
    rotate(this.angle);
    
    // 繪製廣播訊號波紋 (以天線為中心向外擴散)
    if (this.isSignaling) {
      push();
      noFill();
      strokeWeight(2);
      stroke(150, 220, 255, this.signalAlpha);
      ellipse(0, -32, this.signalRadius);
      if (this.signalRadius > 15) {
        stroke(150, 220, 255, this.signalAlpha * 0.6);
        ellipse(0, -32, this.signalRadius - 15);
      }
      if (this.signalRadius > 30) {
        stroke(150, 220, 255, this.signalAlpha * 0.3);
        ellipse(0, -32, this.signalRadius - 30);
      }
      pop();

      this.signalRadius += 2.5; // 波紋擴展速度
      this.signalAlpha -= 4;    // 透明度遞減
      if (this.signalAlpha <= 0) this.isSignaling = false;
    }

    noStroke();
    // 太陽能板
    fill(100, 180, 255);
    rect(-45, -10, 30, 20, 2);
    rect(15, -10, 30, 20, 2);
    // 連接軸
    fill(150);
    rect(-15, -2, 30, 4);
    // 衛星主體
    fill(220);
    rect(-12, -15, 24, 30, 4);
    // 天線與訊號燈
    stroke(200);
    strokeWeight(2);
    line(0, -15, 0, -30);
    noStroke();
    fill(255, 100, 100);
    ellipse(0, -32, 6, 6);
    pop();
  }
  wrap() {
    if (this.x < -50) this.x = width + 50;
    if (this.x > width + 50) this.x = -50;
    if (this.y < -50) this.y = height + 50;
    if (this.y > height + 50) this.y = -50;
  }
  checkHover(mx, my) {
    return dist(mx, my, this.x, this.y) < 40; // 衛星的點擊判定範圍
  }
  checkClick(mx, my) {
    if (this.checkHover(mx, my)) {
      this.isSignaling = true;
      this.signalRadius = 0; // 重置波紋大小
      this.signalAlpha = 255; // 重置透明度
      return true;
    }
    return false;
  }
}

class Rocket {
  constructor() {
    this.x = random(width);
    this.y = random(height);
    this.angle = random(TWO_PI); // 隨機面向一個方向
    this.normalSpeed = random(1.5, 2.5); // 平常慢慢前進
    this.boostSpeed = this.normalSpeed * 4; // 點擊時的加速速度
    this.speed = this.normalSpeed;
    this.boostEndTime = 0; // 加速結束的時間戳記
    this.orbitingPlanet = null; // 正在繞行的星球
    this.orbitAngle = 0; // 繞行的角度
    this.orbitRadius = 0; // 繞行半徑
    this.orbitCooldown = 0; // 防止脫離後立刻被同一顆星球吸回去的冷卻時間
  }
  update() {
    let isAccelerating = millis() < this.boostEndTime;
    
    // 1. 速度控制
    if (isAccelerating) {
      this.speed = this.boostSpeed;
      this.orbitingPlanet = null; // 加速時強制脫離軌道
    } else {
      this.speed = this.normalSpeed;
    }

    // 2. 捕捉判斷：若沒有在加速、也沒在繞行，且冷卻時間已過，檢查是否靠近星球
    if (!this.orbitingPlanet && !isAccelerating && millis() > this.orbitCooldown) {
      for (let p of planets) {
        let px = p.xRatio * width;
        let py = p.yRatio * height;
        let d = dist(this.x, this.y, px, py);
        let captureRadius = p.size / 2 + 40; // 捕捉半徑
        
        if (d < captureRadius) {
          this.orbitingPlanet = p;
          this.orbitRadius = captureRadius;
          this.orbitAngle = atan2(this.y - py, this.x - px);
          break;
        }
      }
    }

    // 3. 移動控制
    if (this.orbitingPlanet) {
      let px = this.orbitingPlanet.xRatio * width;
      // 取得星球目前的浮動 Y 座標
      let floatY = this.orbitingPlanet.yRatio * height + sin(this.orbitingPlanet.angle) * 15;
      
      this.orbitAngle += 0.025; // 順時針繞行速度
      this.x = px + cos(this.orbitAngle) * this.orbitRadius;
      this.y = floatY + sin(this.orbitAngle) * this.orbitRadius;
      // 讓火箭頭始終朝向軌道切線方向 (面向前進方向)
      this.angle = this.orbitAngle + PI; 
    } else {
      // 讓火箭沿著自己朝向的角度直線前進
      this.x += cos(this.angle - PI/2) * this.speed;
      this.y += sin(this.angle - PI/2) * this.speed;
      this.wrap();
    }
  }
  display() {
    push();
    translate(this.x, this.y);
    rotate(this.angle);
    noStroke();
    
    // 閃爍的火焰
    let isAccelerating = millis() < this.boostEndTime;
    // 加速時火焰變長變大，平常則是一般大小
    let fireScale = isAccelerating ? random(2.0, 3.5) : random(0.8, 1.2);
    
    fill(255, 150, 0);
    triangle(-8, 15, 8, 15, 0, 15 + 20 * fireScale);
    fill(255, 255, 0);
    triangle(-4, 15, 4, 15, 0, 15 + 10 * fireScale);
    // 尾翼
    fill(255, 100, 100);
    triangle(-10, 10, -10, -5, -20, 15);
    triangle(10, 10, 10, -5, 20, 15);
    // 火箭主體
    fill(240);
    rect(-10, -15, 20, 30, 10, 10, 0, 0);
    // 火箭頭
    fill(255, 100, 100);
    triangle(-10, -15, 10, -15, 0, -35);
    // 窗戶與反光
    fill(100, 200, 255);
    ellipse(0, -5, 10, 10);
    fill(255);
    ellipse(2, -7, 3, 3);
    pop();
  }
  wrap() {
    if (this.x < -50) this.x = width + 50;
    if (this.x > width + 50) this.x = -50;
    if (this.y < -50) this.y = height + 50;
    if (this.y > height + 50) this.y = -50;
  }
  checkHover(mx, my) {
    // 火箭的點擊判定範圍
    return dist(mx, my, this.x, this.y) < 30;
  }
  checkClick(mx, my) {
    if (this.checkHover(mx, my)) {
      this.boostEndTime = millis() + 300; // 噴火加速 0.3 秒
      this.orbitingPlanet = null; // 脫離繞行星球
      this.orbitCooldown = millis() + 2500; // 脫離後 2.5 秒內不會再次被吸入軌道
      return true;
    }
    return false;
  }
}
