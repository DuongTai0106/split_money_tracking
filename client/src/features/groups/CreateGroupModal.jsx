import React, { useState } from "react";
import { X, Plane, Home, Heart, Briefcase, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import Modal from "../../components/ui/Modal";
import groupService from "../../services/groupService"; // Import Service vừa tạo

const CURRENCIES = [
  { code: "VND", label: "Việt Nam Đồng", symbol: "₫" },
  { code: "USD", label: "US Dollar", symbol: "$" },
  { code: "JPY", label: "Japanese Yen", symbol: "¥" },
];

const GROUP_TYPES = [
  {
    id: "trip",
    label: "Du lịch",
    icon: <Plane className="h-5 w-5" />,
    color: "bg-blue-100 text-blue-600",
  },
  {
    id: "home",
    label: "Nhà cửa",
    icon: <Home className="h-5 w-5" />,
    color: "bg-green-100 text-green-600",
  },
  {
    id: "couple",
    label: "Cặp đôi",
    icon: <Heart className="h-5 w-5" />,
    color: "bg-pink-100 text-pink-600",
  },
  {
    id: "other",
    label: "Khác",
    icon: <Briefcase className="h-5 w-5" />,
    color: "bg-gray-100 text-gray-600",
  },
];

const CreateGroupModal = ({ isOpen, onClose, onSuccess }) => {
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState("VND");
  const [selectedType, setSelectedType] = useState("trip"); // Mặc định là du lịch
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    // 1. Validate
    if (!name.trim()) {
      toast.error("Vui lòng nhập tên nhóm");
      return;
    }

    setIsLoading(true);

    // 2. Gọi API qua Service
    // Ta dùng trường 'description' để lưu 'type' (trip, home...)
    const payload = {
      name: name,
      currency_code: currency,
      description: selectedType,
    };

    const result = await groupService.createGroup(payload);

    setIsLoading(false);

    // 3. Xử lý kết quả
    if (result.ok) {
      toast.success("Tạo nhóm thành công!");
      setName("");
      if (onSuccess) onSuccess(); // Gọi hàm refresh list ở trang cha
      onClose(); // Đóng modal
    } else {
      toast.error(result.data.message || "Có lỗi xảy ra");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tạo nhóm mới">
      <div className="space-y-6">
        {/* Input Tên */}
        <div>
          <label className="text-sm font-medium text-gray-700">Tên nhóm</label>
          <input
            className="w-full mt-1 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder="Ví dụ: Chuyến đi Phú Quốc"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </div>

        {/* Chọn Loại Nhóm (Để lưu vào description) */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Loại nhóm
          </label>
          <div className="grid grid-cols-2 gap-3">
            {GROUP_TYPES.map((type) => (
              <div
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`cursor-pointer p-3 rounded-xl border flex items-center gap-3 transition-all ${
                  selectedType === type.id
                    ? "border-indigo-600 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600"
                    : "border-gray-200 hover:border-gray-300 text-gray-600"
                }`}
              >
                <div className={`p-1.5 rounded-lg ${type.color}`}>
                  {type.icon}
                </div>
                <span className="text-sm font-medium">{type.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chọn Tiền tệ */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Đơn vị tiền tệ chính
          </label>
          <div className="grid grid-cols-3 gap-2">
            {CURRENCIES.map((curr) => (
              <div
                key={curr.code}
                onClick={() => setCurrency(curr.code)}
                className={`cursor-pointer border rounded-lg p-3 flex flex-col items-center justify-center transition-all ${
                  currency === curr.code
                    ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <span className="text-lg font-bold">{curr.code}</span>
                <span className="text-xs text-gray-500">{curr.symbol}</span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 mt-4 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
          {isLoading ? "Đang tạo..." : "Tạo nhóm ngay"}
        </button>
      </div>
    </Modal>
  );
};
export default CreateGroupModal;
