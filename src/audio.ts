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
  warning() { this.tone(520,.12,.05); }
  morph() { this.tone(280,.3,.06,'sawtooth'); setTimeout(()=>this.tone(620,.18,.04),90); }
  success() { [420,560,720].forEach((n,i)=>setTimeout(()=>this.tone(n,.2,.05),i*100)); }
  fail() { [260,180].forEach((n,i)=>setTimeout(()=>this.tone(n,.3,.05,'triangle'),i*150)); }
}
