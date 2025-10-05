import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AuthGuard } from './components/AuthGuard';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Companions } from './pages/Companions';
import { VideoCall } from './pages/VideoCall';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/companions" replace />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/signup" element={<Signup />} />
          <Route
            path="/companions"
            element={
              <AuthGuard>
                <Companions />
              </AuthGuard>
            }
          />
          <Route
            path="/call/:roomId"
            element={
              <AuthGuard>
                <VideoCall />
              </AuthGuard>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
