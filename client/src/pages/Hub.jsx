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
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Header */}
      <header className="pt-16 pb-6 text-center px-4 relative">
        <h1 className="font-display text-7xl md:text-8xl font-bold italic text-brand-red leading-none tracking-tight min-h-[1.2em]">
          {text}
          {!done && <span className="animate-pulse">|</span>}
        </h1>
        <p className="font-body font-bold text-gray-700 text-lg mt-5">
          The few hours where you actually feel something.
        </p>
      </header>

      {/* Divider */}
      <div className="w-full max-w-2xl mx-auto px-6 mb-8">
        <div className="h-px bg-gray-800/20" />
        <p className="text-center text-sm font-body font-bold text-gray-500 mt-4">
          Stop fu**ing around and pick one.
        </p>
      </div>

      {/* Game cards */}
      <main className="flex-1 flex justify-center px-6 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-4xl w-full">
          {GAMES.map((game) => (
            <button
              key={game.slug}
              onClick={() => handleGameClick(game.slug)}
              className="group relative rounded-2xl border-2 border-brand-red/40 bg-cream p-8 text-left transition-all duration-200 hover:border-brand-red hover:bg-cream-dark hover:-translate-y-1 hover:shadow-lg active:scale-[0.98] cursor-pointer"
            >
              <h2 className="font-display text-3xl font-bold text-brand-red mb-2">
                {game.name}
              </h2>
              <p className="font-body text-gray-700 text-sm leading-relaxed mb-5">
                {game.description}
              </p>
              <span className="inline-flex items-center gap-1.5 border border-gray-400/40 rounded-full px-3 py-1 text-xs font-body font-bold text-gray-500">
                {game.players}
              </span>
            </button>
          ))}

          <div className="rounded-2xl border-2 border-dashed border-gray-400/30 p-8 flex flex-col items-start justify-center">
            <h2 className="font-display text-2xl font-bold italic text-gray-400 mb-2">More coming</h2>
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
