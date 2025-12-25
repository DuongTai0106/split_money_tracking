// src/pages/GroupSettings.jsx

import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { motion } from "framer-motion";

// Components
import InfoSection from "../components/group-settings/InfoSection";
import MemberSection from "../components/group-settings/MemberSection";
import DangerZone from "../components/group-settings/DangerZone";

// Mock Data
const MOCK_SETTINGS = {
  name: "Trip to Da Lat",
  image:
    "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&auto=format&fit=crop",
  members: [
    {
      id: 1,
      name: "Bạn (Minh)",
      email: "039 888 ****",
      role: "owner",
      avatar: "https://ui-avatars.com/api/?name=Minh",
      isMe: true,
    },
    {
      id: 2,
      name: "Tuấn",
      email: "tuannguyen@gmail.com",
      role: "admin",
      avatar: "https://ui-avatars.com/api/?name=Tuan",
      isMe: false,
    },
    {
      id: 3,
      name: "Linh",
      email: "Member",
      role: "member",
      avatar: "https://ui-avatars.com/api/?name=Linh",
      isMe: false,
    },
    {
      id: 4,
      name: "Hùng",
      email: "Member",
      role: "member",
      avatar: "https://ui-avatars.com/api/?name=Hung",
      isMe: false,
    },
  ],
};

const GroupSettings = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [groupInfo, setGroupInfo] = useState(MOCK_SETTINGS);

  const handleSave = () => {
    // Call API save here
    console.log("Saving...", groupInfo);
    navigate(-1); // Quay lại trang trước
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen bg-[#0b1411] text-white font-sans pb-10"
    >
      {/* HEADER (Sticky) */}
      <div className="sticky top-0 z-30 bg-[#0b1411]/90 backdrop-blur border-b border-[#1c2e26] px-4 py-4 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-full hover:bg-[#1c2e26] transition-colors text-gray-300"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-lg font-bold">Cài đặt Nhóm</h1>
        <button
          onClick={handleSave}
          className="text-[#34d399] font-bold text-sm hover:underline px-2"
        >
          Lưu
        </button>
      </div>

      <div className="max-w-6xl mx-auto p-4 lg:p-8">
        {/* LAYOUT GRID:
             Mobile: 1 cột
             Desktop: 2 cột (Trái: Info 40% - Phải: Members 60%)
          */}
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 lg:gap-10">
          {/* LEFT COLUMN (Info & Danger) */}
          <div className="lg:col-span-5 space-y-6 lg:space-y-8">
            <InfoSection groupInfo={groupInfo} setGroupInfo={setGroupInfo} />

            {/* Danger Zone: Ở desktop thì để dưới Info luôn cho tiện */}
            <div className="hidden lg:block">
              <DangerZone />
            </div>
          </div>

          {/* RIGHT COLUMN (Members) */}
          <div className="lg:col-span-7 space-y-6">
            <MemberSection members={groupInfo.members} />

            {/* Danger Zone: Ở mobile thì để cuối cùng */}
            <div className="lg:hidden pt-4">
              <DangerZone />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default GroupSettings;
