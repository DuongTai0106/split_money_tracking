import React from "react";
import {
  Utensils,
  Coffee,
  Plane,
  ShoppingCart,
  Home,
  Car,
  HeartPulse,
  Gift,
  Receipt,
  Film,
  Wifi,
} from "lucide-react";

// Danh sách danh mục chuẩn
const CATEGORIES = [
  {
    id: "food",
    label: "Ăn uống",
    icon: Utensils,
    color: "bg-orange-100 text-orange-600",
  },
  {
    id: "drink",
    label: "Cà phê",
    icon: Coffee,
    color: "bg-amber-100 text-amber-700",
  },
  {
    id: "travel",
    label: "Du lịch",
    icon: Plane,
    color: "bg-blue-100 text-blue-600",
  },
  {
    id: "transport",
    label: "Di chuyển",
    icon: Car,
    color: "bg-indigo-100 text-indigo-600",
  },
  {
    id: "home",
    label: "Nhà cửa",
    icon: Home,
    color: "bg-emerald-100 text-emerald-600",
  },
  {
    id: "shopping",
    label: "Mua sắm",
    icon: ShoppingCart,
    color: "bg-pink-100 text-pink-600",
  },
  {
    id: "entertainment",
    label: "Giải trí",
    icon: Film,
    color: "bg-purple-100 text-purple-600",
  },
  {
    id: "health",
    label: "Sức khỏe",
    icon: HeartPulse,
    color: "bg-red-100 text-red-600",
  },
  {
    id: "bills",
    label: "Hóa đơn",
    icon: Wifi,
    color: "bg-cyan-100 text-cyan-600",
  },
  {
    id: "gift",
    label: "Quà tặng",
    icon: Gift,
    color: "bg-rose-100 text-rose-600",
  },
  {
    id: "other",
    label: "Khác",
    icon: Receipt,
    color: "bg-gray-100 text-gray-600",
  },
];

const CategorySelector = ({ selected, onChange }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Danh mục
      </label>
      <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selected === cat.id;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onChange(cat.id)}
              className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all border ${
                isSelected
                  ? "bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500"
                  : "bg-white border-gray-100 hover:bg-gray-50 hover:border-gray-300"
              }`}
            >
              <div className={`p-2 rounded-full mb-1 ${cat.color}`}>
                <Icon className="h-4 w-4" />
              </div>
              <span
                className={`text-[10px] font-medium truncate w-full text-center ${
                  isSelected ? "text-indigo-700" : "text-gray-500"
                }`}
              >
                {cat.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategorySelector;
