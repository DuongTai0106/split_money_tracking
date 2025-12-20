import React from "react";
import { motion } from "framer-motion";

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen flex bg-white">
      {/* Cột trái: Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 bg-white z-10 relative">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-8">
              <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
                P
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">
                PERN Stack
              </span>
            </div>

            <h2 className="mt-6 text-3xl font-semibold text-gray-900 tracking-tight">
              {title}
            </h2>
            <p className="mt-2 text-sm text-gray-600">{subtitle}</p>
          </motion.div>

          <div className="mt-8">{children}</div>
        </div>
      </div>

      {/* Cột phải: Artwork / Banner */}
      <div className="hidden lg:block relative w-0 flex-1 overflow-hidden bg-gray-900">
        <div className="absolute inset-0 bg-linear-to-br from-indigo-900 via-purple-900 to-black opacity-90 z-10"></div>
        <img
          className="absolute inset-0 h-full w-full object-cover opacity-40 mix-blend-overlay"
          src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop"
          alt="Abstract Background"
        />
        {/* Decorative Circles */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-indigo-500 blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-purple-500 blur-3xl opacity-20"></div>

        <div className="absolute inset-0 flex items-center justify-center z-20 px-20 text-center">
          <div>
            <h3 className="text-4xl font-bold text-white mb-6">
              Xây dựng tương lai kỹ thuật số
            </h3>
            <p className="text-indigo-200 text-lg">
              Nền tảng quản lý dữ liệu mạnh mẽ, bảo mật và hiệu năng cao dành
              cho doanh nghiệp hiện đại.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
