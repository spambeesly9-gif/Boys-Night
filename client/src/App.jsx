import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Hub from './pages/Hub';
import QuiplashPage from './pages/quiplash/QuiplashPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Hub />} />
        <Route path="/quiplash/*" element={<QuiplashPage />} />
      </Routes>
    </BrowserRouter>
  );
}
