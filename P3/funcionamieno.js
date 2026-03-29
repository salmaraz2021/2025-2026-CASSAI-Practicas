//VARIABLES PRINCIPALES//
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let player = {
  x: 400,
  y: 550,
  width: 40,
  height: 40,
  speed: 5,
  lives: 3
};

let bullets = [];
let alienBullets = [];

let energy = 5;
let maxEnergy = 5;

let score = 0;

//CREAR ALIENIGENAS//
let aliens = [];

for (let row = 0; row < 3; row++) {
  for (let col = 0; col < 8; col++) {
    aliens.push({
      x: 80 + col * 80,
      y: 50 + row * 60,
      width: 40,
      height: 40
    });
  }
}

//CONTROLES//
let keys = {};

document.addEventListener("keydown", e => {
  keys[e.key] = true;

  if (e.key === " ") shoot();
});

document.addEventListener("keyup", e => {
  keys[e.key] = false;
});

//DISPARO//
function shoot() {
  if (energy > 0) {
    bullets.push({
      x: player.x + 15,
      y: player.y
    });
    energy--;
  }
}

//RECARGA AUTOMÁTICA//
setInterval(() => {
  if (energy < maxEnergy) {
    energy++;
  }
}, 500);

//DISPARO ENEMIGO//
setInterval(() => {
  if (aliens.length > 0) {
    let shooter = aliens[Math.floor(Math.random() * aliens.length)];

    alienBullets.push({
      x: shooter.x + 20,
      y: shooter.y
    });
  }
}, 1000);

//CONCLUSIONES//
function collision(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + 5 > b.x &&
    a.y < b.y + b.height &&
    a.y + 10 > b.y
  );
}

//LOOP//
function update() {

  // Movimiento jugador
  if (keys["ArrowLeft"]) player.x -= player.speed;
  if (keys["ArrowRight"]) player.x += player.speed;

  // Limites
  player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));

  // Balas jugador
  bullets.forEach((b, i) => {
    b.y -= 7;

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
    b.y += 5;

    if (collision(b, player)) {
      alienBullets.splice(i, 1);
      player.lives--;
    }
  });

  // GAME OVER
  if (player.lives <= 0) {
    alert("GAME OVER");
    location.reload();
  }

  // VICTORIA
  if (aliens.length === 0) {
    alert("VICTORIA");
    location.reload();
  }
}

//DIBUJADO//
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // jugador
  ctx.fillStyle = "blue";
  ctx.fillRect(player.x, player.y, player.width, player.height);

  // aliens
  ctx.fillStyle = "green";
  aliens.forEach(a => {
    ctx.fillRect(a.x, a.y, a.width, a.height);
  });

  // balas
  ctx.fillStyle = "red";
  bullets.forEach(b => {
    ctx.fillRect(b.x, b.y, 5, 10);
  });

  ctx.fillStyle = "yellow";
  alienBullets.forEach(b => {
    ctx.fillRect(b.x, b.y, 5, 10);
  });

  // HUD
  ctx.fillStyle = "white";
  ctx.fillText("Puntuación: " + score, 10, 20);
  ctx.fillText("Vidas: " + player.lives, 10, 40);
  ctx.fillText("Energía: " + energy, 10, 60);
}

//LOOP PRINCIPAL//
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();