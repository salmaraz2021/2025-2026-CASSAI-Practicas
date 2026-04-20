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

// ✅ AÑADIDO (único cambio)
const crono = new Crono(timeDisplay);

let mediaRecorder = null;
let mediaStream = null;
let audioChunks = [];
let currentAudioUrl = null;


// ================= MÚSICA =================
let musicOn = false;
musicToggle.checked = false;
music.volume = 0.5;

musicToggle.onchange = () => {
  musicOn = musicToggle.checked;
  if (!musicOn) music.pause();
  else music.play().catch(() => {});
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
function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
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

// ================= JUEGO =================
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

// ================= START =================
startBtn.onclick = async () => {
  
  if (playing) return;

  playing = true;

  startBtn.classList.add("pressed");
  stopBtn.classList.remove("pressed");

  startBtn.disabled = true;
  stopBtn.disabled = false;

  pairSelect.disabled = true;
  levelSelect.disabled = true;
  proToggle.disabled = true;
  musicToggle.disabled = true;
  recordAudioEl.disabled = true;

  statusDisplay.textContent = "Jugando";

  await startRecording();

  crono.reset();
  crono.start();

  let startLevel = parseInt(levelSelect.value);
  levelDisplay.textContent = startLevel + "/5";

  if (musicOn) music.play().catch(() => {});

  playGame(startLevel);
};

// ================= STOP (RESET TOTAL) =================
stopBtn.onclick = () => {
  playing = false;

  stopBtn.classList.add("pressed");
  startBtn.classList.remove("pressed");

  startBtn.disabled = false;
  stopBtn.disabled = true;

  pairSelect.disabled = false;
  levelSelect.disabled = false;
  proToggle.disabled = false;
  musicToggle.disabled = false;
  recordAudioEl.disabled = false;

  grid.innerHTML = "";

  statusDisplay.textContent = "En espera";
  levelDisplay.textContent = levelSelect.value + "/5";

  message.style.display = "block";
  message.textContent = "Pulsa Empezar";

  crono.stop();
  stopRecording();
};

// ================= FIN =================
function endGame() {
  playing = false;

  startBtn.classList.remove("pressed");
  stopBtn.classList.remove("pressed");


  startBtn.disabled = false;
  stopBtn.disabled = true;

  pairSelect.disabled = false;
  levelSelect.disabled = false;
  proToggle.disabled = false;
  musicToggle.disabled = false;
  recordAudioEl.disabled = false;

  statusDisplay.textContent = "Finalizado";

  crono.stop();
  music.pause();

  message.style.display = "block";
  message.textContent = "¡Juego terminado!";

  grid.innerHTML = "";

  stopRecording();

}

// ================= PRO MODE =================
proToggle.onchange = () => {
  if (playing) return;

  proMode = proToggle.checked;

  grid.innerHTML = "";
  message.style.display = "block";
  message.textContent = "Pulsa Empezar";
};

// ================= INICIO INSTRUCCIONES =================
window.addEventListener("load", () => {
  const ins = document.getElementById("instructions");
  if (ins) ins.style.display = "flex";
});

// ================= CERRAR INSTRUCCIONES =================
function closeInstructions() {
  const ins = document.getElementById("instructions");
  if (ins) ins.style.display = "none";
}

async function startRecording() {
  if (!recordAudioEl.checked) return;

  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });

    audioChunks = [];
    mediaRecorder = new MediaRecorder(mediaStream);

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        audioChunks.push(e.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(audioChunks, {
        type: mediaRecorder.mimeType || "audio/webm"
      });

      const url = URL.createObjectURL(blob);
      playerEl.src = url;

      // liberar micro
      mediaStream.getTracks().forEach(t => t.stop());
      mediaStream = null;
    };

    if (musicOn && playing) {
        music.play().catch(() => {});
      }
    };


if (musicOn && playing) {
  music.pause();
}

    mediaRecorder.start();

  } catch (err) {
    console.error("Error micro:", err);
  }
}

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
  }
}