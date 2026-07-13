export class AudioSystem {
  private context?: AudioContext;
  muted = false;

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
  warning() { this.tone(520,.12,.05); }
  morph() { this.tone(280,.3,.06,'sawtooth'); setTimeout(()=>this.tone(620,.18,.04),90); }
  success() { [420,560,720].forEach((n,i)=>setTimeout(()=>this.tone(n,.2,.05),i*100)); }
  fail() { [260,180].forEach((n,i)=>setTimeout(()=>this.tone(n,.3,.05,'triangle'),i*150)); }
}
