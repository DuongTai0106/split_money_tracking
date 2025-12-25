import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

const MainLayout = ({ onLogout }) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 font-sans pl-64">
      {/* Sidebar cố định bên trái */}
      <Sidebar
        onLogout={onLogout}
        onCreateGroup={() => setIsCreateModalOpen(true)}
      />

      {/* Nội dung chính sẽ thay đổi tùy trang (GroupsList hoặc GroupDetail) */}
      <main className="w-full min-h-screen">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
