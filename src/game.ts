import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import { AudioSystem } from './audio';
import { levels } from './level';
import { awardOnce, canDisguise, decimationPercent, launchVelocity, resolveRound, timedState } from './rules';
import type { DestructibleConfig, GameState, LevelConfig, RoundResult } from './types';

interface RuntimeObject { config:DestructibleConfig; mesh:THREE.Mesh; body:RAPIER.RigidBody; damage:number; broken:boolean; }
interface Projectile { mesh:THREE.Mesh; body:RAPIER.RigidBody; born:number; hits:Set<string>; }
interface VaporParticle { mesh:THREE.Mesh; velocity:THREE.Vector3; born:number; life:number; }
export interface GameEvents {
  stats:(time:number, score:number, percent:number)=>void;
  state:(state:GameState)=>void;
  result:(result:RoundResult)=>void;
  toast:(message:string)=>void;
}

export class DecimateGame {
  private renderer:THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(42,1,.1,100);
  private world!:RAPIER.World;
  private objects:RuntimeObject[] = [];
  private projectiles:Projectile[] = [];
  private particles:VaporParticle[] = [];
  private catapult = new THREE.Group();
  private alien = new THREE.Group();
  private roomDecor = new THREE.Group();
  private roomFloor!:THREE.Mesh;
  private backWall!:THREE.Mesh;
  private sideWall!:THREE.Mesh;
  private trajectory:THREE.Line;
  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2();
  private dragStart?:{x:number;y:number};
  private dragCurrent?:{x:number;y:number};
  private lastFrame = performance.now();
  private activeLevel:LevelConfig = levels[0];
  private remaining = this.activeLevel.duration;
  private score = 0;
  private awarded = 0;
  private awardedIds = new Set<string>();
  private total = this.activeLevel.objects.reduce((sum,o)=>sum+o.points,0);
  private stateValue:GameState = 'menu';
  private beforePause:GameState = 'playing';
  private disguiseMode = false;
  private disguised = false;
  private shake = 0;
  private lastWarningSecond = -1;
  readonly audio = new AudioSystem();

