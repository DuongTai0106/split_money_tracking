import React from "react";
import { motion } from "framer-motion";

const TabNavigation = ({ activeTab, setActiveTab }) => {
  const tabs = ["Chi tiêu", "Số dư", "Thống kê"];

  return (
    <div className="flex border-b border-[#2d4a3e] mb-6 sticky top-0 bg-[#0b1411]/95 backdrop-blur z-20 pt-2">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`flex-1 pb-4 text-sm font-bold relative transition-colors ${
            activeTab === tab
              ? "text-white"
              : "text-gray-500 hover:text-gray-300"
          }`}
        >
          {tab}
          {activeTab === tab && (
            <motion.div
              layoutId="activeTabIndicator"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#34d399]"
            />
          )}
        </button>
      ))}
    </div>
  );
};

export default TabNavigation;
