import React, { useState, useEffect } from "react";
import { X, Calendar, DollarSign, Calculator } from "lucide-react";
import Modal from "../../components/ui/Modal"; // Modal cũ
import MemberSelector from "./MemberSelector";
import Button from "../../components/ui/Button";
import CategorySelector from "./CategorySelector";
// Giả sử groupCurrency lấy từ props cha truyền xuống (VD: 'VND')
const AddExpenseModal = ({
  isOpen,
  onClose,
  members,
  groupCurrency = "VND",
  onSubmit,
}) => {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState(groupCurrency);
  const [exchangeRate, setExchangeRate] = useState(1);
  const [payerId, setPayerId] = useState(members[0]?.id); // Mặc định người đầu tiên trả
  const [splitters, setSplitters] = useState(members.map((m) => m.id)); // Mặc định chia tất cả
  const [category, setCategory] = useState("food");

  // Reset form khi mở modal
  useEffect(() => {
    if (isOpen && members.length > 0) {
      setPayerId(members[0].id);
      setSplitters(members.map((m) => m.id));
      setCurrency(groupCurrency);
      setCategory("food");
    }
  }, [isOpen, members, groupCurrency]);

  // Logic: Nếu chọn currency khác groupCurrency, cho phép nhập tỷ giá
  const isForeignCurrency = currency !== groupCurrency;

  const handleSubmit = () => {
    const payload = {
      description,
      amount: parseFloat(amount),
      currency,
      exchangeRate: parseFloat(exchangeRate),
      payerMemberId: payerId,
      splitMembers: splitters,
      category,
    };
    onSubmit(payload);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Thêm hóa đơn mới">
      <div className="space-y-5 h-[70vh] overflow-y-auto pr-2">
        {/* 1. Nhập tiền & Loại tiền */}
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-xs font-bold text-gray-500 uppercase">
              Số tiền
            </label>
            <input
              type="number"
              autoFocus
              className="w-full text-3xl font-bold text-indigo-700 border-b-2 border-indigo-100 focus:border-indigo-600 outline-none py-2 placeholder-indigo-200"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="w-24">
            <label className="text-xs font-bold text-gray-500 uppercase">
              Đơn vị
            </label>
            <select
              className="w-full mt-2 p-2 bg-gray-100 rounded-lg font-bold text-gray-700 outline-none"
              value={currency}
              onChange={(e) => {
                setCurrency(e.target.value);
                // Reset rate về 1 nếu quay lại tiền nhóm
                if (e.target.value === groupCurrency) setExchangeRate(1);
              }}
            >
              <option value="VND">VND</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="JPY">JPY</option>
            </select>
          </div>
        </div>

        <CategorySelector selected={category} onChange={setCategory} />

        {/* 2. Ô nhập tỷ giá (Chỉ hiện khi khác tiền tệ nhóm) */}
        {isForeignCurrency && (
          <div className="bg-orange-50 p-3 rounded-xl border border-orange-100 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-orange-800 font-medium flex items-center gap-2">
                <Calculator className="h-4 w-4" /> Tỷ giá quy đổi
              </span>
              <span className="text-xs text-orange-600">
                1 {currency} = ? {groupCurrency}
              </span>
            </div>
            <input
              type="number"
              className="w-full p-2 bg-white border border-orange-200 rounded-lg text-right font-mono font-bold text-gray-700 focus:ring-2 focus:ring-orange-400 outline-none"
              value={exchangeRate}
              onChange={(e) => setExchangeRate(e.target.value)}
            />
            <p className="text-xs text-right mt-1 text-gray-500">
              Quy đổi: {(amount * exchangeRate).toLocaleString()}{" "}
              {groupCurrency}
            </p>
          </div>
        )}

        {/* 3. Nội dung */}
        <div>
          <label className="text-sm font-medium text-gray-700">Mô tả</label>
          <div className="relative mt-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
            <input
              className="w-full pl-10 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Ví dụ: Vé tàu Shinkansen"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        {/* 4. Ai trả tiền? */}
        <MemberSelector
          label="Người trả tiền"
          members={members}
          selectedId={payerId}
          onChange={setPayerId}
        />

        {/* 5. Chia cho ai? (Basic: Toggle All) */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Chia cho
          </label>
          <div className="flex flex-wrap gap-2">
            {members.map((member) => {
              const isSelected = splitters.includes(member.id);
              return (
                <button
                  key={member.id}
                  onClick={() => {
                    if (isSelected)
                      setSplitters(splitters.filter((id) => id !== member.id));
                    else setSplitters([...splitters, member.id]);
                  }}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all flex items-center gap-2 ${
                    isSelected
                      ? "bg-indigo-100 text-indigo-700 border-indigo-200"
                      : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <div
                    className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isSelected ? "bg-indigo-500 text-white" : "bg-gray-200"
                    }`}
                  >
                    {member.avatar}
                  </div>
                  {member.name}
                </button>
              );
            })}
          </div>
          {splitters.length === 0 && (
            <p className="text-xs text-red-500 mt-1">
              Vui lòng chọn ít nhất 1 người
            </p>
          )}
        </div>

        {/* Footer Submit */}
        <div className="pt-2 pb-4">
          <Button
            onClick={handleSubmit}
            disabled={!amount || !description || splitters.length === 0}
          >
            Lưu chi tiêu
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AddExpenseModal;
