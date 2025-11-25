"use client";
import React, { useState, useEffect } from "react";
import api from "../baseurl/baseurl.jsx";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";

function safeParse(raw) {
  try {
    if (!raw || raw === "undefined") return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function parseQueryToParams(queryString = "") {
  if (!queryString) return [];
  return queryString.split("&").map((pair) => {
    const [k, v] = pair.split("=");
    return {
      key: decodeURIComponent(k || ""),
      value: decodeURIComponent(v || ""),
    };
  });
}

export default function AffiliateGeneral() {
  const [affiliateId, setAffiliateId] = useState(null);
  const [formData, setFormData] = useState({ postBackUrl: "" });
  const [loading, setLoading] = useState(false);

  const [baseUrl, setBaseUrl] = useState("https://yourdomain.com/postback");
  const [params, setParams] = useState([
    { key: "click_id", value: "{click_id}" },
    { key: "payout", value: "{payout}" },
  ]);

  // 🔹 Get Affiliate ID from localStorage
  useEffect(() => {
    const stored = safeParse(localStorage.getItem("user"));

    console.log("stored",stored)
    if (stored?.affiliate?.id) {
      setAffiliateId(stored.affiliate.id);
    }
  }, []);

  // 🔹 Fetch affiliate data
  useEffect(() => {
    if (!affiliateId) return;
    const fetchAffiliate = async () => {
      try {
        const res = await api.get(`/affiliates/getOneAffiliate/${affiliateId}`);
        const affiliate = res.data;

        if (affiliate?.postBackUrl) {
          const parts = affiliate.postBackUrl.split("?");
          const base = parts[0];
          const parsedParams = parts[1] ? parseQueryToParams(parts[1]) : [];
          setBaseUrl(base);
          setParams(parsedParams.length ? parsedParams : params);
          setFormData({ postBackUrl: affiliate.postBackUrl });
        }
      } catch (err) {
        console.error("Error fetching affiliate:", err);
        toast.error("Failed to load affiliate data.");
      }
    };

    fetchAffiliate();
  }, [affiliateId]);

  // 🔹 Format value (encode or wrap in {})
  const formatValue = (val = "") => {
    const trimmed = val.trim();
    return trimmed.includes("{") && trimmed.includes("}")
      ? trimmed
      : encodeURIComponent(trimmed);
  };

  // 🔹 Auto-update postback URL on input change
  useEffect(() => {
    const query = params
      .map((p) => `${encodeURIComponent(p.key)}=${formatValue(p.value)}`)
      .join("&");
    const sep = baseUrl.includes("?") ? "&" : "?";
    const built = `${baseUrl.trim()}${query ? sep + query : ""}`;
    setFormData((prev) => ({ ...prev, postBackUrl: built }));
  }, [baseUrl, params]);

  // 🔹 Update postback URL
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!affiliateId) throw new Error("Affiliate ID not found.");

      const query = params
        .map((p) => `${encodeURIComponent(p.key)}=${formatValue(p.value)}`)
        .join("&");
      const sep = baseUrl.includes("?") ? "&" : "?";
      const finalUrl = `${baseUrl.trim()}${query ? sep + query : ""}`;

      await api.patch(`/affiliates/updatePostbackUrl/${affiliateId}`, {
        postBackUrl: finalUrl,
      });

      setFormData({ postBackUrl: finalUrl });
      toast.success("✅ Affiliate postback updated!");
    } catch (err) {
      console.error(err);
      toast.error("Error updating affiliate");
    } finally {
      setLoading(false);
    }
  };

  const updateParam = (key, value) =>
    setParams((prev) => prev.map((p) => (p.key === key ? { ...p, value } : p)));

  const addParam = () => setParams((prev) => [...prev, { key: "", value: "" }]);
  const removeParam = (key) =>
    setParams((prev) => prev.filter((p) => p.key !== key));

  const inputStyle =
    "w-full h-[45px] px-3 bg-gray-50 border border-gray-200 rounded-lg shadow-sm text-gray-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300 focus:outline-none transition-all duration-200";

  return (
   <motion.div
  className="
    mx-auto 
    bg-gradient-to-b from-sky-200 via-white to-sky-50
    shadow-xl rounded-2xl 
    p-6 md:p-8 mt-6 max-w-3xl 
    border border-sky-300/40 
    animate-fadeUp
  "
  initial={{ opacity: 0, y: 40 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
>
  <Toaster position="top-right" />

  {/* Title */}
  <h2 className="text-2xl md:text-3xl font-extrabold mb-6 text-sky-800 text-center tracking-tight">
    ✨ Edit Affiliate Postback
  </h2>

  <form onSubmit={handleSubmit} className="space-y-6">

    {/* Base URL */}
    <div>
      <label className="block text-sky-800 font-semibold mb-1">
        Postback Base URL
      </label>
      <input
        type="text"
        value={baseUrl}
        onChange={(e) => setBaseUrl(e.target.value)}
        className="
          w-full px-4 py-2 
          rounded-xl 
          border border-sky-300 
          bg-white
          shadow-sm 
          text-gray-700 
          focus:ring-2 focus:ring-sky-300 focus:border-sky-400
        "
        required
      />
    </div>

    {/* Parameters */}
    <div className="flex flex-col gap-4">
      {params.map((p, index) => (
        <motion.div
          key={index}
          className="
            flex flex-col sm:flex-row gap-3 
            items-center bg-white/70 
            border border-sky-200 rounded-xl 
            p-3 shadow-sm backdrop-blur-sm
          "
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35 }}
        >
          {/* Key Input */}
          <input
            type="text"
            placeholder="Key"
            value={p.key}
            onChange={(e) => {
              const newKey = e.target.value;
              setParams((prev) =>
                prev.map((param, i) =>
                  i === index ? { ...param, key: newKey } : param
                )
              );
            }}
            className="
              flex-1 px-3 py-2 
              border border-sky-300 rounded-lg 
              bg-white text-gray-700 
              font-medium 
              focus:ring-2 focus:ring-sky-300
            "
          />

          {/* Value Input */}
          <input
            type="text"
            placeholder="Value"
            value={p.value}
            onChange={(e) => updateParam(p.key, e.target.value)}
            className="
              flex-1 px-3 py-2 
              border border-sky-300 rounded-lg 
              bg-white text-gray-700 
              focus:ring-2 focus:ring-sky-300
            "
          />

          {/* Remove Button */}
          <button
            type="button"
            onClick={() => removeParam(p.key)}
            className="
              px-3 py-2 bg-red-500 text-white 
              rounded-lg shadow-sm 
              hover:bg-red-600 transition-all
            "
          >
            ✕
          </button>
        </motion.div>
      ))}
    </div>

    {/* Add Parameter */}
    <button
      type="button"
      onClick={addParam}
      className="
        mt-2 w-full bg-sky-500 text-white 
        rounded-xl py-3
        hover:bg-sky-600 transition-all 
        shadow-md font-semibold
      "
    >
      ➕ Add Parameter
    </button>

    {/* Generated URL Output */}
    <motion.p
      className="
        mt-4 text-sm text-sky-900 break-all 
        bg-sky-50 px-4 py-3 rounded-xl 
        border border-sky-200 shadow-sm
      "
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      <strong>Generated URL:</strong> {formData.postBackUrl}
    </motion.p>

    {/* Submit Button */}
    <motion.button
      type="submit"
      disabled={loading}
      className="
        w-full h-[50px] 
        bg-sky-600 text-white rounded-xl 
        hover:bg-sky-700 transition-all duration-300 
        shadow-lg font-semibold 
        flex items-center justify-center gap-2 disabled:opacity-40
      "
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
    >
      {loading ? (
        <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-5 h-5"></span>
      ) : (
        "Save Changes"
      )}
    </motion.button>

  </form>
</motion.div>

  );
}
