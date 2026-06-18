import { useNavigate } from 'react-router-dom';

const GAMES = [
  {
    slug: 'quiplash',
    name: 'Quiplash',
    description: 'Write the funniest answer. Pray your friends have taste.',
    players: '3–8 players',
    emoji: '🎤',
  },
];

export default function Hub() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Header */}
      <header className="pt-16 pb-6 text-center px-4">
        <h1 className="font-display text-7xl md:text-8xl font-black italic text-brand-red leading-none tracking-tight">
          Boys Night
        </h1>
        <p className="font-body font-bold text-gray-800 text-lg mt-4">
          The few hours where you actually feel something.
        </p>
      </header>

      {/* Divider */}
      <div className="w-full max-w-2xl mx-auto px-6 mb-8">
        <div className="h-px bg-gray-800/20" />
        <p className="text-center text-sm font-body font-bold text-gray-500 mt-4">
          Stop fu**ing around and pick one.
        </p>
      </div>

      {/* Game cards */}
      <main className="flex-1 flex justify-center px-6 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-4xl w-full">
          {GAMES.map((game) => (
            <button
              key={game.slug}
              onClick={() => navigate(`/${game.slug}`)}
              className="
                group relative rounded-2xl border-2 border-brand-red/40 bg-cream
                p-8 text-left transition-all duration-200
                hover:border-brand-red hover:bg-cream-dark hover:-translate-y-1 hover:shadow-lg
                active:scale-[0.98] cursor-pointer
              "
            >
              <div className="text-4xl mb-4">{game.emoji}</div>
              <h2 className="font-display text-3xl font-bold italic text-brand-red mb-2">
                {game.name}
              </h2>
              <p className="font-body text-gray-700 text-sm leading-relaxed mb-5">
                {game.description}
              </p>
              <span className="inline-flex items-center gap-1.5 border border-gray-400/40 rounded-full px-3 py-1 text-xs font-body font-bold text-gray-500">
                👥 {game.players}
              </span>
            </button>
          ))}

          {/* Coming soon */}
          <div className="rounded-2xl border-2 border-dashed border-gray-400/30 p-8 flex flex-col items-start justify-center">
            <div className="text-4xl mb-4 opacity-30">🃏</div>
            <h2 className="font-display text-2xl font-bold italic text-gray-400 mb-2">
              More coming
            </h2>
            <p className="font-body text-gray-400 text-sm">
              When we feel like it.
            </p>
          </div>
        </div>
      </main>

      <footer className="text-center pb-8 text-gray-400 text-xs font-body">
        No refunds. No regrets.
      </footer>
    </div>
  );
}
