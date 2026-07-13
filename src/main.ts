import './styles.css';
import { registerSW } from 'virtual:pwa-register';
import { DecimateGame } from './game';
import { levels } from './level';
import type { GameState, RoundResult } from './types';

const app=document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML=`
<main id="game-shell">
  <div id="scene" aria-label="3D room destruction game"></div>
  <header class="hud hidden" id="hud">
    <div class="stat"><span>TIME</span><strong id="timer">1:00</strong></div>
    <div class="progress-wrap"><div class="progress-label"><span>DECIMATION</span><strong id="percent">0%</strong></div><div class="track"><i id="progress"></i><b id="goal-marker" style="left:75%"></b></div></div>
    <div class="stat"><span>SCORE</span><strong id="score">0</strong></div>
  </header>
  <div class="top-actions hidden" id="actions"><button id="mute" class="icon" aria-label="Mute">♪</button><button id="pause" class="icon" aria-label="Pause">Ⅱ</button></div>
  <button id="disguise" class="disguise hidden"><span>◉</span> DISGUISE</button>
  <div id="toast" class="toast hidden"></div>
  <div id="return-alert" class="return-alert hidden"><i></i><span>FOOTSTEPS APPROACHING</span></div>
  <section id="menu" class="panel hero">
    <div class="eyebrow">AN UNAUTHORIZED ALIEN ACTIVITY</div><h1>DECI<span>MATE</span></h1>
    <p id="room-tagline">Wreck their room. Copy their stuff. Leave no witnesses—just questions.</p>
    <button id="rooms" class="mission"><span id="room-name">THE LIVING ROOM</span><strong id="room-goal">75% in 1:00 ›</strong></button>
    <button id="start" class="primary">BEGIN DECIMATION <b>→</b></button>
    <button id="how" class="text-btn">How to play</button>
  </section>
  <section id="level-select" class="panel level-panel hidden"><div class="eyebrow">INVASION ROUTE</div><h2>Choose a room</h2><div id="level-grid" class="level-grid"></div><button id="level-back" class="text-btn">Back</button></section>
  <section id="tutorial" class="panel hidden"><div class="eyebrow">FIELD MANUAL</div><h2>Destroy. Disguise. Disappear.</h2><div class="steps"><article><b>01</b><h3>Drag to aim</h3><p>Pull across the room and release to launch alien plasma.</p></article><article><b>02</b><h3>Reach the goal</h3><p>Every vaporized object fills your decimation meter.</p></article><article><b>03</b><h3>Blend in</h3><p>Before time expires, tap Disguise then a glowing object.</p></article></div><button id="tutorial-go" class="primary">GOT IT — LET'S WRECK IT</button></section>
  <section id="pause-panel" class="panel compact hidden"><div class="eyebrow">TEMPORAL SUSPENSION</div><h2>Paused</h2><button id="resume" class="primary">RESUME</button><button class="secondary restart">RESTART ROOM</button></section>
  <section id="result" class="panel compact hidden"><div id="result-eye" class="eyebrow">MISSION REPORT</div><h2 id="result-title">Room decimated.</h2><div class="result-score"><span id="result-percent">0%</span><small>DECIMATED</small></div><p id="result-copy"></p><p id="best"></p><button id="result-action" class="primary">PLAY AGAIN</button><button id="result-rooms" class="secondary">CHOOSE ROOM</button></section>
  <button id="install" class="install hidden">＋ Install Decimate</button>
  <footer>BUILD <span>${__BUILD_ID__}</span></footer>
  <div class="rotate"><div>↻</div><strong>Rotate to landscape</strong><span>Decimation requires elbow room.</span></div>
</main>`;

const $=<T extends HTMLElement>(id:string)=>document.getElementById(id) as T;
const hud=$('hud'),actions=$('actions'),disguise=$<HTMLButtonElement>('disguise'),returnAlert=$('return-alert');
const panels=['menu','level-select','tutorial','pause-panel','result'];
let selected=Math.min(Number(localStorage.getItem('decimate-last-level')||0),levels.length-1);
let unlocked=Math.min(Number(localStorage.getItem('decimate-unlocked')||0),levels.length-1);
if(selected>unlocked)selected=unlocked;

