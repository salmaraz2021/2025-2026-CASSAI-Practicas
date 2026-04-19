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
let musicOn = true;

// 🔥 FIX: sincronizar checkbox con variable
musicToggle.onchange = () => {
  musicOn = musicToggle.checked;

  if (!musicOn) {
    music.pause();
  }
};

const speedLevels = [900, 750, 600, 450, 300];

const crono = new Crono(timeDisplay);

// ================= INSTRUCCIONES (MOSTRAR AL INICIO) =================
window.addEventListener("load", () => {
  document.getElementById("instructions").style.display = "flex";
});

function closeInstructions() {
  document.getElementById("instructions").style.display = "none";
}

// ================= START =================
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

  if (musicOn) {
    music.currentTime = 0;
    music.play().catch(() => {});
  }

  let startLevel = parseInt(levelSelect.value);
  levelDisplay.textContent = startLevel + "/5";

  playGame(startLevel);
};