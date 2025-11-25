import React, { useEffect, useState } from "react";
import { DatePicker, Button, Table, Space, message } from "antd";
import axios from "axios";
import dayjs from "dayjs";
import { baseurl } from "../helper/Helper";

const { RangePicker } = DatePicker;

const ConversionReport = () => {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState([]);
  const [filters, setFilters] = useState({
    startDate: dayjs().format("YYYY-MM-DD"),
    endDate: dayjs().add(1, "day").format("YYYY-MM-DD"), // ✅ today → tomorrow
  });
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalConversions, setTotalConversions] = useState(0);

  // ✅ Get pubId from localStorage
  const stored = JSON.parse(localStorage.getItem("user"));
  const pubId = stored?.affiliate?.pubId;

  // ✅ Fetch Report Data
  const fetchReport = async (startDate = filters.startDate, endDate = filters.endDate) => {
    if (!pubId) {
      message.error("No affiliate information found.");
      return;
    }

    setLoading(true);
    try {
      const params = { pubId, startDate, endDate };

      const response = await axios.get(`${baseurl}/api/reports/conversions`, {
        params,
      });

      if (response.data.success) {
        setReportData(response.data.data);
        setTotalRevenue(response.data.totalRevenue);
        setTotalConversions(response.data.totalConversions);
      } else {
        message.error("Failed to load report data");
      }
    } catch (error) {
      console.error(error);
      message.error("Error loading report data");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Auto-fetch data on component mount (today → tomorrow)
  useEffect(() => {
    fetchReport(filters.startDate, filters.endDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ Auto-fetch when user selects new dates
  useEffect(() => {
    if (filters.startDate && filters.endDate) {
      fetchReport(filters.startDate, filters.endDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.startDate, filters.endDate]);

  // ✅ Handle reset (back to today → tomorrow)
  const handleResetToToday = () => {
    const today = dayjs().format("YYYY-MM-DD");
    const tomorrow = dayjs().add(1, "day").format("YYYY-MM-DD");
    setFilters({ startDate: today, endDate: tomorrow });
  };

  // ✅ Export to CSV
  const handleExport = () => {
    if (reportData.length === 0) {
      message.warning("No data to export");
      return;
    }

    const csvRows = [];
    const headers = [
      "Date",
      "Campaign ID",
      "Pub ID",
      "Click ID",
      "Original Click",
      "Amount",
      "Sub1",
      "Sub2",
      "Sub3",
      "Sub4",
      "Sub5",
      "Sub6",
    ];
    csvRows.push(headers.join(","));

    reportData.forEach((item) => {
      const row = [
        dayjs(item.timestamp).format("YYYY-MM-DD HH:mm:ss"),
        item.campaignId,
        item.pubId,
        item.clickId,
        item.originalClick || "",
        item.amount,
        item.sub1 || "",
        item.sub2 || "",
        item.sub3 || "",
        item.sub4 || "",
        item.sub5 || "",
        item.sub6 || "",
      ];
      csvRows.push(row.join(","));
    });

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `conversion_report_${Date.now()}.csv`;
    link.click();
  };

  const columns = [
    {
      title: "Date",
      dataIndex: "timestamp",
      render: (text) => dayjs(text).format("YYYY-MM-DD HH:mm:ss"),
      fixed: "left",
      width: 160,
    },
    { title: "Campaign ID", dataIndex: "campaignId", width: 120 },
    { title: "Pub ID", dataIndex: "pubId", width: 100 },
    { title: "Click ID", dataIndex: "clickId", width: 160 },
    {
      title: "Original Click",
      dataIndex: "originalClick",
      render: (text) =>
        text ? (
          <a href={text} target="_blank" rel="noopener noreferrer">
            {text}
          </a>
        ) : (
          "-"
        ),
      width: 200,
    },
    { title: "Amount", dataIndex: "amount", width: 100 },
    { title: "Sub1", dataIndex: "sub1", width: 120 },
    { title: "Sub2", dataIndex: "sub2", width: 120 },
    { title: "Sub3", dataIndex: "sub3", width: 120 },
    { title: "Sub4", dataIndex: "sub4", width: 120 },
    { title: "Sub5", dataIndex: "sub5", width: 120 },
    { title: "Sub6", dataIndex: "sub6", width: 120 },
  ];

  return (
   <div
  className="
    p-6 md:p-8 
    bg-gradient-to-b from-sky-200 via-white to-sky-50
    rounded-2xl shadow-xl 
    border border-sky-300/40 
    animate-fadeUp
  "
>
  {/* Title */}
  <h2 className="text-2xl font-semibold text-sky-800 mb-6 tracking-tight">
    Conversion Report
  </h2>

  {/* Filters */}
  <div
    className="
      flex flex-wrap gap-3 items-center 
      bg-white/70 backdrop-blur-sm 
      p-4 rounded-xl 
      border border-sky-200 shadow-md mb-6
    "
  >
    <RangePicker
      format="YYYY-MM-DD"
      value={[dayjs(filters.startDate), dayjs(filters.endDate)]}
      onChange={(dates) => {
        if (dates) {
          setFilters({
            startDate: dates[0].format("YYYY-MM-DD"),
            endDate: dates[1].format("YYYY-MM-DD"),
          });
        }
      }}
      className="shadow-sm border-sky-300 rounded-lg"
    />

    <Button
      type="default"
      onClick={handleResetToToday}
      className="
        !border-sky-300 
        !text-sky-700 
        hover:!bg-sky-50 
        hover:!border-sky-400
        shadow-sm
      "
    >
      Reset to Today + Next Day
    </Button>

    <Button
      type="default"
      onClick={handleExport}
      className="
        !border-green-400 
        !text-green-700 
        hover:!bg-green-50 
        hover:!border-green-500
        shadow-sm
      "
    >
      Export
    </Button>
  </div>

  {/* Summary */}
  <div
    className="
      bg-white/70 backdrop-blur-sm 
      p-4 rounded-xl 
      border border-sky-200 shadow-md mb-6
      flex flex-wrap justify-between gap-4
    "
  >
    <span className="text-sky-800 text-sm md:text-base">
      <b>Total Conversions:</b> {totalConversions}
    </span>

    <span className="text-sky-800 text-sm md:text-base">
      <b>Total Revenue:</b> {totalRevenue.toFixed(2)}
    </span>
  </div>

  {/* Table */}
  <div
    className="
      bg-white rounded-xl shadow-lg 
      border border-sky-200/50 
      overflow-hidden animate-fadeIn
    "
  >
    <Table
      columns={columns}
      dataSource={reportData}
      loading={loading}
      rowKey={(record) => record.clickId}
      pagination={{ pageSize: 10 }}
      bordered
      scroll={{ x: "max-content" }}
      className="
        [&_.ant-table-thead>tr>th]:!bg-sky-100 
        [&_.ant-table-thead>tr>th]:!text-sky-700
        [&_.ant-table-thead>tr>th]:!font-semibold
        [&_.ant-table]:!rounded-xl
      "
    />
  </div>
</div>

  );
};

export default ConversionReport;
