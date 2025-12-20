import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Settings,
  Users,
  Copy,
  Check,
  Loader2,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";

// Import Components
import ExpenseItem from "../features/expenses/ExpenseItem";
import AddExpenseModal from "../features/expenses/AddExpenseModal";
import DebtPlan from "../features/debts/DebtPlan";
import SettleDebtModal from "../features/debts/SettleDebtModal";
import ActivityFeed from "../features/groups/ActivityFeed";
import GroupSettings from "../features/groups/GroupSettings";
// API Config
const API_URL = "http://localhost:5000";

const GroupDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState("DETAIL"); // 'DETAIL' hoặc 'SETTINGS'
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await fetch("http://localhost:5000/auth/me", {
          credentials: "include",
        });
        const data = await res.json();
        setCurrentUser(data.user);
      } catch (e) {}
    };
    fetchMe();
  }, []);

  // --- STATE MANAGEMENT ---
  const [group, setGroup] = useState(null); // Thông tin nhóm
  const [members, setMembers] = useState([]); // Danh sách thành viên
  const [expenses, setExpenses] = useState([]); // Lịch sử chi tiêu
  const [debtPlan, setDebtPlan] = useState([]); // Kế hoạch trả nợ
  const [myBalance, setMyBalance] = useState(0); // Số dư của bản thân

  const [isLoading, setIsLoading] = useState(true); // Loading trang
  const [isCopied, setIsCopied] = useState(false); // Trạng thái copy code

  // Modals State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const [logs, setLogs] = useState([]);

  // --- FETCH DATA FUNCTION ---
  // Dùng useCallback để tránh render lại không cần thiết
  const fetchGroupData = useCallback(async () => {
    try {
      // 1. Fetch Members
      const membersRes = await fetch(`${API_URL}/group/${id}/members`, {
        credentials: "include",
      });
      const membersData = await membersRes.json();
      setMembers(membersData);

      // 2. Fetch Expenses
      const expensesRes = await fetch(`${API_URL}/expenses/group/${id}`, {
        credentials: "include",
      });
      const expensesData = await expensesRes.json();
      setExpenses(expensesData);

      // 3. Fetch Debts
      const debtsRes = await fetch(`${API_URL}/debts/${id}`, {
        credentials: "include",
      });
      const debtsData = await debtsRes.json();
      setDebtPlan(debtsData.plan);

      // 4. Fetch Logs
      const logsRes = await fetch(`${API_URL}/group/${id}/logs`, {
        credentials: "include",
      });
      const logsData = await logsRes.json();
      setLogs(logsData);

      // --- SỬA ĐOẠN NÀY (GỌI API THẬT) ---
      const groupRes = await fetch(`${API_URL}/group/${id}`, {
        credentials: "include",
      });
      if (groupRes.ok) {
        const groupData = await groupRes.json();
        setGroup(groupData); // Cập nhật state với invite_code thật từ DB
      }
      // -----------------------------------
    } catch (error) {
      console.error("Fetch error", error);
      toast.error("Không thể tải dữ liệu");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  // Load data khi vào trang
  useEffect(() => {
    fetchGroupData();
  }, [fetchGroupData]);

  // --- HANDLERS ---

  // Copy Invite Code
  const handleCopyCode = () => {
    // 1. Kiểm tra xem dữ liệu nhóm đã tải xong chưa
    if (!group || !group.invite_code) {
      toast.error("Đang tải dữ liệu, vui lòng đợi...");
      return;
    }

    // 2. Copy mã invite_code thật
    navigator.clipboard
      .writeText(group.invite_code)
      .then(() => {
        setIsCopied(true);
        toast.success(`Đã copy mã: ${group.invite_code}`);

        // Tắt trạng thái "Đã chép" sau 2 giây
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch(() => {
        toast.error("Lỗi khi copy mã");
      });
  };

  // Xử lý khi thêm chi tiêu thành công
  const handleCreateExpense = async (payload) => {
    try {
      const res = await fetch(`${API_URL}/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...payload, groupId: id }),
      });

      if (!res.ok) throw new Error();

      toast.success("Đã thêm chi tiêu mới");
      setIsAddModalOpen(false);
      fetchGroupData(); // Refresh lại toàn bộ dữ liệu (Expenses + Debts)
    } catch (err) {
      toast.error("Lỗi khi thêm chi tiêu");
    }
  };

  // Mở modal thanh toán
  const handleSettleClick = (transaction) => {
    setSelectedTransaction(transaction);
    setIsSettleModalOpen(true);
  };

  // Xác nhận thanh toán
  const handleConfirmSettle = async () => {
    try {
      await fetch(`${API_URL}/debts/settle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          groupId: id,
          payerId: selectedTransaction.fromId,
          receiverId: selectedTransaction.toId,
          amount: selectedTransaction.amount,
        }),
      });

      toast.success("Thanh toán thành công!");
      setIsSettleModalOpen(false);
      fetchGroupData(); // Refresh lại
    } catch (err) {
      toast.error("Lỗi kết nối server");
    }
  };

  // --- RENDER ---

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (viewMode === "SETTINGS") {
    return (
      <div className="flex h-screen bg-white">
        <div className="flex-1 flex flex-col">
          {/* Header Settings */}
          <div className="p-4 border-b border-gray-200 flex items-center gap-4">
            <button
              onClick={() => setViewMode("DETAIL")}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-bold">Quay lại nhóm</h1>
          </div>

          {/* Render Settings Component */}
          <GroupSettings
            group={group}
            members={members}
            currentUserId={currentUser?.user_id} // Pass ID xuống
            onRefresh={fetchGroupData} // Để load lại list khi xóa mem
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      {/* --- LEFT COLUMN: MAIN CONTENT --- */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-gray-200">
        {/* 1. Sticky Header */}
        <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/groups")}
              className="p-2 -ml-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 truncate max-w-[200px] sm:max-w-md">
                {group?.name || "Chi tiết nhóm"}
              </h1>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Users className="h-3 w-3" />
                <span>{members.length} thành viên</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              title="Cài đặt nhóm"
              onClick={() => setViewMode("SETTINGS")}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <Settings className="h-5 w-5" />
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all active:scale-95 text-sm sm:text-base"
            >
              <Plus className="h-5 w-5" />
              <span className="hidden sm:inline">Thêm chi tiêu</span>
            </button>
          </div>
        </div>

        {/* 2. Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scroll-smooth">
          {/* Invite Banner */}
          <div className="mb-8 bg-linear-to-r from-indigo-50 to-purple-50 rounded-2xl p-4 border border-indigo-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-indigo-600">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">
                  Mời thành viên mới
                </p>
                <p className="text-xs text-gray-500">
                  Sử dụng mã để tham gia nhanh
                </p>
              </div>
            </div>
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-2 px-3 py-1.5 bg-white text-indigo-600 text-xs font-bold rounded-lg border border-indigo-100 shadow-sm hover:bg-indigo-50 transition-all"
            >
              {isCopied ? (
                <Check className="h-3 w-3" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
              {isCopied ? "Đã chép" : "Copy mã"}
            </button>
          </div>

          {/* Expenses Feed */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">
                Hoạt động gần đây
              </h2>
              <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded-md">
                {expenses.length} giao dịch
              </span>
            </div>

            {expenses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400 border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/50">
                <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Plus className="h-8 w-8 text-gray-300" />
                </div>
                <p className="font-medium">Chưa có chi tiêu nào</p>
                <p className="text-sm">
                  Hãy bấm nút "Thêm chi tiêu" để bắt đầu
                </p>
              </div>
            ) : (
              <div className="space-y-3 pb-10">
                {expenses.map((expense) => (
                  <ExpenseItem key={expense.id} expense={expense} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- RIGHT COLUMN: FINANCIAL SUMMARY (Hidden on Mobile) --- */}
      <div className="hidden xl:flex w-96 bg-gray-50 border-l border-gray-200 flex-col">
        <div className="p-6 border-b border-gray-200 bg-white/50">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-indigo-600" />
            Tổng quan tài chính
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Balance Widget (Placeholder Logic) */}
          {/* Trong thực tế, bạn cần tính myBalance từ debtPlan */}
          <div className="bg-linear-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white shadow-xl mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Users className="h-24 w-24" />
            </div>
            <p className="text-gray-400 text-sm font-medium mb-1">
              Trạng thái của bạn
            </p>
            <div className="text-3xl font-bold mb-2 tracking-tight">
              Ổn định
              {/* {myBalance >= 0 ? '+' : ''}{myBalance.toLocaleString()} {group?.currency_code} */}
            </div>
            <p className="text-xs text-gray-400">
              Dựa trên các tính toán tối ưu hóa nợ
            </p>
          </div>

          {/* Debt Plan Component */}
          <DebtPlan
            plan={debtPlan}
            groupCurrency={group?.currency_code || "VND"}
            onSettleClick={handleSettleClick}
          />
        </div>
      </div>

      {/* --- MODALS --- */}

      {/* 1. Modal Thêm Chi Tiêu */}
      <AddExpenseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        members={members}
        groupCurrency={group?.currency_code || "VND"}
        onSubmit={handleCreateExpense}
      />

      {/* 2. Modal Thanh Toán Nợ */}
      <SettleDebtModal
        isOpen={isSettleModalOpen}
        onClose={() => setIsSettleModalOpen(false)}
        transaction={selectedTransaction}
        onConfirm={handleConfirmSettle}
        groupCurrency={group?.currency_code || "VND"}
      />
      <ActivityFeed logs={logs} />
    </div>
  );
};

export default GroupDetail;
