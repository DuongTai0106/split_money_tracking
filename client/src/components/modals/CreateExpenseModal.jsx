import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Save,
  FileText,
  ScanLine,
  Calendar,
  User,
  Check,
  Search,
  ChevronRight,
} from "lucide-react";

// --- MOCK DATA FOR MEMBERS ---
const MEMBERS = [
  {
    id: 1,
    name: "Bạn",
    avatar: "https://ui-avatars.com/api/?name=You",
    isMe: true,
  },
  {
    id: 2,
    name: "Hương Lan",
    avatar: "https://ui-avatars.com/api/?name=Huong+Lan",
    isMe: false,
  },
  {
    id: 3,
    name: "Tuấn Anh",
    avatar: "https://ui-avatars.com/api/?name=Tuan+Anh",
    isMe: false,
  },
  {
    id: 4,
    name: "Minh",
    avatar: "https://ui-avatars.com/api/?name=Minh",
    isMe: false,
  },
];

const CATEGORIES = [
  { id: "food", label: "Ăn uống", icon: "Utensils" },
  { id: "transport", label: "Di chuyển", icon: "Car" },
  { id: "shopping", label: "Mua sắm", icon: "ShoppingCart" },
  { id: "entertainment", label: "Giải trí", icon: "PartyPopper" },
];

const SPLIT_METHODS = [
  { id: "equal", label: "Chia đều" },
  { id: "amount", label: "Số tiền" },
];

