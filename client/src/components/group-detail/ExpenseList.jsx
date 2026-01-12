import React from "react";
import { motion } from "framer-motion";
import {
  Utensils,
  ShoppingCart,
  Car,
  Beer,
  Wallet,
  Image as ImageIcon,
} from "lucide-react"; // Import thêm ImageIcon

const categoryIcons = {
  food: <Utensils size={18} />,
  shopping: <ShoppingCart size={18} />,
  transport: <Car size={18} />,
  drink: <Beer size={18} />,
  general: <Wallet size={18} />,
};

// Nhận thêm prop onClick từ cha
const ExpenseItem = ({ expense, onClick }) => {
  const isLender = expense.isLender;

  return (
    <motion.div
      onClick={onClick} // Gắn sự kiện click
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.98 }}
      className="flex items-center gap-4 p-4 bg-[#0b1411] hover:bg-[#1c2e26] rounded-xl border border-[#1c2e26] transition-colors cursor-pointer"
    >
      {/* Date Box */}
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
        <div className="flex items-center gap-2">
          <h4 className="text-white font-medium truncate">{expense.title}</h4>
          {/* Nếu có ảnh thì hiện icon Image nhỏ để người dùng biết */}
          {expense.image_url && (
            <ImageIcon size={14} className="text-gray-500 shrink-0" />
          )}
        </div>
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

// Nhận prop onTransactionClick từ GroupDetail
const ExpenseList = ({ transactions, onTransactionClick }) => {
  return (
    <div className="space-y-6 pb-20">
      {transactions.map((group, index) => (
        <div key={index}>
          <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-3 ml-1">
            {group.date}
          </h3>
          <div className="space-y-2">
            {group.items.map((item) => (
              <ExpenseItem
                key={item.id}
                expense={item}
                onClick={() => onTransactionClick(item)} // Truyền item lên trên khi click
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ExpenseList;
