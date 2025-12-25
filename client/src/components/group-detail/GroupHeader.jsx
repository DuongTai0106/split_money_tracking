import React from "react";
import { Settings, Users } from "lucide-react";

const GroupHeader = ({ groupInfo }) => {
  return (
    <div className="flex flex-col items-center pt-6 pb-4">
      {/* Cover Image Wrapper */}
      <div className="relative">
        <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-3xl overflow-hidden border-4 border-[#1c2e26] shadow-xl">
          <img
            src={groupInfo.image}
            alt={groupInfo.name}
            className="w-full h-full object-cover"
          />
        </div>
        <span className="absolute -bottom-2 right-0 bg-[#34d399] text-[#0b1411] text-xs font-bold px-2 py-1 rounded-full border-2 border-[#0b1411]">
          Active
        </span>
      </div>

      {/* Title & Meta */}
      <h1 className="mt-4 text-2xl lg:text-3xl font-bold text-white text-center">
        {groupInfo.name} 
      </h1>

      <div className="flex items-center gap-2 mt-2 text-gray-400 text-sm">
        <Users size={14} />
        <span>{groupInfo.memberCount} thành viên</span>
        <span>•</span>
        <span>{groupInfo.dateRange}</span>
      </div>

      {/* Members Avatars */}
      <div className="flex -space-x-2 mt-4">
        {groupInfo.members.slice(0, 3).map((mem, idx) => (
          <img
            key={idx}
            src={mem.avatar}
            alt="Member"
            className="w-8 h-8 rounded-full border-2 border-[#0b1411]"
          />
        ))}
        {groupInfo.members.length > 3 && (
          <div className="w-8 h-8 rounded-full border-2 border-[#0b1411] bg-[#1c2e26] flex items-center justify-center text-xs text-white font-medium">
            +{groupInfo.members.length - 3}
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupHeader;
