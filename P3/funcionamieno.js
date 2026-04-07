window.addEventListener("DOMContentLoaded", () => {

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// ================= ESTADO =================
let bullets = [];
let aliens = [];
let explosions = [];
let alienBullets = [];

let alienShootTimer = 0;

let energy = 5;
let maxEnergy = 5;

let score = 0;
let keys = {};

let alienDirection = 1;
let alienSpeed = 1;

let gameStarted = false;
window.gameEnded = false;

// ================= CRONO =================
const display = document.getElementById("cronometro");
const crono = new Crono(display);

// ================= IMÁGENES =================
const playerImg = new Image();
playerImg.src = "nave.webp";

const alienImg = new Image();
alienImg.src = "alien.webp";

const heartImg = new Image();
heartImg.src = "corazon.webp";

const explosionImg = new Image();
explosionImg.src = "explosion.webp";

// ❌ IMPORTANTE: ya NO usamos fondo.gif en JS

// ================= SONIDOS =================
const shootSound = new Audio("P3_sonido.mp3");
const explosionSound = new Audio("P3_explosion.mp3");

function safePlay(audio) {
  if (!audio) return;
  audio.currentTime = 0;
  audio.play().catch(() => {});
}

// ================= PLAYER =================
let player = {
  x: 0,
  y: 0,
  width: 40,
  height: 40,
  speed: 6,
  lives: 3
};

// ================= RESIZE =================
function resizeCanvas() {
  const rect = canvas.getBoundingClientRect(); // posición real en pantalla

  const espacioDisponible = window.innerHeight - rect.top;

  canvas.width = 800;
  canvas.height = espacioDisponible - 10; // pequeño margen de seguridad

  player.x = canvas.width / 2 - player.width / 2;
  player.y = canvas.height - 80;
}
window.addEventListener("resize", resizeCanvas);

// ================= ALIENS =================
function createAliens() {

  aliens = [];

  const rows = 3;
  const cols = 8;

  const spacingX = canvas.width / (cols + 1);
  const spacingY = 60;
  const offsetY = 120;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      aliens.push({
        x: spacingX + c * spacingX,
        y: offsetY + r * spacingY,
        width: 40,
        height: 40
      });
    }
  }

  alienDirection = 1;
}

// ================= COLLISION =================
function collision(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

// ================= INPUT =================
document.addEventListener("keydown", (e) => {
  keys[e.key] = true;

  if (e.key === " ") shoot();
});

document.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});

// ================= SHOOT =================
function shoot() {

  if (window.gameEnded) return;

  if (!gameStarted) {
    gameStarted = true;
    crono.start();
  }

  if (energy <= 0) return;

  bullets.push({
    x: player.x + player.width / 2 - 2,
    y: player.y,
    width: 4,
    height: 10
  });

  energy--;

  safePlay(shootSound);
}

// ================= ALIEN SHOOT =================
function alienShoot() {

  if (!gameStarted || window.gameEnded) return;
  if (aliens.length === 0) return;

  alienShootTimer++;

  if (alienShootTimer < 60) return;
  alienShootTimer = 0;

  const shooter = aliens[Math.floor(Math.random() * aliens.length)];

  alienBullets.push({
    x: shooter.x + shooter.width / 2,
    y: shooter.y + shooter.height,
    width: 4,
    height: 10,
    speed: 4
  });
}

// ================= MOVIMIENTO ALIENS =================
function moveAliens() {

  let minX = Infinity;
  let maxX = -Infinity;

  for (let i = 0; i < aliens.length; i++) {
    aliens[i].x += alienDirection * alienSpeed;

    minX = Math.min(minX, aliens[i].x);
    maxX = Math.max(maxX, aliens[i].x + aliens[i].width);
  }

  if (minX <= 0 || maxX >= canvas.width) {
    alienDirection *= -1;

    for (let i = 0; i < aliens.length; i++) {
      aliens[i].y += 3;
    }
  }

  for (let i = 0; i < aliens.length; i++) {
    if (aliens[i].y + aliens[i].height >= player.y) {
      endGame(false);
    }
  }
}

