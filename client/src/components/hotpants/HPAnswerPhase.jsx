import { useState, useEffect, useCallback } from 'react';
import { playTap } from '../../utils/sounds';
import CountdownTimer from '../quiplash/CountdownTimer';

export default function HPAnswerPhase({
  round,
  duration,
  czarId,
  czarName,
  myId,
  myQuestion,
  isImposter,
  answerStatus,
  players,
  onSubmit,
}) {
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const iAmCzar = myId === czarId;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!answer.trim() || submitted) return;
    playTap();
    setSubmitted(true);
    onSubmit(answer.trim());
  };

  const nonCzarPlayers = players.filter(p => p.id !== czarId);
  const answeredCount = nonCzarPlayers.filter(p => answerStatus[p.id]).length;

  if (iAmCzar) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <p className="font-body font-bold text-gray-500 text-xs uppercase tracking-widest mb-2">
              Round {round} — Answer Phase
            </p>
            <h1 className="font-display text-3xl font-bold italic text-gray-900 mb-2">
              You're the Czar
            </h1>
            <p className="font-body text-gray-600 text-sm">
              Sit tight. Watch them squirm.
            </p>
          </div>

          <div className="bg-cream-dark rounded-2xl border-2 border-brand-red/20 p-6 mb-5 text-center">
            <CountdownTimer duration={duration} />
            <p className="font-body font-semibold text-gray-500 text-sm mt-3">
              Answers coming in…
            </p>
          </div>

          <div className="bg-cream-dark rounded-2xl border-2 border-brand-red/20 p-5">
            <p className="font-body font-bold text-gray-700 text-sm mb-3 uppercase tracking-widest">
              Who's answered ({answeredCount}/{nonCzarPlayers.length})
            </p>
            <div className="space-y-2">
              {nonCzarPlayers.map((p) => (
                <div
                  key={p.id}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-body font-semibold transition-all ${
                    answerStatus[p.id]
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-cream text-gray-400 border border-gray-200'
                  }`}
                >
                  <span>{answerStatus[p.id] ? '✓' : '…'}</span>
                  <span>{p.name}</span>
                  {p.id === myId && <span className="ml-auto text-xs font-bold">you</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center">
          <h1 className="font-display text-3xl font-bold italic text-gray-900 mb-3">
            Answer locked in
          </h1>
          <p className="font-body text-gray-600 text-sm mb-6">
            Now wait for everyone else to finish lying.
          </p>

          <div className="bg-cream-dark rounded-2xl border-2 border-brand-red/20 p-5 mb-5">
            <CountdownTimer duration={duration} />
          </div>

          <div className="bg-cream-dark rounded-2xl border-2 border-brand-red/20 p-5">
            <p className="font-body font-bold text-gray-700 text-sm mb-3 uppercase tracking-widest">
              Who's answered ({answeredCount}/{nonCzarPlayers.length})
            </p>
            <div className="space-y-2">
              {nonCzarPlayers.map((p) => (
                <div
                  key={p.id}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-body font-semibold transition-all ${
                    answerStatus[p.id]
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-cream text-gray-400 border border-gray-200'
                  }`}
                >
                  <span>{answerStatus[p.id] ? '✓' : '…'}</span>
                  <span>{p.name}</span>
                  {p.id === myId && <span className="ml-auto text-xs font-bold">you</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <p className="font-body font-bold text-gray-500 text-xs uppercase tracking-widest mb-2">
            Round {round}
          </p>
          <h1 className="font-display text-3xl font-bold italic text-gray-900">
            Your Question
          </h1>
        </div>

        <div className="bg-cream-dark rounded-2xl border-2 border-brand-red/20 p-6 mb-5">
          <p className="font-display text-xl font-bold italic text-gray-900 leading-snug">
            {myQuestion || 'Waiting for your question…'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-body font-bold text-gray-700 text-sm mb-2">
              Your answer
            </label>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer here…"
              maxLength={300}
              rows={3}
              autoFocus
              className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 font-body font-semibold text-gray-800 placeholder-gray-300 focus:outline-none focus:border-brand-red transition-colors bg-cream text-sm resize-none"
            />
          </div>

          <div className="flex items-center gap-4">
            <CountdownTimer duration={duration} />
            <button
              type="submit"
              disabled={!answer.trim()}
              className="flex-1 bg-brand-red text-cream font-display font-bold italic text-lg rounded-xl py-3 transition-all hover:bg-red-900 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Lock It In →
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
