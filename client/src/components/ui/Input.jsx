import React from "react";
import { motion } from "framer-motion";

const Input = ({ icon: Icon, label, error, ...props }) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-300">
          {label}
        </label>
      )}
      <div className="relative group">
        {/* Icon nằm bên trái */}
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
          {Icon && (
            <Icon className="h-5 w-5 text-gray-500 group-focus-within:text-[#34d399] transition-colors duration-200" />
          )}
        </div>

        <motion.input
          whileFocus={{ scale: 1.01 }}
          className={`
            block w-full pl-10 pr-3 py-3 
            rounded-xl leading-5 sm:text-sm shadow-sm
            bg-[#1c2e26] 
            text-white placeholder-gray-500
            transition-all duration-200 ease-in-out
            focus:outline-none focus:ring-4 
            ${
              error
                ? "border border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
                : "border border-[#2d4a3e] focus:border-[#34d399] focus:ring-[#34d399]/20"
            }
          `}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
};

export default Input;
