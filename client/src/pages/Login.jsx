import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import authService from "../services/authService";
import AuthLayout from "../components/AuthLayout";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import toast from "react-hot-toast";

const Login = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  // const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Giả lập delay một chút để người dùng thấy hiệu ứng loading đẹp
    setTimeout(async () => {
      const result = await authService.login(formData.email, formData.password);
      setIsLoading(false);
      if (result.ok) {
        toast.success("Đăng nhập thành công ! Chào mừng quay trở lại");
        if (onLoginSuccess) {
          onLoginSuccess(result.data.user);
        }
      } else {
        // setError(result.data.message || "Đăng nhập thất bại");
        toast.error(result.data.message || "Email hoặc mật khẩu không đúng");
        // setIsLoading(false);
      }
    }, 800);
  };

  return (
    <AuthLayout
      title="Chào mừng trở lại"
      subtitle="Vui lòng nhập thông tin để đăng nhập"
    >
      <motion.form
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-6"
        onSubmit={handleSubmit}
      >
        <Input
          label="Email doanh nghiệp"
          icon={Mail}
          type="email"
          name="email"
          placeholder="name@company.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />

        <div>
          <Input
            label="Mật khẩu"
            icon={Lock}
            type="password"
            name="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            required
          />
          <div className="flex items-center justify-end mt-2">
            <Link
              to="/forgot-password"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
            >
              Quên mật khẩu?
            </Link>
          </div>
        </div>

        <Button type="submit" isLoading={isLoading}>
          Đăng nhập <ArrowRight className="ml-2 h-4 w-4" />
        </Button>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Chưa có tài khoản?{" "}
            <Link
              to="/register"
              className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors"
            >
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </motion.form>
    </AuthLayout>
  );
};

export default Login;
