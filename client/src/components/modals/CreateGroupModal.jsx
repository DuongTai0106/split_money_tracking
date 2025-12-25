import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Camera, Calendar, ArrowRight, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import groupService from "../../services/groupService";

const CreateGroupModal = ({ isOpen, onClose, onGroupCreated }) => {
  const [currency, setCurrency] = useState("VND");
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null); // State mới để lưu file gốc
  const [groupName, setGroupName] = useState("");
  // Thêm state cho ngày tháng để gửi lên backend (nếu backend hỗ trợ)
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Xử lý khi chọn ảnh
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 1. Lưu file gốc để gửi lên server
      setSelectedFile(file);

      // 2. Tạo preview để hiển thị trên UI ngay lập tức
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!groupName.trim()) {
      toast.error("Vui lòng nhập tên nhóm!");
      return;
    }

    setIsLoading(true);
    try {
      // CHỈNH SỬA QUAN TRỌNG: Sử dụng FormData thay vì JSON
      const formData = new FormData();

      // Append các text field
      formData.append("name", groupName);
      formData.append("description", "Nhóm được tạo từ App"); // Backend có field này, gửi tạm giá trị mặc định hoặc thêm input
      // Nếu backend của bạn chưa xử lý start/end date thì nó sẽ tự bỏ qua, không sao cả
      formData.append("currency", currency);
      if (startDate) formData.append("startDate", startDate);
      if (endDate) formData.append("endDate", endDate);

      // Append file ảnh (Key phải là 'groupImage' khớp với backend route upload.single('groupImage'))
      if (selectedFile) {
        formData.append("groupImage", selectedFile);
      }

      // Gọi service (Lưu ý: groupService cần hỗ trợ nhận FormData, thông thường axios tự xử lý header)
      const res = await groupService.createGroup(formData);

      if (res.data) {
        // Kiểm tra kết quả trả về từ backend
        toast.success("Tạo nhóm thành công!");
        onGroupCreated(); // Reload list

        // Reset form
        setGroupName("");
        setImagePreview(null);
        setSelectedFile(null);
        setStartDate("");
        setEndDate("");
        setCurrency("VND");
        onClose();
      }
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.message || "Lỗi tạo nhóm";
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 1. Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            {/* 2. Modal Container */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#1c2e26] w-full max-w-md rounded-3xl border border-[#2d4a3e] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-[#2d4a3e]">
                <button
                  onClick={onClose}
                  className="p-2 -ml-2 rounded-full hover:bg-[#2d4a3e] transition-colors text-white"
                >
                  <X size={20} />
                </button>
                <h2 className="text-xl font-bold text-white">Tạo Nhóm Mới</h2>
                <div className="w-8" />
              </div>

              {/* Scrollable Content */}
              <div className="p-6 overflow-y-auto custom-scrollbar">
                {/* Image Uploader */}
                <div className="flex flex-col items-center mb-8">
                  <div
                    className="relative group cursor-pointer"
                    onClick={() => fileInputRef.current.click()}
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-28 h-28 rounded-full bg-gradient-to-br from-[#2d4a3e] to-[#0b1411] border-2 border-[#34d399] flex items-center justify-center overflow-hidden shadow-lg shadow-[#34d399]/20"
                    >
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Group Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#0b1411] flex items-center justify-center">
                          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-pink-500/20 to-orange-500/20 blur-xl absolute"></div>
                        </div>
                      )}
                    </motion.div>

                    {/* Camera Icon Badge */}
                    <div className="absolute bottom-0 right-0 bg-[#34d399] p-2 rounded-full text-[#0b1411] border-4 border-[#1c2e26] group-hover:bg-white transition-colors">
                      <Camera size={18} />
                    </div>
                  </div>
                  <span
                    className="mt-3 text-[#34d399] text-sm font-medium cursor-pointer hover:underline"
                    onClick={() => fileInputRef.current.click()}
                  >
                    Ảnh đại diện nhóm
                  </span>
                  <p className="text-gray-500 text-xs mt-1">Chạm để tải lên</p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </div>

                {/* Form Fields */}
                <div className="space-y-6">
                  {/* Tên nhóm */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">
                      Tên nhóm
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        placeholder="Ví dụ: Chuyến đi Đà Lạt..."
                        className="w-full bg-[#0b1411] border border-[#2d4a3e] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#34d399] focus:ring-1 focus:ring-[#34d399] transition-all"
                      />
                    </div>
                  </div>

                  {/* Loại tiền tệ */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">
                      Loại tiền tệ
                    </label>
                    <div className="bg-[#0b1411] p-1 rounded-xl flex border border-[#2d4a3e]">
                      {["VND", "USD"].map((curr) => (
                        <button
                          key={curr}
                          onClick={() => setCurrency(curr)}
                          className={`flex-1 py-2 rounded-lg text-sm font-bold relative z-10 transition-colors ${
                            currency === curr
                              ? "text-[#0b1411]"
                              : "text-gray-400 hover:text-white"
                          }`}
                        >
                          {currency === curr && (
                            <motion.div
                              layoutId="activeCurrency"
                              className="absolute inset-0 bg-[#34d399] rounded-lg -z-10 shadow-md"
                              transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 30,
                              }}
                            />
                          )}
                          {curr}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Button */}
              <div className="p-6 border-t border-[#2d4a3e] bg-[#1c2e26]">
                <motion.button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-[#34d399] text-[#0b1411] py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-[#2cb683] transition-colors shadow-lg shadow-[#34d399]/20"
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <>
                      <span>Tạo Nhóm</span>
                      <ArrowRight size={20} strokeWidth={3} />
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CreateGroupModal;
