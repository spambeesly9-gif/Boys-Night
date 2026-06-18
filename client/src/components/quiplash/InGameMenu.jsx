import { useState } from 'react';
import { playTap } from '../../utils/sounds';

export default function InGameMenu({ isHost, onEndGame }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Gear button */}
      <button
        onClick={() => { playTap(); setOpen(true); }}
        className="fixed top-4 right-4 z-50 w-10 h-10 bg-cream-dark border-2 border-brand-red/20 rounded-xl flex items-center justify-center text-gray-500 hover:border-brand-red hover:text-brand-red transition-all"
        title="Settings"
      >
        ⚙
      </button>

      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/30" onClick={() => { playTap(); setOpen(false); }} />
          <div className="relative bg-cream rounded-2xl border-2 border-brand-red/20 p-8 w-full max-w-sm shadow-xl">
            <h3 className="font-display text-2xl font-bold italic text-gray-900 mb-6">Pausing mid-game?</h3>

            <div className="space-y-3">
              <button
                onClick={() => { playTap(); setOpen(false); }}
                className="w-full bg-cream-dark border-2 border-brand-red/20 text-gray-700 font-body font-bold py-3 rounded-xl hover:border-brand-red transition-all"
              >
                Resume
              </button>

              {isHost && (
                <button
                  onClick={() => { playTap(); setOpen(false); onEndGame(); }}
                  className="w-full bg-brand-red text-cream font-body font-bold py-3 rounded-xl hover:bg-red-900 transition-all"
                >
                  End Game Early
                </button>
              )}
            </div>

            <p className="text-center text-xs font-body text-gray-400 mt-4">
              {isHost ? "You're the host. Act like it." : "Only the host can end the game."}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
