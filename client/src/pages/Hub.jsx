import { useNavigate } from 'react-router-dom';

const GAMES = [
  {
    slug: 'quiplash',
    name: 'Quiplash',
    description: 'Answer wild prompts. Vote for the funniest. Cry laughing.',
    players: '3–8 players',
    emoji: '🎤',
    color: 'from-brand-red to-orange-500',
    textColor: 'text-brand-red',
    borderColor: 'border-brand-red/20',
    bg: 'bg-red-50',
  },
];

export default function Hub() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f8f7ff] flex flex-col">
      {/* Header */}
      <header className="pt-16 pb-8 text-center px-4">
        <div className="inline-flex items-center gap-3 mb-4">
          <span className="text-5xl">🌙</span>
          <h1
            className="font-display text-6xl md:text-7xl font-semibold tracking-tight text-gray-900"
            style={{ letterSpacing: '-1px' }}
          >
            Boys Night
          </h1>
          <span className="text-5xl">🍺</span>
        </div>
        <p className="font-body text-gray-500 text-xl mt-2 font-semibold">
          Party games. No shame. Maximum chaos.
        </p>
      </header>

      {/* Divider */}
      <div className="w-full max-w-3xl mx-auto px-6">
        <div className="h-px bg-gray-200" />
        <p className="text-center text-sm font-body font-bold text-gray-400 uppercase tracking-widest mt-4 mb-8">
          Pick a game
        </p>
      </div>

      {/* Game cards */}
      <main className="flex-1 flex justify-center px-6 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl w-full">
          {GAMES.map((game) => (
            <button
              key={game.slug}
              onClick={() => navigate(`/${game.slug}`)}
              className={`
                group relative rounded-3xl border-2 ${game.borderColor} ${game.bg}
                p-8 text-left transition-all duration-200
                hover:shadow-xl hover:-translate-y-1 hover:border-opacity-60
                active:scale-[0.98] cursor-pointer
              `}
            >
              <div className="text-5xl mb-4">{game.emoji}</div>
              <h2 className={`font-display text-3xl font-semibold ${game.textColor} mb-2`}>
                {game.name}
              </h2>
              <p className="font-body text-gray-600 text-sm leading-relaxed mb-5">
                {game.description}
              </p>
              <span className="inline-flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-3 py-1 text-xs font-body font-bold text-gray-500">
                <span>👥</span> {game.players}
              </span>

              <div className={`
                absolute bottom-6 right-6 w-9 h-9 rounded-full
                bg-gradient-to-br ${game.color}
                flex items-center justify-center text-white text-lg
                transition-transform duration-200 group-hover:scale-110
              `}>
                →
              </div>
            </button>
          ))}

          {/* Coming soon placeholder */}
          <div className="rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50 p-8 flex flex-col items-start justify-center opacity-60">
            <div className="text-5xl mb-4 grayscale">🃏</div>
            <h2 className="font-display text-3xl font-semibold text-gray-400 mb-2">
              More soon
            </h2>
            <p className="font-body text-gray-400 text-sm">
              New games dropping. Stay tuned.
            </p>
          </div>
        </div>
      </main>

      <footer className="text-center pb-8 text-gray-400 text-xs font-body">
        Made for the boys 🤝
      </footer>
    </div>
  );
}
