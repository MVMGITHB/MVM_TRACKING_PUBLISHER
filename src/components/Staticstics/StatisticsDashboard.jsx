import React, { useEffect, useState } from "react";
import api from "../baseurl/baseurl.jsx";
import toast from "react-hot-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Download, RefreshCw, BarChart3, Search } from "lucide-react";

// --- Helpers ---
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
// ----------------------------------------

const StatisticsDashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCharts, setShowCharts] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [dateFilter, setDateFilter] = useState("today");

  const [pubId, setPubId] = useState(() => {
    const raw = localStorage.getItem("user");
    const parsed = safeParse(raw);
    return extractAffiliateData(parsed) || 1; // fallback
  });

  const formatLocalDate = (d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const fetchReport = async () => {
    try {
      setLoading(true);
      const end = new Date();
      const start = new Date(end);

      if (dateFilter === "last_day") start.setDate(end.getDate() - 1);
      if (dateFilter === "last_week") start.setDate(end.getDate() - 7);
      if (dateFilter === "last_month") start.setMonth(end.getMonth() - 1);

      const response = await api.get("/reports/publicerReport", {
        params: {
          pubId,
          startDate: formatLocalDate(start),
          endDate: formatLocalDate(end),
        },
      });

      if (response.data?.success) {
        setData(response.data.report || []);
      } else {
        toast.error(response.data?.message || "Failed to load report!");
        setData([]);
      }
    } catch (err) {
      toast.error("Error fetching publisher report");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [dateFilter, pubId]);

  if (loading)
    return (
      <div className="flex justify-center items-center py-16 text-lg text-gray-500 font-medium">
        Loading publisher report...
      </div>
    );

  const rows = data.slice(0, -1);
  const totals = data[data.length - 1];
  const filteredRows = rows.filter((row) =>
    String(row.Campaign || "")
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedRows = filteredRows.slice(
    startIndex,
    startIndex + rowsPerPage
  );
  const totalPages = Math.ceil(filteredRows.length / rowsPerPage) || 1;

  const exportCSV = () => {
    if (!rows.length) return toast.error("No data to export!");
    const headers = Object.keys(rows[0]).join(",");
    const csvRows = rows.map((row) =>
      Object.values(row)
        .map((v) => `"${v}"`)
        .join(",")
    );
    const blob = new Blob([[headers, ...csvRows].join("\n")], {
      type: "text/csv",
    });
    const a = document.createElement("a");
    a.href = window.URL.createObjectURL(blob);
    a.download = "publisher_report.csv";
    a.click();
    toast.success("CSV exported successfully!");
  };

  return (
    <main className="flex-1 px-4 md:px-8 lg:px-12 py-6 bg-gradient-to-b from-gray-50 to-white rounded-2xl shadow-xl">
      {/* Toolbar */}
      <div className="flex flex-wrap md:flex-nowrap items-center justify-between gap-3 mb-6">
        <div className="flex flex-wrap gap-2 items-center">
          <select
            value={dateFilter}
            onChange={(e) => {
              setCurrentPage(1);
              setDateFilter(e.target.value);
            }}
            className="border rounded-lg px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-blue-400"
          >
            <option value="today">Today</option>
            <option value="last_day">Last Day</option>
            <option value="last_week">Last Week</option>
            <option value="last_month">Last Month</option>
          </select>

          <button
            onClick={() => setShowCharts(!showCharts)}
            className="flex items-center gap-1 px-3 py-2 border rounded-lg bg-white shadow-sm hover:bg-gray-50 text-sm"
          >
            <BarChart3 size={16} />
            {showCharts ? "Hide charts" : "Show charts"}
          </button>

          <button
            onClick={fetchReport}
            className="flex items-center gap-1 px-3 py-2 border rounded-lg bg-white shadow-sm hover:bg-gray-50 text-sm"
          >
            <RefreshCw size={16} /> Refresh
          </button>

          <button
            onClick={exportCSV}
            className="flex items-center gap-1 px-3 py-2 border rounded-lg bg-white shadow-sm hover:bg-gray-50 text-sm"
          >
            <Download size={16} /> Export CSV
          </button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 mt-2 md:mt-0 flex-1 md:flex-none">
          <div className="relative w-full md:w-64">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search campaigns..."
              className="border rounded-lg pl-9 pr-3 py-2 w-full shadow-sm focus:ring-2 focus:ring-blue-400 text-sm"
              value={searchQuery}
              onChange={(e) => {
                setCurrentPage(1);
                setSearchQuery(e.target.value);
              }}
            />
          </div>
        </div>
      </div>

      {/* Chart */}
      {showCharts && rows.length > 0 && (
        <div className="bg-white rounded-xl shadow-md mb-8 overflow-x-auto border p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-700">
              Campaign Performance
            </h2>
          </div>
          <div style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={rows}
                margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
              >
                <XAxis dataKey="Campaign" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    borderRadius: "0.5rem",
                    border: "1px solid #e5e7eb",
                    boxShadow:
                      "0 1px 2px 0 rgba(0,0,0,0.05),0 1px 3px 0 rgba(0,0,0,0.1)",
                  }}
                  labelStyle={{ color: "#374151", fontWeight: 500 }}
                />
                <Legend
                  wrapperStyle={{
                    fontSize: "0.875rem",
                    color: "#374151",
                  }}
                />
                <Bar
                  dataKey="Clicks"
                  fill="#3b82f6"
                  strokeWidth={0} // ✅ ensures no outline
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="Conversions"
                  fill="#10b981"
                  strokeWidth={0} // ✅ ensures no outline
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-2xl shadow-lg border p-4">
        <table className="w-full text-sm text-right border-collapse">
          <thead className="bg-gray-100 text-gray-700 text-xs font-semibold uppercase tracking-wide">
            <tr>
              {data.length > 0 &&
                Object.keys(data[0]).map((header) => (
                  <th
                    key={header}
                    className="px-3 md:px-5 py-3 text-right whitespace-nowrap"
                  >
                    {header}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedRows.map((row, index) => (
              <tr
                key={row.Campaign ?? index}
                className={`transition-colors ${
                  index % 2 === 0
                    ? "bg-gray-50 hover:bg-gray-100"
                    : "hover:bg-gray-50"
                }`}
              >
                {Object.keys(row).map((key) => (
                  <td
                    key={key}
                    className="px-3 md:px-5 py-3 text-gray-700 whitespace-nowrap"
                  >
                    {row[key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          {totals && (
            <tfoot className="bg-gray-100 font-semibold text-gray-800 border-t">
              <tr>
                {Object.keys(totals).map((key) => (
                  <td key={key} className="px-3 md:px-5 py-3 whitespace-nowrap">
                    {totals[key]}
                  </td>
                ))}
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-3 mt-6 text-sm">
        <div className="flex items-center gap-2">
          <span>Show</span>
          <select
            className="border rounded px-2 py-1 shadow-sm"
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
          <span>of {filteredRows.length} entries</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            className="px-3 py-1 border rounded shadow-sm disabled:opacity-40"
          >
            Prev
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
            className="px-3 py-1 border rounded shadow-sm disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </main>
  );
};

export default StatisticsDashboard;
