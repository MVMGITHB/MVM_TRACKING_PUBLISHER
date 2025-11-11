import React, { useEffect, useState } from "react";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import api from "../baseurl/baseurl";
import BalanceCard from "./BalanceCard";

// Stat config
const statsConfig = [
  { key: "saleAmount", title: "Total Revenue", prefix: "$" },
  { key: "conversions", title: "Paid Conversions" },
  { key: "clicks", title: "Total Clicks" },
  { key: "impressions", title: "Impressions" },
];

const DashboardCards = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCampaigns() {
      try {
        const response = await api.get("/compaigns/getALLCompaign");
        if (response.data?.success) {
          setCampaigns(response.data.data);
        }
      } catch (err) {
        console.error("Error fetching campaigns:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCampaigns();
  }, []);

  if (loading) {
    return <p className="text-center py-6 text-gray-500">Loading metrics...</p>;
  }

  // Aggregate values
  const totalRevenue = campaigns.reduce(
    (sum, c) => sum + (c.saleAmount || 0),
    0
  );
  const totalConversions = campaigns.reduce(
    (sum, c) => sum + (c.conversions || 0),
    0
  );
  const totalClicks = campaigns.reduce((sum, c) => sum + (c.clicks || 0), 0);
  const totalImpressions = campaigns.reduce(
    (sum, c) => sum + (c.impressions || 0),
    0
  );

  const stats = {
    saleAmount: totalRevenue,
    conversions: totalConversions,
    clicks: totalClicks,
    impressions: totalImpressions,
  };

  return (

    <> 
    <BalanceCard/>
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 p-4">
      {statsConfig.map(({ key, title, prefix }) => {
        const value = stats[key] || 0;
        const change = value > 0 ? "up" : value < 0 ? "down" : "none";

        return (
          <div
            key={key}
            className="bg-white rounded-3xl shadow-lg p-6 flex flex-col justify-between border border-gray-100 hover:shadow-2xl transition duration-300"
          >
            {/* Header */}
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                {title}
              </h2>
              {change === "up" ? (
                <ArrowUpRight className="text-green-500 w-5 h-5" />
              ) : change === "down" ? (
                <ArrowDownRight className="text-red-500 w-5 h-5" />
              ) : (
                <Minus className="text-gray-400 w-5 h-5" />
              )}
            </div>

            {/* Value */}
            <p className="text-3xl md:text-4xl font-bold text-gray-900 mt-4">
              {prefix}
              {value.toLocaleString()}
            </p>

            {/* Today + MTD */}
            <div className="mt-5 flex flex-col gap-2 text-xs text-gray-500">
              <div className="flex justify-between">
                <span>Today</span>
                <span className="font-medium text-gray-700">
                  {prefix}
                  {value.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>MTD</span>
                <span className="font-medium text-gray-700">
                  {prefix}
                  {value.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
    </>
    
  );
};

export default DashboardCards;
