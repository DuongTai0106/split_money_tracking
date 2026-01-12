import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  FileText,
  ScanLine,
  User,
  Check,
  Loader2,
  ChevronDown,
  Camera,
  Image as ImageIcon,
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
  currentUserId,
  onSuccess,
}) => {
  // --- FORM STATE ---
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("food");
  const [loading, setLoading] = useState(false);

  // Split Mode: 'equal' | 'amount'
  const [splitMethod, setSplitMethod] = useState("equal");

  // State cho người trả tiền
  const [payerId, setPayerId] = useState(null);
  const [isPayerDropdownOpen, setIsPayerDropdownOpen] = useState(false);
  const payerDropdownRef = useRef(null);

  // State chia tiền
  const [selectedMembers, setSelectedMembers] = useState([]); // For Equal Mode
  const [customAmounts, setCustomAmounts] = useState({}); // For Amount Mode: { userId: amount }

  // State Upload ảnh
  const [billImage, setBillImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  // Reset form & Set Default
  useEffect(() => {
    if (isOpen) {
      setAmount("");
      setDescription("");
      setCategory("food");
      setSplitMethod("equal");
      setIsPayerDropdownOpen(false);
      setCustomAmounts({});
      setBillImage(null);
      setPreviewUrl(null);

      // Mặc định chọn tất cả member
      if (members.length > 0) {
        setSelectedMembers(members.map((m) => m.id));

        // Use weak comparison ==
        const defaultPayer =
          members.find((m) => m.id == currentUserId) || members[0];
        setPayerId(defaultPayer ? defaultPayer.id : null);
      }
    }
  }, [isOpen, members, currentUserId]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        payerDropdownRef.current &&
        !payerDropdownRef.current.contains(event.target)
      ) {
        setIsPayerDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- LOGIC TÍNH TOÁN ---
  const rawAmount = parseCurrency(amount);

  // Equal Mode Logic
  const perPersonAmount =
    selectedMembers.length > 0
      ? Math.floor(rawAmount / selectedMembers.length)
      : 0;

  // Amount Mode Logic
  const currentTotalCustom = Object.values(customAmounts).reduce(
    (sum, val) => sum + val,
    0
  );
  const remainingAmount = rawAmount - currentTotalCustom;

  // --- HANDLERS ---
  const handleAmountChange = (e) => {
    setAmount(formatCurrency(e.target.value));
  };

  const handleCustomAmountChange = (userId, value) => {
    const numericValue = parseCurrency(value);
    setCustomAmounts((prev) => ({
      ...prev,
      [userId]: numericValue,
    }));
  };

  // Switch between modes Logic
  const handleMethodChange = (method) => {
    setSplitMethod(method);
    if (method === "amount") {
      const initialAmounts = {};
      members.forEach((m) => {
        initialAmounts[m.id] = 0;
      });
      setCustomAmounts(initialAmounts);
    } else {
      setSelectedMembers(members.map((m) => m.id));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBillImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const toggleMember = (id) => {
    if (splitMethod !== "equal") return; // Only toggle in equal mode
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

  const currentPayer = members.find((m) => m.id === payerId);

  // --- SUBMIT ---
  const handleSave = async () => {
    if (rawAmount <= 0) return toast.error("Vui lòng nhập số tiền!");
    if (!description.trim()) return toast.error("Vui lòng nhập mô tả!");
    if (!payerId) return toast.error("Vui lòng chọn người trả tiền!");

    let splitDetails = [];

    if (splitMethod === "equal") {
      if (selectedMembers.length === 0)
        return toast.error("Chọn ít nhất 1 người!");

      splitDetails = selectedMembers.map((uid) => ({
        user_id: uid,
        amount: perPersonAmount,
      }));
      // Fix rounding error
      const totalSplit = perPersonAmount * selectedMembers.length;
      const remainder = rawAmount - totalSplit;
      if (remainder > 0 && splitDetails.length > 0) {
        splitDetails[0].amount += remainder;
      }
    } else {
      // Amount Mode
      if (remainingAmount !== 0)
        return toast.error("Tổng chia chưa khớp với hóa đơn!");

      splitDetails = Object.entries(customAmounts)
        .filter(([_, val]) => val > 0) // Only include users with > 0 amount
        .map(([uid, val]) => ({
          user_id: parseInt(uid), // Ensure ID is int if DB expects int
          amount: val,
        }));

      if (splitDetails.length === 0)
        return toast.error("Vui lòng nhập số tiền cho thành viên!");
    }

    setLoading(true);

    // --- CHUẨN BỊ FORM DATA (Để gửi ảnh) ---
    const formData = new FormData();
    formData.append("groupId", groupId);
    formData.append("title", description);
    formData.append("amount", rawAmount);
    formData.append("category", category);
    formData.append("payer_id", payerId);

    // Serialize mảng object thành string JSON để gửi qua FormData
    formData.append("splitDetails", JSON.stringify(splitDetails));

    if (billImage) {
      formData.append("billImage", billImage);
    }

    try {
      const res = await groupService.createBill(formData);
      if (res.ok && res.data.success) {
        // Kiểm tra res.ok từ service
        toast.success("Đã thêm hóa đơn!");
        if (onSuccess) onSuccess();
        onClose();
      } else {
        toast.error(res.data?.message || "Lỗi khi lưu hóa đơn");
      }
    } catch (error) {
      console.error(error);
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

                  {/* IMAGE UPLOAD SECTION */}
                  <div className="space-y-2">
                    <label className="text-xs text-gray-500 font-bold uppercase ml-1">
                      Hình ảnh bill (Tùy chọn)
                    </label>

                    {!previewUrl ? (
                      <div
                        onClick={() => fileInputRef.current.click()}
                        className="border-2 border-dashed border-[#2d4a3e] rounded-xl p-4 flex flex-col items-center justify-center text-gray-500 hover:border-[#34d399] hover:text-[#34d399] transition-all cursor-pointer bg-[#16261f]/50 h-32"
                      >
                        <Camera size={24} className="mb-2" />
                        <span className="text-xs">Chạm để tải ảnh lên</span>
                      </div>
                    ) : (
                      <div className="relative h-32 rounded-xl overflow-hidden border border-[#2d4a3e] group">
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setBillImage(null);
                            setPreviewUrl(null);
                            fileInputRef.current.value = "";
                          }}
                          className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-red-500 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}

                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>

                  {/* PAYER SELECTION */}
                  <div ref={payerDropdownRef} className="relative">
                    <div
                      onClick={() =>
                        setIsPayerDropdownOpen(!isPayerDropdownOpen)
                      }
                      className="bg-[#1c2e26] lg:bg-[#16261f] rounded-2xl border border-[#2d4a3e] p-4 flex items-center justify-between cursor-pointer hover:border-[#34d399]/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#34d399]/10 rounded-lg text-[#34d399]">
                          <User size={18} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500 mb-0.5">
                            Người thanh toán
                          </span>
                          <span className="text-white text-sm font-bold flex items-center gap-2">
                            {currentPayer
                              ? currentPayer.name
                              : "Chọn người trả"}
                            {currentPayer &&
                              currentPayer.id === currentUserId &&
                              " (Bạn)"}
                          </span>
                        </div>
                      </div>
                      <ChevronDown
                        size={18}
                        className={`text-gray-400 transition-transform ${
                          isPayerDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </div>

                    <AnimatePresence>
                      {isPayerDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute top-full left-0 right-0 mt-2 bg-[#16261f] border border-[#2d4a3e] rounded-xl shadow-xl z-20 max-h-60 overflow-y-auto custom-scrollbar"
                        >
                          {members.map((member) => (
                            <div
                              key={member.id}
                              onClick={() => {
                                setPayerId(member.id);
                                setIsPayerDropdownOpen(false);
                              }}
                              className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-[#2d4a3e]/50 transition-colors ${
                                payerId === member.id ? "bg-[#2d4a3e]" : ""
                              }`}
                            >
                              <img
                                src={
                                  member.avatar ||
                                  `https://ui-avatars.com/api/?name=${member.name}&background=random`
                                }
                                alt={member.name}
                                className="w-8 h-8 rounded-full border border-gray-600"
                              />
                              <span
                                className={`text-sm font-medium ${
                                  payerId === member.id
                                    ? "text-[#34d399]"
                                    : "text-white"
                                }`}
                              >
                                {member.name}{" "}
                                {member.id === currentUserId && "(Bạn)"}
                              </span>
                              {payerId === member.id && (
                                <Check
                                  size={16}
                                  className="text-[#34d399] ml-auto"
                                />
                              )}
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* RIGHT: SPLIT LOGIC */}
                <div className="p-4 space-y-4 lg:border-l lg:border-[#2d4a3e] lg:pl-8">
                  {/* SPLIT TABS */}
                  <div className="flex bg-[#0b1411] p-1 rounded-xl border border-[#2d4a3e]">
                    <button
                      onClick={() => handleMethodChange("equal")}
                      className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                        splitMethod === "equal"
                          ? "bg-[#34d399] text-[#0b1411]"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      Chia đều
                    </button>
                    <button
                      onClick={() => handleMethodChange("amount")}
                      className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                        splitMethod === "amount"
                          ? "bg-[#34d399] text-[#0b1411]"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      Theo số tiền
                    </button>
                  </div>

                  {splitMethod === "equal" ? (
                    // --- EQUAL MODE UI ---
                    <>
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

                      <div className="flex items-center justify-between bg-[#1c2e26] px-4 py-3 rounded-xl border border-[#2d4a3e]">
                        <div className="flex items-center gap-2 text-gray-400 text-xs">
                          <span className="bg-gray-700 px-1.5 py-0.5 rounded text-white font-mono">
                            ÷ {selectedMembers.length}
                          </span>
                          người hưởng thụ
                        </div>
                        <span className="text-white font-bold font-mono">
                          {perPersonAmount.toLocaleString("vi-VN")}đ / người
                        </span>
                      </div>
                    </>
                  ) : (
                    // --- AMOUNT MODE UI ---
                    <>
                      <div className="flex flex-col gap-1 mb-2">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-400">
                            Đã nhập:{" "}
                            <span className="text-white font-bold">
                              {currentTotalCustom.toLocaleString()}đ
                            </span>
                          </span>
                          <span
                            className={
                              remainingAmount === 0
                                ? "text-[#34d399] font-bold"
                                : "text-red-400 font-bold"
                            }
                          >
                            Còn lại: {remainingAmount.toLocaleString()}đ
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-[#0b1411] rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full ${
                              remainingAmount === 0
                                ? "bg-[#34d399]"
                                : "bg-red-500"
                            }`}
                            initial={{ width: 0 }}
                            animate={{
                              width: `${Math.min(
                                (currentTotalCustom / (rawAmount || 1)) * 100,
                                100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Member List */}
                  <div className="space-y-3 mt-4 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                    {members.map((member) => {
                      const isSelected = selectedMembers.includes(member.id);

                      if (splitMethod === "equal") {
                        // RENDER EQUAL ITEM
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
                              <div>
                                <p
                                  className={`font-bold text-sm ${
                                    isSelected ? "text-white" : "text-gray-400"
                                  }`}
                                >
                                  {member.name}
                                </p>
                                {isSelected && (
                                  <p className="text-xs text-gray-500">
                                    {payerId === member.id ? (
                                      <span className="text-[#34d399]">
                                        Đã trả {amount}đ
                                      </span>
                                    ) : (
                                      <span>
                                        Nợ{" "}
                                        {currentPayer?.name?.split(" ").pop()}:{" "}
                                        {perPersonAmount.toLocaleString(
                                          "vi-VN"
                                        )}
                                        đ
                                      </span>
                                    )}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div
                              className={`w-12 h-7 rounded-full flex items-center p-1 transition-colors duration-300 ${
                                isSelected ? "bg-[#34d399]" : "bg-gray-600"
                              }`}
                            >
                              <motion.div
                                layout
                                className="w-5 h-5 bg-white rounded-full shadow-md"
                                style={{
                                  marginLeft: isSelected ? "auto" : "0",
                                }}
                              />
                            </div>
                          </div>
                        );
                      } else {
                        // RENDER AMOUNT INPUT ITEM
                        return (
                          <div
                            key={member.id}
                            className="flex items-center justify-between p-3 rounded-2xl border border-[#2d4a3e] bg-[#16261f]"
                          >
                            <div className="flex items-center gap-3">
                              <img
                                src={
                                  member.avatar ||
                                  `https://ui-avatars.com/api/?name=${member.name}&background=random`
                                }
                                alt={member.name}
                                className="w-10 h-10 rounded-full border border-gray-600"
                              />
                              <p className="font-bold text-sm text-white">
                                {member.name}
                              </p>
                            </div>
                            <div className="relative w-32">
                              <input
                                type="text"
                                inputMode="numeric"
                                value={formatCurrency(
                                  customAmounts[member.id] || 0
                                )}
                                onChange={(e) =>
                                  handleCustomAmountChange(
                                    member.id,
                                    e.target.value
                                  )
                                }
                                className="w-full bg-[#0b1411] border border-[#2d4a3e] rounded-lg px-3 py-1.5 text-right text-white font-mono focus:border-[#34d399] focus:outline-none"
                              />
                            </div>
                          </div>
                        );
                      }
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
