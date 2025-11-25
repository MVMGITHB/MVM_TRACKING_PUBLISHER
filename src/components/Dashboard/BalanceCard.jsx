import React from "react";
import { motion } from "framer-motion";

const BalanceCard = () => {
  // Safe parse localStorage data
  const safeParse = (data) => {
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  };

  const stored = safeParse(localStorage.getItem("user"));
  const affiliate = stored?.affiliate || {};

  return (
    <div className="flex flex-col md:flex-row gap-6 pb-6">

      {/* Animated Manager Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        whileHover={{ scale: 1.02 }}
        className="
          flex-1 bg-gradient-to-b from-orange-50 via-sky-100 to-sky-300
          rounded-xl shadow-lg p-6 flex items-start gap-4 
    
        "
      >
        <motion.img
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4 }}
          whileHover={{ rotate: 6, scale: 1.05 }}
          src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
          alt="avatar"
          className="w-16 h-16 rounded-full object-cover border border-orange-300 shadow-md"
        />

        <div>
          <p className="text-orange-600 text-sm font-medium">Personal Manager</p>

          <h2 className="text-xl font-bold text-gray-900 mt-1">
            {affiliate.name || "N/A"}
          </h2>

          <p className="text-sm text-gray-600 mt-1">
            Email:{" "}
            <a
              href={`mailto:${affiliate.email}`}
              className="text-orange-600 font-medium hover:underline"
            >
              {affiliate.email || "N/A"}
            </a>
          </p>

          {/* Beautiful animated balance box */}
          {/* <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-4 bg-white/70 p-4 rounded-lg border border-orange-200 shadow-sm"
          >
            <p className="text-gray-700 text-sm">Balance</p>
            <h3 className="text-2xl font-bold text-green-600">
              28331.604 <span className="text-base text-gray-600">INR</span>
            </h3>
          </motion.div> */}
        </div>
      </motion.div>

    </div>
  );
};

export default BalanceCard;
