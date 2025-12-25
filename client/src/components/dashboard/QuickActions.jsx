import { motion } from "framer-motion";
const QuickActions = ({ icon: Icon, label }) => (
  <motion.button
    whileHover={{ y: -4, backgroundColor: "#233930" }}
    whileTap={{ scale: 0.95 }}
    className="flex flex-col items-center justify-center gap-2 lg:gap-3 bg-[#1c2e26] p-4 lg:p-6 rounded-2xl border border-[#2d4a3e] hover:border-[#34d399]/50 transition-all w-full h-full group shadow-md"
  >
    <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-[#0b1411] flex items-center justify-center text-[#34d399] group-hover:text-white group-hover:bg-[#34d399] transition-all duration-300">
      <Icon size={20} className="lg:w-6 lg:h-6" />
    </div>
    <span className="text-gray-300 group-hover:text-white font-medium text-xs lg:text-sm text-center">
      {label}
    </span>
  </motion.button>
);
export default QuickActions;
