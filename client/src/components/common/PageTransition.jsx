import React from "react";
import { motion } from "framer-motion";

const PageTransition = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }} // Bắt đầu: Mờ và lệch phải
      animate={{ opacity: 1, x: 0 }} // Kết thúc: Rõ và về giữa
      exit={{ opacity: 0, x: -20 }} // Thoát: Mờ và lệch trái
      transition={{ duration: 0.3, ease: "easeInOut" }} // Thời gian chạy
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
