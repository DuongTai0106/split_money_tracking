import React from "react";
import { LogOut, User } from "lucide-react"; // Import icon cho đẹp
import authService from "../services/authService";

// 1. Nhận props 'user' và hàm 'onLogout' từ App.jsx truyền vào
const Home = ({ user, onLogout }) => {
  // Vì chúng ta đã có biến 'user' từ props rồi.
  const handleLogout = async () => {
    // 1. Gọi API để xóa cookie ở server
    await authService.logout();

    // 2. Gọi hàm này để App.jsx set lại state user = null (về trang Login)
    onLogout();
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="shrink-0 flex items-center gap-2 text-xl font-bold text-indigo-600">
              <div className="h-8 w-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                <span className="text-indigo-600">P</span>
              </div>
              PERN Dashboard
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full">
                <div className="h-6 w-6 bg-indigo-500 rounded-full flex items-center justify-center text-white text-xs">
                  {/* Lấy ký tự đầu của tên để làm avatar */}
                  {user?.username?.charAt(0).toUpperCase() || "U"}
                </div>
                {/* Hiển thị tên user lấy từ Props */}
                <span className="text-gray-700 text-sm font-medium pr-2">
                  {user?.username || "Người dùng"}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                title="Đăng xuất"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main>
        <div className="max-w-7xl mx-auto py-10 sm:px-6 lg:px-8">
          <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100">
            <div className="px-4 py-5 sm:p-6">
              <div className="border-2 border-dashed border-gray-200 rounded-xl h-96 flex flex-col items-center justify-center bg-gray-50/50">
                <User className="h-16 w-16 text-gray-300 mb-4" />
                <h1 className="text-2xl text-gray-500 font-light mb-2">
                  Xin chào, {user?.username}
                </h1>
                <p className="text-gray-400 text-sm">
                  Email của bạn là: {user?.email}
                </p>
                <p className="mt-4 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium">
                  Phiên đăng nhập này được bảo vệ bởi HttpOnly Cookie
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
