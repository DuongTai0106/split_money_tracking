import React from "react";
import { Trash2, AlertTriangle } from "lucide-react";

const DangerZone = () => {
  return (
    <div className="space-y-2">
      <h3 className="text-red-500 text-xs font-bold uppercase tracking-wider ml-1">
        Vùng nguy hiểm
      </h3>
      <div className="bg-[#1c2e26] rounded-2xl border border-red-500/20 overflow-hidden">
        <div className="p-4 flex items-center justify-between hover:bg-red-500/5 transition-colors cursor-pointer group">
          <div>
            <h4 className="text-red-500 font-bold text-sm group-hover:text-red-400">
              Giải tán nhóm
            </h4>
            <p className="text-xs text-gray-500 mt-0.5">
              Xóa vĩnh viễn nhóm và mọi dữ liệu chi tiêu
            </p>
          </div>
          <div className="p-2 bg-red-500/10 rounded-lg text-red-500 group-hover:bg-red-500 group-hover:text-white transition-colors">
            <Trash2 size={18} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DangerZone;
