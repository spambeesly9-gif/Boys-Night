import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Hub from './pages/Hub';
import QuiplashPage from './pages/quiplash/QuiplashPage';
import HotPantsPage from './pages/hotpants/HotPantsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Hub />} />
        <Route path="/quiplash/*" element={<QuiplashPage />} />
        <Route path="/hotpants/*" element={<HotPantsPage />} />
      </Routes>
    </BrowserRouter>
  );
}
