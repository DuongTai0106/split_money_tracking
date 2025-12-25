import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  FileText,
  ScanLine,
  Calendar,
  User,
  Check,
  ChevronRight,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import groupService from "../../services/groupService";

// Helper xử lý tiền tệ
const formatCurrency = (value) => {
  if (!value) return "";
  const rawValue = value.toString().replace(/\D/g, "");
  return rawValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const parseCurrency = (value) => {
  if (!value) return 0;
  return parseInt(value.toString().replace(/\./g, "") || "0", 10);
};

const CATEGORIES = [
  { id: "food", label: "Ăn uống" },
  { id: "transport", label: "Di chuyển" },
  { id: "shopping", label: "Mua sắm" },
  { id: "entertainment", label: "Giải trí" },
  { id: "general", label: "Khác" },
];

const CreateExpenseModal = ({
  isOpen,
  onClose,
  groupId,
  members = [],
  onSuccess,
}) => {
  // --- FORM STATE ---
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("food");
  const [loading, setLoading] = useState(false);

  // Mặc định chọn tất cả thành viên trong nhóm
  const [selectedMembers, setSelectedMembers] = useState([]);

  // Reset form khi mở modal
  useEffect(() => {
    if (isOpen) {
      setAmount("");
      setDescription("");
      setCategory("food");
      // Khi mở modal, mặc định tick chọn tất cả member
      if (members.length > 0) {
        setSelectedMembers(members.map((m) => m.id));
      }
    }
  }, [isOpen, members]);

  // --- LOGIC TÍNH TOÁN ---
  const rawAmount = parseCurrency(amount);

  // Logic Chia đều (Equal Split)
  // Nếu có người được chọn, chia đều. Nếu không, = 0
  const perPersonAmount =
    selectedMembers.length > 0
      ? Math.floor(rawAmount / selectedMembers.length)
      : 0;

  const handleAmountChange = (e) => {
    setAmount(formatCurrency(e.target.value));
  };

  const toggleMember = (id) => {
    if (selectedMembers.includes(id)) {
      setSelectedMembers(selectedMembers.filter((m) => m !== id));
    } else {
      setSelectedMembers([...selectedMembers, id]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedMembers.length === members.length) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(members.map((m) => m.id));
    }
  };

  // --- XỬ LÝ SUBMIT ---
  const handleSave = async () => {
    // 1. Validate
    if (rawAmount <= 0) return toast.error("Vui lòng nhập số tiền!");
    if (!description.trim()) return toast.error("Vui lòng nhập mô tả!");
    if (selectedMembers.length === 0)
      return toast.error("Chọn ít nhất 1 người để chia tiền!");

    setLoading(true);

    // 2. Chuẩn bị payload gửi Backend
    // Tạo mảng splitDetails: [{ user_id: 1, amount: 50000 }, ...]
    const splitDetails = selectedMembers.map((memberId) => ({
      user_id: memberId,
      amount: perPersonAmount, // Hiện tại đang làm logic chia đều đơn giản
    }));

    // Xử lý số dư lẻ (nếu chia không hết). Ví dụ 100k chia 3 người = 33333. Dư 1 đồng.
    // Cộng phần dư vào người đầu tiên hoặc người trả tiền (tuỳ logic, ở đây mình bỏ qua cho đơn giản hoặc bạn cộng vào item đầu)
    const totalSplit = perPersonAmount * selectedMembers.length;
    const remainder = rawAmount - totalSplit;
    if (remainder > 0 && splitDetails.length > 0) {
      splitDetails[0].amount += remainder;
    }

    const payload = {
      groupId: groupId,
      title: description,
      amount: rawAmount,
      category: category,
      splitDetails: splitDetails,
    };

    // 3. Gọi API
    try {
      const res = await groupService.createBill(payload);
      if (res.ok && res.data.success) {
        toast.success("Đã thêm hóa đơn!");
        if (onSuccess) onSuccess(); // Callback để reload lại trang GroupDetail
        onClose();
      } else {
        toast.error(res.data.message || "Lỗi khi lưu hóa đơn");
      }
    } catch (error) {
      toast.error("Lỗi kết nối");
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
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-0 lg:p-4"
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-[#1c2e26] w-full lg:max-w-4xl h-full lg:h-auto lg:max-h-[90vh] lg:rounded-3xl flex flex-col overflow-hidden shadow-2xl"
          >
            {/* HEADER */}
            <div className="flex items-center justify-between p-4 border-b border-[#2d4a3e] bg-[#1c2e26] z-10">
              <button
                onClick={onClose}
                className="p-2 -ml-2 rounded-full hover:bg-[#2d4a3e] text-white"
              >
                <X size={24} />
              </button>
              <h2 className="text-xl font-bold text-white">Thêm Chi tiêu</h2>
              <button
                onClick={handleSave}
                disabled={loading}
                className="bg-[#34d399] text-[#0b1411] px-4 py-1.5 rounded-lg font-bold text-sm hover:bg-[#2cb683] transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                Lưu
              </button>
            </div>

            {/* BODY */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#0b1411] lg:bg-[#1c2e26]">
              <div className="flex flex-col lg:grid lg:grid-cols-2 lg:gap-8 lg:p-8">
                {/* LEFT: INPUTS */}
                <div className="p-4 space-y-6">
                  {/* Amount */}
                  <div className="flex flex-col items-center justify-center py-6 lg:py-0">
                    <div className="flex items-center gap-2 text-[#34d399]">
                      <span className="p-1.5 bg-[#34d399]/10 rounded-full">
                        <ScanLine size={16} />
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wider">
                        Tổng tiền
                      </span>
                    </div>
                    <div className="relative mt-2 flex items-baseline justify-center w-full">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={amount}
                        onChange={handleAmountChange}
                        className="bg-transparent text-center text-5xl lg:text-6xl font-bold text-white focus:outline-none w-full placeholder-gray-600"
                        placeholder="0"
                        autoFocus
                      />
                      <span className="text-2xl text-gray-500 absolute right-4 lg:right-10 top-4">
                        đ
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="flex items-center gap-3 bg-[#0b1411] lg:bg-[#16261f] p-4 rounded-2xl border border-[#2d4a3e]">
                    <FileText className="text-gray-400" size={20} />
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Mô tả (ví dụ: Ăn trưa, Grab...)"
                      className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none"
                    />
                  </div>

                  {/* Category */}
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setCategory(cat.id)}
                        className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium border transition-all ${
                          category === cat.id
                            ? "bg-[#34d399] text-[#0b1411] border-[#34d399]"
                            : "bg-[#1c2e26] text-gray-400 border-[#2d4a3e]"
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* Date & Payer (Static for now) */}
                  <div className="bg-[#1c2e26] lg:bg-[#16261f] rounded-2xl border border-[#2d4a3e] p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#34d399]/10 rounded-lg text-[#34d399]">
                        <User size={18} />
                      </div>
                      <span className="text-white text-sm font-medium">
                        Người trả: <span className="text-[#34d399]">Bạn</span>
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">Hôm nay</span>
                  </div>
                </div>

                {/* RIGHT: SPLIT LOGIC */}
                <div className="p-4 space-y-4 lg:border-l lg:border-[#2d4a3e] lg:pl-8">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-bold text-lg">
                      Chia cho ai?
                    </h3>
                    <button
                      onClick={toggleSelectAll}
                      className="text-[#34d399] text-sm font-bold hover:underline"
                    >
                      {selectedMembers.length === members.length
                        ? "Bỏ chọn tất cả"
                        : "Chọn tất cả"}
                    </button>
                  </div>

                  {/* Summary */}
                  <div className="flex items-center justify-between bg-[#1c2e26] px-4 py-3 rounded-xl border border-[#2d4a3e]">
                    <div className="flex items-center gap-2 text-gray-400 text-xs">
                      <div className="w-4 h-4 bg-gray-600 rounded-full flex items-center justify-center text-[10px] text-black font-bold">
                        i
                      </div>
                      Chia đều cho {selectedMembers.length} người
                    </div>
                    <span className="text-white font-bold font-mono">
                      {perPersonAmount.toLocaleString("vi-VN")}đ / người
                    </span>
                  </div>

                  {/* Member List */}
                  <div className="space-y-3 mt-4 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                    {members.map((member) => {
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
                                src={
                                  member.avatar ||
                                  `https://ui-avatars.com/api/?name=${member.name}&background=random`
                                }
                                alt={member.name}
                                className={`w-10 h-10 rounded-full border-2 ${
                                  isSelected
                                    ? "border-[#34d399]"
                                    : "border-gray-600"
                                }`}
                              />
                              {/* Icon check nếu là mình (tuỳ logic) */}
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
                                  ? perPersonAmount.toLocaleString("vi-VN") +
                                    "đ"
                                  : "0đ"}
                              </p>
                            </div>
                          </div>

                          {/* Toggle Switch */}
                          <div
                            className={`w-12 h-7 rounded-full flex items-center p-1 transition-colors duration-300 ${
                              isSelected ? "bg-[#34d399]" : "bg-gray-600"
                            }`}
                          >
                            <motion.div
                              layout
                              className="w-5 h-5 bg-white rounded-full shadow-md"
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
