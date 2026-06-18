export default function LobbyScreen({ roomCode, players, isHost, onStart, myId }) {
  const connected = players.filter(p => p.isConnected);
  const canStart = isHost && connected.length >= 3;

  return (
    <div className="min-h-screen bg-[#f8f7ff] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Room code display */}
        <div className="bg-white rounded-3xl border-2 border-gray-100 p-8 mb-6 text-center shadow-sm">
          <p className="font-body font-bold text-gray-400 text-xs uppercase tracking-widest mb-3">
            Room Code
          </p>
          <div className="font-display text-6xl font-semibold tracking-widest text-gray-900 mb-2">
            {roomCode}
          </div>
          <p className="font-body text-sm text-gray-400">
            Share this code with your friends
          </p>
        </div>

        {/* Player list */}
        <div className="bg-white rounded-3xl border-2 border-gray-100 p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="font-body font-bold text-gray-700">
              Players ({connected.length}/8)
            </p>
            {connected.length < 3 && (
              <span className="text-xs font-body font-bold text-amber-500 bg-amber-50 px-3 py-1 rounded-full">
                Need {3 - connected.length} more
              </span>
            )}
          </div>

          <div className="space-y-2">
            {players.map((p) => (
              <div
                key={p.id}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-2xl font-body font-semibold
                  ${p.id === myId ? 'bg-red-50 text-brand-red' : 'bg-gray-50 text-gray-700'}
                  ${!p.isConnected ? 'opacity-40' : ''}
                `}
              >
                <span className="text-xl">
                  {p.isHost ? '👑' : '🎤'}
                </span>
                <span>{p.name}</span>
                {p.id === myId && (
                  <span className="ml-auto text-xs font-bold text-brand-red bg-red-100 px-2 py-0.5 rounded-full">
                    you
                  </span>
                )}
                {p.isHost && p.id !== myId && (
                  <span className="ml-auto text-xs font-bold text-amber-500">host</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action */}
        {isHost ? (
          <button
            onClick={onStart}
            disabled={!canStart}
            className="w-full bg-brand-red text-white font-display font-semibold text-xl rounded-2xl py-4 transition-all hover:bg-red-600 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
          >
            {canStart ? 'Start Game →' : `Waiting for players… (${connected.length}/3)`}
          </button>
        ) : (
          <div className="text-center font-body font-semibold text-gray-400 text-lg py-4">
            ⏳ Waiting for host to start…
          </div>
        )}
      </div>
    </div>
  );
}
