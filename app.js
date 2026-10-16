import { initializeApp }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
getFirestore,
collection,
addDoc,
query,
orderBy,
limit,
getDocs,
onSnapshot
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {

apiKey:"TU_API_KEY",
authDomain:"TU_PROYECTO.firebaseapp.com",
projectId:"TU_PROYECTO",
storageBucket:"TU_PROYECTO.appspot.com",
messagingSenderId:"XXXX",
appId:"XXXX"

};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const SESSION = "MAGISTER_GAMIFICACION";

let nombre = "";
let nivel = 0;
let puntaje = 0;
let inicio;
let intervaloGeneral;
let intervaloPregunta;
let segundosPregunta = 15;

const insignias = [];

const etapas = [

{
etapa:"🚨 Emergencia identificada",
avance:"20%",
insignia:"🏅 Primer Respondedor",

pregunta:"Observas una embarazada de término pujando en una plaza. ¿Qué haces primero?",

opciones:[
"Llamar familiares",
"No hacer nada",
"Activar 131",
"Subirla a un automóvil"
],

correcta:2
},

{
etapa:"📞 Ayuda activada",
avance:"40%",
insignia:"🏅 Coordinador de Emergencia",

pregunta:"Refiere sensación de pujo permanente. ¿Qué corresponde?",

opciones:[
"Esperar sola",
"Organizar apoyo y mantener calma",
"Irse del lugar",
"Buscar taxi"
],

correcta:1
},

{
etapa:"👶 Nacimiento",
avance:"60%",
insignia:"🏅 Asistente del Nacimiento",

pregunta:"El parto es inminente. ¿Qué acción es adecuada?",

opciones:[
"Tirar del bebé",
"Favorecer expulsión espontánea",
"Comprimir abdomen",
"Suspender pujos"
],

correcta:1
},

{
etapa:"🍼 Atención Neonatal",
avance:"80%",
insignia:"🏅 Protector Neonatal",

pregunta:"Tras el nacimiento la prioridad es:",

opciones:[
"Evitar pérdida de calor",
"Pesar al recién nacido",
"Bañarlo",
"Separarlo de su madre"
],

correcta:0
},

{
etapa:"🤱 Cuidados Postparto",
avance:"100%",
insignia:"🏅 Guardián Madre-Hijo",

pregunta:"Mientras llega la ambulancia debes:",

opciones:[
"Abandonar la vigilancia",
"Favorecer observación de madre y RN",
"Trasladarlos caminando",
"Dejarlos solos"
],

correcta:1
}

];

document
.getElementById("btnIniciar")
.addEventListener("click", iniciarJuego);

function iniciarJuego(){

nombre =
document.getElementById("nombre").value;

if(!nombre){
alert("Ingresa tu nombre");
return;
}

document
.getElementById("inicio")
.classList.add("hidden");

document
.getElementById("juego")
.classList.remove("hidden");

inicio = Date.now();

intervaloGeneral =
setInterval(actualizarCronometro,1000);

mostrarPregunta();

}

function actualizarCronometro(){

const seg =
Math.floor(
(Date.now()-inicio)/1000
);

const m =
String(Math.floor(seg/60))
.padStart(2,"0");

const s =
String(seg%60)
.padStart(2,"0");

document
.getElementById("cronometro")
.innerText = `${m}:${s}`;

}

function mostrarPregunta(){

const etapa = etapas[nivel];

document
.getElementById("etapa")
.innerText = etapa.etapa;

document
.getElementById("avance")
.innerText = etapa.avance;

document
.getElementById("barra")
.style.width = etapa.avance;

document
.getElementById("pregunta")
.innerText = etapa.pregunta;

let html="";

etapa.opciones.forEach((op,i)=>{

html += `
<button onclick="responder(${i})">
${op}
</button>
`;

});

document
.getElementById("opciones")
.innerHTML = html;

segundosPregunta = 15;

document
.getElementById("tiempoPregunta")
.innerText = segundosPregunta;

clearInterval(intervaloPregunta);

intervaloPregunta =
setInterval(()=>{

segundosPregunta--;

document
.getElementById("tiempoPregunta")
.innerText = segundosPregunta;

if(segundosPregunta<=0){

clearInterval(intervaloPregunta);

responder(-1);

}

},1000);

}

window.responder = function(indice){

clearInterval(intervaloPregunta);

if(indice === etapas[nivel].correcta){

puntaje += 100;

insignias.push(
etapas[nivel].insignia
);

actualizarInsignias();

}

nivel++;

if(nivel < etapas.length){

mostrarPregunta();

}
else{

finalizar();

}

}

function actualizarInsignias(){

let html="";

insignias.forEach(i=>{
html += `<li>${i}</li>`;
});

document
.getElementById("listaInsignias")
.innerHTML = html;

}

async function finalizar(){

clearInterval(intervaloGeneral);

const tiempo =
Math.floor(
(Date.now()-inicio)/1000
);

const bonus =
Math.max(0,300-tiempo);

puntaje += bonus;

await addDoc(
collection(db,"ranking"),
{
nombre,
puntaje,
tiempo,
session:SESSION,
fecha:new Date()
}
);

document
.getElementById("juego")
.classList.add("hidden");

document
.getElementById("final")
.classList.remove("hidden");

document
.getElementById("resultado")
.innerHTML=`

👤 <b>${nombre}</b><br><br>

⭐ Puntaje: <b>${puntaje}</b><br>

⏱️ Tiempo: <b>${tiempo}s</b><br><br>

🏅 Insignias obtenidas: ${insignias.length}

`;

cargarRanking();

}

async function cargarRanking(){

const q = query(
collection(db,"ranking"),
orderBy("puntaje","desc"),
orderBy("tiempo","asc"),
limit(10)
);

const snapshot =
await getDocs(q);

let html="";

snapshot.forEach(doc=>{

const d=doc.data();

html += `
<li>
${d.nombre}
 | ⭐ ${d.puntaje}
 | ⏱️ ${d.tiempo}s
</li>
`;

});

document
.getElementById("ranking")
.innerHTML = html;

}

onSnapshot(
collection(db,"ranking"),
(snapshot)=>{

let total=0;

snapshot.forEach(()=>{
total++;
});

document
.getElementById("participantes")
.innerText = total;
document
.getElementById("finalizados")
.innerText = total;

});
