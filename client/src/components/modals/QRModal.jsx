import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Share2 } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import toast from "react-hot-toast";

export const QRModal = ({ isOpen, onClose, value, title, groupName }) => {
  const handleCopyLink = () => {
    navigator.clipboard.writeText(value);
    toast.success("Đã sao chép link tham gia!");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            {/* Modal Card */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#1c2e26] w-full max-w-sm rounded-3xl border border-[#2d4a3e] shadow-2xl relative flex flex-col overflow-visible" // Sửa overflow-hidden thành visible hoặc bỏ đi nếu cần shadow nổi
            >
              {/* Nút đóng */}
              <button
                onClick={onClose}
                className="absolute top-3 right-3 p-2 bg-black/20 hover:bg-[#2d4a3e] rounded-full text-white/70 hover:text-white transition-colors z-20"
              >
                <X size={20} />
              </button>

              {/* Phần Header chứa QR Code */}
              {/* Tăng chiều cao h-32 để có không gian cho QR Code "thở" */}
              <div className="h-32 bg-gradient-to-br from-[#2d4a3e] to-[#1c2e26] rounded-t-3xl relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
              </div>

              {/* QR Code container - Đẩy lên trên bằng margin âm */}
              <div className="relative -mt-16 flex justify-center px-6">
                <div className="bg-[#1c2e26] p-2 rounded-2xl shadow-xl border border-[#2d4a3e]">
                  <div className="bg-white p-3 rounded-xl">
                    <QRCodeCanvas
                      value={value}
                      size={160} // Giảm size xuống một chút cho vừa vặn
                      bgColor="#ffffff"
                      fgColor="#000000"
                      level="Q"
                    />
                  </div>
                </div>
              </div>

              {/* Body Content */}
              <div className="pt-6 pb-8 px-6 text-center space-y-4">
                <div>
                  <h3 className="text-white font-bold text-xl">{title}</h3>
                  {groupName && (
                    <p className="text-[#34d399] font-medium text-sm mt-1">
                      {groupName}
                    </p>
                  )}
                </div>

                <p className="text-gray-400 text-sm leading-relaxed px-4">
                  Sử dụng camera hoặc ứng dụng quét mã để tham gia nhóm.
                </p>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleCopyLink}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#0b1411] hover:bg-[#2d4a3e] border border-[#2d4a3e] text-white py-3 rounded-xl font-medium transition-all text-sm group"
                  >
                    <Copy
                      size={16}
                      className="text-gray-400 group-hover:text-[#34d399]"
                    />
                    Sao chép Link
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 bg-[#34d399] hover:bg-[#2cb683] text-[#0b1411] py-3 rounded-xl font-bold transition-all text-sm shadow-lg shadow-[#34d399]/20">
                    <Share2 size={16} />
                    Chia sẻ
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