  constructor(private host:HTMLElement, private events:GameEvents) {
    this.renderer = new THREE.WebGLRenderer({ antialias:true, alpha:false, powerPreference:'high-performance' });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.host.appendChild(this.renderer.domElement);
    this.trajectory = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({color:0xb7ff42,transparent:true,opacity:.8}));
    this.trajectory.visible = false; this.scene.add(this.trajectory);
    this.bindInput();
  }

  async init() {
    await RAPIER.init();
    this.world = new RAPIER.World({x:0,y:-9.81,z:0});
    this.setupScene(); this.buildRoom(); this.buildCatapult(); this.resetObjects();
    addEventListener('resize',()=>this.resize()); this.resize();
    requestAnimationFrame((t)=>this.loop(t));
  }

  get state() { return this.stateValue; }
  get currentLevel() { return this.activeLevel; }
  selectLevel(index:number) { this.activeLevel=levels[Math.max(0,Math.min(levels.length-1,index))];this.total=this.activeLevel.objects.reduce((sum,o)=>sum+o.points,0); }
  start() { this.resetRound(); this.setState('playing'); }
  restart() { this.start(); }
  togglePause() {
    if (this.stateValue === 'paused') this.setState(this.beforePause);
    else if (['playing','return-warning','disguised'].includes(this.stateValue)) { this.beforePause=this.stateValue; this.setState('paused'); }
  }
  beginDisguise() {
    if (!['playing','return-warning'].includes(this.stateValue)) return;
    this.disguiseMode = true;
    this.objects.filter(o=>canDisguise(o.config.copyable,o.broken)).forEach(o=>(o.mesh.material as THREE.MeshStandardMaterial).emissive.set(0x426611));
    this.events.toast('Tap a glowing object to copy it');
  }
  cancelDisguise() { this.disguiseMode=false; this.clearHighlights(); }

  private setState(state:GameState) { this.stateValue=state; this.events.state(state); }
  private setupScene() {
    this.scene.background = new THREE.Color(0x090a0f); this.scene.fog = new THREE.Fog(0x090a0f,19,32);
    this.camera.position.set(11,9.2,14.5); this.camera.lookAt(0,1,-.7);
    this.scene.add(new THREE.HemisphereLight(0xbad6ff,0x251526,1.5));
    const key=new THREE.DirectionalLight(0xffe2c6,3); key.position.set(3,9,7); key.castShadow=true; key.shadow.mapSize.set(1024,1024); this.scene.add(key);
    const fill=new THREE.PointLight(0x8055ff,35,14); fill.position.set(-5,4,3); this.scene.add(fill);
  }
  private addStaticBox(pos:[number,number,number], size:[number,number,number], color:number) {
    const mesh=new THREE.Mesh(new THREE.BoxGeometry(...size),new THREE.MeshStandardMaterial({color,roughness:.8}));
    mesh.position.set(...pos); mesh.receiveShadow=true; this.scene.add(mesh);
    const body=this.world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(...pos));
    this.world.createCollider(RAPIER.ColliderDesc.cuboid(size[0]/2,size[1]/2,size[2]/2).setFriction(.8),body);
    return mesh;
  }
  private buildRoom() {
    this.roomFloor=this.addStaticBox([0,-.25,0],[12,.5,12],0x24212c);
    this.backWall=this.addStaticBox([0,3,-5.75],[12,6,.3],0x393244);
    this.sideWall=this.addStaticBox([-5.85,3,0],[.3,6,12],0x302b3c);
    this.scene.add(this.roomDecor);this.applyRoomTheme();
  }
  private decorBox(pos:[number,number,number],size:[number,number,number],color:number,emissive=0) {
    const mesh=new THREE.Mesh(new THREE.BoxGeometry(...size),new THREE.MeshStandardMaterial({color,emissive,roughness:.75}));mesh.position.set(...pos);this.roomDecor.add(mesh);return mesh;
  }
  private applyRoomTheme() {
    this.roomDecor.traverse(child=>{if(child instanceof THREE.Mesh){child.geometry.dispose();(child.material as THREE.Material).dispose();}});this.roomDecor.clear();
    const p=this.activeLevel.palette;(this.roomFloor.material as THREE.MeshStandardMaterial).color.setHex(p.floor);(this.backWall.material as THREE.MeshStandardMaterial).color.setHex(p.backWall);(this.sideWall.material as THREE.MeshStandardMaterial).color.setHex(p.sideWall);
    if(['living','bedroom','office'].includes(this.activeLevel.id)){
      this.decorBox([.5,.025,.2],[6,.04,4],p.rug);
      for(let i=0;i<5;i++)this.decorBox([.5,.052,-1.3+i*.7],[5.6,.015,.16],p.accent);
    }
    if(this.activeLevel.id==='living')this.decorBox([3.4,3.3,-5.5],[2.8,2.2,.12],p.accent,0x183b55);
    if(this.activeLevel.id==='kitchen')for(let x=-4.5;x<=4.5;x+=1.15)this.decorBox([x,2.9,-5.5],[1.02,.7,.08],x%2?p.accent:0xd7ebe7);
    if(this.activeLevel.id==='bedroom'){this.decorBox([2.8,3.25,-5.5],[3.3,1.45,.1],p.accent,0x421830);this.decorBox([-1.4,3.5,-5.5],[1.3,1.3,.1],0xf1c66b);}
    if(this.activeLevel.id==='office')for(let i=0;i<3;i++)this.decorBox([-1.8+i*1.8,3.6,-5.5],[1.35,1.55,.08],p.accent,0x12384c);
    if(this.activeLevel.id==='garage'){this.decorBox([1.1,3,-5.5],[7.5,5,.08],0x69706e);for(let y=1;y<5.5;y+=.75)this.decorBox([1.1,y,-5.42],[7.4,.06,.06],p.accent);}
  }
  private buildCatapult() {
    const wood=new THREE.MeshStandardMaterial({color:0x75452e,roughness:.7});
    const base=new THREE.Mesh(new THREE.BoxGeometry(2.1,.35,1.5),wood); base.position.y=.25; base.castShadow=true; this.catapult.add(base);
    [-.75,.75].forEach(x=>{ const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.38,.38,.22,16),new THREE.MeshStandardMaterial({color:0x2a2223})); wheel.rotation.z=Math.PI/2; wheel.position.set(x,.35,.55); this.catapult.add(wheel); });
    const arm=new THREE.Mesh(new THREE.BoxGeometry(.24,.24,2.6),wood); arm.rotation.x=-.58; arm.position.set(0,1.05,-.15); this.catapult.add(arm);
    const cup=new THREE.Mesh(new THREE.SphereGeometry(.38,16,8,0,Math.PI*2,0,Math.PI/2),new THREE.MeshStandardMaterial({color:0x222532,side:THREE.DoubleSide})); cup.position.set(0,1.85,.9); this.catapult.add(cup);
    this.catapult.position.set(0,0,4.4); this.scene.add(this.catapult);
    this.resetAlienAppearance();this.alien.position.set(-1.15,0,4.35);this.scene.add(this.alien);
  }
  private resetAlienAppearance() {
    this.alien.clear();
    const body=new THREE.Mesh(new THREE.SphereGeometry(.46,24,16),new THREE.MeshStandardMaterial({color:0xb7ff42,roughness:.55}));body.scale.y=1.25;body.position.y=.78;this.alien.add(body);
    [-.17,.17].forEach(x=>{const eye=new THREE.Mesh(new THREE.SphereGeometry(.085,12,8),new THREE.MeshBasicMaterial({color:0x101218}));eye.position.set(x,.9,.42);this.alien.add(eye);});
  }
  private resetObjects() {
    this.objects.forEach(o=>{this.scene.remove(o.mesh);if(!o.broken)this.world.removeRigidBody(o.body)});this.objects=[];
    this.activeLevel.objects.forEach(config=>{
      const geometry=config.shape==='sphere'?new THREE.SphereGeometry(config.size[0]/2,16,12):new THREE.BoxGeometry(...config.size);
      const material=new THREE.MeshStandardMaterial({color:config.color,roughness:.62,metalness:config.id==='tv'?.35:0});
      const mesh=new THREE.Mesh(geometry,material); mesh.position.set(...config.position); mesh.castShadow=true; mesh.receiveShadow=true; mesh.userData.objectId=config.id; this.scene.add(mesh);
      const body=this.world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(...config.position).setLinearDamping(.25).setAngularDamping(.35));
      const collider=config.shape==='sphere'?RAPIER.ColliderDesc.ball(config.size[0]/2):RAPIER.ColliderDesc.cuboid(config.size[0]/2,config.size[1]/2,config.size[2]/2);
      this.world.createCollider(collider.setDensity(Math.max(.3,config.points/120)).setFriction(.72).setRestitution(.18),body);
      this.objects.push({config,mesh,body,damage:0,broken:false});
    });
  }
  private resetRound() {
    this.projectiles.forEach(x=>{this.scene.remove(x.mesh);this.world.removeRigidBody(x.body)});this.projectiles=[];
    this.particles.forEach(x=>{this.scene.remove(x.mesh);x.mesh.geometry.dispose();(x.mesh.material as THREE.Material).dispose()});this.particles=[];
    this.applyRoomTheme();this.resetObjects();this.resetAlienAppearance();this.remaining=this.activeLevel.duration;this.score=0;this.awarded=0;this.awardedIds.clear();this.disguised=false;this.disguiseMode=false;this.catapult.visible=true;this.alien.visible=true;this.lastWarningSecond=-1;
    this.events.stats(this.remaining,0,0); this.events.toast('Drag back, aim, release.');
  }
  private bindInput() {
    const canvas=this.renderer.domElement;
    canvas.addEventListener('pointerdown',e=>{ if(!['playing','return-warning'].includes(this.stateValue))return; this.dragStart={x:e.clientX,y:e.clientY};this.dragCurrent={...this.dragStart};canvas.setPointerCapture(e.pointerId); });
    canvas.addEventListener('pointermove',e=>{ if(!this.dragStart)return;this.dragCurrent={x:e.clientX,y:e.clientY}; if(!this.disguiseMode)this.updateTrajectory(); });
    canvas.addEventListener('pointerup',e=>{
      if(!this.dragStart)return; const dx=e.clientX-this.dragStart.x,dy=e.clientY-this.dragStart.y;this.trajectory.visible=false;
      if(this.disguiseMode&&Math.hypot(dx,dy)<18)this.pickDisguise(e.clientX,e.clientY); else if(!this.disguiseMode&&Math.hypot(dx,dy)>25)this.fire(dx,dy);
      this.dragStart=undefined;this.dragCurrent=undefined;
    });
    canvas.addEventListener('contextmenu',e=>e.preventDefault());
  }
  private fire(dx:number,dy:number) {
    const v=launchVelocity(dx,dy); const start={x:0,y:1.65,z:4.25};
    const mesh=new THREE.Mesh(new THREE.IcosahedronGeometry(.36,1),new THREE.MeshStandardMaterial({color:0xb7ff42,emissive:0x243b0c})); mesh.castShadow=true;this.scene.add(mesh);
    const body=this.world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(start.x,start.y,start.z).setCcdEnabled(true));
    this.world.createCollider(RAPIER.ColliderDesc.ball(.36).setDensity(1.4).setRestitution(.45),body);body.setLinvel(v,true);
    this.projectiles.push({mesh,body,born:performance.now(),hits:new Set()});this.audio.launch();
  }
  private updateTrajectory() {
    if(!this.dragStart||!this.dragCurrent)return; const dx=this.dragCurrent.x-this.dragStart.x,dy=this.dragCurrent.y-this.dragStart.y;if(Math.hypot(dx,dy)<25){this.trajectory.visible=false;return;}
    const v=launchVelocity(dx,dy), points:THREE.Vector3[]=[];
    for(let t=0;t<1.7;t+=.1)points.push(new THREE.Vector3(v.x*t,1.65+v.y*t-4.905*t*t,4.25+v.z*t));
    this.trajectory.geometry.dispose();this.trajectory.geometry=new THREE.BufferGeometry().setFromPoints(points);this.trajectory.visible=true;
  }
  private pickDisguise(x:number,y:number) {
    const rect=this.renderer.domElement.getBoundingClientRect();this.pointer.set((x-rect.left)/rect.width*2-1,-((y-rect.top)/rect.height)*2+1);this.raycaster.setFromCamera(this.pointer,this.camera);
    const hit=this.raycaster.intersectObjects(this.objects.filter(o=>canDisguise(o.config.copyable,o.broken)).map(o=>o.mesh))[0];
    if(!hit){this.events.toast('Tap one of the glowing intact objects');return;}
    const chosen=this.objects.find(o=>o.config.id===hit.object.userData.objectId)!;this.disguised=true;this.disguiseMode=false;this.clearHighlights();this.catapult.visible=false;
    const source=chosen.mesh; const clone=new THREE.Mesh(source.geometry.clone(),(source.material as THREE.Material).clone());clone.scale.set(.7,.7,.7);clone.position.set(0,.4,4.35);this.alien.clear();this.alien.add(clone);this.alien.visible=true;this.audio.morph();this.setState('disguised');this.events.toast(`Disguised as ${chosen.config.name}. Stay still…`);
  }
  private clearHighlights(){this.objects.forEach(o=>(o.mesh.material as THREE.MeshStandardMaterial).emissive.set(0x000000));}
  private damageObject(object:RuntimeObject, speed:number, point:THREE.Vector3) {
    if(object.broken)return;object.damage+=Math.max(5,speed*.72);object.body.applyImpulse({x:(Math.random()-.5)*3,y:2,z:-2},true);
    if(object.damage<object.config.breakThreshold){this.audio.impact();const material=object.mesh.material as THREE.MeshStandardMaterial;material.emissive.set(0x6e8124);setTimeout(()=>{if(!object.broken)material.emissive.set(0x000000)},100);return;}
    object.broken=true;const points=awardOnce(this.awardedIds,object.config.id,object.config.points);this.score+=points;this.awarded+=points;this.audio.impact();this.shake=.22;
    object.mesh.visible=false;this.world.removeRigidBody(object.body);this.spawnVapor(object,point);this.audio.vaporize();
    const percent=decimationPercent(this.awarded,this.total);this.events.stats(this.remaining,this.score,percent);this.events.toast(`+${object.config.points} · ${object.config.name}`);
  }
  private spawnVapor(object:RuntimeObject, point:THREE.Vector3) {
    const origin=object.mesh.position.clone().lerp(point,.25),color=(object.mesh.material as THREE.MeshStandardMaterial).color;
    for(let i=0;i<22;i++){
      const radius=.035+Math.random()*.085,material=new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:1.8,transparent:true,opacity:1,depthWrite:false});
      const mesh=new THREE.Mesh(new THREE.IcosahedronGeometry(radius,0),material);mesh.position.copy(origin).add(new THREE.Vector3((Math.random()-.5)*.35,(Math.random()-.5)*.35,(Math.random()-.5)*.35));this.scene.add(mesh);
      const velocity=new THREE.Vector3((Math.random()-.5)*3.8,.8+Math.random()*3.2,(Math.random()-.5)*3.8);this.particles.push({mesh,velocity,born:performance.now(),life:550+Math.random()*500});
    }
  }
  private updatePhysics(now:number) {
    this.world.timestep=1/60;this.world.step();
    this.objects.filter(o=>!o.broken).forEach(o=>{const p=o.body.translation(),q=o.body.rotation();o.mesh.position.set(p.x,p.y,p.z);o.mesh.quaternion.set(q.x,q.y,q.z,q.w);});
    this.particles=this.particles.filter(p=>{const age=now-p.born;if(age>=p.life){this.scene.remove(p.mesh);p.mesh.geometry.dispose();(p.mesh.material as THREE.Material).dispose();return false;}const dt=1/60;p.mesh.position.addScaledVector(p.velocity,dt);p.velocity.y+=.018;const fade=1-age/p.life;(p.mesh.material as THREE.MeshStandardMaterial).opacity=fade;p.mesh.scale.setScalar(.7+age/p.life*1.8);return true;});
    this.projectiles.forEach(p=>{const pos=p.body.translation(),q=p.body.rotation(),vel=p.body.linvel();p.mesh.position.set(pos.x,pos.y,pos.z);p.mesh.quaternion.set(q.x,q.y,q.z,q.w);const speed=Math.hypot(vel.x,vel.y,vel.z);
      this.objects.forEach(o=>{if(o.broken||p.hits.has(o.config.id))return;const radius=Math.hypot(...o.config.size)/2;if(p.mesh.position.distanceTo(o.mesh.position)<radius+.32){p.hits.add(o.config.id);this.damageObject(o,speed,p.mesh.position);}});
    });
    this.projectiles=this.projectiles.filter(p=>{if(now-p.born<9000&&p.mesh.position.y>-3)return true;this.scene.remove(p.mesh);this.world.removeRigidBody(p.body);return false;});
  }
  private loop(now:number) {
    const dt=Math.min((now-this.lastFrame)/1000,.05);this.lastFrame=now;
    if(this.stateValue!=='paused')this.updatePhysics(now);
    if(['playing','return-warning','disguised'].includes(this.stateValue)){
      this.remaining=Math.max(0,this.remaining-dt);const second=Math.ceil(this.remaining);
      const timed=timedState(this.remaining,this.stateValue,this.activeLevel.returnWarning);if(timed!==this.stateValue)this.setState(timed);
      if(this.remaining<=this.activeLevel.returnWarning&&second!==this.lastWarningSecond){this.lastWarningSecond=second;this.audio.warning();}
      this.events.stats(this.remaining,this.score,decimationPercent(this.awarded,this.total));
      if(this.remaining<=0){const result=resolveRound(decimationPercent(this.awarded,this.total),this.disguised,this.score,this.activeLevel.targetPercent);this.setState(result.passed?'passed':'failed');result.passed?this.audio.success():this.audio.fail();this.events.result(result);}
    }
    if(this.shake>0){this.shake=Math.max(0,this.shake-dt);this.camera.position.x=11+(Math.random()-.5)*this.shake;this.camera.position.y=9.2+(Math.random()-.5)*this.shake;}else{this.camera.position.x=11;this.camera.position.y=9.2;}
    this.camera.lookAt(0,1,-.7);this.renderer.render(this.scene,this.camera);requestAnimationFrame(t=>this.loop(t));
  }
  private resize(){const w=this.host.clientWidth,h=this.host.clientHeight;this.renderer.setSize(w,h,false);this.camera.aspect=w/h;this.camera.updateProjectionMatrix();}
}
