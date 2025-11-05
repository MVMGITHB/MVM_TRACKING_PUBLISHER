import React, { useState, useEffect, useRef } from "react";
import api from "../baseurl/baseurl.jsx";
import toast from "react-hot-toast";

// Helper to safely parse localStorage user
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
    pubId:
      stored.pubId || stored.affiliate?.pubId || stored.user?.pubId || null,
  };
}

const useQuery = () => new URLSearchParams(window.location.search);

export default function CampaignReport() {
  const today = new Date();

  const formatDateForInput = (date) => {
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();
    return `${yyyy}-${mm}-${dd}`;
  };

  const formattedToday = formatDateForInput(today);

  const [startDate, setStartDate] = useState(formattedToday);
  const [endDate, setEndDate] = useState(formattedToday);
  const [report, setReport] = useState([]);
  const [rangeType, setRangeType] = useState("today"); // NEW

  const query = useQuery();

  const [pubId, setPubId] = useState(() => {
    const raw = localStorage.getItem("user");
    const parsed = safeParse(raw);
    const extracted = extractAffiliateData(parsed);
    return extracted?.pubId || query.get("pubId");
  });

  const activeToast = useRef(null);

  const showToast = (promise, messages) => {
    if (activeToast.current) {
      toast.dismiss(activeToast.current);
      activeToast.current = null;
    }
    activeToast.current = toast.promise(promise, messages, {
      id: "single-toast",
    });
  };

  const fetchReport = async () => {
    showToast(
      api.get("/reports/publicerReport", {
        params: { pubId, startDate, endDate },
      }),
      {
        loading: "Fetching report...",
        success: (res) => {
          if (res.data.success) {
            setReport(res.data.report);
            return "Report fetched successfully!";
          } else {
            throw new Error(res.data.message || "Failed to fetch report");
          }
        },
        error: "Server error fetching report",
      }
    );
  };

  // ✅ Handle Range Type Change
  const handleRangeChange = (value) => {
    setRangeType(value);
    const today = new Date();
    let start, end;

    switch (value) {
      case "today":
        start = end = today;
        break;
      case "yesterday":
        start = end = new Date(today.setDate(today.getDate() - 1));
        break;
      case "week":
        end = new Date();
        start = new Date();
        start.setDate(end.getDate() - 6);
        break;
      case "lastweek":
        end = new Date();
        end.setDate(end.getDate() - 7);
        start = new Date();
        start.setDate(end.getDate() - 6);
        break;
      case "month":
        end = new Date();
        start = new Date(end.getFullYear(), end.getMonth(), 1);
        break;
      case "lastmonth":
        end = new Date(end.getFullYear(), end.getMonth(), 0); // last day of prev month
        start = new Date(end.getFullYear(), end.getMonth(), 1);
        break;
      case "custom":
        return; // do nothing, wait for manual date selection
      default:
        return;
    }

    const formatDate = (d) => d.toISOString().split("T")[0];
    setStartDate(formatDate(start));
    setEndDate(formatDate(end));
  };

  useEffect(() => {
    fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pubId, startDate, endDate]);

  const exportCSV = async () => {
    if (report.length === 0) {
      toast.error("No report data to export!");
      return;
    }

    const exportPromise = new Promise((resolve) => {
      const headers = Object.keys(report[0]);
      const csvRows = [
        headers.join(","),
        ...report.map((row) =>
          headers.map((field) => `"${row[field] ?? ""}"`).join(",")
        ),
      ];
      const csvData = csvRows.join("\n");
      const blob = new Blob([csvData], { type: "text/csv" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `campaign_report_${startDate}_to_${endDate}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      setTimeout(resolve, 500);
    });

    showToast(exportPromise, {
      loading: "Exporting CSV...",
      success: "CSV exported successfully!",
      error: "Failed to export CSV",
    });
  };

  // Default load → Today
  useEffect(() => {
    handleRangeChange("today");
  }, []);

  return (
    <div className="bg-white rounded-xl p-6 mb-6 border shadow-2xl">
      {/* Date Picker & Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
        <div className="flex gap-2 flex-wrap items-center">

          {/* ✅ Dropdown */}
          <select
            value={rangeType}
            onChange={(e) => handleRangeChange(e.target.value)}
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
          >
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="week">This Week</option>
            <option value="lastweek">Last Week</option>
            <option value="month">This Month</option>
            <option value="lastmonth">Last Month</option>
            <option value="custom">Custom Range</option>
          </select>

          {/* ✅ Show only if Custom */}
          {rangeType === "custom" && (
            <div className="flex gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
            </div>
          )}

          <button
            onClick={fetchReport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <i className="fa fa-download"></i> Fetch Report
          </button>

          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            <i className="fa fa-file-csv"></i> Export CSV
          </button>
        </div>
      </div>

      {/* Report Table */}
      {report.length > 0 ? (
        <div className="overflow-x-auto p-6" id="hide-scrollbar">
          <table className="min-w-full divide-y divide-gray-200 border">
            <thead className="bg-gray-50">
              <tr>
                {Object.keys(report[0]).map((key) => (
                  <th
                    key={key}
                    className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {report.map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-gray-50" : ""}>
                  {Object.values(row).map((val, j) => (
                    <td
                      key={j}
                      className="px-4 py-2 text-sm text-gray-700 whitespace-nowrap"
                    >
                      {val}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500 mt-4">No report data available.</p>
      )}
    </div>
  );
}
