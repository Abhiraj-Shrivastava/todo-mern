import { Navigate, Route, Routes } from 'react-router-dom';
import Onboarding from './pages/Onboarding.jsx';
import Home from './pages/Home.jsx';
import Search from './pages/Search.jsx';
import { hasOnboarded } from './utils/onboarding.js';

function RequireOnboarding({ children }) {
  return hasOnboarded() ? children : <Navigate to="/welcome" replace />;
}

export default function App() {
  return (
    <main className="mx-auto min-h-dvh w-full max-w-md bg-white md:max-w-lg md:shadow-[0_0_40px_rgba(30,40,90,0.08)]">
      <Routes>
        <Route path="/welcome" element={<Onboarding />} />
        <Route
          path="/"
          element={
            <RequireOnboarding>
              <Home />
            </RequireOnboarding>
          }
        />
        <Route path="/search" element={<Search />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </main>
  );
}
