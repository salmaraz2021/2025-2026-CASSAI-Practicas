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

// 🔥 MODO PRO (BOTÓN)
const proToggle = document.getElementById("proToggle");
let proMode = false;

// 🎤 NUEVOS ELEMENTOS
const recordAudioEl = document.getElementById("recordAudio");
const playerEl = document.getElementById("player");
const logEl = document.getElementById("log");

let playing = false;
let musicOn = true;

const speedLevels = [1200, 1000, 800, 600, 450];

const crono = new Crono(timeDisplay);

// ================= AUDIO =================
let mediaRecorder = null;
let mediaStream = null;
let audioChunks = [];
let currentAudioUrl = null;

function addLog(text) {
  if (!logEl) return;
  logEl.innerHTML += text + "<br>";
  logEl.scrollTop = logEl.scrollHeight;
}

function cleanupAudioUrl() {
  if (currentAudioUrl) {
    URL.revokeObjectURL(currentAudioUrl);
    currentAudioUrl = null;
  }
}

async function startRecording() {
  if (!recordAudioEl || !recordAudioEl.checked) return;

  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });

    audioChunks = [];
    mediaRecorder = new MediaRecorder(mediaStream);

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
      cleanupAudioUrl();

      const blob = new Blob(audioChunks, { type: "audio/webm" });
      currentAudioUrl = URL.createObjectURL(blob);

      playerEl.src = currentAudioUrl;

      mediaStream.getTracks().forEach(track => track.stop());

      addLog("Grabación lista");
    };

    mediaRecorder.start();
    addLog("Grabando...");
  } catch (err) {
    addLog("Error micrófono: " + err.message);
  }
}

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
  }
}

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
    { word: "beso", img: "beso.png" }
  ],
  "luna-cuna": [
    { word: "luna", img: "luna.png" },
    { word: "cuna", img: "cuna.png" }
  ]
};

// ================= GRID =================
function createGrid(items) {
  grid.innerHTML = "";

  const isPro = proMode;

  items.forEach(item => {
    const div = document.createElement("div");
    div.classList.add("card");

    const img = document.createElement("img");
    img.src = item.img;

    div.appendChild(img);

    // SOLO TEXTO SI NO ES MODO PRO
    if (!isPro) {
      const text = document.createElement("p");
      text.textContent = item.word.toUpperCase();
      div.appendChild(text);
    }

    grid.appendChild(div);
  });
}

// ================= NIVELES =================
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

// ================= UTIL =================
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ================= JUEGO =================
async function playGame(startLevel) {
  playing = true;
  statusDisplay.textContent = "Jugando";

  await startRecording();

  for (let lvl = startLevel; lvl <= 5; lvl++) {
    if (!playing) return;

    levelDisplay.textContent = lvl;
    message.textContent = "Prepárate...";
    await sleep(1000);

    let pair = pairSelect.value;
    let words = generateLevel(pair, lvl);

    createGrid(words);

    let cards = document.querySelectorAll(".card");

    for (let i = 0; i < cards.length; i++) {
      if (!playing) return;

      cards.forEach(c => c.classList.remove("active"));
      cards[i].classList.add("active");

      message.textContent = "";

      await sleep(speedLevels[lvl - 1]);
    }
  }

  endGame();
}

// ================= START =================
startBtn.onclick = () => {
  if (playing) return;

  cleanupAudioUrl();
  playerEl.removeAttribute("src");

  playing = true;

  pairSelect.disabled = true;
  levelSelect.disabled = true;

  statusDisplay.textContent = "Jugando";
  message.textContent = "Prepárate...";

  crono.reset();
  crono.start();

  if (musicOn) music.play();

  let startLevel = parseInt(levelSelect.value);
  levelDisplay.textContent = startLevel;

  playGame(startLevel);

  startBtn.classList.add("running");
};

// ================= STOP =================
stopBtn.onclick = () => {
  playing = false;

  crono.stop();
  music.pause();
  stopRecording();

  statusDisplay.textContent = "Detenido";

  pairSelect.disabled = false;
  levelSelect.disabled = false;

  startBtn.classList.remove("running");
};

// ================= FIN =================
function endGame() {
  playing = false;

  crono.stop();
  music.pause();
  stopRecording();

  statusDisplay.textContent = "Finalizado";
  message.textContent = "¡Juego terminado!";

  pairSelect.disabled = false;
  levelSelect.disabled = false;

  startBtn.classList.remove("running");
}

// ================= MÚSICA =================
musicToggle.onchange = () => {
  musicOn = musicToggle.checked;

  if (!musicOn) {
    music.pause();
  } else if (playing) {
    music.play();
  }
};

// ================= SELECT =================
pairSelect.onchange = () => {
  if (playing) return;

  const pair = pairSelect.value;
  const level = parseInt(levelSelect.value);

  const words = generateLevel(pair, level);
  createGrid(words);

  message.textContent = "EMPEZAR";
};

levelSelect.onchange = () => {
  if (playing) return;
  levelDisplay.textContent = levelSelect.value;
};

// ================= MODO PRO =================
proToggle.onchange = () => {
  proMode = proToggle.checked;

  const pair = pairSelect.value;
  const level = parseInt(levelSelect.value);

  const words = generateLevel(pair, level);
  createGrid(words);
};