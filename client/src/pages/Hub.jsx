import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { playFart, playTypeKey, playBackspaceKey } from '../utils/sounds';

// Typewriter sequence: type "Bang Sesh" → pause → backspace → type "Boys Night"
const PHASE1 = ['B','Ba','Ban','Bang','Bang ','Bang S','Bang Se','Bang Ses','Bang Sesh'];
const PHASE2 = ['Bang Ses','Bang Se','Bang S','Bang ','Bang','Ban','Ba','B',''];
const PHASE3 = ['B','Bo','Boy','Boys','Boys ','Boys N','Boys Ni','Boys Nig','Boys Nigh','Boys Night'];

function useTypewriter() {
  const alreadyPlayed = sessionStorage.getItem('twDone') === '1';
  const [text, setText] = useState(alreadyPlayed ? 'Boys Night' : '');
  const [done, setDone] = useState(alreadyPlayed);

  useEffect(() => {
    if (alreadyPlayed) return;

    let i = 0;
    let phase = 1;
    let timerId;

    function tick() {
      if (phase === 1) {
        setText(PHASE1[i]);
        playTypeKey();
        i++;
        if (i >= PHASE1.length) { phase = 2; i = 0; timerId = setTimeout(tick, 700); return; }
        timerId = setTimeout(tick, 90);
      } else if (phase === 2) {
        setText(PHASE2[i]);
        playBackspaceKey();
        i++;
        if (i >= PHASE2.length) { phase = 3; i = 0; timerId = setTimeout(tick, 120); return; }
        timerId = setTimeout(tick, 60);
      } else {
        setText(PHASE3[i]);
        playTypeKey();
        i++;
        if (i >= PHASE3.length) {
          setDone(true);
          sessionStorage.setItem('twDone', '1');
          return;
        }
        timerId = setTimeout(tick, 100);
      }
    }
    timerId = setTimeout(tick, 400);
    return () => clearTimeout(timerId);
  }, []);

  return { text, done };
}

const GAMES = [
  {
    slug: 'quiplash',
    name: 'Quiplash',
    description: 'Write the funniest answer. Pray your friends have taste.',
    players: '3–8 players',
    emoji: '🎤',
    headerBg: '#FFF1F1',
    accentColor: '#A82020',
    borderColor: '#F5C6C6',
    tag: 'Comedy',
  },
  {
    slug: 'hotpants',
    name: 'Hot Pants',
    description: 'One of you is a liar. Everyone else has to figure out who.',
    players: '3–8 players',
    emoji: '🕵️',
    headerBg: '#F5F3FF',
    accentColor: '#6D28D9',
    borderColor: '#C4B5FD',
    tag: 'Deception',
  },
];

export default function Hub() {
  const navigate = useNavigate();
  const { text, done } = useTypewriter();

  const handleGameClick = (slug) => {
    playFart();
    setTimeout(() => navigate(`/${slug}`), 350);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="pt-16 pb-8 text-center px-4">
        <h1 className="font-display text-7xl md:text-8xl font-bold italic text-brand-red leading-none tracking-tight min-h-[1.2em]">
          {text}
          {!done && <span className="animate-pulse">|</span>}
        </h1>
        <p className="font-body font-bold text-gray-500 text-base mt-4">
          The few hours where you actually feel something.
        </p>
      </header>

      {/* Divider */}
      <div className="w-full max-w-3xl mx-auto px-6 mb-10">
        <div className="h-px bg-gray-200" />
        <p className="text-center text-xs font-body font-bold text-gray-400 mt-4 uppercase tracking-widest">
          Stop fu**ing around and pick one
        </p>
      </div>

      {/* Game cards */}
      <main className="flex-1 flex justify-center px-6 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl w-full">
          {GAMES.map((game) => (
            <button
              key={game.slug}
              onClick={() => handleGameClick(game.slug)}
              style={{ borderColor: game.borderColor }}
              className="group rounded-3xl border-2 overflow-hidden text-left transition-all duration-200 hover:-translate-y-1.5 hover:shadow-xl active:scale-[0.98] cursor-pointer bg-white"
            >
              {/* Coloured header with big emoji */}
              <div
                className="h-36 flex items-center justify-center relative overflow-hidden"
                style={{ backgroundColor: game.headerBg }}
              >
                <span className="text-7xl transition-transform duration-300 group-hover:scale-110 select-none">
                  {game.emoji}
                </span>
                <span
                  className="absolute top-3 right-3 text-xs font-body font-black uppercase tracking-widest px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: game.accentColor + '18', color: game.accentColor }}
                >
                  {game.tag}
                </span>
              </div>

              {/* Content */}
              <div className="p-6">
                <h2
                  className="font-display text-2xl font-bold mb-1.5"
                  style={{ color: game.accentColor }}
                >
                  {game.name}
                </h2>
                <p className="font-body text-gray-500 text-sm leading-relaxed mb-5">
                  {game.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-body font-bold text-gray-400 border border-gray-200 rounded-full px-3 py-1">
                    {game.players}
                  </span>
                  <span
                    className="text-sm font-body font-bold group-hover:translate-x-1 transition-transform"
                    style={{ color: game.accentColor }}
                  >
                    Play →
                  </span>
                </div>
              </div>
            </button>
          ))}

          {/* More coming */}
          <div className="rounded-3xl border-2 border-dashed border-gray-200 p-8 flex flex-col items-start justify-center">
            <p className="text-3xl mb-3">🃏</p>
            <h2 className="font-display text-xl font-bold italic text-gray-400 mb-1">More coming</h2>
            <p className="font-body text-gray-400 text-sm">When we feel like it.</p>
          </div>
        </div>
      </main>

      <footer className="text-center pb-8 text-gray-400 text-xs font-body">
        No boundaries exist past this point.
      </footer>
    </div>
  );
}
