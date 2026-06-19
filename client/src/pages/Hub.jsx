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
        <h1 className="font-display text-7xl md:text-8xl font-bold italic text-brand-red leading-none tracking-tight min-h-[1.2em] inline-flex items-center gap-4">
          <span>
            {text}
            {!done && <span className="animate-pulse">|</span>}
          </span>
          {done && (
            <img src="/favicon.svg" alt="" className="h-[0.85em] w-auto inline-block" />
          )}
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

          {/* ── Quiplash — comedy-poster: black header, ghost quotation mark ── */}
          <button
            onClick={() => handleGameClick('quiplash')}
            className="group rounded-3xl border border-gray-200 overflow-hidden text-left transition-all duration-200 hover:-translate-y-1.5 hover:shadow-xl active:scale-[0.98] cursor-pointer bg-white"
          >
            <div className="h-44 bg-gray-950 relative overflow-hidden flex flex-col justify-end px-6 pb-5">
              <span
                className="absolute font-display font-black text-white/[0.06] leading-none select-none pointer-events-none"
                style={{ fontSize: '220px', top: '-30px', left: '-10px', lineHeight: 1 }}
              >
                "
              </span>
              <h2 className="font-display text-4xl font-bold text-white relative z-10">
                Quiplash
              </h2>
              <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-brand-red" />
            </div>
            <div className="p-6">
              <p className="font-body text-gray-500 text-sm leading-relaxed mb-6">
                Write the funniest answer. Pray your friends have taste.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs font-body font-semibold text-gray-400">3–8 players</span>
                <span className="text-sm font-body font-bold text-brand-red group-hover:translate-x-1 transition-transform">
                  Play →
                </span>
              </div>
            </div>
          </button>

          {/* ── Hot Pants — caution tape: diagonal stripe header ── */}
          <button
            onClick={() => handleGameClick('hotpants')}
            className="group rounded-3xl border border-gray-200 overflow-hidden text-left transition-all duration-200 hover:-translate-y-1.5 hover:shadow-xl active:scale-[0.98] cursor-pointer bg-white"
          >
            <div
              className="h-44 relative overflow-hidden flex flex-col justify-end px-6 pb-5"
              style={{
                background: 'repeating-linear-gradient(135deg, #1e1b4b 0px, #1e1b4b 14px, #2e1065 14px, #2e1065 28px)',
              }}
            >
              <h2
                className="font-display text-4xl font-bold text-white relative z-10"
                style={{ letterSpacing: '0.04em' }}
              >
                Hot Pants
              </h2>
              <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-violet-400" />
            </div>
            <div className="p-6">
              <p className="font-body text-gray-500 text-sm leading-relaxed mb-6">
                One of you is a liar. Everyone else has to figure out who.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs font-body font-semibold text-gray-400">3–8 players</span>
                <span className="text-sm font-body font-bold text-violet-700 group-hover:translate-x-1 transition-transform">
                  Play →
                </span>
              </div>
            </div>
          </button>

          {/* ── More coming ── */}
          <div className="rounded-3xl border-2 border-dashed border-gray-200 p-8 flex flex-col justify-end min-h-[200px]">
            <h2 className="font-display text-xl font-bold italic text-gray-300 mb-1">More coming</h2>
            <p className="font-body text-gray-300 text-sm">When we feel like it.</p>
          </div>
        </div>
      </main>

      <footer className="text-center pb-8 text-gray-400 text-xs font-body">
        No boundaries exist past this point.
      </footer>
    </div>
  );
}
