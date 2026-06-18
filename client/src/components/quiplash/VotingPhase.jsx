import { useState } from 'react';
import CountdownTimer from './CountdownTimer';

export default function VotingPhase({
  promptId,
  promptText,
  assignedPlayerIds,
  answers,
  promptIndex,
  totalPrompts,
  duration,
  round,
  myId,
  voteTally,
  onVote,
  players,
}) {
  const [voted, setVoted] = useState(null);

  const canVote = !assignedPlayerIds.includes(myId);

  const totalVotes = Object.values(voteTally).reduce((s, n) => s + n, 0);

  const handleVote = (forPlayerId) => {
    if (!canVote || voted) return;
    setVoted(forPlayerId);
    onVote(promptId, forPlayerId);
  };

  const roundLabel = round === 3 ? 'Final Round' : `Round ${round}`;

  return (
    <div className="min-h-screen bg-[#f8f7ff] flex flex-col">
      {/* Shared header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <span className="font-body font-bold text-gray-400 text-xs uppercase tracking-widest">
              Prompt {promptIndex + 1} of {totalPrompts} · {roundLabel}
            </span>
            <p className="font-display text-xl font-semibold text-gray-900 mt-1">
              Which answer is funnier?
            </p>
          </div>
          <CountdownTimer duration={duration} key={promptId} />
        </div>
      </div>

      {/* Prompt */}
      <div className="bg-white border-b border-gray-100 px-6 py-5">
        <div className="max-w-2xl mx-auto">
          <p className="font-display text-2xl font-semibold text-gray-900 text-center leading-snug">
            {promptText}
          </p>
        </div>
      </div>

      {/* Answers */}
      <div className="flex-1 flex flex-col justify-center px-4 py-8">
        <div className="max-w-2xl mx-auto w-full space-y-4">
          {answers.map((answer, i) => {
            const label = i === 0 ? 'A' : 'B';
            const voteCount = voteTally[answer.playerId] ?? 0;
            const isMyVote = voted === answer.playerId;
            const votePct = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;

            return (
              <button
                key={answer.playerId}
                onClick={() => handleVote(answer.playerId)}
                disabled={!canVote || !!voted}
                className={`
                  w-full text-left rounded-3xl border-2 p-6 transition-all font-body
                  ${isMyVote
                    ? 'border-brand-blue bg-blue-50 shadow-md scale-[1.01]'
                    : canVote && !voted
                      ? 'border-gray-200 bg-white hover:border-brand-blue hover:shadow-md hover:-translate-y-0.5 cursor-pointer'
                      : 'border-gray-100 bg-gray-50 cursor-default'}
                `}
              >
                <div className="flex items-start gap-4">
                  <span
                    className={`
                      flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-display font-semibold text-lg
                      ${isMyVote ? 'bg-brand-blue text-white' : 'bg-gray-100 text-gray-500'}
                    `}
                  >
                    {label}
                  </span>
                  <p className="font-semibold text-gray-800 text-lg leading-snug flex-1 pt-1">
                    {answer.text}
                  </p>
                </div>

                {/* Live vote bar */}
                {totalVotes > 0 && (
                  <div className="mt-4">
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-blue rounded-full transition-all duration-500"
                        style={{ width: `${votePct}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{voteCount} vote{voteCount !== 1 ? 's' : ''}</p>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Status message */}
        <div className="max-w-2xl mx-auto w-full mt-6 text-center">
          {!canVote ? (
            <p className="font-body font-bold text-gray-400">
              You wrote one of these — no cheating 😄
            </p>
          ) : voted ? (
            <p className="font-body font-bold text-brand-green">
              ✓ Vote cast! Waiting for others…
            </p>
          ) : (
            <p className="font-body font-bold text-gray-400">
              Tap the answer you like best
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
