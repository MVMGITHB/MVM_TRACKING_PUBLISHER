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

const StatisticsDashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [chartView, setChartView] = useState("per_campaign");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCharts, setShowCharts] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [dateFilter, setDateFilter] = useState("today");

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

      const response = await api.get("/reports/campaigns", {
        params: {
          startDate: formatLocalDate(start),
          endDate: formatLocalDate(end),
        },
      });

      if (response.data?.success) setData(response.data.report || []);
      else {
        toast.error(response.data?.message || "Failed to load report!");
        setData([]);
      }
    } catch (err) {
      toast.error("Error fetching campaign report");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [dateFilter]);

  if (loading)
    return (
      <div className="flex justify-center items-center py-12 text-gray-500">
        Loading report...
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
    a.download = "campaign_report.csv";
    a.click();
    toast.success("CSV exported successfully!");
  };

  return (
    <main className="flex-1 px-2 md:px-6 lg:px-12 border shadow-2xl rounded-2xl p-6">
      {/* Toolbar */}
      <div className="flex flex-wrap md:flex-nowrap items-center justify-between gap-2 mb-4">
        <div className="flex flex-wrap gap-2 items-center">
          <label className="text-sm text-gray-600">Date range:</label>
          <select
            value={dateFilter}
            onChange={(e) => {
              setCurrentPage(1);
              setDateFilter(e.target.value);
            }}
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
          >
            <option value="today">Today</option>
            <option value="last_day">Last Day</option>
            <option value="last_week">Last Week</option>
            <option value="last_month">Last Month</option>
          </select>
          <button
            onClick={() => setShowCharts(!showCharts)}
            className="px-3 py-2 bg-gray-50 rounded-lg hover:bg-gray-100"
          >
            {showCharts ? "Hide charts" : "Show charts"}
          </button>
          <button
            onClick={fetchReport}
            className="px-3 py-2 bg-gray-50 rounded-lg hover:bg-gray-100"
          >
            Refresh
          </button>
          <button
            onClick={exportCSV}
            className="px-3 py-2 bg-gray-50 rounded-lg hover:bg-gray-100"
          >
            Export CSV
          </button>
        </div>

        <div className="flex items-center gap-2 mt-2 md:mt-0 flex-1 md:flex-none">
          <input
            type="text"
            placeholder="Search in statistics"
            className="border rounded-lg px-3 py-2 w-full md:w-64 focus:ring-2 focus:ring-blue-400"
            value={searchQuery}
            onChange={(e) => {
              setCurrentPage(1);
              setSearchQuery(e.target.value);
            }}
          />
        </div>
      </div>

      {/* Chart */}
      {showCharts && rows.length > 0 && (
        <div className="bg-white rounded-xl shadow-md mb-6 overflow-x-auto border p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-700">
              Campaign Chart
            </h2>
            <select
              className="border rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-blue-400"
              value={chartView}
              onChange={(e) => setChartView(e.target.value)}
            >
              <option value="per_campaign">Per campaign</option>
            </select>
          </div>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={rows}
                margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
              >
                <XAxis dataKey="Campaign" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Clicks" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                <Bar
                  dataKey="Conversions"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-2xl shadow-lg border border-gray-200 p-4">
        <div className="min-w-max">
          <table className="w-full text-sm text-right border-collapse">
            {/* Header */}
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0 z-10">
              <tr>
                {[
                  "Campaign",
                  "Clicks",
                  "Payout",
                  "Payout in INR",
                  "Conversions",
                  "Conversion Rate (CR)",
                  "Sale Amount",
                  "Sale Amount in INR",
                ].map((header) => (
                  <th
                    key={header}
                    className="px-3 md:px-5 py-3 text-xs md:text-sm font-semibold text-gray-700 tracking-wide text-right whitespace-nowrap"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Body */}
            <tbody className="divide-y divide-gray-200">
              {paginatedRows.map((row, index) => (
                <tr
                  key={row.Campaign ?? index}
                  className={`transition-colors duration-150 ${
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

            {/* Footer (Totals) */}
            {totals && (
              <tfoot className="bg-gray-100 font-bold text-gray-800 border-t border-gray-300">
                <tr>
                  {Object.keys(totals).map((key) => (
                    <td
                      key={key}
                      className="px-3 md:px-5 py-3 whitespace-nowrap"
                    >
                      {totals[key]}
                    </td>
                  ))}
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-2 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <span>Show</span>
          <select
            className="border rounded px-2 py-1"
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
        <div className="flex gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </main>
  );
};

export default StatisticsDashboard;
