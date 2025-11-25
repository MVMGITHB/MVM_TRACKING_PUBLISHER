// src/components/SidebarGroup.jsx
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import Icon from "@mdi/react";
import { IoIosArrowDown } from "react-icons/io";

export default function SidebarGroup({ title, icon, items }) {
  const location = useLocation();
  const [open, setOpen] = useState(true);

  return (
   <div className="mb-3 select-none">
  {/* Header */}
  <button
    onClick={() => setOpen(!open)}
    className="
      w-full flex items-center gap-3 px-4 py-3 rounded-md
      font-semibold
      transition-all

      bg-sky-200 text-black hover:bg-sky-600
    "
  >
    {/* Icon */}
    <Icon path={icon} size={1} />

    {/* Title */}
    <span>{title}</span>

    {/* Arrow */}
    <motion.span
      animate={{ rotate: open ? 180 : 0 }}
      transition={{ duration: 0.2 }}
      className="ml-auto text-black"
    >
      <IoIosArrowDown />
    </motion.span>
  </button>

  {/* Submenu Items */}
  <motion.div
    initial={false}
    animate={{
      height: open ? "auto" : 0,
      opacity: open ? 1 : 0,
    }}
    transition={{ duration: 0.25 }}
    className="overflow-hidden"
  >
    <div className={`flex flex-col mt-2 gap-4 pl-3  `}>
      {items.map((item) => {
        const isActive = location.pathname === item.href;

        return (
          <Link
            key={item.href}
            to={item.href}
            className={`
              px-6 py-2 rounded-md text-base font-medium
              transition-all
              ${
                isActive
                  ? "bg-sky-700 text-black shadow-lg"    // ACTIVE
      : "bg-sky-200 text-black hover:bg-sky-600"}   // DEFAULT
              }
            `}
          >
            {item.title}
          </Link>
        );
      })}
    </div>
  </motion.div>
</div>

  );
}
