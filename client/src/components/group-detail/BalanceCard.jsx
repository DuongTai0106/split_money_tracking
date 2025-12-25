import React from "react";
import { Wallet } from "lucide-react";

const BalanceCard = ({ userBalance }) => {
  const isPositive = userBalance.amount >= 0;

  return (
    <div className="bg-[#1c2e26] rounded-2xl p-5 border border-[#2d4a3e] relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#34d399] blur-[60px] opacity-10 rounded-full -mt-10 -mr-10"></div>

      <div className="relative z-10">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-gray-400 text-sm font-medium">Số dư của bạn</p>
            <h2
              className={`text-3xl font-bold mt-1 ${
                isPositive ? "text-[#34d399]" : "text-red-500"
              }`}
            >
              {isPositive ? "Bạn được trả" : "Bạn nợ"} <br />
              {Math.abs(userBalance.amount).toLocaleString()} đ
            </h2>
          </div>
          <div className="p-3 bg-[#0b1411] rounded-full text-[#34d399]">
            <Wallet size={24} />
          </div>
        </div>

        {/* Debt Details List */}
        <div className="mt-6 space-y-3">
          <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            <span>Chi tiết nợ</span>
            <button className="text-[#34d399] hover:underline">
              Xem tất cả
            </button>
          </div>

          {userBalance.details.map((item, index) => (
            <div
              key={index}
              className="flex justify-between items-center text-sm"
            >
              <div className="flex items-center gap-2">
                <img
                  src={item.avatar}
                  alt="User"
                  className="w-6 h-6 rounded-full"
                />
                <span className="text-gray-200">{item.name}</span>
              </div>
              <span
                className={item.amount > 0 ? "text-[#34d399]" : "text-red-400"}
              >
                {item.amount > 0
                  ? `Nợ bạn ${item.amount.toLocaleString()}k`
                  : `Bạn nợ ${Math.abs(item.amount).toLocaleString()}k`}
              </span>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-[#2d4a3e] flex items-center justify-between">
          <span className="text-xs text-gray-500">
            Tổng chi: {userBalance.totalGroupSpend}
          </span>
          <button className="bg-[#34d399] text-[#0b1411] px-4 py-2 rounded-lg font-bold text-sm hover:bg-[#2cb683] transition-colors shadow-lg shadow-[#34d399]/20">
            Thanh toán
          </button>
        </div>
      </div>
    </div>
  );
};

export default BalanceCard;
