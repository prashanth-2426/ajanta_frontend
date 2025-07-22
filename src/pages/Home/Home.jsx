import React from "react";
import { Card } from "primereact/card";
import { Chart } from "primereact/chart";
import { Divider } from "primereact/divider";
import { ScrollPanel } from "primereact/scrollpanel";
import "primeflex/primeflex.css";

const Home = () => {
  const summary = [
    { label: "Active RFQs", value: 14, color: "indigo", icon: "pi pi-file" },
    { label: "Live Auctions", value: 3, color: "teal", icon: "pi pi-bolt" },
    {
      label: "Quotes Submitted",
      value: 27,
      color: "orange",
      icon: "pi pi-send",
    },
    { label: "Vendors", value: 92, color: "purple", icon: "pi pi-users" },
    {
      label: "Vendors",
      value: 92,
      color: "purple",
      icon: "pi pi-users",
    },
  ];

  const auctionChartData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    datasets: [
      {
        label: "Auction Activity",
        backgroundColor: "#3B82F6",
        data: [2, 3, 1, 4, 2],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: "#495057",
        },
      },
    },
  };

  const notifications = [
    { id: 1, title: "New RFQ Submitted", time: "10 mins ago" },
    {
      id: 2,
      title: "Vendor A submitted quote for RFQ 101",
      time: "30 mins ago",
    },
    { id: 3, title: "Live Auction started for RFQ 099", time: "1 hour ago" },
    { id: 4, title: "Vendor C requested negotiation", time: "Yesterday" },
  ];

  return (
    <div className="p-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        {summary.map((item, idx) => (
          <Card
            key={idx}
            className="h-[140px] flex flex-col justify-center shadow-2"
          >
            <div className="flex justify-between items-center h-full">
              <div className="overflow-hidden">
                <h2 className={`text-${item.color}-600 m-0 text-xl`}>
                  {item.value}
                </h2>
                <p className="text-sm text-600 m-0 truncate" title={item.label}>
                  {item.label}
                </p>
              </div>
              <i className={`${item.icon} text-${item.color}-500 text-3xl`} />
            </div>
          </Card>
        ))}
      </div>
      {/* Chart and Notifications Section */}
      <div className="grid">
        <div className="col-12 md:col-8">
          <Card
            title="Auction Activity (This Week)"
            className="shadow-2 h-full"
          >
            <Chart type="bar" data={auctionChartData} options={chartOptions} />
          </Card>
        </div>

        <div className="col-12 md:col-4">
          <Card title="Recent Notifications" className="shadow-2 h-full">
            <ScrollPanel style={{ height: "260px" }}>
              {notifications.map((note) => (
                <div key={note.id} className="mb-3">
                  <div className="font-medium text-900">{note.title}</div>
                  <small className="text-600">{note.time}</small>
                  <Divider className="my-2" />
                </div>
              ))}
            </ScrollPanel>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Home;
