import React, { useEffect, useState } from "react";
import api from "../baseurl/baseurl";
import { ClipboardCopy, RefreshCw, Plus } from "lucide-react";

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

export default function OfferDetailsFull({ offer }) {
  const [offerData, setOfferData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [pubId, setPubId] = useState(null);

  // Get pubId from localStorage
  useEffect(() => {
    const raw = localStorage.getItem("user");
    const parsed = safeParse(raw);
    const extracted = extractAffiliateData(parsed);
    setPubId(extracted?.pubId || 1); // fallback
  }, []);

  useEffect(() => {
    if (!offer?._id) return;
    let mounted = true;

    async function fetchOffer() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/compaigns/getOneCompaign/${offer._id}`);
        if (!mounted) return;
        if (res.data?.success) setOfferData(res.data.data);
        else setError(res.data?.message || "Failed to fetch offer");
      } catch (err) {
        if (!mounted) return;
        setError(err.message || "Network error");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchOffer();
    return () => (mounted = false);
  }, [offer]);

  if (!offer) return null;
  if (loading)
    return <p className="text-center py-6 text-gray-500">Loading...</p>;
  if (error) return <p className="text-center py-6 text-red-500">{error}</p>;
  if (!offerData) return null;

  const o = offerData;

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const buildTrackingUrl = (compId, pubId) =>
    `https://offer.mvmtracking.com/api/clicks?campaign_id=${compId}&pub_id=${pubId}&originalClick={}`;

  // Static labels
  const accessibility = "Accessible";
  const incentivized = "Not allowed";
  const conversionModel = "CPA";
  const conversionFlow = "TWO_CLICK";
  const productType = o.type?.toUpperCase() || "WEB";
  const countries = "Worldwide";
  const carriers = "All carriers";
  const platformsLabel = o.devices?.length
    ? o.devices.join(", ")
    : "All platforms";
  const eventType = "Default";
  const isRepeatable = "No";

  return (
    <div className="w-full grid grid-cols-1 gap-8 md:grid-cols-12 animate-fadeUp">

  {/* LEFT COLUMN — DETAILS CARD */}
  <div className="
    md:col-span-4
    bg-gradient-to-b from-sky-200 via-white to-sky-50
    border border-sky-300/40 
    rounded-2xl shadow-lg overflow-hidden
  ">
    <div className="p-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-sky-800">Details</h3>

        <span
          className={`
            text-sm px-3 py-1 rounded-full text-white font-medium
            ${o.status === "Active" ? "bg-green-600" : "bg-gray-500"}
          `}
        >
          {o.status}
        </span>
      </div>

      {/* Fields */}
      <div className="divide-y divide-sky-100">
        {[
          ["Accessibility", accessibility],
          ["Incent traffic", incentivized],
          ["Conversion model", conversionModel],
          ["Conversion flow", conversionFlow],
          ["Product type", productType],
          ["Platforms", platformsLabel],
          ["Countries", countries],
          ["Carriers", carriers],
          ["Categories", "All categories"],
          ["Tags", "No tags"],
        ].map(([label, value], idx) => (
          <div key={idx} className="py-3 flex items-center justify-between text-sm">
            <span className="font-medium text-sky-700">{label}</span>

            <span
              className={`
                inline-block px-2 py-1 rounded 
                ${label.includes("Conversion")
                  ? "bg-yellow-100 text-yellow-800 text-xs"
                  : "bg-sky-100 text-sky-700 text-xs"
                }
              `}
            >
              {value}
            </span>
          </div>
        ))}
      </div>

    </div>
  </div>

  {/* RIGHT COLUMN */}
  <div className="md:col-span-8 space-y-8">

    {/* TRACKING URL CARD */}
    <div className="
      bg-gradient-to-b from-white to-sky-50
      border border-sky-300/50 rounded-2xl shadow-lg overflow-hidden
    ">
      <div className="flex items-center justify-between p-4 border-b border-sky-200">
        <h3 className="text-lg font-semibold text-sky-800">Offer Tracking URL</h3>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleCopy(buildTrackingUrl(o.compId, pubId))}
            className="flex items-center gap-2 text-sm px-3 py-1 rounded bg-white hover:bg-sky-50 transition text-sky-700"
          >
            <ClipboardCopy className="w-4 h-4 text-sky-600" />
            {copied ? "Copied" : "Copy"}
          </button>

          <button
            onClick={() => window.alert("Open URL builder (implement)")}
            className="flex items-center gap-2 text-sm px-3 py-1 rounded bg-white hover:bg-sky-50 transition text-sky-700"
          >
            <RefreshCw className="w-4 h-4 text-sky-600" />
            URL builder
          </button>
        </div>
      </div>

      <div className="p-4 break-words text-sky-700 font-medium">
        <a href={buildTrackingUrl(o.compId, pubId)} target="_blank" rel="noreferrer">
          {buildTrackingUrl(o.compId, pubId)}
        </a>
      </div>
    </div>

    {/* EVENTS / PAYOUT TABLE */}
    <div className="
      bg-white border border-sky-300/40 rounded-2xl shadow-lg overflow-hidden
    ">
      <div className="p-4 border-b border-sky-200">
        <h3 className="text-lg font-semibold text-sky-800">Events / Payouts</h3>
      </div>

      <div className="p-4 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-sky-100">
            <tr className="text-sky-700">
              {["Countries", "Carriers", "Platforms", "Event type", "Repeatable", "Payout"]
                .map((h) => (
                  <th key={h} className="pb-3 font-semibold">{h}</th>
                ))}
            </tr>
          </thead>

          <tbody>
            <tr className="border-t hover:bg-sky-50 transition">
              <td className="py-3 text-gray-700">{countries}</td>

              <td className="py-3">
                <span className="border rounded px-2 py-1 text-xs text-sky-700 border-sky-300">
                  {carriers}
                </span>
              </td>

              <td className="py-3">
                <span className="border rounded px-2 py-1 text-xs text-sky-700 border-sky-300">
                  {platformsLabel}
                </span>
              </td>

              <td className="py-3 text-gray-700">{eventType}</td>
              <td className="py-3 text-gray-700">{isRepeatable}</td>

              <td className="py-3">
                <span className="bg-sky-100 text-sky-700 text-xs px-2 py-1 rounded font-semibold">
                  ${o.payout ?? "0.00"}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    {/* CREATIVES */}
    <div className="
      bg-gradient-to-b from-white to-sky-50
      border border-sky-300/40 rounded-2xl shadow-lg p-4
    ">
      <h3 className="text-lg font-semibold text-sky-800 mb-3">Creatives</h3>
      <div className="min-h-[60px] text-sm text-gray-500">
        No creatives uploaded.
      </div>
    </div>

    {/* KPI + POSTBACK LINKS */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

      {/* KPI CARD */}
      <div className="
        bg-white border border-sky-300/40 rounded-2xl shadow-lg p-4
      ">
        <h4 className="font-semibold text-sky-800 mb-3">KPI</h4>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold">{o.clicks ?? 0}</div>
            <div className="text-xs text-gray-500">Clicks</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{o.conversions ?? 0}</div>
            <div className="text-xs text-gray-500">Conversions</div>
          </div>
          <div>
            <div className="text-2xl font-bold">${o.saleAmount ?? 0}</div>
            <div className="text-xs text-gray-500">Sale Amount</div>
          </div>
        </div>

        <div className="mt-4 text-center">
          <div className="text-xs text-gray-500">Conversion Rate</div>
          <div className="text-lg font-semibold text-sky-700">
            {(o.conversionRate ?? 0).toFixed(2)}%
          </div>
        </div>
      </div>

      {/* POSTBACK LINKS */}
      <div className="
        bg-white border border-sky-300/40 rounded-2xl shadow-lg overflow-hidden
      ">
        <div className="flex items-center justify-between p-4 border-b border-sky-200">
          <h4 className="font-semibold text-sky-800">Postback Links</h4>
          <button
            onClick={() => window.alert("Add postback link (implement)")}

            className="
              flex items-center gap-2 text-sm px-3 py-1 rounded
              text-sky-700 bg-white hover:bg-sky-50 transition
            "
          >
            <Plus className="w-4 h-4 text-sky-600" /> Add link
          </button>
        </div>

        <div className="p-4 text-sm text-gray-600">
          {o.postbackLinks?.length > 0 ? (
            <ul className="space-y-2">
              {o.postbackLinks.map((p, i) => (
                <li key={i} className="break-words">{p}</li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-6 text-gray-400">
              <div className="text-4xl">🔗</div>
              <p>No postback links yet.</p>
              <p className="text-xs mt-1">Click “Add postback link”</p>
            </div>
          )}
        </div>
      </div>

    </div>

  </div>
</div>

  );
}
