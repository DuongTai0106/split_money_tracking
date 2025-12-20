import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, ArrowRight, ArrowLeft, Lock, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import authService from "../services/authService"; // API Service
import AuthLayout from "../components/AuthLayout";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(300); // 5 phút

  const inputRefs = useRef([]);
  const navigate = useNavigate();

  useEffect(() => {
    let interval;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // --- BƯỚC 1: GỬI EMAIL ---
  const handleSubmitEmail = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await authService.forgotPassword(email);
    setIsLoading(false);

    if (result.ok) {
      toast.success(result.data.message);
      setStep(2);
      setTimer(300); // Reset timer
    } else {
      toast.error(result.data.message);
    }
  };

  // --- BƯỚC 2: VERIFY OTP ---
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpCode = otp.join("");
    if (otpCode.length < 6) return toast.error("Vui lòng nhập đủ 6 số!");

    setIsLoading(true);
    const result = await authService.verifyOtp(email, otpCode);
    setIsLoading(false);

    if (result.ok) {
      toast.success("Mã OTP hợp lệ! Mời nhập mật khẩu mới.");
      setStep(3); // Chuyển sang bước nhập mật khẩu
    } else {
      toast.error(result.data.message);
    }
  };

  // --- BƯỚC 3: ĐỔI MẬT KHẨU ---
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword)
      return toast.error("Mật khẩu xác nhận không khớp!");
    if (newPassword.length < 6)
      return toast.error("Mật khẩu phải có ít nhất 6 ký tự!");

    setIsLoading(true);
    const otpCode = otp.join("");
    const result = await authService.resetPassword(email, otpCode, newPassword);
    setIsLoading(false);

    if (result.ok) {
      toast.success(
        "Đổi mật khẩu thành công! Đang chuyển về trang đăng nhập..."
      );
      setTimeout(() => navigate("/"), 2000);
    } else {
      toast.error(result.data.message);
    }
  };

  // Helper cho OTP Input (Giữ nguyên logic cũ)
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

  // --- RENDER GIAO DIỆN ---
  const formatTime = () => {
    const m = Math.floor(timer / 60);
    const s = timer % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const getTitle = () => {
    if (step === 1) return "Quên mật khẩu?";
    if (step === 2) return "Xác thực OTP";
    return "Đặt lại mật khẩu";
  };

  const getSubtitle = () => {
    if (step === 1) return "Nhập email để nhận mã khôi phục.";
    if (step === 2) return `Mã đã gửi tới ${email}`;
    return "Vui lòng nhập mật khẩu mới của bạn.";
  };

  return (
    <AuthLayout title={getTitle()} subtitle={getSubtitle()}>
      <AnimatePresence mode="wait">
        {/* STEP 1: EMAIL */}
        {step === 1 && (
          <motion.form
            key="step1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6 mt-8"
            onSubmit={handleSubmitEmail}
          >
            <Input
              label="Email đăng ký"
              icon={Mail}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
                          required
                          placeholder = "abc@gmail.com"
              autoFocus
            />
            <Button type="submit" isLoading={isLoading}>
              Gửi mã OTP <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <div className="text-center">
              <Link
                to="/"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center justify-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" /> Quay lại
              </Link>
            </div>
          </motion.form>
        )}

        {/* STEP 2: OTP */}
        {step === 2 && (
          <motion.form
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8 mt-8"
            onSubmit={handleVerifyOtp}
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
            <Button type="submit" isLoading={isLoading}>
              Tiếp tục
            </Button>
            <div className="text-center text-sm">
              <p className="text-gray-500">
                Mã hết hạn sau:{" "}
                <span className="font-bold">{formatTime()}</span>
              </p>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="mt-2 text-indigo-600 hover:underline"
              >
                Gửi lại / Đổi Email
              </button>
            </div>
          </motion.form>
        )}

        {/* STEP 3: NEW PASSWORD */}
        {step === 3 && (
          <motion.form
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6 mt-8"
            onSubmit={handleResetPassword}
          >
            <Input
              label="Mật khẩu mới"
              icon={Lock}
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              autoFocus
            />
            <Input
              label="Xác nhận mật khẩu"
              icon={CheckCircle}
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <Button
              type="submit"
              isLoading={isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              Đổi mật khẩu & Đăng nhập
            </Button>
          </motion.form>
        )}
      </AnimatePresence>
    </AuthLayout>
  );
};

export default ForgotPassword;
