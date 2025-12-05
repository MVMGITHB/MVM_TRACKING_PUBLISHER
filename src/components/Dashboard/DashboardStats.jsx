import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import { baseurl } from "../helper/Helper";

const DashboardStats = () => {
  const [dailyStats, setDailyStats] = useState({
    clicks: 0,
    hosts: 0,
    conversions: 0,
    secondConversions: 0,
    revenue: 0,
    secondRevenue: 0,
    totalConversions: 0, // conversions + secondConversions
  });

  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);

        const stored = JSON.parse(localStorage.getItem("user"));
        const pubId = stored?.affiliate?.pubId;

        if (!pubId) {
          setLoading(false);
          return;
        }

        const [dailyRes, last10Res] = await Promise.all([
          axios.get(`${baseurl}/api/reports/dailypubId/${pubId}`),
          axios.get(`${baseurl}/api/reports/last10dayspubId/${pubId}`),
        ]);

        // ---- DAILY STATS (card numbers) ----
        const d = dailyRes.data || {};
        const clicks = Number(d.clicks) || 0;
        const hosts = Number(d.hosts) || 0;
        const conversions = Number(d.conversions) || 0;
        const secondConversions = Number(d.secondConversions) || 0;
        const revenue = Number(d.revenue) || 0;
        const secondRevenue = Number(d.secondRevenue) || 0;

        const totalConversions = conversions + secondConversions; // <-- sum here

        setDailyStats({
          clicks,
          hosts,
          conversions,
          secondConversions,
          revenue,
          secondRevenue,
          totalConversions,
        });

        // ---- LAST 10 DAYS (chart) ----
        const cleanData =
          (last10Res.data?.data || []).map((item) => ({
            ...item,
            clicks: Number(item.clicks) || 0,
            conversions: Number(item.conversions) || 0,
            revenue: Number(item.revenue) || 0,
            secondConversions: Number(item.secondConversions) || 0,
            secondRevenue: Number(item.secondRevenue) || 0,
          })) || [];

        setChartData(cleanData);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-gray-600">
        Loading statistics...
      </div>
    );
  }

  return (
    <div className="pb-6 space-y-8">
      {/* HEADER */}
      <motion.h2
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-gray-800 text-xl font-bold"
      >
        Daily Statistics
      </motion.h2>

      {/* DAILY STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          {
            title: "Clicks",
            value: dailyStats.clicks,
            color: "text-orange-600",
          },
          {
            title: "Hosts",
            value: dailyStats.hosts,
            color: "text-amber-600",
          },
          {
            // HERE: show totalConversions = conversions + secondConversions
            title: "Conversions",
            value: dailyStats.totalConversions,
            color: "text-green-600",
          },
        ].map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            whileHover={{ scale: 1.03 }}
            className="
              bg-gradient-to-b from-orange-50 to-sky-400
              p-6 rounded-xl shadow-sm
              hover:shadow-lg transition-all duration-300
            "
          >
            <p className="text-gray-600 font-medium">{item.title}</p>
            <h3 className="text-4xl font-bold text-gray-800 mt-2">
              {item.value}
            </h3>
            <p
              className={`text-sm mt-2 font-semibold ${
                item.value > 0 ? item.color : "text-gray-400"
              }`}
            >
              {item.value > 0 ? "↑" : "—"}
            </p>
          </motion.div>
        ))}
      </div>

      {/* CHART SECTION */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="
          bg-gradient-to-b from-orange-50 via-white to-sky-200
          shadow-lg rounded-xl p-8
        "
      >
        <h3 className="text-gray-800 font-semibold mb-4 uppercase tracking-wide">
          Statistics for the Last 10 Days
        </h3>

        {chartData.length === 0 ? (
          <p className="text-gray-500 text-center py-10">
            No data available for the last 10 days.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={330}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="4 4" stroke="#f3d6b2" />

              <XAxis dataKey="date" stroke="#c47f3e" tick={{ fontSize: 12 }} />
              <YAxis stroke="#c47f3e" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff7ed",
                  borderRadius: "10px",
                }}
              />
              <Legend />

              {/* Clicks Line */}
              <Line
                type="monotone"
                dataKey="clicks"
                stroke="#f97316"
                strokeWidth={3}
                dot={{ r: 3 }}
                name="Clicks"
              />

              {/* Unique Conversions Line */}
              <Line
                type="monotone"
                dataKey="conversions"
                stroke="#22c55e"
                strokeWidth={3}
                dot={{ r: 3 }}
                name="Unique Conversions"
              />

              {/* Revenue Line */}
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#eab308"
                strokeWidth={3}
                dot={{ r: 3 }}
                name="Revenue (USD)"
              />

              {/* Non-unique / Second Conversions Line */}
              <Line
                type="monotone"
                dataKey="secondConversions"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ r: 3 }}
                name="Non-unique Conversions"
              />

              {/* Second Revenue Line */}
              <Line
                type="monotone"
                dataKey="secondRevenue"
                stroke="#6366f1"
                strokeWidth={3}
                dot={{ r: 3 }}
                name="Second Revenue (USD)"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </motion.div>
    </div>
  );
};

export default DashboardStats;