// --- 1. THÊM CÁC HÀM NÀY ĐỂ XỬ LÝ SỐ TIỀN ---
const formatCurrency = (value) => {
  if (!value) return "";
  // Xóa hết ký tự không phải số
  const rawValue = value.replace(/\D/g, "");
  // Thêm dấu chấm phân cách hàng nghìn
  return rawValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const parseCurrency = (value) => {
  // Xóa dấu chấm để lấy số nguyên tính toán
  return parseInt(value.replace(/\./g, "") || "0", 10);
};

const CreateExpenseModal = ({ isOpen, onClose }) => {
  // --- FORM STATE ---
  const [amount, setAmount] = useState("100.000"); // String để dễ nhập liệu
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("food");
  const [splitMethod, setSplitMethod] = useState("equal");

  // State quản lý danh sách người được chia tiền (Mặc định chọn tất cả)
  const [selectedMembers, setSelectedMembers] = useState(
    MEMBERS.map((m) => m.id)
  );

  // --- 2. SỬA LẠI LOGIC TÍNH TOÁN (Dùng parseCurrency) ---
  const rawAmount = parseCurrency(amount); // Chuyển chuỗi "100.000" thành số 100000

  const perPersonAmount =
    selectedMembers.length > 0 ? rawAmount / selectedMembers.length : 0;

  const handleAmountChange = (e) => {
    const input = e.target.value;
    // Format lại input ngay lập tức rồi set vào state
    setAmount(formatCurrency(input));
  };

  const toggleMember = (id) => {
    if (selectedMembers.includes(id)) {
      setSelectedMembers(selectedMembers.filter((m) => m !== id));
    } else {
      setSelectedMembers([...selectedMembers, id]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedMembers.length === MEMBERS.length) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(MEMBERS.map((m) => m.id));
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-0 lg:p-4"
        >
          {/* Modal Container */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-[#1c2e26] w-full lg:max-w-5xl h-full lg:h-auto lg:max-h-[90vh] lg:rounded-3xl flex flex-col overflow-hidden shadow-2xl"
          >
            {/* --- HEADER --- */}
            <div className="flex items-center justify-between p-4 lg:p-6 border-b border-[#2d4a3e] bg-[#1c2e26] z-10">
              <button
                onClick={onClose}
                className="p-2 -ml-2 rounded-full hover:bg-[#2d4a3e] transition-colors text-white"
              >
                <X size={24} />
              </button>
              <h2 className="text-xl font-bold text-white">Thêm Chi tiêu</h2>
              <button className="bg-[#34d399] text-[#0b1411] px-4 py-1.5 rounded-lg font-bold text-sm hover:bg-[#2cb683] transition-colors">
                Lưu
              </button>
            </div>

            {/* --- BODY (Scrollable) --- */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#0b1411] lg:bg-[#1c2e26]">
              {/* GRID SYSTEM */}
              <div className="flex flex-col lg:grid lg:grid-cols-2 lg:gap-8 lg:p-8">
                {/* === LEFT COLUMN: INPUT INFOS === */}
                <div className="p-4 space-y-6">
                  {/* 1. Amount Input (Big) */}
                  <div className="flex flex-col items-center justify-center py-6 lg:py-0">
                    <div className="flex items-center gap-2 text-[#34d399]">
                      <span className="p-1.5 bg-[#34d399]/10 rounded-full">
                        <ScanLine size={16} /> {/* Giả lập icon hóa đơn */}
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wider">
                        Tổng tiền
                      </span>
                    </div>
                    <div className="relative mt-2 flex items-baseline justify-center w-full">
                      <input
                        type="text" // Đổi từ number -> text
                        inputMode="numeric" // Để mobile hiện bàn phím số
                        value={amount}
                        onChange={handleAmountChange} // Dùng hàm handle mới
                        className="bg-transparent text-center text-5xl lg:text-6xl font-bold text-white focus:outline-none w-full placeholder-gray-600"
                        placeholder="0"
                      />
                      <span className="text-2xl text-gray-500 absolute right-4 lg:right-10 top-4">
                        đ
                      </span>
                    </div>
                  </div>

                  {/* 2. Description Input */}
                  <div className="flex items-center gap-3 bg-[#0b1411] lg:bg-[#16261f] p-4 rounded-2xl border border-[#2d4a3e]">
                    <FileText className="text-gray-400" size={20} />
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Mô tả (ví dụ: Ăn trưa, Grab...)"
                      className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none"
                    />
                    <button className="p-2 bg-[#1c2e26] rounded-lg text-gray-400 hover:text-white border border-[#2d4a3e]">
                      <ScanLine size={18} />
                    </button>
                  </div>

                  {/* 3. Category Selector */}
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setCategory(cat.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-full whitespace-nowrap font-medium text-sm transition-all border ${
                          category === cat.id
                            ? "bg-[#34d399] text-[#0b1411] border-[#34d399]"
                            : "bg-[#1c2e26] text-gray-400 border-[#2d4a3e] hover:border-[#34d399]/50"
                        }`}
                      >
                        {/* Bạn có thể map icon thật ở đây */}
                        <span>{cat.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* 4. Meta Info (Date & Payer) */}
                  <div className="bg-[#1c2e26] lg:bg-[#16261f] rounded-2xl border border-[#2d4a3e] overflow-hidden">
                    {/* Date */}
                    <div className="flex items-center justify-between p-4 border-b border-[#2d4a3e] hover:bg-[#233930] cursor-pointer transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500">
                          <Calendar size={18} />
                        </div>
                        <span className="text-white font-medium">Ngày</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <span>Hôm nay, 24/10</span>
                        <ChevronRight size={16} />
                      </div>
                    </div>

                    {/* Payer */}
                    <div className="flex items-center justify-between p-4 hover:bg-[#233930] cursor-pointer transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#34d399]/10 rounded-lg text-[#34d399]">
                          <User size={18} />
                        </div>
                        <span className="text-white font-medium">
                          Người trả tiền
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <img
                          src={MEMBERS[0].avatar}
                          className="w-6 h-6 rounded-full"
                          alt="Me"
                        />
                        <span className="text-[#34d399] font-bold text-sm">
                          Bạn
                        </span>
                        <ChevronRight size={16} className="text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* === RIGHT COLUMN: SPLIT LOGIC === */}
                <div className="p-4 space-y-4 lg:border-l lg:border-[#2d4a3e] lg:pl-8">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-bold text-lg">
                      Chia cho ai?
                    </h3>
                    <button
                      onClick={toggleSelectAll}
                      className="text-[#34d399] text-sm font-bold hover:underline"
                    >
                      {selectedMembers.length === MEMBERS.length
                        ? "Bỏ chọn tất cả"
                        : "Chọn tất cả"}
                    </button>
                  </div>

                  {/* Split Method Tabs */}
                  <div className="flex bg-[#0b1411] p-1 rounded-xl border border-[#2d4a3e]">
                    {SPLIT_METHODS.map((method) => (
                      <button
                        key={method.id}
                        onClick={() => setSplitMethod(method.id)}
                        className={`flex-1 py-2 rounded-lg text-xs lg:text-sm font-bold transition-colors ${
                          splitMethod === method.id
                            ? "bg-[#1c2e26] text-white shadow-sm border border-[#2d4a3e]"
                            : "text-gray-500 hover:text-gray-300"
                        }`}
                      >
                        {method.label}
                      </button>
                    ))}
                  </div>

                  {/* Calculation Summary Bar */}
                  <div className="flex items-center justify-between bg-[#1c2e26] px-4 py-3 rounded-xl border border-[#2d4a3e]">
                    <div className="flex items-center gap-2 text-gray-400 text-xs">
                      <div className="w-4 h-4 bg-gray-600 rounded-full flex items-center justify-center text-[10px] text-black font-bold">
                        i
                      </div>
                      Chia đều cho {selectedMembers.length} người
                    </div>
                    <span className="text-white font-bold font-mono">
                      {Math.round(perPersonAmount).toLocaleString("vi-VN")}đ /
                      người
                    </span>
                  </div>

                  {/* Members List with Toggle */}
                  <div className="space-y-3 mt-4">
                    {MEMBERS.map((member) => {
                      const isSelected = selectedMembers.includes(member.id);
                      return (
                        <div
                          key={member.id}
                          onClick={() => toggleMember(member.id)}
                          className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
                            isSelected
                              ? "bg-[#16261f] border-[#34d399]/30"
                              : "bg-[#0b1411] border-[#1c2e26] opacity-60"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <img
                                src={member.avatar}
                                alt={member.name}
                                className={`w-10 h-10 rounded-full border-2 ${
                                  isSelected
                                    ? "border-[#34d399]"
                                    : "border-gray-600"
                                }`}
                              />
                              {member.isMe && (
                                <div className="absolute -bottom-1 -right-1 bg-[#34d399] text-[#0b1411] rounded-full p-0.5 border border-[#0b1411]">
                                  <Check size={10} strokeWidth={4} />
                                </div>
                              )}
                            </div>
                            <div>
                              <p
                                className={`font-bold text-sm ${
                                  isSelected ? "text-white" : "text-gray-400"
                                }`}
                              >
                                {member.name}
                              </p>
                              <p
                                className={`text-xs ${
                                  isSelected
                                    ? "text-[#34d399]"
                                    : "text-gray-600"
                                }`}
                              >
                                {isSelected
                                  ? Math.round(perPersonAmount).toLocaleString(
                                      "vi-VN"
                                    ) + "đ"
                                  : "0đ"}
                              </p>
                            </div>
                          </div>

                          {/* Custom Toggle Switch */}
                          <div
                            className={`w-12 h-7 rounded-full flex items-center p-1 transition-colors duration-300 ${
                              isSelected ? "bg-[#34d399]" : "bg-gray-600"
                            }`}
                          >
                            <motion.div
                              layout
                              className="w-5 h-5 bg-white rounded-full shadow-md"
                              transition={{
                                type: "spring",
                                stiffness: 500,
                                damping: 30,
                              }}
                              style={{ marginLeft: isSelected ? "auto" : "0" }}
                            />
                          </div>
                        </div>
                      );
                    })}
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

export default CreateExpenseModal;
