import { useState } from 'react';
import CountdownTimer from './CountdownTimer';

const PLAYER_COLORS = [
  'bg-red-50 text-brand-red border-red-200',
  'bg-blue-50 text-brand-blue border-blue-200',
  'bg-amber-50 text-amber-600 border-amber-200',
  'bg-green-50 text-brand-green border-green-200',
  'bg-purple-50 text-brand-purple border-purple-200',
  'bg-orange-50 text-brand-orange border-orange-200',
];

export default function AnswerPhase({
  round,
  duration,
  myPrompts,
  answerStatus,
  players,
  myId,
  onSubmitAnswer,
}) {
  const [submitted, setSubmitted] = useState({});  // promptId → true
  const [drafts, setDrafts] = useState({});        // promptId → text

  const handleSubmit = (promptId) => {
    const text = (drafts[promptId] || '').trim();
    if (!text || submitted[promptId]) return;
    onSubmitAnswer(promptId, text);
    setSubmitted(s => ({ ...s, [promptId]: true }));
  };

  const answeredCount = Object.values(answerStatus).filter(Boolean).length;
  const totalPlayers = players.filter(p => p.isConnected).length;

  const roundLabel = round === 3 ? 'Final Round' : `Round ${round}`;

  return (
    <div className="min-h-screen bg-[#f8f7ff] flex flex-col">
      {/* Shared header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <span className="font-body font-bold text-gray-400 text-xs uppercase tracking-widest">
              🎤 Quiplash
            </span>
            <h2 className="font-display text-2xl font-semibold text-gray-900">{roundLabel}</h2>
          </div>
          <CountdownTimer duration={duration} />
        </div>

        {/* Player status grid */}
        <div className="max-w-2xl mx-auto mt-4 flex flex-wrap gap-2">
          {players.filter(p => p.isConnected).map((p, i) => (
            <div
              key={p.id}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-body font-bold border
                ${PLAYER_COLORS[i % PLAYER_COLORS.length]}
              `}
            >
              <span>{answerStatus[p.id] ? '✓' : '⏳'}</span>
              <span>{p.name}</span>
            </div>
          ))}
        </div>

        {answeredCount > 0 && (
          <p className="max-w-2xl mx-auto mt-2 text-xs font-body text-gray-400">
            {answeredCount}/{totalPlayers} players answered
          </p>
        )}
      </div>

      {/* Private zone */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {myPrompts.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">⌛</div>
              <p className="font-display text-2xl text-gray-500">
                No prompts for you this round.
              </p>
              <p className="font-body text-gray-400 mt-2">
                Sit tight — voting is coming.
              </p>
            </div>
          ) : (
            myPrompts.map((prompt) => (
              <PromptCard
                key={prompt.promptId}
                prompt={prompt}
                draft={drafts[prompt.promptId] || ''}
                isSubmitted={!!submitted[prompt.promptId]}
                onChange={(val) =>
                  setDrafts(d => ({ ...d, [prompt.promptId]: val }))
                }
                onSubmit={() => handleSubmit(prompt.promptId)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function PromptCard({ prompt, draft, isSubmitted, onChange, onSubmit }) {
  return (
    <div
      className={`
        bg-white rounded-3xl border-2 p-6 shadow-sm transition-all
        ${isSubmitted ? 'border-brand-green bg-green-50' : 'border-gray-100'}
      `}
    >
      <p className="font-display text-xl font-semibold text-gray-900 mb-5 leading-snug">
        {prompt.promptText}
      </p>

      {isSubmitted ? (
        <div className="flex items-center gap-3">
          <span className="text-2xl">✅</span>
          <span className="font-body font-bold text-brand-green">
            Answer locked in! Waiting for others…
          </span>
        </div>
      ) : (
        <div className="space-y-3">
          <textarea
            value={draft}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Type your funniest answer…"
            maxLength={200}
            rows={3}
            className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 font-body font-semibold text-gray-800 placeholder-gray-300 resize-none focus:outline-none focus:border-brand-red transition-colors"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs font-body text-gray-300">
              {draft.length}/200
            </span>
            <button
              onClick={onSubmit}
              disabled={!draft.trim()}
              className="bg-brand-red text-white font-display font-semibold px-6 py-2.5 rounded-xl transition-all hover:bg-red-600 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Lock it in →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
