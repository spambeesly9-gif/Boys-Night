import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function JoinScreen({ onCreate, onJoin, error }) {
  const [tab, setTab] = useState('create'); // create | join
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const navigate = useNavigate();

  const handleCreate = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate(name.trim());
  };

  const handleJoin = (e) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;
    onJoin(code.trim().toUpperCase(), name.trim());
  };

  return (
    <div className="min-h-screen bg-[#f8f7ff] flex flex-col items-center justify-center px-4">
      {/* Back */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 font-body font-bold text-gray-400 hover:text-gray-700 flex items-center gap-1 transition-colors"
      >
        ← Back
      </button>

      <div className="w-full max-w-md">
        {/* Title */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🎤</div>
          <h1 className="font-display text-5xl font-semibold text-gray-900">Quiplash</h1>
          <p className="font-body text-gray-500 mt-2 font-semibold">
            The funniest answer wins. Usually.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            {['create', 'join'].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`
                  flex-1 py-4 font-body font-bold text-sm transition-colors
                  ${tab === t
                    ? 'text-brand-red border-b-2 border-brand-red bg-red-50'
                    : 'text-gray-400 hover:text-gray-600'}
                `}
              >
                {t === 'create' ? '✦ Create Room' : '➜ Join Room'}
              </button>
            ))}
          </div>

          <div className="p-8">
            {tab === 'create' ? (
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block font-body font-bold text-gray-700 text-sm mb-2">
                    Your name
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Something cool"
                    maxLength={20}
                    className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 font-body font-semibold text-gray-800 placeholder-gray-300 focus:outline-none focus:border-brand-red transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!name.trim()}
                  className="w-full bg-brand-red text-white font-display font-semibold text-lg rounded-2xl py-3 transition-all hover:bg-red-600 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Create Room →
                </button>
              </form>
            ) : (
              <form onSubmit={handleJoin} className="space-y-4">
                <div>
                  <label className="block font-body font-bold text-gray-700 text-sm mb-2">
                    Your name
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Something cool"
                    maxLength={20}
                    className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 font-body font-semibold text-gray-800 placeholder-gray-300 focus:outline-none focus:border-brand-blue transition-colors"
                  />
                </div>
                <div>
                  <label className="block font-body font-bold text-gray-700 text-sm mb-2">
                    Room code
                  </label>
                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="ABCD"
                    maxLength={4}
                    className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 font-display font-semibold text-2xl text-center tracking-widest text-gray-800 placeholder-gray-300 focus:outline-none focus:border-brand-blue transition-colors uppercase"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!name.trim() || code.trim().length < 4}
                  className="w-full bg-brand-blue text-white font-display font-semibold text-lg rounded-2xl py-3 transition-all hover:bg-blue-700 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Join Room →
                </button>
              </form>
            )}

            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 text-brand-red text-sm font-body font-semibold rounded-xl px-4 py-3">
                ⚠ {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
