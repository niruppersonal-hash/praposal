// Web Audio API Synthesizer for Romantic Web App Sound Effects & Background Music

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.bgGain = null;
    this.bgOscillators = [];
    this.isPlayingBg = false;
    this.musicTempo = 90;
    this.sequenceIndex = 0;
    this.seqTimer = null;
  }

  initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.bgGain && this.ctx) {
      this.bgGain.gain.setTargetAtTime(this.isMuted ? 0 : 0.12, this.ctx.currentTime, 0.1);
    }
    return this.isMuted;
  }

  // Play delicate romantic chime
  playChime(freq = 523.25) { // C5
    if (this.isMuted) return;
    this.initCtx();
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.3);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.15, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.55);
  }

  // Envelope Opening Sound
  playEnvelopeOpen() {
    if (this.isMuted) return;
    this.initCtx();
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.25);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.38);
  }

  // Heart Pop Sound effect for choice cards
  playPop() {
    if (this.isMuted) return;
    this.initCtx();
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.12);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.16);
  }

  // Playful Dodge Boing sound for "Shayad Nahi"
  playBoing() {
    if (this.isMuted) return;
    this.initCtx();
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.linearRampToValueAtTime(150, now + 0.1);
    osc.frequency.linearRampToValueAtTime(450, now + 0.2);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  // Celebration Fanfare tune when She Says YES!
  playFanfare() {
    if (this.isMuted) return;
    this.initCtx();

    // Notes sequence: C4, E4, G4, C5, E5, G5, C6
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = idx === notes.length - 1 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.2, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + (idx === notes.length - 1 ? 1.5 : 0.4));

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + (idx === notes.length - 1 ? 1.6 : 0.45));
      }, idx * 120);
    });
  }

  // Start romantic background music synth loop
  startBgMusic() {
    if (this.isPlayingBg) return;
    this.initCtx();
    this.isPlayingBg = true;

    this.bgGain = this.ctx.createGain();
    this.bgGain.gain.setValueAtTime(this.isMuted ? 0 : 0.1, this.ctx.currentTime);
    this.bgGain.connect(this.ctx.destination);

    // Warm chord progression (Cmaj7 - Am7 - Fmaj7 - G7)
    const chords = [
      [261.63, 329.63, 392.00, 493.88], // Cmaj7
      [220.00, 261.63, 329.63, 392.00], // Am7
      [174.61, 261.63, 329.63, 440.00], // Fmaj7
      [196.00, 246.94, 293.66, 349.23]  // G7
    ];

    let chordIdx = 0;
    const playNextChord = () => {
      if (!this.isPlayingBg) return;
      const now = this.ctx.currentTime;
      const currentChord = chords[chordIdx % chords.length];

      currentChord.forEach((freq) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.04, now + 0.8);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);

        osc.connect(gain);
        gain.connect(this.bgGain);

        osc.start(now);
        osc.stop(now + 3.3);
      });

      chordIdx++;
      this.seqTimer = setTimeout(playNextChord, 3200);
    };

    playNextChord();
  }

  stopBgMusic() {
    this.isPlayingBg = false;
    if (this.seqTimer) {
      clearTimeout(this.seqTimer);
      this.seqTimer = null;
    }
  }
}

export const soundEngine = new SoundEngine();
