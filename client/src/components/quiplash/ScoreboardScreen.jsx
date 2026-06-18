const MEDALS = ['🥇', '🥈', '🥉'];

export default function ScoreboardScreen({ players, round, isFinal, isHost, onNext, myId }) {
  const sorted = [...players].sort((a, b) => b.score - a.score);
  const roundLabel = round === 3 ? 'Final Round' : `Round ${round}`;
  const nextLabel = isFinal ? 'See Winner →' : `Start Round ${round + 1} →`;

  return (
    <div className="min-h-screen bg-[#f8f7ff] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Title */}
        <div className="text-center mb-8">
          <p className="font-body font-bold text-gray-400 text-xs uppercase tracking-widest mb-2">
            After {roundLabel}
          </p>
          <h2 className="font-display text-5xl font-semibold text-gray-900">Scoreboard</h2>
        </div>

        {/* Rankings */}
        <div className="bg-white rounded-3xl border-2 border-gray-100 overflow-hidden shadow-sm mb-6">
          {sorted.map((p, i) => {
            const isMe = p.id === myId;
            return (
              <div
                key={p.id}
                className={`
                  flex items-center gap-4 px-6 py-4 border-b border-gray-50 last:border-0
                  ${isMe ? 'bg-red-50' : ''}
                `}
              >
                <span className="text-2xl w-8 text-center">
                  {i < 3 ? MEDALS[i] : <span className="font-display font-semibold text-gray-400">{i + 1}</span>}
                </span>
                <span className={`font-body font-bold flex-1 text-lg ${isMe ? 'text-brand-red' : 'text-gray-800'}`}>
                  {p.name}
                  {isMe && <span className="text-xs ml-2 bg-red-100 text-brand-red px-2 py-0.5 rounded-full">you</span>}
                </span>
                <span className="font-display font-semibold text-xl text-gray-900">
                  {p.score.toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>

        {/* Action */}
        {isHost ? (
          <button
            onClick={onNext}
            className="w-full bg-brand-red text-white font-display font-semibold text-xl rounded-2xl py-4 transition-all hover:bg-red-600 active:scale-[0.98] shadow-sm"
          >
            {nextLabel}
          </button>
        ) : (
          <div className="text-center font-body font-semibold text-gray-400 text-lg py-4">
            ⏳ Waiting for host to continue…
          </div>
        )}
      </div>
    </div>
  );
}
