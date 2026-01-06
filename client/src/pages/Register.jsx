import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, ArrowRight, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import authService from "../services/authService";
import AuthLayout from "../components/AuthLayout";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

const Register = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await authService.register(
      formData.username,
      formData.email,
      formData.password
    );

    setIsLoading(false);

    if (result.ok) {
      toast.success("Đăng ký thành công! Đang vào hệ thống...");
      
      // Update Global State immediately
      if (onLoginSuccess) {
        onLoginSuccess(result.data.user);
      }
      
      // Navigate cleanly without reload
      navigate("/groups");
    } else {
      toast.error(result.data.message || "Đăng ký thất bại");
    }
  };

  return (
    <AuthLayout
      title="Tạo tài khoản mới"
      subtitle="Tham gia cộng đồng quản lý chi tiêu"
    >
      <motion.form
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="space-y-5 mt-8"
        onSubmit={handleRegister}
      >
        <Input
          label="Họ và tên"
          icon={User}
          type="text"
          placeholder="Nguyễn Văn A"
          value={formData.username}
          onChange={(e) =>
            setFormData({ ...formData, username: e.target.value })
          }
          required
        />

        <Input
          label="Email"
          icon={Mail}
          type="email"
          placeholder="name@company.com"
          value={formData.email}
          onChange={(e) =>
            setFormData({ ...formData, email: e.target.value })
          }
          required
        />

        <Input
          label="Mật khẩu"
          icon={Lock}
          type="password"
          placeholder="Tối thiểu 6 ký tự"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          required
        />

        <Button type="submit" isLoading={isLoading}>
          Đăng ký ngay <ArrowRight className="ml-2 h-4 w-4" />
        </Button>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Đã có tài khoản?{" "}
            <Link
              to="/"
              className="font-semibold text-green-600 hover:text-green-500"
            >
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </motion.form>
    </AuthLayout>
  );
};

export default Register;
