import { useState } from 'react';
import { playTap } from '../../utils/sounds';

const ROUND_OPTIONS = [1, 2, 3, 5, 'Endless'];

export default function HPLobbyScreen({ roomCode, players, isHost, onStart, myId }) {
  const connected = players.filter(p => p.isConnected);
  const canStart = isHost && connected.length >= 3;

  const [rounds, setRounds] = useState(3);

  const handleStart = () => {
    playTap();
    onStart({ rounds: rounds === 'Endless' ? 'endless' : rounds });
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Room code */}
        <div className="bg-cream-dark rounded-2xl border-2 border-brand-red/20 p-8 mb-5 text-center">
          <p className="font-body font-bold text-gray-500 text-xs uppercase tracking-widest mb-3">Room Code</p>
          <div className="font-display text-6xl font-bold tracking-widest text-gray-900 mb-2">{roomCode}</div>
          <p className="font-body text-sm text-gray-500">Send this to your victims</p>
        </div>

        {/* Player list */}
        <div className="bg-cream-dark rounded-2xl border-2 border-brand-red/20 p-6 mb-5">
          <div className="flex items-center justify-between mb-4">
            <p className="font-body font-bold text-gray-700">In the room ({connected.length}/8)</p>
            {connected.length < 3 && (
              <span className="text-xs font-body font-bold text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
                Need {3 - connected.length} more
              </span>
            )}
          </div>
          <div className="space-y-2">
            {players.map((p) => (
              <div
                key={p.id}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-body font-semibold ${
                  p.id === myId
                    ? 'bg-brand-red/10 text-brand-red border border-brand-red/20'
                    : 'bg-cream text-gray-700'
                } ${!p.isConnected ? 'opacity-40' : ''}`}
              >
                <span className="flex-1">{p.name}</span>
                {p.id === players[0]?.id && <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">host</span>}
                {p.id === myId && <span className="text-xs font-bold text-brand-red">you</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Game config (host only) */}
        {isHost && (
          <div className="bg-cream-dark rounded-2xl border-2 border-brand-red/20 p-5 mb-5">
            <p className="font-body font-bold text-gray-700 text-sm mb-3">Game Settings</p>
            <div>
              <p className="font-body font-bold text-gray-600 text-xs mb-2 uppercase tracking-widest">Rounds</p>
              <div className="flex gap-2">
                {ROUND_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => { playTap(); setRounds(opt); }}
                    className={`flex-1 py-2 rounded-lg text-sm font-body font-bold transition-all ${
                      rounds === opt
                        ? 'bg-brand-red text-cream'
                        : 'bg-cream text-gray-600 border border-gray-300 hover:border-brand-red'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {isHost ? (
          <button
            onClick={handleStart}
            disabled={!canStart}
            className="w-full bg-brand-red text-cream font-display font-bold italic text-xl rounded-xl py-4 transition-all hover:bg-red-900 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {canStart ? "Let's go →" : `Waiting for people… (${connected.length}/3)`}
          </button>
        ) : (
          <div className="text-center font-body font-semibold text-gray-500 text-base py-4">
            Waiting for the host to grow a pair…
          </div>
        )}
      </div>
    </div>
  );
}
