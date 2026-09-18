const KEY="controle_saude_v2";
let data=JSON.parse(localStorage.getItem(KEY)||'{"weights":[],"tgs":[],"meds":[]}');
const save=()=>{localStorage.setItem(KEY,JSON.stringify(data));render()};
const fmtDate=d=>new Date(d).toLocaleDateString("pt-BR");
const fmtTime=d=>new Date(d).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"});
function render(){
 const sorted=[...data.weights].sort((a,b)=>new Date(b.date)-new Date(a.date));
 document.getElementById("currentWeight").textContent=sorted[0]?sorted[0].weight.toFixed(1)+" kg":"--";
 document.getElementById("weightCount").textContent=data.weights.length;
 document.getElementById("lastWeight").textContent=sorted[0]?"Último registro: "+fmtDate(sorted[0].date):"Nenhum peso registrado.";
 document.getElementById("weights").innerHTML=sorted.length?sorted.map(x=>`<div class="row"><span>${fmtDate(x.date)}</span><strong>${x.weight.toFixed(1)} kg</strong></div>`).join(""):"<p class='muted'>Nenhum registro.</p>";
 const tg=[...data.tgs].sort((a,b)=>new Date(b.date)-new Date(a.date));
 document.getElementById("tgs").innerHTML=tg.length?tg.map(x=>`<div class="row"><span>${fmtDate(x.date)}<br><small>${x.note||""}</small></span><strong>${esc(x.dose)}</strong></div>`).join(""):"<p class='muted'>Nenhum registro.</p>";
 const meds=[...data.meds].sort((a,b)=>new Date(b.date)-new Date(a.date));
 document.getElementById("meds").innerHTML=meds.length?meds.map(x=>`<div class="row"><span>${x.taken?"✅":"⭕"} ${esc(x.name)}<br><small>${fmtDate(x.date)} ${fmtTime(x.date)}</small></span><strong>${esc(x.dose)}</strong></div>`).join(""):"<p class='muted'>Nenhum registro.</p>";
 const today=[...data.meds].filter(x=>new Date(x.date).toDateString()===new Date().toDateString()).sort((a,b)=>new Date(b.date)-new Date(a.date));
 document.getElementById("today").innerHTML=today.length?today.map(x=>`<div class="row"><span>${x.taken?"✅":"⭕"} ${esc(x.name)}</span><strong>${esc(x.dose)}</strong></div>`).join(""):"<p class='muted'>Nenhum medicamento registrado hoje.</p>";
 drawChart();
}
function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function drawChart(){
 const c=document.getElementById("chart"),ctx=c.getContext("2d"),w=c.clientWidth||500,h=210,d=[...data.weights].sort((a,b)=>new Date(a.date)-new Date(b.date));
 c.width=w*devicePixelRatio;c.height=h*devicePixelRatio;ctx.scale(devicePixelRatio,devicePixelRatio);ctx.clearRect(0,0,w,h);
 if(d.length<2){ctx.fillStyle="#888";ctx.font="14px -apple-system";ctx.fillText("Registre pelo menos 2 pesos para ver o gráfico.",12,30);return}
 const vals=d.map(x=>x.weight),min=Math.min(...vals)-1,max=Math.max(...vals)+1,pad=28;
 ctx.strokeStyle="#0a84ff";ctx.lineWidth=3;ctx.beginPath();
 d.forEach((x,i)=>{const px=pad+(w-2*pad)*i/(d.length-1),py=pad+(h-2*pad)*(max-x.weight)/(max-min);i?ctx.lineTo(px,py):ctx.moveTo(px,py)});ctx.stroke();
 d.forEach((x,i)=>{const px=pad+(w-2*pad)*i/(d.length-1),py=pad+(h-2*pad)*(max-x.weight)/(max-min);ctx.fillStyle="#0a84ff";ctx.beginPath();ctx.arc(px,py,4,0,Math.PI*2);ctx.fill()});
}
function openModal(type){
 const modal=document.getElementById("modal"),title=document.getElementById("modalTitle"),form=document.getElementById("form");
 const now=new Date(); const local=new Date(now-now.getTimezoneOffset()*60000).toISOString().slice(0,16);
 let html="";
 if(type==="weight"){title.textContent="Registrar peso";html=`<div class="field"><label>Peso (kg)</label><input id="fweight" inputmode="decimal" placeholder="105,0" required></div><div class="field"><label>Data</label><input id="fdate" type="datetime-local" value="${local}"></div>`}
 if(type==="tg"){title.textContent="Registrar TG";html=`<div class="field"><label>Dose prescrita</label><input id="fdose" placeholder="Ex.: 2,5 mg" required></div><div class="field"><label>Observação</label><input id="fnote" placeholder="Opcional"></div><div class="field"><label>Data</label><input id="fdate" type="datetime-local" value="${local}"></div>`}
 if(type==="med"){title.textContent="Registrar medicamento";html=`<div class="field"><label>Medicamento</label><select id="fname"><option>B3</option><option>Ômega 3</option><option>Outro</option></select></div><div class="field"><label>Dose</label><input id="fdose" placeholder="Ex.: 1 cápsula"></div><div class="field"><label>Data e horário</label><input id="fdate" type="datetime-local" value="${local}"></div><div class="field"><label><input id="ftaken" type="checkbox" checked> Tomei</label></div>`}
 form.innerHTML=html+`<div class="formbuttons"><button type="button" class="secondary" onclick="closeModal()">Cancelar</button><button type="submit">Salvar</button></div>`;
 form.onsubmit=e=>{e.preventDefault();const date=new Date(document.getElementById("fdate").value).toISOString();
 if(type==="weight"){let v=parseFloat(document.getElementById("fweight").value.replace(",","."));if(v>0)data.weights.push({date,weight:v})}
 if(type==="tg")data.tgs.push({date,dose:document.getElementById("fdose").value,note:document.getElementById("fnote").value});
 if(type==="med")data.meds.push({date,name:document.getElementById("fname").value,dose:document.getElementById("fdose").value,taken:document.getElementById("ftaken").checked});
 save();closeModal()};
 modal.classList.remove("hidden");
}
function closeModal(){document.getElementById("modal").classList.add("hidden")}
document.querySelectorAll("nav button").forEach(b=>b.onclick=()=>{document.querySelectorAll("nav button").forEach(x=>x.classList.remove("selected"));b.classList.add("selected");document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));document.getElementById(b.dataset.tab).classList.add("active")});
async function requestNotifications(){if("Notification" in window){const p=await Notification.requestPermission();alert(p==="granted"?"Notificações permitidas.":"Permissão de notificações não concedida.")}else alert("Seu navegador não oferece notificações para esta página.")}
if("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(()=>{});
render();
