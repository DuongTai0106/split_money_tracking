import React from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

const Button = ({
  children,
  isLoading,
  variant = "primary",
  className,
  ...props
}) => {
  const baseStyle =
    "w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed transition-all";

  const variants = {
    primary:
      "text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 focus:ring-indigo-500 shadow-indigo-500/30",
    outline:
      "text-gray-700 bg-white border-gray-300 hover:bg-gray-50 focus:ring-gray-200",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${baseStyle} ${variants[variant]} ${className}`}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : children}
    </motion.button>
  );
};

export default Button;
