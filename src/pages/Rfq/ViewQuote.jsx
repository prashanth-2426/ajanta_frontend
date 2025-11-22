import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Dropdown } from "primereact/dropdown";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Panel } from "primereact/panel";
import { ToggleButton } from "primereact/togglebutton";
import { useApi } from "../../utils/requests";
import { Button } from "primereact/button";
//import { postData } from "../../utils/requests";
import { toastError, toastSuccess } from "../../store/toastSlice";
import { Dialog } from "primereact/dialog";
import { Checkbox } from "primereact/checkbox";
import { InputNumber } from "primereact/inputnumber";
import { InputTextarea } from "primereact/inputtextarea";
import jsPDF from "jspdf";
import "jspdf-autotable";
import logoImg from "../../assets/images/ajantha_logo.png";

const ViewQuote = () => {
  const { postData, getData } = useApi();
  const { rfqNumber } = useParams();
  const [rfq, setRfq] = useState(null);
  const [viewItemLevel, setViewItemLevel] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const role = user?.role;
  console.log("User Role in View Quote:", role);
  const [showNegotiationDialog, setShowNegotiationDialog] = useState(false);
  const [selectedVendors, setSelectedVendors] = useState([]);
  const [lastPurchasePrice, setLastPurchasePrice] = useState("");
  const [negotiationRemarks, setNegotiationRemarks] = useState("");

  const [isFlatView, setIsFlatView] = useState(false);
  const [invAmount, setInvAmount] = useState(null);

  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const [showHodApprovalDialog, setShowHodApprovalDialog] = useState(false);

  const [showHODDecisionDialog, setShowHODDecisionDialog] = useState(false);
  const [showNegotiateDialog, setShowNegotiateDialog] = useState(false);
  const [acceptRemarks, setAcceptRemarks] = useState("");
  const [expandedRows, setExpandedRows] = useState(null);

  const [dialogParams, setDialogParams] = useState(null);

  const usersdata = useSelector((state) => state.users.data);
  const hodUsers = Array.isArray(usersdata.users)
    ? usersdata.users.filter((u) => u.role === "hod")
    : [];
  console.log("hodUsers in View Quote:", hodUsers);
  const [selectedHod, setSelectedHod] = useState(null);

  const openConfirmModal = (actionType, rfqNumber, vendor_id, airline_name) => {
    setDialogParams({ actionType, rfqNumber, vendor_id, airline_name });
    setShowHODDecisionDialog(true);
  };

  useEffect(() => {
    fetchSummary();
  }, [rfqNumber]);

  //useEffect(() => {
  const fetchSummary = async () => {
    try {
      const data = await getData(`quotesummary/quotes-summary/${rfqNumber}`);
      //console.log("RFQ Quote Summary:", data);
      setRfq(data);
    } catch (error) {
      //console.error("Failed to fetch quote summary", error);
    }
  };
  //fetchSummary();
  //}, [rfqNumber]);

  const hodQuote = rfq?.shipments
    ?.flatMap((s) => s.quotes) // merge all quotes from all shipments
    ?.find((q) => q.hodAcceptRequestDetails.status === "hod_rejected");

  console.log("hodQuote", hodQuote);

  const handleAction = async (actionType, rfqNumber) => {
    try {
      const res = await postData("quotesummary/update-rfq-status", {
        rfq_number: rfqNumber,
        action: actionType,
      });
      //console.log("Action performed:", res);
      //alert(`RFQ status updated: ${actionType}`);
      dispatch(toastSuccess({ detail: `Done ${actionType} Successfully..` }));
    } catch (err) {
      //console.error("Action failed:", err);
      alert("Failed to perform action");
    }
  };

  const submitNegotiation = async () => {
    try {
      const negotiations = selectedVendors.map((v) => ({
        vendor_id: v.vendor_id,
        airline_name: v.airline_name,
        last_purchase_price: lastPurchasePrice,
        remarks: negotiationRemarks,
      }));

      await postData("quotesummary/update-rfq-status", {
        rfq_number: rfq.rfq_number,
        action: "negotiate",
        negotiations,
      });

      dispatch(
        toastSuccess({ detail: "Negotiation request sent successfully!" })
      );
      setShowNegotiationDialog(false);
    } catch (err) {
      console.error("Negotiation failed:", err);
      dispatch(toastError({ detail: "Failed to send negotiation request." }));
    }
  };

  const rankBody = (rowData) => {
    //console.log("Row Data:", rowData.rank);
    const rankColors = {
      L1: "text-green-600 font-bold",
      L2: "text-blue-500 font-semibold",
      L3: "text-yellow-500 font-medium",
      L4: "text-purple-500 font-medium",
      L5: "text-red-500 font-medium",
    };

    const colorClass = rankColors[rowData.rank] || "text-gray-500";
    //console.log("Color Class:", colorClass);
    const label = `${rowData.rank}`;
    //console.log("label Data:", label);

    return <span className={colorClass}>{label}</span>;
  };

  const itemQuoteTable = (quotes) => (
    <DataTable
      value={quotes}
      responsiveLayout="scroll"
      paginator
      rows={5}
      className="mt-3"
    >
      <Column field="item_name" header="Item Name" />
      <Column field="quoted_price" header="Quoted Price (₹)" />
      <Column field="status" header="Status" />
      <Column field="rank" header="Rank" />
    </DataTable>
  );

  const vendorTable = (
    <DataTable
      value={rfq?.vendors}
      globalFilter={globalFilter}
      filterDisplay="row"
      filters={{ global: { value: globalFilter, matchMode: "contains" } }}
      responsiveLayout="scroll"
      paginator
      rows={5}
      className="mt-3"
    >
      <Column
        field="vendor_name"
        header="Vendor"
        filter
        filterPlaceholder="Search Vendor"
        sortable
      />
      <Column field="company" header="Company" filter sortable />
      <Column field="email" header="Email" filter />
      <Column header="Rank" body={rankBody} />
      <Column
        field="total"
        header="Total Quote (₹)"
        sortable
        body={(rowData) => rowData.total?.toLocaleString("en-IN")}
      />
      <Column
        header="Quoted Items"
        body={(rowData) =>
          rowData.quotes.map((q, idx) => (
            <div key={idx}>
              {q.item_name}: ₹{q.quoted_price}
            </div>
          ))
        }
      />
      <Column
        header="Negotiation"
        body={(rowData) => {
          const negotiation = rowData.negotiation;

          return negotiation ? (
            <div>
              <div>
                <strong>LPP:</strong> ₹ {negotiation.last_purchase_price}
              </div>
              <div>
                <strong>Remarks:</strong> {negotiation.remarks}
              </div>
              <div>
                <strong>Date:</strong>{" "}
                {new Date(negotiation.requested_at)?.toLocaleString()}
              </div>
            </div>
          ) : (
            <span className="text-muted">—</span>
          );
        }}
      />
    </DataTable>
  );

  const itemLevelL1L2Table = () => {
    const items = rfq.rfq_items?.map((item) => item.item_name) || [];
    const vendors = rfq.vendors || [];
    const pivotData = {};
    items.forEach((itemName) => {
      pivotData[itemName] = {};
      vendors.forEach((vendor) => {
        const quote = vendor.quotes?.find((q) => q.item_name === itemName);
        if (quote) {
          pivotData[itemName][vendor.vendor_name] = {
            quoted_price: quote.quoted_price,
            rank: quote.rank,
          };
        }
      });
    });

    // Convert into array for DataTable
    const tableData = Object.entries(pivotData).map(([item, vendorQuotes]) => ({
      item,
      ...vendorQuotes,
    }));

    const vendorNames = vendors.map((v) => v.vendor_name);

    // Render
    return (
      <DataTable value={tableData} className="mt-4" responsiveLayout="scroll">
        <Column field="item" header="Item" frozen style={{ width: "12rem" }} />
        {vendorNames.map((vendor) => (
          <Column
            key={vendor}
            header={vendor}
            body={(rowData) => {
              const quote = rowData[vendor];
              if (!quote) return "-";
              const colorClass =
                quote.rank === "L1"
                  ? "text-green-600 font-bold"
                  : quote.rank === "L2"
                  ? "text-blue-600 font-semibold"
                  : "text-gray-600";
              return (
                <span className={colorClass}>
                  ₹{quote.quoted_price} ({quote.rank})
                </span>
              );
            }}
          />
        ))}
      </DataTable>
    );
  };

  const roadTransportL1L2Table = () => {
    const vendors = rfq.vendors || [];

    // Step 1: Get all unique row_ids
    const uniqueRows = new Set();
    vendors.forEach((vendor) => {
      vendor.quotes?.forEach((q) => {
        if (q.row_id) uniqueRows.add(q.row_id);
      });
    });

    const rowIds = Array.from(uniqueRows).sort((a, b) => a - b);

    // Step 2: Build pivot data and store row-level info (source/destination)
    const pivotData = [];
    rowIds.forEach((rowId) => {
      const rowInfo = {
        row: `Row ${rowId}`,
        source: "N/A",
        destination: "N/A",
        distance: "N/A",
      };

      vendors.forEach((vendor) => {
        const quote = vendor.quotes?.find((q) => q.row_id === rowId);
        if (quote) {
          // Set row-level info from first matched quote
          if (rowInfo.source === "N/A") {
            rowInfo.source = quote.source || "N/A";
            rowInfo.destination = quote.destination || "N/A";
            rowInfo.distance =
              quote.distance != null
                ? `${quote.distance} ${quote.distanceUnit || "KM"}`
                : "N/A";
          }

          // Add quote by vendor name
          rowInfo[vendor.vendor_name] = {
            quoted_price: quote.quoted_price,
            rank: quote.rank,
          };
        }
      });

      pivotData.push(rowInfo);
    });

    const vendorNames = vendors.map((v) => v.vendor_name);

    return (
      <DataTable value={pivotData} className="mt-4" responsiveLayout="scroll">
        <Column field="row" header="Entry" frozen style={{ width: "7rem" }} />
        <Column field="source" header="Source" style={{ width: "12rem" }} />
        <Column
          field="destination"
          header="Destination"
          style={{ width: "12rem" }}
        />
        <Column field="distance" header="Distance" style={{ width: "10rem" }} />

        {vendorNames.map((vendor) => (
          <Column
            key={vendor}
            header={vendor}
            body={(rowData) => {
              const quote = rowData[vendor];
              if (!quote) return "-";
              const colorClass =
                quote.rank === "L1"
                  ? "text-green-600 font-bold"
                  : quote.rank === "L2"
                  ? "text-blue-600 font-semibold"
                  : "text-gray-600";
              return (
                <span className={colorClass}>
                  ₹{quote.quoted_price} ({quote.rank})
                </span>
              );
            }}
          />
        ))}
      </DataTable>
    );
  };

  const packageQuoteL1L2Table = () => {
    //console.log("loaidng package quote details");
    if (!rfq?.vendors?.some((v) => v.package_quotes?.length)) return null;

    const airlines = ["Air India", "Emirates", "Qatar Airways"];
    const packages =
      rfq?.vendors[0]?.package_quotes?.map((pkg) => pkg.item_name) || [];
    const tableRows = [];

    packages.forEach((pkgType, pIndex) => {
      airlines.forEach((airline) => {
        const vendorQuotes = rfq.vendors.map((vendor) => {
          const pkg = vendor.package_quotes?.find(
            (pq) => pq.item_name === pkgType
          );
          const quote = pkg?.quotes?.find((q) => q.airline === airline);
          return {
            vendor_name: vendor.vendor_name,
            quoted_price: quote?.base ? parseFloat(quote.base) : null,
          };
        });

        // Sort for rank
        const sorted = [...vendorQuotes]
          .filter((q) => q.quoted_price !== null)
          .sort((a, b) => a.quoted_price - b.quoted_price);

        // Assign rank
        const ranked = vendorQuotes.map((v) => {
          const rankIndex = sorted.findIndex(
            (s) => s.vendor_name === v.vendor_name
          );
          return {
            ...v,
            rank: rankIndex !== -1 ? `L${rankIndex + 1}` : "-",
          };
        });

        // Final row
        tableRows.push({
          package: pkgType,
          airline,
          ...Object.fromEntries(
            ranked.map((r) => [
              r.vendor_name,
              r.quoted_price !== null ? `₹${r.quoted_price} (${r.rank})` : "-",
            ])
          ),
        });
      });
    });

    const vendorNames = rfq.vendors.map((v) => v.vendor_name);
    //console.log("vendor names", vendorNames);

    return (
      <>
        <h5 className="mt-5 mb-2">📦 Package Quote L1/L2 Summary</h5>
        <DataTable
          value={tableRows}
          responsiveLayout="scroll"
          className="p-datatable-sm"
        >
          <Column field="package" header="Package" frozen />
          <Column field="airline" header="Airline" />
          {vendorNames.map((vendor) => (
            <Column
              key={vendor}
              field={vendor}
              header={vendor}
              body={(row) => {
                const value = row[vendor];
                if (!value || value === "-") return "-";
                const rank = value.match(/\((L\d)\)/)?.[1] || "";
                const colorMap = {
                  L1: "text-green-600 font-bold",
                  L2: "text-blue-600 font-semibold",
                  L3: "text-yellow-600",
                };
                return (
                  <span className={colorMap[rank] || "text-gray-700"}>
                    {value}
                  </span>
                );
              }}
            />
          ))}
        </DataTable>
      </>
    );
  };

  const negotiation_value =
    rfq?.vendors?.find(
      (v) => v.negotiation && Object.keys(v.negotiation).length > 0
    )?.negotiation || null;
  //console.log("negotiation_value", negotiation_value);

  const shipmentWiseQuoteTable = () => {
    if (!rfq?.isShipmentBased || !rfq?.shipments?.length) return null;
    //console.log("latest rfq data", rfq);

    return rfq.shipments.map((shipment, index) => {
      const groupedByAirline = {};

      shipment.quotes.forEach((quote) => {
        const key = `${quote.airline_name}_${quote.airport}`;
        if (!groupedByAirline[key]) groupedByAirline[key] = [];
        groupedByAirline[key].push(quote);
      });

      const rows = Object.entries(groupedByAirline).map(
        ([airlineKey, vendorQuotes]) => {
          const [airline, airport] = airlineKey.split("_");
          const result = {
            airline,
            airport,
          };
          vendorQuotes.forEach((quote) => {
            result[`vendor_${quote.vendor_id}`] = {
              ...quote,
            };
          });
          return result;
        }
      );

      const vendorIds = [
        ...new Set(shipment.quotes.map((q) => q.vendor_id)),
      ].sort();

      return (
        <div key={index} className="mt-5">
          <h4 className="mt-4">
            ✈️ Shipment-wise {rfq?.shipmentType} Quote Comparison
          </h4>

          <h5 className="mb-2">Shipment {shipment.shipment_index + 1}</h5>

          {rfq.shipmentType === "Air Cargo" && (
            <DataTable
              value={shipment.quotes || []}
              responsiveLayout="scroll"
              className="p-datatable-sm"
            >
              <Column header="Vendor" body={(row) => row.vendor_name} />
              <Column header="Airline" body={(row) => row.airline_name} />
              <Column header="Airport" body={(row) => row.airport} />
              <Column
                header="Chargeable Wt"
                body={(row) => `${row.chargeable_weight || "-"} kg`}
              />
              <Column
                header="Freight (Rs/Kg)"
                body={(row) => row.base_rate || "-"}
              />
              <Column header="AMS" body={(row) => row.ams || "-"} />
              <Column header="PAC" body={(row) => row.pac || "-"} />
              <Column header="AWB" body={(row) => row.awb || "-"} />
              <Column
                header="DAP/DDP"
                body={(row) => row.dap_ddp_charges || "-"}
              />
              <Column header="Other" body={(row) => row.other_charges || "-"} />
              <Column
                header="First Bid Price"
                body={(row) => (
                  <strong>₹ {parseFloat(row.FirstBidPrice).toFixed(2)}</strong>
                )}
              />
              <Column
                header="Final Bid Price"
                body={(row) => (
                  <strong>
                    ₹ {parseFloat(row.grandTotalValue).toFixed(2)}
                  </strong>
                )}
              />
              <Column
                header="Target Price"
                body={(row) => (
                  <strong>₹ {row.negotiation?.last_purchase_price}</strong>
                )}
              />
              <Column
                header="Rank"
                body={(row) =>
                  row.rank === "L1" ? (
                    <span style={{ color: "green", fontWeight: "bold" }}>
                      {row.rank}
                    </span>
                  ) : (
                    row.rank || "-"
                  )
                }
              />
            </DataTable>
          )}

          {rfq.shipmentType === "Ocean Freight" && (
            <DataTable
              value={shipment.quotes || []}
              responsiveLayout="scroll"
              className="p-datatable-sm"
            >
              <Column header="Vendor" body={(row) => row.vendor_name} />
              <Column header="Sealine" body={(row) => row.sealine_name} />
              <Column header="Seaport" body={(row) => row.sea_port} />
              <Column
                header="Chargeable Wt"
                body={(row) => `${row.chargeable_weight || "-"} kg`}
              />
              <Column
                header="Freight (Rs/Kg)"
                body={(row) => row.base_rate || "-"}
              />
              <Column header="AMS" body={(row) => row.ams || "-"} />
              <Column header="PAC" body={(row) => row.pac || "-"} />
              <Column header="AWB" body={(row) => row.awb || "-"} />
              <Column
                header="DAP/DDP"
                body={(row) => row.dap_ddp_charges || "-"}
              />
              <Column header="Other" body={(row) => row.other_charges || "-"} />
              <Column
                header="Total Charges"
                body={(row) => (
                  <strong>₹ {parseFloat(row.total_charges).toFixed(2)}</strong>
                )}
              />
              <Column
                header="Rank"
                body={(row) =>
                  row.rank === "L1" ? (
                    <span style={{ color: "green", fontWeight: "bold" }}>
                      {row.rank}
                    </span>
                  ) : (
                    row.rank || "-"
                  )
                }
              />
            </DataTable>
          )}
        </div>
      );
    });
  };

  const shipmentLevelL1L2Table = () => {
    const INV_AMOUNT = 10000;

    const allQuotes =
      rfq?.shipments?.flatMap((shipment) => {
        return (
          shipment.quotes?.map((quote) => {
            const total = parseFloat(quote.total_charges || quote.total || 0);
            const percent = invAmount ? (total / invAmount) * 100 : null;
            return {
              ...quote,
              percentage: percent?.toFixed(2),
            };
          }) || []
        );
      }) || [];

    const rowExpansionTemplate = (row) => {
      // Pair each route with its corresponding schedule
      const flightRoutes = [
        { route: row.route1, schedule: row.flight_schedule1 },
        { route: row.route2, schedule: row.flight_schedule2 },
        { route: row.route3, schedule: row.flight_schedule3 },
      ].filter((r) => r.route || r.schedule); // keep only filled ones

      return (
        <div className="p-3">
          <div className="grid">
            <div className="col-12 md:col-4">
              <strong>Currency:</strong> {row.currency || "-"}
            </div>
            <div className="col-12 md:col-4">
              <strong>Transit Days:</strong> {row.transit_days || "-"}
            </div>
            <div className="col-12 md:col-4">
              <strong>Exchange Rate:</strong> {row.exchangeRate || "-"}
            </div>

            {/* Flight Routes + Schedules */}
            <div className="col-12">
              <strong>Flight Route & Schedule:</strong>
              <div className="grid mt-2">
                {flightRoutes.length > 0 ? (
                  flightRoutes.map((fr, idx) => (
                    <div key={idx} className="col-12 md:col-6 mb-2">
                      <div className="p-2 border-round surface-100">
                        <div>
                          <strong>Route:</strong> {fr.route || "-"}
                        </div>
                        <div>
                          <strong>Schedule:</strong>{" "}
                          {fr.schedule
                            ? new Date(fr.schedule).toLocaleDateString()
                            : "-"}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-12">-</div>
                )}
              </div>
            </div>

            <div className="col-12">
              <strong>Remarks:</strong> {row.remarks || "-"}
            </div>
          </div>
        </div>
      );
    };

    const exportToPDF = async (auctionDetails = {}, companyDetails = {}) => {
      const doc = new jsPDF("l", "mm", "a4");
      const pageWidth = doc.internal.pageSize.getWidth();

      const { totalSaving = "INR 2,00,000.00 (2.71%)" } = companyDetails;

      const {
        auctionId = rfq?.rfq_number || "N/A",
        auctionTitle = rfq?.title || "N/A",
        auctionType = rfq?.type || "N/A",
        hideCurrentBid = rfq?.hideCurrentBidPrice || "N/A",
        testAuction = "No",
        description = rfq?.description || "N/A",
        createdDate = rfq?.createdDate
          ? new Date(rfq?.createdDate).toLocaleString()
          : "N/A",
        openDate = rfq?.openDateTime
          ? new Date(rfq?.openDateTime).toLocaleString()
          : "N/A",
        closeDate = rfq?.closeDateTime
          ? new Date(rfq?.closeDateTime).toLocaleString()
          : "N/A",
      } = auctionDetails;

      let currentY = 10; // 🔹 Track current vertical position

      // =========================
      // 🔹 Header (Centered Logo)
      // =========================
      const addHeader = () => {
        const logoWidth = 140;
        const logoHeight = 15;
        const logoX = (pageWidth - logoWidth) / 2;
        const logoY = currentY;

        try {
          doc.addImage(logoImg, "PNG", logoX, logoY, logoWidth, logoHeight);
        } catch (err) {
          console.error("Logo load error:", err);
        }

        currentY = logoY + logoHeight + 10; // move below logo
      };

      // =========================
      // 🔹 Auction Details Section
      // =========================
      const addAuctionDetails = () => {
        const lineSpacing = 7;
        const pageWidth = doc.internal.pageSize.getWidth();
        const marginLeft = 20;
        const valueX = 70;
        const maxTextWidth = pageWidth - valueX - 20; // available width for text

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");

        const details = [
          ["Auction ID", auctionId],
          ["Auction Title", auctionTitle],
          ["Auction Type", auctionType],
          ["Hide Current Bid Price", hideCurrentBid],
          ["Test eAuction", testAuction],
          ["Description", description],
          ["Auction Created Date & Time", createdDate],
          ["Auction Open Date & Time", openDate],
          ["Auction Close Date & Time", closeDate],
        ];

        details.forEach(([label, value]) => {
          // Wrap long text properly
          const labelText = `${label}:`;
          const wrappedValue = doc.splitTextToSize(
            value?.toString() || "",
            maxTextWidth
          );

          // Draw label
          doc.text(labelText, marginLeft, currentY);
          // Draw wrapped value, one or multiple lines
          doc.text(wrappedValue, valueX, currentY);

          // Increase Y position based on text height
          currentY += lineSpacing * wrappedValue.length;
        });

        // Draw line separator
        doc.setDrawColor(200);
        doc.line(20, currentY, pageWidth - 20, currentY);
        currentY += 10;

        // Add Total Saving & Summary Title
        doc.setFont("helvetica", "bold");
        //doc.text(`Total Saving - ${totalSaving}`, 20, currentY);
        currentY += 8;
        doc.text(`Auction Quote Details`, 20, currentY);
        currentY += 10; // space before next section

        return currentY;
      };

      const quotedatalatestFinal = (startY) => {
        let yPos = startY;
        const topQuotes = allQuotes; // all vendors

        // 🧩 Combine all columns from all 3 tables
        const allCols = [
          "Vendor",
          "Airline",
          "Airport",
          "Chargeable Wt (kg)",
          "Freight / Kg (INR)",
          "AMS (INR)",
          "PAC (INR)",
          "AWB (INR)",
          "Other (INR)",
          "Currency",
          "DAP/DDP",
          "Exchange Rate",
          "Transit Days",
          "Routing",
          "Remark / Condition",
          "Target Price",
          "Total Charges (INR)",
          "Total Saving",
          "Rank",
          "isAccepted",
        ];

        // 🧠 Helper to build all rows dynamically
        const buildRows = (cols) =>
          topQuotes.map((q, index) => {
            console.log("Generating row for quote:", q);
            const lastNegotiation = Array.isArray(q.negotiation)
              ? q.negotiation.find(
                  (n) =>
                    n.vendor_id === q.vendor_id &&
                    n.airline_name === q.airline_name
                )
              : null;

            const lastPurchase = lastNegotiation?.last_purchase_price || "-";
            const firstBid = q.FirstBidPrice || 0;
            const finalBid = q.grandTotalValue || 0;
            const saving = firstBid - finalBid || 0;

            const isAccepted =
              q.acceptedDetails?.accepted_at &&
              q.acceptedDetails?.accepted_airline === q.airline_name;

            const routes = [
              { route: q.route1, schedule: q.flight_schedule1 },
              { route: q.route2, schedule: q.flight_schedule2 },
              { route: q.route3, schedule: q.flight_schedule3 },
            ]
              .filter((r) => r.route || r.schedule)
              .map((r) => {
                const routeText = r.route || "-";
                const scheduleText = r.schedule
                  ? new Date(r.schedule).toLocaleDateString()
                  : "-";
                return `${routeText}\n${scheduleText}`;
              })
              .join("\n");

            const row = {
              Vendor: q.vendor_name || "-",
              Airline: q.airline_name || "-",
              Airport: q.airport || "-",
              "Chargeable Wt (kg)": q.chargeable_weight || "-",
              "Freight / Kg (INR)": q.base_rate || "-",
              "AMS (INR)": q.ams || "-",
              "PAC (INR)": q.pac || "-",
              "AWB (INR)": q.awb || "-",
              "Other (INR)": q.other_charges || "-",
              Currency: q.currency || "-",
              "DAP/DDP": q.dap_ddp_charges || "-",
              "Exchange Rate": q.exchangeRate || "-",
              "Transit Days": q.transit_days || "-",
              Routing: routes || "-",
              "Remark / Condition": q.remarks || "-",
              "Target Price": lastPurchase ? lastPurchase : "-",
              "Total Charges (INR)": finalBid
                ? parseFloat(finalBid).toFixed(2)
                : "-",
              "Total Saving": saving ? saving.toFixed(2) : "-",
              Rank: `L${index + 1}`,
              isAccepted: isAccepted ? "Yes" : "No",
            };

            return cols.map((col) => row[col]);
          });

        // 📄 Draw Combined Table
        doc.autoTable({
          startY: yPos,
          head: [allCols],
          body: buildRows(allCols),
          theme: "grid",
          styles: {
            fontSize: 8,
            cellPadding: 2,
            halign: "center",
            valign: "middle",
            lineColor: [200, 200, 200],
            overflow: "linebreak", // Wrap text
          },
          headStyles: {
            fillColor: [68, 114, 196],
            textColor: [255, 255, 255],
            fontStyle: "bold",
          },
          alternateRowStyles: { fillColor: [245, 245, 245] },
          margin: { top: 10, left: 10, right: 10 },
          tableWidth: "auto", // Fit table to page width
          showHead: "firstPage",
          didParseCell: (data) => {
            // Highlight top vendor (L1)
            if (data.cell.raw === "L1") {
              data.cell.styles.fillColor = [210, 255, 210];
            }
          },
        });

        return doc.lastAutoTable.finalY + 10;
      };

      // =========================
      // 🔹 Footer (Page Numbers)
      // =========================
      const addFooter = (pageNum, totalPages) => {
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth / 2, 290, {
          align: "center",
        });
      };

      // =========================
      // 🔹 Generate PDF Flow
      // =========================
      addHeader();
      currentY = addAuctionDetails();
      currentY = quotedatalatestFinal(currentY);

      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        addFooter(i, totalPages);
      }

      doc.save(`Auction_${auctionId}_Details.pdf`);
    };

    const allQuotesWithUniqueId = allQuotes.map((row, index) => ({
      ...row,
      uniqueId: `${row.vendor_id}_${index}`, // vendor + index to make unique
    }));

    return (
      <div className="mt-4">
        <h4 className="mb-3">✈️ All Shipment Quotes (Flat View)</h4>
        <div className="mb-3">
          <label htmlFor="invAmount">Invoice Amount (₹): </label>
          <input
            id="invAmount"
            type="number"
            value={invAmount || ""}
            onChange={(e) => setInvAmount(Number(e.target.value))}
            className="p-inputtext p-component"
            placeholder="Enter invoice amount"
          />
        </div>
        <div className="flex justify-content-between align-items-center mb-3">
          <h3>RFQ Quotes Summary</h3>
          <Button
            label="Download PDF"
            icon="pi pi-download"
            className="p-button-sm p-button-success"
            onClick={() => exportToPDF(allQuotes, rfq?.rfq_number)}
          />
        </div>
        <DataTable
          value={allQuotesWithUniqueId}
          responsiveLayout="scroll"
          className="p-datatable-sm"
          emptyMessage="No shipment quotes available"
          selection={selectedVendors}
          onSelectionChange={(e) => setSelectedVendors(e.value)}
          dataKey="uniqueId" // make sure vendor_id is unique in your data
          expandedRows={expandedRows}
          onRowToggle={(e) => setExpandedRows(e.data)}
          rowExpansionTemplate={rowExpansionTemplate}
        >
          <Column expander style={{ width: "3rem" }} />
          <Column selectionMode="multiple" headerStyle={{ width: "3rem" }} />
          <Column header="Vendor" body={(row) => row.vendor_name} />
          <Column header="Airline" body={(row) => row.airline_name || "-"} />
          <Column header="Airport" body={(row) => row.airport || "-"} />
          <Column
            header="Chargeable Wt"
            body={(row) => `${row.chargeable_weight || "-"} kg`}
          />
          <Column
            header="Freight (Rs/Kg)"
            body={(row) => row.base_rate || "-"}
          />
          <Column header="AMS" body={(row) => row.ams || "-"} />
          <Column header="PAC" body={(row) => row.pac || "-"} />
          <Column header="AWB" body={(row) => row.awb || "-"} />
          <Column header="DAP/DDP" body={(row) => row.dap_ddp_charges || "-"} />
          <Column header="Other" body={(row) => row.other_charges || "-"} />
          <Column
            header="First Bid Price"
            body={(row) => (
              <strong>₹ {parseFloat(row.FirstBidPrice).toFixed(2)}</strong>
            )}
          />
          <Column
            header="Final Bid Price"
            body={(row) => (
              <strong>₹ {parseFloat(row.grandTotalValue).toFixed(2)}</strong>
            )}
          />
          {/* <Column
            header="Last Purchace Price"
            body={(row) => (
              <strong>₹ {row.negotiation?.last_purchase_price}</strong>
            )}
          /> */}
          <Column
            header="Target Price"
            body={(row) => {
              if (
                !Array.isArray(row.negotiation) ||
                row.negotiation.length === 0
              )
                return <span>-</span>;

              // Filter negotiation entries that match current row airline_name
              const matchedNegotiation = row.negotiation.find(
                (n) =>
                  n.airline_name?.toLowerCase().trim() ===
                  row.airline_name?.toLowerCase().trim()
              );

              if (!matchedNegotiation) return <span>-</span>;

              return (
                <strong>
                  ₹ {matchedNegotiation.last_purchase_price || "N/A"}
                </strong>
              );
            }}
          />
          {/* <Column
            header="Total Saving"
            body={(row) => {
              const finalBid = row.grandTotalValue || 0;
              const lastPrice = row.negotiation?.last_purchase_price || 0;
              const saving = lastPrice ? lastPrice - finalBid : 0;
              return <strong>₹ {saving.toFixed(2)}</strong>;
            }}
          /> */}
          <Column
            header="Total Saving"
            body={(row) => {
              const finalBid = row.grandTotalValue || 0;

              // const matchedNegotiation = Array.isArray(row.negotiation)
              //   ? row.negotiation.find(
              //       (n) =>
              //         n.airline_name?.toLowerCase().trim() ===
              //         row.airline_name?.toLowerCase().trim()
              //     )
              //   : null;

              // if (!matchedNegotiation) return <span>-</span>;

              //const lastPrice = matchedNegotiation.last_purchase_price || 0;
              const saving =
                parseFloat(row.FirstBidPrice).toFixed(2) -
                parseFloat(finalBid).toFixed(2);

              return (
                <strong
                  className={saving > 0 ? "text-green-600" : "text-red-500"}
                >
                  ₹ {saving.toFixed(2)}
                </strong>
              );
            }}
          />

          <Column header="Percent %" body={(row) => row.percentage || "-"} />
          <Column
            header="Rank"
            body={(row) =>
              row.rank === "L1" ? (
                <span style={{ color: "green", fontWeight: "bold" }}>
                  {row.rank}
                </span>
              ) : (
                row.rank || "-"
              )
            }
          />
          <Column
            header="Status"
            body={(row) => {
              // Condition 1: Vendor Accepted by Buyer
              const isAccepted =
                row.acceptedDetails?.accepted_at &&
                row.acceptedDetails?.accepted_airline === row.airline_name;

              // Condition 2: HOD Approval Pending
              const isHodApprovalPending =
                row.hodAcceptRequestDetails?.accepted_at &&
                row.hodAcceptRequestDetails?.requested_airline ===
                  row.airline_name;

              // Condition 3: HOD Approved
              const isHodApproved =
                row.hodAcceptRequestDetails?.hod_approved_on &&
                row.hodAcceptRequestDetails?.requested_airline ===
                  row.airline_name;

              // Condition 4: HOD Approved
              const isHodRejected =
                row.hodAcceptRequestDetails?.hod_rejected_on &&
                row.hodAcceptRequestDetails?.requested_airline ===
                  row.airline_name;

              if (isAccepted) {
                return (
                  <span
                    style={{
                      color: "green",
                      fontWeight: "bold",
                      fontSize: "1.8rem",
                    }}
                  >
                    🏆
                  </span>
                );
              }

              if (
                isHodApprovalPending &&
                role === "user" &&
                !isHodApproved &&
                !isHodRejected
              ) {
                return (
                  <span
                    style={{
                      color: "#e67e22",
                      fontWeight: "bold",
                      fontSize: "1.8rem",
                    }}
                    title="HOD Approval Pending"
                  >
                    ⏳
                  </span>
                );
              }

              if (isHodApproved) {
                return (
                  <span
                    style={{
                      color: "green",
                      fontWeight: "bold",
                      fontSize: "1.8rem",
                    }}
                    title="HOD Approved"
                  >
                    ✅
                  </span>
                );
              }

              if (isHodRejected) {
                return (
                  <span
                    style={{
                      color: "red",
                      fontWeight: "bold",
                      fontSize: "0.7rem",
                    }}
                    title="HOD Rejected"
                  >
                    ❌ Rejected
                  </span>
                );
              }

              if (isHodApprovalPending && role === "hod") {
                return (
                  <div className="flex gap-2 justify-center">
                    <Button
                      icon="pi pi-check"
                      className="p-button-success p-button-rounded p-button-sm"
                      tooltip="Approve"
                      style={{ width: "1.5rem", height: "1.5rem", padding: 0 }}
                      onClick={() =>
                        openConfirmModal(
                          "hod_approved",
                          row.rfq_number || rfq.rfq_number,
                          row.vendor_id,
                          row.airline_name
                        )
                      }
                    />

                    <Button
                      icon="pi pi-times"
                      className="p-button-danger p-button-rounded p-button-sm"
                      tooltip="Reject"
                      style={{ width: "1.5rem", height: "1.5rem", padding: 0 }}
                      onClick={() =>
                        openConfirmModal(
                          "hod_rejected",
                          row.rfq_number || rfq.rfq_number,
                          row.vendor_id,
                          row.airline_name
                        )
                      }
                    />
                  </div>
                );
              }

              return "-";
            }}
          />
        </DataTable>
      </div>
    );
  };

  return (
    <div className="p-4">
      <h3 className="mb-2">
        Quote Summary - {rfq?.rfq_number}{" "}
        <span className="text-gray-500 text-sm">({rfq?.title})</span>
      </h3>

      <div className="flex justify-content-between align-items-center mb-3">
        <ToggleButton
          onLabel="Per Item L1/L2 View"
          offLabel="Total L1/L2 View"
          onIcon="pi pi-eye"
          offIcon="pi pi-eye-slash"
          checked={viewItemLevel}
          onChange={(e) => setViewItemLevel(e.value)}
        />

        <Button
          label={
            isFlatView
              ? "🔀 Show Shipment-wise Table"
              : "📋 Show Vendor-Wise Pivot View"
          }
          icon="pi pi-exchange"
          onClick={() => setIsFlatView((prev) => !prev)}
          className="mb-3"
        />

        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <input
            type="text"
            placeholder="Search"
            className="p-inputtext p-component"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
        </span>
      </div>

      <Panel
        header={`${rfq?.title || ""} (${rfq?.rfq_number})`}
        toggleable
        collapsed={false}
      >
        <p className="mb-3 text-sm text-gray-600">{rfq?.description}</p>

        {!rfq?.isShipmentBased && (
          <>
            {!viewItemLevel
              ? vendorTable
              : rfq.rfq_items?.length
              ? itemLevelL1L2Table()
              : roadTransportL1L2Table()}
            {packageQuoteL1L2Table()}
          </>
        )}

        {/* {shipmentWiseQuoteTable()} */}
        {isFlatView ? shipmentLevelL1L2Table() : shipmentWiseQuoteTable()}

        {/* {hodQuote && (
          <div className="p-3 bg-yellow-100 border border-yellow-400 rounded mt-3">
            <strong>HOD Approval Requested For:</strong>{" "}
            {hodQuote.hodAcceptRequestDetails.requested_airline}
            <br />
            <strong>Requested On:</strong>{" "}
            {hodQuote.hodAcceptRequestDetails.accepted_at}
            <br />
            <strong>Reason:</strong> {hodQuote.hodAcceptRequestDetails.remarks}
          </div>
        )} */}

        <div className="mt-4 flex flex-wrap gap-3 justify-content-end">
          {role !== "hod" && (
            <Button
              label="Send For HOD Approval"
              className="p-button-info p-button-sm"
              onClick={() => setShowHodApprovalDialog(true)}
              disabled={selectedVendors.length === 0}
            />
          )}

          {/* {hodQuote && ( */}
          <div>
            <Button
              label="✅ Accept Quote"
              className="p-button-success p-button-sm"
              //onClick={() => handleAction("accept_l1", rfq.rfq_number)}
              onClick={() => setShowAcceptDialog(true)}
              disabled={selectedVendors.length === 0}
            />
            <Button
              label="✏️ Negotiate"
              className="p-button-warning p-button-sm"
              //onClick={() => handleAction("negotiate", rfq.rfq_number)}
              onClick={() => setShowNegotiateDialog(true)}
              //onClick={() => setShowAcceptDialog(true)}
              disabled={selectedVendors.length === 0}
            />
          </div>
          {/* )} */}

          {/* <Button
            label="⚖️ Move to Auction"
            className="p-button-info p-button-sm"
            onClick={() => handleAction("auction", rfq.rfq_number)}
          />
          <Button
            label="❌ Reject All"
            className="p-button-danger p-button-sm"
            onClick={() => handleAction("reject", rfq.rfq_number)}
          /> */}
        </div>
      </Panel>

      {/* <Dialog
        header="Send Negotiation Request"
        visible={showNegotiationDialog}
        onHide={() => setShowNegotiationDialog(false)}
        style={{ width: "35vw" }}
      >
        <div className="mb-3">
          <h5>Select Vendors</h5>
          {rfq?.vendors?.map((v) => (
            <div key={v.vendor_id} className="mb-2">
              <Checkbox
                inputId={`vendor-${v.vendor_id}`}
                value={v.vendor_id}
                onChange={(e) => {
                  const selected = [...selectedVendors];
                  if (e.checked) selected.push(e.value);
                  else
                    selected.splice(
                      selected.findIndex((id) => id === e.value),
                      1
                    );
                  setSelectedVendors(selected);
                }}
                checked={selectedVendors.includes(v.vendor_id)}
              />
              <label htmlFor={`vendor-${v.vendor_id}`} className="ml-2">
                {v.vendor_name}
              </label>
            </div>
          ))}
        </div>
        <div className="mb-3">
          <label>Target Price</label>
          <InputNumber
            value={lastPurchasePrice}
            onValueChange={(e) => setLastPurchasePrice(e.value)}
            mode="decimal"
            placeholder="Enter price"
            className="w-full"
          />
        </div>

        <div className="mb-3">
          <label>Remarks</label>
          <InputTextarea
            rows={3}
            value={negotiationRemarks}
            onChange={(e) => setNegotiationRemarks(e.target.value)}
            placeholder="Your message..."
            className="w-full"
          />
        </div>

        <div className="flex justify-content-end gap-2">
          <Button
            label="Send"
            className="p-button-sm p-button-warning"
            onClick={submitNegotiation}
            //disabled={selectedVendors.length === 0}
          />
          <Button
            label="Cancel"
            className="p-button-secondary p-button-sm"
            onClick={() => setShowNegotiationDialog(false)}
          />
        </div>
      </Dialog> */}
      <Dialog
        header="HOD Decision"
        visible={showHODDecisionDialog}
        onHide={() => setShowHODDecisionDialog(false)}
        style={{ width: "35vw" }}
      >
        <div className="mb-3">
          <label>Remarks</label>
          <InputTextarea
            rows={3}
            value={acceptRemarks}
            onChange={(e) => setAcceptRemarks(e.target.value)}
            placeholder="Enter remarks..."
            className="w-full"
          />
        </div>

        <div className="flex justify-content-end gap-2">
          <Button
            label="Submit"
            className="p-button-sm p-button-success"
            onClick={async () => {
              await postData("quotesummary/update-rfq-status", {
                rfq_number: rfq.rfq_number,
                action: dialogParams.actionType,
                vendors: [dialogParams.vendor_id],
                requestedAirline: [dialogParams.airline_name],
                hod_msg: acceptRemarks,
                hod_name: user?.name || "",
                hod_email: user?.email || "",
              });
              dispatch(
                toastSuccess({
                  detail: "HOD Approval successfully!",
                })
              );
              setShowHODDecisionDialog(false);
              //setSelectedVendors([]);
              setAcceptRemarks("");
              fetchSummary();
            }}
          />
          <Button
            label="Cancel"
            className="p-button-secondary p-button-sm"
            onClick={() => setShowHodApprovalDialog(false)}
          />
        </div>
      </Dialog>
      <Dialog
        header="Request HOD Approval"
        visible={showHodApprovalDialog}
        onHide={() => setShowHodApprovalDialog(false)}
        style={{ width: "35vw" }}
      >
        <div className="mb-3">
          <label>
            <strong>Select HOD</strong>
          </label>
          <Dropdown
            value={selectedHod}
            options={hodUsers?.map((user) => ({
              label: `${user.name} (${user.email})`,
              value: user,
            }))}
            onChange={(e) => setSelectedHod(e.value)}
            placeholder="Select HOD"
            className="w-full"
            optionLabel="label"
            filter
          />
        </div>

        <div className="mb-3">
          <h5>Selected Vendors</h5>
          {selectedVendors.map((v) => (
            <div key={v.vendor_id} className="mb-2">
              <i className="pi pi-user mr-2" />
              <strong>{v.vendor_name}</strong> — {v.airline_name || "N/A"}
            </div>
          ))}
        </div>

        <div className="mb-3">
          <label>Remarks</label>
          <InputTextarea
            rows={3}
            value={acceptRemarks}
            onChange={(e) => setAcceptRemarks(e.target.value)}
            placeholder="Enter remarks..."
            className="w-full"
          />
        </div>

        <div className="flex justify-content-end gap-2">
          <Button
            label="Request Approval"
            className="p-button-sm p-button-success"
            onClick={async () => {
              await postData("quotesummary/update-rfq-status", {
                rfq_number: rfq.rfq_number,
                action: "requested_hod_approval",
                vendors: selectedVendors.map((v) => v.vendor_id),
                requestedAirline: selectedVendors.map((v) => v.airline_name),
                remarks: acceptRemarks,
                hod_name: selectedHod?.name || "",
                hod_email: selectedHod?.email || "",
              });
              dispatch(
                toastSuccess({
                  detail: "Requested for HOD Approval successfully!",
                })
              );
              setShowHodApprovalDialog(false);
              setSelectedVendors([]);
              setAcceptRemarks("");
              fetchSummary();
            }}
          />
          <Button
            label="Cancel"
            className="p-button-secondary p-button-sm"
            onClick={() => setShowHodApprovalDialog(false)}
          />
        </div>
      </Dialog>
      <Dialog
        header="Accept Quote"
        visible={showAcceptDialog}
        onHide={() => setShowAcceptDialog(false)}
        style={{ width: "35vw" }}
      >
        <div className="mb-3">
          <h5>Selected Vendors</h5>
          {selectedVendors.map((v) => (
            <div key={v.vendor_id} className="mb-2">
              <i className="pi pi-user mr-2" />
              <strong>{v.vendor_name}</strong> — {v.airline_name || "N/A"}
            </div>
          ))}
        </div>

        <div className="mb-3">
          <label>Remarks</label>
          <InputTextarea
            rows={3}
            value={acceptRemarks}
            onChange={(e) => setAcceptRemarks(e.target.value)}
            placeholder="Enter remarks..."
            className="w-full"
          />
        </div>

        <div className="flex justify-content-end gap-2">
          <Button
            label="Accept"
            className="p-button-sm p-button-success"
            onClick={async () => {
              await postData("quotesummary/update-rfq-status", {
                rfq_number: rfq.rfq_number,
                action: "accept_l1",
                vendors: selectedVendors.map((v) => v.vendor_id),
                acceptedAirline: selectedVendors.map((v) => v.airline_name),
                remarks: acceptRemarks,
              });
              dispatch(
                toastSuccess({ detail: "Accepted Quote successfully!" })
              );
              setShowAcceptDialog(false);
              setSelectedVendors([]);
              setAcceptRemarks("");
              fetchSummary();
            }}
          />
          <Button
            label="Cancel"
            className="p-button-secondary p-button-sm"
            onClick={() => setShowAcceptDialog(false)}
          />
        </div>
      </Dialog>
      <Dialog
        header="Send Negotiation Request"
        visible={showNegotiateDialog}
        onHide={() => setShowNegotiateDialog(false)}
        style={{ width: "35vw" }}
      >
        <div className="mb-3">
          <h5>Selected Vendors</h5>
          {selectedVendors.map((v) => (
            <div key={v.vendor_id} className="mb-2">
              <i className="pi pi-user mr-2" />
              <strong>{v.vendor_name}</strong> — {v.airline_name || "N/A"} —{" "}
              {v.airport || "N/A"}
            </div>
          ))}
        </div>

        <div className="mb-3">
          <label>Target Price</label>
          <InputNumber
            value={lastPurchasePrice}
            onValueChange={(e) => setLastPurchasePrice(e.value)}
            mode="decimal"
            placeholder="Enter price"
            className="w-full"
          />
        </div>

        <div className="mb-3">
          <label>Remarks</label>
          <InputTextarea
            rows={3}
            value={negotiationRemarks}
            onChange={(e) => setNegotiationRemarks(e.target.value)}
            placeholder="Enter remarks..."
            className="w-full"
          />
        </div>

        <div className="flex justify-content-end gap-2">
          <Button
            label="Send"
            className="p-button-sm p-button-success"
            onClick={async () => {
              // await postData("quotesummary/update-rfq-status", {
              //   rfq_number: rfq.rfq_number,
              //   action: "accept_l1",
              //   vendors: selectedVendors.map((v) => v.vendor_id),
              //   acceptedAirline: selectedVendors.map((v) => v.airline_name),
              //   remarks: acceptRemarks,
              // });
              submitNegotiation();
              dispatch(
                toastSuccess({ detail: "Negotiated Quote successfully!" })
              );
              setShowNegotiateDialog(false);
              setSelectedVendors([]);
              setNegotiationRemarks("");
              fetchSummary();
            }}
          />
          <Button
            label="Cancel"
            className="p-button-secondary p-button-sm"
            onClick={() => setShowNegotiateDialog(false)}
          />
        </div>
      </Dialog>
    </div>
  );
};

export default ViewQuote;
