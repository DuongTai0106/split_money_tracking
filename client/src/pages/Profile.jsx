import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Camera,
  Lock,
  Key,
  ShieldCheck,
  Loader2,
  Save,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import userService from "../services/authService";

const Profile = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // --- STATE ---
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // Profile Data
  const [profile, setProfile] = useState({
    username: "",
    email: "",
    avatar_url: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);

  // Password Data
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchProfile = async () => {
      const res = await userService.getProfile();
      if (res.ok) {
        setProfile(res.data.user);
        setPreview(
          res.data.user.avatar_url ||
            `https://ui-avatars.com/api/?name=${res.data.user.username}`
        );
      } else {
        toast.error(res.data?.message || "Lỗi tải profile");
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  // --- HANDLERS ---
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!profile.username.trim()) return toast.error("Tên không được để trống");

    setSavingProfile(true);
    const formData = new FormData();
    formData.append("username", profile.username);
    if (selectedFile) formData.append("avatar", selectedFile);

    const res = await userService.updateProfile(formData);
    if (res.ok) {
      toast.success("Cập nhật hồ sơ thành công!");
      // Có thể cập nhật lại Context User toàn cục ở đây nếu cần
    } else {
      toast.error(res.message);
    }
    setSavingProfile(false);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword.length < 6)
      return toast.error("Mật khẩu mới phải từ 6 ký tự");
    if (passwords.newPassword !== passwords.confirmPassword)
      return toast.error("Mật khẩu xác nhận không khớp");

    setSavingPassword(true);
    const res = await userService.changePassword({
      currentPassword: passwords.currentPassword,
      newPassword: passwords.newPassword,
    });

    if (res.ok) {
      toast.success("Đổi mật khẩu thành công!");
      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } else {
      toast.error(res.message);
    }
    setSavingPassword(false);
  };

  if (loading)
    return (
      <div className="min-h-screen bg-[#0b1411] flex items-center justify-center text-[#34d399]">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-[#0b1411] text-white font-sans pb-10"
    >
      {/* HEADER */}
      <div className="sticky top-0 z-30 bg-[#0b1411]/90 backdrop-blur border-b border-[#1c2e26] px-4 py-4 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-full hover:bg-[#1c2e26] text-gray-300 transition-colors"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-xl font-bold">Hồ sơ cá nhân</h1>
      </div>

      <div className="max-w-4xl mx-auto p-4 lg:p-8 space-y-8">
        {/* === SECTION 1: PUBLIC PROFILE === */}
        <div className="bg-[#1c2e26] rounded-3xl p-6 lg:p-8 border border-[#2d4a3e] shadow-xl relative overflow-hidden">
          {/* Decor Background */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#34d399] blur-[100px] opacity-5 -mr-16 -mt-16 pointer-events-none"></div>

          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-[#34d399]/10 rounded-xl text-[#34d399]">
              <User size={20} />
            </div>
            <h2 className="text-lg font-bold">Thông tin chung</h2>
          </div>

          <form
            onSubmit={handleUpdateProfile}
            className="flex flex-col lg:flex-row gap-8 lg:gap-12"
          >
            {/* Avatar Upload */}
            <div className="flex flex-col items-center gap-4">
              <div
                className="relative group cursor-pointer"
                onClick={() => fileInputRef.current.click()}
              >
                <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-full border-4 border-[#2d4a3e] shadow-2xl overflow-hidden group-hover:border-[#34d399] transition-colors">
                  <img
                    src={preview}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Overlay Icon */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                  <Camera size={24} className="text-white" />
                </div>
                <div className="absolute bottom-1 right-1 bg-[#34d399] p-2 rounded-full text-[#0b1411] border-4 border-[#1c2e26]">
                  <Camera size={16} />
                </div>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
              <p className="text-xs text-gray-500">Chạm để thay đổi ảnh</p>
            </div>

            {/* Input Fields */}
            <div className="flex-1 space-y-5 w-full">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 ml-1">
                  Tên hiển thị
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={profile.username}
                    onChange={(e) =>
                      setProfile({ ...profile, username: e.target.value })
                    }
                    className="w-full bg-[#0b1411] border border-[#2d4a3e] rounded-xl pl-4 pr-4 py-3.5 text-white focus:border-[#34d399] focus:outline-none transition-all"
                    placeholder="Nhập tên của bạn"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 ml-1 flex items-center gap-2">
                  Email{" "}
                  <span className="text-xs bg-[#2d4a3e] px-2 py-0.5 rounded text-gray-400">
                    Read-only
                  </span>
                </label>
                <div className="relative opacity-60">
                  <Mail
                    className="absolute left-4 top-3.5 text-gray-500"
                    size={18}
                  />
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="w-full bg-[#0b1411] border border-[#2d4a3e] rounded-xl pl-12 pr-4 py-3.5 text-gray-400 cursor-not-allowed"
                  />
                  <Lock
                    className="absolute right-4 top-3.5 text-gray-600"
                    size={16}
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="bg-[#34d399] text-[#0b1411] px-6 py-3 rounded-xl font-bold hover:bg-[#2cb683] transition-colors flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-[#34d399]/20"
                >
                  {savingProfile ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <Save size={18} />
                  )}
                  Lưu thay đổi
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* === SECTION 2: PASSWORD === */}
        <div className="bg-[#1c2e26] rounded-3xl p-6 lg:p-8 border border-[#2d4a3e] shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-500/10 rounded-xl text-purple-400">
              <ShieldCheck size={20} />
            </div>
            <h2 className="text-lg font-bold">Bảo mật</h2>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-5 max-w-2xl">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 ml-1">
                Mật khẩu hiện tại
              </label>
              <div className="relative">
                <Key
                  className="absolute left-4 top-3.5 text-gray-500"
                  size={18}
                />
                <input
                  type="password"
                  value={passwords.currentPassword}
                  onChange={(e) =>
                    setPasswords({
                      ...passwords,
                      currentPassword: e.target.value,
                    })
                  }
                  className="w-full bg-[#0b1411] border border-[#2d4a3e] rounded-xl pl-12 pr-4 py-3.5 text-white focus:border-purple-400 focus:outline-none transition-all placeholder-gray-600"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 ml-1">
                  Mật khẩu mới
                </label>
                <input
                  type="password"
                  value={passwords.newPassword}
                  onChange={(e) =>
                    setPasswords({ ...passwords, newPassword: e.target.value })
                  }
                  className="w-full bg-[#0b1411] border border-[#2d4a3e] rounded-xl px-4 py-3.5 text-white focus:border-purple-400 focus:outline-none transition-all placeholder-gray-600"
                  placeholder="Ít nhất 6 ký tự"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 ml-1">
                  Xác nhận mật khẩu
                </label>
                <input
                  type="password"
                  value={passwords.confirmPassword}
                  onChange={(e) =>
                    setPasswords({
                      ...passwords,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="w-full bg-[#0b1411] border border-[#2d4a3e] rounded-xl px-4 py-3.5 text-white focus:border-purple-400 focus:outline-none transition-all placeholder-gray-600"
                  placeholder="Nhập lại mật khẩu mới"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={savingPassword}
                className="bg-[#1c2e26] border border-[#2d4a3e] hover:bg-[#2d4a3e] text-gray-200 px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {savingPassword ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <CheckCircle size={18} />
                )}
                Cập nhật mật khẩu
              </button>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default Profile;
