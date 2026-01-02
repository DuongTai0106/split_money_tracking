import { motion } from "framer-motion";
const QuickActions = ({ icon: Icon, label, onClick, disabled }) => (
  <motion.button
    onClick={disabled ? null : onClick}
    disabled={disabled}
    whileHover={disabled ? {} : { y: -4, backgroundColor: "#233930" }}
    whileTap={disabled ? {} : { scale: 0.95 }}
    className={`flex flex-col items-center justify-center gap-2 lg:gap-3 p-4 lg:p-6 rounded-2xl border transition-all w-full h-full group shadow-md ${
      disabled
        ? "bg-[#1c2e26]/50 border-gray-700 cursor-not-allowed opacity-50 grayscale"
        : "bg-[#1c2e26] border-[#2d4a3e] hover:border-[#34d399]/50"
    }`}
  >
    <div
      className={`w-10 h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
        disabled
          ? "bg-[#0b1411]/50 text-gray-500"
          : "bg-[#0b1411] text-[#34d399] group-hover:text-white group-hover:bg-[#34d399]"
      }`}
    >
      <Icon size={20} className="lg:w-6 lg:h-6" />
    </div>
    <span
      className={`font-medium text-xs lg:text-sm text-center ${
        disabled
          ? "text-gray-600"
          : "text-gray-300 group-hover:text-white"
      }`}
    >
      {label}
    </span>
  </motion.button>
);
export default QuickActions;
