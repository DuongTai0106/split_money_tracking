import React from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const DebtPlan = ({ plan, onSettleClick, groupCurrency }) => {
  if (plan.length === 0) {
    return (
      <div className="text-center p-8 bg-green-50 rounded-2xl border border-green-100">
        <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-2" />
        <h3 className="text-green-800 font-bold">Tất cả đã thanh toán!</h3>
        <p className="text-green-600 text-sm">Không ai nợ ai cả. Tuyệt vời.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-gray-800">
        Kế hoạch trả nợ tối ưu
      </h3>
      {plan.map((item, index) => (
        <div
          key={index}
          className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3 flex-1">
            {/* Người trả */}
            <div className="flex flex-col items-center">
              <div className="h-10 w-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-sm">
                {item.fromName.charAt(0)}
              </div>
              <span className="text-xs font-medium text-gray-500 mt-1">
                {item.fromName}
              </span>
            </div>

            {/* Mũi tên & Số tiền */}
            <div className="flex flex-col items-center flex-1 px-2">
              <span className="text-xs text-gray-400 mb-1">trả cho</span>
              <ArrowRight className="h-4 w-4 text-gray-300" />
              <span className="font-bold text-indigo-600 mt-1">
                {item.amount.toLocaleString()} {groupCurrency}
              </span>
            </div>

            {/* Người nhận */}
            <div className="flex flex-col items-center">
              <div className="h-10 w-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold text-sm">
                {item.toName.charAt(0)}
              </div>
              <span className="text-xs font-medium text-gray-500 mt-1">
                {item.toName}
              </span>
            </div>
          </div>

          {/* Nút Action (Chỉ hiện nếu mình là người trả hoặc người nhận để xác nhận) */}
          <button
            onClick={() => onSettleClick(item)}
            className="ml-4 px-4 py-2 bg-indigo-50 text-indigo-600 text-sm font-bold rounded-lg hover:bg-indigo-100 transition-colors"
          >
            Thanh toán
          </button>
        </div>
      ))}
    </div>
  );
};

export default DebtPlan;
