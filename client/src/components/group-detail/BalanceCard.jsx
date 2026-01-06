import React from "react";
import { ArrowUpRight, ArrowDownLeft, Wallet } from "lucide-react";

const BalanceCard = ({ userBalance, onViewAll }) => {
  // Filter for meaningful debts only (non-zero)
  const debts = userBalance.details.filter((item) => item.amount !== 0);

  return (
    <div className="bg-[#1c2e26] rounded-2xl border border-[#2d4a3e] relative overflow-hidden flex flex-col h-full shadow-lg hover:shadow-[#34d399]/10 transition-shadow duration-300">
      {/* Header */}
      <div className="p-5 pb-0 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
            <div className="bg-[#34d399]/10 p-2.5 rounded-xl">
                <Wallet className="text-[#34d399]" size={20} />
            </div>
            <h3 className="text-white font-bold text-lg tracking-tight">Chi tiết nợ nhóm</h3>
        </div>
        
            <button
            onClick={onViewAll}
            className="text-xs font-medium text-[#34d399] hover:bg-[#34d399]/10 px-3 py-1.5 rounded-full transition-colors"
            >
            Xem tất cả
            </button>
      </div>

      {/* Decorative Blur */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#34d399] blur-[80px] opacity-5 pointer-events-none -mt-20 -mr-20"></div>

      {/* Debt List */}
      <div className="p-5 flex-1 overflow-y-auto custom-scrollbar">
        {debts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-2 py-8">
                <Wallet size={32} className="opacity-20" />
                <p className="text-sm">Không có khoản nợ nào</p>
            </div>
        ) : (
            <div className="space-y-4">
                {debts.slice(0, 5).map((item, index) => {
                    const isPositive = item.amount > 0;
                    return (
                        <div key={index} className="group flex items-center justify-between p-3 rounded-xl hover:bg-[#2d4a3e]/40 transition-colors border border-transparent hover:border-[#2d4a3e]">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <img
                                        src={item.avatar}
                                        alt={item.name}
                                        className="w-10 h-10 rounded-full object-cover border-2 border-[#1c2e26] shadow-sm"
                                    />
                                    <div className={`absolute -bottom-1 -right-1 p-0.5 rounded-full border-2 border-[#1c2e26] ${isPositive ? "bg-[#34d399]" : "bg-red-500"}`}>
                                        {isPositive ? <ArrowDownLeft size={10} className="text-[#0b1411]" /> : <ArrowUpRight size={10} className="text-white" />}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-200 group-hover:text-white transition-colors">{item.name}</p>
                                    <p className="text-xs text-gray-500 font-medium">
                                        {isPositive ? "Cần trả bạn" : "Bạn cần trả"}
                                    </p>
                                </div>
                            </div>

                            <div className="text-right">
                                <p className={`font-bold text-sm tabular-nums ${isPositive ? "text-[#34d399]" : "text-red-400"}`}>
                                    {isPositive ? "+" : "-"}{Math.abs(item.amount).toLocaleString()}đ
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        )}
      </div>
    </div>
  );
};

export default BalanceCard;
