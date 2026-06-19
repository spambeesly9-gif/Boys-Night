import { playTap } from '../../utils/sounds';
const RANK_COLORS = ['text-amber-600', 'text-gray-400', 'text-orange-500'];

export default function ScoreboardScreen({ players, round, isFinal, isEndless, isHost, onNext, onEnd, myId }) {
  const sorted = [...players].sort((a, b) => b.score - a.score);
  const roundLabel = `Round ${round}`;
  const nextLabel = isFinal ? 'See who won →' : `Start Round ${round + 1} →`;

  const ROASTS = [
    "Someone should be embarrassed right now.",
    "This is a safe space. Kind of.",
    "These scores are a cry for help.",
    "At least you showed up.",
  ];
  const roast = ROASTS[round % ROASTS.length];

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <p className="font-body font-bold text-gray-500 text-xs uppercase tracking-widest mb-2">After {roundLabel}</p>
          <h2 className="font-display text-5xl font-black italic text-gray-900">Scoreboard</h2>
          <p className="font-body text-gray-500 text-sm mt-2">{roast}</p>
        </div>

        <div className="bg-cream-dark rounded-2xl border-2 border-brand-red/20 overflow-hidden mb-6">
          {sorted.map((p, i) => (
            <div
              key={p.id}
              className={`flex items-center gap-4 px-6 py-4 border-b border-brand-red/10 last:border-0 ${p.id === myId ? 'bg-brand-red/5' : ''}`}
            >
              <span className={`font-display font-bold text-xl w-8 text-center ${RANK_COLORS[i] ?? 'text-gray-400'}`}>
                {i + 1}
              </span>
              <span className={`font-body font-bold flex-1 text-lg ${p.id === myId ? 'text-brand-red' : 'text-gray-800'}`}>
                {p.name}
                {p.id === myId && <span className="text-xs ml-2 bg-brand-red/10 text-brand-red px-2 py-0.5 rounded-full">you</span>}
              </span>
              <span className="font-display font-bold text-xl text-gray-900">{p.score.toLocaleString()}</span>
            </div>
          ))}
        </div>

        {isHost ? (
          <div className="flex gap-3">
            <button
              onClick={() => { playTap(); onNext(); }}
              className="flex-1 bg-brand-red text-cream font-display font-black italic text-xl rounded-xl py-4 transition-all hover:bg-red-900 active:scale-[0.98]"
            >
              {nextLabel}
            </button>
            {(isEndless || !isFinal) && onEnd && (
              <button
                onClick={() => { playTap(); onEnd(); }}
                className="bg-cream-dark border-2 border-brand-red/20 text-gray-600 font-body font-bold rounded-xl px-5 py-4 hover:border-brand-red transition-all text-sm"
              >
                End Game
              </button>
            )}
          </div>
        ) : (
          <div className="text-center font-body font-semibold text-gray-400 text-base py-4">
            Waiting for the Game Daddy to stop celebrating…
          </div>
        )}
      </div>
    </div>
  );
}
