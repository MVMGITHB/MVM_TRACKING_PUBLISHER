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
import { baseurl } from "../helper/Helper";
import OfferDetail from "../../pages/OfferDetail";
import { Link } from "react-router-dom";

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
    `${baseurl}/api/clicks?campaign_id=${compId}&pub_id=${pubId}&originalClick={}`;

  const filteredOffers = campaigns.filter((offer) => {
    if (activeTab === "featured") return offer.featured;
    if (activeTab === "my") return offer.compId === 370; // example
    return true;
  });

  const savedAffiliate = JSON.parse(localStorage.getItem("affiliate"));
  console.log(savedAffiliate.id)

  useEffect(() => {
    async function fetchCampaigns() {


      try {

        
        const response = await api.get(`/compaigns/getALLCompaigns?affiliateId=${savedAffiliate?.id}`);
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
    <div
  className="
    bg-gradient-to-b from-sky-200 via-white to-sky-50
    rounded-xl shadow-xl p-5 md:p-7
    border border-sky-300/40
    animate-fadeUp
  "
>
  {/* Tabs */}
  <div
    className="
      flex flex-wrap gap-2 md:gap-3 border-b border-sky-200 
      pb-3 mb-6 overflow-x-auto
    "
  >
    {tabs.map(({ key, label, icon: Icon }) => (
      <button
        key={key}
        onClick={() => setActiveTab(key)}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium 
          transition-all duration-300 whitespace-nowrap
          ${
            activeTab === key
              ? "bg-sky-500 text-white shadow-md scale-105"
              : "bg-white text-sky-700 hover:bg-sky-100 border border-sky-200"
          }
        `}
      >
        <Icon size={16} className={activeTab === key ? "text-white" : "text-sky-600"} />
        {label}
      </button>
    ))}
  </div>

  {/* Table Wrapper */}
  <div className="overflow-x-auto bg-white rounded-xl shadow-md border border-sky-200/50 animate-fadeIn">

    {loading ? (
      <div className="py-12 flex justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-sky-600" />
      </div>
    ) : (
      <table className="min-w-full text-sm md:text-base border-collapse">

        {/* Table Head */}
        <thead className="bg-sky-100 sticky top-0 z-10 shadow-sm">
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
                className="px-3 md:px-4 py-3 text-left font-semibold text-sky-700 tracking-wide"
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="divide-y divide-gray-100">
          {filteredOffers.map((offer) => (
            <tr
              key={offer._id}
              className="
                hover:bg-sky-50 transition-all duration-200
              "
            >
              {/* Offer Image + Name */}
              <td
                className="px-3 md:px-4 py-3 flex items-center gap-3 cursor-pointer"
                onClick={() => setSelectedOffer(offer)}
              >
                <div className="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center shadow-sm">
                  <Globe size={18} className="text-sky-600" />
                </div>
                <span className="font-medium text-gray-800 hover:text-sky-600 truncate max-w-[200px]">

                  <Link to={`/partner/offer/${offer._id}`}>
                   {offer.offerName}
                  </Link>
                 
                </span>
              </td>

              {/* Offer ID */}
              <td className="px-3 md:px-4 py-3 text-gray-700">
                {offer.compId}
              </td>

              {/* Model */}
              <td className="px-3 md:px-4 py-3">
                <span className="px-2 py-1 text-xs rounded-full bg-sky-100 text-sky-600 font-semibold">
                  {offer.type || "N/A"}
                </span>
              </td>

              {/* Payout */}
              <td className="px-3 md:px-4 py-3 text-green-600 font-semibold">
                {offer.payout || "N/A"}
              </td>

              {/* Devices */}
              <td className="px-3 md:px-4 py-3 flex gap-2">
                {offer.devices?.includes("desktop") && (
                  <Monitor size={16} className="text-gray-600" />
                )}
                {offer.devices?.includes("mobile") && (
                  <Smartphone size={16} className="text-gray-600" />
                )}
              </td>

              {/* Status */}
              <td className="px-3 md:px-4 py-3">
                <span
                  className={`
                    px-2 py-1 text-xs rounded-full font-semibold
                    ${
                      offer.status === "active"
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-200 text-gray-600"
                    }
                  `}
                >
                  {offer.status || "Unknown"}
                </span>
              </td>

              {/* Actions */}
              <td className="px-3 md:px-4 py-3">
                <button
                  onClick={() => copyToClipboard(buildTrackingUrl(offer.compId, pubId))}
                  className="flex items-center gap-1 text-sky-600 hover:text-sky-800 hover:underline"
                >
                  <Copy size={14} /> Copy URL
                </button>
              </td>
            </tr>
          ))}

          {/* Empty State */}
          {filteredOffers.length === 0 && (
            <tr>
              <td
                colSpan="7"
                className="text-center py-6 text-gray-500 animate-fadeIn"
              >
                No campaigns found for this tab.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    )}
  </div>

  {/* Offer Details Section */}
  {/* {selectedOffer && (
    <div className="mt-6 border-t pt-6 animate-fadeUp">
      <OfferDetails offer={selectedOffer} />

      <OfferDetail offer={selectedOffer} />
    </div>
  )} */}
</div>

  );
}
