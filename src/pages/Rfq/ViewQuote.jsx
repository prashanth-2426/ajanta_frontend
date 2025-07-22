import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Panel } from "primereact/panel";
import { ToggleButton } from "primereact/togglebutton";
import { getData } from "../../utils/requests";
import { Button } from "primereact/button";
import { postData } from "../../utils/requests";
import { toastError, toastSuccess } from "../../store/toastSlice";
import { Dialog } from "primereact/dialog";
import { Checkbox } from "primereact/checkbox";
import { InputNumber } from "primereact/inputnumber";
import { InputTextarea } from "primereact/inputtextarea";

const ViewQuote = () => {
  const { rfqNumber } = useParams();
  const [rfq, setRfq] = useState(null);
  const [viewItemLevel, setViewItemLevel] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const dispatch = useDispatch();

  const [showNegotiationDialog, setShowNegotiationDialog] = useState(false);
  const [selectedVendors, setSelectedVendors] = useState([]);
  const [lastPurchasePrice, setLastPurchasePrice] = useState("");
  const [negotiationRemarks, setNegotiationRemarks] = useState("");

  const [isFlatView, setIsFlatView] = useState(false);
  const [invAmount, setInvAmount] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const data = await getData(`quotesummary/quotes-summary/${rfqNumber}`);
        console.log("RFQ Quote Summary:", data);
        setRfq(data);
      } catch (error) {
        console.error("Failed to fetch quote summary", error);
      }
    };
    fetchSummary();
  }, [rfqNumber]);

  const handleAction = async (actionType, rfqNumber) => {
    try {
      const res = await postData("quotesummary/update-rfq-status", {
        rfq_number: rfqNumber,
        action: actionType,
      });
      console.log("Action performed:", res);
      //alert(`RFQ status updated: ${actionType}`);
      dispatch(toastSuccess({ detail: `Done ${actionType} Successfully..` }));
    } catch (err) {
      console.error("Action failed:", err);
      alert("Failed to perform action");
    }
  };

  const submitNegotiation = async () => {
    try {
      const negotiations = selectedVendors.map((id) => ({
        vendor_id: id,
        last_purchase_price: lastPurchasePrice,
        remarks: negotiationRemarks,
      }));

      console.log("Negotiation Data:", {
        rfq_number: rfq.rfq_number,
        negotiations,
      });

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
    console.log("Row Data:", rowData.rank);
    const rankColors = {
      L1: "text-green-600 font-bold",
      L2: "text-blue-500 font-semibold",
      L3: "text-yellow-500 font-medium",
      L4: "text-purple-500 font-medium",
      L5: "text-red-500 font-medium",
    };

    const colorClass = rankColors[rowData.rank] || "text-gray-500";
    console.log("Color Class:", colorClass);
    const label = `${rowData.rank}`;
    console.log("label Data:", label);

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
        body={(rowData) => rowData.total.toLocaleString("en-IN")}
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
                {new Date(negotiation.requested_at).toLocaleString()}
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
    console.log("loaidng package quote details");
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
    console.log("vendor names", vendorNames);

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

  const shipmentWiseQuoteTable = () => {
    if (!rfq?.isShipmentBased || !rfq?.shipments?.length) return null;

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
                header="Base Rate (Rs/Kg)"
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
                header="Base Rate (Rs/Kg)"
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
        <DataTable
          value={allQuotes}
          responsiveLayout="scroll"
          className="p-datatable-sm"
          emptyMessage="No shipment quotes available"
        >
          <Column header="Vendor" body={(row) => row.vendor_name} />
          <Column header="Airline" body={(row) => row.airline_name || "-"} />
          <Column header="Airport" body={(row) => row.airport || "-"} />
          <Column
            header="Chargeable Wt"
            body={(row) => `${row.chargeable_weight || "-"} kg`}
          />
          <Column
            header="Base Rate (Rs/Kg)"
            body={(row) => row.base_rate || "-"}
          />
          <Column header="AMS" body={(row) => row.ams || "-"} />
          <Column header="PAC" body={(row) => row.pac || "-"} />
          <Column header="AWB" body={(row) => row.awb || "-"} />
          <Column header="DAP/DDP" body={(row) => row.dap_ddp_charges || "-"} />
          <Column header="Other" body={(row) => row.other_charges || "-"} />
          <Column
            header="Total Charges"
            body={(row) => (
              <strong>₹ {parseFloat(row.total_charges).toFixed(2)}</strong>
            )}
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
        <div className="mt-4 flex flex-wrap gap-3 justify-content-end">
          <Button
            label="✅ Accept L1 Quote"
            className="p-button-success p-button-sm"
            onClick={() => handleAction("accept_l1", rfq.rfq_number)}
          />
          <Button
            label="✏️ Negotiate"
            className="p-button-warning p-button-sm"
            //onClick={() => handleAction("negotiate", rfq.rfq_number)}
            onClick={() => setShowNegotiationDialog(true)}
          />
          <Button
            label="⚖️ Move to Auction"
            className="p-button-info p-button-sm"
            onClick={() => handleAction("auction", rfq.rfq_number)}
          />
          <Button
            label="❌ Reject All"
            className="p-button-danger p-button-sm"
            onClick={() => handleAction("reject", rfq.rfq_number)}
          />
        </div>
      </Panel>

      <Dialog
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
                {v.email}
              </label>
            </div>
          ))}
        </div>

        <div className="mb-3">
          <label>Last Purchase Price</label>
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
            disabled={selectedVendors.length === 0}
          />
          <Button
            label="Cancel"
            className="p-button-secondary p-button-sm"
            onClick={() => setShowNegotiationDialog(false)}
          />
        </div>
      </Dialog>
    </div>
  );
};

export default ViewQuote;
