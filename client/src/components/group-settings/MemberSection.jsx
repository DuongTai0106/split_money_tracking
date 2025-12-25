import React, { useState } from "react";
import {
  Link2,
  QrCode,
  Grid3X3,
  MoreVertical,
  Shield,
  Crown,
  Copy,
  Check,
} from "lucide-react";
import { QRModal } from "../modals/QRModal";
import toast from "react-hot-toast";

const MemberItem = ({ member }) => (
  <div className="flex items-center justify-between p-3 rounded-xl hover:bg-[#0b1411] transition-colors group">
    <div className="flex items-center gap-3">
      <div className="relative">
        <img
          src={member.avatar}
          alt={member.name}
          className="w-10 h-10 rounded-full border border-[#2d4a3e]"
        />
        {/* Role Badge */}
        {member.role === "owner" && (
          <div
            className="absolute -bottom-1 -right-1 bg-[#34d399] text-[#0b1411] p-0.5 rounded-full border border-[#1c2e26]"
            title="Owner"
          >
            <Crown size={10} strokeWidth={3} />
          </div>
        )}
      </div>
      <div>
        <div className="flex items-center gap-2">
          <h4
            className={`font-bold text-sm ${
              member.isMe ? "text-[#34d399]" : "text-white"
            }`}
          >
            {member.name} {member.isMe && "(Bạn)"}
          </h4>
          {member.role === "owner" && (
            <span className="text-[10px] font-bold bg-[#34d399]/20 text-[#34d399] px-1.5 py-0.5 rounded">
              Owner
            </span>
          )}
          {member.role === "admin" && (
            <span className="text-[10px] font-bold bg-gray-600/30 text-gray-400 px-1.5 py-0.5 rounded">
              Admin
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500">{member.email}</p>
      </div>
    </div>

    <button className="text-gray-500 hover:text-white p-2 rounded-lg hover:bg-[#2d4a3e]">
      <MoreVertical size={18} />
    </button>
  </div>
);

const MemberSection = ({ members, inviteCode, groupName }) => {
  const [showQR, setShowQR] = useState(false);

  // Link mời giả định (Deep link hoặc Web link)
  const inviteLink = `${window.location.origin}/join/${inviteCode}`;

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    toast.success(`Đã sao chép ${type}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider">
          Thành viên ({members.length})
        </h3>
      </div>

      {/* Invite Buttons Grid */}
      <div className="grid grid-cols-3 gap-3">
        {/* Button 1: Copy Link */}
        <button
          onClick={() => handleCopy(inviteLink, "Link mời")}
          className="flex flex-col items-center justify-center gap-2 bg-[#1c2e26] p-4 rounded-2xl border border-[#2d4a3e] hover:bg-[#233930] transition-all group"
        >
          <div className="p-3 rounded-xl bg-blue-400/10 text-blue-400 group-hover:scale-110 transition-transform">
            <Link2 size={20} />
          </div>
          <span className="text-xs font-medium text-gray-300">Copy Link</span>
        </button>

        {/* Button 2: Show QR */}
        <button
          onClick={() => setShowQR(true)}
          className="flex flex-col items-center justify-center gap-2 bg-[#1c2e26] p-4 rounded-2xl border border-[#2d4a3e] hover:bg-[#233930] transition-all group"
        >
          <div className="p-3 rounded-xl bg-purple-400/10 text-purple-400 group-hover:scale-110 transition-transform">
            <QrCode size={20} />
          </div>
          <span className="text-xs font-medium text-gray-300">Mã QR</span>
        </button>

        {/* Button 3: Copy Code */}
        <button
          onClick={() => handleCopy(inviteCode, "Mã tham gia")}
          className="flex flex-col items-center justify-center gap-2 bg-[#1c2e26] p-4 rounded-2xl border border-[#2d4a3e] hover:bg-[#233930] transition-all group"
        >
          <div className="p-3 rounded-xl bg-orange-400/10 text-orange-400 group-hover:scale-110 transition-transform">
            <Grid3X3 size={20} />
          </div>
          <span className="text-xs font-medium text-gray-300">
            {inviteCode || "..."}
          </span>
        </button>
      </div>

      {/* Member List */}
      <div className="bg-[#1c2e26] rounded-2xl p-4 border border-[#2d4a3e] space-y-1 max-h-[400px] overflow-y-auto custom-scrollbar">
        {members.map((member) => (
          // Component MemberItem cũ của bạn
          <div
            key={member.id}
            className="flex items-center justify-between p-3 rounded-xl hover:bg-[#0b1411] transition-colors"
          >
            <div className="flex items-center gap-3">
              <img
                src={
                  member.avatar ||
                  `https://ui-avatars.com/api/?name=${member.name}`
                }
                className="w-10 h-10 rounded-full border border-[#2d4a3e]"
                alt={member.name}
              />
              <div>
                <h4
                  className={`font-bold text-sm ${
                    member.isMe ? "text-[#34d399]" : "text-white"
                  }`}
                >
                  {member.name} {member.isMe && "(Bạn)"}
                </h4>
                <p className="text-xs text-gray-500 capitalize">
                  {member.role}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* QR Modal */}
      <QRModal
        isOpen={showQR}
        onClose={() => setShowQR(false)}
        value={inviteLink}
        title="Mã QR Tham Gia"
        groupName={groupName}
      />
    </div>
  );
};

export default MemberSection;
