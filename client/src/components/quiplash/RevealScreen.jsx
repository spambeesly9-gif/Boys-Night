import { useEffect, useState } from 'react';

export default function RevealScreen({
  promptText,
  answers,
  isQuiplash,
  promptIndex,
  totalPrompts,
  players,
  myId,
  scoreDelta,
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-[#f8f7ff] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-2xl mx-auto">
          <span className="font-body font-bold text-gray-400 text-xs uppercase tracking-widest">
            Reveal · Prompt {promptIndex + 1} of {totalPrompts}
          </span>
        </div>
      </div>

      {/* Quiplash banner */}
      {isQuiplash && (
        <div className="bg-brand-yellow border-b-2 border-amber-400 py-4 px-6 text-center">
          <span className="font-display text-3xl font-semibold text-white quiplash-burst inline-block">
            🔥 QUIPLASH! 🔥
          </span>
        </div>
      )}

      {/* Prompt */}
      <div className="bg-white border-b border-gray-100 px-6 py-5">
        <div className="max-w-2xl mx-auto text-center">
          <p className="font-display text-2xl font-semibold text-gray-900 leading-snug">
            {promptText}
          </p>
        </div>
      </div>

      {/* Answers */}
      <div className="flex-1 px-4 py-8 overflow-y-auto">
        <div className="max-w-2xl mx-auto space-y-4">
          {answers.map((answer, i) => {
            const isWinner = answer.isQuiplash || answer.voteCount === Math.max(...answers.map(a => a.voteCount));
            const isMe = answer.playerId === myId;

            return (
              <div
                key={answer.playerId}
                className={`
                  bg-white rounded-3xl border-2 p-6 shadow-sm
                  ${answer.isQuiplash ? 'border-brand-yellow bg-amber-50' : isWinner ? 'border-brand-green bg-green-50' : 'border-gray-100'}
                  ${show ? 'animate-slide-up' : 'opacity-0'}
                `}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-body font-semibold text-gray-800 text-lg leading-snug mb-3">
                      {answer.text}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`
                          inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-body font-bold
                          ${isMe ? 'bg-red-100 text-brand-red' : 'bg-gray-100 text-gray-600'}
                        `}
                      >
                        {answer.isSafetyQuip ? '🤐' : '✍️'} {answer.playerName}
                        {isMe && ' (you)'}
                      </span>
                      <span className="text-sm font-body text-gray-500">
                        {answer.voteCount} vote{answer.voteCount !== 1 ? 's' : ''}
                      </span>
                      {answer.isQuiplash && (
                        <span className="bg-brand-yellow text-white text-xs font-body font-bold px-2 py-0.5 rounded-full">
                          QUIPLASH!
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`
                        font-display font-semibold text-2xl
                        ${answer.points > 0 ? 'text-brand-green' : 'text-gray-300'}
                        ${isMe && answer.points > 0 ? 'score-pop' : ''}
                      `}
                    >
                      +{answer.points.toLocaleString()}
                    </span>
                    <p className="text-xs font-body text-gray-400">pts</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Your delta */}
        {scoreDelta != null && scoreDelta > 0 && (
          <div className="max-w-2xl mx-auto mt-6 text-center">
            <div className="inline-block bg-brand-green text-white font-display font-semibold text-xl px-6 py-3 rounded-2xl score-pop">
              You earned +{scoreDelta.toLocaleString()} pts!
            </div>
          </div>
        )}

        <p className="text-center font-body text-gray-400 mt-8 text-sm">
          Next prompt loading…
        </p>
      </div>
    </div>
  );
}
