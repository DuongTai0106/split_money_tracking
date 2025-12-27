import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import groupService from "../services/groupService";

// Components
import InfoSection from "../components/group-settings/InfoSection";
import MemberSection from "../components/group-settings/MemberSection";
import DangerZone from "../components/group-settings/DangerZone";

const GroupSettings = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // State lưu thông tin nhóm
  const [groupInfo, setGroupInfo] = useState({
    name: "",
    image: "",
    currency: "VND",
    start_date: "",
    end_date: "",
    invite_code: "",
    members: [],
    created_by: "null", // Để so sánh
  });

  // State xác định xem user hiện tại có phải chủ nhóm không
  const [isCreator, setIsCreator] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await groupService.getGroupSettings(id);

        if (res.ok && res.data.success) {
          const data = res.data.data;
          const serverCurrentUserId = res.data.currentUserId; // Lấy ID từ backend trả về
          console.log("Server User ID:", serverCurrentUserId);
          console.log("Group Creator ID:", data.created_by);
          setGroupInfo({
            ...data,
            start_date: data.start_date ? data.start_date.split("T")[0] : "",
            end_date: data.end_date ? data.end_date.split("T")[0] : "",
          });

          // SO SÁNH QUYỀN CHỦ NHÓM TẠI ĐÂY
          // Ép kiểu String để đảm bảo chính xác (vd: "1" == 1)
          if (String(serverCurrentUserId) === String(data.created_by)) {
            setIsCreator(true);
          } else {
            setIsCreator(false);
          }
        } else {
          toast.error("Không thể tải cài đặt nhóm");
          navigate(-1);
        }
      } catch (error) {
        console.error(error);
        toast.error("Lỗi kết nối");
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [id, navigate]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", groupInfo.name);
      formData.append("currency", groupInfo.currency);
      formData.append("start_date", groupInfo.start_date);
      formData.append("end_date", groupInfo.end_date);

      if (selectedFile) {
        formData.append("groupImage", selectedFile);
      }

      const res = await groupService.updateGroup(id, formData);
      if (res.ok && res.data.success) {
        toast.success("Cập nhật thành công!");
        if (res.data.image) {
          setGroupInfo((prev) => ({ ...prev, image: res.data.image }));
        }
        // navigate(-1); // Có thể giữ lại trang này thay vì back
      } else {
        toast.error("Cập nhật thất bại");
      }
    } catch (error) {
      toast.error("Lỗi hệ thống");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-[#0b1411] flex items-center justify-center text-[#34d399]">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-[#0b1411] text-white font-sans pb-10"
    >
      {/* HEADER */}
      <div className="sticky top-0 z-30 bg-[#0b1411]/90 backdrop-blur border-b border-[#1c2e26] px-4 py-4 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-full hover:bg-[#1c2e26] text-gray-300"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-lg font-bold">Cài đặt Nhóm</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="text-[#34d399] font-bold text-sm hover:underline px-2 flex items-center gap-2"
        >
          {saving && <Loader2 size={14} className="animate-spin" />}
          Lưu
        </button>
      </div>

      <div className="max-w-6xl mx-auto p-4 lg:p-8">
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 lg:gap-10">
          {/* LEFT: INFO */}
          <div className="lg:col-span-5 space-y-6 lg:space-y-8">
            <InfoSection
              groupInfo={groupInfo}
              setGroupInfo={setGroupInfo}
              setSelectedFile={setSelectedFile}
            />
            <div className="hidden lg:block">
              {/* Truyền biến isCreator đã tính toán vào */}
              <DangerZone groupId={id} isCreator={isCreator} />
            </div>
          </div>

          {/* RIGHT: MEMBERS & INVITE */}
          <div className="lg:col-span-7 space-y-6">
            <MemberSection
              members={groupInfo.members}
              inviteCode={groupInfo.invite_code}
              groupName={groupInfo.name}
            />
            <div className="lg:hidden pt-4">
              <DangerZone groupId={id} isCreator={isCreator} />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default GroupSettings;
