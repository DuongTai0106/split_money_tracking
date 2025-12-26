import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Hash, ArrowRight, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import groupService from "../../services/groupService";

const JoinGroupModal = ({ isOpen, onClose, onJoinSuccess }) => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim()) return toast.error("Vui lòng nhập mã!");
    if (code.length < 4) return toast.error("Mã nhóm quá ngắn!");

    setLoading(true);
    try {
      const res = await groupService.joinGroup(code);
      if (res.ok && res.data.success) {
        toast.success(res.data.message);
        onJoinSuccess(); // Reload list nhóm ở Home
        setCode("");
        onClose();
      } else {
        toast.error(res.data.message || "Không thể tham gia nhóm");
      }
    } catch (error) {
      toast.error("Lỗi hệ thống");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-[#1c2e26] w-full max-w-md rounded-3xl border border-[#2d4a3e] shadow-2xl relative overflow-hidden"
          >
            {/* Header Art */}
            <div className="h-32 bg-gradient-to-br from-[#34d399]/20 to-[#1c2e26] relative flex items-center justify-center">
              <div className="w-20 h-20 bg-[#34d399]/10 rounded-full flex items-center justify-center border border-[#34d399]/30 shadow-[0_0_30px_rgba(52,211,153,0.3)]">
                <Hash size={40} className="text-[#34d399]" />
              </div>
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white/70 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 md:p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white">Tham gia Nhóm</h2>
                <p className="text-gray-400 text-sm mt-2">
                  Nhập mã mời bạn nhận được từ bạn bè để tham gia nhóm chi tiêu
                  ngay.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative group">
                  {/* Input được style giống khung nhập OTP */}
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="Nhập mã (VD: AB12C)"
                    className="w-full bg-[#0b1411] border-2 border-[#2d4a3e] rounded-2xl px-4 py-4 text-center text-white text-2xl font-bold tracking-[0.2em] focus:border-[#34d399] focus:outline-none focus:shadow-[0_0_20px_rgba(52,211,153,0.1)] transition-all placeholder-gray-700 uppercase"
                    maxLength={10}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !code}
                  className="w-full bg-[#34d399] hover:bg-[#2cb683] text-[#0b1411] py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-[#34d399]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <>
                      <span>Vào nhóm ngay</span>
                      <ArrowRight size={20} />
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default JoinGroupModal;
