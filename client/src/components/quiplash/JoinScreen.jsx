import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { playFart, playTap } from '../../utils/sounds';

export default function JoinScreen({ onCreate, onJoin, error }) {
  const [tab, setTab] = useState('create');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const navigate = useNavigate();

  const handleCreate = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    playFart();
    setTimeout(() => onCreate(name.trim()), 350);
  };

  const handleJoin = (e) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;
    playFart();
    setTimeout(() => onJoin(code.trim().toUpperCase(), name.trim()), 350);
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-4">
      <button
        onClick={() => { playTap(); navigate('/'); }}
        className="absolute top-6 left-6 font-body font-bold text-gray-500 hover:text-gray-800 flex items-center gap-1 transition-colors text-sm"
      >
        ← Back
      </button>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-5xl font-bold text-brand-red">Quiplash</h1>
          <p className="font-body text-gray-600 mt-2 font-semibold text-sm">
            The funniest answer wins. Usually.
          </p>
        </div>

        <div className="bg-cream-dark rounded-2xl border-2 border-brand-red/20 overflow-hidden">
          <div className="flex border-b-2 border-brand-red/20">
            {['create', 'join'].map((t) => (
              <button
                key={t}
                onClick={() => { playTap(); setTab(t); }}
                className={`flex-1 py-4 font-body font-bold text-sm transition-colors ${tab === t ? 'text-brand-red bg-cream border-b-2 border-brand-red' : 'text-gray-500 hover:text-gray-700 bg-cream-dark'}`}
              >
                {t === 'create' ? '✦ Start a room' : '→ Join a room'}
              </button>
            ))}
          </div>

          <div className="p-8 bg-cream">
            {tab === 'create' ? (
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block font-body font-bold text-gray-700 text-sm mb-2">What do they call you</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="That stupid name you use in every game"
                    maxLength={20}
                    className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 font-body font-semibold text-gray-800 placeholder-gray-300 focus:outline-none focus:border-brand-red transition-colors bg-cream text-sm"
                  />
                </div>
                <button type="submit" disabled={!name.trim()} className="w-full bg-brand-red text-cream font-display font-bold italic text-lg rounded-xl py-3 transition-all hover:bg-red-900 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed">
                  Create Room →
                </button>
              </form>
            ) : (
              <form onSubmit={handleJoin} className="space-y-4">
                <div>
                  <label className="block font-body font-bold text-gray-700 text-sm mb-2">What do they call you</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="That stupid name you use in every game"
                    maxLength={20}
                    className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 font-body font-semibold text-gray-800 placeholder-gray-300 focus:outline-none focus:border-brand-red transition-colors bg-cream text-sm"
                  />
                </div>
                <div>
                  <label className="block font-body font-bold text-gray-700 text-sm mb-2">Room code</label>
                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="ABCD"
                    maxLength={4}
                    className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 font-display font-bold text-2xl text-center tracking-widest text-gray-800 placeholder-gray-300 focus:outline-none focus:border-brand-red transition-colors uppercase bg-cream"
                  />
                </div>
                <button type="submit" disabled={!name.trim() || code.trim().length < 4} className="w-full bg-brand-red text-cream font-display font-bold italic text-lg rounded-xl py-3 transition-all hover:bg-red-900 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed">
                  Join Room →
                </button>
              </form>
            )}

            {error && (
              <div className="mt-4 bg-red-100 border border-brand-red/30 text-brand-red text-sm font-body font-semibold rounded-xl px-4 py-3">
                ⚠ {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
