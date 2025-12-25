import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
const GroupList = ({ group }) => (
  <motion.div
    layout
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    whileHover={{ scale: 1.02, backgroundColor: "#233930" }}
    className="flex items-center gap-4 p-4 rounded-2xl bg-[#1c2e26] border border-[#2d4a3e] cursor-pointer group transition-colors"
  >
    <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0">
      <img
        src={group.image}
        alt={group.name}
        className="w-full h-full object-cover"
      />
      {group.status === "positive" && (
        <div className="absolute bottom-1 right-1 w-5 h-5 bg-[#34d399] rounded-full flex items-center justify-center border-2 border-[#1c2e26]">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#0b1411"
            strokeWidth="4"
          >
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
      )}
    </div>

    <div className="flex-1 min-w-0">
      <div className="flex justify-between items-center">
        <h3 className="text-white font-bold text-lg truncate group-hover:text-[#34d399] transition-colors">
          {group.name}
        </h3>
      </div>

      <div
        className={`mt-1 font-medium ${
          group.status === "positive"
            ? "text-[#34d399]"
            : group.status === "negative"
            ? "text-red-500"
            : "text-gray-400"
        }`}
      >
        {group.status === "positive"
          ? `Bạn được trả ${group.amount}`
          : group.status === "negative"
          ? `Bạn nợ ${group.amount}`
          : group.amount}
      </div>
    </div>

    <div className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 group-hover:text-white group-hover:bg-[#34d399] group-hover:translate-x-1 transition-all">
      <ChevronRight size={20} />
    </div>
  </motion.div>
);
export default GroupList;
