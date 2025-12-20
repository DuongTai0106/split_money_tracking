// client/src/features/expenses/MemberSelector.jsx
import React from "react";

const MemberSelector = ({ members, selectedId, onChange, label }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <select
        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
        value={selectedId}
        onChange={(e) => onChange(e.target.value)}
      >
        {members.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name} {m.isGhost ? "(Ghost)" : ""}{" "}
            {m.id === selectedId ? "(Đang chọn)" : ""}
          </option>
        ))}
      </select>
    </div>
  );
};
export default MemberSelector;
