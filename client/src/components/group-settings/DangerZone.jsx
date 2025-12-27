import React, { useState } from "react";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import groupService from "../../services/groupService";

const DangerZone = ({ groupId, isCreator }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Xử lý logic xóa
  const handleConfirmDelete = async () => {
    setIsLoading(true);
    try {
      const res = await groupService.deleteGroup(groupId);
      if (res.ok && res.data.success) {
        toast.success("Đã giải tán nhóm thành công");
        navigate("/"); // Quay về trang chủ
      } else {
        toast.error(res.data.message || "Lỗi khi xóa nhóm");
      }
    } catch (error) {
      toast.error("Lỗi kết nối server");
    } finally {
      setIsLoading(false);
      setIsModalOpen(false);
    }
  };

  // Kiểm tra quyền khi bấm nút
  const handleClickDelete = () => {
    if (!isCreator) {
      toast.error("Chỉ người tạo nhóm mới có quyền giải tán nhóm!");
      return;
    }
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="space-y-2">
        <h3 className="text-red-500 text-xs font-bold uppercase tracking-wider ml-1">
          Vùng nguy hiểm
        </h3>
        <div className="bg-[#1c2e26] rounded-2xl border border-red-500/20 overflow-hidden">
          <div
            onClick={handleClickDelete}
            className={`p-4 flex items-center justify-between transition-colors group ${
              isCreator
                ? "hover:bg-red-500/5 cursor-pointer"
                : "opacity-50 cursor-not-allowed grayscale"
            }`}
          >
            <div>
              <h4 className="text-red-500 font-bold text-sm group-hover:text-red-400">
                Giải tán nhóm
              </h4>
              <p className="text-xs text-gray-500 mt-0.5">
                {isCreator
                  ? "Xóa vĩnh viễn nhóm và mọi dữ liệu chi tiêu"
                  : "Chỉ người tạo nhóm mới có quyền này"}
              </p>
            </div>
            <div className="p-2 bg-red-500/10 rounded-lg text-red-500 group-hover:bg-red-500 group-hover:text-white transition-colors">
              <Trash2 size={18} />
            </div>
          </div>
        </div>
      </div>

      {/* --- MODAL CẢNH BÁO ĐẸP MẮT --- */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()} // Chặn click xuyên qua modal
              className="bg-[#1c2e26] w-full max-w-sm rounded-3xl border border-red-500/30 shadow-2xl overflow-hidden"
            >
              {/* Header Modal */}
              <div className="p-6 pb-0 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4 text-red-500 animate-pulse">
                  <AlertTriangle size={32} strokeWidth={2.5} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Bạn chắc chắn chứ?
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Hành động này sẽ xóa nhóm vĩnh viễn và{" "}
                  <strong className="text-red-400">không thể hoàn tác</strong>.
                  Tất cả lịch sử chi tiêu và nợ nần của các thành viên trong
                  nhóm này sẽ bị mất sạch.
                </p>
              </div>

              {/* Actions */}
              <div className="p-6 flex gap-3 mt-2">
                <button
                  onClick={() => setIsModalOpen(false)}
                  disabled={isLoading}
                  className="flex-1 py-3 rounded-xl font-bold text-sm bg-gray-700/50 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={isLoading}
                  className="flex-1 py-3 rounded-xl font-bold text-sm bg-red-500 text-white hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <>
                      <Trash2 size={18} />
                      Xóa nhóm
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DangerZone;
