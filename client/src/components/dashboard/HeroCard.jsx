import { motion } from "framer-motion";
const HeroCard = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl bg-linear-to-br from-[#1c2e26] to-[#0f1a16] border border-[#2d4a3e] p-8 h-full min-h-[200px] flex flex-col justify-center"
    >
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#34d399] blur-[100px] opacity-10 rounded-full pointer-events-none -mr-16 -mt-16"></div>

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-2">
          <span className="text-gray-400 text-sm font-medium">
            Số dư hiện tại
          </span>
          <span className="px-3 py-1 bg-[#34d399]/10 text-[#34d399] text-xs rounded-full font-bold">
            Tổng quan
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <h2 className="text-4xl lg:text-5xl font-bold text-white tracking-tight">
            + 1.250.000<span className="text-2xl text-gray-400">đ</span>
          </h2>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-[#34d399]"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7 17L17 7M17 7H7M17 7V17"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.div>
        </div>
        <p className="text-gray-400 text-sm mt-2">
          Bạn đang có số dư dương trong 2 nhóm
        </p>
      </div>
    </motion.div>
  );
};

export default HeroCard;
