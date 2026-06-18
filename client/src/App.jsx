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
      {on ? '🔊' : '🔇'}
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
