import React from "react";
import { NavLink } from "react-router-dom";
import { Users, LogOut, PlusCircle, Settings } from "lucide-react";
import authService from "../../services/authService";

const Sidebar = ({ onLogout, onCreateGroup }) => {
  const navItems = [
    { icon: Users, label: "Danh sách nhóm", path: "/groups" },
    // Bạn có thể thêm link Settings nếu muốn
    // { icon: Settings, label: 'Cài đặt', path: '/settings' },
  ];

  const handleLogout = async () => {
    // 1. Gọi API để xóa cookie ở server
    await authService.logout();

    // 2. Gọi hàm này để App.jsx set lại state user = null (về trang Login)
    onLogout();
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen fixed left-0 top-0 z-20">
      {/* Logo Area */}
      <div className="h-16 flex items-center px-6 border-b border-gray-100">
        <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold mr-3">
          F
        </div>
        <span className="text-xl font-bold text-gray-800 tracking-tight">
          FairShare
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                isActive
                  ? "bg-indigo-50 text-indigo-700 shadow-sm"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}

        {/* Quick Action Button in Sidebar */}
        <button
          onClick={onCreateGroup}
          className="w-full mt-4 flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-3 rounded-xl font-medium hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200"
        >
          <PlusCircle className="h-5 w-5" /> Tạo nhóm mới
        </button>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all font-medium"
        >
          <LogOut className="h-5 w-5" /> Đăng xuất
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
