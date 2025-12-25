import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Users,
  LogOut,
  PlusCircle,
  Settings,
  Home,
  Activity,
  User,
  ChevronRight,
  ChevronLeft,
  X,
} from "lucide-react";
import authService from "../../services/authService";
import { AnimatePresence, motion } from "framer-motion";

const Sidebar = ({
  onLogout,
  onCreateGroup,
  isMobileOpen,
  setIsMobileOpen,
  user
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsMobile(true);
        setIsCollapsed(false); // Mobile luôn full width khi mở
      } else {
        setIsMobile(false);
        setIsMobileOpen(false); // Tắt mobile menu khi về desktop
      }
    };

    // Init check
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setIsMobileOpen]);

  const navItems = [
    { icon: Home, label: "Nhóm", active: true },
    { icon: Users, label: "Bạn bè", active: false },
    { icon: Activity, label: "Hoạt động", active: false },
    { icon: User, label: "Hồ sơ", active: false },
  ];

  const sidebarVariants = {
    expanded: { width: 260 },
    collapsed: { width: 80 },
    mobileClosed: { x: "-100%" },
    mobileOpen: { x: 0, width: 280 },
  };

  const handleLogout = async () => {
    // 1. Gọi API để xóa cookie ở server
    await authService.logout();

    // 2. Gọi hàm này để App.jsx set lại state user = null (về trang Login)
    onLogout();
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header: Logo & Toggle Button */}
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
            className="text-2xl font-bold text-white tracking-tight whitespace-nowrap"
          >
            Split<span className="text-[#34d399]">Bill</span>
          </motion.h1>
        )}

        {/* Toggle Button (Chỉ hiện trên Desktop) */}
        {!isMobile && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg bg-[#1c2e26] text-gray-400 hover:text-white hover:bg-[#34d399] hover:text-[#0b1411] transition-all"
          >
            {isCollapsed ? (
              <ChevronRight size={18} />
            ) : (
              <ChevronLeft size={18} />
            )}
          </button>
        )}

        {/* Close Button (Chỉ hiện trên Mobile) */}
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
        {navItems.map((item, index) => (
          <motion.a
            key={index}
            href="#"
            whileHover={{ backgroundColor: "#1c2e26", x: isCollapsed ? 0 : 4 }}
            className={`
              flex items-center py-3 rounded-xl transition-all duration-200 group relative
              ${isCollapsed ? "justify-center px-2" : "px-4 gap-4"}
              ${
                item.active
                  ? "bg-[#34d399] text-[#0b1411] font-semibold shadow-[0_0_15px_rgba(52,211,153,0.3)]"
                  : "text-gray-400 hover:text-white"
              }
            `}
          >
            <item.icon
              size={22}
              className={`shrink-0 ${item.active ? "text-[#0b1411]" : ""}`}
            />

            {/* Text Label (Ẩn khi collapsed) */}
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

            {/* Tooltip khi Collapsed (Hover mới hiện) */}
            {isCollapsed && (
              <div className="absolute left-full ml-4 px-2 py-1 bg-white text-[#0b1411] text-xs font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                {item.label}
              </div>
            )}
          </motion.a>
        ))}
      </nav>

      {/* Footer: User Profile */}
      <div
        className={`p-4 border-t border-[#1c2e26] ${
          isCollapsed ? "flex justify-center" : ""
        }`}
      >
        <div
          className={`flex items-center ${
            isCollapsed ? "justify-center" : "gap-3"
          } p-2 rounded-xl hover:bg-[#1c2e26] cursor-pointer transition-colors`}
        >
          <div className="h-6 w-6 bg-indigo-500 rounded-full flex items-center justify-center text-white text-xs">
            {/* Lấy ký tự đầu của tên để làm avatar */}
            {user?.username?.charAt(0).toUpperCase() || "U"}
          </div>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="overflow-hidden"
            >
              <p className="text-sm font-medium text-white truncate">
                {user?.username || "Người dùng"}
              </p>
              <p className="text-xs text-gray-400">Free Plan</p>
            </motion.div>
          )}
          {!isCollapsed && (
            <LogOut
              size={18}
              className="text-gray-500 ml-auto hover:text-red-400"
              onClick={handleLogout}
            />
          )}
        </div>
      </div>
    </div>
  );

  // return (
  //   <div className="w-64 h-screen bg-[#0b1411] border-r border-[#1c2e26] flex flex-col fixed left-0 top-0">
  //     {/* Logo Area */}
  //     <div className="p-8">
  //       <h1 className="text-2xl font-bold text-white tracking-tight">
  //         Split<span className="text-[#34d399]">Bill</span>
  //       </h1>
  //     </div>

  //     {/* Navigation */}
  //     <nav className="flex-1 px-4 space-y-2">
  //       {navItems.map((item, index) => (
  //         <motion.a
  //           key={index}
  //           href="#"
  //           whileHover={{ x: 5 }}
  //           className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 ${
  //             item.active
  //               ? "bg-[#34d399] text-[#0b1411] font-semibold shadow-[0_0_15px_rgba(52,211,153,0.3)]"
  //               : "text-gray-400 hover:bg-[#1c2e26] hover:text-white"
  //           }`}
  //         >
  //           <item.icon size={20} />
  //           <span>{item.label}</span>
  //         </motion.a>
  //       ))}
  //     </nav>

  //     {/* User Mini Profile (Bottom Sidebar) */}
  //     <div className="p-4 border-gray-100">
  //       <button
  //         onClick={handleLogout}
  //         className="flex items-center gap-3 px-4 py-3 w-full text-gray-500 hover:text-white hover:bg-red-700 rounded-xl transition-all font-medium"
  //       >
  //         <LogOut className="h-5 w-5" /> Đăng xuất
  //       </button>
  //     </div>
  //   </div>
  // );
  return (
    <>
      {/* 1. Desktop Sidebar (Cố định, đẩy nội dung) */}
      <motion.aside
        initial={false}
        animate={isCollapsed ? "collapsed" : "expanded"}
        variants={sidebarVariants}
        className="hidden lg:flex flex-col h-screen bg-[#0b1411] border-r border-[#1c2e26] sticky top-0 z-40 overflow-hidden"
      >
        <SidebarContent />
      </motion.aside>

      {/* 2. Mobile Backdrop (Lớp phủ mờ) */}
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

      {/* 3. Mobile Sidebar (Trượt ra từ trái) */}
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
