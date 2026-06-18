import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const COLORS = ['#E63946', '#2563EB', '#F59E0B', '#10B981', '#7C3AED', '#EA580C'];

function Confetti() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const particles = Array.from({ length: 80 }, (_, i) => ({
      x: Math.random() * window.innerWidth,
      y: -20,
      size: 8 + Math.random() * 8,
      color: COLORS[i % COLORS.length],
      speed: 2 + Math.random() * 3,
      angle: Math.random() * 360,
      spin: (Math.random() - 0.5) * 5,
      sway: (Math.random() - 0.5) * 2,
    }));

    const el = document.createElement('div');
    el.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;overflow:hidden';
    document.body.appendChild(el);

    particles.forEach(p => {
      const div = document.createElement('div');
      div.style.cssText = `
        position:absolute;
        width:${p.size}px;height:${p.size}px;
        background:${p.color};
        left:${p.x}px;top:${p.y}px;
        border-radius:2px;
        transform:rotate(${p.angle}deg);
        animation:confetti-fall ${1.5 + Math.random() * 2}s ${Math.random() * 0.8}s linear forwards;
      `;
      el.appendChild(div);
    });

    const timeout = setTimeout(() => {
      el.remove();
    }, 5000);

    return () => { clearTimeout(timeout); el.remove(); };
  }, []);

  return null;
}

export default function WinnerScreen({ players, myId }) {
  const navigate = useNavigate();
  const sorted = [...players].sort((a, b) => b.score - a.score);
  const winner = sorted[0];
  const isWinner = winner?.id === myId;

  return (
    <div className="min-h-screen bg-[#f8f7ff] flex flex-col items-center justify-center px-4 py-12">
      <Confetti />

      <div className="w-full max-w-md text-center">
        {/* Winner announcement */}
        <div className="mb-8">
          <div className="text-6xl mb-4 animate-bounce">🏆</div>
          <p className="font-body font-bold text-gray-400 text-sm uppercase tracking-widest mb-2">
            Game over
          </p>
          <h1 className="font-display text-5xl font-semibold text-gray-900 mb-2">
            {winner?.name} wins!
          </h1>
          {isWinner && (
            <p className="font-display text-2xl text-brand-red mt-1">
              That's you! 🎉
            </p>
          )}
        </div>

        {/* Podium */}
        <div className="bg-white rounded-3xl border-2 border-gray-100 overflow-hidden shadow-sm mb-8">
          {sorted.slice(0, 5).map((p, i) => {
            const medals = ['🥇', '🥈', '🥉'];
            const isMe = p.id === myId;
            return (
              <div
                key={p.id}
                className={`
                  flex items-center gap-4 px-6 py-4 border-b border-gray-50 last:border-0
                  ${i === 0 ? 'bg-amber-50' : isMe ? 'bg-red-50' : ''}
                `}
              >
                <span className="text-2xl w-8 text-center">
                  {medals[i] ?? <span className="font-display font-semibold text-gray-400">{i + 1}</span>}
                </span>
                <span className={`font-body font-bold flex-1 text-lg ${i === 0 ? 'text-amber-600' : isMe ? 'text-brand-red' : 'text-gray-800'}`}>
                  {p.name}
                  {isMe && <span className="text-xs ml-2 bg-red-100 text-brand-red px-2 py-0.5 rounded-full">you</span>}
                </span>
                <span className={`font-display font-semibold text-xl ${i === 0 ? 'text-amber-600' : 'text-gray-900'}`}>
                  {p.score.toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/quiplash')}
            className="flex-1 bg-brand-red text-white font-display font-semibold text-lg rounded-2xl py-3.5 transition-all hover:bg-red-600 active:scale-[0.98]"
          >
            Play Again
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex-1 bg-white border-2 border-gray-200 text-gray-700 font-display font-semibold text-lg rounded-2xl py-3.5 transition-all hover:border-gray-400 active:scale-[0.98]"
          >
            Home
          </button>
        </div>
      </div>
    </div>
  );
}
