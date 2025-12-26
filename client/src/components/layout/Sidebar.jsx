import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // <--- 1. Import useNavigate & useLocation
import {
  Users,
  LogOut,
  Home,
  User,
  ChevronRight,
  ChevronLeft,
  X,
  CreditCard,
  Settings,
} from "lucide-react";
import authService from "../../services/authService";
import { AnimatePresence, motion } from "framer-motion";

const Sidebar = ({ onLogout, isMobileOpen, setIsMobileOpen, user }) => {
  const navigate = useNavigate(); // <--- 2. Khởi tạo navigate
  const location = useLocation(); // Để check active route
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // State cho Drop-up Menu
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsMobile(true);
        setIsCollapsed(false);
      } else {
        setIsMobile(false);
        setIsMobileOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setIsMobileOpen]);

  const handleNavigate = (path) => {
    navigate(path);
    setIsMenuOpen(false); // Đóng menu drop-up
    if (isMobile) setIsMobileOpen(false); // Đóng sidebar mobile
  };

  // --- HÀM XỬ LÝ CHUYỂN TRANG PROFILE ---
  const handleProfileClick = () => {
    navigate("/profile"); // Chuyển trang ngay lập tức
    setIsMenuOpen(false); // Đóng menu dropdown
    if (isMobile) setIsMobileOpen(false); // Đóng sidebar nếu đang ở mobile
  };

  const navItems = [
    { icon: Home, label: "Nhóm", path: "/groups" },
    // { icon: Users, label: "Bạn bè", path: "/friends" },
    // { icon: User, label: "Hồ sơ", path: "/profile" },
  ];

  const sidebarVariants = {
    expanded: { width: 260 },
    collapsed: { width: 80 },
    mobileClosed: { x: "-100%" },
    mobileOpen: { x: 0, width: 280 },
  };

  const handleLogout = async () => {
    await authService.logout();
    onLogout();
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full relative">
      {/* Header */}
      <div
        className={`flex items-center h-20 px-6 ${
          isCollapsed ? "justify-center" : "justify-between"
        }`}
      >
        {!isCollapsed && (
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-2xl font-bold text-white tracking-tight whitespace-nowrap cursor-pointer"
            onClick={() => navigate("/")}
          >
            Split<span className="text-[#34d399]">Bill</span>
          </motion.h1>
        )}

        {!isMobile && (
          <button
            onClick={() => {
              setIsCollapsed(!isCollapsed);
              setIsMenuOpen(false);
            }}
            className="p-1.5 rounded-lg bg-[#1c2e26] text-gray-400 hover:text-white hover:bg-[#34d399] hover:text-[#0b1411] transition-all"
          >
            {isCollapsed ? (
              <ChevronRight size={18} />
            ) : (
              <ChevronLeft size={18} />
            )}
          </button>
        )}

        {isMobile && (
          <button
            onClick={() => setIsMobileOpen(false)}
            className="text-white ml-auto"
          >
            <X size={24} />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 space-y-2 mt-4">
        {navItems.map((item, index) => {
          // Logic check active chuẩn xác hơn
          const isActive = location.pathname.startsWith(item.path);

          return (
            <div
              key={index}
              onClick={() => handleNavigate(item.path)}
              className={`
                flex items-center py-3 rounded-xl transition-all duration-200 group relative cursor-pointer
                ${isCollapsed ? "justify-center px-2" : "px-4 gap-4"}
                ${
                  isActive
                    ? "bg-[#34d399] text-[#0b1411] font-semibold shadow-[0_0_15px_rgba(52,211,153,0.3)]"
                    : "text-gray-400 hover:text-white hover:bg-[#1c2e26]"
                }
              `}
            >
              <item.icon
                size={22}
                className={`shrink-0 ${isActive ? "text-[#0b1411]" : ""}`}
              />
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="whitespace-nowrap overflow-hidden"
                >
                  {item.label}
                </motion.span>
              )}
              {isCollapsed && (
                <div className="absolute left-full ml-4 px-2 py-1 bg-white text-[#0b1411] text-xs font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg">
                  {item.label}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer: User Profile with Drop-up Menu */}
      <div className={`p-4 border-t border-[#1c2e26] relative`} ref={menuRef}>
        {/* --- DROP-UP MENU --- */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              key="profile-dropdown"
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`absolute bottom-full mb-3 bg-[#1c2e26] border border-[#2d4a3e] rounded-2xl shadow-2xl overflow-hidden z-50
                ${isCollapsed ? "left-16 w-56" : "left-4 right-4"} 
              `}
            >
              {isCollapsed && (
                <div className="px-4 py-3 border-b border-[#2d4a3e] bg-[#0b1411]/50">
                  <p className="text-sm font-bold text-white truncate">
                    {user?.username || "User"}
                  </p>
                  <p className="text-xs text-gray-500">Free Plan</p>
                </div>
              )}

              <div className="p-1.5 space-y-1">
                {/* --- NÚT HỒ SƠ CÁ NHÂN (ĐÃ GẮN SỰ KIỆN onClick) --- */}
                <button
                  onClick={handleProfileClick} // <--- ĐÂY LÀ CHỖ QUAN TRỌNG NHẤT
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-[#2d4a3e] rounded-xl transition-colors text-left group"
                >
                  <div className="p-1.5 bg-[#0b1411] rounded-lg group-hover:bg-[#34d399] group-hover:text-[#0b1411] transition-colors">
                    <User size={16} />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium">Hồ sơ cá nhân</span>
                    <span className="text-[10px] text-gray-500 group-hover:text-gray-300">
                      Quản lý tài khoản
                    </span>
                  </div>
                </button>

                <div className="h-px bg-[#2d4a3e] my-1 mx-2"></div>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-400 hover:text-white hover:bg-red-500/10 rounded-xl transition-colors text-left group"
                >
                  <div className="p-1.5 bg-[#0b1411] rounded-lg group-hover:bg-red-500 group-hover:text-white transition-colors">
                    <LogOut size={16} />
                  </div>
                  <span className="font-medium">Đăng xuất</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- USER PROFILE TRIGGER (Footer) --- */}
        <div
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`
            flex items-center p-2 rounded-xl cursor-pointer transition-all duration-200 border border-transparent
            ${
              isMenuOpen
                ? "bg-[#1c2e26] border-[#2d4a3e]"
                : "hover:bg-[#1c2e26]"
            }
            ${isCollapsed ? "justify-center" : "gap-3"}
          `}
        >
          {/* Logic: Nếu có avatar_url thì hiện ảnh, không thì hiện chữ cái đầu */}
          {user?.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.username}
              className="h-8 w-8 lg:h-9 lg:w-9 rounded-full object-cover shadow-lg ring-2 ring-[#0b1411]"
            />
          ) : (
            <div className="h-8 w-8 lg:h-9 lg:w-9 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg ring-2 ring-[#0b1411]">
              {user?.username?.charAt(0).toUpperCase() || "U"}
            </div>
          )}

          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="overflow-hidden flex-1"
            >
              <p className="text-sm font-bold text-white truncate">
                {user?.username || "Người dùng"}
              </p>
              <p className="text-xs text-[#34d399] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#34d399] animate-pulse"></span>
                Online
              </p>
            </motion.div>
          )}

          {!isCollapsed && (
            <div
              className={`text-gray-500 transition-transform duration-300 ${
                isMenuOpen ? "rotate-180" : ""
              }`}
            >
              <Settings size={18} />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <motion.aside
        initial={false}
        animate={isCollapsed ? "collapsed" : "expanded"}
        variants={sidebarVariants}
        className="hidden lg:flex flex-col h-screen bg-[#0b1411] border-r border-[#1c2e26] sticky top-0 z-40"
      >
        <SidebarContent />
      </motion.aside>

      <AnimatePresence>
        {isMobile && isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isMobile && isMobileOpen && (
          <motion.aside
            initial="mobileClosed"
            animate="mobileOpen"
            exit="mobileClosed"
            variants={sidebarVariants}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-y-0 left-0 z-50 bg-[#0b1411] border-r border-[#1c2e26] lg:hidden w-3/4 max-w-[300px]"
          >
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
