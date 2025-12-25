// src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  Plus,
  QrCode,
  Link as LinkIcon,
  Keyboard,
  ChevronRight,
  Search,
  Filter,
} from "lucide-react";

// Import Modal
import CreateGroupModal from "../components/modals/CreateGroupModal";
import HeroCard from "../components/dashboard/HeroCard";
import GroupList from "../components/dashboard/GroupList";
import QuickActions from "../components/dashboard/QuickActions";
import groupService from "../services/groupService";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
// --- MOCK DATA ---
// const GROUPS = [
//   {
//     id: 1,
//     name: "Chuyến đi Đà Lạt",
//     status: "positive",
//     amount: "500.000đ",
//     time: "vừa xong",
//     image:
//       "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&auto=format&fit=crop&q=60",
//   },
//   {
//     id: 2,
//     name: "Tiền nhà trọ - T10",
//     status: "negative",
//     amount: "200.000đ",
//     time: "2 ngày",
//     image:
//       "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop&q=60",
//   },
//   {
//     id: 3,
//     name: "Ăn trưa công ty",
//     status: "neutral",
//     amount: "Đã thanh toán",
//     time: "1 tuần",
//     image:
//       "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop&q=60",
//   },
//   {
//     id: 4,
//     name: "Cafe Cuối Tuần",
//     status: "neutral",
//     amount: "Đã thanh toán",
//     time: "1 tuần",
//     image:
//       "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=800&auto=format&fit=crop&q=60",
//   },
// ];

