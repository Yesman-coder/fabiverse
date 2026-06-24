// Generates 8-bit style sound effects via Web Audio API and injects
// them into Phaser's audio cache. Called once from Boot.create().
// Falls back silently if Web Audio is unavailable.

function fillTone(ch, sr, startT, dur, freq, amp, type) {
  const s0 = Math.floor(startT * sr);
  const sN = Math.min(Math.floor((startT + dur) * sr), ch.length);
  for (let i = s0; i < sN; i++) {
    const t = (i - s0) / sr;
    const env = Math.sin(Math.PI * t / dur); // half-sine fade-in/out
    let v;
    if      (type === 'sine')   v = Math.sin(2 * Math.PI * freq * t);
    else if (type === 'saw')    v = 2 * (freq * t % 1) - 1;
    else /* square */           v = Math.sin(2 * Math.PI * freq * t) >= 0 ? 1 : -1;
    ch[i] = Math.max(-1, Math.min(1, ch[i] + v * amp * env));
  }
}

const DEFS = {
  sfx_jump: [0.20, (ch, sr) => {
    fillTone(ch, sr, 0,    0.06, 200, 0.35, 'square');
    fillTone(ch, sr, 0.05, 0.10, 440, 0.30, 'square');
  }],
  sfx_collect: [0.40, (ch, sr) => {
    fillTone(ch, sr, 0,    0.08, 330, 0.35, 'sine');
    fillTone(ch, sr, 0.08, 0.08, 440, 0.35, 'sine');
    fillTone(ch, sr, 0.16, 0.12, 660, 0.38, 'sine');
  }],
  sfx_interact: [0.14, (ch, sr) => {
    fillTone(ch, sr, 0,    0.05, 380, 0.28, 'square');
    fillTone(ch, sr, 0.05, 0.07, 480, 0.28, 'square');
  }],
  sfx_caught: [0.65, (ch, sr) => {
    fillTone(ch, sr, 0,    0.14, 220, 0.38, 'square');
    fillTone(ch, sr, 0.14, 0.14, 185, 0.38, 'square');
    fillTone(ch, sr, 0.28, 0.14, 147, 0.38, 'square');
    fillTone(ch, sr, 0.42, 0.20, 110, 0.40, 'square');
  }],
  sfx_ability: [0.36, (ch, sr) => {
    fillTone(ch, sr, 0,    0.07, 330, 0.28, 'sine');
    fillTone(ch, sr, 0.07, 0.07, 440, 0.30, 'sine');
    fillTone(ch, sr, 0.14, 0.07, 550, 0.32, 'sine');
    fillTone(ch, sr, 0.21, 0.12, 880, 0.34, 'sine');
  }],
  sfx_unlock: [0.44, (ch, sr) => {
    fillTone(ch, sr, 0,    0.08, 370, 0.32, 'square');
    fillTone(ch, sr, 0.08, 0.10, 494, 0.34, 'square');
    fillTone(ch, sr, 0.18, 0.20, 740, 0.38, 'sine');
  }],
  sfx_victory: [1.20, (ch, sr) => {
    // C-E-G-C fanfare
    [[0, 0.12, 262], [0.12, 0.12, 330], [0.24, 0.12, 392],
     [0.36, 0.24, 523], [0.60, 0.55, 523]].forEach(([s, d, f]) =>
      fillTone(ch, sr, s, d, f, 0.38, 'square'));
  }],
};

export function synthSfx(scene) {
  const sm = scene.game?.sound;
  const ctx = sm?.context;
  if (!ctx) return; // HTML5 audio fallback or no sound manager
  const SR = ctx.sampleRate;

  for (const [key, [dur, fill]] of Object.entries(DEFS)) {
    if (scene.cache.audio.exists(key)) continue;
    try {
      const buf = ctx.createBuffer(1, Math.ceil(dur * SR), SR);
      fill(buf.getChannelData(0), SR);
      scene.cache.audio.add(key, buf);
    } catch (_) { /* skip if context is in bad state */ }
  }
}
