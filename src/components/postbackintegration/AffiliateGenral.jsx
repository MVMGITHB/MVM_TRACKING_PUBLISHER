"use client";
import React, { useState, useEffect } from "react";
import api from "../baseurl/baseurl.jsx";
import { useParams } from "react-router-dom";
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

function extractAffiliateId(stored) {
  if (!stored) return null;
  return (
    stored.id ||
    stored.affiliate?.id ||
    stored.user?.id ||
    stored?.affiliateId ||
    null
  );
}

export default function AffiliateGeneral() {
  const { id: paramId } = useParams();
  const [affiliateId, setAffiliateId] = useState(paramId || null);
  const [formData, setFormData] = useState({ postBackUrl: "" });
  const [loading, setLoading] = useState(false);

  const [baseUrl, setBaseUrl] = useState("https://yourdomain.com/postback");
  const [params, setParams] = useState([
    { key: "click_id", value: "{click_id}" },
    { key: "payout", value: "{payout}" },
  ]);

  useEffect(() => {
    if (paramId) {
      setAffiliateId(paramId);
      return;
    }
    if (typeof window === "undefined") return;

    const raw = localStorage.getItem("user");
    const parsed = safeParse(raw);
    if (!parsed) return;

    const idFromStored = extractAffiliateId(parsed);
    if (idFromStored) setAffiliateId(idFromStored);

    const storedPostback =
      parsed.postBackUrl ||
      parsed.affiliate?.postBackUrl ||
      parsed.user?.postBackUrl;
    if (storedPostback) {
      const parts = storedPostback.split("?");
      const storedBase = parts[0] || "";
      const storedParams = parts[1] ? parseQueryToParams(parts[1]) : [];
      setBaseUrl(storedBase || baseUrl);

      const filtered = storedParams.filter((p) =>
        ["click_id", "payout"].includes(p.key)
      );
      setParams(filtered.length ? filtered : params);
      setFormData((prev) => ({ ...prev, postBackUrl: storedPostback }));
    }
  }, [paramId]);

  const formatValue = (val = "") => {
    const trimmed = val.trim();
    return trimmed.includes("{") && trimmed.includes("}")
      ? trimmed
      : encodeURIComponent(trimmed);
  };

  useEffect(() => {
    const query = params
      .map((p) => `${encodeURIComponent(p.key)}=${formatValue(p.value)}`)
      .join("&");
    const sep = baseUrl.includes("?") ? "&" : "?";
    const built = `${baseUrl.trim()}${query ? sep + query : ""}`;
    setFormData((prev) => ({ ...prev, postBackUrl: built }));
  }, [baseUrl, params]);

  const buildPostbackUrlWithKeysInOrder = (keys) => {
    const sep = baseUrl.includes("?") ? "&" : "?";
    const map = params.reduce((acc, p) => {
      if (p.key) acc[p.key] = p.value ?? "";
      return acc;
    }, {});
    const parts = keys.map((k) => {
      const rawVal = map[k] ?? "";
      return `${encodeURIComponent(k)}=${rawVal.trim() || `{${k}}`}`;
    });
    return `${baseUrl.trim()}${sep}${parts.join("&")}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!affiliateId) throw new Error("Affiliate id not available.");
      const finalUrl = buildPostbackUrlWithKeysInOrder(
        params.map((p) => p.key) // keep order of all params
      );
      setFormData((prev) => ({ ...prev, postBackUrl: finalUrl }));
      await api.patch(`/affiliates/updatePostbackUrl/${affiliateId}`, {
        postBackUrl: finalUrl,
      });
      toast.success("Affiliate updated successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Error updating affiliate");
    } finally {
      setLoading(false);
    }
  };

  const updateParam = (key, value) =>
    setParams((prev) => prev.map((p) => (p.key === key ? { ...p, value } : p)));

  const addParam = () => setParams((prev) => [...prev, { key: "", value: "" }]);

  const updateParamKey = (oldKey, newKey) =>
    setParams((prev) =>
      prev.map((p) => (p.key === oldKey ? { ...p, key: newKey } : p))
    );

  const removeParam = (key) =>
    setParams((prev) => prev.filter((p) => p.key !== key));

  const inputStyle =
    "w-full h-[45px] px-3 bg-gray-50 border border-gray-200 rounded-lg shadow-sm text-gray-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300 focus:outline-none transition-all duration-200";

  return (
    <motion.div
      className="mx-auto bg-white shadow-xl rounded-2xl p-6 md:p-8 mt-6 max-w-3xl gap-4"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Toaster position="top-right" reverseOrder={false} />
      <h2 className="text-2xl md:text-3xl font-extrabold mb-6 text-indigo-700 text-center">
        ✨ Edit Affiliate Postback
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block text-gray-700 font-semibold mb-1">
          Postback Base URL
        </label>
        <input
          type="text"
          value={baseUrl}
          onChange={(e) => setBaseUrl(e.target.value)}
          className={inputStyle}
          required
        />

        <div className="flex flex-col gap-3 mt-2">
          {params.map((p, index) => (
            <motion.div
              key={index}
              className="flex flex-col sm:flex-row gap-2 items-center"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
            >
              <input
                type="text"
                placeholder="Key"
                value={p.key}
                onChange={(e) => updateParamKey(p.key, e.target.value)}
                className="flex-1 px-3 py-2 border rounded-lg bg-white text-gray-700 font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300"
              />
              <input
                type="text"
                placeholder="Value"
                value={p.value}
                onChange={(e) => updateParam(p.key, e.target.value)}
                className="flex-1 px-3 py-2 border rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300"
              />
              <button
                type="button"
                onClick={() => removeParam(p.key)}
                className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                ✕
              </button>
            </motion.div>
          ))}
        </div>

        <button
          type="button"
          onClick={addParam}
          className="mt-2 w-full bg-green-500 text-white rounded-lg py-2 hover:bg-green-600 transition"
        >
          ➕ Add Parameter
        </button>

        <motion.p
          className="mt-3 text-sm text-gray-700 break-all bg-gray-50 px-4 py-2 rounded-lg border"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <strong>Generated URL:</strong> {formData.postBackUrl}
        </motion.p>

        <motion.button
          type="submit"
          disabled={loading}
          className="w-full h-[50px] bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all duration-300 shadow-md font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
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
