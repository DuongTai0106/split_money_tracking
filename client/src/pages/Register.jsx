import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, ArrowRight, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import authService from "../services/authService";
import AuthLayout from "../components/AuthLayout";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

const Register = () => {
  const [step, setStep] = useState(1); // 1: Info Form, 2: OTP Verification

  // State lưu trữ thông tin tạm
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [otp, setOtp] = useState(["", "", "", "", "", ""]); // 6 số OTP

  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(300); // 5 phút đếm ngược

  const navigate = useNavigate();
  const inputRefs = useRef([]); // Ref cho OTP inputs

  // Countdown Timer cho OTP
  useEffect(() => {
    let interval;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // --- XỬ LÝ BƯỚC 1: GỬI THÔNG TIN ---
  const handleInitRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Gọi API bước 1
    const result = await authService.initRegister(
      formData.username,
      formData.email
    );
    setIsLoading(false);

    if (result.ok) {
      toast.success(result.data.message);
      setStep(2); // Chuyển sang màn hình nhập OTP
      setTimer(300);
    } else {
      toast.error(result.data.message);
    }
  };

  // --- XỬ LÝ BƯỚC 2: XÁC THỰC OTP & TẠO USER ---
  const handleCompleteRegister = async (e) => {
    e.preventDefault();
    const otpCode = otp.join("");
    if (otpCode.length < 6) return toast.error("Vui lòng nhập đủ 6 số OTP!");

    setIsLoading(true);

    // Gọi API bước 2 (Gửi kèm cả password để tạo user luôn)
    const result = await authService.completeRegister(
      formData.username,
      formData.email,
      formData.password,
      otpCode
    );

    setIsLoading(false);

    if (result.ok) {
      toast.success("Đăng ký thành công! Đang vào hệ thống...");
      // Reload trang hoặc redirect về Home (Vì Backend đã set cookie rồi)
      setTimeout(() => {
        window.location.href = "/home"; // Load lại để App.jsx nhận cookie mới
      }, 1000);
    } else {
      toast.error(result.data.message);
    }
  };

  // --- HELPER OTP INPUTS (Copy từ ForgotPassword) ---
  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    if (value && index < 5 && inputRefs.current[index + 1])
      inputRefs.current[index + 1].focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0)
      inputRefs.current[index - 1].focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const data = e.clipboardData
      .getData("text")
      .slice(0, 6)
      .split("")
      .filter((c) => !isNaN(c));
    const newOtp = [...otp];
    data.forEach((v, i) => {
      if (i < 6) newOtp[i] = v;
    });
    setOtp(newOtp);
    if (data.length > 0) inputRefs.current[Math.min(data.length, 5)].focus();
  };

  const formatTime = () => {
    const m = Math.floor(timer / 60);
    const s = timer % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <AuthLayout
      title={step === 1 ? "Tạo tài khoản mới" : "Xác thực Email"}
      subtitle={
        step === 1
          ? "Tham gia cộng đồng quản lý chi tiêu"
          : `Nhập mã OTP vừa gửi tới ${formData.email}`
      }
    >
      <AnimatePresence mode="wait">
        {/* --- STEP 1: FORM NHẬP THÔNG TIN --- */}
        {step === 1 && (
          <motion.form
            key="step1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-5 mt-8"
            onSubmit={handleInitRegister}
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
              Tiếp tục <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <div className="text-center mt-6">
              <p className="text-sm text-gray-600">
                Đã có tài khoản?{" "}
                <Link
                  to="/"
                  className="font-semibold text-indigo-600 hover:text-indigo-500"
                >
                  Đăng nhập ngay
                </Link>
              </p>
            </div>
          </motion.form>
        )}

        {/* --- STEP 2: FORM OTP --- */}
        {step === 2 && (
          <motion.form
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8 mt-8"
            onSubmit={handleCompleteRegister}
          >
            <div
              className="flex justify-center gap-2 sm:gap-4"
              onPaste={handlePaste}
            >
              {otp.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => (inputRefs.current[i] = el)}
                  type="text"
                  maxLength={1}
                  value={d}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  className={`w-12 h-12 text-center text-xl font-bold rounded-lg border transition-all ${
                    d
                      ? "border-indigo-600 bg-white text-indigo-600"
                      : "bg-gray-50 focus:border-indigo-500"
                  }`}
                />
              ))}
            </div>

            <Button
              type="submit"
              isLoading={isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              Hoàn tất đăng ký
            </Button>

            <div className="text-center space-y-2">
              <p className="text-sm text-gray-500">
                Mã hết hạn sau:{" "}
                <span className="font-bold">{formatTime()}</span>
              </p>
              <div className="flex justify-center gap-4 text-sm">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-gray-500 hover:text-gray-900 flex items-center gap-1"
                >
                  <ArrowLeft className="h-3 w-3" /> Quay lại
                </button>
                {timer === 0 && (
                  <button
                    type="button"
                    onClick={handleInitRegister}
                    className="text-indigo-600 font-medium"
                  >
                    Gửi lại mã
                  </button>
                )}
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </AuthLayout>
  );
};

export default Register;
