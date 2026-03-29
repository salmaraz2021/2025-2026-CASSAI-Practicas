const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// ==================== PLAYER ====================
let player = {
  x: canvas.width / 2 - 20,
  y: canvas.height - 60,
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

// Disparo jugador
function shoot() {
  if (energy > 0) {
    bullets.push({
      x: player.x + player.width / 2 - 2,
      y: player.y
    });
    energy--;
  }
}

// Recarga automática
setInterval(() => {
  if (energy < maxEnergy) {
    energy++;
  }
}, 500);

// ==================== ALIENS ====================
let aliens = [];

const rows = 3;
const cols = 8;
const spacingX = 70;
const spacingY = 60;
const offsetX = 100;
const offsetY = 60;

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

// Movimiento tipo invaders
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

    aliens.forEach(a => {
      a.y += 20;
    });
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

// ==================== COLISION ====================
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

// ==================== UPDATE ====================
function update() {

  // Movimiento jugador
  if (keys["ArrowLeft"]) player.x -= player.speed;
  if (keys["ArrowRight"]) player.x += player.speed;

  // Limites
  player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));

  // Movimiento aliens
  alienSpeed = 1 + (24 - aliens.length) * 0.1;
  moveAliens();

  // Balas jugador
  bullets.forEach((b, i) => {
    b.y -= 7;

    // Eliminar si sale pantalla
    if (b.y < 0) bullets.splice(i, 1);

    aliens.forEach((a, j) => {
      if (collision(b, a)) {
        aliens.splice(j, 1);
        bullets.splice(i, 1);
        score += 10;
      }
    });
  });

  // Balas enemigas
  alienBullets.forEach((b, i) => {
    b.y += 4;

    if (b.y > canvas.height) alienBullets.splice(i, 1);

    if (collision(b, player)) {
      alienBullets.splice(i, 1);
      player.lives--;
    }
  });

  // GAME OVER
  if (player.lives <= 0) {
    alert("💀 GAME OVER");
    location.reload();
  }

  // VICTORIA
  if (aliens.length === 0) {
    alert("🎉 VICTORIA");
    location.reload();
  }
}

// ==================== DRAW ====================
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // efecto glow retro
  ctx.shadowColor = "white";
  ctx.shadowBlur = 5;

  // PLAYER
  ctx.fillStyle = "cyan";
  ctx.fillRect(player.x, player.y, player.width, player.height);

  // ALIENS
  ctx.fillStyle = "#7fffd4";
  aliens.forEach(a => {
    ctx.fillRect(a.x, a.y, a.width, a.height);
  });

  // BALAS jugador
  ctx.fillStyle = "red";
  bullets.forEach(b => {
    ctx.fillRect(b.x, b.y, 4, 10);
  });

  // BALAS enemigas
  ctx.fillStyle = "yellow";
  alienBullets.forEach(b => {
    ctx.fillRect(b.x, b.y, 4, 10);
  });

  // HUD
  ctx.fillStyle = "white";
  ctx.font = "16px monospace";

  ctx.fillText("Puntuación: " + score, 10, 20);
  ctx.fillText("Vidas: " + player.lives, 10, 40);
  ctx.fillText("Energía: " + energy, 10, 60);
}

// ==================== LOOP ====================
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();