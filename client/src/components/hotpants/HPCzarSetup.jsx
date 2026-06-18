import { useState } from 'react';
import { playTap } from '../../utils/sounds';

export default function HPCzarSetup({ czarId, czarName, round, myId, players, isHost, onSubmit, onEnd }) {
  const iAmCzar = myId === czarId;

  const [selectedImposter, setSelectedImposter] = useState('');
  const [mainQuestion, setMainQuestion] = useState('');
  const [imposterQuestion, setImposterQuestion] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canSubmit =
    selectedImposter &&
    mainQuestion.trim() &&
    imposterQuestion.trim() &&
    mainQuestion.trim() !== imposterQuestion.trim() &&
    !submitting;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    playTap();
    setSubmitting(true);
    onSubmit({
      imposterId: selectedImposter,
      mainQuestion: mainQuestion.trim(),
      imposterQuestion: imposterQuestion.trim(),
    });
  };

  if (iAmCzar) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <p className="font-body font-bold text-gray-500 text-xs uppercase tracking-widest mb-2">
              Round {round}
            </p>
            <h1 className="font-display text-4xl font-bold italic text-brand-red mb-2">
              You're the Czar
            </h1>
            <p className="font-body text-gray-600 text-sm">
              Pick one player to be the imposter, then write their trap.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Imposter picker */}
            <div className="bg-cream-dark rounded-2xl border-2 border-brand-red/20 p-5">
              <p className="font-body font-bold text-gray-700 text-sm mb-3 uppercase tracking-widest">
                Who's the imposter?
              </p>
              <div className="space-y-2">
                {players.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => { playTap(); setSelectedImposter(p.id); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-body font-semibold text-left transition-all ${
                      selectedImposter === p.id
                        ? 'bg-brand-red text-cream border-2 border-brand-red'
                        : 'bg-cream text-gray-700 border-2 border-transparent hover:border-brand-red/40'
                    }`}
                  >
                    <span>{selectedImposter === p.id ? '🔥' : '👤'}</span>
                    <span>{p.name}</span>
                    {selectedImposter === p.id && (
                      <span className="ml-auto text-xs font-bold">IMPOSTER</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Questions */}
            <div className="bg-cream-dark rounded-2xl border-2 border-brand-red/20 p-5 space-y-4">
              <div className="bg-cream rounded-xl border border-brand-red/10 p-3 text-xs font-body text-gray-600">
                <span className="font-bold text-brand-red">Tip:</span> Main question is what everyone else answers.
                Imposter question should be similar enough to fool people, but different enough to catch them.
              </div>

              <div>
                <label className="block font-body font-bold text-gray-700 text-sm mb-2">
                  Main question <span className="text-gray-400 font-normal">(everyone else gets this)</span>
                </label>
                <textarea
                  value={mainQuestion}
                  onChange={(e) => setMainQuestion(e.target.value)}
                  placeholder='e.g. "What would you order at a fancy French restaurant?"'
                  maxLength={300}
                  rows={2}
                  className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 font-body font-semibold text-gray-800 placeholder-gray-300 focus:outline-none focus:border-brand-red transition-colors bg-cream text-sm resize-none"
                />
              </div>

              <div>
                <label className="block font-body font-bold text-gray-700 text-sm mb-2">
                  Imposter question <span className="text-gray-400 font-normal">(only {selectedImposter ? players.find(p => p.id === selectedImposter)?.name : 'the imposter'} gets this)</span>
                </label>
                <textarea
                  value={imposterQuestion}
                  onChange={(e) => setImposterQuestion(e.target.value)}
                  placeholder='e.g. "What would you order at a fast food drive-through?"'
                  maxLength={300}
                  rows={2}
                  className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 font-body font-semibold text-gray-800 placeholder-gray-300 focus:outline-none focus:border-brand-red transition-colors bg-cream text-sm resize-none"
                />
                {mainQuestion.trim() && imposterQuestion.trim() && mainQuestion.trim() === imposterQuestion.trim() && (
                  <p className="text-brand-red text-xs font-body font-bold mt-1">Questions must be different.</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full bg-brand-red text-cream font-display font-bold italic text-xl rounded-xl py-4 transition-all hover:bg-red-900 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? 'Starting round…' : 'Start the Round →'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Not the Czar — waiting screen
  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md text-center">
        <p className="font-body font-bold text-gray-500 text-xs uppercase tracking-widest mb-4">
          Round {round}
        </p>
        <div className="text-6xl mb-6 animate-pulse">🎩</div>
        <h1 className="font-display text-4xl font-bold italic text-gray-900 mb-3">
          {czarName} is the Czar
        </h1>
        <p className="font-body text-gray-600 text-base mb-8">
          They're setting up the round… Someone in this room is about to get absolutely cooked.
        </p>

        <div className="bg-cream-dark rounded-2xl border-2 border-brand-red/20 p-6">
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-brand-red rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-brand-red rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-brand-red rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <p className="font-body font-semibold text-gray-500 text-sm mt-3">
            Waiting for {czarName} to set up…
          </p>
        </div>

        {isHost && (
          <button
            onClick={() => { playTap(); onEnd(); }}
            className="mt-6 bg-cream-dark border-2 border-brand-red/20 text-gray-600 font-body font-bold rounded-xl px-6 py-3 hover:border-brand-red transition-all text-sm"
          >
            End Game
          </button>
        )}
      </div>
    </div>
  );
}
