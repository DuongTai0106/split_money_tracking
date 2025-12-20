import React from "react";
import { motion } from "framer-motion";

const Input = ({ icon: Icon, label, error, ...props }) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
          {Icon && (
            <Icon className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors duration-200" />
          )}
        </div>
        <motion.input
          whileFocus={{ scale: 1.01 }}
          className={`block w-full pl-10 pr-3 py-3 border ${
            error
              ? "border-red-300 ring-red-200"
              : "border-gray-200 focus:border-indigo-500 focus:ring-indigo-200"
          } rounded-xl leading-5 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:bg-white transition-all duration-200 ease-in-out sm:text-sm shadow-sm`}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
};

export default Input;