function showPanel(id?:string){panels.forEach(p=>$(p).classList.toggle('hidden',p!==id));}
function setPlayUi(show:boolean){hud.classList.toggle('hidden',!show);actions.classList.toggle('hidden',!show);disguise.classList.toggle('hidden',!show);}
function updateMenu(){const level=levels[selected];$('room-name').textContent=level.name.toUpperCase();$('room-goal').textContent=`${level.targetPercent}% in 1:00 ›`;$('room-tagline').textContent=level.tagline;$<HTMLElement>('goal-marker').style.left=`${level.targetPercent}%`;localStorage.setItem('decimate-last-level',String(selected));}
function chooseLevel(index:number){if(index>unlocked)return;selected=index;game.selectLevel(index);updateMenu();showPanel('menu');}
function renderLevels(){const grid=$('level-grid');grid.innerHTML='';levels.forEach((level,index)=>{const locked=index>unlocked,button=document.createElement('button');button.className=`level-card${locked?' locked':''}${index===selected?' selected':''}`;button.disabled=locked;button.innerHTML=`<i>${locked?'LOCKED':String(index+1).padStart(2,'0')}</i><strong>${level.name}</strong><span>${locked?'Complete the previous room':`${level.targetPercent}% target · 1:00`}</span>`;button.onclick=()=>chooseLevel(index);grid.appendChild(button);});}
let toastTimer=0;
function toast(message:string){const el=$('toast');el.textContent=message;el.classList.remove('hidden');clearTimeout(toastTimer);toastTimer=window.setTimeout(()=>el.classList.add('hidden'),1800);}
function onState(state:GameState){const active=['playing','return-warning','disguised','paused'].includes(state);setPlayUi(active);returnAlert.classList.toggle('hidden',state!=='return-warning');if(state==='paused')showPanel('pause-panel');else if(active)showPanel();disguise.classList.toggle('hidden',!['playing','return-warning'].includes(state));}
function onResult(result:RoundResult){
  setPlayUi(false);showPanel('result');$('result-title').textContent=result.passed?'Room decimated.':'Mission compromised.';$('result-eye').textContent=result.passed?'MISSION COMPLETE':'MISSION FAILED';$('result-percent').textContent=`${result.percent}%`;$('result-copy').textContent=result.reason;
  const key=`decimate-best-${levels[selected].id}`,old=Number(localStorage.getItem(key)||0),best=Math.max(old,result.score);localStorage.setItem(key,String(best));$('best').textContent=`Score ${result.score.toLocaleString()} · Best ${best.toLocaleString()}`;
  if(result.passed&&selected<levels.length-1){unlocked=Math.max(unlocked,selected+1);localStorage.setItem('decimate-unlocked',String(unlocked));$<HTMLButtonElement>('result-action').textContent='NEXT ROOM →';}
  else $<HTMLButtonElement>('result-action').textContent=result.passed?'REPLAY ROOM':'TRY AGAIN';
  renderLevels();
}
const game=new DecimateGame($('scene'),{stats:(time,score,percent)=>{$('timer').textContent=`${Math.floor(time/60)}:${String(Math.ceil(time)%60).padStart(2,'0')}`;$('score').textContent=score.toLocaleString();$('percent').textContent=`${percent}%`;$<HTMLElement>('progress').style.width=`${percent}%`;returnAlert.classList.toggle('hidden',time>10);},state:onState,result:onResult,toast});
game.selectLevel(selected);game.init().catch(error=>{console.error(error);toast('Unable to initialize 3D physics.');});
function begin(){game.selectLevel(selected);updateMenu();showPanel();game.start();localStorage.setItem('decimate-tutorial','seen');}
function restart(){disguise.classList.remove('active');showPanel();game.restart();}
$('start').onclick=()=>localStorage.getItem('decimate-tutorial')?begin():showPanel('tutorial');$('how').onclick=()=>showPanel('tutorial');$('tutorial-go').onclick=begin;$('rooms').onclick=()=>{renderLevels();showPanel('level-select');};$('level-back').onclick=()=>showPanel('menu');$('pause').onclick=()=>game.togglePause();$('resume').onclick=()=>game.togglePause();document.querySelectorAll('.restart').forEach(button=>button.addEventListener('click',restart));
$('result-action').onclick=()=>{if($('result-action').textContent?.startsWith('NEXT')){selected=Math.min(selected+1,levels.length-1);game.selectLevel(selected);updateMenu();}begin();};$('result-rooms').onclick=()=>{renderLevels();showPanel('level-select');};
disguise.onclick=()=>{game.beginDisguise();disguise.classList.add('active');};$('mute').onclick=()=>{$('mute').textContent=game.audio.toggle()?'×':'♪';};
let deferred:any;addEventListener('beforeinstallprompt',(event)=>{event.preventDefault();deferred=event;$('install').classList.remove('hidden');});$('install').onclick=async()=>{await deferred?.prompt();deferred=undefined;$('install').classList.add('hidden');};
updateMenu();renderLevels();registerSW({onNeedRefresh(){toast('New build ready — reload to update.');}});
