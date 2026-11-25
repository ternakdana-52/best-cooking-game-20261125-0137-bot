// All sound is synthesized with WebAudio — no audio files, no network.
// A soft click for picking ingredients, a sizzle while a patty cooks, a
// bright ding when a dish is served, a low buzz for a mistake.

export function createAudio() {
  let ctx = null;
  let muted = false;
  let sizzleNodes = null;

  function ensure() {
    if (ctx === null) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      ctx = new AudioCtx();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(freq, dur, type, gain, when = 0) {
    const ac = ensure();
    if (!ac || muted) return;
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    const t = ac.currentTime + when;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g).connect(ac.destination);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  }

  return {
    get muted() { return muted; },
    toggleMute() {
      muted = !muted;
      if (muted) this.stopSizzle();
      return muted;
    },
    unlock() { ensure(); },
    click() { tone(520, 0.07, 'triangle', 0.12); },
    add() { tone(660, 0.06, 'triangle', 0.12); tone(880, 0.08, 'triangle', 0.08, 0.05); },
    grill() { tone(180, 0.15, 'sawtooth', 0.06); },
    ding() { tone(880, 0.12, 'sine', 0.16); tone(1318, 0.2, 'sine', 0.14, 0.09); },
    buzz() { tone(140, 0.22, 'square', 0.09); },
    pop() { tone(990, 0.05, 'square', 0.07); },
    startSizzle() {
      const ac = ensure();
      if (!ac || muted || sizzleNodes) return;
      const len = ac.sampleRate * 1;
      const buf = ac.createBuffer(1, len, ac.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i += 1) data[i] = Math.random() * 2 - 1;
      const src = ac.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      const filter = ac.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 3000;
      const g = ac.createGain();
      g.gain.value = 0.03;
      src.connect(filter).connect(g).connect(ac.destination);
      src.start();
      sizzleNodes = { src, g };
    },
    stopSizzle() {
      if (!sizzleNodes) return;
      try { sizzleNodes.src.stop(); } catch (e) { /* already stopped */ }
      sizzleNodes = null;
    },
  };
}
