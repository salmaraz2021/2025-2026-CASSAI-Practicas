/* jshint esversion: 6 */

// --- ELEMENTOS ---
const d1 = document.getElementById("d1")
const d2 = document.getElementById("d2")
const d3 = document.getElementById("d3")
const d4 = document.getElementById("d4");

const intentosSpan = document.getElementById("intentos");
const msgTexto = document.querySelector(".mensaje"); 
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

// NUEVA FUNCIÓN: Genera 4 números ÚNICOS
function generarClave() {
    let numeros = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    for (let i = numeros.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [numeros[i], numeros[j]] = [numeros[j], numeros[i]];
    }
    return numeros.slice(0, 4);
}

// ... (mantenemos los elementos de arriba igual) ...

function resetJuegoTotal() {
    pancarta.classList.add("pancarta-hidden");
    crono.reset();
    
    clave = generarClave(); 
    aciertos = [false, false, false, false];
    intentos = 7;
    juegoActivo = true;
    
    // Reset Visual
    intentosSpan.textContent = intentos;
    if(msgTexto) msgTexto.textContent = "Pulsa Start o un número para comenzar.";
    [d1, d2, d3, d4].forEach(d => { 
        d.textContent = "*"; 
        d.classList.remove("acertado"); 
    });
    
    // RE-ACTIVAR TODOS LOS BOTONES (Incluido el Reset amarillo)
    botonesNum.forEach(b => b.disabled = false);
    btnStart.disabled = false;
    btnStop.disabled = false;
    btnReset.disabled = false; // <--- VOLVEMOS A ACTIVAR EL RESET
    
    console.log("Nueva clave única:", clave.join(""));
}

function finalizarJuego(linea1, linea2) {
    juegoActivo = false;
    crono.stop();
    pancartaTexto.innerHTML = `${linea1}<br><span class="sub-texto">${linea2}</span>`;
    pancarta.classList.remove("pancarta-hidden");
    
    // BLOQUEO TOTAL
    btnStart.disabled = true;
    btnStop.disabled = true;
    btnReset.disabled = true; // <--- BLOQUEAMOS EL RESET AMARILLO
    botonesNum.forEach(b => b.disabled = true);
}

// ... (El resto de la lógica de botones y eventos se mantiene igual) ...

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

        // Comprobar finales
        if (aciertos.every(a => a)) {
            finalizarJuego("¡YOU WIN!", `Tiempo: ${display.textContent}`);
        } else if (intentos <= 0) {
            finalizarJuego("YOU LOSE!", `La clave era: ${clave.join("")}`);
        }
    });
});

// --- CONEXIÓN DE BOTONES ---
btnStart.addEventListener("click", () => { if(juegoActivo) crono.start(); });
btnStop.addEventListener("click", () => crono.stop());
btnReset.addEventListener("click", resetJuegoTotal); 
btnPancartaReset.addEventListener("click", resetJuegoTotal);

// Arrancar por primera vez
resetJuegoTotal();