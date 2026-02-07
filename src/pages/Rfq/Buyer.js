import React, { useEffect, useRef, useState } from "react";
import { useMemo } from "react";
import io from "socket.io-client";

import { TabView, TabPanel } from "primereact/tabview";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Panel } from "primereact/panel";
import { Divider } from "primereact/divider";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { toastError, toastSuccess } from "../../store/toastSlice";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { BASE_URL, API_URL } from "../../constants";

const SERVER = API_URL;

export default function Buyer({
  userId,
  vendors = [],
  existingAuction = null,
  onAuctionCreated,
  onAuctionUpdated,
}) {
  const { rfqNumber } = useParams();
  const user = useSelector((state) => state.auth.user);
  const auctions = useSelector((state) => state.auctions.list);
  const [title, setTitle] = useState("");
  const [invites, setInvites] = useState([]);
  const [auction, setAuction] = useState(null);
  const socket = useRef(null);
  const [mode, setMode] = useState("forward");
  const [bids, setBids] = useState({});
  const [ranks, setRanks] = useState({});
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [timer, setTimer] = useState("");

  const [chatText, setChatText] = useState("");
  const [chatVendor, setChatVendor] = useState("");
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState({});
  const [tableRows, setTableRows] = useState([]);
  const [countdownLabel, setCountdownLabel] = useState("");

  const [isAuctionLiveView, setIsAuctionLiveView] = useState(false);
  const [showScheduledCard, setShowScheduledCard] = useState(false);

  const dispatch = useDispatch();

  const modeOptions = [
    { label: "Forward Auction", value: "forward" },
    { label: "Reverse Auction", value: "reverse" },
  ];

  useEffect(() => {
    if (existingAuction) {
      setAuction(existingAuction);
      setTitle(existingAuction.title);
      setMode(existingAuction.mode);
      setStartTime(new Date(existingAuction.startTime));
      setEndTime(new Date(existingAuction.endTime));
      //setInvites(existingAuction.invited.join(", "));
      const invitedEmails = Array.isArray(existingAuction?.invited)
        ? existingAuction.invited
        : typeof existingAuction?.invited === "string"
          ? existingAuction.invited.split(",").map((e) => e.trim())
          : [];

      setInvites(invitedEmails.join(", "));
    }
  }, [existingAuction]);

  useEffect(() => {
    if (!existingAuction?.startTime) return;

    const checkAuctionPhase = () => {
      const now = new Date().getTime();
      const start = new Date(existingAuction.startTime).getTime();

      // 5 minutes before auction start
      const editCutoffTime = start - 5 * 60 * 1000;

      if (now >= editCutoffTime) {
        setIsAuctionLiveView(true); // 🔥 switch to live auction
      } else {
        setIsAuctionLiveView(false); // 🔥 allow editing
      }
    };

    checkAuctionPhase();

    const interval = setInterval(checkAuctionPhase, 1000);
    return () => clearInterval(interval);
  }, [existingAuction]);

  useEffect(() => {
    if (!existingAuction?.startTime || !existingAuction?.endTime) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const start = new Date(existingAuction.startTime).getTime();
      const end = new Date(existingAuction.endTime).getTime();
      const editCutoff = start - 5 * 60 * 1000;

      setShowScheduledCard(start && now < start);

      let diff = 0;

      // 🟡 PHASE 1 → Auction Start Countdown
      if (now >= editCutoff && now < start) {
        diff = start - now;
        setCountdownLabel("⏳ Auction Starts In");
      }

      // 🔴 PHASE 2 → Auction End Countdown
      else if (now >= start && now < end) {
        diff = end - now;
        setCountdownLabel("⏰ Auction Ends In");
      }

      // 🟢 PHASE 3 → Auction Ended
      else if (now >= end) {
        setCountdownLabel("✅ Auction Ended");
        setTimer("0h 0m 0s");
        clearInterval(interval);
        return;
      }

      if (diff > 0) {
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff / (1000 * 60)) % 60);
        const s = Math.floor((diff / 1000) % 60);
        setTimer(`${h}h ${m}m ${s}s`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [existingAuction]);

  useEffect(() => {
    if (existingAuction?.invited?.length > 0) {
      // ✅ Use existing auction invites first
      setInvites(existingAuction.invited);
    } else if (Array.isArray(vendors) && vendors.length > 0) {
      // ✅ Fallback to vendors list
      setInvites(vendors.map((v) => v.vendor_email));
    }
  }, [vendors, existingAuction]);

  // useEffect(() => {
  //   if (existingAuction) {
  //     const invitedEmails = existingAuction?.invited || [];

  //     const users = existingAuction?.users
  //       ? Object.values(existingAuction.users)
  //       : [];

  //     const vendorUsers = users.filter((u) => u.role === "vendor");

  //     const participatedVendors = vendorUsers.filter(
  //       (v) => existingAuction?.bids?.[v.id]
  //     );

  //     const nonParticipatedVendors = invitedEmails?.filter(
  //       (email) => !vendorUsers.some((v) => v.email === email)
  //     );

  //     const bids = existingAuction?.bids
  //       ? Object.values(existingAuction.bids)
  //       : [];
  //   }
  // }, [existingAuction]);

  // useEffect(() => {
  //   if (!endTime) return;

  //   const interval = setInterval(() => {
  //     const now = new Date().getTime();
  //     const end = new Date(endTime).getTime();
  //     const diff = end - now;

  //     if (diff <= 0) {
  //       setTimer("Auction Ended");
  //       return;
  //     }

  //     const d = Math.floor(diff / (1000 * 60 * 60 * 24));
  //     const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
  //     const m = Math.floor((diff / (1000 * 60)) % 60);
  //     const s = Math.floor((diff / 1000) % 60);

  //     setTimer(`${d}d ${h}h ${m}m ${s}s`);
  //   }, 1000);

  //   return () => clearInterval(interval);
  // }, [endTime]);

  const getTimeConflicts = (startTime, endTime) => {
    if (!startTime || !endTime) return [];

    const newStart = new Date(startTime).getTime();
    const newEnd = new Date(endTime).getTime();

    return auctions.filter((a) => {
      // ignore same auction while editing
      if (existingAuction?.id && a.id === existingAuction.id) return false;

      const existingStart = new Date(a.startTime).getTime();
      const existingEnd = new Date(a.endTime).getTime();

      return newStart < existingEnd && newEnd > existingStart;
    });
  };

  async function createAuction() {
    //const invited = invites.split(",").map((v) => v.email.trim());

    const conflicts = getTimeConflicts(startTime, endTime);

    if (conflicts.length > 0) {
      const conflictText = conflicts
        .map(
          (a) =>
            `• ${a.auction_number || a.id}
          (${new Date(a.startTime).toLocaleString()} → ${new Date(
            a.endTime,
          ).toLocaleString()})`,
        )
        .join("\n");

      dispatch(
        toastError({
          summary: "⛔ Schedule Conflict",
          detail: `Auction already scheduled in this time range:\n${conflictText}`,
          life: 6000,
        }),
      );
      return; // ⛔ STOP API CALL
    }

    const invited = invites;

    try {
      const res = await fetch(`${SERVER}/socks/auction`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          buyerId: userId,
          invited,
          mode,
          startTime,
          endTime,
          rfqNumber,
          auctionId: existingAuction?.id,
        }),
      });

      const data = await res.json();
      setAuction(data.auction);
      if (data) {
        dispatch(toastSuccess({ detail: "Auction created successfully!" }));
        onAuctionCreated();
      } else {
        dispatch(toastError({ detail: "Auction creation failed" }));
      }
    } catch (error) {
      dispatch(toastError({ detail: "Something went wrong" }));
    }
  }

  useEffect(() => {
    if (!auction) return;

    socket.current = io(BASE_URL, {
      query: { role: "buyer", userId },
    });

    socket.current.on("connect", () => {
      socket.current.emit("joinAuction", {
        auctionId: auction.id,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          company: user.company,
        },
      });
    });

    socket.current.on("userStatus", ({ userId, online }) => {
      console.log("User Status Received:", userId, online);
      setUsers((prev) => {
        const updated = { ...prev };

        Object.keys(updated).forEach((key) => {
          if (updated[key]?.id === userId) {
            updated[key] = {
              ...updated[key],
              online,
            };
          }
        });

        return updated;
      });
      console.log("User Status Update:", userId, online);
      console.log("Updated Users:", users);
    });

    socket.current.on("auctionUpdate", (data) => {
      setBids(data.bids);
      setUsers(data.users || {});
      setRanks(data.ranks);

      onAuctionUpdated?.();
    });

    socket.current.on("chat", (msg) => {
      console.log("received chat message:", msg);
      setMessages((prev) => [...prev, msg]);
    });

    return () => socket.current.disconnect();
  }, [auction]);

  useEffect(() => {
    const rows = Object.entries(bids).map(([vendor, b]) => {
      const vendorUser = Object.values(users).find((u) => u.id === vendor);

      console.log("Vendor User:", vendorUser);

      return {
        vendorId: vendor,
        online: vendorUser?.online ?? false,
        vendorName: vendorUser?.name || vendor,
        bid: b?.bid ?? "-",
        rank: ranks[vendor] || null,
        time: b?.time ? new Date(b.time).toLocaleTimeString() : "-",
      };
    });

    setTableRows(rows);
  }, [bids, users, ranks]); // 👈 KEY LINE

  const invitedEmails = existingAuction?.invited || [];

  const userst = existingAuction?.users
    ? Object.values(existingAuction.users)
    : [];

  const vendorUsers = userst.filter((u) => u.role === "vendor");

  const participatedVendors = vendorUsers.filter(
    (v) => existingAuction?.bids?.[v.id],
  );

  // const nonParticipatedVendors = invites?.filter(
  //   (email) => !vendorUsers.some((v) => v.email === email)
  // );

  const bidst = existingAuction?.bids
    ? Object.values(existingAuction.bids)
    : [];

  const isAuctionEnded = React.useMemo(() => {
    if (!existingAuction?.endTime) return false;

    return Date.now() > new Date(existingAuction.endTime).getTime();
  }, [existingAuction]);

  const exportAuctionPDF = async () => {
    const element = document.getElementById("auction-activity-pdf");
    if (!element) return;

    const canvas = await html2canvas(element, {
      scale: 2, // 👈 sharp PDF
      useCORS: true,
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    let position = 0;

    // Multi-page support
    if (pdfHeight > pdf.internal.pageSize.getHeight()) {
      let heightLeft = pdfHeight;
      let pageHeight = pdf.internal.pageSize.getHeight();

      while (heightLeft > 0) {
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
        position -= pageHeight;

        if (heightLeft > 0) pdf.addPage();
      }
    } else {
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    }

    pdf.save(`Auction_${existingAuction.auction_number}_Activity.pdf`);
  };

  return (
    <div
      style={{
        display: "flex",
        gap: "20px",
        padding: "20px",
        alignItems: "flex-start",
      }}
    >
      {showScheduledCard && (
        <div
          className="mb-4 p-4 border-round-xl text-center"
          style={{
            background: "linear-gradient(135deg, #0f172a, #1e293b)",
            color: "#fff",
          }}
        >
          <div className="flex align-items-center justify-content-center gap-2 mb-2">
            <i className="pi pi-calendar text-lg" />
            <span className="text-lg font-medium">Scheduled Auction</span>
          </div>

          <div className="text-2xl font-bold mb-1">
            {new Date(existingAuction.startTime).toLocaleString()}
          </div>

          <div className="text-sm text-gray-300">
            Auction will start automatically
          </div>
        </div>
      )}
      <br />
      {!isAuctionLiveView ? (
        <div style={{ flex: 1 }}>
          <Card title="Auction Details" className="p-3">
            <div className="p-fluid formgrid grid">
              <div className="field col-12">
                <label>Title</label>
                <InputText
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="field col-12">
                <label>Auction Type</label>
                <Dropdown
                  value={mode}
                  options={modeOptions}
                  onChange={(e) => setMode(e.value)}
                />
              </div>

              <div className="field col-6">
                <label>Start Time</label>
                <Calendar
                  showTime
                  value={startTime}
                  onChange={(e) => setStartTime(e.value)}
                  monthNavigator
                  yearNavigator
                  yearRange="2020:2035"
                  panelStyle={{
                    minWidth: "350px",
                    maxHeight: "320px",
                    overflowY: "auto",
                  }}
                  className="w-full"
                />
              </div>

              <div className="field col-6">
                <label>End Time</label>
                <Calendar
                  showTime
                  value={endTime}
                  onChange={(e) => setEndTime(e.value)}
                  className="w-full"
                  monthNavigator
                  yearNavigator
                  yearRange="2020:2035"
                  panelStyle={{
                    minWidth: "350px",
                    maxHeight: "320px",
                    overflowY: "auto",
                  }}
                />
              </div>

              <div className="field col-12">
                <label>Invite Vendors</label>
                <InputText
                  value={invites}
                  onChange={(e) => setInvites(e.target.value)}
                />
              </div>

              <div className="field col-12">
                <Button label="Send Auction Invite" onClick={createAuction} />
              </div>
            </div>
          </Card>
        </div>
      ) : (
        <>
          {/* TIMER SECTION */}

          <div style={{ flex: 1 }}>
            <h4>Auction Details</h4>
            {/* COUNTDOWN */}
            {countdownLabel && (
              <Card
                className="mb-3 text-center"
                style={{
                  background: "linear-gradient(135deg, #1d4ed8, #2563eb)",
                  color: "#fff",
                  padding: "0.75rem",
                }}
              >
                <div
                  style={{
                    fontSize: "0.9rem",
                    opacity: 0.85,
                    marginBottom: "0.5rem",
                  }}
                >
                  {countdownLabel}
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "10px",
                  }}
                >
                  {timer.split(" ").map((t, i) => (
                    <div
                      key={i}
                      style={{
                        background: "rgba(255,255,255,0.15)",
                        border: "1px solid rgba(255,255,255,0.4)",
                        borderRadius: "8px",
                        padding: "8px 14px",
                        minWidth: "70px",
                      }}
                    >
                      <div style={{ fontSize: "1.3rem", fontWeight: 700 }}>
                        {t.replace(/[hms]/g, "")}
                      </div>
                      <div style={{ fontSize: "0.75rem", opacity: 0.85 }}>
                        {t.includes("h")
                          ? "HRS"
                          : t.includes("m")
                            ? "MIN"
                            : "SEC"}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* AUCTION DETAILS */}
            <Card
              title={
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  🔨 <span>{auction.title}</span>
                </div>
              }
              className="mb-3"
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "1rem",
                  fontSize: "0.9rem",
                  color: "#555",
                }}
              >
                <span>
                  <strong>Auction ID:</strong> {auction.id}
                </span>
                <span>
                  <strong>Status:</strong>{" "}
                  <span style={{ color: "#16a34a", fontWeight: 600 }}>
                    LIVE
                  </span>
                </span>
              </div>

              <DataTable
                value={tableRows}
                stripedRows
                responsiveLayout="scroll"
                emptyMessage="No bids yet"
              >
                <Column
                  field="vendorId"
                  header="Vendor ID"
                  body={(row) => <strong>{row.vendorId}</strong>}
                />

                <Column
                  header="Online"
                  body={(row) => (row.online ? "🟢 Online" : "🔴 Offline")}
                />

                <Column
                  field="vendorName"
                  header="Vendor"
                  body={(row) => <strong>{row.vendorName}</strong>}
                />

                <Column
                  field="bid"
                  header="Bid"
                  body={(row) =>
                    row.bid !== null ? <strong>₹ {row.bid}</strong> : "-"
                  }
                />

                <Column
                  field="rank"
                  header="Rank"
                  body={(row) =>
                    row.rank ? (
                      <span
                        style={{
                          background: "#2563eb",
                          color: "#fff",
                          padding: "4px 10px",
                          borderRadius: "12px",
                          fontSize: "0.85rem",
                          fontWeight: 600,
                        }}
                      >
                        L{row.rank}
                      </span>
                    ) : (
                      "-"
                    )
                  }
                />

                <Column field="time" header="Time" />
              </DataTable>
            </Card>
          </div>

          {/* CHAT SECTION */}
          <div style={{ width: "40%" }}>
            <Panel header="Chat with Vendors" className="p-3">
              <div className="grid">
                <div className="col-12">
                  <label>Vendor ID : </label>
                  <InputText
                    value={chatVendor}
                    onChange={(e) => setChatVendor(e.target.value)}
                  />
                </div>

                <div className="col-12">
                  <label>Message : </label>
                  <InputText
                    value={chatText}
                    onChange={(e) => setChatText(e.target.value)}
                  />
                </div>

                <div className="col-3 flex align-items-end">
                  <Button
                    label="Send"
                    onClick={() => {
                      socket.current.emit("chatMessage", {
                        auctionId: auction.id,
                        to: chatVendor,
                        message: chatText,
                        user_name: user.name,
                        user_company: user.company,
                        rfqNumber,
                      });
                      setChatText("");
                    }}
                  />
                </div>
              </div>
              <Divider />
              {/* CHAT LIST */}
              <div
                style={{
                  maxHeight: "250px",
                  overflowY: "auto",
                  padding: "10px",
                  background: "#f8f9fa",
                  borderRadius: "8px",
                }}
              >
                {messages.map((m, i) => {
                  const isMine = m.from === userId;
                  console.log("Chat Message:", m);
                  return (
                    <div
                      key={i}
                      className={`mb-2 flex ${
                        isMine ? "justify-content-end" : "justify-content-start"
                      }`}
                    >
                      <div
                        style={{
                          padding: "10px",
                          borderRadius: "8px",
                          background: isMine ? "#0078ff" : "#e0e0e0",
                          color: isMine ? "white" : "black",
                          maxWidth: "70%",
                        }}
                      >
                        <strong>{isMine ? "You" : m.user_name}</strong>
                        <br />
                        {m.message}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Panel>
            {isAuctionEnded && (
              <TabView>
                <TabPanel header="Activity">
                  {!existingAuction ? (
                    <p>No auction activity available.</p>
                  ) : (
                    <div className="p-fluid" id="auction-activity-pdf">
                      <Button
                        label="📄 Export Activity PDF"
                        icon="pi pi-file-pdf"
                        severity="danger"
                        className="mb-3"
                        onClick={exportAuctionPDF}
                      />
                      <Card title="📅 Auction Timeline" className="mb-3">
                        <p>
                          <b>Auction Number:</b>{" "}
                          {existingAuction.auction_number}
                        </p>
                        <p>
                          <b>Mode:</b> {existingAuction.mode.toUpperCase()}
                        </p>
                        <p>
                          <b>Started At:</b>{" "}
                          {new Date(existingAuction.startTime).toLocaleString()}
                        </p>
                        <p>
                          <b>Ended At:</b>{" "}
                          {new Date(existingAuction.endTime).toLocaleString()}
                        </p>
                      </Card>

                      <Card title="📨 Invited Vendors" className="mb-3">
                        {invitedEmails?.length === 0 ? (
                          <p>No vendors invited.</p>
                        ) : (
                          <ul className="pl-3">
                            {invitedEmails?.map((email) => (
                              <li key={email}>{email}</li>
                            ))}
                          </ul>
                        )}
                      </Card>

                      <Card title="✅ Participated Vendors" className="mb-3">
                        {participatedVendors.length === 0 ? (
                          <p>No vendors participated.</p>
                        ) : (
                          <DataTable value={participatedVendors} size="small">
                            <Column field="name" header="Vendor Name" />
                            <Column field="company" header="Company" />
                            <Column
                              header="Bid Amount"
                              body={(row) => existingAuction.bids[row.id]?.bid}
                            />
                            <Column
                              header="Bid Time"
                              body={(row) =>
                                new Date(
                                  existingAuction.bids[row.id]?.time,
                                ).toLocaleString()
                              }
                            />
                            <Column
                              header="Rank"
                              body={(row) =>
                                existingAuction.ranks?.[row.id] ?? "-"
                              }
                            />
                          </DataTable>
                        )}
                      </Card>

                      {/* {nonParticipatedVendors.length > 0 && (
                        <Card
                          title="❌ Invited but Not Participated"
                          className="mb-3"
                        >
                          <ul className="pl-3">
                            {nonParticipatedVendors.map((email) => (
                              <li key={email}>{email}</li>
                            ))}
                          </ul>
                        </Card>
                      )} */}

                      {existingAuction.ranks && (
                        <Card title="🏆 Auction Result">
                          {Object.entries(existingAuction.ranks)
                            .filter(([, rank]) => rank === 1)
                            .map(([vendorId]) => {
                              const vendor = userst.find(
                                (u) => u.id === vendorId,
                              );
                              return (
                                <p key={vendorId}>
                                  <b>Winner:</b> {vendor?.name} (
                                  {vendor?.company}) — Bid:{" "}
                                  {existingAuction.bids[vendorId]?.bid}
                                </p>
                              );
                            })}
                        </Card>
                      )}
                    </div>
                  )}
                </TabPanel>
              </TabView>
            )}
          </div>
        </>
      )}
    </div>
  );
}
