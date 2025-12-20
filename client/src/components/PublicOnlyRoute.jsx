import React from "react";
import { Navigate } from "react-router-dom";

const PublicOnlyRoute = ({ user, children }) => {
  // Nếu user tồn tại (đã đăng nhập) => Chuyển hướng ngay về Home
  if (user) {
    return <Navigate to="/home" replace />;
  }

  // Nếu chưa đăng nhập => Cho phép truy cập (Login/Register)
  return children;
};

export default PublicOnlyRoute;
