import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, HandCoins, Loader2, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import groupService from "../../services/groupService";

const DebtDetailsModal = ({ isOpen, onClose, details, groupId, onSuccess }) => {
  const [loadingId, setLoadingId] = useState(null);
  const [confirmData, setConfirmData] = useState(null);

  // Mở popup xác nhận
  const handleClickSettle = (receiverId, amount, name) => {
    setConfirmData({
      receiverId,
      amount: Math.abs(amount),
      name,
    });
  };

  // Gọi API thanh toán
  const executeSettle = async () => {
    if (!confirmData) return;

    const { receiverId, amount, name } = confirmData;
    setLoadingId(receiverId);
    setConfirmData(null); // Đóng popup xác nhận

    try {
      const payload = {
        groupId,
        receiverId,
        amount,
      };

      const res = await groupService.settleUp(payload);

      if (res.ok && res.data.success) {
        toast.success(`Đã thanh toán cho ${name}`);
        onSuccess(); // Reload data
      } else {
        toast.error(res.data.message || "Lỗi thanh toán");
      }
    } catch (error) {
      toast.error("Lỗi kết nối");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* 1. BACKDROP CHUNG (Click ra ngoài để đóng modal chính) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* 2. MAIN MODAL (DANH SÁCH NỢ) */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-[#1c2e26] w-full max-w-md rounded-3xl border border-[#2d4a3e] shadow-2xl overflow-hidden relative z-10"
            onClick={(e) => e.stopPropagation()} // Chặn click xuyên qua backdrop
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#2d4a3e] bg-[#1c2e26]">
              <h2 className="text-xl font-bold text-white">Chi tiết công nợ</h2>
              <button
                onClick={onClose}
                className="p-2 -mr-2 rounded-full hover:bg-[#2d4a3e] text-gray-400 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* List Scrollable */}
            <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {details && details.length > 0 ? (
                details.map((item) => {
                  const isOwing = item.amount < 0;
                  const absAmount = Math.abs(item.amount);

                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 bg-[#0b1411] rounded-2xl border border-[#2d4a3e]"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            item.avatar ||
                            `https://ui-avatars.com/api/?name=${item.name}`
                          }
                          alt={item.name}
                          className="w-12 h-12 rounded-full border border-[#2d4a3e]"
                        />
                        <div>
                          <h4 className="text-white font-bold">{item.name}</h4>
                          <p
                            className={`text-sm font-medium ${
                              isOwing ? "text-red-400" : "text-[#34d399]"
                            }`}
                          >
                            {isOwing ? "Bạn nợ" : "Nợ bạn"}:{" "}
                            {absAmount.toLocaleString()}đ
                          </p>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div>
                        {isOwing ? (
                          <button
                            onClick={() =>
                              handleClickSettle(item.id, item.amount, item.name)
                            }
                            disabled={loadingId === item.id}
                            className="flex items-center gap-2 bg-[#34d399] text-[#0b1411] px-3 py-2 rounded-xl font-bold text-xs hover:bg-[#2cb683] transition-colors shadow-lg shadow-[#34d399]/20 disabled:opacity-50"
                          >
                            {loadingId === item.id ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <>
                                <HandCoins size={16} />
                                Trả ngay
                              </>
                            )}
                          </button>
                        ) : (
                          <button
                            disabled
                            className="flex items-center gap-2 bg-[#1c2e26] text-gray-500 border border-[#2d4a3e] px-3 py-2 rounded-xl font-bold text-xs cursor-not-allowed opacity-50"
                          >
                            <CheckCircle size={16} />
                            Đợi trả
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-gray-500 py-8">
                  Không có khoản nợ nào.
                </div>
              )}
            </div>
          </motion.div>

          {/* 3. CONFIRMATION POPUP (NẰM NGOÀI MAIN MODAL ĐỂ KHÔNG BỊ CẮT) */}
          <AnimatePresence>
            {confirmData && (
              <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                {/* Backdrop riêng cho popup xác nhận */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/60 backdrop-blur-md"
                  onClick={() => setConfirmData(null)}
                />

                {/* Nội dung Popup Xác nhận */}
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-[#0b1411] w-full max-w-sm border border-[#34d399]/30 rounded-3xl p-6 shadow-2xl relative z-10"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Decorative Notch Top */}
                  <div className="absolute -top-px left-1/2 -translate-x-1/2 w-16 h-1 bg-[#34d399] rounded-b-full shadow-[0_0_10px_#34d399]"></div>

                  <div className="flex flex-col items-center text-center">
                    <h3 className="text-white text-xl font-bold mb-2 mt-2">
                      Xác nhận thanh toán
                    </h3>
                    <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                      Bạn xác nhận đã trả tiền mặt hoặc chuyển khoản cho <br />
                      <span className="text-white font-bold text-base">
                        {confirmData.name}
                      </span>
                      ?
                    </p>

                    {/* Amount Box */}
                    <div className="bg-[#1c2e26] rounded-2xl p-4 w-full border border-[#2d4a3e] mb-6 flex items-center justify-between group hover:border-[#34d399]/50 transition-colors">
                      <span className="text-gray-400 text-sm font-medium">
                        Số tiền
                      </span>
                      <span className="text-2xl font-bold text-[#34d399] tracking-tight">
                        {confirmData.amount.toLocaleString()}đ
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 w-full">
                      <button
                        onClick={() => setConfirmData(null)}
                        className="flex-1 py-3.5 rounded-xl font-bold text-gray-400 bg-[#1c2e26] hover:bg-[#2d4a3e] border border-[#2d4a3e] transition-colors"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={executeSettle}
                        className="flex-1 py-3.5 rounded-xl font-bold text-[#0b1411] bg-[#34d399] hover:bg-[#2cb683] shadow-lg shadow-[#34d399]/20 transition-all flex items-center justify-center gap-2"
                      >
                        Xác nhận <ArrowRight size={18} strokeWidth={3} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}
    </AnimatePresence>
  );
};

export default DebtDetailsModal;
