import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Settings, Plus } from "lucide-react";
import { motion } from "framer-motion";

// Import Components
import GroupHeader from "../components/group-detail/GroupHeader";
import BalanceCard from "../components/group-detail/BalanceCard";
import TabNavigation from "../components/group-detail/TabNavigation";
import ExpenseList from "../components/group-detail/ExpenseList";
import CreateExpenseModal from "../components/modals/CreateExpenseModal";

// --- MOCK DATA ---
const MOCK_GROUP = {
  id: 1,
  name: "Trip to Da Lat",
  image:
    "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&auto=format&fit=crop",
  memberCount: 5,
  dateRange: "24 Th10 - 28 Th10",
  members: [
    { avatar: "https://ui-avatars.com/api/?name=User+1&background=random" },
    { avatar: "https://ui-avatars.com/api/?name=User+2&background=random" },
    { avatar: "https://ui-avatars.com/api/?name=User+3&background=random" },
    { avatar: "https://ui-avatars.com/api/?name=User+4&background=random" },
  ],
};

const MOCK_BALANCE = {
  amount: 500000,
  totalGroupSpend: "15.000.000đ",
  details: [
    {
      name: "Tuấn",
      amount: 300,
      avatar: "https://ui-avatars.com/api/?name=Tuan",
    },
    {
      name: "Minh",
      amount: 200,
      avatar: "https://ui-avatars.com/api/?name=Minh",
    },
  ],
};

const MOCK_TRANSACTIONS = [
  {
    date: "Hôm nay",
    items: [
      {
        id: 1,
        title: "Linh trả Tuấn",
        payer: "Linh",
        amount: "500.000đ",
        shareAmount: "Thanh toán nợ",
        category: "general",
        isLender: false,
      }, // Payment type
      {
        id: 2,
        title: "Ăn tối BBQ",
        payer: "Tuấn",
        amount: "2.000.000đ",
        shareAmount: "400k",
        category: "food",
        isLender: true,
      },
      {
        id: 3,
        title: "Drinks tại The Maze",
        payer: "Bạn",
        amount: "850.000đ",
        shareAmount: "680k",
        category: "drink",
        isLender: true,
      },
    ],
  },
  {
    date: "Hôm qua",
    items: [
      {
        id: 4,
        title: "Taxi về khách sạn",
        payer: "Linh",
        amount: "150.000đ",
        shareAmount: "30k",
        category: "transport",
        isLender: false,
      },
      {
        id: 5,
        title: "Vé thác Datanla",
        payer: "Tuấn",
        amount: "1.200.000đ",
        shareAmount: "240k",
        category: "shopping",
        isLender: false,
      },
    ],
  },
];

const GroupDetail = () => {
  const { id } = useParams(); // Lấy ID từ URL để fetch API sau này
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Chi tiêu");
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0b1411] text-white font-sans pb-24 lg:pb-0">
      {/* HEADER NAVIGATION (Sticky Top) */}
      <div className="sticky top-0 z-30 bg-[#0b1411]/80 backdrop-blur-md border-b border-[#1c2e26] px-4 py-3 flex justify-between items-center">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-full hover:bg-[#1c2e26] transition-colors"
        >
          <ArrowLeft size={22} className="text-gray-300" />
        </button>
        <span className="font-bold text-lg lg:hidden opacity-0 animate-fadeIn">
          Detail
        </span>{" "}
        {/* Ẩn title ở header mobile, hiện khi scroll nếu muốn */}
        <button
          onClick={() => navigate(`/groups/${id}/settings`)}
          className="p-2 -mr-2 rounded-full hover:bg-[#1c2e26] transition-colors"
        >
          <Settings size={22} className="text-gray-300" />
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-4 lg:px-8">
        {/* LAYOUT GRID CHO DESKTOP */}
        <div className="lg:grid lg:grid-cols-12 lg:gap-10">
          {/* CỘT TRÁI: THÔNG TIN CHUNG (Sticky trên Desktop) */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 lg:h-fit">
            <GroupHeader groupInfo={MOCK_GROUP} />

            <div className="mt-6 mb-8 lg:mb-0">
              <BalanceCard userBalance={MOCK_BALANCE} />
            </div>
          </div>

          {/* CỘT PHẢI: NỘI DUNG CHÍNH (Tabs & List) */}
          <div className="lg:col-span-8 lg:mt-8">
            <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

            <div className="min-h-[500px]">
              {activeTab === "Chi tiêu" && (
                <ExpenseList transactions={MOCK_TRANSACTIONS} />
              )}
              {activeTab === "Số dư" && (
                <div className="text-center text-gray-500 py-10">
                  Chức năng đang phát triển...
                </div>
              )}
              {activeTab === "Thống kê" && (
                <div className="text-center text-gray-500 py-10">
                  Chức năng đang phát triển...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* FLOATING ACTION BUTTON (Cho Mobile & Desktop) */}
      <div className="fixed bottom-6 right-6 lg:bottom-10 lg:right-10 z-40">
        <motion.button
          onClick={() => setIsExpenseModalOpen(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 bg-[#34d399] text-[#0b1411] pl-4 pr-6 py-4 rounded-2xl font-bold shadow-2xl shadow-[#34d399]/30 hover:bg-[#2cb683] transition-colors"
        >
          <Plus size={24} strokeWidth={2.5} />
          <span className="text-base">Thêm chi tiêu</span>
        </motion.button>
      </div>
      <CreateExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
      />
    </div>
  );
};

export default GroupDetail;
