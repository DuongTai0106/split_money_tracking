import React from "react";
import {
  Link2,
  QrCode,
  Grid3X3,
  MoreVertical,
  Shield,
  Crown,
} from "lucide-react";

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

const MemberSection = ({ members }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider">
          Thành viên ({members.length})
        </h3>
        <button className="text-[#34d399] text-sm font-bold hover:underline">
          Quản lý
        </button>
      </div>

      {/* Invite Buttons Grid */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            icon: Link2,
            label: "Link mời",
            color: "text-blue-400",
            bg: "bg-blue-400/10",
          },
          {
            icon: QrCode,
            label: "QR Code",
            color: "text-purple-400",
            bg: "bg-purple-400/10",
          },
          {
            icon: Grid3X3,
            label: "Mã Code",
            color: "text-orange-400",
            bg: "bg-orange-400/10",
          },
        ].map((btn, idx) => (
          <button
            key={idx}
            className="flex flex-col items-center justify-center gap-2 bg-[#1c2e26] p-4 rounded-2xl border border-[#2d4a3e] hover:border-[#34d399]/50 hover:bg-[#233930] transition-all group"
          >
            <div
              className={`p-3 rounded-xl ${btn.bg} ${btn.color} group-hover:scale-110 transition-transform`}
            >
              <btn.icon size={20} />
            </div>
            <span className="text-xs font-medium text-gray-300">
              {btn.label}
            </span>
          </button>
        ))}
      </div>

      {/* Member List */}
      <div className="bg-[#1c2e26] rounded-2xl p-4 border border-[#2d4a3e] space-y-1">
        {members.map((member) => (
          <MemberItem key={member.id} member={member} />
        ))}

        <button className="w-full py-3 mt-2 text-sm text-gray-500 font-medium hover:text-[#34d399] border-t border-[#2d4a3e] transition-colors">
          Xem tất cả thành viên
        </button>
      </div>
    </div>
  );
};

export default MemberSection;
