// client/src/App.jsx
import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Loader2 } from "lucide-react";
// Bỏ import AnimatePresence ở đây nếu không dùng cho Routes tổng nữa
// import { AnimatePresence } from "framer-motion";

// --- SERVICES ---
import authService from "./services/authService";

// --- PAGES & COMPONENTS ---
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import PublicOnlyRoute from "./components/PublicOnlyRoute";
import Home from "./pages/Home";
import GroupDetail from "./pages/GroupDetail";
import GroupSettings from "./pages/GroupSettings";
import Profile from "./pages/Profile";

// Components UI
import PageTransition from "./components/common/PageTransition";
import LayoutWrapper from "./components/layout/LayoutWrapper";

// --- COMPONENT ROUTES ---
const AppRoutes = ({ user, setUser, handleLogout }) => {
  const location = useLocation();

  return (
    // XÓA AnimatePresence và key={location.pathname} ở đây để tránh remount Sidebar
    <Routes>
      {/* --- PUBLIC ROUTES --- */}
      <Route
        path="/"
        element={
          <PublicOnlyRoute user={user}>
            <PageTransition>
              <Login onLoginSuccess={setUser} />
            </PageTransition>
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnlyRoute user={user}>
            <PageTransition>
              <Register onLoginSuccess={setUser} />
            </PageTransition>
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicOnlyRoute user={user}>
            <PageTransition>
              <ForgotPassword />
            </PageTransition>
          </PublicOnlyRoute>
        }
      />

      {/* --- PROTECTED ROUTES --- */}
      {user ? (
        <>
          {/* NHÓM 1: CÓ SIDEBAR (LayoutWrapper) */}
          {/* LayoutWrapper sẽ giữ nguyên, chỉ có Outlet bên trong thay đổi */}
          <Route
            element={<LayoutWrapper user={user} onLogout={handleLogout} />}
          >
            <Route
              path="/groups"
              element={
                <PageTransition>
                  <Home user={user} />
                </PageTransition>
              }
            />

            <Route
              path="/profile"
              element={
                <PageTransition>
                  <Profile onUserUpdate={setUser} />
                </PageTransition>
              }
            />
          </Route>

          {/* NHÓM 2: KHÔNG SIDEBAR (Full Screen) */}
          <Route
            path="/groups/:id/details"
            element={
              <PageTransition>
                <GroupDetail user={user} />
              </PageTransition>
            }
          />

          {/* Redirect support link ngắn */}
          <Route
            path="/groups/:id"
            element={
              <Navigate
                to={`/groups/${location.pathname.split("/")[2]}/details`}
                replace
              />
            }
          />

          <Route
            path="/groups/:id/settings"
            element={
              <PageTransition>
                <GroupSettings />
              </PageTransition>
            }
          />

          {/* Redirects */}
          <Route path="/home" element={<Navigate to="/groups" replace />} />
          <Route path="*" element={<Navigate to="/groups" replace />} />
        </>
      ) : (
        /* Chưa login thì đá về trang chủ */
        <Route path="*" element={<Navigate to="/" replace />} />
      )}
    </Routes>
  );
};

// --- MAIN APP COMPONENT ---
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
    await authService.logout();
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
      <AppRoutes user={user} setUser={setUser} handleLogout={handleLogout} />
    </Router>
  );
}

export default App;
