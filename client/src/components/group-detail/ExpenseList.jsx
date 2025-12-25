import React from "react";
import { motion } from "framer-motion";
import { Utensils, ShoppingCart, Car, Beer, Wallet } from "lucide-react"; // Ví dụ các icon

const categoryIcons = {
  food: <Utensils size={18} />,
  shopping: <ShoppingCart size={18} />,
  transport: <Car size={18} />,
  drink: <Beer size={18} />,
  general: <Wallet size={18} />, // Import Wallet ở trên nếu dùng
};

const ExpenseItem = ({ expense }) => {
  // Logic hiển thị trạng thái nợ/trả
  const isLender = expense.isLender; // Người dùng là người trả tiền?

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.98 }}
      className="flex items-center gap-4 p-4 bg-[#0b1411] hover:bg-[#1c2e26] rounded-xl border border-[#1c2e26] transition-colors cursor-pointer"
    >
      {/* Date Box (Hiển thị ngày tháng nhỏ bên trái - Optional hoặc gom nhóm như ảnh) */}
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
          expense.category === "food"
            ? "bg-orange-500/10 text-orange-500"
            : expense.category === "drink"
            ? "bg-blue-500/10 text-blue-500"
            : "bg-gray-700/20 text-gray-400"
        }`}
      >
        {categoryIcons[expense.category] || categoryIcons.general}
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="text-white font-medium truncate">{expense.title}</h4>
        <p className="text-xs text-gray-500 mt-0.5">
          {isLender ? "Bạn trả" : `Trả bởi ${expense.payer}`}
        </p>
      </div>

      <div className="text-right">
        <p className="text-white font-bold">{expense.amount}</p>
      </div>
    </motion.div>
  );
};

const ExpenseList = ({ transactions }) => {
  return (
    <div className="space-y-6 pb-20">
      {transactions.map((group, index) => (
        <div key={index}>
          <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-3 ml-1">
            {group.date}
          </h3>
          <div className="space-y-2">
            {group.items.map((item) => (
              <ExpenseItem key={item.id} expense={item} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ExpenseList;
