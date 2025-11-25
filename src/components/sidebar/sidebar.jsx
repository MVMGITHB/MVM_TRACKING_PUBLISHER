// src/components/Sidebar.jsx
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
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
import SidebarGroup from "./SidebarGroup";

// Helpers
function safeParse(raw) {
  try {
    if (!raw || raw === "undefined") return null;
    return JSON.parse(raw);
  } catch {
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

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [active, setActive] = useState(location.pathname);
  const [user, setUser] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => setActive(location.pathname), [location.pathname]);

  useEffect(() => {
    const parsed = safeParse(localStorage.getItem("user"));
    setUser(extractAffiliateData(parsed));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    toast.success("Logged out 👋", {
      style: { background: "#fff", color: "#333", fontWeight: 600 },
      iconTheme: { primary: "#f97316", secondary: "#fff" },
    });
    setTimeout(() => navigate("/login"), 1000);
  };

  const menuItems = [
    { title: "Dashboard", href: "/partner/statistics-dashboard", icon: mdiChartBoxOutline },
    { title: "My Offers", href: "/partner/offer", icon: mdiStorefrontOutline },
    { title: "Conversion", href: "/partner/conversion", icon: mdiStorefrontOutline },
    { title: "My Postback", href: "/partner/my-settings", icon: mdiCog },
  ];

  return (
    <>
      <Toaster position="top-right" />

      {/* Mobile Toggle */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-md border border-orange-200"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        <Icon path={mobileOpen ? mdiClose : mdiMenu} size={1} className="text-orange-600" />
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 bg-orange-200/30 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Premium Sidebar */}
      <motion.nav
        initial={{ x: -270, opacity: 0 }}
        animate={{
          x: mobileOpen || window.innerWidth >= 768 ? 0 : -270,
          opacity: 1,
        }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="
          fixed top-0 left-0 
          h-full w-72 
           bg-sky-200 
border-r border-sky-300/50

          shadow-[6px_0_25px_-5px_rgba(255,140,50,0.3)]
          flex flex-col justify-between 
          z-50
        "
      >
        {/* Top Section */}
        <div className="px-6">
          <img
            src='https://mvmbs.com/images/logo.webp'
            className='w-16 h-16 mb-5 opacity-95'
            alt=''
          />

          {/* Menu */}
          <div className="flex flex-col gap-2">
            {menuItems.map((item) => {
              const isActive = active === item.href;
              return (
                <Link
  key={item.href}
  to={item.href}
  onClick={() => setMobileOpen(false)}
  className={`
    group relative flex items-center gap-4 px-4 py-3 rounded-lg
    text-base font-medium transition-all duration-300

    ${isActive 
      ? "bg-sky-700 text-black shadow-lg"    // ACTIVE
      : "bg-sky-200  text-black hover:bg-sky-600"}   // DEFAULT
  `}
>


  
  {/* Active highlight bar */}
  {/* {isActive && (
    <motion.div
      layoutId="bar"
      className="absolute left-0 top-0 h-full w-1 bg-sky-700 rounded-r-full"
    />
  )} */}

  <Icon
    path={item.icon}
    size={1}
    className={`
      transition-all
      ${isActive ? "text-black" : "text-black group-hover:text-black"}
    `}
  />

  <span>{item.title}</span>
</Link>

                
              );
            })}

              {/* <SidebarGroup
   title="Statistics"
   icon={mdiChartBoxOutline}
   items={[
      { title: "Daily", href: "/daily" },
      { title: "Conversions", href: "/conversions" },
      { title: "Offers", href: "/offers" },
      { title: "Smartlinks", href: "/smartlinks" },
      { title: "Browsers", href: "/browsers" },
   ]}
/> */}
          </div>
        </div>


      


        {/* Bottom User Area */}
        <div className="py-2 px-5  border-t border-orange-300/40  bg-sky-500 
 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 flex items-center justify-center rounded-full 
                 bg-gradient-to-r from-gray-400 to-gray-600
                text-white font-bold text-lg shadow-md">
                {user?.name?.[0]?.toUpperCase() || "U"}
              </div>

              <div className="flex flex-col">
                <span className="font-semibold text-white truncate">
                  {user?.name}
                </span>
                <span className="text-sm text-white truncate">
                  {user?.email}
                </span>
                {user?.pubId && (
                  <span className="text-xs text-white">Pub ID: {user.pubId}</span>
                )}
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleLogout}
              className="p-2 rounded-full hover:bg-orange-100 transition"
            >
              <Icon
                path={mdiLogout}
                size={1}
                className="text-gray-900 hover:text-red-black"
              />
            </motion.button>
          </div>
        </div>
      </motion.nav>
    </>
  );
}
