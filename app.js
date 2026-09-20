const K="cs_v4";
const base={w:[],tg:[],m:[],goal:null,times:{b3:"",om:""},pin:null,objective:"Mais saúde e energia"};
let d=JSON.parse(localStorage.getItem(K)||"null")||base;d.w=d.w||[];d.tg=d.tg||[];d.m=d.m||[];d.times=d.times||{b3:"",om:""};
const $=id=>document.getElementById(id);const save=()=>{localStorage.setItem(K,JSON.stringify(d));render()};
const esc=s=>String(s??"").replace(/[&<>"']/g,x=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[x]));
const date=x=>new Date(x).toLocaleDateString("pt-BR");const time=x=>new Date(x).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"});
const dayKey=x=>{const z=new Date(x);return z.getFullYear()+"-"+String(z.getMonth()+1).padStart(2,"0")+"-"+String(z.getDate()).padStart(2,"0")};
const todayKey=()=>dayKey(new Date());const weights=()=>[...d.w].sort((a,b)=>new Date(a.date)-new Date(b.date));
function hasToday(type){
  const k=todayKey();
  if(type==="Peso") return d.w.some(x=>dayKey(x.date)===k);
  if(type==="Retatrutida") return d.tg.some(x=>dayKey(x.date)===k);
  return d.m.some(x=>dayKey(x.date)===k&&x.name===type&&x.t);
}
function retatrutidaThisWeek(){
  const now=new Date();
  const start=new Date(now);
  start.setDate(now.getDate()-6);
  start.setHours(0,0,0,0);
  return d.tg.some(x=>new Date(x.date)>=start && new Date(x.date)<=now);
}
function dailyDone(type){
  if(type==="Retatrutida") return false;
  return hasToday(type);
}
function streak(type){
  if(type==="Retatrutida") return 0;
  let n=0,z=new Date();
  for(let i=0;i<366;i++){
    const k=dayKey(z);
    let ok=false;
    if(type==="Peso") ok=d.w.some(x=>dayKey(x.date)===k);
    else ok=d.m.some(x=>dayKey(x.date)===k&&x.name===type&&x.t);
    if(!ok) break;
    n++; z.setDate(z.getDate()-1);
  }
  return n;
}
function retWeeklyStreak(){
  let n=0;
  for(let i=0;i<52;i++){
    const end=new Date(); end.setDate(end.getDate()-i*7);
    const start=new Date(end); start.setDate(end.getDate()-6);
    start.setHours(0,0,0,0); end.setHours(23,59,59,999);
    const ok=d.tg.some(x=>{const t=new Date(x.date);return t>=start&&t<=end});
    if(!ok) break;
    n++;
  }
  return n;
}
function focusStreak(){
  let n=0,z=new Date();
  const all=["Peso","B3","Ômega 3","Creatina"];
  for(let i=0;i<366;i++){
    const k=dayKey(z);
    const ok=all.every(t=>{
      if(t==="Peso") return d.w.some(x=>dayKey(x.date)===k);
      return d.m.some(x=>dayKey(x.date)===k&&x.name===t&&x.t);
    });
    if(!ok) break; n++; z.setDate(z.getDate()-1);
  }
  return n;
}
function render(){
  document.body.classList.add("dark");
  const a=weights(),last=a.at(-1),first=a[0];
  $("cw").textContent=last?last.v.toFixed(1)+" kg":"--";
  $("gw").textContent=d.goal?d.goal.toFixed(1)+" kg":"--";
  $("objective").textContent=d.objective||"Mais saúde";
  const delta=first&&last?first.v-last.v:0;
  $("weightDelta").textContent=first&&last?(delta>=0?"↓ "+Math.abs(delta).toFixed(1)+" kg desde o início":"↑ "+Math.abs(delta).toFixed(1)+" kg desde o início"):"Registre seu primeiro peso";
  $("goalDelta").textContent=d.goal&&last?(last.v>d.goal?"Faltam "+(last.v-d.goal).toFixed(1)+" kg":"Meta alcançada"):"Defina sua meta";
  let pct=d.goal&&last?Math.max(0,Math.min(100,((first?first.v:last.v)-last.v)/Math.max(.1,(first?first.v:last.v)-d.goal)*100)):0;$("goalProgress").style.width=pct+"%";
  const fs=focusStreak();$("focusDays").textContent=fs;
  const labels=[
    {name:"Peso",icon:"⚖",value:last?last.v.toFixed(1)+" kg":"Não registrado",time:todayTime("Peso"),daily:true},
    {name:"Retatrutida",icon:"💉",value:retatrutidaThisWeek()?todayValue("Retatrutida"):"Sem registro nesta semana",time:retatrutidaThisWeek()?todayTime("Retatrutida"):"Semanal",weekly:true},
    {name:"B3",icon:"💊",value:todayValue("B3"),time:todayTime("B3"),daily:true},
    {name:"Ômega 3",icon:"🐟",value:todayValue("Ômega 3"),time:todayTime("Ômega 3"),daily:true},
    {name:"Creatina",icon:"🏋",value:todayValue("Creatina"),time:todayTime("Creatina"),daily:true}
  ];
  const dailyItems=labels.filter(x=>x.daily);
  const done=dailyItems.filter(x=>dailyDone(x.name)).length;
  $("dailyScore").textContent=done+"/4 concluído";
  $("scoreBar").style.width=(done*25)+"%";
  $("dailyMessage").textContent=done===4?"Excelente! Continue assim!":done?"Muito bem! Falta pouco para concluir o dia.":"Comece seu dia!";
  $("todayDate").textContent=new Date().toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit",year:"numeric"});
  $("todayList").innerHTML=labels.map(x=>{
    const done=x.weekly?retatrutidaThisWeek():dailyDone(x.name);
    const action=x.weekly?"quickRegister('Retatrutida')":"quickRegister('"+x.name+"')";
    const statusClass=done?"done":(x.weekly?"weekly":"pending");
    const check=done?"✓":(x.weekly?"◷":"○");
    return `<button type="button" class="check-row ${statusClass}" onclick="${action}"><span class="check ${done?"":"off"}">${check}</span><span class="check-icon">${x.icon}</span><span class="check-name">${x.name}${x.weekly?" <small class=weekly-label>SEMANAL</small>":""}</span><span class="check-value">${esc(x.value)}</span><span class="check-time">${esc(x.time)}</span></button>`;
  }).join("");
  $("lossBadge").textContent=first&&last?(delta>=0?"- "+Math.abs(delta).toFixed(1)+" kg":"+ "+Math.abs(delta).toFixed(1)+" kg"):"--";
  renderStreaks("streaks");renderStreaks("streaksBig");
  $("weights").innerHTML=a.slice().reverse().map(x=>`<div class=row><span>${date(x.date)}<br><small>${time(x.date)}</small></span><b>${x.v.toFixed(1)} kg</b></div>`).join("")||"<p class=muted>Nenhum registro.</p>";
  $("tgs").innerHTML=[...d.tg].sort((a,b)=>new Date(b.date)-new Date(a.date)).map(x=>`<div class=row><span>${date(x.date)}<br><small>${time(x.date)} ${esc(x.note)}</small></span><b>${esc(x.dose)}</b></div>`).join("")||"<p class=muted>Nenhuma aplicação.</p>";
  $("meds").innerHTML=[...d.m].sort((a,b)=>new Date(b.date)-new Date(a.date)).map(x=>`<div class=row><span>${x.t?"✅":"⭕"} ${esc(x.name)}<br><small>${date(x.date)} • ${time(x.date)}</small></span><b>${esc(x.dose)}</b></div>`).join("")||"<p class=muted>Nenhum registro.</p>";
  $("goal").value=d.goal||"";$("objectiveInput").value=d.objective||"";$("b3").value=d.times.b3||"";$("om").value=d.times.om||"";
  if($("calendarDate")&&!$("calendarDate").value)$("calendarDate").value=todayKey();showDay($("calendarDate").value);drawChart("chart",240);drawChart("chartBig",280);
}
function latestToday(type){const k=todayKey();if(type==="Peso")return d.w.filter(x=>dayKey(x.date)===k).sort((a,b)=>new Date(a.date)-new Date(b.date)).at(-1)||null;if(type==="Retatrutida")return d.tg.filter(x=>dayKey(x.date)===k).sort((a,b)=>new Date(a.date)-new Date(b.date)).at(-1)||null;return d.m.filter(x=>dayKey(x.date)===k&&x.name===type).sort((a,b)=>new Date(a.date)-new Date(b.date)).at(-1)||null}
function todayValue(type){const x=latestToday(type);if(!x)return "Não registrado";if(type==="Peso")return Number(x.v).toFixed(1)+" kg";if(type==="Retatrutida")return x.dose||"Registrado";return x.t?(x.dose||"Tomado"):"Não tomado"}
function todayTime(type){const x=latestToday(type);return x?time(x.date):"—"}
function quickRegister(type){if(type!=="Retatrutida"&&hasToday(type)){openTab("history");return}if(type==="Peso")openM("weight");else if(type==="Retatrutida")openM("tg");else if(type==="Creatina")openCreatine();else openM("med",type)}
function renderStreaks(id){
  if(!$(id))return;
  const arr=[
    {n:"Creatina",i:"🏋",s:streak("Creatina"),u:"dias"},
    {n:"Ômega 3",i:"🐟",s:streak("Ômega 3"),u:"dias"},
    {n:"Vitamina B3",i:"💊",s:streak("B3"),u:"dias"},
    {n:"Retatrutida",i:"💉",s:retWeeklyStreak(),u:"semanas"}
  ];
  $(id).innerHTML=arr.map(x=>`<div class="streak-row"><span>${x.i}</span><span>${x.n}</span><b>${x.s} ${x.u}</b></div>`).join("");
}
function drawChart(id,H){const c=$(id);if(!c)return;const x=c.getContext("2d"),W=Math.max(280,c.clientWidth||500),a=weights();c.width=W*devicePixelRatio;c.height=H*devicePixelRatio;x.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);x.clearRect(0,0,W,H);if(a.length<2){x.fillStyle="#6f879f";x.font="14px Arial";x.fillText("Registre pelo menos 2 pesos para ver o gráfico.",12,30);return}const vs=a.map(z=>z.v),mn=Math.min(...vs)-1,mx=Math.max(...vs)+1,p=34; x.strokeStyle="#173b5c";x.lineWidth=1;for(let i=0;i<5;i++){const y=p+(H-2*p)*i/4;x.beginPath();x.moveTo(p,y);x.lineTo(W-p,y);x.stroke()}x.strokeStyle="#1da7ff";x.lineWidth=3;x.beginPath();a.forEach((z,i)=>{const X=p+(W-2*p)*i/(a.length-1),Y=p+(H-2*p)*(mx-z.v)/(mx-mn);i?x.lineTo(X,Y):x.moveTo(X,Y)});x.stroke();a.forEach((z,i)=>{const X=p+(W-2*p)*i/(a.length-1),Y=p+(H-2*p)*(mx-z.v)/(mx-mn);x.fillStyle="#20b8ff";x.beginPath();x.arc(X,Y,4,0,Math.PI*2);x.fill();if(i===a.length-1){x.fillStyle="#dcecff";x.font="13px Arial";x.fillText(z.v.toFixed(1)+" kg",Math.min(W-75,X+7),Y-8)}})}
function openM(t,preset=""){
  $("modal").classList.remove("hidden");
  $("mt").textContent=t==="weight"?"Registrar peso":t==="tg"?"Registrar Retatrutida":"Registrar medicamento";
  const n=new Date(),loc=new Date(n-n.getTimezoneOffset()*60000).toISOString().slice(0,16);
  $("form").innerHTML=t==="weight"?`<div class=field><label>Peso (kg)</label><input id=v required inputmode=decimal placeholder="Ex.: 105,0"></div><div class=field><label>Data e horário</label><input id=dt type=datetime-local value=${loc}></div>`:t==="tg"?`<div class=field><label>Dose registrada</label><input id=ds required placeholder="Ex.: 2,5 mg"></div><div class=field><label>Observação</label><textarea id=no></textarea></div><div class=field><label>Data e horário</label><input id=dt type=datetime-local value=${loc}></div>`:`<div class=field><label>Medicamento</label><select id=nm><option>B3</option><option>Ômega 3</option><option>Outro</option></select></div><div class=field><label>Dose</label><input id=ds placeholder="Ex.: 1 cápsula"></div><div class=field><label>Data e horário</label><input id=dt type=datetime-local value=${loc}></div><label><input id=tk type=checkbox checked> Tomei</label>`;
  $("form").innerHTML+=`<button type=submit>Salvar registro</button>`;
  if(t==="med"&&preset)$("nm").value=preset;
  $("form").onsubmit=e=>{e.preventDefault();if(!$("dt").value)return;const z=new Date($("dt").value).toISOString();if(t==="weight"){const q=parseFloat($("v").value.replace(",","."));if(!(q>0))return alert("Digite um peso válido.");d.w.push({date:z,v:q})}else if(t==="tg")d.tg.push({date:z,dose:$("ds").value,note:$("no").value});else d.m.push({date:z,name:$("nm").value,dose:$("ds").value,t:$("tk").checked});save();closeM()};
}
function openCreatine(){$("modal").classList.remove("hidden");$("mt").textContent="Registrar creatina";const n=new Date(),loc=new Date(n-n.getTimezoneOffset()*60000).toISOString().slice(0,16);$("form").innerHTML=`<div class=field><label>Dose registrada</label><input id=cds required placeholder="Ex.: 3 g"></div><div class=field><label>Data e horário</label><input id=cdt type=datetime-local value=${loc}></div><label><input id=ctk type=checkbox checked> Tomei hoje</label><button type=submit>Salvar registro</button>`;$("form").onsubmit=e=>{e.preventDefault();d.m.push({date:new Date($("cdt").value).toISOString(),name:"Creatina",dose:$("cds").value,t:$("ctk").checked});save();closeM()}}
function toggleRegister(){
  const box=$("registerActions"), label=$("registerToggleLabel"), chev=$("registerChevron"), btn=document.querySelector(".register-toggle");
  const opening=box.hidden; box.hidden=!opening; label.textContent=opening?"Ocultar":"Mostrar"; chev.textContent=opening?"⌄":"⌃"; btn.setAttribute("aria-expanded", String(opening));
}
function closeM(){$("modal").classList.add("hidden")}function openTab(t){document.querySelectorAll("nav button").forEach(b=>b.classList.toggle("selected",b.dataset.t===t));document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("active",x.id===t));window.scrollTo({top:0,behavior:"smooth"})}
function showDay(v){if(!v){$("dayView").innerHTML="";return}const items=[...d.w.map(x=>({type:"Peso",date:x.date,value:x.v+" kg",t:true})),...d.tg.map(x=>({type:"Retatrutida",date:x.date,value:x.dose,t:true})),...d.m.map(x=>({type:x.name,date:x.date,value:x.dose,t:x.t}))].filter(x=>dayKey(x.date)===v);$("dayView").innerHTML=items.length?items.sort((a,b)=>new Date(a.date)-new Date(b.date)).map(x=>`<div class=row><span>${x.t===false?"⭕":"✅"} ${esc(x.type)}<br><small>${time(x.date)}</small></span><b>${esc(x.value)}</b></div>`).join(""):"<p class=muted>Nenhum registro nesta data.</p>"}
function saveGoal(){const q=parseFloat($("goal").value.replace(",","."));d.goal=q>0?q:null;save();alert("Meta salva.")}function saveObjective(){d.objective=$("objectiveInput").value.trim()||"Mais saúde e energia";save();alert("Objetivo salvo.")}function saveTimes(){d.times={b3:$("b3").value,om:$("om").value};save();alert("Horários salvos.")}async function notify(){if("Notification"in window){const p=await Notification.requestPermission();alert(p==="granted"?"Notificações permitidas.":"Permissão não concedida.")}else alert("Notificações não disponíveis neste navegador.")}function pin(){const old=d.pin?prompt("PIN atual:"):null;if(d.pin&&old!==d.pin)return alert("PIN incorreto.");const q=prompt("Novo PIN (4 a 8 números):");if(q&&/^\d{4,8}$/.test(q)){d.pin=q;save();alert("PIN salvo.")}}function wipe(){if(confirm("Apagar todos os dados?")){localStorage.removeItem(K);location.reload()}}
document.querySelectorAll("nav button").forEach(b=>b.onclick=()=>openTab(b.dataset.t));$("gear").onclick=()=>openTab("settings");if("serviceWorker"in navigator)navigator.serviceWorker.register("sw.js").catch(()=>{});render();
