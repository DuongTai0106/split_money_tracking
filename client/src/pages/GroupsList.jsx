import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Plus, Loader2 } from "lucide-react";
import CreateGroupModal from "../features/groups/CreateGroupModal";
import GroupCard from "../features/groups/GroupCard";
import groupService from "../services/groupService";
// Cấu hình API URL
const API_URL = "http://localhost:5000";

const GroupsList = () => {
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Hàm fetch danh sách nhóm từ API
  const fetchGroups = async () => {
    setIsLoading(true);
    // Gọi API thật
    const result = await groupService.getMyGroups();

    if (result.ok) {
      setGroups(result.data);
    } else {
      // Fallback hoặc show error
      console.error("Lỗi tải nhóm");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  // Lọc nhóm theo từ khóa tìm kiếm
  const filteredGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nhóm của tôi</h1>
          <p className="text-gray-500 mt-1">
            Quản lý chi tiêu chung với bạn bè & gia đình
          </p>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm nhóm..."
              className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none w-full md:w-72 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all active:scale-95 whitespace-nowrap"
          >
            <Plus className="h-5 w-5" />{" "}
            <span className="hidden sm:inline">Tạo mới</span>
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
        </div>
      ) : (
        /* Grid danh sách nhóm */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map((group) => (
            <Link key={group.id} to={`/groups/${group.id}`} className="block">
              {/* Component này đã tạo ở bước trước */}
              <GroupCard group={group} />
            </Link>
          ))}

          {/* Empty State Card (Nút tạo nhóm to) */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center min-h-[200px] hover:bg-indigo-50 hover:border-indigo-300 transition-all cursor-pointer group text-gray-400 hover:text-indigo-600"
          >
            <div className="h-14 w-14 bg-gray-100 group-hover:bg-white rounded-full flex items-center justify-center mb-3 transition-colors shadow-sm">
              <Plus className="h-6 w-6" />
            </div>
            <span className="font-bold">Tạo nhóm mới</span>
          </button>
        </div>
      )}

      {/* Modal tạo nhóm */}
      <CreateGroupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchGroups}
      />
    </div>
  );
};

export default GroupsList;
