import React, { useState } from "react";
import { UserPlus, Search, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const API_URL = "http://localhost:5000";

const UserSearchInput = ({ groupId, onMemberAdded }) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAdd = async () => {
    if (!email.includes("@")) {
      toast.error("Vui lòng nhập đúng định dạng email");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/group/${groupId}/add-member`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message);
        setEmail(""); // Clear input
        if (onMemberAdded) onMemberAdded(); // Refresh list
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Lỗi kết nối");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6">
      <label className="text-sm font-bold text-gray-700 mb-2 block">
        Thêm thành viên bằng Email
      </label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="email"
            placeholder="Nhập email bạn bè (vd: hung@gmail.com)"
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
        </div>
        <button
          onClick={handleAdd}
          disabled={isLoading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 disabled:bg-indigo-400 transition-colors"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <UserPlus className="h-4 w-4" />
          )}
          Thêm
        </button>
      </div>
    </div>
  );
};

export default UserSearchInput;
