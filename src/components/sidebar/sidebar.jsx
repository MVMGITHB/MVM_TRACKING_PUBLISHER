// src/components/Sidebar.jsx
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  mdiSpeedometer,
  mdiStorefrontOutline,
  mdiChartBoxOutline,
  mdiCog,
  mdiLogout,
  mdiMenu,
  mdiClose,
} from "@mdi/js";
import Icon from "@mdi/react";
import toast, { Toaster } from "react-hot-toast";
import { motion } from "framer-motion";

// --- Helpers ---
function safeParse(raw) {
  try {
    if (!raw || raw === "undefined") return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error("safeParse: failed to parse", e);
    return null;
  }
}

function extractAffiliateData(stored) {
  if (!stored) return null;
  return {
    id: stored.id || stored.affiliate?.id || stored.user?.id || null,
    name: stored.name || stored.affiliate?.name || stored.user?.name || "User",
    email:
      stored.email || stored.affiliate?.email || stored.user?.email || null,
    pubId:
      stored.pubId || stored.affiliate?.pubId || stored.user?.pubId || null,
    postBackUrl:
      stored.postBackUrl ||
      stored.affiliate?.postBackUrl ||
      stored.user?.postBackUrl ||
      null,
  };
}
// ----------------

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [active, setActive] = useState(location.pathname);
  const [user, setUser] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setActive(location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    const raw = localStorage.getItem("user");
    const parsed = safeParse(raw);
    const extracted = extractAffiliateData(parsed);
    setUser(extracted);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");

    toast.success("Logged out successfully 👋", {
      style: { background: "#fff", color: "#111", fontWeight: 600 },
      iconTheme: { primary: "#f97316", secondary: "#fff" },
    });

    setTimeout(() => {
      navigate("/login");
    }, 1500);
  };

  const menuItems = [
    {
      title: "Dashboard",
      href: "/partner/statistics-dashboard",
      icon: mdiChartBoxOutline,
    },
    // { title: "Dashboard", href: "/partner/dashboard", icon: mdiSpeedometer },
    {
      title: "My Offers",
      href: "/partner/marketplace",
      icon: mdiStorefrontOutline,
    },

    { title: "My Postback", href: "/partner/my-settings", icon: mdiCog },
  ];

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />

      

      {/* Mobile toggle button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-md"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        <Icon path={mobileOpen ? mdiClose : mdiMenu} size={1} />
      </button>

      {/* Sidebar overlay for mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        ></div>
      )}

      <motion.nav
        initial={{ x: -300, opacity: 0 }}
        animate={{
          x: mobileOpen || window.innerWidth >= 768 ? 0 : -300,
          opacity: 1,
        }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="fixed top-0 left-0 h-full w-72 md:w-75 bg-gradient-to-b from-white via-orange-50/40 to-white border-r shadow-xl flex flex-col justify-between z-50 rounded-tr-3xl md:top-12 md:h-[calc(100%-4rem)]"
      >

        
        {/* Menu */}
        <div className="flex flex-col py-6 px-2">
          <img src="https://mvmbs.com/images/logo.webp" alt="" className="w-[50px] h-[50px]" />
          {menuItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setMobileOpen(false)} // close menu on mobile
              className={`flex items-center gap-4 px-4 py-3 rounded-xl my-1 transition-all duration-300 ${
                active === item.href
                  ? "bg-orange-500 text-white shadow-md"
                  : "text-gray-700 hover:text-orange-500 hover:bg-orange-100/70"
              }`}
            >
              <motion.div
                whileHover={{ scale: 1.04, x: 5 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-4 w-full"
              >
                <Icon
                  path={item.icon}
                  size={1}
                  className={`transition-colors duration-200 ${
                    active === item.href ? "text-white" : "text-gray-500"
                  }`}
                />
                <span
                  className={`truncate font-medium ${
                    active === item.href ? "text-white" : ""
                  }`}
                >
                  {item.title}
                </span>
              </motion.div>
            </Link>
          ))}
        </div>

        {/* User Section */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-between px-5 py-4 border-t bg-white/60 backdrop-blur-md"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-red-400 text-white font-bold text-lg shadow-md">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-gray-800 truncate">
                {user?.name}
              </span>
              <span className="text-sm text-gray-500 truncate">
                {user?.email || "Affiliate"}
              </span>
              {user?.pubId && (
                <span className="text-xs text-orange-400 font-medium">
                  Pub ID: {user.pubId}
                </span>
              )}
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.15, rotate: 10 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleLogout}
            className="p-2 rounded-full hover:bg-orange-100 transition-all"
          >
            <Icon
              path={mdiLogout}
              size={1}
              className="text-gray-500 hover:text-red-500"
            />
          </motion.button>
        </motion.div>
      </motion.nav>
    </>
  );
}
