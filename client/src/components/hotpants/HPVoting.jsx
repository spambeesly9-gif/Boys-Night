import { useState } from 'react';
import { playTap } from '../../utils/sounds';
import CountdownTimer from '../quiplash/CountdownTimer';

export default function HPVoting({ answers, mainQuestion, round, duration, czarId, myId, voteTally, onVote }) {
  const [myVote, setMyVote] = useState(null);
  const iAmCzar = myId === czarId;

  const handleVote = (playerId) => {
    if (myVote || iAmCzar || playerId === myId) return;
    playTap();
    setMyVote(playerId);
    onVote(playerId);
  };

  const totalVotes = Object.values(voteTally || {}).reduce((a, b) => a + b, 0);

  if (iAmCzar) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          <div className="text-center mb-6">
            <p className="font-body font-bold text-gray-500 text-xs uppercase tracking-widest mb-2">
              Round {round} — Voting
            </p>
            <h1 className="font-display text-3xl font-bold italic text-gray-900 mb-2">
              The votes are in
            </h1>
            <p className="font-body text-gray-600 text-sm">
              You're watching, Game Daddy. No peeking at who you know is the imposter.
            </p>
          </div>

          <div className="flex justify-center mb-6">
            <CountdownTimer duration={duration} />
          </div>

          <div className="bg-brand-red/10 border-2 border-brand-red/30 rounded-2xl p-4 mb-5">
            <p className="font-body font-bold text-brand-red text-xs uppercase tracking-widest mb-1">Question</p>
            <p className="font-display text-lg font-bold italic text-gray-900">{mainQuestion}</p>
          </div>

          <div className="space-y-3">
            {answers.map((a) => {
              const votes = voteTally?.[a.playerId] ?? 0;
              const pct = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
              return (
                <div key={a.playerId} className="bg-cream-dark rounded-2xl border-2 border-brand-red/20 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-body font-bold text-gray-800">{a.playerName}</span>
                    <span className="font-display font-bold text-brand-red text-lg">{votes}</span>
                  </div>
                  <p className="font-body text-gray-600 text-sm mb-2">{a.answer}</p>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-red rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (myVote) {
    const votedFor = answers.find(a => a.playerId === myVote);
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          <div className="text-center mb-6">
            <p className="font-body font-bold text-gray-500 text-xs uppercase tracking-widest mb-2">
              Round {round} — Voting
            </p>
            <h1 className="font-display text-3xl font-bold italic text-gray-900 mb-2">
              Vote locked in
            </h1>
            <p className="font-body text-gray-600 text-sm">
              You voted for <span className="font-bold text-brand-red">{votedFor?.playerName}</span>
            </p>
          </div>

          <div className="flex justify-center mb-6">
            <CountdownTimer duration={duration} />
          </div>

          <div className="space-y-3">
            {answers.map((a) => {
              const votes = voteTally?.[a.playerId] ?? 0;
              const pct = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
              const isMyVote = a.playerId === myVote;
              return (
                <div
                  key={a.playerId}
                  className={`rounded-2xl border-2 p-4 transition-all ${
                    isMyVote
                      ? 'bg-brand-red/10 border-brand-red/40'
                      : 'bg-cream-dark border-brand-red/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-body font-bold text-gray-800">{a.playerName}</span>
                      {isMyVote && (
                        <span className="text-xs bg-brand-red text-cream px-2 py-0.5 rounded-full font-body font-bold">
                          your vote
                        </span>
                      )}
                    </div>
                    <span className="font-display font-bold text-brand-red text-lg">{votes}</span>
                  </div>
                  <p className="font-body text-gray-600 text-sm mb-2">{a.answer}</p>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-red rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Active voting
  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <p className="font-body font-bold text-gray-500 text-xs uppercase tracking-widest mb-2">
            Round {round} — Voting
          </p>
          <h1 className="font-display text-3xl font-bold italic text-gray-900 mb-2">
            Who's the imposter?
          </h1>
          <p className="font-body text-gray-600 text-sm">
            Tap the player you think has a different question.
          </p>
        </div>

        <div className="flex justify-center mb-5">
          <CountdownTimer duration={duration} />
        </div>

        <div className="bg-brand-red/10 border-2 border-brand-red/30 rounded-2xl p-4 mb-5">
          <p className="font-body font-bold text-brand-red text-xs uppercase tracking-widest mb-1">The Question</p>
          <p className="font-display text-lg font-bold italic text-gray-900">{mainQuestion}</p>
        </div>

        <div className="space-y-3">
          {answers.map((a) => {
            const isMe = a.playerId === myId;
            return (
              <button
                key={a.playerId}
                onClick={() => handleVote(a.playerId)}
                disabled={isMe}
                className={`w-full rounded-2xl border-2 p-5 text-left transition-all active:scale-[0.98] ${
                  isMe
                    ? 'bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed'
                    : 'bg-cream-dark border-brand-red/20 hover:border-brand-red hover:bg-brand-red/5 cursor-pointer'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-body font-bold text-gray-800">
                    {a.playerName}
                    {isMe && <span className="text-xs ml-2 text-gray-400 font-normal">(you — can't vote for yourself)</span>}
                  </span>
                  <span className="text-brand-red font-display font-bold">Vote →</span>
                </div>
                <p className="font-body text-gray-600 text-sm leading-snug">{a.answer}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
