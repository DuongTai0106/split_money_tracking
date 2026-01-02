import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Users, CheckCircle, Loader2 } from "lucide-react";

const JoinGroupConfirmModal = ({
  isOpen,
  onClose,
  groupInfo,
  onConfirm,
  loading,
}) => {
  return (
    <AnimatePresence>
      {isOpen && groupInfo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-[#1c2e26] w-full max-w-sm rounded-3xl border border-[#2d4a3e] shadow-2xl overflow-hidden"
          >
            <div className="p-6 text-center">
              <div className="w-20 h-20 mx-auto bg-[#34d399]/10 rounded-full flex items-center justify-center mb-4 border border-[#34d399]/30">
                <img
                  src={
                    groupInfo.image_url ||
                    `https://ui-avatars.com/api/?name=${groupInfo.name}`
                  }
                  alt={groupInfo.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
              </div>

              <h2 className="text-xl font-bold text-white mb-1">
                {groupInfo.name}
              </h2>
              <div className="flex items-center justify-center gap-2 text-gray-400 text-sm mb-6">
                <Users size={14} />
                <span>{groupInfo.member_count || 1} thành viên</span>
              </div>

              <p className="text-gray-300 text-sm mb-6">
                Bạn có chắc chắn muốn tham gia nhóm này không?
              </p>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 bg-[#0b1411] border border-[#2d4a3e] rounded-xl text-gray-400 font-bold hover:bg-[#16261f] transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={onConfirm}
                  disabled={loading}
                  className="flex-1 py-3 bg-[#34d399] text-[#0b1411] rounded-xl font-bold hover:bg-[#2cb683] transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <>
                      <CheckCircle size={20} />
                      Tham gia
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default JoinGroupConfirmModal;
