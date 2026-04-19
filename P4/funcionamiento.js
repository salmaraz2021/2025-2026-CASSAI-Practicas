const grid = document.getElementById("grid");
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");

const musicToggle = document.getElementById("musicToggle");
const music = document.getElementById("music");

const levelDisplay = document.getElementById("level");
const statusDisplay = document.getElementById("status");
const message = document.getElementById("message");

const pairSelect = document.getElementById("pairSelect");
const levelSelect = document.getElementById("levelSelect");

const proToggle = document.getElementById("proToggle");

const recordAudioEl = document.getElementById("recordAudio");
const playerEl = document.getElementById("player");

let playing = false;
let proMode = false;

// ================= MÚSICA =================
let musicOn = false;
music.volume = 0.5;
musicToggle.checked = false;

musicToggle.onchange = () => {
  musicOn = musicToggle.checked;
  if (musicOn) music.play().catch(() => {});
  else music.pause();
};

recordAudioEl.onchange = () => {
  if (recordAudioEl.checked) music.pause();
};

playerEl.onplay = () => music.pause();

playerEl.onended = () => {
  if (musicOn && playing) music.play().catch(() => {});
};

// ================= DATOS =================
const categories = {
  "cama-casa": [
    { word: "cama", img: "cama.webp" },
    { word: "casa", img: "casa.png" }
  ],
  "pato-gato": [
    { word: "pato", img: "pato.webp" },
    { word: "gato", img: "gato.png" }
  ],
  "queso-beso": [
    { word: "queso", img: "queso.webp" },
    { word: "beso", img: "beso.webp" }
  ],
  "luna-cuna": [
    { word: "luna", img: "luna.png" },
    { word: "cuna", img: "cuna.png" }
  ]
};

// ================= UTIL =================
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function shuffle(a) {
  return a.sort(() => Math.random() - 0.5);
}

// ================= GRID =================
function createGrid(items) {
  grid.innerHTML = "";

  if (!items) return;

  items.forEach(item => {
    const div = document.createElement("div");
    div.classList.add("card");

    const img = document.createElement("img");
    img.src = item.img;

    div.appendChild(img);

    if (!proMode) {
      const p = document.createElement("p");
      p.textContent = item.word.toUpperCase();
      div.appendChild(p);
    }

    grid.appendChild(div);
  });
}

// ================= COUNTDOWN =================
async function countdown() {
  message.style.display = "block";

  for (let i = 3; i > 0; i--) {
    message.textContent = i;
    await sleep(600);
  }

  message.style.display = "none";
}

// ================= GAME =================
function generate(pair, level) {
  const [a, b] = categories[pair];

  if (level === 1) return [a,a,a,a,b,b,b,b];
  if (level === 2) return [a,b,a,b,a,b,a,b];

  return shuffle([a,a,a,a,b,b,b,b]);
}

async function playGame(startLevel) {
  playing = true;
  statusDisplay.textContent = "Jugando";

  for (let lvl = startLevel; lvl <= 5; lvl++) {
    if (!playing) return;

    levelDisplay.textContent = lvl + "/5";

    grid.innerHTML = "";

    await countdown();

    const words = generate(pairSelect.value, lvl);
    createGrid(words);

    const cards = document.querySelectorAll(".card");

    for (let i = 0; i < cards.length; i++) {
      if (!playing) return;

      cards.forEach(c => c.classList.remove("active"));
      cards[i].classList.add("active");

      await sleep(700);
    }
  }

  endGame();
}

// ================= START =================
startBtn.onclick = () => {
  if (playing) return;

  playing = true;

  startBtn.disabled = true;
  stopBtn.disabled = false;

  pairSelect.disabled = true;
  levelSelect.disabled = true;
  proToggle.disabled = true;
  musicToggle.disabled = true;
  recordAudioEl.disabled = true;

  statusDisplay.textContent = "Jugando";

  crono.reset();
  crono.start();

  const startLevel = parseInt(levelSelect.value);
  levelDisplay.textContent = startLevel + "/5";

  if (musicOn) music.play().catch(() => {});

  playGame(startLevel);
};

// ================= STOP =================
stopBtn.onclick = () => {
  playing = false;

  crono.stop();
  music.pause();

  startBtn.disabled = false;
  stopBtn.disabled = true;

  pairSelect.disabled = false;
  levelSelect.disabled = false;
  proToggle.disabled = false;
  musicToggle.disabled = false;
  recordAudioEl.disabled = false;

  grid.innerHTML = "";
  message.style.display = "block";
  message.textContent = "Pulsa para empezar";

  statusDisplay.textContent = "En espera";
};

// ================= FIN =================
function endGame() {
  playing = false;

  crono.stop();
  music.pause();

  startBtn.disabled = false;
  stopBtn.disabled = true;

  pairSelect.disabled = false;
  levelSelect.disabled = false;
  proToggle.disabled = false;
  musicToggle.disabled = false;
  recordAudioEl.disabled = false;

  grid.innerHTML = "";
  message.style.display = "block";
  message.textContent = "¡Juego terminado!";

  statusDisplay.textContent = "Finalizado";
}

// ================= PRO =================
proToggle.onchange = () => {
  if (playing) return;

  proMode = proToggle.checked;

  grid.innerHTML = "";
  message.style.display = "block";
  message.textContent = "Pulsa Empezar";
};