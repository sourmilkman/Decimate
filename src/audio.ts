export function humanReaction(caught:boolean,percent:number) {
  if(caught)return 'What is that thing? Hey! You! Get out of my house!';
  if(percent>=75)return 'What happened to everything? Where did all my stuff go?';
  return 'What happened in here? This room is a disaster!';
}

export class AudioSystem {
  private context?: AudioContext;
  muted = false;

  arm() { this.context??=new AudioContext();void this.context.resume(); }
  toggle() { this.muted = !this.muted; return this.muted; }
  private tone(frequency:number, duration=.08, volume=.05, type:OscillatorType='sine') {
    if (this.muted) return;
    this.context ??= new AudioContext();
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = type; oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(volume, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(.001, this.context.currentTime + duration);
    oscillator.connect(gain).connect(this.context.destination);
    oscillator.start(); oscillator.stop(this.context.currentTime + duration);
  }
  launch() { this.tone(190,.12,.06,'triangle'); }
  impact() { this.tone(85,.1,.08,'square'); }
  vaporize() {
    this.tone(170,.34,.07,'sawtooth');
    if (!this.context || this.muted) return;
    const length=Math.floor(this.context.sampleRate*.28),buffer=this.context.createBuffer(1,length,this.context.sampleRate),data=buffer.getChannelData(0);
    for(let i=0;i<length;i++)data[i]=(Math.random()*2-1)*Math.pow(1-i/length,2);
    const source=this.context.createBufferSource(),filter=this.context.createBiquadFilter(),gain=this.context.createGain();
    source.buffer=buffer;filter.type='highpass';filter.frequency.value=700;gain.gain.value=.055;source.connect(filter).connect(gain).connect(this.context.destination);source.start();
  }
  footstep(proximity:number) {
    if(this.muted)return;this.arm();
    const volume=.025+Math.max(0,Math.min(1,proximity))*.11,frequency=92-proximity*34,delay=170-proximity*75;
    this.tone(frequency,.11,volume,'sine');setTimeout(()=>this.tone(frequency*.88,.12,volume*.92,'triangle'),delay);
  }
  resetHuman() { if(typeof speechSynthesis!=='undefined')speechSynthesis.cancel(); }
  private doorOpen() {
    if(this.muted)return;this.arm();const context=this.context!,now=context.currentTime,oscillator=context.createOscillator(),gain=context.createGain(),filter=context.createBiquadFilter();
    oscillator.type='sawtooth';oscillator.frequency.setValueAtTime(145,now);oscillator.frequency.exponentialRampToValueAtTime(48,now+.72);filter.type='lowpass';filter.frequency.value=540;gain.gain.setValueAtTime(.001,now);gain.gain.exponentialRampToValueAtTime(.075,now+.08);gain.gain.exponentialRampToValueAtTime(.001,now+.78);oscillator.connect(filter).connect(gain).connect(context.destination);oscillator.start(now);oscillator.stop(now+.8);
    setTimeout(()=>{this.tone(78,.16,.11,'square');this.tone(310,.06,.045,'triangle');},620);
  }
  humanReturn(caught:boolean,percent:number) {
    if(this.muted)return;this.doorOpen();setTimeout(()=>{this.tone(caught?260:205,.22,.065,'triangle');this.tone(caught?390:305,.18,.045,'sine');},820);
    if(typeof speechSynthesis==='undefined')return;const line=humanReaction(caught,percent);
    setTimeout(()=>{if(this.muted)return;const utterance=new SpeechSynthesisUtterance(line),voices=speechSynthesis.getVoices(),voice=voices.find(item=>/^en-GB/i.test(item.lang))??voices.find(item=>/^en/i.test(item.lang));if(voice)utterance.voice=voice;utterance.rate=caught?1.08:.94;utterance.pitch=caught?1.12:.88;utterance.volume=.95;speechSynthesis.cancel();speechSynthesis.speak(utterance);},1050);
  }
  morph() { this.tone(280,.3,.06,'sawtooth'); setTimeout(()=>this.tone(620,.18,.04),90); }
  success() { [420,560,720].forEach((n,i)=>setTimeout(()=>this.tone(n,.2,.05),i*100)); }
  fail() { [260,180].forEach((n,i)=>setTimeout(()=>this.tone(n,.3,.05,'triangle'),i*150)); }
}
