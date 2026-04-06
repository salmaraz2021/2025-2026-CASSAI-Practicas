const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// ==================== VARIABLES ====================
let bullets = [];
let alienBullets = [];
let explosions = [];
let aliens = [];

let energy = 5;
let maxEnergy = 5;
let score = 0;

let keys = {};

let alienDirection = 1;
let alienSpeed = 1;

window.gameEnded = false;

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
const shootSound = new Audio("P3_sonido.mp3");
const explosionSound = new Audio("P3_explosion.mp3");

// ==================== PLAYER ====================
let player = {
  x: 0,
  y: 0,
  width: 40,
  height: 40,
  speed: 6,
  lives: 3
};

// ==================== RESIZE ====================
function resizeCanvas() {
  canvas.width = window.innerWidth * 0.8;
  canvas.height = window.innerHeight * 0.8;

  player.x = canvas.width / 2 - player.width / 2;
  player.y = canvas.height - 80;
}

window.addEventListener("resize", resizeCanvas);

// ==================== CREAR ALIENS ====================
function createAliens() {
  aliens = [];

  const rows = 3;
  const cols = 8;

  const spacingX = canvas.width / (cols + 1);

  // 👇 MÁS JUNTOS
  const spacingY = 60;

  const offsetX = spacingX;

  // 👇 MÁS ARRIBA (NO TAPAR HUD)
  const offsetY = 120;

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

  alienDirection = 1;
}

// ==================== CONTROLES ====================
document.addEventListener("keydown", e => {
  keys[e.key] = true;
  if (e.key === " ") shoot();
});

document.addEventListener("keyup", e => {
  keys[e.key] = false;
});

// ==================== DISPARO ====================
function shoot() {
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

// ==================== MOVIMIENTO ALIENS ====================
function moveAliens() {
  if (aliens.length === 0) return;

  let minX = Infinity;
  let maxX = -Infinity;

  for (let i = 0; i < aliens.length; i++) {
    aliens[i].x += alienDirection * alienSpeed;

    if (aliens[i].x < minX) minX = aliens[i].x;
    if (aliens[i].x + aliens[i].width > maxX) {
      maxX = aliens[i].x + aliens[i].width;
    }
  }

  let hitEdge = (minX <= 0 || maxX >= canvas.width);

  if (hitEdge) {
    alienDirection *= -1;

    for (let i = 0; i < aliens.length; i++) {
      aliens[i].y += 3;
    }
  }

  for (let i = 0; i < aliens.length; i++) {
    if (aliens[i].y + aliens[i].height >= player.y) {
      endGame(false);
      break;
    }
  }
}

// ==================== DISPARO ENEMIGO ====================
setInterval(() => {
  if (aliens.length > 0 && !window.gameEnded) {
    let shooter = aliens[Math.floor(Math.random() * aliens.length)];

    alienBullets.push({
      x: shooter.x + shooter.width / 2,
      y: shooter.y
    });
  }
}, 1000);

// ==================== COLISIÓN ====================
function collision(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + 5 > b.x &&
    a.y < b.y + b.height &&
    a.y + 10 > b.y
  );
}

// ==================== REINICIAR ====================
function restartGame() {
  bullets = [];
  alienBullets = [];
  explosions = [];
  aliens = [];

  energy = 5;
  score = 0;

  player.lives = 3;

  window.gameEnded = false;

  crono.reset();

  createAliens();

  document.querySelector("div[style*='position: fixed']").remove();
}

// ==================== GAME OVER ====================
function endGame(win) {
  if (window.gameEnded) return;
  window.gameEnded = true;

  // 👇 asegurar parada
  crono.stop();

  const banner = document.createElement("div");
  banner.style.position = "fixed";
  banner.style.top = "0";
  banner.style.left = "0";
  banner.style.width = "100%";
  banner.style.height = "100%";
  banner.style.background = "rgba(0,0,0,0.9)";
  banner.style.color = "white";
  banner.style.display = "flex";
  banner.style.flexDirection = "column";
  banner.style.justifyContent = "center";
  banner.style.alignItems = "center";

  const resultado = document.createElement("h1");
  resultado.textContent = win ? "🏆 HAS GANADO" : "💀 HAS PERDIDO";

  const vidas = document.createElement("p");
  vidas.textContent = "Vidas restantes: " + player.lives;

  const tiempo = document.createElement("p");
  tiempo.textContent = "Tiempo: " + display.textContent;

  const boton = document.createElement("button");
  boton.textContent = "🔁 VOLVER A JUGAR";
  boton.onclick = restartGame;

  banner.appendChild(resultado);
  banner.appendChild(vidas);
  banner.appendChild(tiempo);
  banner.appendChild(boton);

  document.body.appendChild(banner);
}

// ==================== UPDATE ====================
function update() {
  if (window.gameEnded) return;

  if (keys["ArrowLeft"]) player.x -= player.speed;
  if (keys["ArrowRight"]) player.x += player.speed;

  player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));

  alienSpeed = 1 + (30 - aliens.length) * 0.08;

  moveAliens();

  bullets.forEach((b, i) => {
    b.y -= 7;
    if (b.y < 0) bullets.splice(i, 1);

    aliens.forEach((a, j) => {
      if (collision(b, a)) {
        explosions.push({ x: a.x, y: a.y, frame: 0 });

        explosionSound.currentTime = 0;
        explosionSound.play();

        aliens.splice(j, 1);
        bullets.splice(i, 1);

        score += 10;
      }
    });
  });

  alienBullets.forEach((b, i) => {
    b.y += 4;
    if (b.y > canvas.height) alienBullets.splice(i, 1);

    if (collision(b, player)) {
      alienBullets.splice(i, 1);
      player.lives--;
    }
  });

  explosions.forEach((e, i) => {
    e.frame++;
    if (e.frame > 15) explosions.splice(i, 1);
  });

  if (player.lives <= 0) endGame(false);
  if (aliens.length === 0) endGame(true);
}

// ==================== DIBUJO ====================
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);

  aliens.forEach(a => {
    ctx.drawImage(alienImg, a.x, a.y, a.width, a.height);
  });

  ctx.fillStyle = "red";
  bullets.forEach(b => ctx.fillRect(b.x, b.y, 4, 10));

  ctx.fillStyle = "yellow";
  alienBullets.forEach(b => ctx.fillRect(b.x, b.y, 4, 10));

  explosions.forEach(e => {
    ctx.drawImage(explosionImg, e.x, e.y, 40, 40);
  });

  ctx.fillStyle = "white";
  ctx.font = "16px monospace";

  ctx.fillText("Puntuación: " + score, 10, 20);

  ctx.fillText("Vidas:", 10, 45);
  for (let i = 0; i < player.lives; i++) {
    ctx.drawImage(heartImg, 65 + i * 25, 30, 18, 18);
  }

  const energyY = 70;
  ctx.fillText("Energía:", 10, energyY);

  ctx.strokeRect(90, energyY - 10, 120, 10);
  ctx.fillStyle = "cyan";
  ctx.fillRect(90, energyY - 10, (energy / maxEnergy) * 120, 10);
}

// ==================== LOOP ====================
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

// ==================== INICIO ====================
resizeCanvas();
createAliens();
gameLoop();