// --- MAIN PAGE ---
const GroupItem = ({ group, onClick }) => (
  <motion.div
    layout
    onClick={onClick}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    whileHover={{ scale: 1.01, backgroundColor: "#233930" }}
    className="flex items-center gap-4 p-4 rounded-2xl bg-[#1c2e26] border border-[#2d4a3e] cursor-pointer group transition-all"
  >
    <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-[#2d4a3e]">
      <img
        src={group.image || `https://ui-avatars.com/api/?name=${group.name}`}
        alt={group.name}
        className="w-full h-full object-cover"
      />
    </div>

    <div className="flex-1 min-w-0">
      <div className="flex justify-between items-start mb-1">
        <h3 className="text-white font-bold text-lg truncate pr-2">
          {group.name}
        </h3>
        <span className="text-xs text-gray-500 bg-[#0b1411] px-2 py-0.5 rounded-md">
          {group.time}
        </span>
      </div>

      {/* Logic hiển thị tiền (Tạm thời là mock) */}
      <div className="text-sm font-medium text-gray-400">
        {group.member_count} thành viên
      </div>
    </div>

    <ChevronRight
      size={18}
      className="text-gray-600 group-hover:text-[#34d399] transition-colors"
    />
  </motion.div>
);
const Home = ({ user }) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const fetchGroups = async () => {
    try {
      const res = await groupService.getMyGroups();
      if (res.ok && res.data.success) {
        setGroups(res.data.groups);
      } else {
        toast.error("Lỗi tải nhóm");
        console.error("Lỗi tải nhóm: ", res.data.message);
      }
    } catch (error) {
      toast.error(error.message);
      console.error("Failed to fetch groups", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGroupClick = (groupId) => {
    // Giả sử đường dẫn của bạn là /groups/:id/details
    navigate(`/groups/${groupId}`);
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  return (
    <div className="min-h-screen bg-[#0b1411] font-sans text-white pb-20 lg:pb-0">
      {/* Container: Padding nhỏ ở mobile (p-4), lớn ở desktop (p-10) */}
      <div className="p-4 lg:p-10 max-w-7xl mx-auto space-y-6 lg:space-y-10">
        {/* 1. Header Section */}
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
              Danh sách Nhóm
            </h1>
            <p className="text-gray-400 text-sm mt-1 hidden lg:block">
              Quản lý chi tiêu và các khoản nợ của bạn
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2.5 bg-[#1c2e26] rounded-xl text-gray-400 hover:text-white hover:bg-[#233930] transition-colors relative border border-[#2d4a3e]">
              <Bell size={20} />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#1c2e26]"></span>
            </button>

            {/* Nút Tạo nhóm: Ở Mobile chỉ hiện Icon +, Desktop hiện cả chữ */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 bg-[#34d399] text-[#0b1411] p-2.5 lg:px-5 lg:py-3 rounded-xl font-bold hover:bg-[#2cb683] shadow-lg shadow-[#34d399]/20 transition-all"
            >
              <Plus size={20} strokeWidth={3} />
              <span className="hidden lg:inline">Tạo Nhóm</span>
            </motion.button>
          </div>
        </header>

        {/* 2. Dashboard Area (Responsive Grid) */}
        {/* Mobile: Flex Column (Xếp chồng) | Desktop: Grid 3 cột */}
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Hero Card: Mobile (Full width) | Desktop (Chiếm 2/3) */}
          <div className="w-full lg:col-span-2">
            <HeroCard />
          </div>

          {/* Quick Actions: Mobile (Row 3 cột) | Desktop (Column 1 cột) */}
          {/* Đây là điểm mấu chốt để giống hình mẫu mobile bạn gửi */}
          <div className="grid grid-cols-3 lg:grid-cols-1 gap-3 lg:gap-4 h-full">
            <QuickActions icon={QrCode} label="Quét QR" />
            <QuickActions icon={Keyboard} label="Nhập mã" />
          </div>
        </div>

        {/* 3. Group List Section */}
        <section className="space-y-4">
          <div className="flex justify-between items-end">
            <h2 className="text-lg lg:text-xl font-bold text-white">
              Nhóm của bạn
            </h2>

            {/* Filter & Sort Tools */}
            <div className="flex gap-2">
              <button className="flex items-center gap-1 text-xs font-medium text-gray-400 bg-[#1c2e26] px-3 py-1.5 rounded-lg border border-[#2d4a3e]">
                <Filter size={14} /> Lọc
              </button>
              <button className="text-[#34d399] text-sm font-semibold hover:underline">
                Sắp xếp
              </button>
            </div>
          </div>

          {/* Search Bar Mobile (Optional - giúp UX tốt hơn) */}
          <div className="relative lg:hidden">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
            <input
              type="text"
              placeholder="Tìm kiếm nhóm..."
              className="w-full bg-[#1c2e26] border border-[#2d4a3e] rounded-xl pl-9 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#34d399]"
            />
          </div>

          {/* Grid Layout: Mobile (1 cột) | Tablet (2 cột) | Desktop (3 cột) */}
          {isLoading ? (
            <div className="text-center text-gray-500 py-10">
              Đang tải danh sách nhóm...
            </div>
          ) : groups.length === 0 ? (
            <div className="text-center text-gray-500 py-10 border-2 border-dashed border-[#2d4a3e] rounded-2xl">
              Bạn chưa tham gia nhóm nào. Hãy tạo nhóm mới!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
              {groups.map((group) => (
                // Map dữ liệu từ API vào Component GroupItem
                <GroupItem
                  onClick={() => handleGroupClick(group.id)}
                  key={group.id}
                  group={{
                    id: group.id,
                    name: group.name,
                    image:
                      group.image_url ||
                      "https://ui-avatars.com/api/?background=random&name=" +
                        group.name,
                    status: group.status, // neutral/positive/negative
                    amount: group.amount, // '0đ'
                    time: group.time, // formatted date
                    member_count: group.member_count,
                  }}
                />
              ))}

              {/* Nút thêm nhóm dạng Card */}
              <motion.div
                onClick={() => setIsCreateModalOpen(true)}
                className="hidden md:flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-[#2d4a3e] text-gray-500 cursor-pointer hover:border-[#34d399] hover:text-[#34d399] transition-colors min-h-[100px]" // Class cũ
              >
                <Plus size={24} />
                <span className="mt-2 font-medium text-sm">Thêm nhóm khác</span>
              </motion.div>
            </div>
          )}
        </section>
      </div>

      {/* MODAL */}
      <CreateGroupModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onGroupCreated={fetchGroups}
      />
    </div>
  );
};

export default Home;
