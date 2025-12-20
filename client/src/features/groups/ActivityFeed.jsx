import React from "react";
import { Receipt, Handshake, UserPlus, FileEdit } from "lucide-react";
import { timeAgo } from "../../utils/timeAgo";

const ActivityFeed = ({ logs }) => {
  if (!logs || logs.length === 0) return null;

  const renderContent = (log) => {
    const { actor_name, action_type, content } = log;

    // Style riêng cho từng loại hành động
    switch (action_type) {
      case "EXPENSE":
        return (
          <>
            <span className="font-bold text-gray-900">{actor_name}</span>
            <span className="text-gray-600"> đã thêm khoản chi </span>
            <span className="font-bold text-gray-900">
              {content.description}
            </span>
          </>
        );
      case "SETTLE":
        return (
          <>
            <span className="font-bold text-gray-900">{actor_name}</span>
            <span className="text-gray-600"> đã trả cho </span>
            <span className="font-bold text-gray-900">
              {content.receiverName}
            </span>
            <span className="text-gray-600"> số tiền </span>
            <span className="font-bold text-green-600">
              {Number(content.amount).toLocaleString()}
            </span>
          </>
        );
      case "JOIN":
        return (
          <>
            <span className="font-bold text-gray-900">{actor_name}</span>
            <span className="text-gray-600"> đã tham gia nhóm.</span>
          </>
        );
      default:
        return (
          <span className="text-gray-600">Hoạt động mới từ {actor_name}</span>
        );
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "EXPENSE":
        return <Receipt className="h-4 w-4 text-orange-600" />;
      case "SETTLE":
        return <Handshake className="h-4 w-4 text-green-600" />;
      case "JOIN":
        return <UserPlus className="h-4 w-4 text-blue-600" />;
      default:
        return <FileEdit className="h-4 w-4 text-gray-600" />;
    }
  };

  const getBgColor = (type) => {
    switch (type) {
      case "EXPENSE":
        return "bg-orange-100";
      case "SETTLE":
        return "bg-green-100";
      case "JOIN":
        return "bg-blue-100";
      default:
        return "bg-gray-100";
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mt-6">
      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
        Nhật ký hoạt động
      </h3>

      <div className="space-y-0">
        {logs.map((log, index) => (
          <div key={log.id} className="relative pl-6 pb-6 last:pb-0">
            {/* Timeline Line */}
            {index !== logs.length - 1 && (
              <div className="absolute top-2 left-2.5 w-0.5 h-full bg-gray-100"></div>
            )}

            {/* Icon Dot */}
            <div
              className={`absolute top-0 left-0 w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm z-10 ${getBgColor(
                log.action_type
              )}`}
            >
              {getIcon(log.action_type)}
            </div>

            {/* Content */}
            <div className="-mt-1">
              <p className="text-sm leading-relaxed">{renderContent(log)}</p>
              <p className="text-xs text-gray-400 mt-1">
                {timeAgo(log.created_at)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityFeed;
