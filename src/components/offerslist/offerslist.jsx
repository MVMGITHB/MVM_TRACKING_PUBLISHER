import React, { useEffect, useState } from "react";
import {
  Copy,
  Globe,
  Smartphone,
  Monitor,
  Loader2,
  Star,
  ListChecks,
  Globe2,
} from "lucide-react";
import toast from "react-hot-toast";
import OfferDetails from "../offerDetails/offerdetails";
import api from "../baseurl/baseurl";

// --- Helpers (same as OfferDetailsFull) ---
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
  return stored.pubId || stored.affiliate?.pubId || stored.user?.pubId || null;
}
// -----------------------------------------

export default function OffersTable() {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pubId, setPubId] = useState(1); // default fallback

  // ✅ Get pubId from localStorage
  useEffect(() => {
    const raw = localStorage.getItem("user");
    const parsed = safeParse(raw);
    setPubId(extractAffiliateData(parsed) || 1); // fallback to 1
  }, []);

  const buildTrackingUrl = (compId, pubId) =>
    `https://offer.mvmtracking.com/api/clicks?campaign_id=${compId}&pub_id=${pubId}&originalClick={}`;

  const filteredOffers = campaigns.filter((offer) => {
    if (activeTab === "featured") return offer.featured;
    if (activeTab === "my") return offer.compId === 370; // example
    return true;
  });
  useEffect(() => {
    async function fetchCampaigns() {
      try {
        const response = await api.get("/compaigns/getALLCompaign");
        if (response.data?.success) {
          setCampaigns(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching campaigns:", error);
        toast.error("Failed to load campaigns");
      } finally {
        setLoading(false);
      }
    }
    fetchCampaigns();
  }, []);

  const copyToClipboard = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Tracking URL copied!");
    } catch {
      toast.error("Failed to copy!");
    }
  };

  const tabs = [
    { key: "all", label: "All Offers", icon: Globe2 },
    { key: "featured", label: "Featured", icon: Star },
    { key: "my", label: "My Offers", icon: ListChecks },
  ];

  return (
    <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 md:gap-3 border-b border-gray-200 mb-6 overflow-x-auto">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-1 md:gap-2 px-3 py-2 text-xs md:text-sm font-medium rounded-t-lg transition-all duration-300 whitespace-nowrap ${
              activeTab === key
                ? "border-b-2 border-blue-500 text-blue-600 bg-blue-50"
                : "text-gray-500 hover:text-blue-500 hover:bg-gray-50"
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="py-12 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          </div>
        ) : (
          <table className="min-w-full border-collapse text-sm md:text-base">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                {[
                  "Offer",
                  "Offer ID",
                  "Model",
                  "Payout",
                  "Platforms",
                  "Status",
                  "Actions",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="px-2 md:px-4 py-2 text-left font-semibold text-gray-600"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredOffers.map((offer) => (
                <tr
                  key={offer._id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  {/* Offer */}
                  <td
                    className="px-2 md:px-4 py-2 flex items-center gap-2 md:gap-3 cursor-pointer"
                    onClick={() => setSelectedOffer(offer)}
                  >
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded bg-gray-100 flex items-center justify-center text-gray-500 shadow-sm">
                      <Globe size={16} />
                    </div>
                    <span className="font-medium text-gray-800 hover:text-blue-600 truncate max-w-[120px] md:max-w-[200px]">
                      {offer.offerName}
                    </span>
                  </td>

                  {/* Offer ID */}
                  <td className="px-2 md:px-4 py-2 text-gray-700">
                    {offer.compId}
                  </td>

                  {/* Model */}
                  <td className="px-2 md:px-4 py-2">
                    <span className="px-2 py-1 text-xs md:text-sm rounded-full bg-blue-100 text-blue-600 font-medium">
                      {offer.type || "N/A"}
                    </span>
                  </td>

                  {/* Payout */}
                  <td className="px-2 md:px-4 py-2 text-green-600 font-semibold">
                    {offer.payout || "N/A"}
                  </td>

                  {/* Platforms */}
                  <td className="px-2 md:px-4 py-2 flex gap-1 md:gap-2">
                    {offer.devices?.includes("desktop") && (
                      <Monitor
                        size={16}
                        className="text-gray-600"
                        title="Desktop"
                      />
                    )}
                    {offer.devices?.includes("mobile") && (
                      <Smartphone
                        size={16}
                        className="text-gray-600"
                        title="Mobile"
                      />
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-2 md:px-4 py-2">
                    <span
                      className={`px-2 py-1 text-xs md:text-sm rounded-full font-medium ${
                        offer.status === "active"
                          ? "bg-green-100 text-green-600"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {offer.status || "Unknown"}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-2 md:px-4 py-2">
                    <button
                      onClick={() =>
                        copyToClipboard(buildTrackingUrl(offer.compId, pubId))
                      }
                      className="flex items-center gap-1 text-blue-600 hover:underline text-xs md:text-sm"
                    >
                      <Copy size={14} /> Copy URL
                    </button>
                  </td>
                </tr>
              ))}

              {filteredOffers.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-6 text-gray-500">
                    No campaigns found for this tab.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Offer Details Section */}
      {selectedOffer && (
        <div className="mt-6 border-t pt-6">
          <OfferDetails offer={selectedOffer} />
        </div>
      )}
    </div>
  );
}
