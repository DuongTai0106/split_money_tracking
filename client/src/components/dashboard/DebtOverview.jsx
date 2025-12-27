import React from "react";
import { ArrowUpRight, ArrowDownLeft, Wallet } from "lucide-react";

const DebtOverview = ({ totalBalance, details }) => {
  const isPositive = totalBalance >= 0;

  return (
    <div className="bg-[#1c2e26] rounded-3xl p-6 border border-[#2d4a3e] shadow-xl relative overflow-hidden">
      {/* Background Decor */}
      <div
        className={`absolute -top-10 -right-10 w-40 h-40 rounded-full blur-[50px] opacity-20 ${
          isPositive ? "bg-[#34d399]" : "bg-red-500"
        }`}
      ></div>

      {/* 1. Tổng số dư */}
      <div className="relative z-10 mb-6">
        <div className="flex items-center gap-2 text-gray-400 mb-1">
          <Wallet size={16} />
          <span className="text-xs font-bold uppercase tracking-wider">
            Tổng số dư của bạn
          </span>
        </div>
        <div
          className={`text-4xl font-bold ${
            isPositive ? "text-[#34d399]" : "text-red-500"
          }`}
        >
          {totalBalance.toLocaleString("vi-VN")}đ
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {isPositive ? "Mọi người đang nợ bạn" : "Bạn đang nợ mọi người"}
        </p>
      </div>

      {/* 2. Danh sách chi tiết */}
      <div className="relative z-10">
        <h4 className="text-white font-bold text-sm mb-3">Chi tiết nợ nần</h4>

        <div className="space-y-3 max-h-[200px] overflow-y-auto custom-scrollbar pr-1">
          {details.length === 0 ? (
            <div className="text-center text-gray-500 text-xs py-4">
              Không có khoản nợ nào
            </div>
          ) : (
            details.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 bg-[#0b1411]/50 rounded-xl border border-[#2d4a3e]/50"
              >
                {/* Info Người + Nhóm */}
                <div className="flex items-center gap-3">
                  <img
                    src={
                      item.partner_avatar ||
                      `https://ui-avatars.com/api/?name=${item.partner_name}&background=random`
                    }
                    alt="avatar"
                    className="w-10 h-10 rounded-full border border-gray-600"
                  />
                  <div>
                    <p className="text-white text-sm font-bold">
                      {item.partner_name}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      Trong nhóm: {item.group_name}
                    </p>
                  </div>
                </div>

                {/* Số tiền */}
                <div className="text-right">
                  <p
                    className={`font-bold text-sm ${
                      item.type === "lend" ? "text-[#34d399]" : "text-red-500"
                    }`}
                  >
                    {item.type === "lend" ? "+" : "-"}
                    {parseFloat(item.amount).toLocaleString()}đ
                  </p>
                  <p className="text-[10px] text-gray-500 flex items-center justify-end gap-1">
                    {item.type === "lend" ? (
                      <>
                        Nhận lại <ArrowDownLeft size={10} />
                      </>
                    ) : (
                      <>
                        Phải trả <ArrowUpRight size={10} />
                      </>
                    )}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DebtOverview;
