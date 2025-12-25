import React, { useRef, useState } from "react";
import { Camera, Calendar, ChevronDown } from "lucide-react";

const InfoSection = ({ groupInfo, setGroupInfo }) => {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(groupInfo.image);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-[#1c2e26] rounded-2xl p-6 border border-[#2d4a3e] space-y-6">
      <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider">
        Thông tin chung
      </h3>

      {/* 1. Group Image */}
      <div className="flex justify-center">
        <div
          className="relative group cursor-pointer"
          onClick={() => fileInputRef.current.click()}
        >
          <div className="w-28 h-28 rounded-3xl overflow-hidden border-4 border-[#2d4a3e] shadow-xl">
            <img
              src={preview}
              alt="Group Cover"
              className="w-full h-full object-cover transition-transform group-hover:scale-110"
            />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-[#2d4a3e] p-2 rounded-xl border-2 border-[#1c2e26] text-white">
            <Camera size={16} />
          </div>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleImageChange}
          />
        </div>
      </div>

      {/* 2. Group Name */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300">Tên nhóm</label>
        <input
          type="text"
          value={groupInfo.name}
          onChange={(e) => setGroupInfo({ ...groupInfo, name: e.target.value })}
          className="w-full bg-[#0b1411] border border-[#2d4a3e] rounded-xl px-4 py-3 text-white focus:border-[#34d399] focus:outline-none font-bold text-lg"
        />
      </div>

      {/* 3. Currency & Status (Grid 2 cột) */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Loại tiền</label>
          <div className="relative">
            <select className="w-full bg-[#0b1411] border border-[#2d4a3e] rounded-xl px-4 py-3 text-white appearance-none focus:outline-none">
              <option>VND (đ)</option>
              <option>USD ($)</option>
            </select>
            <ChevronDown
              className="absolute right-3 top-3.5 text-gray-500 pointer-events-none"
              size={16}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">
            Trạng thái
          </label>
          <div className="flex items-center justify-between bg-[#0b1411] border border-[#2d4a3e] rounded-xl px-4 py-3">
            <span className="text-white font-medium">Hoạt động</span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#34d399] shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
          </div>
        </div>
      </div>

      {/* 4. Date Range */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Bắt đầu</label>
          <div className="relative">
            <input
              type="date"
              defaultValue="2023-10-24"
              className="w-full bg-[#0b1411] border border-[#2d4a3e] rounded-xl px-4 py-3 text-white focus:outline-none [color-scheme:dark]"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Kết thúc</label>
          <div className="relative">
            <input
              type="date"
              defaultValue="2023-10-28"
              className="w-full bg-[#0b1411] border border-[#2d4a3e] rounded-xl px-4 py-3 text-white focus:outline-none [color-scheme:dark]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoSection;
