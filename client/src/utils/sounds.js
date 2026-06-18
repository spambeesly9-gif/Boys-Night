const cache = {};

function getAudio(src) {
  if (!cache[src]) cache[src] = new Audio(src);
  return cache[src];
}

function synthClick(freq, duration, volume) {
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

export function playTypeKey() {
  synthClick(1100, 0.055, 0.07);
}

export function playBackspaceKey() {
  synthClick(650, 0.075, 0.055);
}

export function playYay() {
  try {
    const a = new Audio('/freesound_community-yay-6120.mp3');
    a.volume = 0.8;
    a.play();
  } catch {}
}

export function playFart() {
  try {
    const a = new Audio('/freesound_community-fart-83471.mp3');
    a.volume = 0.7;
    a.play();
  } catch {}
}

export function playTap() {
  try {
    const a = new Audio('/latent-rick-soft-app-button-tap-sound-3-547874.mp3');
    a.volume = 0.5;
    a.play();
  } catch {}
}

let lobbyMusic = null;

export function startLobbyMusic() {
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
      vol = Math.min(vol + 0.02, 0.3);
      lobbyMusic.volume = vol;
      if (vol >= 0.3) clearInterval(fade);
    }, 80);
  } catch {}
}

export function stopLobbyMusic() {
  if (!lobbyMusic) return;
  let vol = lobbyMusic.volume;
  const fade = setInterval(() => {
    vol = Math.max(vol - 0.02, 0);
    lobbyMusic.volume = vol;
    if (vol <= 0) {
      clearInterval(fade);
      lobbyMusic.pause();
      lobbyMusic.currentTime = 0;
    }
  }, 60);
}
