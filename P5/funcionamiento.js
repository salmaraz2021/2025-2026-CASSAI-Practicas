const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 400;

let mode = null;
let gameRunning = false;

let player, ball, bots;
let score = { player: 0, enemy: 0 };

let keys = {};
function startGame(selectedMode) {
  mode = selectedMode;

  document.getElementById("menu").classList.add("hidden");
  document.getElementById("gameUI").classList.remove("hidden");

  resetPositions();
  countdown(startLoop);
}
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
function update() {
  movePlayer();
  moveBall();
  moveBots();
  checkGoal();
}
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
function moveBall() {
  ball.x += ball.vx;
  ball.y += ball.vy;

  // fricción
  ball.vx *= 0.98;
  ball.vy *= 0.98;

  // rebote vertical
  if (ball.y < 0 || ball.y > canvas.height) ball.vy *= -1;
}
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
function resetPositions() {
  player = { x: 100, y: 200 };
  ball = { x: 400, y: 200, vx: 0, vy: 0 };

  bots = [
    { x: 600, y: 200 }
  ];
}
function moveBots() {
  bots.forEach(bot => {
    let dx = ball.x - bot.x;
    let dy = ball.y - bot.y;

    let dist = Math.hypot(dx, dy);

    if (dist > 1) {
      bot.x += dx / dist * 1.5;
      bot.y += dy / dist * 1.5;
    }
  });
}
function kickBall() {
  let dx = ball.x - player.x;
  let dy = ball.y - player.y;

  let dist = Math.hypot(dx, dy);

  if (dist < 20) {
    ball.vx = dx * 0.5;
    ball.vy = dy * 0.5;
  }
}
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // jugador
  ctx.fillStyle = "blue";
  ctx.beginPath();
  ctx.arc(player.x, player.y, 10, 0, Math.PI * 2);
  ctx.fill();

  // bots
  ctx.fillStyle = "red";
  bots.forEach(bot => {
    ctx.beginPath();
    ctx.arc(bot.x, bot.y, 10, 0, Math.PI * 2);
    ctx.fill();
  });

  // balón
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, 6, 0, Math.PI * 2);
  ctx.fill();
}
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