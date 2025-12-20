import React from "react";
import { motion } from "framer-motion";

const Card = ({ children, className = "", onClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={
        onClick
          ? { y: -2, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }
          : {}
      }
      className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-6 ${className}`}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
};
export default Card;
