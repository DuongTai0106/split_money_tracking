import React, { useState } from "react";
import {
  Copy,
  QrCode,
  UserPlus,
  Shield,
  Trash2,
  Crown,
  Ghost,
  AlertTriangle,
  LogOut,
} from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import QRCode from "react-qr-code";
import UserSearchInput from "./UserSearchInput";

const API_URL = "http://localhost:5000";

const GroupSettings = ({ group, members, onRefresh, currentUserId }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  // group object chứa invite_code
  const inviteLink = `${window.location.origin}/join/${group?.invite_code}`;
  const myProfile = members.find((m) => m.userId === currentUserId);
  const myRole = myProfile?.role || "MEMBER";
  const isOwner = myRole === "OWNER";
  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    toast.success("Đã copy link mời!");
  };

  const handleKick = async (memberId, memberName) => {
    if (!window.confirm(`Bạn chắc chắn muốn mời ${memberName} ra khỏi nhóm?`))
      return;

    try {
      const res = await fetch(
        `${API_URL}/group/${group.id}/members/${memberId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      if (res.ok) {
        toast.success(`Đã xóa ${memberName}`);
        onRefresh(); // Load lại danh sách
      } else {
        const data = await res.json();
        toast.error(data.message);
      }
    } catch (e) {
      toast.error("Lỗi kết nối");
    }
  };

  const handleLeaveGroup = async () => {
    if (
      !window.confirm(
        "Bạn chắc chắn muốn rời nhóm? Mọi khoản nợ liên quan đến bạn cần được giải quyết trước."
      )
    )
      return;

    try {
      const res = await fetch(`${API_URL}/group/${group.id}/leave`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        toast.success("Đã rời nhóm");
        navigate("/groups"); // Quay về trang chủ
      } else {
        const data = await res.json();
        toast.error(data.message);
      }
    } catch (e) {
      toast.error("Lỗi kết nối");
    }
  };

  const handleDeleteGroup = async () => {
    if (
      !window.confirm(
        "CẢNH BÁO: Hành động này không thể hoàn tác! Tất cả dữ liệu chi tiêu sẽ bị xóa vĩnh viễn."
      )
    )
      setIsDeleting(true);

    try {
      const res = await fetch(`${API_URL}/group/${group.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      let data;
      try {
        data = await res.json();
      } catch (e) {
        data = { message: "Lỗi phản hồi từ server" };
      }
      if (res.ok) {
        toast.success("Đã giải tán nhóm");
        setTimeout(() => {
          window.location.href = "/groups";
        }, 1000);
      } else {
        toast.error(data.message);
        setIsDeleting(false);
      }
    } catch (e) {
      console.error(e);
      toast.error("Lỗi kết nối hoặc Server không phản hồi");
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <h2 className="text-2xl font-bold text-gray-800">Cài đặt nhóm</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. INVITE SECTION (QR CODE) */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-2">Mời tham gia</h3>
            <p className="text-sm text-gray-500 mb-4">
              Quét mã để vào nhóm ngay lập tức.
            </p>

            {/* QR Code Thật */}
            <div className="bg-white border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center mb-4">
              <div
                style={{
                  height: "auto",
                  margin: "0 auto",
                  maxWidth: 120,
                  width: "100%",
                }}
              >
                <QRCode
                  size={256}
                  style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                  value={inviteLink}
                  viewBox={`0 0 256 256`}
                />
              </div>
            </div>

            {/* Link Box */}
            <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200">
              <span className="text-xs text-gray-600 truncate flex-1">
                {group?.invite_code}
              </span>
              <button
                onClick={handleCopy}
                className="p-1.5 hover:bg-white rounded-md transition-colors text-indigo-600"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* DANGER ZONE (Cho Owner/Member) */}
          <div className="bg-red-50 p-5 rounded-2xl border border-red-100">
            <h3 className="font-bold text-red-800 mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" /> Vùng nguy hiểm
            </h3>

            {isOwner ? (
              <button
                onClick={handleDeleteGroup}
                disabled={isDeleting}
                className="w-full py-2 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-bold hover:bg-red-600 hover:text-white transition-colors"
              >
                {isDeleting ? "Đang xóa..." : "Giải tán nhóm"}
              </button>
            ) : (
              <button
                onClick={handleLeaveGroup}
                className="w-full py-2 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-bold hover:bg-red-600 hover:text-white transition-colors flex items-center justify-center gap-2"
              >
                <LogOut className="h-4 w-4" /> Rời khỏi nhóm
              </button>
            )}
          </div>
        </div>

        {/* 2. MEMBER LIST */}
        <div className="md:col-span-2 space-y-4">
          <UserSearchInput groupId={group.id} onMemberAdded={onRefresh} />
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-800">
                Thành viên ({members.length})
              </h3>
              <button className="text-sm text-indigo-600 font-medium flex items-center gap-1 hover:underline">
                <UserPlus className="h-4 w-4" /> Thêm Ghost User
              </button>
            </div>

            <div className="divide-y divide-gray-50">
              {members.map((mem) => {
                // Logic hiển thị nút Xóa:
                // 1. Mình phải là Owner hoặc Admin (ở đây đơn giản hóa là Owner)
                // 2. Không được xóa chính mình
                // 3. Không được xóa Owner khác
                const canKick = isOwner && mem.userId !== currentUserId;

                return (
                  <motion.div
                    layout
                    key={mem.id}
                    className="p-4 flex items-center justify-between hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center font-bold">
                          {mem.avatar}
                        </div>
                        {mem.role === "OWNER" && (
                          <div className="absolute -top-1 -right-1 bg-yellow-400 p-0.5 rounded-full border border-white">
                            <Crown className="h-3 w-3 text-white fill-white" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900">
                            {mem.name}
                            {mem.userId === currentUserId && (
                              <span className="text-gray-400 font-normal">
                                {" "}
                                (Bạn)
                              </span>
                            )}
                          </p>
                          {mem.isGhost && (
                            <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[10px] font-bold border border-gray-200 flex items-center gap-1">
                              <Ghost className="h-3 w-3" /> Ghost
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          {mem.email || "Chưa có tài khoản"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {canKick && (
                        <button
                          onClick={() => handleKick(mem.id, mem.name)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Mời ra khỏi nhóm"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupSettings;
