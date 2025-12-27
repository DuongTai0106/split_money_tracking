import React from "react";
import { motion } from "framer-motion";

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    // Đổi nền tổng thể sang màu xanh đen đậm
    <div className="min-h-screen flex bg-[#0b1411] text-white">
      {/* Cột trái: Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 z-10 relative">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-8">
              <span className="font-bold text-4xl">
                Split<span className="text-[#34d399]">Bill</span>
              </span>
            </div>

            {/* Title: Màu trắng */}
            <h2 className="mt-6 text-3xl font-semibold text-white tracking-tight">
              {title}
            </h2>
            {/* Subtitle: Màu xám nhạt */}
            <p className="mt-2 text-sm text-gray-400">{subtitle}</p>
          </motion.div>

          <div className="mt-8">{children}</div>
        </div>
      </div>

      {/* Cột phải: Artwork / Banner */}
      <div className="hidden lg:block relative w-0 flex-1 overflow-hidden bg-gray-900">
        {/* Gradient Overlay: Đổi sang tông xanh Green/Emerald */}
        <div className="absolute inset-0 bg-linear-to-br from-emerald-500 via-[#000f0b] to-black opacity-90 z-10"></div>

        <img
          className="absolute inset-0 h-full w-full object-cover opacity-30 mix-blend-overlay"
          src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop"
          alt="Abstract Background"
        />

        {/* Decorative Circles: Đổi sang màu xanh */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-emerald-500 blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-green-500 blur-3xl opacity-20"></div>

        <div className="absolute inset-0 flex items-center justify-center z-20 px-20 text-center">
          <div>
            <h3 className="text-4xl font-bold text-white mb-6">
              Quản lý chi tiêu nhóm
            </h3>
            <p className="text-emerald-100 text-lg">
              Giải pháp toàn diện để chia hóa đơn, theo dõi công nợ và kiểm soát
              ngân sách chung chỉ với vài cú chạm. Chính xác và bảo mật.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
