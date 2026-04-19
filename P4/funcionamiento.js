const grid = document.getElementById("grid");
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const musicToggle = document.getElementById("musicToggle");
const music = document.getElementById("music");

const levelDisplay = document.getElementById("level");
const timeDisplay = document.getElementById("time");
const statusDisplay = document.getElementById("status");
const message = document.getElementById("message");

const pairSelect = document.getElementById("pairSelect");
const levelSelect = document.getElementById("levelSelect");

const proToggle = document.getElementById("proToggle");
let proMode = false;

const recordAudioEl = document.getElementById("recordAudio");
const playerEl = document.getElementById("player");

let playing = false;

// ================= 🎵 SOLO CAMBIO REAL (MÚSICA) =================

// 🔥 música OFF inicial como pediste
let musicOn = false;

// NO auto-play, respetando navegador
music.volume = 0.5;

// toggle música (NO toca lógica del juego)
musicToggle.onchange = () => {
  musicOn = musicToggle.checked;

  if (!musicOn) {
    music.pause();
  } else {
    music.play().catch(() => {});
  }
};

// ================= 🎤 AUDIO =================

// cuando grabas → corta música
recordAudioEl.onchange = () => {
  if (recordAudioEl.checked) {
    music.pause();
  }
};

// cuando termina audio grabado → vuelve música si estaba ON
playerEl.onended = () => {
  if (musicOn && playing) {
    music.play().catch(() => {});
  }
};

// ================= CATEGORÍAS (IGUAL) =================
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

// ================= GENERADOR =================
function generateLevel(pair, level) {
  let [a, b] = categories[pair];

  let arr = [];

  if (level === 1) arr = [a,a,a,a,b,b,b,b];
  else if (level === 2) arr = [a,b,a,b,a,b,a,b];
  else arr = shuffle([a,a,a,a,b,b,b,b]);

  return arr;
}

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

// ================= GRID =================
function createGrid(items) {
  grid.innerHTML = "";

  if (!items || items.length === 0) return;

  items.forEach(item => {
    const div = document.createElement("div");
    div.classList.add("card");

    const img = document.createElement("img");
    img.src = item.img;
    div.appendChild(img);

    if (!proMode) {
      const text = document.createElement("p");
      text.textContent = item.word.toUpperCase();
      div.appendChild(text);
    }

    grid.appendChild(div);
  });
}

// ================= UTIL =================
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ================= COUNTDOWN =================
async function countdown() {
  message.style.display = "block";

  for (let i = 3; i > 0; i--) {
    message.textContent = i;
    await sleep(600);
  }

  message.textContent = "";
  message.style.display = "none";
}

// ================= JUEGO (NO TOCADO) =================
async function playGame(startLevel) {
  playing = true;
  statusDisplay.textContent = "Jugando";

  for (let lvl = startLevel; lvl <= 5; lvl++) {
    if (!playing) return;

    levelDisplay.textContent = lvl + "/5";

    grid.innerHTML = "";

    await countdown();

    let pair = pairSelect.value;
    let words = generateLevel(pair, lvl);

    createGrid(words);

    let cards = document.querySelectorAll(".card");

    for (let i = 0; i < cards.length; i++) {
      if (!playing) return;

      cards.forEach(c => c.classList.remove("active"));
      cards[i].classList.add("active");

      await sleep([900, 750, 600, 450, 300][lvl - 1]);
    }
  }

  endGame();
}

// ================= START (ORIGINAL RESTAURADO) =================
startBtn.onclick = () => {
  if (playing) return;

  playing = true;

  startBtn.classList.add("pressed");

  startBtn.disabled = true;
  stopBtn.disabled = false;

  pairSelect.disabled = true;
  levelSelect.disabled = true;
  proToggle.disabled = true;
  musicToggle.disabled = true;
  recordAudioEl.disabled = true;

  message.style.display = "none";

  statusDisplay.textContent = "Jugando";

  crono.reset();
  crono.start();

  let startLevel = parseInt(levelSelect.value);
  levelDisplay.textContent = startLevel + "/5";

  // 🔥 SOLO AÑADIDO: iniciar música si está ON
  if (musicOn) {
    music.play().catch(() => {});
  }

  playGame(startLevel);
};

// ================= STOP =================
stopBtn.onclick = () => {
  playing = false;

  startBtn.classList.remove("pressed");

  crono.stop();
  music.pause();

  statusDisplay.textContent = "Detenido";

  startBtn.disabled = false;
  pairSelect.disabled = false;
  levelSelect.disabled = false;
  proToggle.disabled = false;
  musicToggle.disabled = false;
  recordAudioEl.disabled = false;

  message.style.display = "block";
  message.textContent = "Pulsa Empezar";

  grid.innerHTML = "";
};

// ================= FIN =================
function endGame() {
  playing = false;

  startBtn.classList.remove("pressed");

  crono.stop();
  music.pause();

  statusDisplay.textContent = "Finalizado";

  startBtn.disabled = false;
  pairSelect.disabled = false;
  levelSelect.disabled = false;
  proToggle.disabled = false;
  musicToggle.disabled = false;
  recordAudioEl.disabled = false;

  message.style.display = "block";
  message.textContent = "¡Juego terminado!";

  grid.innerHTML = "";
}

// ================= PRO MODE =================
proToggle.onchange = () => {
  if (playing) return;

  proMode = proToggle.checked;

  grid.innerHTML = "";
  message.style.display = "block";
  message.textContent = "Pulsa Empezar";
};