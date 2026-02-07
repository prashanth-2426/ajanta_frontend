import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Card } from "primereact/card";
import { Chart } from "primereact/chart";
import { Divider } from "primereact/divider";
import { ScrollPanel } from "primereact/scrollpanel";
import { Dropdown } from "primereact/dropdown";
import "primeflex/primeflex.css";
import { Tooltip } from "primereact/tooltip";

const Home = () => {
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
      loadDashboard();
    }
  }, [role]);

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

  const loadDashboard = async () => {
    try {
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [summaryRes, activityRes, notifRes] = await Promise.all([
        fetch("/apis/dashboard/summary", { headers }).then((r) => r.json()),
        fetch("/apis/dashboard/auction-activity", { headers }).then((r) =>
          r.json(),
        ),
        fetch("/apis/dashboard/notifications", { headers }).then((r) =>
          r.json(),
        ),
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
    plugins: {
      legend: { labels: { color: "#495057" } },
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
      value: summary?.totalRFQs,
      color: "teal",
      icon: "pi pi-database",
    },
    {
      label: "Total Quotes",
      value: summary?.totalQuotes,
      color: "indigo",
      icon: "pi pi-file-edit",
    },
    {
      label: "Total Auctions",
      value: summary?.totalAuctions,
      color: "purple",
      icon: "pi pi-bolt",
      //subText: `${summary?.totalAuctions || 0} auctions created`,
    },
    {
      label: "Live Auctions",
      value: summary?.liveAuctions,
      color: "green",
      icon: "pi pi-chart-line",
      //subText: `${summary?.liveAuctionIds?.length || 0} running`,
      details: summary?.liveAuctionIds,
    },
    {
      label: "Scheduled Auctions",
      value: summary?.scheduledAuctions,
      color: "yellow",
      icon: "pi pi-calendar",
      //subText: `${summary?.scheduledAuctionIds?.length || 0} upcoming`,
      details: summary?.scheduledAuctionIds,
    },
    {
      label: "Closed Auctions",
      value: summary?.closedAuctions,
      color: "red",
      icon: "pi pi-lock",
      //subText: `${summary?.closedAuctionIds?.length || 0} completed`,
      details: summary?.closedAuctionIds,
    },
  ];

  const vendorStats = [
    {
      label: "Received RFQs",
      value: vendorSummary?.receivedRFQs,
      color: "blue",
      icon: "pi pi-inbox",
    },
    {
      label: "Submitted Quotes",
      value: vendorSummary?.submittedQuotes,
      color: "green",
      icon: "pi pi-file-edit",
    },
    {
      label: "Total Auctions",
      value: vendorSummary?.totalAuctions,
      color: "purple",
      icon: "pi pi-gavel",
    },
    {
      label: "Live Auctions",
      value: vendorSummary?.liveAuctions,
      color: "green",
      icon: "pi pi-play-circle",
      details: vendorSummary?.auctionDetails?.filter(
        (a) => a.status === "live",
      ),
    },
    {
      label: "Scheduled Auctions",
      value: vendorSummary?.scheduledAuctions,
      color: "yellow",
      icon: "pi pi-calendar",
      details: vendorSummary?.auctionDetails?.filter(
        (a) => a.status === "scheduled",
      ),
    },
    {
      label: "Closed Auctions",
      value: vendorSummary?.closedAuctions,
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

  return (
    <div className="p-4">
      {/* Summary Cards */}

      {user?.role !== "vendor" && stats?.some((s) => Number(s.value) > 0) && (
        <div className="flex gap-4 mb-4 w-full">
          <Tooltip target=".auction-tooltip" position="top" />

          {stats.map((item, idx) => (
            <Card
              key={idx}
              className="
          auction-tooltip 
          min-w-[200px] 
          max-w-[200px] 
          h-[140px] 
          flex-shrink-0
          shadow-2 
          cursor-pointer 
          hover:shadow-4 
          transition-all
        "
              //title={item.label}
              data-pr-tooltip={
                item.details?.length
                  ? item.details
                      .map((d) => `${d.rfq_number} (${d.auction_number})`)
                      .join("\n")
                  : item.label
              }
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
        </div>
      )}

      {role === "vendor" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {vendorStats?.some((s) => Number(s.value) > 0) && (
            <div className="flex gap-4 mb-4 overflow-x-auto">
              <Tooltip target=".vendor-tooltip" position="top" />

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
        {user?.role !== "vendor" &&
          vendorData?.length > 0 &&
          vendorData.some((v) => v.vendor_count > 0) && (
            <div className="col-12 md:col-4">
              <Card title="RFQs by Vendor Count" className="shadow-2 h-full">
                <ScrollPanel style={{ height: "580px" }}>
                  <Chart
                    type="pie"
                    data={vendorchartData}
                    options={vendorchartOptions}
                    style={{ width: "100%", height: "280px" }}
                  />

                  {/* Count + Percentage List */}
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
                            {rfq.vendors.length > 0 && (
                              <em>
                                ({rfq.vendors.map((v) => v.name).join(", ")})
                              </em>
                            )}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </ScrollPanel>
              </Card>
            </div>
          )}

        {user?.role !== "vendor" &&
          vendorData?.length > 0 &&
          vendorData.some((v) => v.vendor_count > 0) && (
            <div className="col-12 md:col-4">
              <Card title="RFQs by Industry" className="shadow-2 h-full">
                <Chart
                  type="pie"
                  data={industryChartData}
                  options={industryChartOptions}
                  style={{ width: "100%", height: "280px" }}
                />

                {/* Legend With Counts / Percentages */}
                <div className="mt-3">
                  {industryData.map((item, index) => {
                    const total = industryData.reduce(
                      (sum, i) => sum + i.count,
                      0,
                    );
                    const percent = total
                      ? ((item.count / total) * 100).toFixed(1)
                      : "";

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
              </Card>
            </div>
          )}

        {role === "vendor" && (
          <div className="col-12 md:col-7">
            <Card
              title="Auction Activity (Last 12 Weeks)"
              className="shadow-2 h-full"
            >
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
            <Card
              title="Auction Activity (Last 12 Weeks)"
              className="shadow-2 h-full"
            >
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
