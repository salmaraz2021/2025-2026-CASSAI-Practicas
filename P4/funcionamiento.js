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

// ================= MÚSICA =================
let musicOn = false;
musicToggle.checked = false;
music.volume = 0.5;

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

// ================= CATEGORÍAS =================
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
  if (level === 1) return [a,a,a,a,b,b,b,b];
  if (level === 2) return [a,b,a,b,a,b,a,b];
  return shuffle([a,a,a,a,b,b,b,b]);
}

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

// ================= GRID =================
function createGrid(items) {
  grid.innerHTML = "";

  items.forEach(item => {
    const div = document.createElement("div");
    div.classList.add("card");

    const img = document.createElement("img");
    img.src = item.img;
    div.appendChild(img);

    if (!proMode) {
      const text = document.createElement("p");
      text.textContent = item.word.toUpperCase();
      text.style.color = "white";
      div.appendChild(text);
    }

    grid.appendChild(div);
  });
}

// ================= UTIL =================
const sleep = ms => new Promise(r => setTimeout(r, ms));

// ================= COUNTDOWN =================
async function countdown() {
  message.style.display = "block";
  for (let i = 3; i > 0; i--) {
    message.textContent = i;
    await sleep(600);
  }
  message.style.display = "none";
}

// ================= JUEGO =================
async function playGame(startLevel) {
  playing = true;
  statusDisplay.textContent = "Jugando";

  for (let lvl = startLevel; lvl <= 5; lvl++) {
    if (!playing) return;

    levelDisplay.textContent = lvl + "/5";

    grid.innerHTML = "";
    await countdown();

    const pair = pairSelect.value;
    const words = generateLevel(pair, lvl);

    createGrid(words);

    const cards = document.querySelectorAll(".card");

    for (let i = 0; i < cards.length; i++) {
      if (!playing) return;

      cards.forEach(c => c.classList.remove("active"));
      cards[i].classList.add("active");

      await sleep([900, 750, 600, 450, 300][lvl - 1]);
    }
  }

  endGame();
}

// ================= START =================
startBtn.onclick = () => {
  if (playing) return;

  playing = true;

  // 🔥 SOLO bloquear lo necesario
  startBtn.disabled = true;
  stopBtn.disabled = false;

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
  stopBtn.disabled = false;

  // 🔥 IMPORTANTE: volver a habilitar TODO
  pairSelect.disabled = false;
  levelSelect.disabled = false;
  proToggle.disabled = false;
  musicToggle.disabled = false;
  recordAudioEl.disabled = false;

  statusDisplay.textContent = "Detenido";

  grid.innerHTML = "";
  message.style.display = "block";
  message.textContent = "Pulsa Empezar";
};

// ================= FIN =================
function endGame() {
  playing = false;

  crono.stop();
  music.pause();

  startBtn.disabled = false;
  stopBtn.disabled = false;

  pairSelect.disabled = false;
  levelSelect.disabled = false;
  proToggle.disabled = false;
  musicToggle.disabled = false;
  recordAudioEl.disabled = false;

  statusDisplay.textContent = "Finalizado";

  grid.innerHTML = "";
  message.style.display = "block";
  message.textContent = "Juego terminado";
}

// ================= PRO =================
proToggle.onchange = () => {
  if (playing) return;

  proMode = proToggle.checked;

  grid.innerHTML = "";
  message.style.display = "block";
  message.textContent = "Pulsa Empezar";
};

// ================= INICIO =================
window.addEventListener("load", () => {
  document.getElementById("instructions").style.display = "flex";
});

function closeInstructions() {
  document.getElementById("instructions").style.display = "none";
}