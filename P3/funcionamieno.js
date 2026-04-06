const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// ==================== RESPONSIVE CANVAS ====================
function resizeCanvas() {
  canvas.width = window.innerWidth * 0.8;
  canvas.height = window.innerHeight * 0.8;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// ==================== CRONÓMETRO ====================
const display = document.getElementById("cronometro");
const crono = new Crono(display);

// ==================== IMÁGENES ====================
const playerImg = new Image();
playerImg.src = "nave.webp";

const alienImg = new Image();
alienImg.src = "alien.webp";

const explosionImg = new Image();
explosionImg.src = "explosion.webp";

const heartImg = new Image();
heartImg.src = "corazon.webp";

// ==================== SONIDOS ====================
const shootSound = new Audio("sounds/laser.wav");
const explosionSound = new Audio("P3_explosion.mp3");

// ==================== PLAYER ====================
let player = {
  x: canvas.width / 2 - 20,
  y: canvas.height - 80,
  width: 40,
  height: 40,
  speed: 6,
  lives: 3
};

// ==================== CONTROLES ====================
let keys = {};

document.addEventListener("keydown", e => {
  keys[e.key] = true;
  if (e.key === " ") shoot();
});

document.addEventListener("keyup", e => {
  keys[e.key] = false;
});

// ==================== DISPAROS ====================
let bullets = [];
let alienBullets = [];

let energy = 5;
let maxEnergy = 5;

function shoot() {
  // ⏱️ cronómetro empieza en el primer disparo
  if (!crono.timer) crono.start();

  if (energy > 0) {
    bullets.push({
      x: player.x + player.width / 2 - 2,
      y: player.y
    });

    energy--;

    shootSound.currentTime = 0;
    shootSound.play();
  }
}

// recarga energía
setInterval(() => {
  if (energy < maxEnergy) energy++;
}, 500);

// ==================== ALIENS ====================
let aliens = [];

const rows = 3;
const cols = 8;
const spacingX = 70;
const spacingY = 60;

function createAliens() {
  aliens = [];
  const offsetX = canvas.width * 0.1;
  const offsetY = canvas.height * 0.1;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      aliens.push({
        x: offsetX + c * spacingX,
        y: offsetY + r * spacingY,
        width: 40,
        height: 40
      });
    }
  }
}
createAliens();

let alienDirection = 1;
let alienSpeed = 1;

function moveAliens() {
  let hitEdge = false;

  aliens.forEach(a => {
    a.x += alienDirection * alienSpeed;

    if (a.x <= 0 || a.x + a.width >= canvas.width) {
      hitEdge = true;
    }
  });

  if (hitEdge) {
    alienDirection *= -1;
    aliens.forEach(a => a.y += 20);
  }
}

// ==================== DISPARO ENEMIGO ====================
setInterval(() => {
  if (aliens.length > 0) {
    let shooter = aliens[Math.floor(Math.random() * aliens.length)];

    alienBullets.push({
      x: shooter.x + shooter.width / 2,
      y: shooter.y
    });
  }
}, 1000);

// ==================== EXPLOSIONES ====================
let explosions = [];

// ==================== COLISIÓN ====================
function collision(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + 5 > b.x &&
    a.y < b.y + b.height &&
    a.y + 10 > b.y
  );
}

// ==================== SCORE ====================
let score = 0;

// ==================== GAME OVER / WIN CARD ====================
function endGame(win) {
  crono.stop();

  document.getElementById("endCard").classList.remove("hidden");
  document.getElementById("endTitle").textContent = win ? "YOU WIN 🎉" : "YOU LOSE 💀";
  document.getElementById("endLives").textContent =
    win ? `Vidas restantes: ${player.lives}` : "";

  document.getElementById("retryBtn").onclick = () => location.reload();
}

// ==================== UPDATE ====================
function update() {

  // player movement
  if (keys["ArrowLeft"]) player.x -= player.speed;
  if (keys["ArrowRight"]) player.x += player.speed;

  player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));

  alienSpeed = 1 + (24 - aliens.length) * 0.1;
  moveAliens();

  // bullets
  bullets.forEach((b, i) => {
    b.y -= 7;

    if (b.y < 0) bullets.splice(i, 1);

    aliens.forEach((a, j) => {
      if (collision(b, a)) {

        explosions.push({
          x: a.x,
          y: a.y,
          frame: 0
        });

        explosionSound.currentTime = 0;
        explosionSound.play();

        aliens.splice(j, 1);
        bullets.splice(i, 1);
        score += 10;
      }
    });
  });

  // enemy bullets
  alienBullets.forEach((b, i) => {
    b.y += 4;

    if (b.y > canvas.height) alienBullets.splice(i, 1);

    if (collision(b, player)) {
      alienBullets.splice(i, 1);
      player.lives--;
    }
  });

  // explosions
  explosions.forEach((e, i) => {
    e.frame++;
    if (e.frame > 15) explosions.splice(i, 1);
  });

  // LOSE
  if (player.lives <= 0) {
    endGame(false);
  }

  // WIN
  if (aliens.length === 0) {
    endGame(true);
  }
}

// ==================== DRAW ====================
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // PLAYER
  ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);

  // ALIENS
  aliens.forEach(a => {
    ctx.drawImage(alienImg, a.x, a.y, a.width, a.height);
  });

  // BULLETS
  ctx.fillStyle = "red";
  bullets.forEach(b => ctx.fillRect(b.x, b.y, 4, 10));

  ctx.fillStyle = "yellow";
  alienBullets.forEach(b => ctx.fillRect(b.x, b.y, 4, 10));

  // EXPLOSIONS
  explosions.forEach(e => {
    ctx.drawImage(explosionImg, e.x, e.y, 40, 40);
  });

  // ==================== HUD ====================
  ctx.fillStyle = "white";
  ctx.font = "16px monospace";

  ctx.fillText("Puntuación: " + score, 10, 20);

  // vidas con imagen ❤️
  for (let i = 0; i < player.lives; i++) {
    ctx.drawImage(heartImg, 10 + i * 30, 30, 20, 20);
  }

  // energía
  ctx.strokeStyle = "white";
  ctx.strokeRect(10, 70, 100, 10);

  ctx.fillStyle = "cyan";
  ctx.fillRect(10, 70, (energy / maxEnergy) * 100, 10);

  ctx.fillStyle = "white";
  ctx.fillText("Energía", 10, 65);
}

// ==================== LOOP ====================
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();