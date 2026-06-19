import { useState, useEffect } from 'react';
import { playTap } from '../../utils/sounds';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function HPReveal({ answers, mainQuestion, round, czarId, myId, isHost, onStartVoting }) {
  const iAmCzar = myId === czarId;

  // Randomise reveal order once on mount
  const [order] = useState(() => shuffle(answers));
  const [revealedCount, setRevealedCount] = useState(0);
  const [showQuestion, setShowQuestion] = useState(false);

  const allRevealed = revealedCount >= order.length;

  // 1 — show question after short pause
  useEffect(() => {
    const t = setTimeout(() => setShowQuestion(true), 600);
    return () => clearTimeout(t);
  }, []);

  // 2 — reveal answers one by one after question appears
  useEffect(() => {
    if (!showQuestion || allRevealed) return;
    const delay = revealedCount === 0 ? 1400 : 2000;
    const t = setTimeout(() => setRevealedCount(c => c + 1), delay);
    return () => clearTimeout(t);
  }, [showQuestion, revealedCount, allRevealed]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-start px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <p className="font-body font-bold text-gray-400 text-xs uppercase tracking-widest mb-2">
            Round {round} — The Reveal
          </p>
          <h1 className="font-display text-3xl font-bold italic text-gray-900">
            The answers are in.
          </h1>
          <p className="font-body text-gray-500 text-sm mt-1">
            Talk it out. Who doesn't fit?
          </p>
        </div>

        {/* Question */}
        <div
          className={`bg-hp-light border-2 border-hp-border rounded-2xl p-5 mb-6 transition-all duration-500 ${
            showQuestion ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
          }`}
        >
          <p className="font-body font-bold text-hp-accent text-xs uppercase tracking-widest mb-2">
            The question was…
          </p>
          <p className="font-display text-xl font-bold italic text-gray-900 leading-snug">
            {mainQuestion}
          </p>
        </div>

        {/* Answers — sequential */}
        <div className="space-y-3 mb-8">
          {order.map((a, idx) => {
            const revealed = idx < revealedCount;
            return (
              <div
                key={a.playerId}
                className={`rounded-2xl border-2 p-5 transition-all duration-500 ${
                  revealed
                    ? 'opacity-100 translate-y-0 border-gray-200 bg-cream-dark'
                    : 'opacity-0 translate-y-4 border-transparent'
                }`}
                style={{ transitionDelay: '0ms' }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-body font-bold text-hp-accent text-sm">{a.playerName}</span>
                  {a.playerId === myId && (
                    <span className="text-xs bg-hp-accent/10 text-hp-accent px-2 py-0.5 rounded-full font-body font-bold">
                      you
                    </span>
                  )}
                </div>
                <p className="font-body font-semibold text-gray-800 text-base leading-snug">
                  {a.answer}
                </p>
              </div>
            );
          })}

          {/* "Still revealing..." indicator */}
          {!allRevealed && showQuestion && (
            <div className="flex items-center gap-2 px-5 py-4">
              <div className="w-2 h-2 bg-hp-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-hp-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-hp-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              <span className="font-body text-gray-400 text-sm ml-1">Revealing…</span>
            </div>
          )}
        </div>

        {/* Action area — only after all revealed */}
        {allRevealed && (
          <div
            className={`transition-all duration-500 ${allRevealed ? 'opacity-100' : 'opacity-0'}`}
          >
            {iAmCzar ? (
              <div className="space-y-3">
                <p className="text-center font-body font-semibold text-gray-500 text-sm">
                  Discuss, then start voting when you're ready.
                </p>
                <button
                  onClick={() => { playTap(); onStartVoting(); }}
                  className="w-full bg-hp-accent text-white font-display font-bold italic text-xl rounded-xl py-4 transition-all hover:opacity-90 active:scale-[0.98]"
                >
                  Start Voting →
                </button>
              </div>
            ) : (
              <div className="bg-cream-dark rounded-2xl border-2 border-hp-border p-5 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-hp-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-hp-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-hp-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <p className="font-body font-semibold text-gray-500 text-sm">
                  Waiting for the Game Daddy to start voting…
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
