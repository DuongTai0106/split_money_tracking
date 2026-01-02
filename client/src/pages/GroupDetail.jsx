import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Settings, Plus, Loader2 } from "lucide-react"; // Thêm Loader2
import { motion } from "framer-motion";
import toast from "react-hot-toast"; // Dùng để báo lỗi

// Import Components & Service
import GroupHeader from "../components/group-detail/GroupHeader";
import BalanceCard from "../components/group-detail/BalanceCard";
import TabNavigation from "../components/group-detail/TabNavigation";
import ExpenseList from "../components/group-detail/ExpenseList";
import CreateExpenseModal from "../components/modals/CreateExpenseModal";
import groupService from "../services/groupService";
import DebtDetailsModal from "../components/modals/DebtDetailsModal";
import { io } from "socket.io-client";

const GroupDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Chi tiêu");
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);

  // State cho dữ liệu
  const [loading, setLoading] = useState(true);
  const [groupData, setGroupData] = useState(null);
  const [balanceData, setBalanceData] = useState(null);
  const [transactions, setTransactions] = useState([]);

  // Hàm fetch dữ liệu
  const fetchGroupDetails = async () => {
    try {
      const res = await groupService.getGroupDetails(id);
      if (res.ok && res.data.success) {
        setGroupData(res.data.group);
        setBalanceData(res.data.balance);
        setTransactions(res.data.transactions);
      } else {
        toast.error(res.data.message || "Không thể tải thông tin nhóm");
        navigate("/"); // Đá về trang chủ nếu lỗi
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    fetchGroupDetails();

    // Socket.IO Setup
    const newSocket = io(import.meta.env.VITE_API_URL, {
        withCredentials: true,
    });

    newSocket.on("connect", () => {
      console.log("Connected to socket server");
      newSocket.emit("join-group", id);
    });

    newSocket.on("group-updated", (data) => {
      console.log("Receive group update:", data);
      toast.success("Dữ liệu đã được cập nhật!");
      fetchGroupDetails();
    });

    return () => {
      newSocket.disconnect();
    };
  }, [id]);

  // Loading UI
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b1411] flex items-center justify-center text-[#34d399]">
        <Loader2 className="animate-spin" size={40} />
      </div>
    );
  }

  // Nếu không có data (lỗi)
  if (!groupData) return null;

  return (
    <div className="min-h-screen bg-[#0b1411] text-white font-sans pb-24 lg:pb-0">
      {/* HEADER NAVIGATION */}
      <div className="sticky top-0 z-30 bg-[#0b1411]/80 backdrop-blur-md border-b border-[#1c2e26] px-4 py-3 flex justify-between items-center">
        <button
          onClick={() => navigate(`/groups`)}
          className="p-2 -ml-2 rounded-full hover:bg-[#1c2e26] transition-colors"
        >
          <ArrowLeft size={22} className="text-gray-300" />
        </button>
        <span className="font-bold text-lg lg:hidden opacity-0 animate-fadeIn">
          Detail
        </span>
        <button
          onClick={() => navigate(`/groups/${id}/settings`)}
          className="p-2 -mr-2 rounded-full hover:bg-[#1c2e26] transition-colors"
        >
          <Settings size={22} className="text-gray-300" />
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-4 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-10">
          {/* CỘT TRÁI */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 lg:h-fit">
            {/* Truyền dữ liệu thật vào Props */}
            <GroupHeader groupInfo={groupData} />

            <div className="mt-6 mb-8 lg:mb-0">
              <BalanceCard
                userBalance={balanceData}
                onViewAll={() => setIsDebtModalOpen(true)}
              />
            </div>
          </div>

          {/* CỘT PHẢI */}
          <div className="lg:col-span-8 lg:mt-8">
            <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

            <div className="min-h-[500px]">
              {activeTab === "Chi tiêu" && (
                <>
                  {transactions.length > 0 ? (
                    <ExpenseList transactions={transactions} />
                  ) : (
                    <div className="text-center text-gray-500 py-10 italic">
                      Chưa có chi tiêu nào. Hãy thêm mới!
                    </div>
                  )}
                </>
              )}
              {activeTab === "Số dư" && (
                <div className="text-center text-gray-500 py-10">
                  {/* Có thể tái sử dụng BalanceCard hoặc vẽ biểu đồ ở đây */}
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

      {/* FAB */}
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

      {/* Modal tạo chi tiêu mới */}
      <CreateExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        groupId={id} // Truyền ID nhóm vào để tạo bill đúng nhóm
        members={groupData.members} // Truyền danh sách thành viên để chọn người split bill
        onSuccess={() => {
          fetchGroupDetails(); // Reload lại dữ liệu sau khi tạo bill thành công
          setIsExpenseModalOpen(false);
        }}
      />

      {balanceData && (
        <DebtDetailsModal
          isOpen={isDebtModalOpen}
          onClose={() => setIsDebtModalOpen(false)}
          details={balanceData.details} // Danh sách nợ lấy từ API
          groupId={id}
          onSuccess={() => {
            // Khi thanh toán xong, reload lại data
            fetchGroupDetails();
          }}
        />
      )}
    </div>
  );
};

export default GroupDetail;
