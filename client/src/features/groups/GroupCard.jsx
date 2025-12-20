import React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

const GroupCard = ({ group }) => {
  // Logic hiển thị màu sắc số dư
  // balance > 0: Bạn được nhận tiền (Xanh)
  // balance < 0: Bạn nợ tiền (Đỏ)
  // balance = 0: Đã thanh toán xong (Xám)
  const isPositive = group.balance > 0;
  const isNeutral = group.balance === 0;

  // Xử lý hiển thị Avatar thành viên
  // Chỉ hiện tối đa 3 người, còn lại hiện số +...
  const displayMembers = group.members || [];
  const visibleMembers = displayMembers.slice(0, 3);
  const remainingCount = displayMembers.length - 3;

  return (
    <motion.div
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md overflow-hidden cursor-pointer relative h-full flex flex-col"
    >
      {/* 1. Cover Image / Gradient */}
      {/* Nếu group.color có dữ liệu (ví dụ: 'from-blue-400 to-cyan-300') thì dùng, không thì fallback */}
      <div
        className={`h-24 bg-gradient-to-r ${
          group.color || "from-indigo-400 to-purple-400"
        } relative`}
      >
        <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
          <ArrowUpRight className="h-4 w-4 text-white" />
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        {/* 2. Group Icon (Nổi lên trên phần màu nền) */}
        <div className="-mt-12 mb-3">
          <div className="h-14 w-14 bg-white rounded-xl shadow-md flex items-center justify-center text-3xl border-4 border-white">
            {group.icon || "📁"}
          </div>
        </div>

        {/* 3. Group Info */}
        <div className="mb-4 flex-1">
          <h3
            className="text-lg font-bold text-gray-900 truncate"
            title={group.name}
          >
            {group.name}
          </h3>
          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mt-1">
            {group.type || "Chung"}
          </p>
        </div>

        {/* 4. Footer: Members & Balance */}
        <div className="flex items-end justify-between pt-4 border-t border-gray-50">
          {/* Stacked Avatars */}
          <div className="flex -space-x-3">
            {visibleMembers.map((member, idx) => (
              <div key={idx} className="relative group/avatar">
                {/* Nếu có avatarUrl thì dùng ảnh, không thì dùng UI Avatars */}
                <img
                  className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 object-cover"
                  src={
                    member.avatarUrl ||
                    `https://ui-avatars.com/api/?name=${
                      member.name || "User"
                    }&background=random&color=fff`
                  }
                  alt={member.name}
                />
              </div>
            ))}

            {remainingCount > 0 && (
              <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-600">
                +{remainingCount}
              </div>
            )}
          </div>

          {/* Balance Info */}
          <div className="text-right">
            {isNeutral ? (
              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-lg font-medium">
                Đã tất toán
              </span>
            ) : (
              <>
                <p
                  className={`text-[10px] font-medium uppercase mb-0.5 ${
                    isPositive ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {isPositive ? "Bạn được trả" : "Bạn nợ"}
                </p>
                <p
                  className={`text-sm font-bold ${
                    isPositive ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {Math.abs(group.balance).toLocaleString()}đ
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default GroupCard;
