import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Receipt, User, Image as ImageIcon } from "lucide-react";

const BillDetailModal = ({ isOpen, onClose, bill }) => {
  if (!bill) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#1c2e26] w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-[#2d4a3e] flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-4 border-b border-[#2d4a3e] flex justify-between items-center bg-[#16261f]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#34d399]/10 rounded-full text-[#34d399]">
                  <Receipt size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">{bill.title}</h3>
                  <p className="text-xs text-gray-400">
                    {bill.timestamp
                      ? new Date(bill.timestamp).toLocaleDateString("vi-VN")
                      : ""}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 bg-black/20 rounded-full text-gray-400 hover:text-white hover:bg-black/40"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto custom-scrollbar flex-1">
              {/* 1. IMAGE SECTION (Nổi bật nhất) */}
              {bill.image_url ? (
                <div className="w-full bg-black flex items-center justify-center relative group">
                  <img
                    src={bill.image_url}
                    alt="Bill"
                    className="w-full h-auto max-h-[400px] object-contain"
                  />
                </div>
              ) : (
                <div className="w-full h-32 bg-[#0b1411] flex flex-col items-center justify-center text-gray-500 border-b border-[#2d4a3e]">
                  <ImageIcon size={32} className="opacity-50 mb-2" />
                  <span className="text-xs">Không có hình ảnh hóa đơn</span>
                </div>
              )}

              {/* 2. INFO SECTION */}
              <div className="p-6 space-y-4">
                {/* Amount */}
                <div className="text-center">
                  <span className="text-gray-400 text-xs uppercase tracking-wider">
                    Tổng tiền
                  </span>
                  <h2 className="text-3xl font-bold text-[#34d399] mt-1">
                    {bill.amount}
                  </h2>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="bg-[#0b1411] p-3 rounded-xl border border-[#2d4a3e]">
                    <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                      <User size={10} /> Người trả
                    </p>
                    <p className="text-white font-medium text-sm truncate">
                      {bill.payer}
                    </p>
                  </div>
                  <div className="bg-[#0b1411] p-3 rounded-xl border border-[#2d4a3e]">
                    <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                      <Receipt size={10} /> Danh mục
                    </p>
                    <p className="text-white font-medium text-sm capitalize">
                      {bill.category}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BillDetailModal;
// Import icon này ở đầu file nếu chưa có
