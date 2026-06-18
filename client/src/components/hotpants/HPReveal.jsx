import { playTap } from '../../utils/sounds';

export default function HPReveal({ answers, mainQuestion, round, czarId, myId, isHost, onStartVoting }) {
  const iAmCzar = myId === czarId;

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <p className="font-body font-bold text-gray-500 text-xs uppercase tracking-widest mb-2">
            Round {round} — The Reveal
          </p>
          <h1 className="font-display text-3xl font-bold italic text-gray-900 mb-2">
            Everyone's heard the answers.
          </h1>
          <p className="font-body text-gray-600 text-sm">
            Talk it out. Who's full of 🔥?
          </p>
        </div>

        {/* Main question */}
        <div className="bg-brand-red/10 border-2 border-brand-red/30 rounded-2xl p-5 mb-5">
          <p className="font-body font-bold text-brand-red text-xs uppercase tracking-widest mb-2">
            The Question
          </p>
          <p className="font-display text-xl font-bold italic text-gray-900 leading-snug">
            {mainQuestion}
          </p>
        </div>

        {/* Answers */}
        <div className="space-y-3 mb-6">
          {answers.map((a) => (
            <div
              key={a.playerId}
              className="bg-cream-dark rounded-2xl border-2 border-brand-red/20 p-5 animate-slide-up"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="font-body font-bold text-brand-red text-sm">{a.playerName}</span>
                {a.playerId === myId && (
                  <span className="text-xs bg-brand-red/10 text-brand-red px-2 py-0.5 rounded-full font-body font-bold">
                    you
                  </span>
                )}
              </div>
              <p className="font-body font-semibold text-gray-800 text-base leading-snug">
                {a.answer}
              </p>
            </div>
          ))}
        </div>

        {/* Action area */}
        {iAmCzar ? (
          <div className="space-y-3">
            <p className="text-center font-body font-semibold text-gray-500 text-sm">
              Discuss, then start voting when you're ready.
            </p>
            <button
              onClick={() => { playTap(); onStartVoting(); }}
              className="w-full bg-brand-red text-cream font-display font-bold italic text-xl rounded-xl py-4 transition-all hover:bg-red-900 active:scale-[0.98]"
            >
              Start Voting →
            </button>
          </div>
        ) : (
          <div className="bg-cream-dark rounded-2xl border-2 border-brand-red/20 p-5 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-2 h-2 bg-brand-red rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-brand-red rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-brand-red rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <p className="font-body font-semibold text-gray-500 text-sm">
              Waiting for the Czar to start voting…
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
