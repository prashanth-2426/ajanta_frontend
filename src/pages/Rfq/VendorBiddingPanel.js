import React, { useEffect, useState, useRef, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import io from "socket.io-client";

import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Divider } from "primereact/divider";
import { Panel } from "primereact/panel";
import { BASE_URL, API_URL } from "../../constants";
import { useApi } from "../../utils/requests";
import { toastError, toastSuccess } from "../../store/toastSlice";

const SERVER = API_URL;

export default function Vendor({
  userId,
  bidValue,
  airlineName,
  auctionData,
  shipmentIndex,
  rowData,
  rfqQuoteRank,
  onSubmitBid,
  onAuctionDataRankUpdate,
}) {
  //console.log("RFQ Quote Rank:", rfqQuoteRank);
  const { postData, getData } = useApi();
  const [auctionId, setAuctionId] = useState(auctionData?.id || "");
  const [socket, setSocket] = useState(null);
  const [myBid, setMyBid] = useState(bidValue);
  const [rank, setRank] = useState(null);
  const [timer, setTimer] = useState("");
  const [endTime, setEndTime] = useState("");
  const [bidCount, setBidCount] = useState(0);
  const user = useSelector((state) => state.auth.user);
  //console.log("User Details:", user);
  const dispatch = useDispatch();
  const hasSentResult = useRef(false);

  const [countdownLabel, setCountdownLabel] = useState("");
  const [showScheduledCard, setShowScheduledCard] = useState(false);
  const [isLive, setIsLive] = useState(false);

  const [hasJoined, setHasJoined] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const maxBids = 5;

  const [chatText, setChatText] = useState("");
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const chatEndRef = useRef(null);

  const [quoteRankingAfterAuction, setQuoteRankingAfterAuction] =
    useState(null);

  const directAuction = auctionData?.directAuction === true;

  const isAirlineInvited =
    directAuction ||
    auctionData?.invitedAirlines?.some((v) => v.airline_name === airlineName);

  useEffect(() => {
    if (auctionData?.id) {
      setAuctionId(auctionData.id);
    }
  }, [auctionData?.id]);

  useEffect(() => {
    if (bidValue !== undefined && bidValue !== null) {
      setMyBid(bidValue);
    }
  }, [bidValue]);

  useEffect(() => {
    const prefix = `auction_socket_${auctionId}_${user.id}`;

    const existingKey = Object.keys(localStorage).find((key) =>
      key.startsWith(prefix),
    );

    if (!existingKey) return;

    const stored = localStorage.getItem(existingKey);
    if (!stored) return;

    const joinData = JSON.parse(stored);

    // update airline name
    joinData.airlineName = airlineName;

    const s = io(BASE_URL, {
      query: { role: "vendor", userId },
    });

    s.on("connect", () => {
      s.emit("joinAuction", joinData);
    });

    setSocket(s);
  }, [auctionId, airlineName, user.id]);

  useEffect(() => {
    const prefix = `auction_socket_${auctionId}_${user.id}_`;

    const hasAnyAirlineJoined = Object.keys(localStorage).some((key) =>
      key.startsWith(prefix),
    );

    if (hasAnyAirlineJoined) {
      setHasJoined(true);
    }
  }, [auctionId, user.id]);

  useEffect(() => {
    if (showChat) {
      setUnreadCount(0);
    }
  }, [showChat]);

  // const userst = auctionData?.users ? Object.values(auctionData?.users) : [];

  // const winnerEntry = auctionData?.ranks
  //   ? Object.entries(auctionData.ranks).find(([, rank]) => rank === 1)
  //   : null;

  // const winnerVendorId = winnerEntry?.[0];

  // const winnerVendor = userst?.find(
  //   (u) => String(u.id) === String(winnerVendorId),
  // );

  // const isWinner =
  //   user?.role === "vendor" &&
  //   winnerVendor?.email &&
  //   user?.email === winnerVendor.email;

  // const myVendorEntry = auctionData?.ranks
  //   ? Object.entries(auctionData.ranks).find(([vendorId]) =>
  //       userst?.find(
  //         (u) => String(u.id) === String(vendorId) && u.email === user?.email,
  //       ),
  //     )
  //   : null;

  // const myRank = myVendorEntry?.[1];

  const myEmail = user.email;

  const filteredRanking = quoteRankingAfterAuction?.filter(
    (r) => r.shipment_index === shipmentIndex && r.airline === airlineName,
  );

  const winnerEntry = filteredRanking?.find((r) => r.rank === "L1");

  const myEntry = filteredRanking?.find((r) => r.email === myEmail);

  // 🔥 Winner = rank L1 (per shipment / airline if needed)

  //const winnerEntry = quoteRankingAfterAuction?.find((r) => r.rank === "L1");
  const nonWinners = quoteRankingAfterAuction?.filter((r) => r.rank !== "L1");

  // 🔥 My rank entry
  //const myEntry = quoteRankingAfterAuction?.find((r) => r.email === myEmail);

  // derived states
  const winnerVendor = winnerEntry
    ? {
        id: winnerEntry.vendor_id,
        name: winnerEntry.vendor_name,
        company: auctionData?.vendors?.[winnerEntry.vendor_id]?.company,
        airline: winnerEntry.airline,
      }
    : null;

  const winnerVendorId = winnerEntry?.vendor_id || null;
  const myRank = myEntry?.rank || null;

  // flags
  const isAuctionEnded = Date.now() >= new Date(auctionData?.endTime).getTime();

  const isWinner = isAuctionEnded && myEntry && myEntry.rank === "L1";

  const sendAuctionResultEmails = async (winnerEntry, nonWinners) => {
    try {
      const res = await fetch(
        `${SERVER}/socks/auction/${rowData.rfq_number}/send-result`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            winner: winnerEntry,
            nonWinners,
          }),
        },
      );

      const data = await res.json();
      if (data) {
        dispatch(
          toastSuccess({ detail: "Auction Ended Result Shared Successfully!" }),
        );
      } else {
        dispatch(toastError({ detail: "Auction Ending ailed" }));
      }
    } catch (error) {
      dispatch(toastError({ detail: "Something went wrong" }));
    }
  };

  const fetchQuoteSummary = async (rfqNumber) => {
    try {
      const response = await getData(
        `quotesummary/quotes-summary/${rfqNumber}`,
      );

      const rfqNo = response?.rfq_number;

      const formattedData =
        response?.shipments?.flatMap((shipment, shipmentIndex) =>
          shipment?.quotes
            //?.filter((quote) => quote.vendor_id === user.id) // 🔥 FILTER HERE
            ?.map((quote) => ({
              rfq_number: rfqNo,
              shipment_index: shipmentIndex,
              vendor_id: quote.vendor_id,
              vendor_name: quote.vendor_name,
              airline: quote.airline_name,
              airport: quote.airport,
              rank: quote.rank,
              email: quote.vendor_email,
            })),
        ) || [];

      setQuoteRankingAfterAuction(formattedData);
    } catch (error) {
      console.error("Error fetching quote summary:", error);
    }
  };

  useEffect(() => {
    if (rowData?.rfq_number) {
      fetchQuoteSummary(rowData.rfq_number);
    }
  }, [rowData?.rfq_number]);

  useEffect(() => {
    // this runs IMMEDIATELY after state updates & re-render
    console.log("Ranks updated after auction:", quoteRankingAfterAuction);
    if (onAuctionDataRankUpdate) {
      onAuctionDataRankUpdate(quoteRankingAfterAuction);
    }
  }, [quoteRankingAfterAuction]);

  function joinAuction() {
    const s = io(BASE_URL, {
      query: { role: "vendor", userId },
    });

    s.on("connect", () => {
      const joinData = {
        auctionId,
        airlineName,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          company: user.company,
        },
      };

      s.emit("joinAuction", joinData);

      setSocket(s);
      setHasJoined(true);
      localStorage.setItem(
        `auction_socket_${auctionId}_${user.id}_${airlineName}`,
        JSON.stringify(joinData),
      );
    });

    s.on("rankUpdate", async (data) => {
      const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      await sleep(8000);
      await fetchQuoteSummary(rowData.rfq_number);

      setRank(data.rank);
      if (data.bid !== null) setMyBid(data.bid);
      if (data.endTime) setEndTime(data.endTime);
    });

    s.on("chat", (msg) => {
      if (msg.from === userId || msg.to === userId) {
        setMessages((prev) => [...prev, msg]);
        const isIncoming = msg.from !== userId;
        setUnreadCount((prev) => prev + 1);
      }
    });
  }

  async function placeBid() {
    if (bidCount >= maxBids) return;
    if (onSubmitBid) {
      onSubmitBid(shipmentIndex, rowData);
    }
    setBidCount(bidCount + 1);
    // localStorage.setItem(
    //   `auction_bidcount_${auctionId}_${user.id}`,
    //   bidCount + 1,
    // );
    const key = `auction_bidcount_${auctionId}_${user.id}`;

    localStorage.setItem(key, Number(localStorage.getItem(key) || 0) + 1);
    socket.emit("placeBid", {
      auctionId,
      bid: Number(myBid),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        company: user.company,
      },
      rfqNumber: rowData.rfq_number,
    });
  }

  //   useEffect(() => {
  //     if (!endTime) return;

  //     const interval = setInterval(() => {
  //       const now = new Date().getTime();
  //       const end = new Date(endTime).getTime();
  //       const diff = end - now;

  //       if (diff <= 0) {
  //         setTimer("Auction Ended");
  //         return;
  //       }

  //       const d = Math.floor(diff / (1000 * 60 * 60 * 24));
  //       const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
  //       const m = Math.floor((diff / (1000 * 60)) % 60);
  //       const s = Math.floor((diff / 1000) % 60);

  //       setTimer(`${d}d ${h}h ${m}m ${s}s`);
  //     }, 1000);

  //     return () => clearInterval(interval);
  //   }, [endTime]);

  useEffect(() => {
    if (!auctionData?.startTime || !auctionData?.endTime) return;

    const interval = setInterval(async () => {
      const now = Date.now();
      const start = new Date(auctionData.startTime).getTime();
      const end = new Date(auctionData.endTime).getTime();
      const editCutoff = start - 5 * 60 * 1000;

      // show scheduled card before countdown starts
      setShowScheduledCard(start && now < start);

      let diff = 0;

      // ⏳ Before auction start
      if (now >= editCutoff && now < start) {
        diff = start - now;
        setCountdownLabel("⏳ Auction Starts In");
        setIsLive(false);
      }

      // 🔥 Auction Live
      else if (now >= start && now < end) {
        diff = end - now;
        setCountdownLabel("⏰ Auction Ends In");
        setIsLive(true);
      }

      // ❌ Ended
      else if (now >= end) {
        setCountdownLabel("✅ Auction Ended");
        setTimer("0h 0m 0s");
        setIsLive(false);
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
  }, [auctionData]);

  useEffect(() => {
    if (!auctionData?.endTime || auctionData.mailSent) return;

    const interval = setInterval(() => {
      const end = new Date(auctionData.endTime).getTime();
      const now = Date.now();

      // Stop if already sent
      if (hasSentResult.current) {
        console.log("Auction result email already sent, stopping interval.");
        clearInterval(interval);
        return;
      }

      // Wait until ranking data is loaded
      if (!quoteRankingAfterAuction || quoteRankingAfterAuction.length === 0) {
        return;
      }

      // Check auction ended
      if (now >= end) {
        const winner = quoteRankingAfterAuction.find((r) => r.rank === "L1");
        // const nonWinners = quoteRankingAfterAuction?.filter(
        //   (r) => r.rank !== "L1",
        // );

        const nonWinners = quoteRankingAfterAuction?.filter((r) => {
          const isAirlineInvited =
            auctionData?.directAuction === true ||
            auctionData?.invitedAirlines?.some(
              (v) => v.airline_name === r.airline,
            );

          return r.rank !== "L1" && isAirlineInvited;
        });

        if (winner) {
          console.log("Auction ended. Winner:", winner);
          hasSentResult.current = true;
          sendAuctionResultEmails(winner, nonWinners);
          clearInterval(interval);
        }
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith("auction_")) {
            localStorage.removeItem(key);
          }
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [auctionData?.endTime, quoteRankingAfterAuction]);

  return (
    <Card style={{ background: "transparent", boxShadow: "none" }}>
      {showScheduledCard && (
        <Card
          className="mb-3 text-center"
          style={{
            background: "linear-gradient(135deg, #0f172a, #1e293b)",
            color: "#fff",
            borderRadius: "12px",
          }}
        >
          <div style={{ fontSize: "1rem", opacity: 0.85 }}>
            📅 Scheduled Auction
          </div>

          <div
            style={{
              fontSize: "1.2rem",
              fontWeight: 600,
              marginTop: "8px",
            }}
          >
            {new Date(auctionData.startTime).toLocaleString()}
          </div>

          <div
            style={{
              fontSize: "0.8rem",
              opacity: 0.7,
              marginTop: "4px",
            }}
          >
            Auction will start automatically
          </div>
        </Card>
      )}
      {/* COUNTDOWN */}
      {countdownLabel && (
        <Card
          className="mb-3 text-center"
          style={{
            background: "linear-gradient(135deg, #1d4ed8, #2563eb)",
            color: "#fff",
          }}
        >
          <div style={{ fontSize: "0.9rem", opacity: 0.85 }}>
            {countdownLabel}
          </div>

          <div
            style={{ display: "flex", justifyContent: "center", gap: "10px" }}
          >
            {timer.split(" ").map((t, i) => (
              <div
                key={i}
                style={{
                  background: "rgba(255,255,255,0.15)",
                  padding: "8px 14px",
                  borderRadius: "8px",
                }}
              >
                <div style={{ fontSize: "1.3rem", fontWeight: 700 }}>
                  {t.replace(/[hms]/g, "")}
                </div>
                <div style={{ fontSize: "0.75rem" }}>
                  {t.includes("h") ? "HRS" : t.includes("m") ? "MIN" : "SEC"}
                </div>
              </div>
            ))}
          </div>

          <hr />

          {isAuctionEnded && isAirlineInvited && isWinner && (
            <Card
              title="🏆 Congratulations!"
              className="mb-3 border-round-xl shadow-3"
            >
              <p className="text-lg font-semibold text-green-700">
                🎉 You won the auction!
              </p>
            </Card>
          )}

          {isAuctionEnded && isAirlineInvited && !isWinner && myRank && (
            <Card
              title="📊 Auction Result"
              className="mb-3 border-round-xl shadow-2"
            >
              <p className="text-md">
                <b>Your Rank:</b>{" "}
                <span className="font-semibold text-primary">{myRank}</span>
              </p>

              <p className="text-sm text-600">
                Thank you for participating in the auction.
              </p>
            </Card>
          )}
        </Card>
      )}
      {/* JOIN AUCTION */}
      {isLive && !hasJoined && (
        <>
          <Panel header="Join Auction" className="mb-3">
            <div className="p-fluid">
              <InputText
                placeholder="Enter Auction Participation ID"
                disabled
                value={auctionId}
                onChange={(e) => setAuctionId(e.target.value)}
                className="mb-2"
              />
              <Button
                label="Join Auction"
                icon="pi pi-sign-in"
                onClick={joinAuction}
              />
            </div>
          </Panel>
          <Divider />
        </>
      )}
      {isLive && hasJoined && (
        <div className="flip-container">
          <div className={`flip-card ${showChat ? "show-chat" : ""}`}>
            {/* FRONT — PLACE BID */}
            <div className="flip-face">
              <Panel
                header={
                  <div className="flex justify-content-between align-items-center">
                    <span>Place Your Bid</span>
                    <Button
                      icon="pi pi-comments"
                      className="p-button-rounded p-button-text"
                      onClick={() => setShowChat(true)}
                    >
                      {unreadCount > 0 && (
                        <span className="p-badge p-badge-danger">
                          {unreadCount}
                        </span>
                      )}
                    </Button>
                  </div>
                }
              >
                <div className="p-fluid">
                  <InputText
                    value={myBid}
                    onChange={(e) => setMyBid(e.target.value)}
                    placeholder="Enter Bid Amount"
                    className="mb-2"
                  />

                  <div className="flex justify-content-between mb-2">
                    <span>Bids Left</span>
                    <strong>
                      {maxBids -
                        Number(
                          localStorage.getItem(
                            `auction_bidcount_${auctionId}_${user.id}`,
                          ) ??
                            bidCount ??
                            0,
                        )}
                    </strong>
                  </div>

                  <Button
                    label="Submit Bid"
                    icon="pi pi-check"
                    onClick={placeBid}
                    className="p-button-success w-full"
                  />

                  <div className="mt-3 text-center">
                    <span>Your Rank</span>
                    <h2 style={{ color: "#16a34a" }}>
                      {rfqQuoteRank ? `${rfqQuoteRank}` : "-"}
                    </h2>
                  </div>
                </div>
              </Panel>
            </div>

            {/* BACK — CHAT */}
            <div className="flip-face flip-back">
              <Panel
                header={
                  <div className="flex justify-content-between align-items-center">
                    <span>Chat With Buyer</span>
                    <Button
                      icon="pi pi-arrow-left"
                      className="p-button-rounded p-button-text"
                      onClick={() => setShowChat(false)}
                    />
                  </div>
                }
              >
                <div className="p-fluid mb-2">
                  <InputText
                    placeholder="Type message"
                    value={chatText}
                    onChange={(e) => setChatText(e.target.value)}
                    className="mb-2"
                  />
                  <Button
                    label="Send"
                    icon="pi pi-send"
                    className="p-button-info w-full"
                    onClick={() => {
                      socket.emit("chatMessage", {
                        auctionId,
                        to: "buyer",
                        message: chatText,
                        user_name: user.name,
                        user_company: user.company,
                        rfqNumber: rowData.rfq_number,
                      });
                      setChatText("");
                    }}
                  />
                </div>

                <div
                  style={{
                    maxHeight: "260px",
                    overflowY: "auto",
                    background: "#f8f9fa",
                    padding: "10px",
                    borderRadius: "8px",
                  }}
                >
                  {messages.map((m, i) => {
                    const isMine = m.from === userId;
                    return (
                      <div
                        key={i}
                        style={{
                          textAlign: isMine ? "right" : "left",
                          marginBottom: "10px",
                        }}
                      >
                        <div
                          style={{
                            display: "inline-block",
                            padding: "10px",
                            borderRadius: "10px",
                            background: isMine ? "#007ad9" : "#e5e7eb",
                            color: isMine ? "#fff" : "#000",
                            maxWidth: "75%",
                          }}
                        >
                          <strong>{isMine ? "You" : m.user_name}</strong>
                          <br />
                          {m.message}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={chatEndRef} />
                </div>
              </Panel>
            </div>
          </div>
        </div>
      )}
      {bidCount == 0 && (
        <Card
          className="mb-3 text-center"
          style={{
            background: "linear-gradient(135deg, #0f172a, #1e293b)",
            color: "#fff",
            borderRadius: "12px",
          }}
        >
          <div className="mt-3 text-center">
            <span>Your Current Rank</span>
            <h2 style={{ color: "#16a34a" }}>
              {rfqQuoteRank ? `${rfqQuoteRank}` : "-"}
            </h2>
          </div>
        </Card>
      )}
    </Card>
  );
}
