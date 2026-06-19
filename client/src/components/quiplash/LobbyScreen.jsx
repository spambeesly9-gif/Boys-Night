import { useState } from 'react';
import { playTap } from '../../utils/sounds';

const ROUND_OPTIONS = [1, 2, 3, 5, 'Endless'];
const ANSWER_TIME_OPTIONS = [30, 60, 90];
const VOTE_TIME_OPTIONS = [15, 30, 45];

export default function LobbyScreen({ roomCode, players, isHost, onStart, myId }) {
  const connected = players.filter(p => p.isConnected);
  const canStart = isHost && connected.length >= 3;

  const [rounds, setRounds] = useState(3);
  const [answerTime, setAnswerTime] = useState(90);
  const [voteTime, setVoteTime] = useState(30);
  const [showConfig, setShowConfig] = useState(false);

  const handleStart = () => {
    playTap();
    onStart({ rounds, answerTime, voteTime });
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
              <div key={p.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-body font-semibold ${p.id === myId ? 'bg-brand-red/10 text-brand-red border border-brand-red/20' : 'bg-cream text-gray-700'} ${!p.isConnected ? 'opacity-40' : ''}`}>
                <span className="flex-1">{p.name}</span>
                {p.isHost && <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">host</span>}
                {p.id === myId && <span className="text-xs font-bold text-brand-red">you</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Game config (host only) */}
        {isHost && (
          <div className="bg-cream-dark rounded-2xl border-2 border-brand-red/20 p-5 mb-5">
            <button
              onClick={() => { playTap(); setShowConfig(v => !v); }}
              className="w-full flex items-center justify-between font-body font-bold text-gray-700 text-sm"
            >
              <span>Game Settings</span>
              <span className="text-gray-400">{showConfig ? '▲' : '▼'}</span>
            </button>

            {showConfig && (
              <div className="mt-4 space-y-4">
                <ConfigRow label="Rounds" options={ROUND_OPTIONS} value={rounds} onChange={(v) => { playTap(); setRounds(v); }} format={v => `${v}`} />
                <ConfigRow label="Answer time" options={ANSWER_TIME_OPTIONS} value={answerTime} onChange={(v) => { playTap(); setAnswerTime(v); }} format={v => `${v}s`} />
                <ConfigRow label="Vote time" options={VOTE_TIME_OPTIONS} value={voteTime} onChange={(v) => { playTap(); setVoteTime(v); }} format={v => `${v}s`} />
              </div>
            )}
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

function ConfigRow({ label, options, value, onChange, format }) {
  return (
    <div>
      <p className="font-body font-bold text-gray-600 text-xs mb-2 uppercase tracking-widest">{label}</p>
      <div className="flex gap-2">
        {options.map(opt => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`flex-1 py-2 rounded-lg text-sm font-body font-bold transition-all ${value === opt ? 'bg-brand-red text-cream' : 'bg-cream text-gray-600 border border-gray-300 hover:border-brand-red'}`}
          >
            {format(opt)}
          </button>
        ))}
      </div>
    </div>
  );
}
