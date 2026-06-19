import { useState } from 'react';
import CountdownTimer from './CountdownTimer';
import { playTap } from '../../utils/sounds';

export default function VotingPhase({ promptId, promptText, promptImage, assignedPlayerIds, answers, promptIndex, totalPrompts, duration, round, myId, voteTally, onVote, isAllPlay }) {
  const [voted, setVoted] = useState(null);

  const canVote = isAllPlay || !assignedPlayerIds.includes(myId);
  const votedCount = Object.values(voteTally).reduce((s, n) => s + n, 0);
  const roundLabel = `Round ${round}`;

  const handleVote = (forPlayerId) => {
    if (!canVote || voted) return;
    if (isAllPlay && forPlayerId === myId) return;
    playTap();
    setVoted(forPlayerId);
    onVote(promptId, forPlayerId);
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <div className="bg-cream-dark border-b-2 border-brand-red/20 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <span className="font-body font-bold text-gray-500 text-xs uppercase tracking-widest">
              Prompt {promptIndex + 1} of {totalPrompts} · {roundLabel}
            </span>
            <p className="font-display text-xl font-bold italic text-gray-900 mt-1">
              Which one's funnier?
            </p>
          </div>
          <CountdownTimer duration={duration} key={promptId} />
        </div>
      </div>

      {promptImage ? (
        <div className="bg-gray-950">
          <div className="max-w-2xl mx-auto">
            <img src={promptImage} alt="Comic prompt" className="w-full block" />
          </div>
        </div>
      ) : (
        <div className="bg-cream border-b-2 border-brand-red/10 px-6 py-6">
          <div className="max-w-2xl mx-auto text-center">
            <p className="font-body font-bold text-gray-900 text-2xl leading-snug">
              {promptText}
            </p>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col justify-center px-4 py-6">
        <div className="max-w-2xl mx-auto w-full space-y-4">
          {answers.map((answer, i) => {
            const label = String.fromCharCode(65 + i);
            const isMyVote = voted === answer.playerId;
            const isMyAnswer = isAllPlay && answer.playerId === myId;

            return (
              <button
                key={answer.playerId}
                onClick={() => handleVote(answer.playerId)}
                disabled={!canVote || !!voted || isMyAnswer}
                className={`
                  w-full text-left rounded-2xl border-2 p-6 transition-all font-body
                  ${isMyVote
                    ? 'border-brand-red bg-brand-red/5 shadow-md scale-[1.01]'
                    : isMyAnswer
                      ? 'border-gray-200 bg-cream-dark opacity-50 cursor-not-allowed'
                      : canVote && !voted
                        ? 'border-brand-red/30 bg-cream-dark hover:border-brand-red hover:shadow-md hover:-translate-y-0.5 cursor-pointer'
                        : 'border-brand-red/20 bg-cream-dark cursor-default'}
                `}
              >
                <div className="flex items-start gap-4">
                  <span className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-display font-black italic text-lg ${isMyVote ? 'bg-brand-red text-cream' : 'bg-cream text-gray-500 border border-gray-300'}`}>
                    {label}
                  </span>
                  <p className="font-semibold text-gray-800 text-lg leading-snug flex-1 pt-1">
                    {answer.text}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="max-w-2xl mx-auto w-full mt-6 text-center space-y-2">
          {!canVote ? (
            <p className="font-body font-bold text-gray-400">You wrote one of these. Hands to yourself.</p>
          ) : voted ? (
            <p className="font-body font-bold text-green-700">✓ Voted. Bold choice.</p>
          ) : isAllPlay ? (
            <p className="font-body font-bold text-gray-400">Vote for anyone — except yourself.</p>
          ) : (
            <p className="font-body font-bold text-gray-400">Tap the one that made you actually laugh.</p>
          )}
          {votedCount > 0 && (
            <p className="font-body text-xs text-gray-400">{votedCount} vote{votedCount !== 1 ? 's' : ''} in</p>
          )}
        </div>
      </div>
    </div>
  );
}
