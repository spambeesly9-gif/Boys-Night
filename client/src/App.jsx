import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Hub from './pages/Hub';
import QuiplashPage from './pages/quiplash/QuiplashPage';
import HotPantsPage from './pages/hotpants/HotPantsPage';
import { getSoundEnabled, setSoundEnabled } from './utils/sounds';

function SoundToggle() {
  const [on, setOn] = useState(getSoundEnabled());
  const toggle = () => {
    const next = !on;
    setOn(next);
    setSoundEnabled(next);
  };
  return (
    <button
      onClick={toggle}
      title={on ? 'Mute sounds' : 'Unmute sounds'}
      className="fixed bottom-5 right-5 z-50 w-10 h-10 bg-white border-2 border-gray-200 rounded-full shadow-md flex items-center justify-center text-lg hover:border-gray-400 transition-all active:scale-95"
    >
      {on ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <line x1="23" y1="9" x2="17" y2="15" />
          <line x1="17" y1="9" x2="23" y2="15" />
        </svg>
      )}
    </button>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <SoundToggle />
      <Routes>
        <Route path="/" element={<Hub />} />
        <Route path="/quiplash/*" element={<QuiplashPage />} />
        <Route path="/hotpants/*" element={<HotPantsPage />} />
      </Routes>
    </BrowserRouter>
  );
}
