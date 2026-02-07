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
import { all } from "axios";
import { Card } from "primereact/card";
import { formatDate } from "../../utils/local";
import Buyer from "./Buyer";
import { v4 as uuidv4 } from "uuid";
import { FilterMatchMode } from "primereact/api";
import { ColumnGroup } from "primereact/columngroup";
import { Row } from "primereact/row";
import { BASE_URL, API_URL } from "../../constants";

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

  const [isFlatView, setIsFlatView] = useState(true);
  const [invAmount, setInvAmount] = useState(null);
  const [exchangeRate, setExchangeRate] = useState(null);
  const [shipmentValue, setShipmentValue] = useState(null);

  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const [showHodApprovalDialog, setShowHodApprovalDialog] = useState(false);

  const [showShareToMarketTeamDialog, setShowShareToMarketTeamDialog] =
    useState(false);

  const [showHODDecisionDialog, setShowHODDecisionDialog] = useState(false);
  const [showNegotiateDialog, setShowNegotiateDialog] = useState(false);
  const [showAuctionDialog, setShowAuctionDialog] = useState(false);
  const [acceptRemarks, setAcceptRemarks] = useState("");
  const [expandedRows, setExpandedRows] = useState(null);

  const [hodAttachment, setHodAttachment] = useState(null);

  const [dialogParams, setDialogParams] = useState(null);

  const [attachment, setAttachment] = useState(null);

  const usersdata = useSelector((state) => state.users.data);
  const hodUsers = Array.isArray(usersdata.users)
    ? usersdata.users.filter((u) => u.role === "hod")
    : [];
  const marketingUsers = Array.isArray(usersdata.users)
    ? usersdata.users.filter((u) => u.role === "marketing")
    : [];
  //console.log("hodUsers in View Quote:", hodUsers);
  const [selectedHod, setSelectedHod] = useState(null);
  const [marketingHead, setMarketingHead] = useState(null);
  const [marketingRemarks, setMarketingRemarks] = useState("");
  const [marketingReviewStatus, setMarketingReviewStatus] = useState(false);

  const [rolesckt, setRole] = useState(null);
  const [userId, setUserId] = useState(uuidv4().slice(0, 8));

  const [filteredQuotes, setFilteredQuotes] = useState(null);
  const [visibleRows, setVisibleRows] = useState([]);

  const [auctionData, setAuctionData] = useState(null);

  const openConfirmModal = (actionType, rfqNumber, vendor_id, airline_name) => {
    setDialogParams({ actionType, rfqNumber, vendor_id, airline_name });
    setShowHODDecisionDialog(true);
  };

  useEffect(() => {
    fetchSummary();
    fetchAuctionData();
  }, [rfqNumber]);

  useEffect(() => {
    if (rfq?.value_of_shipment != null && shipmentValue === null) {
      setShipmentValue(Number(rfq.value_of_shipment));
    }
  }, [rfq]);

  const footerGroup = (
    <ColumnGroup>
      <Row>
        {/* Empty columns to align Invoice under Final Bid Price */}
        <Column footer="" colSpan={12} />

        <Column
          footer={
            <strong style={{ color: "#0f5132", fontSize: "1.1rem" }}>
              Total:
            </strong>
          }
          footerStyle={{ textAlign: "right" }}
        />

        <Column
          footer={
            <strong style={{ color: "#0f5132", fontSize: "1.1rem" }}>
              ₹ {invAmount?.toFixed(2)}
            </strong>
          }
          footerStyle={{ textAlign: "right" }}
        />

        {/* Remaining columns (Target, Saving, %, Rank etc.) */}
        <Column footer="" colSpan={8} />
      </Row>
    </ColumnGroup>
  );

  useEffect(() => {
    if (!rfq?.shipments) return;

    console.log("visibleRows changed:", visibleRows);

    // 🔹 Case 1: Table has visible rows (filters / sorting applied)
    if (Array.isArray(visibleRows) && visibleRows.length > 0) {
      visibleRows.map((row) => {
        if (Array.isArray(visibleRows) && visibleRows.length > 0) {
          const hasExchangeRate = !!exchangeRate;

          const total = visibleRows.reduce((sum, row) => {
            const computedGrandTotal =
              Number(row.chargeable_weight || 0) * Number(row.base_rate || 0) +
              Number(row.ams || 0) +
              Number(row.pac || 0) +
              Number(row.awb || 0) +
              Number(row.other_charges || 0) +
              Number(row.dap_ddp_charges || 0) * Number(exchangeRate);

            const finalGrandTotal = hasExchangeRate
              ? computedGrandTotal
              : Number(row.grandTotalValue || 0);

            return sum + finalGrandTotal;
          }, 0);

          console.log("Calculated invAmount with filters:", total);
          setInvAmount(total);
          return; // ⛔ stop further execution
        }
      });

      // const total = visibleRows.reduce(
      //   (sum, row) => sum + Number(row.grandTotalValue || 0),
      //   0
      // );
      // console.log("Calculated invAmount with filters:", total);
      // setInvAmount(total);
      // return; // ⛔ stop here
    } else {
      // 🔹 Case 2: No filters → full data
      const total = rfq.shipments
        .flatMap((s) => s.quotes || [])
        .reduce((sum, q) => sum + Number(q.grandTotalValue || 0), 0);

      setInvAmount(total);
    }
  }, [rfq, exchangeRate, visibleRows]);

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

  const fetchAuctionData = async () => {
    try {
      const response = await getData(`rfqs/${rfqNumber}`, {});
      setAuctionData(response?.rfqRecord?.data?.auction_data || null);
    } catch (error) {}
  };

  const now = new Date();

  const isScheduledAuction =
    auctionData?.startTime && new Date(auctionData.startTime) > now;

  const handleAuctionUpdated = () => {
    setTimeout(() => {
      fetchSummary();
    }, 8000);
  };

  const isAuctionEnded = React.useMemo(() => {
    if (!auctionData?.endTime) return false;

    return Date.now() > new Date(auctionData.endTime).getTime();
  }, [auctionData]);

  const auctionActionLabel = React.useMemo(() => {
    if (!auctionData) return "🏆 Conduct Auction";
    if (isAuctionEnded) return "📊 Auction Details";
    return "Auction Details";
  }, [auctionData, isAuctionEnded]);

  const hodQuote = rfq?.shipments
    ?.flatMap((s) => s.quotes) // merge all quotes from all shipments
    ?.find((q) => q.hodAcceptRequestDetails.status === "hod_rejected");

  console.log("hodQuote", hodQuote);

  const [filters, setFilters] = useState({
    airline_name: { value: null, matchMode: FilterMatchMode.EQUALS },
  });

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
        toastSuccess({ detail: "Negotiation request sent successfully!" }),
      );
      setShowNegotiationDialog(false);
      setSelectedVendors([]);
      setNegotiationRemarks("");
      fetchSummary();
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
            (pq) => pq.item_name === pkgType,
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
            (s) => s.vendor_name === v.vendor_name,
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
            ]),
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
      (v) => v.negotiation && Object.keys(v.negotiation).length > 0,
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
        },
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

    const computedInvoiceAmount = 0;

    const allQuotes =
      rfq?.shipments?.flatMap((shipment) => {
        return (
          shipment.quotes?.map((quote) => {
            const hasExchangeRate = !!exchangeRate;
            const hasShipmentValue = !!shipmentValue;

            const computedGrandTotal =
              Number(quote.chargeable_weight || 0) *
                Number(quote.base_rate || 0) +
              Number(quote.ams || 0) +
              Number(quote.pac || 0) +
              Number(quote.awb || 0) +
              Number(quote.other_charges || 0) +
              Number(quote.dap_ddp_charges || 0) * Number(exchangeRate);

            const finalGrandTotal = hasExchangeRate
              ? computedGrandTotal
              : Number(quote.grandTotalValue || 0);

            const baseAmount = hasShipmentValue ? shipmentValue : invAmount;

            const percent = baseAmount
              ? (finalGrandTotal / baseAmount) * 100
              : null;

            return {
              ...quote,
              ...(hasExchangeRate && { grandTotalValue: finalGrandTotal }), // 🔥 ONLY when exchangeRate exists
              percentage: percent ? Math.round(percent) : null,
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

      // Get the accepted vendor saving
      let acceptedSaving = "N/A";

      try {
        const acceptedRow = allQuotes.find(
          (q) =>
            q.acceptedDetails?.accepted_at &&
            q.acceptedDetails?.accepted_airline === q.airline_name,
        );

        if (acceptedRow) {
          const firstBid = acceptedRow.FirstBidPrice || 0;
          const finalBid = acceptedRow.grandTotalValue || 0;
          const savingValue = firstBid - finalBid;

          acceptedSaving = ` ${savingValue.toLocaleString("en-IN")} `;
        }
      } catch (err) {
        console.error("Saving calc error:", err);
      }

      const l1Quote = [...allQuotes]
        .map((q) => {
          const firstBid = q.FirstBidPrice || 0;
          const finalBid = q.grandTotalValue || 0;
          const saving = firstBid - finalBid;

          return {
            vendor_name: q.vendor_name,
            finalBid,
            saving,
          };
        })
        .sort((a, b) => a.finalBid - b.finalBid)[0]; // Smallest Final Bid = L1

      const L1TotalSavings = l1Quote ? l1Quote.saving.toFixed(2) : "N/A";

      //console.log("l1TotalSavings", L1TotalSavings);

      const {
        auctionId = rfq?.rfq_number || "N/A",
        auctionTitle = rfq?.title || "N/A",
        auctionType = rfq?.type || "N/A",
        country = rfq?.country || "N/A",
        subindustry = rfq?.subindustry || "N/A",
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

      acceptedSaving = acceptedSaving || "N/A";
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
        //doc.setFont("helvetica", "normal");

        const details = [
          ["Auction ID", auctionId, true],
          ["Auction Title", auctionTitle, true],
          ["Auction Type", auctionType],
          ["Country", country],
          ["Industry", subindustry],
          ["Hide Current Bid Price", hideCurrentBid],
          ["Test eAuction", testAuction],
          ["Description", description],
          ["__SPACER__", ""],
          ["Auction Created Date & Time", createdDate],
          ["Auction Open Date & Time", openDate],
          ["Auction Close Date & Time", closeDate],
          ["Total Saving - INR ", L1TotalSavings, true],
        ];

        details.forEach(([label, value, isBold]) => {
          if (label === "__SPACER__") {
            currentY += 10; // top margin
            return;
          }

          // Wrap long text properly
          const labelText = `${label}:`;
          const wrappedValue = doc.splitTextToSize(
            value?.toString() || "",
            maxTextWidth,
          );

          if (isBold) doc.setFont("helvetica", "bold");
          else doc.setFont("helvetica", "normal");

          // Draw label
          doc.text(labelText, marginLeft, currentY);
          // Draw wrapped value, one or multiple lines
          doc.setFont("helvetica", "normal");
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
                    n.airline_name === q.airline_name,
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

      const addSummaryBidSection = (startY) => {
        let y = startY;
        const pageWidth = doc.internal.pageSize.getWidth();

        // ==========================
        //  SECTION: SUMMARY TITLE
        // ==========================
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Summary Sheet of Bid", 20, y);
        y += 10;

        // ==========================
        //  EXTRACT SUMMARY ROWS
        // ==========================
        const summaryRows = allQuotes.map((q, i) => {
          const finalBid = q.grandTotalValue || 0;
          const firstBid = q.FirstBidPrice || 0;
          const saving = firstBid - finalBid;

          return {
            sr_no: i + 1,
            supplier: q.vendorName || q.vendor_name || q.vendor || "-",
            airline: q.airline_name || "-",
            transit: q.transit_days || "-",
            final_price: finalBid.toFixed(2),
            saving: saving.toFixed(2),
            position: q.acceptedDetails?.position || "",
          };
        });

        // Sort by savings for L1, L2, L3
        summaryRows.sort((a, b) => b.saving - a.saving);
        summaryRows.forEach((r, index) => {
          r.position = `L${index + 1}`;
        });

        // ==========================
        //  SUMMARY TABLE
        // ==========================
        doc.autoTable({
          startY: y,
          head: [
            [
              "Sr No",
              "Supplier",
              "Airline",
              "Transit Time",
              "Final Bid Price (INR)",
              "Saving (INR)",
              "Position",
            ],
          ],
          body: summaryRows.map((r) => [
            r.sr_no,
            r.supplier,
            r.airline,
            r.transit,
            r.final_price,
            r.saving,
            r.position,
          ]),
          styles: { fontSize: 9, cellPadding: 3 },
          headStyles: {
            halign: "center",
            fillColor: [230, 230, 230],
            textColor: 20,
            fontStyle: "bold",
          },
          alternateRowStyles: { fillColor: [245, 245, 245] },
          margin: { left: 20, right: 20 },
          didDrawPage: (data) => {
            y = data.cursor.y + 10;
          },
        });

        return y;
      };

      const extractAuctionActivity = (auctionData = {}) => {
        const invited = Array.isArray(auctionData.invited)
          ? auctionData.invited
          : [];

        const users = auctionData.users ? Object.values(auctionData.users) : [];

        const vendors = users.filter((u) => u.role === "vendor");

        const bids = auctionData.bids || {};
        const ranks = auctionData.ranks || {};

        const participated = vendors.filter((v) => bids[v.id]);

        const winnerId = Object.entries(ranks).find(
          ([, rank]) => rank === 1,
        )?.[0];

        return {
          invited,
          participated,
          bids,
          ranks,
          winnerId,
        };
      };

      const addAuctionActivitySection = (startY, auctionData) => {
        let y = startY;

        const { invited, participated, bids, ranks, winnerId } =
          extractAuctionActivity(auctionData);

        // ==========================
        // 🔹 Section Title
        // ==========================
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text("Auction Activity Summary", 20, y);
        y += 10;

        // ==========================
        // 📅 Auction Timeline
        // ==========================
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");

        doc.text(
          `Auction Number : ${auctionData?.auction_number || "N/A"}`,
          20,
          y,
        );
        y += 6;

        doc.text(
          `Auction Mode : ${(auctionData?.mode || "").toUpperCase()}`,
          20,
          y,
        );
        y += 6;

        doc.text(
          `Start Time : ${new Date(auctionData.startTime).toLocaleString()}`,
          20,
          y,
        );
        y += 6;

        doc.text(
          `End Time : ${new Date(auctionData.endTime).toLocaleString()}`,
          20,
          y,
        );
        y += 10;

        // ==========================
        // 📨 Invited Vendors Table
        // ==========================
        doc.setFont("helvetica", "bold");
        doc.text("Invited Vendors", 20, y);
        y += 6;

        doc.autoTable({
          startY: y,
          head: [["Email"]],
          body: invited.map((email) => [email]),
          theme: "grid",
          styles: { fontSize: 9, cellPadding: 3 },
          headStyles: {
            fillColor: [68, 114, 196],
            textColor: 255,
            fontStyle: "bold",
          },
          margin: { left: 20, right: 20 },
        });

        y = doc.lastAutoTable.finalY + 10;

        // ==========================
        // ✅ Participated Vendors
        // ==========================
        doc.setFont("helvetica", "bold");
        doc.text("Participated Vendors", 20, y);
        y += 6;

        doc.autoTable({
          startY: y,
          head: [["Vendor Name", "Company", "Bid Amount", "Bid Time", "Rank"]],
          body: participated.map((v) => [
            v.name || "-",
            v.company || "-",
            bids[v.id]?.bid ?? "-",
            bids[v.id]?.time ? new Date(bids[v.id].time).toLocaleString() : "-",
            ranks[v.id] ? `L${ranks[v.id]}` : "-",
          ]),
          theme: "grid",
          styles: {
            fontSize: 9,
            cellPadding: 3,
            halign: "center",
          },
          headStyles: {
            fillColor: [68, 114, 196],
            textColor: 255,
            fontStyle: "bold",
          },
          alternateRowStyles: { fillColor: [245, 245, 245] },
          margin: { left: 20, right: 20 },
          didParseCell: (data) => {
            if (data.cell.raw === "L1") {
              data.cell.styles.fillColor = [210, 255, 210];
            }
          },
        });

        y = doc.lastAutoTable.finalY + 10;

        // ==========================
        // 🏆 Winner Summary
        // ==========================
        if (winnerId) {
          const winner = participated.find((v) => v.id === winnerId);

          doc.setFont("helvetica", "bold");
          doc.text("Auction Winner", 20, y);
          y += 6;

          doc.setFont("helvetica", "normal");
          doc.text(
            `Winner : ${winner?.name || "-"} (${winner?.company || "-"})`,
            20,
            y,
          );
          y += 6;

          doc.text(`Winning Bid : ${bids[winnerId]?.bid ?? "-"}`, 20, y);
          y += 10;
        }

        return y;
      };

      const generalDetails = {
        eximMode: rfq?.eximMode || "N/A",
        movementType: rfq?.movement_type || "N/A",
        incoterm: rfq?.incoterm_exp_air || "N/A",
        originAirport: rfq?.origin_airport || "N/A",
        originAddress: rfq?.origin_address || "N/A",
        stuffing: rfq?.stuffing_location || "N/A",
        destinationAirport: rfq?.destination_airport || "N/A",
        destinationAddress: rfq?.destination_address || "N/A",
        destuffing: rfq?.destuffing_location || "N/A",
        totalWeight: rfq?.totalGrossWeight + "KG",
        totalVolumetric: rfq?.totalVolumetricWeight + "KG",
        valueShipment: "INR" + rfq?.value_of_shipment || "N/A",
        cargoType: "N/A",
        materialType: rfq?.material || "N/A",
        hsCode: rfq?.hs_code || "N/A",
        additionalDetails: "N/A",
        volumetricFactor: rfq?.volumetricFactor || "N/A",
      };

      const addGeneralDetails = (startY) => {
        let y = startY;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text("General Details", 20, y);
        y += 8;

        const rows = [
          [
            `Exim Mode : ${generalDetails.eximMode || "-"}`,
            `Movement Type : ${generalDetails.movementType || "-"}`,
            `Incoterm : ${generalDetails.incoterm || "-"}`,
          ],
          [
            `Origin Airport : ${generalDetails.originAirport || "-"}`,
            `Origin Address : ${generalDetails.originAddress || "-"}`,
            `Stuffing Location : ${generalDetails.stuffing || "-"}`,
          ],
          [
            `Destination Airport : ${generalDetails.destinationAirport || "-"}`,
            `Destination Address : ${generalDetails.destinationAddress || "-"}`,
            `DeStuffing Location : ${generalDetails.destuffing || "-"}`,
          ],
          [
            `Total Weight ( In Unit ) : ${generalDetails.totalWeight || "-"}`,
            `Total Volumetric Weight : ${
              generalDetails.totalVolumetric || "-"
            }`,
            `Value of Shipment : ${generalDetails.valueShipment || "-"}`,
          ],
          [
            `Cargo Type : ${generalDetails.cargoType || "-"}`,
            `Material Type : ${generalDetails.materialType || "-"}`,
            `HS Code : ${generalDetails.hsCode || "-"}`,
          ],
          [
            {
              content: `Additional Details : ${
                generalDetails.additionalDetails || "-"
              }`,
              colSpan: 3,
            },
          ],
          [
            {
              content: `* Volumetric Weight Factor considered as : : ${
                generalDetails.volumetricFactor || "-"
              }`,
              colSpan: 3,
            },
          ],
        ];

        doc.autoTable({
          startY: y,
          head: [],
          body: rows,
          theme: "grid",
          styles: {
            fontSize: 9,
            valign: "middle",
            halign: "left",
            cellPadding: 3,
          },
          tableLineColor: [0, 0, 0],
          tableLineWidth: 0.2,
          margin: { left: 20, right: 20 },
          columnStyles: {
            0: { cellWidth: 180 / 3 },
            1: { cellWidth: 180 / 3 },
            2: { cellWidth: 180 / 3 },
          },
        });

        return doc.lastAutoTable.finalY + 10;
      };

      const containerDatat =
        rfq?.package_summary?.packages?.map((pkg) => ({
          packages: `${pkg.number || 0} ${pkg.type || "Packages"}`,
          dimension: `${pkg.length || 0} x ${pkg.breadth || 0} x ${
            pkg.height || 0
          } ${pkg.dim_unit?.toUpperCase() || ""}`,
          gross_weight: `${pkg.gross_weight || 0} ${
            pkg.weight_unit?.toUpperCase() || ""
          }`,
          charges: "Air Freight",
        })) || [];

      const containerData = [
        {
          packages: "12 Cartons",
          dimension: "37 x 36.5 x 26.5 CM",
          gross_weight: "13.13 KG",
          charges: "Air Freight",
        },
        {
          packages: "9 Cartons",
          dimension: "37 x 36.5 x 26.5 CM",
          gross_weight: "13.235 KG",
          charges: "Air Freight",
        },
      ];

      const addContainerAndCharges = (currentY, doc, data) => {
        // Section Title
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Container & Charges", 14, currentY);
        currentY += 8;

        // Table Headers
        const headers = [
          "No. of Packages",
          "Dimension",
          "Gross Weight / Package",
          "Charges",
        ];

        const columnWidths = [50, 70, 60, 40];
        let x = 14;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);

        headers.forEach((h, index) => {
          doc.text(h, x, currentY);
          x += columnWidths[index];
        });

        currentY += 8;
        doc.setLineWidth(0.5);

        // Draw header line
        doc.line(14, currentY, 200, currentY);

        // Table Rows
        doc.setFont("helvetica", "normal");

        data.forEach((row) => {
          let xPos = 14;
          currentY += 8;

          doc.text(row.packages, xPos, currentY); // No. of Packages
          xPos += columnWidths[0];

          doc.text(row.dimension, xPos, currentY); // Dimension
          xPos += columnWidths[1];

          doc.text(row.gross_weight, xPos, currentY); // Gross Weight / Package
          xPos += columnWidths[2];

          doc.text(row.charges, xPos, currentY); // Charges

          // Row underline
          currentY += 3;
          doc.line(14, currentY, 200, currentY);
        });

        return currentY + 10;
      };

      const quotedatalatestFinalNew = (startY) => {
        let yPos = startY;
        const topQuotes = allQuotes; // all vendors

        // 🧩 Combine all columns from all 3 tables
        const allCols = [
          "Vendor",
          "Airline",
          "Transit Days",
          "Final Bid Price",
          "Percent %",
          "Total Saving",
          "Position",
        ];

        // 🧠 Helper to build all rows dynamically
        const buildRows = (cols) =>
          topQuotes.map((q, index) => {
            console.log("Generating row for quote:", q);
            const lastNegotiation = Array.isArray(q.negotiation)
              ? q.negotiation.find(
                  (n) =>
                    n.vendor_id === q.vendor_id &&
                    n.airline_name === q.airline_name,
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
              "Transit Days": q.transit_days || "-",
              "Final Bid Price": finalBid,
              "Percent %":
                q.percentage !== undefined ? `${q.percentage}%` : "-",
              "Total Saving": saving ? saving.toFixed(2) : "-",
              Position: `L${index + 1}`,
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
      currentY = addAuctionActivitySection(currentY, auctionData);
      currentY = quotedatalatestFinalNew(currentY);
      //currentY = addSummaryBidSection(currentY);
      currentY = addGeneralDetails(currentY);
      currentY = addContainerAndCharges(currentY, doc, containerDatat);
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
      attachedFile: row.hodAcceptRequestDetails?.attached_file || null,
      marketingAttachedFile:
        row.sharedtoMarketingTeamDetails?.attached_file || null,
      marketingTeamDataRemarks:
        row.sharedtoMarketingTeamDetails?.remarks || null,
      marketingTeamDataDate:
        row.sharedtoMarketingTeamDetails?.accepted_at || null,
      hodApprovalDataRemarks: row.hodAcceptRequestDetails?.remarks || null,
      hodApprovalDataDate: row.hodAcceptRequestDetails?.accepted_at || null,
    }));

    const attachedFileName =
      allQuotesWithUniqueId.find((row) => row.attachedFile)?.attachedFile ||
      null;

    const marketingTeamReviewFileName =
      allQuotesWithUniqueId.find((row) => row.marketingAttachedFile)
        ?.marketingAttachedFile || null;

    //console.log("marketingTeamReviewFileName", marketingTeamReviewFileName);

    const marketingTeamReviewDataRemarks =
      allQuotesWithUniqueId.find((row) => row.marketingTeamDataRemarks)
        ?.marketingTeamDataRemarks || null;

    const marketingTeamReviewDataDate =
      allQuotesWithUniqueId.find((row) => row.marketingTeamDataDate)
        ?.marketingTeamDataDate || null;

    //console.log("fullMarketingTeamReviewData", fullMarketingTeamReviewData);

    const hodApprovalDataRemarks =
      allQuotesWithUniqueId.find((row) => row.hodApprovalDataRemarks)
        ?.hodApprovalDataRemarks || null;

    const hodApprovalDataDate =
      allQuotesWithUniqueId.find((row) => row.hodApprovalDataDate)
        ?.hodApprovalDataDate || null;

    const quoteWithAttachment = allQuotesWithUniqueId.find(
      (row) => row.attachedFile && row.status === "requested_hod_approval",
    );

    const approvalMessage =
      quoteWithAttachment?.hodAcceptRequestDetails?.remarks ||
      "Exports team requested for approval";

    return (
      <div className="mt-4">
        <h4 className="mb-3">✈️ All Shipment Quotes (Flat View)</h4>
        <div className="grid">
          <div className="col-12 md:col-3">
            <label htmlFor="exchangeRate">Exchange Rate</label>
            <input
              id="exchangeRate"
              type="number"
              value={exchangeRate || ""}
              onChange={(e) => setExchangeRate(Number(e.target.value))}
              className="p-inputtext p-component w-full"
              placeholder="Enter Exchange Rate"
            />
          </div>

          <div className="col-12 md:col-3">
            <label htmlFor="shipmentValue">Value of Shipment</label>
            <input
              id="shipmentValue"
              type="number"
              value={shipmentValue || ""}
              onChange={(e) => setShipmentValue(Number(e.target.value))}
              className="p-inputtext p-component w-full"
              placeholder="Enter Shipment Value"
            />
          </div>
        </div>

        <div className="flex justify-content-between align-items-center mb-3">
          <h3>RFQ Quotes Summary</h3>
          <Button
            label="Download PDF"
            icon="pi pi-download"
            className="p-button-sm p-button-success"
            onClick={() => exportToPDF(allQuotes, rfq?.rfq_number)}
            disabled={allQuotes.length === 0}
          />
          {}
        </div>

        {attachedFileName && (
          <div className="p-3 mb-3 border-round bg-yellow-100 text-yellow-900 shadow-2">
            <div className="flex align-items-center gap-3">
              {/* ⏳ Icon on the LEFT */}
              <span
                style={{
                  color: "#e67e22",
                  fontWeight: "bold",
                  fontSize: "2rem",
                  flexShrink: 0,
                }}
                title="HOD Approval Pending"
              >
                ⏳
              </span>

              <div>
                <strong>Requested HOD Approval:</strong>
                <br />
                <strong>Reason: {hodApprovalDataRemarks}</strong>
                <br />
                <br />
                <strong>Requested On: {formatDate(hodApprovalDataDate)}</strong>
                <br />
                <strong>Attachment: </strong>
                <a
                  href={`${BASE_URL}/uploads/rfq/${encodeURIComponent(
                    attachedFileName,
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-700 underline"
                >
                  {attachedFileName}
                </a>
              </div>
            </div>
          </div>
        )}

        {marketingTeamReviewFileName && (
          <div className="p-3 mb-3 border-round bg-yellow-100 text-yellow-900 shadow-2">
            <div className="flex align-items-center gap-3">
              {/* ⏳ Icon on the LEFT */}
              <span
                style={{
                  color: "#e67e22",
                  fontWeight: "bold",
                  fontSize: "2rem",
                  flexShrink: 0,
                }}
                title="Marketing Team Review Pending"
              >
                ⏳
              </span>

              <div>
                <strong>Requested Marketing Team Review:</strong>
                <br />
                <strong>Reason: {marketingTeamReviewDataRemarks}</strong>
                <br />
                <strong>
                  Requested On: {formatDate(marketingTeamReviewDataDate)}
                </strong>
                <br />
                <strong>Attachment: </strong>
                <a
                  href={`${BASE_URL}/uploads/rfq/${encodeURIComponent(
                    marketingTeamReviewFileName,
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-700 underline"
                >
                  {marketingTeamReviewFileName}
                </a>
              </div>
            </div>
          </div>
        )}

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
          filterDisplay="row"
          onValueChange={(e) => {
            console.log("DataTable onValueChange triggered", e);
            setVisibleRows(e || []);
            const total = e?.reduce(
              (sum, row) => sum + Number(row.grandTotalValue || 0),
              0,
            );
            setInvAmount(total); // 🔥 calculated INSIDE DataTable
          }}
          footerColumnGroup={footerGroup}
        >
          <Column expander style={{ width: "3rem" }} />
          <Column selectionMode="multiple" headerStyle={{ width: "3rem" }} />
          <Column header="Vendor" body={(row) => row.vendor_name} />
          <Column
            field="airline_name"
            header="Airline"
            body={(row) => row.airline_name || "-"}
            filter
            showFilterMenu={false}
            filterElement={(options) => (
              <Dropdown
                value={options.value ?? null}
                options={[
                  ...new Set(
                    allQuotesWithUniqueId
                      .map((q) => q.airline_name)
                      .filter(Boolean),
                  ),
                ]}
                onChange={(e) => {
                  // 1️⃣ Update PrimeReact internal filter
                  options.filterApplyCallback(e.value);

                  // 2️⃣ Update your controlled filter state
                  setFilters((prev) => ({
                    ...prev,
                    airline_name: {
                      ...prev.airline_name,
                      value: e.value,
                    },
                  }));
                }}
                placeholder="Select Airline"
                showClear
                className="p-column-filter"
              />
            )}
          />

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
          <Column
            header="DAP/DDP"
            body={(row) =>
              row.dap_ddp_charges + " (" + row.currency + ") " || "-"
            }
          />
          <Column header="Ex Rate" body={(row) => row.exchangeRate || "-"} />
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
            style={{ minWidth: "120px" }}
            headerStyle={{ minWidth: "120px", textAlign: "center" }}
            bodyStyle={{ textAlign: "center" }}
            // footer={
            //   <strong style={{ color: "#0f5132", fontSize: "1rem" }}>
            //     Exchange Invoice Amount: ₹ {invAmount?.toFixed(2)}
            //   </strong>
            // }
            // footerStyle={{ textAlign: "right" }}
          />
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
                  row.airline_name?.toLowerCase().trim(),
              );

              if (!matchedNegotiation) return <span>-</span>;

              return (
                <strong>
                  ₹ {matchedNegotiation.last_purchase_price || "N/A"}
                </strong>
              );
            }}
          />
          <Column
            header="Total Saving"
            body={(row) => {
              const finalBid = row.grandTotalValue || 0;
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

          <Column
            header="Percent %"
            body={(row) => row.percentage + "%" || "-"}
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
                row.hodAcceptRequestDetails?.attached_file;

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

              if (attachedFileName && role === "hod") {
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
                          row.airline_name,
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
                          row.airline_name,
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

  const handleHodApprovalSubmit = async () => {
    try {
      const form = new FormData();
      form.append("rfq_number", rfq.rfq_number);
      form.append("action", "requested_hod_approval");
      form.append("remarks", acceptRemarks || "");
      form.append("hod_name", selectedHod?.name || "");
      form.append("hod_email", selectedHod?.email || "");

      if (attachment) {
        form.append("attachment", attachment);
      }

      const token = localStorage.getItem("USERTOKEN");

      await postData("/quotesummary/update-rfq-status", form, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      dispatch(
        toastSuccess({ detail: "Requested for HOD Approval successfully!" }),
      );

      setShowHodApprovalDialog(false);
      setAttachment(null);
      setAcceptRemarks("");
      fetchSummary();
    } catch (error) {
      console.error("HOD Approval Error:", error);
      dispatch(toastError({ detail: "Error sending approval request." }));
    }
  };

  const handleShareToMarketingTeam = async () => {
    try {
      const form = new FormData();
      form.append("rfq_number", rfq.rfq_number);
      form.append("action", "shared_to_marketing_team");
      form.append("remarks", marketingRemarks || "");
      form.append("marketing_name", marketingHead?.name || "");
      form.append("marketing_email", marketingHead?.email || "");

      if (attachment) {
        form.append("attachment", attachment);
      }

      const token = localStorage.getItem("USERTOKEN");

      await postData("/quotesummary/update-rfq-status", form, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      dispatch(
        toastSuccess({ detail: "Shared with Marketing Team successfully!" }),
      );

      setShowShareToMarketTeamDialog(false);
      setAttachment(null);
      setMarketingRemarks("");
      fetchSummary();
    } catch (error) {
      console.error("Marketing Team Share Error:", error);
      dispatch(toastError({ detail: "Error sharing to marketing team." }));
    }
  };

  const RoleSelection = (
    <div style={{ padding: 20 }}>
      <h2>Live Auction Platform</h2>
      <button onClick={() => setRole("buyer")}>Buyer</button>
      <button onClick={() => setRole("vendor")}>Vendor</button>
    </div>
  );

  return (
    <div className="p-4">
      <h3 className="mb-2">
        Quote Summary - {rfq?.rfq_number}{" "}
        <span className="text-gray-500 text-sm">({rfq?.title})</span>
      </h3>

      <div className="flex justify-content-between align-items-center mb-3">
        {/* <ToggleButton
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
        /> */}

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
              ? "" //vendorTable
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
          {role === "user" && (
            <Button
              label="Share To Marketing Team"
              icon="pi pi-download"
              className="p-button-sm p-button-success"
              onClick={() => setShowShareToMarketTeamDialog(true)}
            />
          )}
          {role !== "hod" && (
            <Button
              label="Send For HOD Approval"
              className="p-button-info p-button-sm"
              onClick={() => setShowHodApprovalDialog(true)}
              //disabled={selectedVendors.length === 0}
            />
          )}

          {/* {hodQuote && ( */}
          <div>
            {role === "hod" && (
              <Button
                label="✅ Accept Quote"
                className="p-button-success p-button-sm"
                //onClick={() => handleAction("accept_l1", rfq.rfq_number)}
                onClick={() => setShowAcceptDialog(true)}
                disabled={selectedVendors.length === 0}
              />
            )}

            <div style={{ display: "flex", gap: "10px" }}>
              {role === "user" && (
                <>
                  <Button
                    label="✏️ Negotiate"
                    className="p-button-warning p-button-sm"
                    onClick={() => setShowNegotiateDialog(true)}
                    disabled={selectedVendors.length === 0}
                  />

                  {/* <Button
                    label={
                      auctionData ? "✏️ Edit Auction" : "🏆 Conduct Auction"
                    }
                    className="p-button-success p-button-sm"
                    onClick={() => setShowAuctionDialog(true)}
                    disabled={!auctionData && selectedVendors.length === 0}
                  /> */}
                  <Button
                    label={auctionActionLabel}
                    className="p-button-success p-button-sm"
                    onClick={() => setShowAuctionDialog(true)}
                    //disabled={!auctionData && selectedVendors.length === 0}
                  />
                </>
              )}
            </div>
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
        <hr />
        <Buyer
          userId={userId}
          vendors={selectedVendors}
          existingAuction={auctionData}
          onAuctionCreated={() => {
            setShowAuctionDialog(false);
            fetchAuctionData();
          }}
          onAuctionUpdated={handleAuctionUpdated}
        />
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
                }),
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

        {/* <div className="mb-3">
          <h5>Selected Vendors</h5>
          {selectedVendors.map((v) => (
            <div key={v.vendor_id} className="mb-2">
              <i className="pi pi-user mr-2" />
              <strong>{v.vendor_name}</strong> — {v.airline_name || "N/A"}
            </div>
          ))}
        </div> */}

        <div className="mb-3">
          <label>
            <strong>Attach File</strong>
          </label>
          <input
            type="file"
            className="p-inputtext w-full"
            onChange={(e) => setAttachment(e.target.files[0])}
          />
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
            onClick={handleHodApprovalSubmit}
          />
          <Button
            label="Cancel"
            className="p-button-secondary p-button-sm"
            onClick={() => setShowHodApprovalDialog(false)}
          />
        </div>
      </Dialog>

      <Dialog
        header="Share To Marketing Team"
        visible={showShareToMarketTeamDialog}
        onHide={() => setShowShareToMarketTeamDialog(false)}
        style={{ width: "35vw" }}
      >
        <div className="mb-3">
          <label>
            <strong>Select Marketing Team</strong>
          </label>
          <Dropdown
            value={marketingHead}
            options={marketingUsers?.map((user) => ({
              label: `${user.name} (${user.email})`,
              value: user,
            }))}
            onChange={(e) => setMarketingHead(e.value)}
            placeholder="Select Marketing Team"
            className="w-full"
            optionLabel="label"
            filter
          />
        </div>

        {/* <div className="mb-3">
          <h5>Selected Vendors</h5>
          {selectedVendors.map((v) => (
            <div key={v.vendor_id} className="mb-2">
              <i className="pi pi-user mr-2" />
              <strong>{v.vendor_name}</strong> — {v.airline_name || "N/A"}
            </div>
          ))}
        </div> */}

        <div className="mb-3">
          <label>
            <strong>Attach File</strong>
          </label>
          <input
            type="file"
            className="p-inputtext w-full"
            onChange={(e) => setAttachment(e.target.files[0])}
          />
        </div>

        <div className="mb-3">
          <label>Remarks</label>
          <InputTextarea
            rows={3}
            value={marketingRemarks}
            onChange={(e) => setMarketingRemarks(e.target.value)}
            placeholder="Enter remarks..."
            className="w-full"
          />
        </div>

        <div className="flex justify-content-end gap-2">
          <Button
            label="Share Now"
            className="p-button-sm p-button-success"
            onClick={handleShareToMarketingTeam}
          />
          <Button
            label="Cancel"
            className="p-button-secondary p-button-sm"
            onClick={() => setShowShareToMarketTeamDialog(false)}
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
                toastSuccess({ detail: "Accepted Quote successfully!" }),
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
              submitNegotiation();
              setShowNegotiateDialog(false);
            }}
          />
          <Button
            label="Cancel"
            className="p-button-secondary p-button-sm"
            onClick={() => setShowNegotiateDialog(false)}
          />
        </div>
      </Dialog>

      {/* <Dialog
        header="Negotiate with Vendors"
        visible={showNegotiateDialog}
        style={{ width: "50vw" }}
        onHide={() => setShowNegotiateDialog(false)}
      >

      </Dialog> */}

      {/* Conduct Auction Dialog */}
      <Dialog
        header={auctionActionLabel}
        visible={showAuctionDialog}
        style={{ width: "80vw", height: "80vh" }}
        maximizable
        onHide={() => setShowAuctionDialog(false)}
      >
        <Buyer
          userId={userId}
          vendors={selectedVendors}
          existingAuction={auctionData}
          onAuctionCreated={() => {
            setShowAuctionDialog(false);
            fetchAuctionData();
          }}
        />
      </Dialog>
    </div>
  );
};

export default ViewQuote;
