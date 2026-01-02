import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Plus, QrCode, Keyboard, ChevronRight, Search, X } from "lucide-react";

// Import Modal & Components
import CreateGroupModal from "../components/modals/CreateGroupModal";
import DebtOverview from "../components/dashboard/DebtOverview";
import QuickActions from "../components/dashboard/QuickActions";
import groupService from "../services/groupService";
import toast from "react-hot-toast";
import JoinGroupModal from "../components/modals/JoinGroupModal";
import QRScannerModal from "../components/modals/QRScannerModal";
import JoinGroupConfirmModal from "../components/modals/JoinGroupConfirmModal";
import { useNavigate, useLocation } from "react-router-dom";

// --- SUB COMPONENTS ---
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
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // State tìm kiếm
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const [overviewData, setOverviewData] = useState({
    totalBalance: 0,
    details: [],
  });

  // QR Functionality State
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [scannedGroupInfo, setScannedGroupInfo] = useState(null);
  const [isJoining, setIsJoining] = useState(false); // Loading khi join
  const [scannedCode, setScannedCode] = useState("");

  // Check if Mobile
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const userAgent =
        navigator.userAgent || navigator.vendor || window.opera;
      if (/android/i.test(userAgent) || /iPad|iPhone|iPod/.test(userAgent)) {
        setIsMobile(true);
      } else {
        setIsMobile(false);
      }
    };
    checkMobile();
  }, []);

  const navigate = useNavigate();
  const location = useLocation();

  // Hàm gọi API (có nhận tham số search)
  const fetchData = async (query = "") => {
    // Nếu là load lần đầu thì set loading toàn trang,
    // nếu là search thì chỉ set loading nhẹ (có thể xử lý UI riêng nếu muốn)
    if (!query) setIsLoading(true);
    else setIsSearching(true);

    try {
      const [groupsRes, statsRes] = await Promise.all([
        groupService.getMyGroups(query), // Truyền query vào service
        groupService.getDashboardStats(),
      ]);

      if (groupsRes.ok && groupsRes.data.success) {
        setGroups(groupsRes.data.groups);
      }

      if (statsRes.ok && statsRes.data.success) {
        setOverviewData(statsRes.data.data);
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi tải dữ liệu");
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  };

  // 1. Load dữ liệu lần đầu
  useEffect(() => {
    fetchData();
  }, [location]);

  // 2. Logic Debounce cho Search
  // Khi user gõ, đợi 500ms sau khi ngừng gõ mới gọi API
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      // Chỉ gọi search nếu searchTerm khác rỗng hoặc gọi lại list gốc nếu rỗng
      fetchData(searchTerm);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleGroupClick = (groupId) => {
    navigate(`/groups/${groupId}`);
  };

  // --- QR HANDLERS ---
  const handleScanSuccess = async (code) => {
    // Gọi API preview
    const loadingToast = toast.loading("Đang tìm nhóm...");
    setIsQRScannerOpen(false);

    try {
      const res = await groupService.getGroupByCode(code);
      toast.dismiss(loadingToast);

      if (res.ok && res.data.success) {
        setScannedGroupInfo(res.data.group);
        setScannedCode(code); // Lưu code để join
        setIsConfirmModalOpen(true);
      } else {
        toast.error(res.data.message || "Không tìm thấy nhóm");
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Lỗi khi quét mã");
    }
  };

  const handleConfirmJoin = async () => {
    if (!scannedCode) return;
    setIsJoining(true);
    try {
        const res = await groupService.joinGroup(scannedCode);
        if (res.ok && res.data.success) {
            toast.success(res.data.message);
            fetchData(""); // Refresh list
            setIsConfirmModalOpen(false);
        } else {
            toast.error(res.data.message || "Lỗi khi tham gia");
        }
    } catch (error) {
        toast.error("Lỗi kết nối");
    } finally {
        setIsJoining(false);
    }
  };


  return (
    <div className="min-h-screen bg-[#0b1411] font-sans text-white pb-20 lg:pb-0">
      <div className="p-4 lg:p-10 max-w-7xl mx-auto space-y-6 lg:space-y-10">
        {/* HEADER */}
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

        {/* DASHBOARD OVERVIEW */}
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 lg:gap-6">
          <div className="w-full lg:col-span-2">
            <DebtOverview
              totalBalance={overviewData.totalBalance}
              details={overviewData.details}
            />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 lg:gap-4 h-full ">
            <QuickActions 
                icon={QrCode} 
                label="Quét QR" 
                onClick={() => {
                    if (isMobile) setIsQRScannerOpen(true);
                    else toast.error("Chức năng chỉ dành cho điện thoại")
                }}
                disabled={!isMobile} 
            />
            <QuickActions
              icon={Keyboard}
              label="Nhập mã"
              onClick={() => setIsJoinModalOpen(true)}
            />
          </div>
        </div>

        {/* GROUP LIST SECTION */}
        <section className="space-y-4">
          {/* TOOLBAR: Title & Search Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-lg lg:text-xl font-bold text-white whitespace-nowrap">
              Nhóm của bạn
            </h2>

            {/* --- SEARCH BAR DESIGN MỚI --- */}
            <div className="relative w-full md:max-w-xs group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search
                  size={18}
                  className={`transition-colors ${
                    isSearching
                      ? "text-[#34d399]"
                      : "text-gray-500 group-focus-within:text-[#34d399]"
                  }`}
                />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm nhóm..."
                className="block w-full pl-10 pr-10 py-2.5 bg-[#1c2e26] border border-[#2d4a3e] rounded-xl leading-5 text-gray-300 placeholder-gray-500 focus:outline-none focus:bg-[#16261f] focus:border-[#34d399] focus:ring-1 focus:ring-[#34d399] sm:text-sm transition-all shadow-sm"
              />
              {/* Nút xóa text Search */}
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-white"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            {/* ----------------------------- */}
          </div>

          {/* Grid Layout */}
          {isLoading && !isSearching ? ( // Nếu đang load lần đầu
            <div className="text-center text-gray-500 py-10 flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#34d399] mb-2"></div>
              Đang tải danh sách nhóm...
            </div>
          ) : groups.length === 0 ? (
            <div className="text-center text-gray-500 py-10 border-2 border-dashed border-[#2d4a3e] rounded-2xl bg-[#1c2e26]/30">
              {searchTerm ? (
                <>
                  <p>Không tìm thấy nhóm nào với từ khóa "{searchTerm}"</p>
                  <button
                    onClick={() => setSearchTerm("")}
                    className="text-[#34d399] mt-2 text-sm hover:underline"
                  >
                    Xóa tìm kiếm
                  </button>
                </>
              ) : (
                "Bạn chưa tham gia nhóm nào. Hãy tạo nhóm mới!"
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
              {groups.map((group) => (
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
                    status: group.status,
                    amount: group.amount,
                    time: group.time,
                    member_count: group.member_count,
                  }}
                />
              ))}

              {/* Nút thêm nhóm dạng Card (chỉ hiện khi không search) */}
              {!searchTerm && (
                <motion.div
                  onClick={() => setIsCreateModalOpen(true)}
                  whileHover={{
                    scale: 1.01,
                    borderColor: "#34d399",
                    color: "#34d399",
                  }}
                  className="hidden md:flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-[#2d4a3e] text-gray-500 cursor-pointer transition-all min-h-[100px]"
                >
                  <Plus size={24} />
                  <span className="mt-2 font-medium text-sm">
                    Thêm nhóm khác
                  </span>
                </motion.div>
              )}
            </div>
          )}
        </section>
      </div>

      <CreateGroupModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onGroupCreated={() => fetchData("")} // Reset search khi tạo xong
      />
      <JoinGroupModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        onJoinSuccess={() => fetchData("")}
      />

       {/* QR MODALS */}
       <QRScannerModal
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
      />
      <JoinGroupConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        groupInfo={scannedGroupInfo}
        onConfirm={handleConfirmJoin}
        loading={isJoining}
      />
    </div>
  );
};

export default Home;
