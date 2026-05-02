const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 400;

let mode = null;
let gameRunning = false;

let player, ball, bots;
let score = { player: 0, enemy: 0 };

let keys = {};


// 🎮 INICIO
function startGame(selectedMode) {
  mode = selectedMode;

  document.getElementById("menu").classList.add("hidden");
  document.getElementById("gameUI").classList.remove("hidden");

  resetPositions();
  countdown(startLoop);
}


// 🔁 LOOP
function startLoop() {
  gameRunning = true;
  requestAnimationFrame(gameLoop);
}

function gameLoop() {
  if (!gameRunning) return;

  update();
  draw();

  requestAnimationFrame(gameLoop);
}


// 🧠 UPDATE
function update() {
  movePlayer();
  moveBall();
  moveBots();
  checkGoal();
}


// 🎮 CONTROLES
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

function movePlayer() {
  const speed = 3;

  if (keys["ArrowUp"]) player.y -= speed;
  if (keys["ArrowDown"]) player.y += speed;
  if (keys["ArrowLeft"]) player.x -= speed;
  if (keys["ArrowRight"]) player.x += speed;

  // límites campo
  player.x = Math.max(0, Math.min(canvas.width, player.x));
  player.y = Math.max(0, Math.min(canvas.height, player.y));

  // disparo
  if (keys[" "]) kickBall();
}


// ⚽ BALÓN
function moveBall() {
  ball.x += ball.vx;
  ball.y += ball.vy;

  // fricción
  ball.vx *= 0.98;
  ball.vy *= 0.98;

  // rebote vertical
  if (ball.y < 0 || ball.y > canvas.height) ball.vy *= -1;
}


// 🥅 GOL
function checkGoal() {
  if (ball.x < 10) {
    score.enemy++;
    goal("¡Gol rival!");
  }

  if (ball.x > canvas.width - 10) {
    score.player++;
    goal("¡GOOOL!");
  }
}

function goal(text) {
  gameRunning = false;

  document.getElementById("message").innerText = text;
  updateScore();

  if (checkWin()) return;

  setTimeout(() => {
    resetPositions();
    countdown(startLoop);
  }, 1500);
}


// 🏆 VICTORIA
function checkWin() {
  if (mode === "3goals") {
    if (score.player === 3 || score.enemy === 3) {
      endGame();
      return true;
    }
  }

  if (mode === "golden") {
    endGame();
    return true;
  }

  return false;
}

function endGame() {
  const msg = score.player > score.enemy ? "GANASTE" : "PERDISTE";
  document.getElementById("message").innerText = msg;
}


// 📍 POSICIONES (AJUSTADAS A LA IMAGEN)
function resetPositions() {
  player = { x: 150, y: canvas.height / 2 };

  ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    vx: 0,
    vy: 0
  };

  bots = [
    { x: 500, y: canvas.height / 2 - 40 },
    { x: 550, y: canvas.height / 2 + 40 }
  ];
}


// 🤖 BOTS (MEJORADOS)
function moveBots() {
  bots.forEach(bot => {
    let dx = ball.x - bot.x;
    let dy = ball.y - bot.y;

    let dist = Math.hypot(dx, dy);

    if (dist > 1) {
      bot.x += (dx / dist) * 1.2;
      bot.y += (dy / dist) * 1.2;
    }
  });
}


// ⚽ DISPARO (MEJORADO)
function kickBall() {
  let dx = ball.x - player.x;
  let dy = ball.y - player.y;

  let dist = Math.hypot(dx, dy);

  if (dist < 25) {
    let power = 5;
    ball.vx = (dx / dist) * power;
    ball.vy = (dy / dist) * power;
  }
}


// 🎨 RENDER (ESTILO IMAGEN)
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 🟩 CAMPO
  ctx.fillStyle = "#2e8b57";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;

  // línea central
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.stroke();

  // círculo central
  ctx.beginPath();
  ctx.arc(canvas.width / 2, canvas.height / 2, 50, 0, Math.PI * 2);
  ctx.stroke();

  // punto central
  ctx.beginPath();
  ctx.arc(canvas.width / 2, canvas.height / 2, 3, 0, Math.PI * 2);
  ctx.fillStyle = "white";
  ctx.fill();

  // 🥅 PORTERÍAS
  ctx.fillStyle = "#ddd";
  ctx.fillRect(0, canvas.height / 2 - 50, 10, 100);
  ctx.fillRect(canvas.width - 10, canvas.height / 2 - 50, 10, 100);

  // sombra (mejora visual)
  ctx.shadowColor = "rgba(0,0,0,0.3)";
  ctx.shadowBlur = 5;

  // 🔵 jugador
  ctx.fillStyle = "#3498db";
  ctx.beginPath();
  ctx.arc(player.x, player.y, 12, 0, Math.PI * 2);
  ctx.fill();

  // indicador dirección
  ctx.strokeStyle = "white";
  ctx.beginPath();
  ctx.moveTo(player.x, player.y);
  ctx.lineTo(player.x + 15, player.y);
  ctx.stroke();

  // 🔴 bots
  ctx.fillStyle = "#e74c3c";
  bots.forEach(bot => {
    ctx.beginPath();
    ctx.arc(bot.x, bot.y, 12, 0, Math.PI * 2);
    ctx.fill();
  });

  // ⚽ balón
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, 8, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "black";
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, 3, 0, Math.PI * 2);
  ctx.fill();

  // quitar sombra para UI
  ctx.shadowBlur = 0;
}


// ⏱️ CUENTA ATRÁS
function countdown(callback) {
  let count = 3;
  const msg = document.getElementById("message");

  const interval = setInterval(() => {
    msg.innerText = count;
    count--;

    if (count < 0) {
      clearInterval(interval);
      msg.innerText = "";
      callback();
    }
  }, 1000);
}


// 🔢 SCORE
function updateScore() {
  document.getElementById("score").innerText =
    `${score.player} - ${score.enemy}`;
}