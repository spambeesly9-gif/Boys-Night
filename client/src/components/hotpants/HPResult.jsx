import { useEffect } from 'react';
import { playTap, playYay } from '../../utils/sounds';

export default function HPResult({
  imposterId,
  imposterName,
  imposterQuestion,
  mainQuestion,
  caught,
  tally,
  scoreDelta,
  czarId,
  czarName,
  players,
  myId,
  isHost,
  round,
  config,
  onNext,
  onEnd,
}) {
  useEffect(() => {
    if (caught) playYay();
  }, [caught]);

  const isEndless = config?.rounds === 'endless';
  const isFinalRound = !isEndless && round >= config?.rounds;

  // Sort players by tally for vote breakdown
  const sortedByVotes = [...players]
    .filter(p => p.id !== czarId)
    .sort((a, b) => (tally?.[b.id] ?? 0) - (tally?.[a.id] ?? 0));

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Caught / Escaped header */}
        <div className={`rounded-3xl border-2 p-8 mb-6 text-center ${caught ? 'bg-green-50 border-green-300' : 'bg-red-50 border-brand-red/40'}`}>
          <div className="text-5xl mb-3">{caught ? '🚨' : '🕶️'}</div>
          <h1 className={`font-display text-6xl font-black italic mb-2 ${caught ? 'text-green-700' : 'text-brand-red'}`}>
            {caught ? 'CAUGHT!' : 'ESCAPED!'}
          </h1>
          <p className="font-body font-bold text-gray-700 text-base">
            {caught
              ? `${imposterName} was exposed. The room figured it out.`
              : `${imposterName} got away with it. Smooth operator.`
            }
          </p>
        </div>

        {/* Questions reveal */}
        <div className="bg-cream-dark rounded-2xl border-2 border-brand-red/20 p-5 mb-5">
          <p className="font-body font-bold text-gray-500 text-xs uppercase tracking-widest mb-3">
            The Czar's Questions
          </p>
          <div className="space-y-3">
            <div className="bg-cream rounded-xl border border-brand-red/10 p-4">
              <p className="font-body font-bold text-gray-500 text-xs mb-1">Main (everyone else):</p>
              <p className="font-display font-bold italic text-gray-900">{mainQuestion}</p>
            </div>
            <div className="bg-brand-red/5 rounded-xl border border-brand-red/20 p-4">
              <p className="font-body font-bold text-brand-red text-xs mb-1">
                Imposter ({imposterName}):
              </p>
              <p className="font-display font-bold italic text-gray-900">{imposterQuestion}</p>
            </div>
          </div>
        </div>

        {/* Vote breakdown */}
        <div className="bg-cream-dark rounded-2xl border-2 border-brand-red/20 p-5 mb-5">
          <p className="font-body font-bold text-gray-500 text-xs uppercase tracking-widest mb-3">
            Vote Breakdown
          </p>
          <div className="space-y-2">
            {sortedByVotes.map((p) => {
              const votes = tally?.[p.id] ?? 0;
              const isImposter = p.id === imposterId;
              const isMe = p.id === myId;
              return (
                <div
                  key={p.id}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-body font-semibold ${
                    isImposter
                      ? 'bg-brand-red/10 border border-brand-red/30 text-brand-red'
                      : 'bg-cream text-gray-700'
                  }`}
                >
                  <span className="font-bold w-5 text-center">{votes}</span>
                  <span className="flex-1">
                    {p.name}
                    {isMe && <span className="text-xs ml-1.5 bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">you</span>}
                    {isImposter && <span className="text-xs ml-1.5 bg-brand-red text-cream px-1.5 py-0.5 rounded-full">imposter</span>}
                  </span>
                  <span className="text-xs text-gray-400">
                    {votes === 1 ? 'vote' : 'votes'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Score deltas */}
        <div className="bg-cream-dark rounded-2xl border-2 border-brand-red/20 p-5 mb-6">
          <p className="font-body font-bold text-gray-500 text-xs uppercase tracking-widest mb-3">
            Points This Round
          </p>
          <div className="space-y-2">
            {[...players]
              .sort((a, b) => b.score - a.score)
              .map((p) => {
                const delta = scoreDelta?.[p.id] ?? 0;
                const isMe = p.id === myId;
                return (
                  <div key={p.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-body font-semibold ${isMe ? 'bg-brand-red/5 border border-brand-red/20' : 'bg-cream'}`}>
                    <span className="flex-1 text-gray-800">
                      {p.name}
                      {isMe && <span className="text-xs ml-1.5 text-brand-red font-bold">you</span>}
                    </span>
                    {delta > 0 ? (
                      <span className="font-display font-bold text-green-600 text-lg">+{delta.toLocaleString()}</span>
                    ) : (
                      <span className="font-display font-bold text-gray-400 text-lg">—</span>
                    )}
                    <span className="text-gray-500 text-sm font-bold ml-2">
                      {p.score.toLocaleString()} total
                    </span>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Host controls */}
        {isHost ? (
          <div className="flex gap-3">
            {!isFinalRound ? (
              <button
                onClick={() => { playTap(); onNext(); }}
                className="flex-1 bg-brand-red text-cream font-display font-bold italic text-xl rounded-xl py-4 transition-all hover:bg-red-900 active:scale-[0.98]"
              >
                Next Round →
              </button>
            ) : (
              <button
                onClick={() => { playTap(); onNext(); }}
                className="flex-1 bg-brand-red text-cream font-display font-bold italic text-xl rounded-xl py-4 transition-all hover:bg-red-900 active:scale-[0.98]"
              >
                See Results →
              </button>
            )}
            {!isFinalRound && (
              <button
                onClick={() => { playTap(); onEnd(); }}
                className="bg-cream-dark border-2 border-brand-red/20 text-gray-600 font-body font-bold rounded-xl px-5 py-4 hover:border-brand-red transition-all text-sm"
              >
                End Game
              </button>
            )}
          </div>
        ) : (
          <div className="bg-cream-dark rounded-2xl border-2 border-brand-red/20 p-5 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-2 h-2 bg-brand-red rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-brand-red rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-brand-red rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <p className="font-body font-semibold text-gray-500 text-sm">
              Waiting for the host…
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
