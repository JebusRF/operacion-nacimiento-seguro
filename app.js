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

let jugador="";
let nivel=0;
let puntaje=0;

let inicioTiempo;
let cronometro;
let relojPregunta;
let segundosPregunta=15;

const insignias=[];

const etapas=[

{
titulo:"🚨 Emergencia Identificada",
avance:20,

pregunta:
"Observas una embarazada de término con contracciones intensas y pujos involuntarios. ¿Qué haces primero?",

correcta:1,

explicacion:
"Activar el 131 permite coordinar ayuda especializada mientras evalúas la situación.",

insignia:"🏅 Primer Respondedor",

opciones:[
"Llamar familiares",
"Activar el 131",
"Esperar",
"Trasladar inmediatamente"
]
},

{
titulo:"📞 Coordinación de Ayuda",
avance:40,

pregunta:
"La mujer refiere deseos intensos de pujar. ¿Qué debes evaluar?",

correcta:2,

explicacion:
"Lo más importante es determinar si el nacimiento es inminente.",

insignia:"🏅 Coordinador de Emergencia",

opciones:[
"Su previsión",
"Número de controles",
"Si el parto es inminente",
"Grupo sanguíneo"
]
},

{
titulo:"👶 Nacimiento",
avance:60,

pregunta:
"Compruebas que el bebé nacerá antes que llegue la ambulancia. ¿Cuál es la conducta adecuada?",

correcta:3,

explicacion:
"Se debe favorecer la salida espontánea evitando tracciones o maniobras innecesarias.",

insignia:"🏅 Asistente del Nacimiento",

opciones:[
"Retrasar el parto",
"Empujar abdomen",
"Tirar del bebé",
"Favorecer salida espontánea"
]
},

{
titulo:"🍼 Atención Neonatal",
avance:80,

pregunta:
"El recién nacido llora al nacer. ¿Cuál es la prioridad?",

correcta:0,

explicacion:
"La pérdida de calor es uno de los principales riesgos del recién nacido.",

insignia:"🏅 Protector Neonatal",

opciones:[
"Secar y evitar hipotermia",
"Pesar al RN",
"Separarlo de la madre",
"Bañarlo"
]
},

{
titulo:"🤱 Cuidados Postparto",
avance:100,

pregunta:
"Mientras llega la ambulancia, ¿qué debes vigilar?",

correcta:1,

explicacion:
"El sangrado materno y el bienestar neonatal requieren vigilancia continua.",

insignia:"🏅 Guardián Madre-Hijo",

opciones:[
"Documentación",
"Bienestar materno y neonatal",
"Ropa de la madre",
"Alimentación complementaria"
]
}

];

document
.getElementById("btnIniciar")
.addEventListener("click", iniciarJuego);

function iniciarJuego(){

jugador=
document.getElementById("nombre").value.trim();

if(jugador===""){
alert("Ingresa tu nombre");
return;
}

document
.getElementById("inicio")
.classList.add("hidden");

document
.getElementById("juego")
.classList.remove("hidden");

inicioTiempo=Date.now();

cronometro=
setInterval(actualizarCronometro,1000);

mostrarNivel();

}

function actualizarCronometro(){

const t =
Math.floor((Date.now()-inicioTiempo)/1000);

const m =
String(Math.floor(t/60)).padStart(2,"0");

const s =
String(t%60).padStart(2,"0");

document.getElementById("cronometro")
.textContent=`${m}:${s}`;

}

function mostrarNivel(){

const e=etapas[nivel];

document.getElementById("etapa")
.textContent=e.titulo;

document.getElementById("pregunta")
.textContent=e.pregunta;

document.getElementById("barra")
.style.width=e.avance+"%";

document.getElementById("avanceTexto")
.textContent=e.avance+"% completado";

let html="";

e.opciones.forEach((o,i)=>{

html+=`
<button onclick="responder(${i})">
${o}
</button>
`;

});

document.getElementById("opciones")
.innerHTML=html;

segundosPregunta=15;

document.getElementById("tiempoPregunta")
.textContent=segundosPregunta;

clearInterval(relojPregunta);

relojPregunta=setInterval(()=>{

segundosPregunta--;

document.getElementById("tiempoPregunta")
.textContent=segundosPregunta;

if(segundosPregunta<=0){

clearInterval(relojPregunta);

responder(-1);

}

},1000);

}

window.responder=function(indice){

clearInterval(relojPregunta);

const e=etapas[nivel];

if(indice===e.correcta){

const bonus=segundosPregunta*5;

puntaje += 100 + bonus;

insignias.push(e.insignia);

actualizarInsignias();

alert(
`✅ Correcto\n\n${e.explicacion}\n\n+${100+bonus} puntos`
);

}
else{

alert(
`❌ Incorrecto\n\n${e.explicacion}`
);

}

nivel++;

if(nivel<etapas.length){

mostrarNivel();

}
else{

finalizar();

}

}

function actualizarInsignias(){

document.getElementById("listaInsignias")
.innerHTML =
insignias.map(i=>`<li>${i}</li>`).join("");

}

async function finalizar(){

clearInterval(cronometro);

const tiempo =
Math.floor(
(Date.now()-inicioTiempo)/1000
);

const bonusFinal =
Math.max(
0,
300-tiempo
);

puntaje += bonusFinal;

await addDoc(

collection(db,"ranking"),

{
nombre:jugador,
puntaje,
tiempo,
fecha:new Date()
}

);

document
.getElementById("juego")
.classList.add("hidden");

document
.getElementById("final")
.classList.remove("hidden");

document.getElementById("resultado")
.innerHTML=`

<h3>${jugador}</h3>

<p>⭐ Puntaje: <b>${puntaje}</b></p>

<p>⏱️ Tiempo: <b>${tiempo}s</b></p>

<p>🏅 Insignias: ${insignias.length}/5</p>

`;

cargarRanking();

}

async function cargarRanking(){

const q=query(
collection(db,"ranking"),
orderBy("puntaje","desc"),
orderBy("tiempo","asc"),
limit(10)
);

const datos=await getDocs(q);

let html="";

datos.forEach(doc=>{

const d=doc.data();

html+=`
<li>
🏆 ${d.nombre}
 | ⭐ ${d.puntaje}
 | ⏱️ ${d.tiempo}s
</li>
`;

});

document.getElementById("ranking")
.innerHTML=html;

}
