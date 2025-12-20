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

// --- NEW IMPORTS (Các component mới chúng ta vừa làm) ---
import MainLayout from "./components/layout/MainLayout";
import GroupsList from "./pages/GroupsList";
import GroupDetail from "./pages/GroupDetail";

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

  // Màn hình chờ khi đang check cookie
  if (isChecking) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <Router>
      <Toaster position="top-center" />
      <Routes>
        {/* --- PUBLIC ROUTES (Chỉ cho khách chưa đăng nhập) --- */}
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

        {/* --- PROTECTED ROUTES (Phải đăng nhập mới vào được) --- */}
        {user ? (
          /* Sử dụng MainLayout làm khung sườn chung cho các trang bên trong */
          <Route element={<MainLayout onLogout={() => setUser(null)} />}>
            {/* Trang chủ mặc định sau khi login là danh sách nhóm */}
            <Route path="/groups" element={<GroupsList />} />

            {/* Trang chi tiết từng nhóm */}
            <Route path="/groups/:id" element={<GroupDetail />} />

            {/* Redirect các đường dẫn cũ hoặc sai về trang groups */}
            <Route path="/home" element={<Navigate to="/groups" replace />} />
            <Route path="*" element={<Navigate to="/groups" replace />} />
          </Route>
        ) : (
          /* Nếu chưa đăng nhập mà cố truy cập lung tung -> Đá về Login */
          <Route path="*" element={<Navigate to="/" replace />} />
        )}
      </Routes>
    </Router>
  );
}

export default App;
