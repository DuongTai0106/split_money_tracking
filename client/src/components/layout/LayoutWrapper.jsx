import React, { useState } from "react";
import { Outlet } from "react-router-dom"; // <--- QUAN TRỌNG: Import Outlet
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar"; // Đảm bảo đường dẫn import đúng

// Thêm props user và onLogout để truyền dữ liệu xuống Sidebar/Header
const LayoutWrapper = ({ user, onLogout }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#0b1411] text-white font-sans">
      {/* Sidebar: Truyền user và onLogout vào để hiển thị avatar và nút đăng xuất */}
      <Sidebar
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        user={user}
        onLogout={onLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        {/* Mobile Header (Chỉ hiện ở mobile) */}
        <header className="lg:hidden flex items-center justify-between p-4 border-b border-[#1c2e26] sticky top-0 bg-[#0b1411]/90 backdrop-blur z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="p-2 -ml-2 rounded-lg text-gray-400 hover:text-white hover:bg-[#1c2e26]"
            >
              <Menu size={24} />
            </button>
            <span className="font-bold text-lg">
              Split<span className="text-[#34d399]">Bill</span>
            </span>
          </div>
        </header>

        {/* MAIN CONTENT: Thay {children} bằng <Outlet /> */}
        <main className="flex-1 p-0 lg:p-0 overflow-y-auto">
          {/* Outlet là nơi React Router sẽ render trang con (Home, Groups, etc.) */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default LayoutWrapper;