// ================= GAME OVER =================
function endGame(win) {

  if (window.gameEnded) return;
  window.gameEnded = true;

  crono.stop();

  const div = document.createElement("div");
  div.style.position = "fixed";
  div.style.top = "0";
  div.style.left = "0";
  div.style.width = "100%";
  div.style.height = "100%";
  div.style.background = "rgba(0,0,0,0.9)";
  div.style.color = "white";
  div.style.display = "flex";
  div.style.flexDirection = "column";
  div.style.justifyContent = "center";
  div.style.alignItems = "center";
  div.style.zIndex = "9999";

  const title = document.createElement("h1");
  title.textContent = win ? "YOU WIN!!!" : "YOU LOSE!";

  const stats = document.createElement("p");
  const tiempoFinal = crono.getTime();

  stats.innerHTML = `
  Tiempo: ${tiempoFinal} <br>
  Vidas restantes: ${player.lives}
  `;

  const btn = document.createElement("button");
  btn.textContent = "TRY AGAIN";

  btn.onclick = () => {
    div.remove();

    window.gameEnded = false;
    gameStarted = false;

    bullets = [];
    alienBullets = [];
    explosions = [];
    aliens = [];

    player.lives = 3;
    energy = maxEnergy;
    score = 0;

    alienDirection = 1;
    alienSpeed = 1;
    alienShootTimer = 0;

    crono.reset();

    createAliens();
  };

  div.appendChild(title);
  div.appendChild(stats);
  div.appendChild(btn);

  document.body.appendChild(div);
}

// ================= UPDATE =================
function update() {

  if (window.gameEnded) return;

  if (keys["ArrowLeft"]) player.x -= player.speed;
  if (keys["ArrowRight"]) player.x += player.speed;

  player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));

  if (gameStarted) {
    alienSpeed = 1 + (30 - aliens.length) * 0.05;
    moveAliens();
  }

  for (let i = bullets.length - 1; i >= 0; i--) {

    bullets[i].y -= 7;

    if (bullets[i].y < 0) {
      bullets.splice(i, 1);
      continue;
    }

    for (let j = aliens.length - 1; j >= 0; j--) {

      if (collision(bullets[i], aliens[j])) {

        explosions.push({
          x: aliens[j].x,
          y: aliens[j].y,
          life: 15
        });

        safePlay(explosionSound);

        aliens.splice(j, 1);
        bullets.splice(i, 1);
        score += 10;
        break;
      }
    }
  }

  alienShoot();

  for (let i = alienBullets.length - 1; i >= 0; i--) {

    alienBullets[i].y += alienBullets[i].speed;

    if (
      alienBullets[i].x < player.x + player.width &&
      alienBullets[i].x + alienBullets[i].width > player.x &&
      alienBullets[i].y < player.y + player.height &&
      alienBullets[i].y + alienBullets[i].height > player.y
    ) {
      alienBullets.splice(i, 1);

      player.lives--;

      if (player.lives <= 0) endGame(false);

      continue;
    }

    if (alienBullets[i].y > canvas.height) {
      alienBullets.splice(i, 1);
    }
  }

  for (let i = explosions.length - 1; i >= 0; i--) {
    explosions[i].life--;
    if (explosions[i].life <= 0) explosions.splice(i, 1);
  }

  if (energy < maxEnergy && Math.random() < 0.01) {
    energy++;
  }

  if (aliens.length === 0) endGame(true);
}

// ================= DRAW =================
function draw() {

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);

  aliens.forEach(a => {
    ctx.drawImage(alienImg, a.x, a.y, a.width, a.height);
  });

  bullets.forEach(b => {
    ctx.fillStyle = "red";
    ctx.fillRect(b.x, b.y, 4, 10);
  });

  alienBullets.forEach(b => {
    ctx.fillStyle = "lime";
    ctx.fillRect(b.x, b.y, b.width, b.height);
  });

  explosions.forEach(e => {
    ctx.drawImage(explosionImg, e.x, e.y, 30, 30);
  });

  // ================= HUD ORIGINAL =================
  ctx.fillStyle = "white";
  ctx.font = "16px Arial";

  ctx.fillText("Puntuación: " + score, 10, 20);

  ctx.fillText("Vidas:", 10, 45);

  for (let i = 0; i < player.lives; i++) {
    ctx.drawImage(heartImg, 70 + i * 22, 30, 18, 18);
  }

  ctx.fillText("Energía:", 10, 70);

  ctx.strokeStyle = "white";
  ctx.strokeRect(90, 60, 120, 10);

  ctx.fillStyle = "lime";
  ctx.fillRect(90, 60, (energy / maxEnergy) * 120, 10);
}

// ================= LOOP =================
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

// ================= START =================
resizeCanvas();
createAliens();
loop();

});