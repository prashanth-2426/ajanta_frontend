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
import { set } from "react-hook-form";
import { Tag } from "primereact/tag";
import { formatDate } from "../../utils/local";

const SERVER = API_URL;

export default function Buyer({
  userId,
  vendors = [],
  existingAuction = null,
  re_auction = false,
  invitedVendors = [],
  onAuctionCreated,
  onAuctionUpdated,
}) {
  const { rfqNumber } = useParams();
  const user = useSelector((state) => state.auth.user);
  const auctions = useSelector((state) => state.auctions.list);
  const [title, setTitle] = useState("");
  const [invites, setInvites] = useState([]);
  const [invitedAirlines, setInvitedAirlines] = useState([]);
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
  const [isAuctionEnded, setIsAuctionEnded] = useState(false);
  const [extendMinutes, setExtendMinutes] = useState(null);

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
      setInvitedAirlines(existingAuction.invitedAirlines || []);
    }
  }, [existingAuction]);

  useEffect(() => {
    if (!existingAuction) return;
    if (existingAuction.buyerId !== "") return;

    createAuction({
      title: existingAuction.title,
      buyerId: userId,
      invited: existingAuction.invited,
      mode: existingAuction.mode,
      startTime: existingAuction.startTime,
      endTime: existingAuction.endTime,
      rfqNumber,
      auctionId: existingAuction?.id,
      directAuction: true, // 🔥 flag to indicate direct auction creation without invite step
    });
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
      setInvitedAirlines(
        vendors.map((v) => ({
          vendor_id: v.vendor_id,
          email: v.vendor_email,
          airline_name: v.airline_name,
        })),
      );
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

  async function createAuction(dataOverride = null) {
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

    const payload = dataOverride || {
      title,
      buyerId: userId,
      invited: invites,
      mode,
      startTime,
      endTime,
      rfqNumber,
      auctionId: existingAuction?.id,
      directAuction: true,
    };

    console.log("Creating Auction with Payload:", payload);

    try {
      const res = await fetch(`${SERVER}/socks/auction`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setAuction(data.auction);
      if (data) {
        dispatch(toastSuccess({ detail: "Auction Invite sent successfully!" }));
        onAuctionCreated();
      } else {
        dispatch(toastError({ detail: "Auction creation failed" }));
      }
    } catch (error) {
      dispatch(toastError({ detail: "Something went wrong" }));
    }
  }

  async function createAuctionFromRfq() {
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
          invitedAirlines,
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
        dispatch(toastSuccess({ detail: "Auction Invite sent successfully!" }));
        onAuctionCreated();
      } else {
        dispatch(toastError({ detail: "Auction creation failed" }));
      }
    } catch (error) {
      dispatch(toastError({ detail: "Something went wrong" }));
    }
  }

  async function extendAuctionTiming() {
    console.log("Extending auction timing by minutes:", extendMinutes);
    const newEndTime = new Date(existingAuction.endTime);
    newEndTime.setMinutes(newEndTime.getMinutes() + extendMinutes);
    try {
      const res = await fetch(`${SERVER}/socks/auction/update-auction-data`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newEndTime,
          rfqNumber,
          auctionId: existingAuction?.id,
        }),
      });

      const data = await res.json();
      //setAuction(data.auction);
      if (data) {
        dispatch(
          toastSuccess({ detail: "Auction timing extended successfully!" }),
        );
        onAuctionCreated();
      } else {
        dispatch(toastError({ detail: "Auction timing extension failed" }));
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
      console.log("Auction Update Received:", data);
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
    const sourceBids =
      bids && Object.keys(bids).length > 0 ? bids : existingAuction?.bids || {};

    const sourceUsers =
      users && Object.keys(users).length > 0
        ? users
        : existingAuction?.users || {};

    const sourceRanks =
      ranks && Object.keys(ranks).length > 0
        ? ranks
        : existingAuction?.ranks || {};

    const rows = Object.entries(sourceBids).map(([vendor, b]) => {
      const vendorUser = Object.values(sourceUsers).find(
        (u) => u.id === vendor,
      );

      return {
        vendorId: vendor,
        online: vendorUser?.online ?? false,
        vendorName: vendorUser?.name || b?.name || vendor,
        company: vendorUser?.company || b?.company || "-",
        bid: b?.bid ?? "-",
        rank: sourceRanks[vendor] || null,
        time: b?.time ? new Date(b.time).toLocaleTimeString() : "-",
      };
    });

    setTableRows(rows);
  }, [bids, users, ranks, existingAuction]);

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

  // const isAuctionEnded = React.useMemo(() => {
  //   if (!existingAuction?.endTime) return false;

  //   return Date.now() > new Date(existingAuction.endTime).getTime();
  // }, [existingAuction]);

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

  const addMinutes = (date, minutes) => {
    if (!date) return null;
    return new Date(date.getTime() + minutes * 60000);
  };

  useEffect(() => {
    if (!startTime || !endTime) return;

    if (endTime <= startTime) {
      setEndTime(addMinutes(startTime, 30));
    }
  }, [startTime]);

  useEffect(() => {
    if (!existingAuction?.endTime) return;

    const checkAuctionEnd = () => {
      const ended = Date.now() > new Date(existingAuction.endTime).getTime();

      setIsAuctionEnded(ended);
    };

    // Initial check
    checkAuctionEnd();

    // Recheck every second
    const interval = setInterval(checkAuctionEnd, 1000);

    return () => clearInterval(interval);
  }, [existingAuction]);

  return (
    <div
      style={{
        //display: "flex",
        gap: "0px",
        padding: "0px",
        alignItems: "flex-start",
      }}
    >
      {isAuctionEnded && !re_auction && (
        <div style={{ flex: 1 }}>
          <Card className="shadow-3 border-round-2xl">
            <div id="auction-activity-pdf">
              {/* ============================ */}
              {/* HEADER */}
              {/* ============================ */}
              <div
                className="flex justify-content-between align-items-center flex-wrap gap-3 mb-4"
                style={{
                  borderBottom: "1px solid #e5e7eb",
                  paddingBottom: "18px",
                }}
              >
                <div>
                  <h2
                    style={{
                      margin: 0,
                      fontSize: "28px",
                      fontWeight: 700,
                      color: "#1e293b",
                    }}
                  >
                    🏆 Auction Activity Dashboard
                  </h2>

                  <p
                    style={{
                      marginTop: "6px",
                      color: "#64748b",
                      fontSize: "14px",
                    }}
                  >
                    Complete overview of auction participation, bidding and
                    result summary.
                  </p>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <Tag
                    value={`Auction #${existingAuction?.auction_number}`}
                    severity="info"
                    style={{
                      fontSize: "13px",
                      padding: "8px 14px",
                    }}
                  />

                  <Tag
                    value={existingAuction?.mode?.toUpperCase()}
                    severity={
                      existingAuction?.mode === "reverse" ? "danger" : "success"
                    }
                    style={{
                      fontSize: "13px",
                      padding: "8px 14px",
                    }}
                  />
                </div>
              </div>

              {/* ============================ */}
              {/* TOP SUMMARY */}
              {/* ============================ */}
              <div className="grid mb-4">
                {/* Timeline */}
                <div className="col-12 md:col-4">
                  <div
                    className="p-4 border-round-xl h-full"
                    style={{
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <div className="flex align-items-center gap-2 mb-3">
                      <i
                        className="pi pi-calendar"
                        style={{
                          fontSize: "1.3rem",
                          color: "#2563eb",
                        }}
                      />

                      <h3
                        style={{
                          margin: 0,
                          fontSize: "20px",
                          color: "#1e293b",
                        }}
                      >
                        Auction Timeline
                      </h3>
                    </div>

                    <div className="grid text-sm">
                      <div className="col-5 font-semibold text-700">
                        Start Time
                      </div>

                      <div className="col-7 text-600">
                        {new Date(existingAuction?.startTime).toLocaleString()}
                      </div>

                      <div className="col-5 font-semibold text-700">
                        End Time
                      </div>

                      <div className="col-7 text-600">
                        {new Date(existingAuction?.endTime).toLocaleString()}
                      </div>

                      <div className="col-5 font-semibold text-700">
                        Vendors
                      </div>

                      <div className="col-7 text-600">
                        {participatedVendors?.length || 0} Participated
                      </div>

                      <div className="col-5 font-semibold text-700">
                        Auction Type
                      </div>

                      <div className="col-7">
                        <Tag
                          value={
                            existingAuction?.mode === "reverse"
                              ? "Reverse Auction"
                              : "Forward Auction"
                          }
                          severity={
                            existingAuction?.mode === "reverse"
                              ? "danger"
                              : "success"
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Invited Vendors */}
                <div className="col-12 md:col-4">
                  <div
                    className="p-4 border-round-xl h-full"
                    style={{
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <div className="flex align-items-center gap-2 mb-3">
                      <i
                        className="pi pi-users"
                        style={{
                          fontSize: "1.3rem",
                          color: "#7c3aed",
                        }}
                      />

                      <h3
                        style={{
                          margin: 0,
                          fontSize: "20px",
                          color: "#1e293b",
                        }}
                      >
                        Invited Vendors
                      </h3>
                    </div>

                    <div
                      style={{
                        maxHeight: "180px",
                        overflowY: "auto",
                      }}
                    >
                      {invitedEmails?.map((email, index) => (
                        <div
                          key={email}
                          className="flex justify-content-between align-items-center mb-2 p-2 border-round-lg"
                          style={{
                            background: "#fff",
                            border: "1px solid #e5e7eb",
                          }}
                        >
                          <div className="flex align-items-center gap-2">
                            <i
                              className="pi pi-envelope"
                              style={{
                                color: "#3b82f6",
                              }}
                            />

                            <span
                              style={{
                                fontSize: "14px",
                              }}
                            >
                              {email}
                            </span>
                          </div>

                          <Tag value={`#${index + 1}`} severity="info" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Winner Summary */}
                <div className="col-12 md:col-4">
                  <div
                    className="p-4 border-round-xl h-full"
                    style={{
                      background:
                        "linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)",
                      border: "1px solid #bbf7d0",
                    }}
                  >
                    <div className="flex align-items-center gap-2 mb-3">
                      <i
                        className="pi pi-trophy"
                        style={{
                          fontSize: "1.5rem",
                          color: "#16a34a",
                        }}
                      />

                      <h3
                        style={{
                          margin: 0,
                          fontSize: "20px",
                          color: "#166534",
                        }}
                      >
                        Auction Winner
                      </h3>
                    </div>

                    {Object.entries(existingAuction?.ranks || {})
                      .filter(([, rank]) => rank === 1)
                      .map(([vendorId]) => {
                        const vendor = userst.find(
                          (u) => String(u.id) === String(vendorId),
                        );

                        return (
                          <div key={vendorId}>
                            <h2
                              style={{
                                margin: 0,
                                color: "#15803d",
                                fontSize: "28px",
                              }}
                            >
                              {vendor?.name}
                            </h2>

                            <p
                              style={{
                                marginTop: "5px",
                                color: "#475569",
                              }}
                            >
                              {vendor?.company}
                            </p>

                            <div
                              className="mt-4 p-3 border-round-lg"
                              style={{
                                background: "#fff",
                                border: "1px solid #bbf7d0",
                              }}
                            >
                              <div className="text-sm text-500">
                                Final Bid Amount
                              </div>

                              <div
                                style={{
                                  fontSize: "30px",
                                  fontWeight: 700,
                                  color: "#16a34a",
                                }}
                              >
                                ₹
                                {Number(
                                  existingAuction?.bids[vendorId]?.bid || 0,
                                ).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>

              {/* ============================ */}
              {/* PARTICIPATED VENDORS */}
              {/* ============================ */}
              {/* <div
                className="p-4 border-round-xl"
                style={{
                  background: "#ffffff",
                  border: "1px solid #e5e7eb",
                }}
              >
                <div className="flex justify-content-between align-items-center mb-3">
                  <div>
                    <h5
                      style={{
                        margin: 0,
                        fontSize: "22px",
                        color: "#1e293b",
                      }}
                    >
                      ✅ Participated Vendors
                    </h5>

                    <p
                      style={{
                        marginTop: "5px",
                        color: "#64748b",
                        fontSize: "14px",
                      }}
                    >
                      Complete vendor participation and ranking details.
                    </p>
                  </div>

                  <Tag
                    value={`${participatedVendors?.length || 0} Vendors`}
                    severity="success"
                  />
                </div>

                <DataTable
                  value={participatedVendors}
                  responsiveLayout="scroll"
                  stripedRows
                  className="p-datatable-sm"
                >
                  <Column field="name" header="Vendor Name" />

                  <Column field="company" header="Company" />

                  <Column
                    header="Bid Amount"
                    body={(row) => (
                      <span
                        style={{
                          fontWeight: 700,
                          color: "#16a34a",
                        }}
                      >
                        ₹
                        {Number(
                          existingAuction?.bids[row.id]?.bid || 0,
                        ).toLocaleString()}
                      </span>
                    )}
                  />

                  <Column
                    header="Bid Time"
                    body={(row) =>
                      existingAuction?.bids[row.id]?.time
                        ? new Date(
                            existingAuction?.bids[row.id]?.time,
                          ).toLocaleString()
                        : "-"
                    }
                  />

                  <Column
                    header="Rank"
                    body={(row) => {
                      const rank = existingAuction?.ranks?.[row.id];

                      return rank ? (
                        <Tag
                          value={`L${rank}`}
                          severity={
                            rank === 1
                              ? "success"
                              : rank === 2
                                ? "warning"
                                : "info"
                          }
                        />
                      ) : (
                        "-"
                      );
                    }}
                  />
                </DataTable>
              </div> */}
            </div>
          </Card>
        </div>
      )}

      {!isAuctionEnded && !re_auction && (
        <div className="grid">
          {/* ========================================= */}
          {/* TOP HEADER + COUNTDOWN */}
          {/* ========================================= */}
          <div className="col-12">
            <Card
              className="shadow-2 border-round-2xl overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
                color: "#fff",
              }}
            >
              <div className="grid align-items-center">
                {/* LEFT */}
                <div className="col-12 lg:col-8">
                  <div className="flex align-items-center gap-3 mb-3">
                    <div
                      style={{
                        width: "70px",
                        height: "70px",
                        borderRadius: "18px",
                        background: "rgba(255,255,255,0.12)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "1px solid rgba(255,255,255,0.15)",
                      }}
                    >
                      <i
                        className="pi pi-megaphone"
                        style={{
                          fontSize: "32px",
                          color: "#ffffff",
                        }}
                      />
                    </div>

                    <div>
                      <h1
                        style={{
                          margin: 0,
                          fontSize: "34px",
                          fontWeight: 700,
                          color: "#fff",
                        }}
                      >
                        Live Auction Dashboard
                      </h1>

                      <p
                        style={{
                          marginTop: "8px",
                          color: "rgba(255,255,255,0.75)",
                          fontSize: "15px",
                        }}
                      >
                        Auction Title: {auction?.title || "Auction Title"}
                      </p>
                    </div>
                  </div>

                  {/* TAGS */}
                  <div className="flex gap-2 flex-wrap mt-3">
                    <Tag
                      value={`AUCTION NUMBER : ${auction?.auction_number}`}
                      severity="info"
                    />

                    <Tag
                      value={`Auction ID : ${auction?.id}`}
                      severity="success"
                    />

                    <Tag value="LIVE AUCTION" severity="danger" />
                  </div>
                  <div className="flex gap-2 flex-wrap mt-3">
                    <Tag value={`AUCTION START TIME :`} severity="success" /> :{" "}
                    {formatDate(auction?.startTime)}
                    <Tag
                      value={`AUCTION END TIME :`}
                      severity="success"
                    />: {formatDate(auction?.endTime)}
                  </div>
                </div>

                {/* RIGHT TIMER */}
                <div className="col-12 lg:col-4">
                  {showScheduledCard && !countdownLabel && (
                    <div
                      style={{
                        background: "rgba(255,255,255,0.08)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "5px",
                        padding: "9px",
                        textAlign: "center",
                      }}
                    >
                      <div className="flex justify-content-center gap-3 flex-wrap">
                        <div
                          style={{
                            fontSize: "14px",
                            opacity: 0.8,
                            marginBottom: "10px",
                            letterSpacing: "1px",
                          }}
                        >
                          AUCTION START TIME
                        </div>

                        <div
                          style={{
                            fontSize: "28px",
                            fontWeight: 700,
                            lineHeight: 1.4,
                          }}
                        >
                          {new Date(
                            existingAuction?.startTime,
                          ).toLocaleString()}
                        </div>

                        <div
                          style={{
                            marginTop: "12px",
                            fontSize: "13px",
                            color: "rgba(255,255,255,0.7)",
                          }}
                        >
                          Auction will start automatically
                        </div>
                      </div>
                    </div>
                  )}

                  {/* AUCTION TIMER + EXTEND CONTROLS */}
                  {countdownLabel && (
                    <div
                      style={{
                        background: "rgba(255,255,255,0.08)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "5px",
                        padding: "7px",
                        textAlign: "center",
                        backdropFilter: "blur(10px)",
                      }}
                    >
                      {/* HEADER */}
                      <div className="flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                        <div
                          style={{
                            fontSize: "15px",
                            opacity: 0.9,
                            fontWeight: 500,
                            textAlign: "left",
                          }}
                        >
                          {countdownLabel}
                        </div>

                        {/* EXTEND SECTION */}
                        <div className="flex align-items-center gap-2 flex-wrap">
                          <Dropdown
                            value={extendMinutes}
                            options={[
                              { label: "+5 Minutes", value: 5 },
                              { label: "+10 Minutes", value: 10 },
                              { label: "+15 Minutes", value: 15 },
                              { label: "+30 Minutes", value: 30 },
                            ]}
                            onChange={(e) => setExtendMinutes(e.value)}
                            placeholder="Extend Time"
                            className="p-inputtext-sm"
                            style={{
                              minWidth: "160px",
                            }}
                          />

                          <Button
                            label="Extend"
                            icon="pi pi-clock"
                            severity="warning"
                            size="small"
                            className="border-round-xl"
                            onClick={extendAuctionTiming}
                          />
                        </div>
                      </div>

                      {/* TIMER */}
                      <div className="flex justify-content-center gap-3 flex-wrap">
                        {timer.split(" ").map((t, i) => (
                          <div
                            key={i}
                            style={{
                              minWidth: "90px",
                              padding: "14px 12px",
                              borderRadius: "5px",
                              background: "rgba(255,255,255,0.12)",
                              border: "1px solid rgba(255,255,255,0.1)",
                              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                            }}
                          >
                            <div
                              style={{
                                fontSize: "30px",
                                fontWeight: 700,
                                lineHeight: 1,
                                color: "#fff",
                              }}
                            >
                              {t.replace(/[hms]/g, "")}
                            </div>

                            <div
                              style={{
                                fontSize: "11px",
                                letterSpacing: "1px",
                                marginTop: "8px",
                                opacity: 0.8,
                                color: "#cbd5e1",
                              }}
                            >
                              {t.includes("h")
                                ? "HOURS"
                                : t.includes("m")
                                  ? "MINUTES"
                                  : "SECONDS"}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* INFO */}
                      <div
                        className="mt-4 flex align-items-center justify-content-center gap-2"
                        style={{
                          fontSize: "12px",
                          color: "rgba(255,255,255,0.7)",
                        }}
                      >
                        <i className="pi pi-info-circle" />
                        Extend auction duration in real-time for all
                        participants
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* ========================================= */}
          {/* MAIN CONTENT ROW */}
          {/* ========================================= */}

          {/* LEFT SIDE */}
          <div className="col-12 xl:col-8">
            <Card className="shadow-2 border-round-2xl h-full">
              {/* HEADER */}
              <div className="flex align-items-center justify-content-between mb-3">
                <div className="flex align-items-center gap-2">
                  <i
                    className="pi pi-users"
                    style={{
                      fontSize: "1.3rem",
                      color: "#7c3aed",
                    }}
                  />

                  <h3
                    style={{
                      margin: 0,
                      color: "#1e293b",
                      fontSize: "20px",
                    }}
                  >
                    Vendor Summary
                  </h3>
                </div>

                <Tag
                  value={`${(invites?.length || 0) + (tableRows?.length || 0)} Total`}
                  severity="info"
                />
              </div>

              {/* TOP COUNTS */}
              <div className="grid mb-3">
                {/* INVITED */}
                <div className="col-12 md:col-6">
                  <div
                    className="flex align-items-center justify-content-between p-3 border-round-xl"
                    style={{
                      background: "linear-gradient(135deg,#eff6ff,#dbeafe)",
                      border: "1px solid #bfdbfe",
                    }}
                  >
                    <div className="flex align-items-center gap-3">
                      <div
                        className="flex align-items-center justify-content-center"
                        style={{
                          width: "42px",
                          height: "42px",
                          borderRadius: "12px",
                          background: "#2563eb",
                          color: "#fff",
                        }}
                      >
                        <i className="pi pi-users" />
                      </div>

                      <div>
                        <div
                          style={{
                            fontSize: "13px",
                            fontWeight: 600,
                            color: "#475569",
                          }}
                        >
                          Invited Vendors
                        </div>

                        <div
                          style={{
                            fontSize: "12px",
                            color: "#64748b",
                          }}
                        >
                          Auction invitations sent
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        fontSize: "28px",
                        fontWeight: 700,
                        color: "#2563eb",
                      }}
                    >
                      {invitedVendors?.length || 0}
                    </div>
                  </div>
                </div>

                {/* PARTICIPATED */}
                <div className="col-12 md:col-6">
                  <div
                    className="flex align-items-center justify-content-between p-3 border-round-xl"
                    style={{
                      background: "linear-gradient(135deg,#ecfdf5,#dcfce7)",
                      border: "1px solid #bbf7d0",
                    }}
                  >
                    <div className="flex align-items-center gap-3">
                      <div
                        className="flex align-items-center justify-content-center"
                        style={{
                          width: "42px",
                          height: "42px",
                          borderRadius: "12px",
                          background: "#16a34a",
                          color: "#fff",
                        }}
                      >
                        <i className="pi pi-check-circle" />
                      </div>

                      <div>
                        <div
                          style={{
                            fontSize: "13px",
                            fontWeight: 600,
                            color: "#475569",
                          }}
                        >
                          Participated Vendors
                        </div>

                        <div
                          style={{
                            fontSize: "12px",
                            color: "#64748b",
                          }}
                        >
                          Joined live auction
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        fontSize: "28px",
                        fontWeight: 700,
                        color: "#16a34a",
                      }}
                    >
                      {tableRows?.filter(
                        (row) =>
                          row.online &&
                          row.bid !== null &&
                          row.bid !== undefined &&
                          row.bid !== "-",
                      ).length || 0}
                    </div>
                  </div>
                </div>
              </div>

              {/* SIDE BY SIDE CONTENT */}
              <div className="grid">
                {/* INVITED LIST */}
                <div className="col-12 xl:col-5">
                  <div
                    className="p-3 border-round-xl h-full"
                    style={{
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <div className="flex justify-content-between align-items-center mb-3">
                      <h5
                        style={{
                          margin: 0,
                          fontSize: "16px",
                          color: "#1e293b",
                        }}
                      >
                        Invited Vendors
                      </h5>

                      <Tag
                        value={`${invitedVendors?.length || 0}`}
                        severity="info"
                      />
                    </div>

                    <div
                      style={{
                        maxHeight: "520px",
                        overflowY: "auto",
                        paddingRight: "4px",
                      }}
                    >
                      {invitedVendors?.map((vendor) => {
                        const participatedVendor = tableRows?.find(
                          (p) =>
                            String(p.vendorName || p.name)
                              .trim()
                              .toLowerCase() ===
                            String(vendor.name).trim().toLowerCase(),
                        );

                        const isParticipated = Boolean(participatedVendor);

                        return (
                          <div
                            key={vendor.id}
                            className="mb-2 p-2 border-round-lg"
                            style={{
                              background: "#fff",
                              border: "1px solid #e5e7eb",
                            }}
                          >
                            <div className="flex justify-content-between align-items-start gap-2">
                              <div style={{ minWidth: 0 }}>
                                <div
                                  style={{
                                    fontWeight: 700,
                                    fontSize: "13px",
                                    color: "#1e293b",
                                  }}
                                >
                                  {vendor.name}
                                </div>

                                <div
                                  style={{
                                    fontSize: "12px",
                                    color: "#64748b",
                                  }}
                                >
                                  {vendor.company}
                                </div>

                                <div
                                  style={{
                                    fontSize: "11px",
                                    color: "#64748b",
                                    marginTop: "3px",
                                    wordBreak: "break-word",
                                  }}
                                >
                                  {vendor.email}
                                </div>
                              </div>

                              <Tag
                                value={isParticipated ? "Joined" : "Pending"}
                                severity={isParticipated ? "success" : "danger"}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* PARTICIPATED TABLE */}
                <div className="col-12 xl:col-7">
                  <div
                    className="p-3 border-round-xl h-full"
                    style={{
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <div className="flex justify-content-between align-items-center mb-3">
                      <h5
                        style={{
                          margin: 0,
                          fontSize: "16px",
                          color: "#1e293b",
                        }}
                      >
                        Participating Vendors
                      </h5>

                      <Tag
                        value={`${tableRows?.length || 0}`}
                        severity="success"
                      />
                    </div>

                    <DataTable
                      value={[
                        ...Object.values(
                          tableRows.reduce((acc, row) => {
                            // unique key based on vendor + company
                            const key = `${row.vendorName}_${row.company}`;

                            // if no row exists yet → add
                            if (!acc[key]) {
                              acc[key] = row;
                            }
                            // if existing row is offline and new row is online → replace
                            else if (!acc[key].online && row.online) {
                              acc[key] = row;
                            }

                            return acc;
                          }, {}),
                        ),
                      ].sort((a, b) => {
                        const rankA =
                          parseInt(String(a.rank).replace("L", "")) || 999;

                        const rankB =
                          parseInt(String(b.rank).replace("L", "")) || 999;

                        return rankA - rankB;
                      })}
                      responsiveLayout="scroll"
                      stripedRows
                      scrollable
                      scrollHeight="520px"
                      className="p-datatable-sm"
                      emptyMessage="No bids yet"
                    >
                      <Column
                        header="Vendor"
                        body={(row) => (
                          <div>
                            <div
                              style={{
                                fontWeight: 600,
                                fontSize: "13px",
                              }}
                            >
                              {row.vendorName}
                            </div>

                            <div
                              style={{
                                fontSize: "11px",
                                color: "#64748b",
                              }}
                            >
                              {row.company}
                            </div>
                          </div>
                        )}
                      />

                      <Column
                        header="Status"
                        body={(row) => (
                          <Tag
                            value={row.online ? "ONLINE" : "OFFLINE"}
                            severity={row.online ? "success" : "danger"}
                          />
                        )}
                      />

                      {/* <Column field="bid" header="Bid" />

                      <Column field="rank" header="Rank" /> */}

                      <Column field="time" header="Time" />
                    </DataTable>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* RIGHT SIDE */}
          <div className="col-12 xl:col-4">
            <Card
              className="shadow-2 border-round-2xl h-full"
              style={{
                height: "760px",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* HEADER */}
              <div className="flex align-items-center justify-content-between mb-3">
                <div className="flex align-items-center gap-2">
                  <div
                    className="flex align-items-center justify-content-center"
                    style={{
                      width: "42px",
                      height: "42px",
                      borderRadius: "12px",
                      background: "#dbeafe",
                      color: "#2563eb",
                      flexShrink: 0,
                    }}
                  >
                    <i
                      className="pi pi-comments"
                      style={{
                        fontSize: "1.2rem",
                      }}
                    />
                  </div>

                  <div>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: "18px",
                        color: "#1e293b",
                      }}
                    >
                      Vendor Communication
                    </h3>

                    <p
                      style={{
                        margin: 0,
                        fontSize: "12px",
                        color: "#64748b",
                      }}
                    >
                      Real-time vendor messaging
                    </p>
                  </div>
                </div>

                <Tag
                  value={`${messages?.length || 0} Messages`}
                  severity="info"
                />
              </div>

              {/* CHAT FORM */}
              <div
                className="border-round-xl p-3 mb-3"
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div className="grid">
                  {/* VENDOR */}
                  <div className="col-12">
                    <label
                      className="block mb-2"
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#334155",
                      }}
                    >
                      Select Vendor
                    </label>

                    <Dropdown
                      value={chatVendor}
                      options={tableRows
                        .filter((v) => v.online)
                        .map((v) => ({
                          label: `${v.vendorName} (${v.company})`,
                          value: v.vendorId,
                        }))}
                      onChange={(e) => setChatVendor(e.value)}
                      placeholder="Select Online Vendor"
                      className="w-full"
                    />
                  </div>

                  {/* MESSAGE + BUTTON INLINE */}
                  <div className="col-12">
                    <label
                      className="block mb-2"
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#334155",
                      }}
                    >
                      Message
                    </label>

                    <div className="flex gap-2">
                      <InputText
                        value={chatText}
                        onChange={(e) => setChatText(e.target.value)}
                        className="w-full"
                        placeholder="Type your message"
                      />

                      <Button
                        icon="pi pi-send"
                        severity="primary"
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
                </div>
              </div>

              {/* CHAT BODY */}
              <div
                className="border-round-xl p-3"
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  height: "220px", // fixed compact height
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* SCROLLABLE MESSAGES */}
                <div
                  style={{
                    overflowY: "auto",
                    height: "100%",
                    paddingRight: "4px",
                  }}
                >
                  {messages?.length === 0 ? (
                    <div
                      className="flex flex-column align-items-center justify-content-center h-full"
                      style={{
                        color: "#64748b",
                        minHeight: "300px",
                      }}
                    >
                      <i
                        className="pi pi-comments"
                        style={{
                          fontSize: "2rem",
                          marginBottom: "12px",
                        }}
                      />

                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: 600,
                        }}
                      >
                        No messages available
                      </div>

                      <div
                        style={{
                          fontSize: "12px",
                          marginTop: "4px",
                        }}
                      >
                        Start conversation with vendors
                      </div>
                    </div>
                  ) : (
                    messages.map((m, i) => {
                      const isMine = m.from === userId;

                      return (
                        <div
                          key={i}
                          className={`mb-2 flex ${
                            isMine
                              ? "justify-content-end"
                              : "justify-content-start"
                          }`}
                        >
                          <div
                            style={{
                              padding: "10px 12px",
                              borderRadius: "14px",
                              background: isMine ? "#2563eb" : "#ffffff",
                              color: isMine ? "#fff" : "#1e293b",
                              maxWidth: "82%",
                              border: isMine ? "none" : "1px solid #e2e8f0",
                              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                            }}
                          >
                            {/* NAME */}
                            <div
                              style={{
                                fontWeight: 700,
                                marginBottom: "4px",
                                fontSize: "12px",
                                opacity: isMine ? 0.95 : 1,
                              }}
                            >
                              {isMine ? "You" : m.user_name}
                            </div>

                            {/* COMPANY */}
                            {!isMine && (
                              <div
                                style={{
                                  fontSize: "11px",
                                  marginBottom: "4px",
                                  color: "#64748b",
                                }}
                              >
                                {m.user_company}
                              </div>
                            )}

                            {/* MESSAGE */}
                            <div
                              style={{
                                fontSize: "13px",
                                lineHeight: 1.5,
                                wordBreak: "break-word",
                              }}
                            >
                              {m.message}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {re_auction && (
        <>
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
                  onChange={(e) => {
                    const selectedStart = e.value;
                    setStartTime(selectedStart);
                    setEndTime(addMinutes(selectedStart, 30));
                  }}
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
                <Button
                  label="Send Auction Invite"
                  disabled={invites.length === 0}
                  onClick={createAuctionFromRfq}
                />
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
