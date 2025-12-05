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

  const handleRangeChange = (value) => {
  setRangeType(value);

  const today = new Date();
  let start, end;

  switch (value) {
    case "today":
      start = new Date(today);
      end = new Date(today);
      break;

    case "yesterday":
      start = new Date(today);
      start.setDate(start.getDate() - 1);
      end = new Date(start);
      break;

    case "week": // last 7 days including today
      end = new Date(today);
      start = new Date(today);
      start.setDate(start.getDate() - 6);
      break;

    case "lastweek":
      // last full 7 days before today
      end = new Date(today);
      end.setDate(end.getDate() - 7);

      start = new Date(end);
      start.setDate(start.getDate() - 6);
      break;

    case "month": // current month
      end = new Date(today);
      start = new Date(today.getFullYear(), today.getMonth(), 1);
      break;

    case "lastmonth":
      // last month's end
      end = new Date(today.getFullYear(), today.getMonth(), 0);

      // last month's start
      start = new Date(end.getFullYear(), end.getMonth(), 1);
      break;

    case "custom":
      return; // user picks dates manually

    default:
      return;
  }

  const format = (d) => d.toISOString().split("T")[0];

  setStartDate(format(start));
  setEndDate(format(end));
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
  <div
    className="
      bg-gradient-to-b from-sky-200 via-orange-50 to-white
      border border-sky-300/50
      shadow-xl rounded-2xl p-6 mb-10
      transition-all duration-500
      animate-fadeIn space-y-8
    "
  >
    {/* Title */}
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-gray-800 tracking-wide">
        📊 Campaign Report
      </h1>
      <p className="text-gray-600 text-sm mt-1">
        View and export your performance analytics.
      </p>
    </div>

    {/* Filters */}
    <div
      className="
        flex flex-col md:flex-row md:items-center md:justify-between 
        gap-4 mb-6
      "
    >
      <div className="flex flex-wrap items-center gap-3">

        {/* Range Dropdown */}
        <div className="bg-white rounded-lg shadow border border-sky-200">
          <select
            value={rangeType}
            onChange={(e) => handleRangeChange(e.target.value)}
            className="
              px-4 py-2 rounded-lg text-gray-700
              focus:ring-2 focus:ring-sky-400 focus:outline-none
              transition
            "
          >
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="week">This Week</option>
            <option value="lastweek">Last Week</option>
            <option value="month">This Month</option>
            <option value="lastmonth">Last Month</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>

        {/* Custom Date Range */}
        {rangeType === "custom" && (
          <div className="flex gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="
                px-3 py-2 rounded-lg border border-sky-200 bg-white
                shadow focus:ring-2 focus:ring-sky-400 outline-none
              "
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="
                px-3 py-2 rounded-lg border border-sky-200 bg-white
                shadow focus:ring-2 focus:ring-sky-400 outline-none
              "
            />
          </div>
        )}

        {/* Fetch Button */}
        <button
          onClick={fetchReport}
          className="
            flex items-center gap-2 px-4 py-2
            bg-sky-600 hover:bg-sky-700 text-white
            rounded-lg shadow transition
          "
        >
          <i className="fa fa-search"></i> Fetch Report
        </button>

        {/* CSV Button */}
        <button
          onClick={exportCSV}
          className="
            flex items-center gap-2 px-4 py-2
            bg-green-600 hover:bg-green-700 text-white
            rounded-lg shadow transition
          "
        >
          <i className="fa fa-file-csv"></i> Export CSV
        </button>
      </div>
    </div>

    {/* Report Table */}
    {report.length > 0 ? (
      <div
        className="
          overflow-x-auto rounded-xl border border-sky-200 shadow-md bg-white
          animate-slideUp
        "
        id="hide-scrollbar"
      >
        <table className="min-w-full text-left">
          <thead className="bg-gradient-to-r from-sky-100 to-orange-100 border-b border-sky-200">
            <tr>
              {Object.keys(report[0]).map((key) => (
                <th
                  key={key}
                  className="px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider"
                >
                  {key}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {report.map((row, i) => (
              <tr
                key={i}
                className={`
                  ${i % 2 === 0 ? "bg-orange-50/40" : "bg-white"} 
                  hover:bg-orange-100/40 transition
                `}
              >
                {Object.values(row).map((val, j) => (
                  <td
                    key={j}
                    className="px-4 py-3 text-sm text-gray-800"
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
      <p className="text-gray-600 text-center mt-4 animate-fadeIn">
        No report data available.
      </p>
    )}
  </div>
);

}
