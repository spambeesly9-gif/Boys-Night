// ── Sound toggle ─────────────────────────────────────────────────────────────
let _enabled = localStorage.getItem('bnSound') !== 'false';
export const getSoundEnabled = () => _enabled;
export const setSoundEnabled = (v) => {
  _enabled = v;
  localStorage.setItem('bnSound', v ? 'true' : 'false');
  if (!v) stopLobbyMusic();
};

// ── Synth helpers ─────────────────────────────────────────────────────────────
function synthClick(freq, duration, volume) {
  if (!_enabled) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'square';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
    osc.onended = () => ctx.close();
  } catch {}
}

export function playTypeKey()     { synthClick(1100, 0.055, 0.018); }
export function playBackspaceKey(){ synthClick(650,  0.075, 0.014); }

// ── Audio file helpers ────────────────────────────────────────────────────────
export function playYay() {
  if (!_enabled) return;
  try {
    const a = new Audio('/freesound_community-yay-6120.mp3');
    a.volume = 0.4;
    a.play().catch(() => {});
  } catch {}
}

export function playFart() {
  if (!_enabled) return;
  try {
    const a = new Audio('/freesound_community-fart-83471.mp3');
    a.volume = 0.35;
    a.play().catch(() => {});
  } catch {}
}

export function playTap() {
  if (!_enabled) return;
  try {
    const a = new Audio('/latent-rick-soft-app-button-tap-sound-3-547874.mp3');
    a.volume = 0.25;
    a.play().catch(() => {});
  } catch {}
}

// ── Lobby music ───────────────────────────────────────────────────────────────
let lobbyMusic = null;

export function startLobbyMusic() {
  if (!_enabled) return;
  try {
    if (!lobbyMusic) {
      lobbyMusic = new Audio('/mcanden-swing-street-nights-514185.mp3');
      lobbyMusic.loop = true;
      lobbyMusic.volume = 0;
    }
    lobbyMusic.currentTime = 0;
    lobbyMusic.play().catch(() => {});

    let vol = 0;
    const fade = setInterval(() => {
      vol = Math.min(vol + 0.01, 0.15);
      lobbyMusic.volume = vol;
      if (vol >= 0.15) clearInterval(fade);
    }, 80);
  } catch {}
}

export function stopLobbyMusic() {
  if (!lobbyMusic) return;
  let vol = lobbyMusic.volume;
  const fade = setInterval(() => {
    vol = Math.max(vol - 0.01, 0);
    lobbyMusic.volume = vol;
    if (vol <= 0) {
      clearInterval(fade);
      lobbyMusic.pause();
      lobbyMusic.currentTime = 0;
    }
  }, 60);
}
