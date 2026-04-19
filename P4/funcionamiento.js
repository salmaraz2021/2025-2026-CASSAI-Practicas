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

// ================= START (FIX IMPORTANTE) =================
startBtn.onclick = () => {
  if (playing) return;

  playing = true;

  startBtn.disabled = true;
  stopBtn.disabled = false;

  statusDisplay.textContent = "Jugando";

  // 🔥 FIX CRONO (NO ROMPE SI NO EXISTE)
  if (typeof crono !== "undefined") {
    try {
      crono.reset();
      crono.start();
    } catch (e) {
      console.warn("Crono no disponible");
    }
  }

  let startLevel = parseInt(levelSelect.value);
  if (isNaN(startLevel) || startLevel < 1) startLevel = 1;

  levelDisplay.textContent = startLevel + "/5";

  if (musicOn) music.play().catch(() => {});

  // 🔥 IMPORTANTE: dejar que arranque SIEMPRE
  setTimeout(() => {
    playGame(startLevel);
  }, 50);
};

// ================= STOP =================
stopBtn.onclick = () => {
  playing = false;

  if (typeof crono !== "undefined") {
    try {
      crono.stop();
    } catch (e) {}
  }

  music.pause();

  startBtn.disabled = false;
  stopBtn.disabled = false;

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

  if (typeof crono !== "undefined") {
    try {
      crono.stop();
    } catch (e) {}
  }

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

function closeInstructions() {
  const ins = document.getElementById("instructions");
  if (ins) ins.style.display = "none";
}