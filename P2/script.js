// --- ELEMENTOS ---
const d1 = document.getElementById("d1")
const d2 = document.getElementById("d2")
const d3 = document.getElementById("d3")
const d4 = document.getElementById("d4");

const intentosSpan = document.getElementById("intentos");
const msgTexto = document.querySelector(".mensaje"); // Ahora sí lo encontrará
const botonesNum = document.querySelectorAll(".num");
const display = document.getElementById("crono");
const pancarta = document.getElementById("pancarta");
const pancartaTexto = document.getElementById("pancarta-texto");

const btnStart = document.getElementById("btnStart");
const btnStop = document.getElementById("btnStop");
const btnReset = document.getElementById("btnReset");
const btnPancartaReset = document.getElementById("btnPancartaReset");

// --- INICIALIZACIÓN ---
const crono = new Crono(display);
let clave, aciertos, intentos, juegoActivo;

function resetJuegoTotal() {
    // 1. Ocultar pancarta
    pancarta.classList.add("pancarta-hidden");
    
    // 2. Reset Crono
    crono.reset();
    
    // 3. Reset Lógica y NUEVA CLAVE
    clave = Array.from({ length: 4 }, () => Math.floor(Math.random() * 10));
    aciertos = [false, false, false, false];
    intentos = 7;
    juegoActivo = true;
    
    // 4. Reset Visual
    if(msgTexto) msgTexto.textContent = "Pulsa Start o un número para comenzar.";
    intentosSpan.textContent = intentos;
    [d1, d2, d3, d4].forEach(d => { 
        d.textContent = "*"; 
        d.classList.remove("acertado"); 
    });
    
    // 5. Habilitar botones
    botonesNum.forEach(b => b.disabled = false);
    btnStart.disabled = false;
    btnStop.disabled = false;
    
    console.log("Juego reseteado. Nueva clave:", clave.join(""));
}

// --- LÓGICA DE JUEGO ---
botonesNum.forEach(boton => {
    boton.addEventListener("click", () => {
        if (!juegoActivo || intentos <= 0) return;
        
        boton.disabled = true;
        crono.start();

        const v = parseInt(boton.textContent);

        // Comprobamos posición
        if (v === clave[0] && !aciertos[0]) { d1.textContent = v; d1.classList.add("acertado"); aciertos[0] = true; }
        else if (v === clave[1] && !aciertos[1]) { d2.textContent = v; d2.classList.add("acertado"); aciertos[1] = true; }
        else if (v === clave[2] && !aciertos[2]) { d3.textContent = v; d3.classList.add("acertado"); aciertos[2] = true; }
        else if (v === clave[3] && !aciertos[3]) { d4.textContent = v; d4.classList.add("acertado"); aciertos[3] = true; }

        intentos--;
        intentosSpan.textContent = intentos;

        if (aciertos.every(a => a)) {
            finalizarJuego(`¡YOU WIN! \n Lo has conseguido en: ${display.textContent}`);
        } else if (intentos <= 0) {
            finalizarJuego(`YOU LOSE! \n La clave secreta era: ${clave.join("")}`);
        }
    });
});

function finalizarJuego(texto) {
    juegoActivo = false;
    crono.stop();
    pancartaTexto.textContent = texto;
    pancarta.classList.remove("pancarta-hidden");
    // Bloqueo de botones
    btnStart.disabled = true;
    btnStop.disabled = true;
    botonesNum.forEach(b => b.disabled = true);
}

// --- CONEXIÓN DE BOTONES ---
btnStart.addEventListener("click", () => { if(juegoActivo) crono.start(); });
btnStop.addEventListener("click", () => crono.stop());

// Ambos botones ejecutan el reset total
btnReset.addEventListener("click", resetJuegoTotal); 
btnPancartaReset.addEventListener("click", resetJuegoTotal);

// Inicializar por primera vez
resetJuegoTotal();