import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =========================
   FIREBASE
========================= */

const firebaseConfig = {
  apiKey: "AIzaSyD7pXcBMqe7fLKAFVgw7o_u2gXkE1893QE",
  authDomain: "codigo-parto-gamificado.firebaseapp.com",
  projectId: "codigo-parto-gamificado",
  storageBucket: "codigo-parto-gamificado.firebasestorage.app",
  messagingSenderId: "844566506106",
  appId: "1:844566506106:web:3ec87d91c0e798888769c3"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* =========================
   CONFIGURACIÓN
========================= */

const SESION = "MAGISTER_2026";

const ETAPAS = [

{
  titulo: "🚨 Emergencia Identificada",
  progreso: 20,
  insignia: "🏅 Primer Respondedor",

  pregunta:
  "Observas una gestante de término con contracciones intensas y pujos involuntarios en una plaza. ¿Qué haces?",

  correcta: 0,

  opciones: [
    "Activar el sistema de emergencia (131)",
    "Llamar a familiares",
    "Esperar para observar",
    "Buscar transporte particular"
  ],

  explicacion:
  "Activar precozmente el 131 permite coordinar recursos especializados mientras evalúas la situación."
},

{
  titulo: "📞 Coordinación de Ayuda",
  progreso: 40,
  insignia: "🏅 Coordinador de Emergencia",

  pregunta:
  "La mujer dice: 'Siento que mi bebé va a salir ahora'. ¿Qué haces?",

  correcta: 2,

  opciones: [
    "Preguntar previsión",
    "Buscar documentos",
    "Evaluar si el nacimiento es inminente",
    "Esperar a la ambulancia"
  ],

  explicacion:
  "La prioridad es determinar si el nacimiento ocurrirá antes de la llegada del equipo de emergencia."
},

{
  titulo: "👶 Nacimiento",
  progreso: 60,
  insignia: "🏅 Asistente del Nacimiento",

  pregunta:
  "Compruebas que el nacimiento ocurrirá antes de que llegue ayuda. ¿Qué haces?",

  correcta: 3,

  opciones: [
    "Intentar detener el parto",
    "Aplicar presión abdominal",
    "Traccionar al recién nacido",
    "Favorecer la salida espontánea"
  ],

  explicacion:
  "La conducta más segura es acompañar el nacimiento evitando maniobras innecesarias."
},

{
  titulo: "🍼 Atención Neonatal",
  progreso: 80,
  insignia: "🏅 Protector Neonatal",

  pregunta:
  "El recién nacido nace vigoroso y llora espontáneamente. ¿Qué haces?",

  correcta: 0,

  opciones: [
    "Secarlo y prevenir la pérdida de calor",
    "Bañarlo",
    "Separarlo de su madre",
    "Pesarlo"
  ],

  explicacion:
  "La prevención de la hipotermia es una prioridad inmediata del recién nacido."
},

{
  titulo: "🤱 Postparto Seguro",
  progreso: 100,
  insignia: "🏅 Guardián Madre-Hijo",

  pregunta:
  "La ambulancia aún no llega. ¿Qué haces?",

  correcta: 1,

  opciones: [
    "Retirarte del lugar",
    "Vigilar sangrado materno y bienestar neonatal",
    "Vigilar solo al recién nacido",
    "Vigilar solo a la madre"
  ],

  explicacion:
  "Madre y recién nacido requieren observación continua mientras llega ayuda especializada."
}

];

/* =========================
   VARIABLES
========================= */

let nombreJugador = "";
let puntaje = 0;
let etapaActual = 0;

let inicioMision = null;

let cronometroGeneral = null;
let cronometroPregunta = null;

let segundosRestantes = 20;

const insignias = [];

/* =========================
   ELEMENTOS
========================= */

const btnIniciar = document.getElementById("btnIniciar");
const btnContinuar = document.getElementById("btnContinuar");

const inicioDiv = document.getElementById("inicio");
const juegoDiv = document.getElementById("juego");
const finalDiv = document.getElementById("final");

const etapaEl = document.getElementById("etapa");
const preguntaEl = document.getElementById("pregunta");
const opcionesEl = document.getElementById("opciones");

const barraEl = document.getElementById("barra");
const avanceTextoEl = document.getElementById("avanceTexto");

const cronometroEl = document.getElementById("cronometro");
const tiempoPreguntaEl = document.getElementById("tiempoPregunta");

const feedbackBox = document.getElementById("feedback");
const feedbackTitulo = document.getElementById("feedbackTitulo");
const feedbackTexto = document.getElementById("feedbackTexto");

const resultadoEl = document.getElementById("resultado");
const rankingEl = document.getElementById("ranking");

const insigniasEl = document.getElementById("listaInsignias");

/* =========================
   INICIO
========================= */

btnIniciar.addEventListener("click", iniciarMision);

async function iniciarMision() {

  nombreJugador =
    document.getElementById("nombre").value.trim();

  if (nombreJugador === "") {
    alert("Ingresa tu nombre.");
    return;
  }

  const participantes =
    await getDocs(collection(db, "ranking"));

  let existe = false;

  participantes.forEach(doc => {

    const datos = doc.data();

    if (
      datos.nombre &&
      datos.nombre.toLowerCase() === nombreJugador.toLowerCase() &&
      datos.sesion === SESION
    ) {
      existe = true;
    }

  });

  if (existe) {

    alert(
      "Este participante ya inició o completó la misión."
    );

    return;
  }

  inicioMision = Date.now();

  inicioDiv.classList.add("hidden");
  juegoDiv.classList.remove("hidden");

  cronometroGeneral =
    setInterval(actualizarCronometro,1000);

  mostrarEtapa();
}

/* =========================
   CRONÓMETRO GENERAL
========================= */

function actualizarCronometro() {

  const segundos =
    Math.floor((Date.now() - inicioMision) / 1000);

  const minutos =
    String(Math.floor(segundos / 60))
      .padStart(2,"0");

  const seg =
    String(segundos % 60)
      .padStart(2,"0");

  cronometroEl.textContent =
    `${minutos}:${seg}`;
}

/* =========================
   ETAPAS
========================= */

function mostrarEtapa() {

  const etapa = ETAPAS[etapaActual];

  etapaEl.textContent = etapa.titulo;

  preguntaEl.textContent =
    etapa.pregunta;

  barraEl.style.width =
    etapa.progreso + "%";

  avanceTextoEl.textContent =
    `${etapa.progreso}% completado`;

  let html = "";

  etapa.opciones.forEach((opcion,indice) => {

    html += `
    <button class="opcion-btn"
      data-indice="${indice}">
      ${opcion}
    </button>
    `;

  });

  opcionesEl.innerHTML = html;

  document
    .querySelectorAll(".opcion-btn")
    .forEach(btn => {

      btn.addEventListener(
        "click",
        () => responder(
          parseInt(btn.dataset.indice)
        )
      );

    });

  segundosRestantes = 20;

  tiempoPreguntaEl.textContent =
    segundosRestantes;

  feedbackBox.classList.add("hidden");

  clearInterval(cronometroPregunta);

  cronometroPregunta =
    setInterval(() => {

      segundosRestantes--;

      tiempoPreguntaEl.textContent =
        segundosRestantes;

      if (segundosRestantes <= 0) {

        clearInterval(
          cronometroPregunta
        );

        responder(-1);
      }

    },1000);
}

/* =========================
   RESPUESTA
========================= */

function responder(indice) {

  clearInterval(cronometroPregunta);

  const etapa =
    ETAPAS[etapaActual];

  opcionesEl.innerHTML = "";

  feedbackBox.classList.remove("hidden");

  if (indice === etapa.correcta) {

    const bono =
      segundosRestantes * 5;

    const puntosGanados =
      100 + bono;

    puntaje += puntosGanados;

    insignias.push(
      etapa.insignia
    );

    actualizarInsignias();

    feedbackTitulo.innerHTML =
      "✅ Decisión Segura";

    feedbackTexto.innerHTML = `
      <p><strong>+${puntosGanados} puntos</strong></p>
      <p>${etapa.insignia}</p>
      <p>${etapa.explicacion}</p>
    `;

  } else {

    feedbackTitulo.innerHTML =
      "⚠️ Decisión de Riesgo";

    feedbackTexto.innerHTML = `
      <p><strong>0 puntos</strong></p>
      <p>${etapa.explicacion}</p>
    `;
  }

  btnContinuar.onclick = () => {

    etapaActual++;

    if (
      etapaActual < ETAPAS.length
    ) {
      mostrarEtapa();
    } else {
      finalizarMision();
    }

  };
}

/* =========================
   INSIGNIAS
========================= */

function actualizarInsignias() {

  insigniasEl.innerHTML = "";

  insignias.forEach(item => {

    const badge =
      document.createElement("div");

    badge.className = "badge";

    badge.textContent = item;

    insigniasEl.appendChild(badge);

  });

}

/* =========================
   FINALIZAR
========================= */

async function finalizarMision() {

  clearInterval(cronometroGeneral);

  const tiempoFinal =
    Math.floor(
      (Date.now() - inicioMision) / 1000
    );

  await addDoc(
    collection(db,"ranking"),
    {
      sesion: SESION,
      nombre: nombreJugador,
      puntaje: puntaje,
      tiempo: tiempoFinal,
      fecha: new Date()
    }
  );

  juegoDiv.classList.add("hidden");
  finalDiv.classList.remove("hidden");
confetti({
  particleCount: 150,
  spread: 90,
  origin: { y: 0.6 }
});

setTimeout(() => {
  confetti({
    particleCount: 100,
    angle: 60,
    spread: 70,
    origin: { x: 0 }
  });

  confetti({
    particleCount: 100,
    angle: 120,
    spread: 70,
    origin: { x: 1 }
  });
}, 500);
  resultadoEl.innerHTML = `
    <h3>${nombreJugador}</h3>

    <p>
      ⭐ Puntaje:
      <strong>${puntaje}</strong>
    </p>

    <p>
      ⏱️ Tiempo:
      <strong>${tiempoFinal}s</strong>
    </p>

    <p>
      🏅 Insignias:
      <strong>${insignias.length}/5</strong>
    </p>
  `;

  cargarRanking();
}

/* =========================
   RANKING
========================= */

async function cargarRanking() {

  const consulta = query(
    collection(db,"ranking"),
    orderBy("puntaje","desc"),
    orderBy("tiempo","asc"),
    limit(10)
  );

  const jugadores =
    await getDocs(consulta);

  rankingEl.innerHTML = "";

  let posicion = 1;

  jugadores.forEach(doc => {

    const d = doc.data();

    const li =
      document.createElement("li");

    li.innerHTML = `
      <strong>#${posicion}</strong>
      ${d.nombre}
      · ⭐ ${d.puntaje}
      · ⏱️ ${d.tiempo}s
    `;

    rankingEl.appendChild(li);

    posicion++;

  });

}
