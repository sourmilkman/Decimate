import './styles.css';
import { registerSW } from 'virtual:pwa-register';
import { DecimateGame } from './game';
import type { GameState, RoundResult } from './types';

const app=document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML=`
<main id="game-shell">
  <div id="scene" aria-label="3D living room game"></div>
  <header class="hud hidden" id="hud">
    <div class="stat"><span>TIME</span><strong id="timer">1:00</strong></div>
    <div class="progress-wrap"><div class="progress-label"><span>DECIMATION</span><strong id="percent">0%</strong></div><div class="track"><i id="progress"></i><b style="left:75%"></b></div></div>
    <div class="stat"><span>SCORE</span><strong id="score">0</strong></div>
  </header>
  <div class="top-actions hidden" id="actions"><button id="mute" class="icon" aria-label="Mute">♪</button><button id="pause" class="icon" aria-label="Pause">Ⅱ</button></div>
  <button id="disguise" class="disguise hidden"><span>◉</span> DISGUISE</button>
  <div id="toast" class="toast hidden"></div>
  <div id="return-alert" class="return-alert hidden"><i></i><span>FOOTSTEPS APPROACHING</span></div>
  <section id="menu" class="panel hero">
    <div class="eyebrow">AN UNAUTHORIZED ALIEN ACTIVITY</div><h1>DECI<span>MATE</span></h1>
    <p>Wreck their room. Copy their stuff. Leave no witnesses—just questions.</p>
    <div class="mission"><span>THE LIVING ROOM</span><strong>75% in 1:00</strong></div>
    <button id="start" class="primary">BEGIN DECIMATION <b>→</b></button>
    <button id="how" class="text-btn">How to play</button>
  </section>
  <section id="tutorial" class="panel hidden"><div class="eyebrow">FIELD MANUAL</div><h2>Destroy. Disguise. Disappear.</h2><div class="steps"><article><b>01</b><h3>Drag to aim</h3><p>Pull across the room and release to launch alien plasma.</p></article><article><b>02</b><h3>Reach 75%</h3><p>Every wrecked object fills your decimation meter.</p></article><article><b>03</b><h3>Blend in</h3><p>Before time expires, tap Disguise then a glowing object.</p></article></div><button id="tutorial-go" class="primary">GOT IT — LET'S WRECK IT</button></section>
  <section id="pause-panel" class="panel compact hidden"><div class="eyebrow">TEMPORAL SUSPENSION</div><h2>Paused</h2><button id="resume" class="primary">RESUME</button><button class="secondary restart">RESTART ROOM</button></section>
  <section id="result" class="panel compact hidden"><div id="result-eye" class="eyebrow">MISSION REPORT</div><h2 id="result-title">Room decimated.</h2><div class="result-score"><span id="result-percent">0%</span><small>DECIMATED</small></div><p id="result-copy"></p><p id="best"></p><button class="primary restart">PLAY AGAIN</button></section>
  <button id="install" class="install hidden">＋ Install Decimate</button>
  <footer>BUILD <span>${__BUILD_ID__}</span></footer>
  <div class="rotate"><div>↻</div><strong>Rotate to landscape</strong><span>Decimation requires elbow room.</span></div>
</main>`;

const $=<T extends HTMLElement>(id:string)=>document.getElementById(id) as T;
const hud=$('hud'),actions=$('actions'),disguise=$<HTMLButtonElement>('disguise'),returnAlert=$('return-alert');
const panels=['menu','tutorial','pause-panel','result'];
function showPanel(id?:string){panels.forEach(p=>$(p).classList.toggle('hidden',p!==id));}
function setPlayUi(show:boolean){hud.classList.toggle('hidden',!show);actions.classList.toggle('hidden',!show);disguise.classList.toggle('hidden',!show);}
let toastTimer=0;
function toast(message:string){const el=$('toast');el.textContent=message;el.classList.remove('hidden');clearTimeout(toastTimer);toastTimer=window.setTimeout(()=>el.classList.add('hidden'),1800);}
function onState(state:GameState){
  const active=['playing','return-warning','disguised','paused'].includes(state);setPlayUi(active);returnAlert.classList.toggle('hidden',state!=='return-warning');
  if(state==='paused')showPanel('pause-panel');else if(active)showPanel();
  disguise.classList.toggle('hidden',!['playing','return-warning'].includes(state));
}
function onResult(result:RoundResult){setPlayUi(false);showPanel('result');$('result-title').textContent=result.passed?'Room decimated.':'Mission compromised.';$('result-eye').textContent=result.passed?'MISSION COMPLETE':'MISSION FAILED';$('result-percent').textContent=`${result.percent}%`;$('result-copy').textContent=result.reason;
  const old=Number(localStorage.getItem('decimate-best')||0),best=Math.max(old,result.score);localStorage.setItem('decimate-best',String(best));$('best').textContent=`Score ${result.score.toLocaleString()} · Best ${best.toLocaleString()}`;
}
const game=new DecimateGame($('scene'),{stats:(time,score,percent)=>{$('timer').textContent=`${Math.floor(time/60)}:${String(Math.ceil(time)%60).padStart(2,'0')}`;$('score').textContent=score.toLocaleString();$('percent').textContent=`${percent}%`;$<HTMLElement>('progress').style.width=`${percent}%`;returnAlert.classList.toggle('hidden',time>10);},state:onState,result:onResult,toast});
game.init().catch(error=>{console.error(error);toast('Unable to initialize 3D physics.');});
function begin(){showPanel();game.start();localStorage.setItem('decimate-tutorial','seen');}
$('start').onclick=()=>localStorage.getItem('decimate-tutorial')?begin():showPanel('tutorial');$('how').onclick=()=>showPanel('tutorial');$('tutorial-go').onclick=begin;$('pause').onclick=()=>game.togglePause();$('resume').onclick=()=>game.togglePause();document.querySelectorAll('.restart').forEach(b=>b.addEventListener('click',()=>{disguise.classList.remove('active');showPanel();game.restart();}));
disguise.onclick=()=>{game.beginDisguise();disguise.classList.add('active');};$('mute').onclick=()=>{$('mute').textContent=game.audio.toggle()?'×':'♪';};
let deferred:any;addEventListener('beforeinstallprompt',(event)=>{event.preventDefault();deferred=event;$('install').classList.remove('hidden');});$('install').onclick=async()=>{await deferred?.prompt();deferred=undefined;$('install').classList.add('hidden');};
registerSW({onNeedRefresh(){toast('New build ready — reload to update.');}});
