import { Routes, Route } from "react-router-dom";

import RequireAuth from "./components/AuthGuard/AuthGuard";
import Monitoring from "./components/Monitoring/Monitoring";
import Predictions from "./components/Predictions/Predictions";
import VoiceControlButton from "./components/VoiceControl/VoiceControlButton";
import HomePage from "./pages/HomePage/HomePage";
import LoginPage from "./pages/LoginPage/LoginPage";
import ProfilePage from "./pages/ProfilePage/ProfilePage";

function App() {
  return (
    <>
      <a href="#main-content" className="skip-link">Aller au contenu principal</a>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <RequireAuth>
              <HomePage />
            </RequireAuth>
          }
        />
        <Route
          path="/profile"
          element={
            <RequireAuth>
              <ProfilePage />
            </RequireAuth>
          }
        />
        <Route
          path="/predictions"
          element={
            <RequireAuth>
              <Predictions />
            </RequireAuth>
          }
        />
        <Route
          path="/monitoring"
          element={
            <RequireAuth>
              <Monitoring />
            </RequireAuth>
          }
        />
      </Routes>
      
      {/* Bouton flottant de contrôle vocal */}
      <VoiceControlButton />
    </>
  );
}

export default App;
