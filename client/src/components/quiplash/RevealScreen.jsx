import { useEffect, useState } from 'react';

export default function RevealScreen({ promptText, promptImage, answers, isQuiplash, promptIndex, totalPrompts, myId, scoreDelta }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 300);
    return () => clearTimeout(t);
  }, []);

  const maxVotes = Math.max(...answers.map(a => a.voteCount));

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <div className="bg-cream-dark border-b-2 border-brand-red/20 px-6 py-4">
        <div className="max-w-2xl mx-auto">
          <span className="font-body font-bold text-gray-500 text-xs uppercase tracking-widest">
            Reveal · Prompt {promptIndex + 1} of {totalPrompts}
          </span>
        </div>
      </div>

      {isQuiplash && (
        <div className="bg-brand-red py-4 px-6 text-center">
          <span className="font-display text-3xl font-black italic text-cream quiplash-burst inline-block">
            QUIPLASH!
          </span>
        </div>
      )}

      {promptImage ? (
        <div className="bg-gray-950">
          <div className="max-w-2xl mx-auto">
            <img src={promptImage} alt="Comic panel" className="w-full block" />
          </div>
        </div>
      ) : (
        <div className="bg-cream border-b-2 border-brand-red/10 px-6 py-6">
          <div className="max-w-2xl mx-auto text-center">
            <p className="font-display text-2xl font-bold italic text-gray-900 leading-snug">{promptText}</p>
          </div>
        </div>
      )}

      <div className="flex-1 px-4 py-8 overflow-y-auto">
        <div className="max-w-2xl mx-auto space-y-4">
          {answers.map((answer, i) => {
            const isWinner = answer.voteCount === maxVotes && answer.voteCount > 0;
            const isMe = answer.playerId === myId;
            const label = String.fromCharCode(65 + i); // A, B, C...

            return (
              <div
                key={answer.playerId}
                className={`
                  bg-cream-dark rounded-2xl border-2 p-6
                  ${answer.isQuiplash ? 'border-brand-red bg-brand-red/5' : isWinner ? 'border-green-400' : 'border-brand-red/20'}
                  ${show ? 'animate-slide-up' : 'opacity-0'}
                `}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {promptImage && (
                      <span className="font-display font-black italic text-gray-300 text-4xl leading-none mr-3 float-left">{label}</span>
                    )}
                    <p className="font-body font-semibold text-gray-800 text-lg leading-snug mb-3">{answer.text}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-body font-bold ${isMe ? 'bg-brand-red/10 text-brand-red' : 'bg-cream text-gray-600 border border-gray-200'}`}>
                        {answer.playerName}{isMe && ' (you)'}{answer.isSafetyQuip ? ' — no-show' : ''}
                      </span>
                      <span className="text-sm font-body text-gray-500">
                        {answer.voteCount} vote{answer.voteCount !== 1 ? 's' : ''}
                      </span>
                      {answer.isQuiplash && (
                        <span className="bg-brand-red text-cream text-xs font-body font-bold px-2 py-0.5 rounded-full">QUIPLASH!</span>
                      )}
                    </div>
                    {answer.voters && answer.voters.length > 0 && (
                      <p className="text-xs font-body text-gray-400 mt-1.5">
                        Voted by: {answer.voters.join(', ')}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className={`font-display font-bold text-2xl italic ${answer.points > 0 ? 'text-green-700' : 'text-gray-300'} ${isMe && answer.points > 0 ? 'score-pop' : ''}`}>
                      +{answer.points.toLocaleString()}
                    </span>
                    <p className="text-xs font-body text-gray-400">pts</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {scoreDelta != null && scoreDelta > 0 && (
          <div className="max-w-2xl mx-auto mt-6 text-center">
            <div className="inline-block bg-brand-red text-cream font-display font-black italic text-xl px-6 py-3 rounded-xl score-pop">
              +{scoreDelta.toLocaleString()} pts. Not bad.
            </div>
          </div>
        )}

        <p className="text-center font-body text-gray-400 mt-8 text-sm">Next prompt incoming…</p>
      </div>
    </div>
  );
}
