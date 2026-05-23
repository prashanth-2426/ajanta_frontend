import React, { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Card } from "primereact/card";
import { Chart } from "primereact/chart";
import { Divider } from "primereact/divider";
import { ScrollPanel } from "primereact/scrollpanel";
import { Dropdown } from "primereact/dropdown";
import "primeflex/primeflex.css";
import { Tooltip } from "primereact/tooltip";
import { Calendar } from "primereact/calendar";
import { MultiSelect } from "primereact/multiselect";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import { InputText } from "primereact/inputtext";

import { OverlayPanel } from "primereact/overlaypanel";
import { Tag } from "primereact/tag";

const Home = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const role = user?.role;
  const vendorId = user?.id;
  console.log("User Role in Home Page:", role);
  const [summary, setSummary] = useState([]);
  const [vendorSummary, setVendorSummary] = useState([]);
  const [auctionActivity, setAuctionActivity] = useState(null);
  const [vendorAuctionActivity, setVendorAuctionActivity] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [vendorNotifications, setVendorNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVendor, setSelectedVendor] = useState(null);

  const [dateRange, setDateRange] = useState(null);
  const [tempRange, setTempRange] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [dateLabel, setDateLabel] = useState("");

  const usersdata = useSelector((state) => state.users.data);

  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchText, setSearchText] = useState("");

  const op = useRef(null);
  const [selectedItem, setSelectedItem] = useState(null);

  const users = usersdata?.users || [];

  // Company options
  const companyOptions = [
    ...new Map(
      users
        .filter((u) => u.company && u.company.trim() !== "")
        .map((u) => [u.company, { label: u.company, value: u.company }]),
    ).values(),
  ];

  // Role options
  const roleOptions = [
    ...new Set(
      users
        .filter((u) => u.role !== "vendor") // 👈 exclude vendor here
        .map((u) => u.role),
    ),
  ].map((r) => ({
    label: r.toUpperCase(),
    value: r,
  }));

  const [weeklyActivity, setWeeklyActivity] = useState({
    labels: [],
    data: [],
  });

  const [vendorWeeklyActivity, setVendorWeeklyActivity] = useState({
    labels: [],
    data: [],
  });

  const [industryData, setIndustryData] = useState([]);
  const [transportData, setTransportData] = useState([]);
  const [vendorsPerRfqData, setVendorsPerRfqData] = useState([]);

  const token = localStorage.getItem("USERTOKEN");

  useEffect(() => {
    if (!token) return;

    if (role === "vendor") {
      getVendorDashboard();
    } else if (role === "admin" || role === "hod" || role === "user") {
      if (dateRange?.[0] && dateRange?.[1]) {
        loadDashboard();
      }
    }
  }, [role, dateRange]);

  const handleApplyFilters = () => {
    if (!dateRange?.[0] || !dateRange?.[1]) return;

    loadDashboard(); // same function you already have
  };

  useEffect(() => {
    if (selectedRoles.length === 0) {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter((u) => selectedRoles.includes(u.role));
      setFilteredUsers(filtered);
    }

    // Clear selected users when role changes
    setSelectedUsers([]);
  }, [selectedRoles, users]);

  const userOptions = filteredUsers.map((u) => ({
    label: `${u.name}`,
    value: u.email,
  }));

  const getVendorDashboard = async () => {
    console.log("inside getVendorDashboard");
    try {
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [summaryRes, activityRes, notifRes] = await Promise.all([
        fetch(`/apis/dashboard/summary/vendor?vendor_id=${vendorId}`, {
          headers,
        }).then((r) => r.json()),
        fetch(`/apis/dashboard/auction-activity/vendor?vendor_id=${vendorId}`, {
          headers,
        }).then((r) => r.json()),
        fetch(`/apis/dashboard/notifications/vendor?vendor_id=${vendorId}`, {
          headers,
        }).then((r) => r.json()),
      ]);

      setVendorSummary(summaryRes.data || []);
      setVendorAuctionActivity(activityRes.data || null);
      setVendorWeeklyActivity(activityRes.data.weekly_activity);
      setVendorNotifications(notifRes.data || []);
    } catch (err) {
      console.error("Dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const today = new Date();

    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    setDateRange([lastMonth, today]);

    // optional label if you are showing beside icon
    const start = lastMonth.toLocaleDateString("en-GB");
    const end = today.toLocaleDateString("en-GB");
    setDateLabel(`${start} - ${end}`);
  }, []);

  // useEffect(() => {
  //   if (dateRange?.[0] && dateRange?.[1]) {
  //     loadDashboard();
  //   }
  // }, [dateRange]);

  const formatDate = (date) => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const loadDashboard = async () => {
    try {
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const start = formatDate(dateRange?.[0]);
      const end = formatDate(dateRange?.[1]);

      console.log("Fetching dashboard data with date range:", { start, end });

      const roles = selectedRoles.join(",");
      const users = selectedUsers.join(",");
      const companies = selectedCompanies.join(",");
      const search = searchText;

      const [summaryRes, activityRes, notifRes] = await Promise.all([
        fetch(
          `/apis/dashboard/summary?start=${start}&end=${end}&roles=${roles}&users=${users}&companies=${companies}&search=${search}`,
          {
            headers,
          },
        ).then((r) => r.json()),
        fetch(
          `/apis/dashboard/auction-activity?start=${start}&end=${end}&roles=${roles}&users=${users}&companies=${companies}&search=${search}`,
          {
            headers,
          },
        ).then((r) => r.json()),
        fetch(
          `/apis/dashboard/notifications?start=${start}&end=${end}&roles=${roles}&users=${users}&companies=${companies}&search=${search}`,
          {
            headers,
          },
        ).then((r) => r.json()),
      ]);

      setSummary(summaryRes.data || []);
      setAuctionActivity(activityRes || null);
      setWeeklyActivity(activityRes.data.weekly_activity);
      setIndustryData(activityRes.data.by_industry);
      setTransportData(activityRes.data.by_transport);
      setVendorsPerRfqData(activityRes.data.vendors_per_rfq);
      setNotifications(notifRes || []);
    } catch (err) {
      console.error("Dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <h3 className="p-4">Loading Dashboard...</h3>;

  // Chart setup
  const auctionChartData = {
    labels: weeklyActivity?.labels || [],
    datasets: [
      {
        label: "RFQs Created",
        backgroundColor: "#3B82F6",
        data: weeklyActivity?.data || [],
      },
    ],
  };

  const vendorauctionChartData = {
    labels: vendorWeeklyActivity?.labels || [],
    datasets: [
      {
        label: "RFQs Received",
        backgroundColor: "#3B82F6",
        data: vendorWeeklyActivity?.data || [],
      },
    ],
  };

  const transportChartData = {
    labels: transportData.map((item) => item.type),
    datasets: [
      {
        data: transportData.map((item) => item.count),
        backgroundColor: [
          "#3B82F6", // blue
          "#10B981", // green
          "#F59E0B", // amber
          "#6366F1", // indigo
          "#EF4444", // red
          "#8B5CF6", // violet
          "#14B8A6", // teal
          "#F97316", // orange
        ],
      },
    ],
  };

  const transportChartOptions = {
    responsive: true,
    plugins: {
      legend: { labels: { color: "#495057" } },
    },
  };

  const industryChartData = {
    labels: industryData.map((item) => item.industry),
    datasets: [
      {
        data: industryData.map((item) => item.count),
        backgroundColor: [
          "#3B82F6",
          "#6366F1",
          "#10B981",
          "#F59E0B",
          "#EF4444",
          "#8B5CF6",
        ],
      },
    ],
  };

  const industryChartOptions = {
    responsive: true,
    plugins: {
      legend: { labels: { color: "#495057" } },
    },
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1, // 👈 forces 1,2,3,4 instead of 0.5
          precision: 0, // 👈 removes decimal values
        },
      },
    },
  };

  const stats = [
    // {
    //   label: "Total Users",
    //   value: summary?.totalUsers,
    //   color: "blue",
    //   icon: "pi pi-users",
    // },
    {
      label: "Total RFQs",
      value: summary?.totalRFQs || 0,
      color: "teal",
      icon: "pi pi-database",
      details: summary?.totalRFQIds, // Pass RFQ details
    },
    // {
    //   label: "Total Quotes",
    //   value: summary?.totalQuotes,
    //   color: "indigo",
    //   icon: "pi pi-file-edit",
    // },
    {
      label: "Total Auctions",
      value: summary?.totalAuctions || 0,
      color: "purple",
      icon: "pi pi-bolt",
      details: summary?.totalAuctionIds, // Pass auction details for tooltip
      //subText: `${summary?.totalAuctions || 0} auctions created`,
    },
    {
      label: "Live Auctions",
      value: summary?.liveAuctions || 0,
      color: "green",
      icon: "pi pi-chart-line",
      //subText: `${summary?.liveAuctionIds?.length || 0} running`,
      details: summary?.liveAuctionIds,
    },
    {
      label: "Scheduled Auctions",
      value: summary?.scheduledAuctions || 0,
      color: "yellow",
      icon: "pi pi-calendar",
      //subText: `${summary?.scheduledAuctionIds?.length || 0} upcoming`,
      details: summary?.scheduledAuctionIds,
    },
    {
      label: "Closed Auctions",
      value: summary?.closedAuctions || 0,
      color: "red",
      icon: "pi pi-lock",
      //subText: `${summary?.closedAuctionIds?.length || 0} completed`,
      details: summary?.closedAuctionIds,
    },
  ];

  const vendorStats = [
    {
      label: "Received RFQs",
      value: vendorSummary?.receivedRFQs || 0,
      color: "blue",
      icon: "pi pi-inbox",
    },
    {
      label: "Submitted Quotes",
      value: vendorSummary?.submittedQuotes || 0,
      color: "green",
      icon: "pi pi-file-edit",
    },
    {
      label: "Total Auctions",
      value: vendorSummary?.totalAuctions || 0,
      color: "purple",
      icon: "pi pi-gavel",
    },
    {
      label: "Live Auctions",
      value: vendorSummary?.liveAuctions || 0,
      color: "green",
      icon: "pi pi-play-circle",
      details: vendorSummary?.auctionDetails?.filter(
        (a) => a.status === "live",
      ),
    },
    {
      label: "Scheduled Auctions",
      value: vendorSummary?.scheduledAuctions || 0,
      color: "yellow",
      icon: "pi pi-calendar",
      details: vendorSummary?.auctionDetails?.filter(
        (a) => a.status === "scheduled",
      ),
    },
    {
      label: "Closed Auctions",
      value: vendorSummary?.closedAuctions || 0,
      color: "red",
      icon: "pi pi-lock",
      details: vendorSummary?.auctionDetails?.filter(
        (a) => a.status === "closed",
      ),
    },
  ];

  const vendorData = vendorsPerRfqData || [];

  const vendorchartData = {
    labels: vendorData.map((rfq) => rfq.rfq_number),
    datasets: [
      {
        data: vendorData.map((rfq) => rfq.vendor_count),
        backgroundColor: vendorData.map(
          (_, i) =>
            [
              "#3B82F6",
              "#10B981",
              "#F59E0B",
              "#6366F1",
              "#EF4444",
              "#8B5CF6",
              "#14B8A6",
              "#F97316",
            ][i % 8],
        ),
      },
    ],
  };

  // Chart options with tooltip showing vendor names
  const vendorchartOptions = {
    responsive: true,
    plugins: {
      legend: { labels: { color: "#495057" } },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            const rfq = vendorData[tooltipItem.dataIndex];
            const names =
              rfq.vendors.map((v) => v.name).join(", ") || "No vendors";
            return `Vendors: ${rfq.vendor_count} (${names})`;
          },
        },
      },
    },
  };

  const setPreset = (type) => {
    const today = new Date();

    if (type === "today") {
      setTempRange([today, today]);
    }

    if (type === "yesterday") {
      const y = new Date();
      y.setDate(y.getDate() - 1);
      setTempRange([y, y]);
    }

    if (type === "last7") {
      const start = new Date();
      start.setDate(start.getDate() - 6);
      setTempRange([start, today]);
    }

    if (type === "last30") {
      const start = new Date();
      start.setDate(start.getDate() - 29);
      setTempRange([start, today]);
    }

    if (type === "thisMonth") {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      setTempRange([start, today]);
    }

    if (type === "lastMonth") {
      const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const end = new Date(today.getFullYear(), today.getMonth(), 0);
      setTempRange([start, end]);
    }
  };

  const handleDownloadExcel = async () => {
    try {
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const start = dateRange?.[0]
        ? dateRange[0].toISOString().split("T")[0]
        : "";

      const end = dateRange?.[1]
        ? dateRange[1].toISOString().split("T")[0]
        : "";

      const roles = selectedRoles.join(",");
      const users = filteredUsers.join(",");
      const companies = selectedCompanies.join(",");

      const params = new URLSearchParams({
        start,
        end,
        roles,
        users,
        companies,
      });

      const response = await fetch(
        `/apis/dashboard/download-rfq-excel?${params.toString()}`,
        {
          method: "GET",
          headers,
        },
      );

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "RFQ_Auction_Report.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      console.error("Excel download failed:", error);
    }
  };

  return (
    <div className="p-4">
      {/* Summary Cards */}

      {user?.role !== "vendor" && (
        <div className="grid">
          {showCalendar && (
            <div
              className="p-3 border-round shadow-3 surface-card flex gap-3"
              style={{ position: "absolute", right: 0, zIndex: 1000 }}
            >
              {/* Preset Menu */}
              <div className="flex flex-column gap-2">
                <button
                  className="p-button p-button-text"
                  onClick={() => setPreset("today")}
                >
                  Today
                </button>
                <button
                  className="p-button p-button-text"
                  onClick={() => setPreset("yesterday")}
                >
                  Yesterday
                </button>
                <button
                  className="p-button p-button-text"
                  onClick={() => setPreset("last7")}
                >
                  Last 7 Days
                </button>
                <button
                  className="p-button p-button-text p-button-secondary"
                  onClick={() => setPreset("last30")}
                >
                  Last 30 Days
                </button>
                <button
                  className="p-button p-button-text"
                  onClick={() => setPreset("thisMonth")}
                >
                  This Month
                </button>
                <button
                  className="p-button p-button-text"
                  onClick={() => setPreset("lastMonth")}
                >
                  Last Month
                </button>

                <div className="flex gap-2 mt-3">
                  <button
                    className="p-button p-button-success"
                    onClick={() => {
                      setDateRange(tempRange);

                      if (tempRange && tempRange.length === 2) {
                        const start = tempRange[0]?.toLocaleDateString("en-GB");
                        const end = tempRange[1]?.toLocaleDateString("en-GB");

                        setDateLabel(`${start} - ${end}`);
                      }

                      setShowCalendar(false);
                    }}
                  >
                    Apply
                  </button>

                  <button
                    className="p-button p-button-text"
                    onClick={() => setShowCalendar(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>

              {/* Calendar */}
              <Calendar
                value={tempRange}
                onChange={(e) => setTempRange(e.value)}
                selectionMode="range"
                numberOfMonths={2}
                inline
              />
            </div>
          )}

          <div className="flex justify-content-end mb-3 align-items-center gap-2">
            {/* COMPANY MULTI SELECT */}

            <InputText
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="PreAucNo / RFQ / AUCNo"
              className="w-15rem"
            />

            <MultiSelect
              value={selectedCompanies}
              options={companyOptions}
              onChange={(e) => setSelectedCompanies(e.value)}
              placeholder="Select Vendor"
              className="w-15rem"
              display="chip"
            />

            {/* ROLE MULTI SELECT */}
            <MultiSelect
              value={selectedRoles}
              options={roleOptions}
              onChange={(e) => setSelectedRoles(e.value)}
              placeholder="Select Role"
              className="w-15rem"
              display="chip"
            />

            <MultiSelect
              value={selectedUsers}
              options={userOptions}
              onChange={(e) => setSelectedUsers(e.value)}
              placeholder="Select Users"
              className="w-10rem"
              display="chip"
            />

            {dateLabel && <span className="text-sm text-600">{dateLabel}</span>}

            <button
              className="p-button p-button-text p-button-sm"
              onClick={() => setShowCalendar(true)}
            >
              <i className="pi pi-calendar text-xl"></i>
            </button>

            <Button
              label="Apply Filters"
              icon="pi pi-check"
              className="p-button-success"
              onClick={handleApplyFilters}
            />

            <Button
              icon="pi pi-file-excel"
              className="p-button-success"
              onClick={handleDownloadExcel}
              tooltip="Download Excel"
              tooltipOptions={{ position: "top" }}
            />
          </div>
        </div>
      )}

      {user?.role !== "vendor" && stats?.some((s) => Number(s.value) >= 0) && (
        <div className="flex gap-4 mb-4 w-full">
          <Tooltip target=".auction-tooltip" position="top" />

          {stats.map((item, idx) => (
            <Card
              key={idx}
              onClick={(e) => {
                setSelectedItem(item);
                op.current && op.current.toggle(e);
              }}
              className="
    min-w-[200px] 
    max-w-[200px] 
    h-[140px] 
    flex-shrink-0
    shadow-2 
    cursor-pointer 
    hover:shadow-4 
    transition-all
  "
            >
              <div className="flex justify-between items-center h-full gap-4">
                <div className="overflow-hidden">
                  <h2
                    className={`text-${item.color}-600 m-0 text-2xl font-bold`}
                  >
                    {item.value}
                  </h2>
                  <p className="text-sm text-600 m-0 truncate">{item.label}</p>
                </div>

                <div
                  className={`flex align-items-center justify-content-center 
              bg-${item.color}-100 text-${item.color}-600 
              border-round-xl`}
                  style={{ width: "48px", height: "48px" }}
                >
                  <i className={`${item.icon} text-2xl`} />
                </div>
              </div>
            </Card>
          ))}

          <OverlayPanel
            ref={op}
            showCloseIcon
            dismissable
            style={{
              width: "360px",
              borderRadius: "16px",
              overflow: "hidden",
            }}
          >
            {selectedItem?.details?.length ? (
              <div>
                {/* HEADER */}
                <div
                  className="flex justify-content-between align-items-center mb-3 pb-2"
                  style={{
                    borderBottom: "1px solid #e2e8f0",
                  }}
                >
                  <div>
                    <div className="text-lg font-semibold text-900">
                      {selectedItem?.label}
                    </div>

                    <small className="text-500">RFQ / Auction Details</small>
                  </div>

                  <Tag
                    value={selectedItem?.details?.length || 0}
                    severity="info"
                  />
                </div>

                {/* SCROLLABLE LIST */}
                <div
                  className="flex flex-column gap-2 custom-scroll"
                  style={{
                    maxHeight: "320px",
                    overflowY: "auto",
                    paddingRight: "4px",
                  }}
                >
                  {selectedItem.details.map((d, i) => (
                    <div
                      key={i}
                      onClick={() => navigate(`/quote-summary/${d.rfq_number}`)}
                      className="
              p-3
              border-1
              border-200
              border-round-xl
              cursor-pointer
              transition-all
              hover:surface-100
            "
                      style={{
                        background: "#f8fafc",
                      }}
                    >
                      <div className="flex justify-content-between align-items-center">
                        <div className="overflow-hidden">
                          <div className="font-semibold text-900">
                            {d.rfq_number}
                          </div>

                          <small className="text-500">
                            {d.auction_number?.trim()
                              ? `Auction : ${d.auction_number}`
                              : "Direct RFQ"}
                          </small>
                        </div>

                        <i
                          className="pi pi-arrow-right text-500"
                          style={{
                            fontSize: "0.9rem",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center p-4 text-500">No data available</div>
            )}
          </OverlayPanel>
        </div>
      )}

      {role === "vendor" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {vendorStats?.some((s) => Number(s.value) >= 0) && (
            <div className="flex gap-4 mb-4 overflow-x-auto">
              {/* <Tooltip
                target=".vendor-tooltip"
                position="top"
                showDelay={100}
                hideDelay={500}
              /> */}

              {vendorStats.map((item, idx) => (
                <Card
                  key={idx}
                  className="
          vendor-tooltip
          min-w-[200px]
          max-w-[200px]
          h-[140px]
          flex-shrink-0
          shadow-2
          cursor-pointer
          hover:shadow-4
          transition-all
        "
                  // title={
                  //   <span className="text-sm font-medium text-700">
                  //     {item.label}
                  //   </span>
                  // }
                  data-pr-tooltip={
                    item.details?.length
                      ? item.details
                          .map((d) => `${d.rfq_number} (${d.auction_number})`)
                          .join("\n")
                      : item.label
                  }
                >
                  <div className="flex justify-between items-center h-full gap-3">
                    <div>
                      <h2
                        className={`text-${item.color}-600 m-0 text-2xl font-bold`}
                      >
                        {item.value ?? 0}
                      </h2>
                      <p className="text-sm text-600 m-0">{item.label}</p>
                    </div>

                    <div
                      className={`flex align-items-center justify-content-center 
              bg-${item.color}-100 text-${item.color}-600 
              border-round-xl`}
                      style={{ width: "50px", height: "50px" }}
                    >
                      <i className={`${item.icon} text-2xl`} />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Chart & Notifications */}
      <div className="grid">
        {user?.role !== "vendor" && (
          <div className="col-12 md:col-4">
            <Card title="RFQs by Vendor Count" className="shadow-2 h-full">
              <ScrollPanel style={{ height: "580px" }}>
                {vendorData && vendorData.length > 0 ? (
                  <>
                    <Chart
                      type="pie"
                      data={vendorchartData}
                      options={vendorchartOptions}
                      style={{ width: "100%", height: "280px" }}
                    />

                    {/* Count + List */}
                    <div className="mt-3">
                      {vendorData.map((rfq, index) => {
                        const total = vendorData.reduce(
                          (sum, i) => sum + i.vendor_count,
                          0,
                        );

                        const percent = total
                          ? ((rfq.vendor_count / total) * 100).toFixed(1)
                          : 0;

                        return (
                          <div
                            key={index}
                            className="flex justify-content-between p-2 border-round surface-100 mb-2"
                          >
                            <span>
                              <strong>{rfq.rfq_number}</strong>
                            </span>

                            <span>
                              {rfq.vendor_count}{" "}
                              {rfq.vendors?.length > 0 && (
                                <em>
                                  ({rfq.vendors.map((v) => v.name).join(", ")})
                                </em>
                              )}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div
                    className="flex justify-content-center align-items-top p-5"
                    style={{ height: "100%", color: "#888" }}
                  >
                    No records found
                  </div>
                )}
              </ScrollPanel>
            </Card>
          </div>
        )}

        {user?.role !== "vendor" && (
          <div className="col-12 md:col-4">
            <Card title="RFQs by Industry" className="shadow-2 h-full">
              {industryData && industryData.length > 0 ? (
                <>
                  <Chart
                    type="pie"
                    data={industryChartData}
                    options={industryChartOptions}
                    style={{ width: "100%", height: "280px" }}
                  />

                  {/* Legend */}
                  <div className="mt-3">
                    {industryData.map((item, index) => {
                      const total = industryData.reduce(
                        (sum, i) => sum + i.count,
                        0,
                      );

                      const percent = total
                        ? ((item.count / total) * 100).toFixed(1)
                        : 0;

                      return (
                        <div
                          key={index}
                          className="flex justify-content-between p-2 border-round surface-100 mb-2"
                        >
                          <span>
                            <strong>{item.industry}</strong>
                          </span>

                          <span>
                            {item.count} ({percent}%)
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div
                  className="flex justify-content-center align-items-top p-5"
                  style={{ height: "350px", color: "#888" }}
                >
                  No records found
                </div>
              )}
            </Card>
          </div>
        )}

        {role === "vendor" && (
          <div className="col-12 md:col-7">
            <Card title="Auction Activity" className="shadow-2 h-full">
              <Chart
                type="bar"
                data={vendorauctionChartData}
                options={chartOptions}
              />
            </Card>
          </div>
        )}

        {(role === "admin" || role === "hod" || role === "user") && (
          <div className="col-12 md:col-4">
            <Card title="Recent Notifications" className="shadow-2 h-full">
              <ScrollPanel style={{ height: "580px" }}>
                {notifications?.data?.length > 0 ? (
                  notifications?.data.map((note) => {
                    const statusLabel = note.status
                      ? note.status.replace("hod_", "").toUpperCase()
                      : "UPDATE";

                    const statusColor =
                      note.status === "hod_approved"
                        ? "bg-green-100 text-green-700"
                        : note.status === "hod_rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-orange-100 text-orange-700";

                    return (
                      <div
                        key={note.id}
                        className="mb-3 pb-2 border-bottom-1 surface-border"
                      >
                        {/* STATUS BADGE */}
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-md ${statusColor}`}
                        >
                          {statusLabel}
                        </span>

                        {/* MESSAGE */}
                        <div className="font-medium text-900 mt-2">
                          {note.message}
                        </div>

                        {/* DETAILS */}
                        <div className="text-600 text-sm mt-1">
                          <strong>RFQ:</strong> {note.rfq_id} <br />
                          <strong>Vendor:</strong> {note.vendor} <br />
                          {note.airline && (
                            <>
                              <strong>Airline:</strong> {note.airline} <br />
                            </>
                          )}
                        </div>

                        {/* TIMESTAMP */}
                        <small className="text-500">
                          {new Date(note.createdAt).toLocaleString()}
                        </small>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-600 text-sm">No notifications found.</p>
                )}
              </ScrollPanel>
            </Card>
          </div>
        )}

        {role === "vendor" && (
          <div className="col-12 md:col-4">
            <Card title="Recent Notifications" className="shadow-2 h-full">
              <ScrollPanel style={{ height: "380px" }}>
                {vendorNotifications?.length > 0 ? (
                  vendorNotifications.map((note) => {
                    let statusLabel = "UPDATE";

                    if (note.status) {
                      statusLabel = note.status
                        .replace("hod_", "")
                        .toUpperCase();
                    }

                    const statusColor =
                      note.status === "hod_approved"
                        ? "bg-green-100 text-green-700"
                        : note.status === "hod_rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-orange-100 text-orange-700";

                    return (
                      <div
                        key={note.id}
                        className="mb-3 pb-2 border-bottom-1 surface-border"
                      >
                        {/* STATUS */}
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-md ${statusColor}`}
                        >
                          {statusLabel}
                        </span>

                        {/* MESSAGE */}
                        <div className="font-medium text-900 mt-2">
                          {note.message}
                        </div>

                        {/* DETAILS */}
                        <div className="text-600 text-sm mt-1">
                          <strong>RFQ:</strong> {note.rfq_id} <br />
                          {note.airline && (
                            <>
                              <strong>Airline:</strong> {note.airline} <br />
                            </>
                          )}
                        </div>

                        {/* TIME */}
                        <small className="text-500">
                          {new Date(note.createdAt).toLocaleString()}
                        </small>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-600 text-sm">No notifications found.</p>
                )}
              </ScrollPanel>
            </Card>
          </div>
        )}
      </div>

      {(role === "admin" || role === "hod" || role === "user") && (
        <div className="grid">
          <div className="col-12 md:col-4">
            <Card title="Auction Activity" className="shadow-2 h-full">
              <Chart
                type="bar"
                data={auctionChartData}
                options={chartOptions}
              />
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
