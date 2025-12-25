// client/src/App.jsx
import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Loader2 } from "lucide-react";

// --- SERVICES ---
import authService from "./services/authService";

// --- PAGES & COMPONENTS ---
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import PublicOnlyRoute from "./components/PublicOnlyRoute";
import Home from "./pages/Home";

// --- NEW IMPORT ---
// Import LayoutWrapper mới thay vì MainLayout cũ
import LayoutWrapper from "./components/layout/LayoutWrapper";
import GroupDetail from "./pages/GroupDetail";
import GroupSettings from "./pages/GroupSettings";

function App() {
  const [user, setUser] = useState(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const result = await authService.checkAuth();
      if (result.ok) {
        setUser(result.user);
      }
      setIsChecking(false);
    };
    checkSession();
  }, []);

  const handleLogout = async () => {
    await authService.logout(); // Gọi service logout (nếu có)
    setUser(null);
  };

  if (isChecking) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#0b1411]">
        <Loader2 className="h-10 w-10 animate-spin text-[#34d399]" />
      </div>
    );
  }

  return (
    <Router>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#1c2e26",
            color: "#fff",
            border: "1px solid #2d4a3e",
          },
        }}
      />
      <Routes>
        {/* --- PUBLIC ROUTES --- */}
        <Route
          path="/"
          element={
            <PublicOnlyRoute user={user}>
              <Login onLoginSuccess={setUser} />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicOnlyRoute user={user}>
              <Register />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicOnlyRoute user={user}>
              <ForgotPassword />
            </PublicOnlyRoute>
          }
        />

        {/* --- PROTECTED ROUTES --- */}
        {user ? (
          <>
            {/* NHÓM 1: CÓ SIDEBAR (LayoutWrapper) */}
            {/* Dành cho các trang cấp 1: Trang chủ, Danh sách nhóm, Profile, Setting */}
            <Route
              element={<LayoutWrapper user={user} onLogout={handleLogout} />}
            >
              <Route path="/groups" element={<Home user={user} />} />
              {/* Nếu sau này có trang /profile thì thêm vào đây */}
            </Route>

            {/* NHÓM 2: KHÔNG SIDEBAR (Full Screen) */}
            {/* Dành cho các trang chi tiết cần không gian rộng */}
            <Route path="/groups/:id" element={<GroupDetail />} />
            <Route path="/groups/:id/settings" element={<GroupSettings />} />

            {/* Redirects */}
            <Route path="/home" element={<Navigate to="/groups" replace />} />
            <Route path="*" element={<Navigate to="/groups" replace />} />
          </>
        ) : (
          /* Chưa login thì đá về trang chủ (Login) */
          <Route path="*" element={<Navigate to="/" replace />} />
        )}
      </Routes>
    </Router>
  );
}

export default App;
