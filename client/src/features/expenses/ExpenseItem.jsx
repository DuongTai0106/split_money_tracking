import React from "react";
import {
  Coffee,
  Plane,
  ShoppingCart,
  Home,
  Receipt,
  Utensils,
  Car,
  Gift,
  HeartPulse,
} from "lucide-react";

// 1. Cấu hình Icon và Màu sắc cho từng loại danh mục
const CATEGORY_STYLES = {
  food: {
    icon: Utensils,
    color: "bg-orange-100 text-orange-600",
    label: "Ăn uống",
  },
  drink: {
    icon: Coffee,
    color: "bg-amber-100 text-amber-700",
    label: "Cà phê",
  },
  travel: { icon: Plane, color: "bg-blue-100 text-blue-600", label: "Du lịch" },
  shopping: {
    icon: ShoppingCart,
    color: "bg-pink-100 text-pink-600",
    label: "Mua sắm",
  },
  home: {
    icon: Home,
    color: "bg-emerald-100 text-emerald-600",
    label: "Nhà cửa",
  },
  transport: {
    icon: Car,
    color: "bg-indigo-100 text-indigo-600",
    label: "Di chuyển",
  },
  health: {
    icon: HeartPulse,
    color: "bg-red-100 text-red-600",
    label: "Sức khỏe",
  },
  gift: {
    icon: Gift,
    color: "bg-purple-100 text-purple-600",
    label: "Quà tặng",
  },
  // Default fallback
  other: { icon: Receipt, color: "bg-gray-100 text-gray-600", label: "Khác" },
};

const ExpenseItem = ({ expense }) => {
  // 2. Xử lý Date (Chuyển chuỗi ISO sang ngày tháng hiển thị)
  const dateObj = new Date(expense.date || expense.created_at || Date.now());
  const month = dateObj
    .toLocaleString("en-US", { month: "short" })
    .toUpperCase(); // VD: DEC
  const day = dateObj.getDate(); // VD: 12

  // 3. Xử lý Category (Nếu không có category thì dùng 'other')
  // Giả sử DB có cột category, hoặc ta check dựa trên description
  const categoryKey = expense.category || "other";
  const style = CATEGORY_STYLES[categoryKey] || CATEGORY_STYLES.other;
  const Icon = style.icon;

  // 4. Format tiền tệ
  const formattedAmount = Number(expense.original_amount).toLocaleString();

  return (
    <div className="group flex items-center justify-between p-3 sm:p-4 rounded-2xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all cursor-pointer">
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Date Box (Hình vuông hiển thị ngày) */}
        <div className="flex flex-col items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-gray-50 border border-gray-100 rounded-xl group-hover:bg-white group-hover:shadow-sm transition-all">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            {month}
          </span>
          <span className="text-lg sm:text-xl font-bold text-gray-800 leading-none">
            {day}
          </span>
        </div>

        {/* Icon & Info */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Category Icon */}
          <div
            className={`p-2 sm:p-3 rounded-full ${style.color} hidden sm:flex`}
          >
            <Icon className="h-5 w-5" />
          </div>

          {/* Text Content */}
          <div>
            <h4 className="font-bold text-gray-900 text-sm sm:text-base group-hover:text-indigo-600 transition-colors line-clamp-1">
              {expense.description}
            </h4>
            <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-500 mt-0.5">
              <span className="font-medium text-gray-700">
                {expense.payer_name || "Ai đó"}
              </span>
              <span>đã trả</span>
              {/* Hiển thị thêm người chịu chia tiền nếu cần */}
            </div>
          </div>
        </div>
      </div>

      {/* Amount Section */}
      <div className="text-right">
        <p className="font-bold text-gray-900 text-sm sm:text-base">
          {formattedAmount}{" "}
          <span className="text-xs text-gray-500 font-medium">
            {expense.original_currency}
          </span>
        </p>

        {/* Logic hiển thị trạng thái vay/nợ (Optional) */}
        <p className="text-xs text-gray-400 mt-1 font-medium">
          {/* Logic này phụ thuộc vào user đang đăng nhập là ai */}
          {/* Ví dụ: "bạn nợ 50k" hoặc "bạn cho vay" */}
          Tổng hóa đơn
        </p>
      </div>
    </div>
  );
};

export default ExpenseItem;
