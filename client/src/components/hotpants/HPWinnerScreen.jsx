import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { playYay, playTap } from '../../utils/sounds';

const COLORS = ['#A82020', '#2563EB', '#F59E0B', '#10B981', '#7C3AED', '#EA580C'];

function Confetti() {
  useEffect(() => {
    const el = document.createElement('div');
    el.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;overflow:hidden';
    document.body.appendChild(el);

    Array.from({ length: 80 }, (_, i) => {
      const div = document.createElement('div');
      div.style.cssText = `
        position:absolute;width:${8 + Math.random() * 8}px;height:${8 + Math.random() * 8}px;
        background:${COLORS[i % COLORS.length]};
        left:${Math.random() * 100}%;top:-20px;border-radius:2px;
        animation:confetti-fall ${1.5 + Math.random() * 2}s ${Math.random() * 0.8}s linear forwards;
      `;
      el.appendChild(div);
    });

    const t = setTimeout(() => el.remove(), 5000);
    return () => { clearTimeout(t); el.remove(); };
  }, []);

  return null;
}

const WINNER_LINES = [
  "The liar with the highest score. A legend.",
  "Your friends are worse liars than you thought. Except you.",
  "One of you should not be trusted. Ever.",
];

export default function HPWinnerScreen({ players, myId }) {
  const navigate = useNavigate();
  const sorted = [...players].sort((a, b) => b.score - a.score);

  useEffect(() => { playYay(); }, []);

  const winner = sorted[0];
  const isWinner = winner?.id === myId;

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-4 py-12">
      <Confetti />

      <div className="w-full max-w-md text-center">
        <div className="mb-8">
          <div className="text-6xl mb-4">🏆</div>
          <p className="font-body font-bold text-gray-500 text-xs uppercase tracking-widest mb-2">Game over</p>
          <h1 className="font-display text-5xl font-black italic text-gray-900 mb-2">
            {winner?.name} wins
          </h1>
          {isWinner ? (
            <p className="font-display text-xl italic text-brand-red mt-1">
              The best liar in the room. That's you.
            </p>
          ) : (
            <p className="font-display text-xl italic text-gray-500 mt-1">
              {WINNER_LINES[Math.floor(Math.random() * WINNER_LINES.length)]}
            </p>
          )}
        </div>

        <div className="bg-cream-dark rounded-2xl border-2 border-brand-red/20 overflow-hidden mb-8">
          {sorted.map((p, i) => {
            const medals = ['🥇', '🥈', '🥉'];
            const isMe = p.id === myId;
            return (
              <div
                key={p.id}
                className={`flex items-center gap-4 px-6 py-4 border-b border-brand-red/10 last:border-0 ${
                  i === 0 ? 'bg-amber-50' : isMe ? 'bg-brand-red/5' : ''
                }`}
              >
                <span className="text-2xl w-8 text-center">
                  {medals[i] ?? (
                    <span className="font-display font-bold text-gray-400">{i + 1}</span>
                  )}
                </span>
                <span
                  className={`font-body font-bold flex-1 text-lg ${
                    i === 0 ? 'text-amber-700' : isMe ? 'text-brand-red' : 'text-gray-800'
                  }`}
                >
                  {p.name}
                  {isMe && (
                    <span className="text-xs ml-2 bg-brand-red/10 text-brand-red px-2 py-0.5 rounded-full">
                      you
                    </span>
                  )}
                </span>
                <span
                  className={`font-display font-bold text-xl italic ${
                    i === 0 ? 'text-amber-700' : 'text-gray-900'
                  }`}
                >
                  {p.score.toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => { playTap(); navigate('/hotpants'); }}
            className="flex-1 bg-brand-red text-cream font-display font-black italic text-lg rounded-xl py-3.5 transition-all hover:bg-red-900 active:scale-[0.98]"
          >
            Run it back
          </button>
          <button
            onClick={() => { playTap(); navigate('/'); }}
            className="flex-1 bg-cream-dark border-2 border-brand-red/20 text-gray-700 font-display font-bold italic text-lg rounded-xl py-3.5 transition-all hover:border-brand-red active:scale-[0.98]"
          >
            Home
          </button>
        </div>
      </div>
    </div>
  );
}
