import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { FilterMatchMode } from "primereact/api";
import { getData, postData } from "../../utils/requests";
import { useNavigate } from "react-router-dom";
import { formatDate } from "../../utils/local";
import { toastError, toastSuccess } from "../../store/toastSlice";
import { InputNumber } from "primereact/inputnumber";
import { getVendorStatusFromBuyerStatus } from "../../utils/statusMapper";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { InputTextarea } from "primereact/inputtextarea";
import { getRates } from "../../utils/exchangeRates";

const RfqManagement = () => {
  const user = useSelector((state) => state.auth.user);
  console.log("user info on lisitng", user);
  const role = user?.role;
  console.log("User Role:", role);
  const isVendor = user?.role === "vendor";
  console.log("isVendor value", isVendor);
  const [rfqs, setRfqs] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    title: { value: null, matchMode: FilterMatchMode.CONTAINS },
    type: { value: null, matchMode: FilterMatchMode.CONTAINS },
    transport_mode: { value: null, matchMode: FilterMatchMode.CONTAINS },
    currency: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });

  const [expandedRows, setExpandedRows] = useState(null);
  const [quotes, setQuotes] = useState({});
  const [roadTransportQuotes, setRoadTransportQuotes] = useState({});
  const [competingQuotes, setCompetingQuotes] = useState({});
  const userRole = "vendor";
  const airlines = ["Air India", "Emirates", "Qatar Airways"];
  const [packageQuotes, setPackageQuotes] = useState({});

  const [airlineQuotes, setAirlineQuotes] = useState({});

  const [airlineData, setAirlineData] = useState({});
  const [shiplineData, setShiplineData] = useState({});
  const [roadTransportData, setRoadTransportData] = useState({});

  const [expandedModalRows, setExpandedModalRows] = useState({});
  const [currencySymbol, setCurrencySymbol] = useState("INR");

  const toggleMoreInfo = (shipmentIndex, rowIndex) => {
    setExpandedModalRows((prev) => ({
      ...prev,
      [`${shipmentIndex}_${rowIndex}`]: !prev[`${shipmentIndex}_${rowIndex}`],
    }));
  };

  const dispatch = useDispatch();

  const navigate = useNavigate();

  const fetchRfqs = async () => {
    try {
      const url = isVendor
        ? `rfqs?email=${encodeURIComponent(user.email)}`
        : `rfqs`;
      console.log("Fetching RFQs from URL:", url);
      const data = await getData(url);
      console.log("Fetched RFQs:", data);
      const enriched = data.map((r) => ({
        ...r,
        row_id: r.auction_number || r.rfq_number,
      }));
      setRfqs(enriched);
    } catch (error) {
      console.error("Error fetching RFQs:", error);
    }
  };

  const fetchQuotesById = async (rfqNumber) => {
    try {
      const data = await getData(`quotes/${rfqNumber}`);
      const mappedQuotes = {};
      const mappedRoadTransportQuotes = {};
      const groupedByItem = {};
      const mappedPackageQuotes = {};
      const mappedExportAirlinePackageQuotes = {};
      const mappedExportShiplinePackageQuotes = {};

      data.forEach((entry) => {
        const rfqId = entry.rfq_id;

        if (String(entry.vendor_id) === String(user.id)) {
          entry.quotes?.forEach((q) => {
            const key = `${rfqId}_${q.item_id}`;
            mappedQuotes[key] = q.quoted_price;
          });

          entry.road_transport_quotes?.forEach((q) => {
            const key = `${rfqId}_${q.row_id}`;
            mappedRoadTransportQuotes[key] = q.quoted_price;
          });

          if (entry.package_quotes) {
            entry.package_quotes?.forEach((pkg) => {
              const rowIndex = pkg.row_index;
              pkg.quotes.forEach((q) => {
                const airlineKey = `${rfqId}_${rowIndex}_${q.airline}`;
                mappedPackageQuotes[airlineKey] = {
                  base: q.base || "",
                  air_freight: q.air_freight || "",
                  customs: q.customs || "",
                };
              });
              console.log("package value", pkg);
              const shipmentIndex = pkg?.shipment_index;
              console.log("shipmentIndex value", shipmentIndex);
              if (!mappedExportAirlinePackageQuotes[shipmentIndex]) {
                mappedExportAirlinePackageQuotes[shipmentIndex] = [];
              }

              pkg.quotes?.forEach((quote) => {
                const isSealine = "sealine_name" in quote;

                console.log("isSealine value", isSealine);

                const targetMap = isSealine
                  ? mappedExportShiplinePackageQuotes
                  : mappedExportAirlinePackageQuotes;

                if (!targetMap[shipmentIndex]) {
                  targetMap[shipmentIndex] = [];
                }

                if (isSealine) {
                  targetMap[shipmentIndex].push({
                    sealine_name: quote.sealine_name || "",
                    sea_port: quote.sea_port || "",
                    freight_per_container: quote.freight_per_container || "",
                    temperature: quote.temperature || "",
                    dap_ddp: quote.dap_ddp || "",
                    transit_time: quote.transit_time || "",
                    freight_per_cbm: quote.freight_per_cbm || "",
                    origin_charges: quote.origin_charges || "",
                    destination_charges: quote.destination_charges || "",
                    remarks: quote.remarks || "",
                    rate_validity: quote.rate_validity || "",
                    all_in_freight: quote.all_in_freight || "",
                    thc: quote.thc || "",
                    blFee: quote.blFee || "",
                    ensAcdFee: quote.ensAcdFee || "",
                    other_charges: quote.other_charges || "",
                    currency: quote.currency || "",
                    haulage: quote.haulage || "",
                    customs_clearance: quote.customs_clearance || "",
                    isf: quote.isf || "",
                    dthc: quote.dthc || "",
                    doDdc: quote.doDdc || "",
                    hmf: quote.hmf || "",
                    mpe: quote.mpe || "",
                    prePull: quote.prePull || "",
                    other_destination_charges:
                      quote.other_destination_charges || "",
                    origin_detention: quote.origin_detention || "",
                    destination_detention: quote.destination_detention || "",
                    destination_combine: quote.destination_combine || "",
                    shipping_line: quote.shipping_line || "",
                    routing: quote.routing || "",
                    validity: quote.validity || "",
                    total_charges: quote.total_charges || "",
                  });
                } else {
                  targetMap[shipmentIndex].push({
                    airline_name: quote.airline_name || "",
                    airport: quote.airport || "",
                    gross_weight: quote.gross_weight || "",
                    volume_weight: quote.volume_weight || "",
                    chargeable_weight: quote.chargeable_weight || "",
                    transit_days: quote.transit_days || "",
                    freight_per_kg: quote.base || "",
                    dap_ddp_charges: quote.dap_ddp_charges || "",
                    other_charges: quote.other_charges || "",
                    remarks: quote.remarks || "",
                    rate_validity: quote.rate_validity || "",
                    base_rate: quote.base_rate || "",
                    ams: quote.ams || "",
                    pac: quote.pac || "",
                    awb: quote.awb || "",
                    total_charges: quote.total_charges || "",
                    booking_reference: quote.booking_reference || "",
                    flight_schedule: quote.flight_schedule || "",
                    pickup_date: quote.pickup_date || "",
                    clearance_date: quote.clearance_date || "",
                    route: quote.route || "",
                    freight_validity: quote.freight_validity || "",
                    insurance: quote.insurance || "",
                    pickup_charges: quote.pickup_charges || "",
                    documentation_charges: quote.documentation_charges || "",
                    customs_handling: quote.customs_handling || "",
                    free_storage_days: quote.free_storage_days || "",
                  });
                }
              });
            });
          }
        }

        entry.quotes?.forEach((q) => {
          const key = `${rfqId}_${q.item_id}`;
          if (!groupedByItem[key]) groupedByItem[key] = [];
          groupedByItem[key].push({
            vendor_id: entry.vendor_id,
            quoted_price: q.quoted_price,
          });
        });
      });
      console.log(
        "mappedExportAirlinePackageQuotes data",
        mappedExportAirlinePackageQuotes
      );
      setQuotes(mappedQuotes);
      setCompetingQuotes(groupedByItem);
      setAirlineQuotes(mappedPackageQuotes);
      setAirlineData(mappedExportAirlinePackageQuotes);
      setShiplineData(mappedExportShiplinePackageQuotes);
      setRoadTransportQuotes(mappedRoadTransportQuotes);
    } catch (error) {
      console.error("Error fetching Qutoes:", error);
    }
  };

  const updateAirlineQuote = (key, field, value) => {
    setAirlineQuotes((prev) => ({
      ...prev,
      [key]: {
        ...(prev[key] || {}),
        [field]: value,
      },
    }));
  };

  const handlePackageSubmit = async (shipmentIndex, rowData) => {
    const rfqId = rowData.rfq_number;
    const vendorId = user.id;

    const airlineQuotesForShipment = airlineData[shipmentIndex] || [];

    console.log("airlineQuotesForShipment details", airlineQuotesForShipment);

    const payload = {
      rfq_id: rfqId,
      vendor_id: vendorId,
      quotes: [],
      package_quotes: [
        {
          shipment_index: shipmentIndex,
          quotes: airlineQuotesForShipment,
        },
      ],
    };

    console.log("payload data", payload);

    try {
      const token = localStorage.getItem("USERTOKEN");
      const response = await fetch("/apis/quotes", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log("Submit Quote  response", result);
      dispatch(
        toastSuccess({ detail: "Packages Quote Submitted Successfully.." })
      );
    } catch (error) {
      console.error("Error submitting packages quote:", error);
    }
  };

  const handleShiplinePackageSubmit = async (shipmentIndex, rowData) => {
    const rfqId = rowData.rfq_number;
    const vendorId = user.id;

    const shiplineQuotesForShipment = shiplineData[shipmentIndex] || [];

    console.log("shiplineQuotesForShipment details", shiplineQuotesForShipment);

    const payload = {
      rfq_id: rfqId,
      vendor_id: vendorId,
      quotes: [],
      package_quotes: [
        {
          shipment_index: shipmentIndex,
          quotes: shiplineQuotesForShipment,
        },
      ],
    };

    console.log("payload data", payload);

    try {
      const token = localStorage.getItem("USERTOKEN");
      const response = await fetch("/apis/quotes", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log("Submit Quote  response", result);
      dispatch(
        toastSuccess({ detail: "Packages Quote Submitted Successfully.." })
      );
    } catch (error) {
      console.error("Error submitting packages quote:", error);
    }
  };

  useEffect(() => {
    fetchRfqs();
  }, []);

  const filteredRfqs =
    role === "user"
      ? rfqs.filter((rfq) => rfq.form_type?.toLowerCase() !== "draft")
      : rfqs;

  const getVendorRank = (rfqId, itemId, vendorId, competingQuotes) => {
    console.log("rfqId value", rfqId);
    console.log("itemId value", itemId);
    console.log("vendorId value", vendorId);
    console.log("competingQuotes value", competingQuotes);
    const quotes = competingQuotes[`${rfqId}_${itemId}`] || [];

    console.log("quotes value", quotes);

    const sorted = [...quotes].sort((a, b) => a.quoted_price - b.quoted_price);
    console.log("sorted value", sorted);
    const rank = sorted.findIndex(
      (q) => String(q.vendor_id) === String(vendorId)
    );

    console.log("rank value", rank);

    return rank !== -1 ? `L${rank + 1}` : "-";
  };

  const handleAddAirline = (index) => {
    setAirlineData((prev) => ({
      ...prev,
      [index]: [
        ...(prev[index] || []),
        {
          airline_name: "",
          airport: "",
          gross_weight: "",
          volume_weight: "",
          chargeable_weight: "",
          transit_days: "",
          freight_per_kg: "",
          dap_ddp_charges: "",
          other_charges: "",
          remarks: "",
          rate_validity: "",
        },
      ],
    }));
  };

  const handleAddShipline = (index) => {
    setShiplineData((prev) => ({
      ...prev,
      [index]: [
        ...(prev[index] || []),
        {
          sealine_name: "",
          sea_port: "",
          freight_per_container: "",
          temperature: "",
          dap_ddp: "",
          transit_time: "",
          freight_per_cbm: "",
          origin_charges: "",
          destination_charges: "",
          remarks: "",
          rate_validity: "",
          all_in_freight: "",
          thc: "",
          blFee: "",
          ensAcdFee: "",
          other_charges: "",
          currency: "",
          haulage: "",
          customs_clearance: "",
          isf: "",
          dthc: "",
          doDdc: "",
          hmf: "",
          mpe: "",
          prePull: "",
          other_destination_charges: "",
          origin_detention: "",
          destination_detention: "",
          destination_combine: "",
          shipping_line: "",
          transit_time: "",
          routing: "",
          validity: "",
          remarks: "",
        },
      ],
    }));
  };

  const handleSealineInputChange = (
    shipment,
    shipmentIndex,
    rowIndex,
    field,
    value
  ) => {
    setShiplineData((prev) => {
      const updated = [...(prev[shipmentIndex] || [])];
      const toNumber = (val) => parseFloat(val) || 0;
      updated[rowIndex] = {
        ...updated[rowIndex],
        [field]: value,
      };
      const row = { ...updated[rowIndex], [field]: value };

      const dap_ddp = parseFloat(row.dap_ddp) || 0;
      const origin_charges = parseFloat(row.origin_charges) || 0;
      const destination_charges = parseFloat(row.destination_charges) || 0;
      const thc = parseFloat(row.thc) || 0;
      const blFee = parseFloat(row.blFee) || 0;
      const ensAcdFee = toNumber(row.ensAcdFee);
      const other_charges = toNumber(row.other_charges);
      const haulage = toNumber(row.haulage);
      const customs_clearance = toNumber(row.customs_clearance);
      const isf = toNumber(row.isf);
      const dthc = toNumber(row.dthc);
      const doDdc = toNumber(row.doDdc);
      const hmf = toNumber(row.hmf);
      const mpe = toNumber(row.mpe);
      const prePull = toNumber(row.prePull);
      const other_destination_charges = toNumber(row.other_destination_charges);
      const origin_detention = toNumber(row.origin_detention);
      const destination_detention = toNumber(row.destination_detention);
      const destination_combine = toNumber(row.destination_combine);

      const currency = row.currency || "INR";

      const currencySymbol = currency === "USD" ? "$" : "₹";
      setCurrencySymbol(currencySymbol);

      const exchangeRate = currency === "USD" ? 85.34 : 1;

      row.total_charges = (
        origin_charges +
        destination_charges +
        thc +
        blFee +
        ensAcdFee +
        other_charges +
        haulage +
        customs_clearance +
        isf +
        dthc +
        doDdc +
        hmf +
        mpe +
        prePull +
        other_destination_charges +
        origin_detention +
        destination_detention +
        destination_combine
      ).toFixed(2);

      console.log("total charge calculation", row.total_charges);

      updated[rowIndex] = row;
      return {
        ...prev,
        [shipmentIndex]: updated,
      };
    });
  };

  const handleInputChange = async (
    shipment,
    shipmentIndex,
    rowIndex,
    field,
    value
  ) => {
    const toNumber = (val) => parseFloat(val) || 0;
    const prevData = [...(airlineData[shipmentIndex] || [])];
    const row = { ...prevData[rowIndex], [field]: value };

    const gw = toNumber(
      field === "gross_weight"
        ? value
        : shipment.package_summary?.totalGrossWeight
    );
    const vw = toNumber(
      field === "volume_weight"
        ? value
        : shipment.package_summary?.totalVolumetricWeight
    );
    row.chargeable_weight = Math.max(gw, vw);

    const cw = toNumber(row.chargeable_weight);
    const baseRate = toNumber(row.base_rate);
    const freight = toNumber(row.freight_per_kg);
    const other = toNumber(row.other_charges);
    const ams = toNumber(row.ams);
    const pac = toNumber(row.pac);
    const awb = toNumber(row.awb);
    let dapDdp = toNumber(row.dap_ddp_charges);

    const currency = row.currency || "INR";

    let exchangeRate = 1;
    if (currency !== "INR") {
      try {
        exchangeRate = await getRates(currency, "INR");
        console.log("[DEBUG] Fetched exchange rate:", exchangeRate);
      } catch (e) {
        console.error("Exchange rate error:", e);
      }
    }

    const convertedDapDdp = dapDdp * exchangeRate;

    row.total_charges = (
      cw * baseRate +
      ams +
      pac +
      awb +
      convertedDapDdp +
      other
    ).toFixed(2);

    prevData[rowIndex] = row;
    setAirlineData((prev) => ({
      ...prev,
      [shipmentIndex]: prevData,
    }));
  };

  const handleDeleteRow = (shipmentIndex, rowIndex) => {
    setAirlineData((prev) => {
      const updated = [...(prev[shipmentIndex] || [])];
      updated.splice(rowIndex, 1);
      return {
        ...prev,
        [shipmentIndex]: updated,
      };
    });
  };

  const handleDeleteShiplineRow = (shipmentIndex, rowIndex) => {
    setShiplineData((prev) => {
      const updated = [...(prev[shipmentIndex] || [])];
      updated.splice(rowIndex, 1);
      return {
        ...prev,
        [shipmentIndex]: updated,
      };
    });
  };

  const rowExpansionTemplate = (rowData) => {
    console.log("row data value", rowData);
    const itemsWithIds = rowData.rfq_items?.map((item, idx) => ({
      ...item,
      item_id: item.item_id ?? idx + 1,
    }));

    const itemsWithRoadTransportIds =
      rowData.road_transport_summary?.entries?.map((item, idx) => ({
        ...item,
        row_id: item.row_id ?? idx + 1,
      }));

    return (
      <div className="p-3">
        {itemsWithIds && itemsWithIds.length > 0 && (
          <>
            <h5>Items for RFQ #{rowData.rfq_number}</h5>
            <DataTable
              value={itemsWithIds || []}
              className="p-datatable-sm"
              responsiveLayout="scroll"
            >
              <Column field="item_name" header="Item Name" />
              <Column field="quantity" header="Qty" />
              <Column field="unit" header="Unit" />
              <Column field="target_price" header="Target Price" />
              <Column
                header="Vendor Quote"
                body={(itemRow) => {
                  const itemKey = `${rowData.rfq_number}_${itemRow.item_id}`;
                  return (
                    <InputText
                      type="number"
                      value={quotes[itemKey] || ""}
                      disabled={rowData.status?.toLowerCase() === "accepted"}
                      onChange={(e) => {
                        const value = e.target.value;
                        console.log("value of item vendor is zero::", value);
                        setQuotes((prev) => ({
                          ...prev,
                          [itemKey]: value,
                        }));
                      }}
                      onBlur={(e) => {
                        const value = parseFloat(e.target.value);
                        console.log("value of item vendor is one::", value);
                        console.log("checking quotes value::", quotes);
                        const auctionType = rowData.pickup_by_ff?.toLowerCase();
                        const targetPrice = parseFloat(
                          itemRow.target_price || 0
                        );

                        if (
                          auctionType === "fixed price" &&
                          value !== targetPrice
                        ) {
                          dispatch(
                            toastError({
                              detail: `Fixed price auction — you cannot change the quote.`,
                            })
                          );
                          return;
                        }

                        if (
                          auctionType === "variable price" &&
                          value >= targetPrice
                        ) {
                          dispatch(
                            toastError({
                              detail: `Variable price auction — quote must be less than ₹${targetPrice}.`,
                            })
                          );
                          return;
                        }

                        const rfqIndex = rfqs.findIndex(
                          (r) => r.rfq_number === rowData.rfq_number
                        );
                        if (rfqIndex === -1) return;

                        const updatedRfqs = [...rfqs];
                        const rfq = updatedRfqs[rfqIndex];
                        const itemIndex = rfq.rfq_items.findIndex(
                          (i) => i.item_id === itemRow.item_id
                        );
                        console.log("value of item vendor is two::", value);
                        if (itemIndex !== -1) {
                          rfq.rfq_items[itemIndex] = {
                            ...rfq.rfq_items[itemIndex],
                            vendor_quote: value,
                            vendor_id: "1",
                          };
                          updatedRfqs[rfqIndex] = rfq;
                          setRfqs(updatedRfqs);
                        }
                        console.log("value of item vendor is three::", value);
                        setQuotes((prev) => ({
                          ...prev,
                          [itemKey]: value,
                        }));
                      }}
                    />
                  );
                }}
              />

              {rowData.auction_number && !rowData.hide_current_bid_price && (
                <Column
                  header="Competing Bids"
                  body={(itemRow) => {
                    const itemKey = `${rowData.rfq_number}_${itemRow.item_id}`;
                    const itemBids = competingQuotes[itemKey] || [];

                    const sorted = [...itemBids].sort(
                      (a, b) => a.quoted_price - b.quoted_price
                    );

                    return (
                      <div className="text-sm">
                        {sorted.length === 0 && "No Bids Yet"}
                        {sorted.slice(0, 3).map((q, i) => (
                          <div key={i}>
                            L{i + 1}: ₹{q.quoted_price}
                          </div>
                        ))}
                      </div>
                    );
                  }}
                />
              )}

              {rowData.auction_number && rowData.hide_current_bid_price && (
                <Column
                  header="Your Rank"
                  body={(itemRow) => {
                    const key = `${rowData.rfq_number}_${itemRow.item_id}`;
                    const rank = getVendorRank(
                      rowData.rfq_number,
                      itemRow.item_id,
                      user.id,
                      competingQuotes
                    );
                    return <span>{rank}</span>;
                  }}
                />
              )}
              <Column field="status" header="Status" />
              <Column
                header="Action"
                body={(itemRow, options) => (
                  <Button
                    label={
                      rowData.auction_number ? "Place Bid" : "Submit Quote"
                    }
                    icon="pi pi-check"
                    className="p-button-success p-button-sm"
                    onClick={() => submitQuote(rowData.rfq_number)}
                    disabled={rowData.status?.toLowerCase() === "accepted"}
                  />
                )}
              />
            </DataTable>
          </>
        )}

        {rowData.subindustry === "Road Transport" && (
          <>
            <h5 className="mt-3">🚚 Road Transport Details</h5>
            <DataTable
              value={itemsWithRoadTransportIds || []}
              responsiveLayout="scroll"
              className="p-datatable-sm mt-2"
            >
              <Column field="source" header="Source" />
              <Column field="destination" header="Destination" />
              <Column field="loadingBy" header="Loading By" />
              <Column field="unloadingBy" header="Unloading By" />
              <Column field="material" header="Material" />
              <Column
                header="Requirement"
                body={(row) => `${row.requirement} ${row.requirementUnit}`}
              />
              <Column
                header="Material Weight"
                body={(row) => `${row.materialWeight} ${row.materialUnit}`}
              />
              <Column field="vehicleType" header="Vehicle Type" />
              <Column
                field="dateTime"
                header="Date"
                body={(row) => new Date(row.dateTime).toLocaleString()}
              />
              <Column
                header="Distance"
                body={(row) => `${row.distance} ${row.distanceUnit}`}
              />
              <Column field="auctionPrice" header="Auction Price (₹)" />
              <Column field="lastPrice" header="Last Price (₹)" />
              <Column field="decrement" header="Decrement (₹)" />
              {/* <Column field="notes" header="Notes" /> */}

              <Column
                header="Vendor Quote (₹)"
                body={(row) => {
                  const rowKey = `${rowData.rfq_number}_${row.row_id}`;
                  return (
                    <InputText
                      type="number"
                      className="w-full"
                      value={roadTransportQuotes[rowKey] || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        setRoadTransportQuotes((prev) => ({
                          ...prev,
                          [rowKey]: value,
                        }));
                      }}
                      onBlur={(e) => {
                        const value = parseFloat(e.target.value);
                        const updatedRfqs = [...rfqs];
                        const rfqIndex = updatedRfqs.findIndex(
                          (r) => r.rfq_number === rowData.rfq_number
                        );
                        if (rfqIndex === -1) return;

                        const entryIndex = updatedRfqs[
                          rfqIndex
                        ].road_transport_summary.entries.findIndex(
                          (_, idx) => idx === row.row_id
                        );
                        if (entryIndex !== -1) {
                          updatedRfqs[rfqIndex].road_transport_summary.entries[
                            entryIndex
                          ] = {
                            ...updatedRfqs[rfqIndex].road_transport_summary
                              .entries[entryIndex],
                            vendor_quote: value,
                            vendor_id: user.id,
                          };
                          setRfqs(updatedRfqs);
                        }
                      }}
                    />
                  );
                }}
              />

              <Column
                header="Actions"
                body={(row, options) => (
                  <Button
                    icon="pi pi-check"
                    label="Place Quote"
                    className="p-button-sm p-button-success"
                    onClick={() =>
                      handleRoadTransportQuoteSubmit(rowData.rfq_number)
                    }
                  />
                )}
              />
            </DataTable>
          </>
        )}

        {rowData.subindustry == "Ocean Freight" && (
          <>
            {rowData.shipment_details?.map((shipment, shipmentIndex) => (
              <div className="surface-100 p-3 border-round mt-2 mb-3">
                <div className="p-grid">
                  <span className="p-col-4">
                    <strong>REGION:</strong> {shipment.REGION}
                  </span>
                  <span className="p-col-4 pl-4">
                    <strong>FPD:</strong> {shipment.FPD}
                  </span>
                  <span className="p-col-4 pl-4">
                    <strong>CargoType:</strong> {shipment.CargoType}
                  </span>

                  <span className="p-col-4 pl-4">
                    <strong>Equipment Size:</strong> {shipment.EquipmentSize}
                  </span>
                  <span className="p-col-4 pl-4">
                    <strong>Delivery Type Incoterms:</strong>{" "}
                    {shipment.DeliveryTypeIncoterms}
                  </span>
                  <span className="p-col-4 pl-4">
                    <strong>CargoWt MT:</strong> {shipment["FF Pickup"]}
                  </span>

                  <span className="p-col-4 pl-4">
                    <strong>Free Days At Destination:</strong>{" "}
                    {shipment.FreeDaysAtDestination}
                  </span>
                  <span className="p-col-4 pl-4">
                    <strong>HS Code:</strong> {shipment["HS Code"]}
                  </span>
                  <span className="p-col-4 pl-4">
                    <strong>Monthly Volume:</strong> {shipment.MonthlyVolume}
                  </span>

                  <span className="p-col-4 pl-4">
                    <strong>Condition:</strong> {shipment.Condition}
                  </span>
                  <span className="p-col-4 pl-4">
                    <strong>cargo Type:</strong> {rowData.cargoType}
                  </span>
                  <span className="p-col-4 pl-4">
                    <strong>Value of Shipment:</strong> ₹
                    {shipment.package_summary?.value_of_shipment || 0}
                  </span>

                  <span className="p-col-4 pl-4">
                    <strong>Currency:</strong>{" "}
                    {shipment.package_summary?.shipment_currency}
                  </span>
                  <span className="p-col-4 pl-4">
                    <strong>Gross Wt:</strong>{" "}
                    {shipment.package_summary?.totalGrossWeight} kg
                  </span>
                  <span className="p-col-4 pl-4">
                    <strong>Vol. Wt:</strong>{" "}
                    {shipment.package_summary?.totalVolumetricWeight} kg
                  </span>

                  <span className="p-col-4 pl-4">
                    <strong>Chargeable Wt:</strong>{" "}
                    {shipment.package_summary?.chargeableWeight} kg
                  </span>
                  <span className="p-col-4 pl-4">
                    <strong>CBM:</strong> {shipment.package_summary?.totalCBM}
                  </span>
                  <div className="p-col-12 text-right mt-3">
                    <Button
                      icon="pi pi-send"
                      label="Submit Quote"
                      className="p-button-success mt-3"
                      onClick={() =>
                        handleShiplinePackageSubmit(shipmentIndex, rowData)
                      }
                    />
                    <Button
                      label="Add Shipline"
                      icon="pi pi-plus"
                      className="p-button-sm p-button-secondary"
                      onClick={() => handleAddShipline(shipmentIndex)}
                    />
                  </div>
                </div>

                {(shiplineData[shipmentIndex] || []).map((row, idx) => (
                  <div
                    className="grid p-2 align-items-center mt-3 border-top-3 border-bottom-3 surface-border"
                    key={idx}
                  >
                    <div className="col-2 p-1">
                      <label>Shipline Name</label>
                      <InputText
                        value={row.sealine_name}
                        className="w-full"
                        onChange={(e) =>
                          handleSealineInputChange(
                            shipment,
                            shipmentIndex,
                            idx,
                            "sealine_name",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div className="col-2 p-1">
                      <label>Seaport</label>
                      <InputText
                        value={row.sea_port}
                        className="w-full"
                        onChange={(e) =>
                          handleSealineInputChange(
                            shipment,
                            shipmentIndex,
                            idx,
                            "sea_port",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div className="col-2 p-1">
                      <label>Freight Per Cont</label>
                      <InputText
                        value={row.freight_per_container}
                        className="w-full"
                        type="number"
                        onChange={(e) =>
                          handleSealineInputChange(
                            shipment,
                            shipmentIndex,
                            idx,
                            "freight_per_container",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div className="col-1 p-1">
                      <label>Temperature</label>
                      <InputText
                        value={row.temperature}
                        className="w-full"
                        type="text"
                        onChange={(e) =>
                          handleSealineInputChange(
                            shipment,
                            shipmentIndex,
                            idx,
                            "temperature",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div className="col-1 p-1">
                      <label>DAP / DDP</label>
                      <InputText
                        value={row.dap_ddp}
                        className="w-full"
                        type="number"
                        onChange={(e) =>
                          handleSealineInputChange(
                            shipment,
                            shipmentIndex,
                            idx,
                            "dap_ddp",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div className="col-1 p-1">
                      <label>Transit Time</label>
                      <InputText
                        value={row.transit_time}
                        className="w-full"
                        type="text"
                        onChange={(e) =>
                          handleSealineInputChange(
                            shipment,
                            shipmentIndex,
                            idx,
                            "transit_time",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div className="col-2 p-1">
                      <label>Freight Per CBM</label>
                      <InputText
                        value={row.freight_per_cbm}
                        className="w-full"
                        type="number"
                        onChange={(e) =>
                          handleSealineInputChange(
                            shipment,
                            shipmentIndex,
                            idx,
                            "freight_per_cbm",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div className="col-2 p-1">
                      <label>Origin Charges</label>
                      <InputText
                        value={row.origin_charges}
                        className="w-full"
                        type="number"
                        onChange={(e) =>
                          handleSealineInputChange(
                            shipment,
                            shipmentIndex,
                            idx,
                            "origin_charges",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="col-2 p-1">
                      <label>Destination Charges</label>
                      <InputText
                        value={row.destination_charges}
                        className="w-full"
                        type="number"
                        onChange={(e) =>
                          handleSealineInputChange(
                            shipment,
                            shipmentIndex,
                            idx,
                            "destination_charges",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div className="col-1 p-1">
                      <label>Remarks</label>
                      <InputText
                        value={row.remarks}
                        className="w-full"
                        type="text"
                        onChange={(e) =>
                          handleSealineInputChange(
                            shipment,
                            shipmentIndex,
                            idx,
                            "remarks",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div className="col-1 p-1">
                      <label>Rate Validity</label>
                      <InputText
                        value={row.rate_validity}
                        className="w-full"
                        type="text"
                        onChange={(e) =>
                          handleSealineInputChange(
                            shipment,
                            shipmentIndex,
                            idx,
                            "rate_validity",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div className="col-1 p-1">
                      <label>All In Freight</label>
                      <InputText
                        value={row.all_in_freight}
                        className="w-full"
                        type="text"
                        onChange={(e) =>
                          handleSealineInputChange(
                            shipment,
                            shipmentIndex,
                            idx,
                            "all_in_freight",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="col-1 p-1">
                      <label>THC</label>
                      <InputText
                        value={row.thc}
                        className="w-full"
                        type="number"
                        onChange={(e) =>
                          handleSealineInputChange(
                            shipment,
                            shipmentIndex,
                            idx,
                            "thc",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="col-1 p-1">
                      <label>BL Fee</label>
                      <InputText
                        value={row.blFee}
                        className="w-full"
                        type="number"
                        onChange={(e) =>
                          handleSealineInputChange(
                            shipment,
                            shipmentIndex,
                            idx,
                            "blFee",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="col-2 p-1">
                      <label>ENS ACD Fee</label>
                      <InputText
                        value={row.ensAcdFee}
                        className="w-full"
                        type="number"
                        onChange={(e) =>
                          handleSealineInputChange(
                            shipment,
                            shipmentIndex,
                            idx,
                            "ensAcdFee",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="col-2 p-1">
                      <label>Other Charges</label>
                      <InputText
                        value={row.other_charges}
                        className="w-full"
                        type="number"
                        onChange={(e) =>
                          handleSealineInputChange(
                            shipment,
                            shipmentIndex,
                            idx,
                            "other_charges",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="col-1 p-1">
                      <label>Haulage</label>
                      <InputText
                        value={row.haulage}
                        className="w-full"
                        type="number"
                        onChange={(e) =>
                          handleSealineInputChange(
                            shipment,
                            shipmentIndex,
                            idx,
                            "haulage",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="col-2 p-1">
                      <label>Customs Clearance</label>
                      <InputText
                        value={row.customs_clearance}
                        className="w-full"
                        type="number"
                        onChange={(e) =>
                          handleSealineInputChange(
                            shipment,
                            shipmentIndex,
                            idx,
                            "customs_clearance",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="col-1 p-1">
                      <label>ISF</label>
                      <InputText
                        value={row.isf}
                        className="w-full"
                        type="number"
                        onChange={(e) =>
                          handleSealineInputChange(
                            shipment,
                            shipmentIndex,
                            idx,
                            "isf",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="col-1 p-1">
                      <label>DTHC</label>
                      <InputText
                        value={row.dthc}
                        className="w-full"
                        type="number"
                        onChange={(e) =>
                          handleSealineInputChange(
                            shipment,
                            shipmentIndex,
                            idx,
                            "dthc",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="col-1 p-1">
                      <label>DODDC</label>
                      <InputText
                        value={row.doDdc}
                        className="w-full"
                        type="number"
                        onChange={(e) =>
                          handleSealineInputChange(
                            shipment,
                            shipmentIndex,
                            idx,
                            "doDdc",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="col-1 p-1">
                      <label>HMF</label>
                      <InputText
                        value={row.hmf}
                        className="w-full"
                        type="number"
                        onChange={(e) =>
                          handleSealineInputChange(
                            shipment,
                            shipmentIndex,
                            idx,
                            "hmf",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="col-1 p-1">
                      <label>MPE</label>
                      <InputText
                        value={row.mpe}
                        className="w-full"
                        type="number"
                        onChange={(e) =>
                          handleSealineInputChange(
                            shipment,
                            shipmentIndex,
                            idx,
                            "mpe",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="col-1 p-1">
                      <label>PrePull</label>
                      <InputText
                        value={row.prePull}
                        className="w-full"
                        type="number"
                        onChange={(e) =>
                          handleSealineInputChange(
                            shipment,
                            shipmentIndex,
                            idx,
                            "prePull",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="col-2 p-1">
                      <label>Other Destination Charges</label>
                      <InputText
                        value={row.other_destination_charges}
                        className="w-full"
                        type="number"
                        onChange={(e) =>
                          handleSealineInputChange(
                            shipment,
                            shipmentIndex,
                            idx,
                            "other_destination_charges",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="col-2 p-1">
                      <label>Origin Detention</label>
                      <InputText
                        value={row.origin_detention}
                        className="w-full"
                        type="number"
                        onChange={(e) =>
                          handleSealineInputChange(
                            shipment,
                            shipmentIndex,
                            idx,
                            "origin_detention",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="col-2 p-1">
                      <label>Destination Detention</label>
                      <InputText
                        value={row.destination_detention}
                        className="w-full"
                        type="number"
                        onChange={(e) =>
                          handleSealineInputChange(
                            shipment,
                            shipmentIndex,
                            idx,
                            "destination_detention",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="col-2 p-1">
                      <label>Destination Combine</label>
                      <InputText
                        value={row.destination_combine}
                        className="w-full"
                        type="number"
                        onChange={(e) =>
                          handleSealineInputChange(
                            shipment,
                            shipmentIndex,
                            idx,
                            "destination_combine",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="col-2 p-1">
                      <label>Shipping Line</label>
                      <InputText
                        value={row.shipping_line}
                        className="w-full"
                        type="text"
                        onChange={(e) =>
                          handleSealineInputChange(
                            shipment,
                            shipmentIndex,
                            idx,
                            "shipping_line",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="col-2 p-1">
                      <label>Transit Time</label>
                      <InputText
                        value={row.transit_time}
                        className="w-full"
                        type="text"
                        onChange={(e) =>
                          handleSealineInputChange(
                            shipment,
                            shipmentIndex,
                            idx,
                            "transit_time",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="col-1 p-1">
                      <label>Routing</label>
                      <InputText
                        value={row.routing}
                        className="w-full"
                        type="text"
                        onChange={(e) =>
                          handleSealineInputChange(
                            shipment,
                            shipmentIndex,
                            idx,
                            "routing",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="col-1 p-1">
                      <label>Validity</label>
                      <InputText
                        value={row.validity}
                        className="w-full"
                        type="text"
                        onChange={(e) =>
                          handleSealineInputChange(
                            shipment,
                            shipmentIndex,
                            idx,
                            "validity",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="col-1 p-1">
                      <label>Total</label>
                      <InputText
                        value={row.total_charges}
                        className="w-full"
                        type="text"
                        onChange={(e) =>
                          handleSealineInputChange(
                            shipment,
                            shipmentIndex,
                            idx,
                            "total_charges",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="col-2 p-1">
                      {/* <Button
                        icon="pi pi-angle-down"
                        className="p-button-text p-button-secondary"
                        onClick={() => toggleMoreInfo(shipmentIndex, idx)}
                        tooltip="More Info"
                      /> */}
                      <Button
                        icon="pi pi-trash"
                        className="p-button-text p-button-danger"
                        onClick={() =>
                          handleDeleteShiplineRow(shipmentIndex, idx)
                        }
                      />
                    </div>
                  </div>
                ))}

                <DataTable
                  value={shipment.package_summary?.packages || []}
                  responsiveLayout="scroll"
                  className="p-datatable-sm"
                >
                  <Column field="type" header="Package Type" />
                  <Column field="number" header="No. of Pkgs" />
                  <Column field="length" header="Length (cm)" />
                  <Column field="breadth" header="Breadth (cm)" />
                  <Column field="height" header="Height (cm)" />
                  <Column field="gross_weight" header="Gross Wt (kg)" />

                  <Column
                    header="Action"
                    body={(pkg, options) => {
                      const rowIndex = options.rowIndex;
                      return (
                        <Button
                          style={{ display: "none" }}
                          label="Place Quote"
                          icon="pi pi-check"
                          className="p-button-sm p-button-success"
                          onClick={() =>
                            handlePackageSubmit(
                              shipmentIndex,
                              rowIndex,
                              rowData
                            )
                          }
                        />
                      );
                    }}
                  />
                </DataTable>
              </div>
            ))}
          </>
        )}

        {rowData.subindustry == "Air Cargo" && (
          <div>
            {rowData.shipment_details?.map((shipment, shipmentIndex) => (
              <div key={shipmentIndex} className="mb-4">
                <h5 className="mt-4">✈️ Shipment {shipmentIndex + 1}</h5>
                <div className="surface-100 p-3 border-round mt-2 mb-3">
                  <div className="p-grid">
                    <span className="p-col-4">
                      <strong>Temp:</strong> {shipment.Temp}°C
                    </span>
                    <span className="p-col-4 pl-4">
                      <strong>Country:</strong> {shipment.Country}
                    </span>
                    <span className="p-col-4 pl-4">
                      <strong>Factory:</strong> {shipment.Factory}
                    </span>

                    <span className="p-col-4 pl-4">
                      <strong>Clearance:</strong> {shipment.Clearance}
                    </span>
                    <span className="p-col-4 pl-4">
                      <strong>Delivery Terms:</strong> {shipment.DeliveryTerms}
                    </span>
                    <span className="p-col-4 pl-4">
                      <strong>FF Pickup:</strong> {shipment["FF Pickup"]}
                    </span>

                    <span className="p-col-4 pl-4">
                      <strong>Commodity:</strong> {shipment.Commodity}
                    </span>
                    <span className="p-col-4 pl-4">
                      <strong>HS Code:</strong> {shipment["HS Code"]}
                    </span>
                    <span className="p-col-4 pl-4">
                      <strong>Consignee:</strong> {shipment.Consignee}
                    </span>

                    <span className="p-col-4 pl-4">
                      <strong>Incoterm:</strong> {shipment.Incoterm}
                    </span>
                    <span className="p-col-4 pl-4">
                      <strong>Notes:</strong> {shipment.Notes}
                    </span>
                    <span className="p-col-4 pl-4">
                      <strong>Value of Shipment:</strong> ₹
                      {shipment.package_summary?.value_of_shipment || 0}
                    </span>

                    <span className="p-col-4 pl-4">
                      <strong>Currency:</strong>{" "}
                      {shipment.package_summary?.shipment_currency}
                    </span>
                    <span className="p-col-4 pl-4">
                      <strong>Gross Wt:</strong>{" "}
                      {shipment.package_summary?.totalGrossWeight} kg
                    </span>
                    <span className="p-col-4 pl-4">
                      <strong>Vol. Wt:</strong>{" "}
                      {shipment.package_summary?.totalVolumetricWeight} kg
                    </span>

                    <span className="p-col-4 pl-4">
                      <strong>Chargeable Wt:</strong>{" "}
                      {shipment.package_summary?.chargeableWeight} kg
                    </span>
                    <span className="p-col-4 pl-4">
                      <strong>CBM:</strong> {shipment.package_summary?.totalCBM}
                    </span>
                    <div className="p-col-12 text-right mt-3">
                      <Button
                        icon="pi pi-send"
                        label="Submit Quote"
                        className="p-button-success mt-3"
                        onClick={() =>
                          handlePackageSubmit(shipmentIndex, rowData)
                        }
                      />
                      <Button
                        label="Add Airline"
                        icon="pi pi-plus"
                        className="p-button-sm p-button-secondary"
                        onClick={() => handleAddAirline(shipmentIndex)}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid p-2 font-bold border-bottom-1 surface-border">
                  <div className="col-1">Airline</div>
                  <div className="col-1">Airport</div>
                  {/* <div className="col-1">Gross Wt</div>
              <div className="col-1">Volume Wt</div> */}
                  <div className="col-1">Chargeable Wt(KG)</div>
                  <div className="col-1">Base Rate (Rs/KG)</div>
                  <div className="col-1">AMS</div>
                  <div className="col-1">PAC</div>
                  <div className="col-1">AWB</div>
                  <div className="col-1">Currency</div>
                  <div className="col-1">DDP</div>
                  <div className="col-1">Other Charges</div>
                  <div className="col-1">Total</div>
                  <div className="col-2">Actions</div>
                </div>
                {(airlineData[shipmentIndex] || []).map((row, idx) => (
                  <div className="grid p-2 align-items-center" key={idx}>
                    <div className="col-1 p-1">
                      <InputText
                        value={row.airline_name}
                        className="w-full"
                        onChange={(e) =>
                          handleInputChange(
                            shipment,
                            shipmentIndex,
                            idx,
                            "airline_name",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div className="col-1 p-1">
                      <InputText
                        value={row.airport}
                        className="w-full"
                        onChange={(e) =>
                          handleInputChange(
                            shipment,
                            shipmentIndex,
                            idx,
                            "airport",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div className="col-1 p-1">
                      <InputText
                        value={row.chargeable_weight}
                        className="w-full"
                        type="number"
                        onChange={(e) =>
                          handleInputChange(
                            shipment,
                            shipmentIndex,
                            idx,
                            "chargeable_weight",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div className="col-1 p-1">
                      <InputText
                        value={row.base_rate}
                        className="w-full"
                        type="number"
                        onChange={(e) =>
                          handleInputChange(
                            shipment,
                            shipmentIndex,
                            idx,
                            "base_rate",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div className="col-1 p-1">
                      <InputText
                        value={row.ams}
                        className="w-full"
                        type="number"
                        onChange={(e) =>
                          handleInputChange(
                            shipment,
                            shipmentIndex,
                            idx,
                            "ams",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div className="col-1 p-1">
                      <InputText
                        value={row.pac}
                        className="w-full"
                        type="number"
                        onChange={(e) =>
                          handleInputChange(
                            shipment,
                            shipmentIndex,
                            idx,
                            "pac",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div className="col-1 p-1">
                      <InputText
                        value={row.awb}
                        className="w-full"
                        type="number"
                        onChange={(e) =>
                          handleInputChange(
                            shipment,
                            shipmentIndex,
                            idx,
                            "awb",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div className="col-1 p-1">
                      <Dropdown
                        value={row.currency || "INR"}
                        options={["INR", "USD", "EUR"]}
                        onChange={(e) =>
                          handleInputChange(
                            shipment,
                            shipmentIndex,
                            idx,
                            "currency",
                            e.value
                          )
                        }
                        className="w-7rem"
                      />
                    </div>

                    <div className="col-1 p-1">
                      <InputText
                        body={(row) => <span>{row.dap_ddp_charges}</span>}
                        className="w-full"
                        type="number"
                        onChange={(e) =>
                          handleInputChange(
                            shipment,
                            shipmentIndex,
                            idx,
                            "dap_ddp_charges",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div className="col-1 p-1">
                      <InputText
                        value={row.other_charges}
                        className="w-full"
                        type="number"
                        onChange={(e) =>
                          handleInputChange(
                            shipment,
                            shipmentIndex,
                            idx,
                            "other_charges",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div className="col-1 p-1">
                      <InputText
                        value={row.total_charges}
                        className="w-full"
                        type="number"
                        onChange={(e) =>
                          handleInputChange(
                            shipment,
                            shipmentIndex,
                            idx,
                            "total_charges",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div className="col-2 p-1">
                      <Button
                        icon="pi pi-angle-down"
                        className="p-button-text p-button-secondary"
                        onClick={() => toggleMoreInfo(shipmentIndex, idx)}
                        tooltip="More Info"
                      />
                      <Button
                        icon="pi pi-trash"
                        className="p-button-text p-button-danger"
                        onClick={() => handleDeleteRow(shipmentIndex, idx)}
                      />
                    </div>
                  </div>
                ))}
                {(airlineData[shipmentIndex] || []).map((row, rowIndex) => {
                  const expanded =
                    expandedModalRows[`${shipmentIndex}_${rowIndex}`];
                  return expanded ? (
                    <div
                      key={`more-info-${shipmentIndex}-${rowIndex}`}
                      className="p-3 mb-3 border-1 border-round surface-100"
                    >
                      <div className="grid formgrid p-fluid">
                        <div className="field col-12 md:col-4">
                          <label>Transit Days</label>
                          <InputText
                            value={row.transit_days || ""}
                            onChange={(e) =>
                              handleInputChange(
                                shipment,
                                shipmentIndex,
                                rowIndex,
                                "transit_days",
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div className="field col-12 md:col-4">
                          <label>Freight Per Kg</label>
                          <InputText
                            value={row.freight_per_kg || ""}
                            onChange={(e) =>
                              handleInputChange(
                                shipment,
                                shipmentIndex,
                                rowIndex,
                                "freight_per_kg",
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div className="field col-12 md:col-4">
                          <label>Booking Reference</label>
                          <InputText
                            value={row.booking_reference || ""}
                            onChange={(e) =>
                              handleInputChange(
                                shipment,
                                shipmentIndex,
                                rowIndex,
                                "booking_reference",
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div className="field col-12 md:col-4">
                          <label>Flight Route</label>
                          <InputText
                            value={row.route || ""}
                            onChange={(e) =>
                              handleInputChange(
                                shipment,
                                shipmentIndex,
                                rowIndex,
                                "route",
                                e.target.value
                              )
                            }
                          />
                        </div>

                        <div className="field col-12 md:col-4">
                          <label>Flight Schedule</label>
                          <Calendar
                            value={
                              row.flight_schedule
                                ? new Date(row.flight_schedule)
                                : null
                            }
                            onChange={(e) =>
                              handleInputChange(
                                shipment,
                                shipmentIndex,
                                rowIndex,
                                "flight_schedule",
                                e.value
                              )
                            }
                            showIcon
                            dateFormat="dd/mm/yy"
                            className="w-full"
                          />
                        </div>

                        <div className="field col-12 md:col-4">
                          <label>Pickup Date</label>
                          <Calendar
                            value={
                              row.pickup_date ? new Date(row.pickup_date) : null
                            }
                            onChange={(e) =>
                              handleInputChange(
                                shipment,
                                shipmentIndex,
                                rowIndex,
                                "pickup_date",
                                e.value
                              )
                            }
                            showIcon
                            dateFormat="dd/mm/yy"
                            className="w-full"
                          />
                        </div>

                        <div className="field col-12 md:col-4">
                          <label>Clearance Date</label>
                          <Calendar
                            value={
                              row.clearance_date
                                ? new Date(row.clearance_date)
                                : null
                            }
                            onChange={(e) =>
                              handleInputChange(
                                shipment,
                                shipmentIndex,
                                rowIndex,
                                "clearance_date",
                                e.value
                              )
                            }
                            showIcon
                            dateFormat="dd/mm/yy"
                            className="w-full"
                          />
                        </div>

                        <div className="field col-12 md:col-4">
                          <label>Validity Date</label>
                          <Calendar
                            value={
                              row.freight_validity
                                ? new Date(row.freight_validity)
                                : null
                            }
                            onChange={(e) =>
                              handleInputChange(
                                shipment,
                                shipmentIndex,
                                rowIndex,
                                "freight_validity",
                                e.value
                              )
                            }
                            showIcon
                            dateFormat="dd/mm/yy"
                            className="w-full"
                          />
                        </div>
                        <div className="field col-12 md:col-4">
                          <label>Currency</label>
                          <Dropdown
                            value={row.currency || "INR"}
                            options={["INR", "USD", "EUR"]}
                            onChange={(e) =>
                              handleInputChange(
                                shipment,
                                shipmentIndex,
                                rowIndex,
                                "currency",
                                e.value
                              )
                            }
                            className="w-full"
                          />
                        </div>
                        <div className="field col-12 md:col-4">
                          <label>Insurance Provided?</label>
                          <Dropdown
                            value={row.insurance || "No"}
                            options={["Yes", "No"]}
                            onChange={(e) =>
                              handleInputChange(
                                shipment,
                                shipmentIndex,
                                rowIndex,
                                "insurance",
                                e.value
                              )
                            }
                            className="w-full"
                          />
                        </div>
                        <div className="field col-12 md:col-4">
                          <label>Pickup Charges</label>
                          <InputNumber
                            value={row.pickup_charges || 0}
                            onValueChange={(e) =>
                              handleInputChange(
                                shipment,
                                shipmentIndex,
                                rowIndex,
                                "pickup_charges",
                                e.value
                              )
                            }
                            className="w-full"
                          />
                        </div>
                        <div className="field col-12 md:col-4">
                          <label>Documentation Charges</label>
                          <InputNumber
                            value={row.documentation_charges || 0}
                            onValueChange={(e) =>
                              handleInputChange(
                                shipment,
                                shipmentIndex,
                                rowIndex,
                                "documentation_charges",
                                e.value
                              )
                            }
                            className="w-full"
                          />
                        </div>
                        <div className="field col-12 md:col-4">
                          <label>Customs Handling Charges</label>
                          <InputNumber
                            value={row.customs_handling || 0}
                            onValueChange={(e) =>
                              handleInputChange(
                                shipment,
                                shipmentIndex,
                                rowIndex,
                                "customs_handling",
                                e.value
                              )
                            }
                            className="w-full"
                          />
                        </div>
                        <div className="field col-12 md:col-4">
                          <label>Free Storage Days</label>
                          <InputNumber
                            value={row.free_storage_days || 0}
                            onValueChange={(e) =>
                              handleInputChange(
                                shipment,
                                shipmentIndex,
                                rowIndex,
                                "free_storage_days",
                                e.value
                              )
                            }
                            className="w-full"
                          />
                        </div>
                        <div className="field col-12">
                          <label>Remarks / Conditions</label>
                          <InputTextarea
                            value={row.remarks || ""}
                            onChange={(e) =>
                              handleInputChange(
                                shipment,
                                shipmentIndex,
                                rowIndex,
                                "remarks",
                                e.target.value
                              )
                            }
                            rows={2}
                            className="w-full"
                          />
                        </div>
                      </div>
                    </div>
                  ) : null;
                })}
                <DataTable
                  value={shipment.package_summary?.packages || []}
                  responsiveLayout="scroll"
                  className="p-datatable-sm"
                >
                  <Column field="type" header="Package Type" />
                  <Column field="number" header="No. of Pkgs" />
                  <Column field="length" header="Length (cm)" />
                  <Column field="breadth" header="Breadth (cm)" />
                  <Column field="height" header="Height (cm)" />
                  <Column field="gross_weight" header="Gross Wt (kg)" />

                  <Column
                    header="Action"
                    body={(pkg, options) => {
                      const rowIndex = options.rowIndex;
                      return (
                        <Button
                          style={{ display: "none" }}
                          label="Place Quote"
                          icon="pi pi-check"
                          className="p-button-sm p-button-success"
                          onClick={() =>
                            handlePackageSubmit(
                              shipmentIndex,
                              rowIndex,
                              rowData
                            )
                          }
                        />
                      );
                    }}
                  />
                </DataTable>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const header = <h5 className="mb-2">RFQ List</h5>;

  const actionBodyTemplate = (rowData) => (
    <div className="flex gap-2">
      <Button
        icon="pi pi-eye"
        className="p-button-sm p-button-info"
        onClick={() =>
          navigate(
            rowData.auction_number
              ? `/rfq/view/${rowData.rfq_number}?source=auction`
              : `/rfq/view/${rowData.rfq_number}`
          )
        }
      />
      <Button
        icon="pi pi-trash"
        className="p-button-sm p-button-danger"
        onClick={() => handleDelete(rowData.rfq_number)}
      />
      {rowData.status === "evaluated" && (
        <Button
          label="Convert to Auction"
          icon="pi pi-forward"
          className="p-button-sm p-button-warning"
          onClick={() =>
            navigate(`/rfq/view/${rowData.rfq_number}?source=auction`)
          }
        />
      )}

      {["received_quotes", "evaluated", "negotiation"].includes(
        rowData.status
      ) && (
        <Button
          label="View Quote"
          icon="pi pi-list"
          className="p-button-sm p-button-secondary"
          onClick={() => navigate(`/quote-summary/${rowData.rfq_number}`)}
        />
      )}
    </div>
  );

  const handleDelete = async (rfq_number) => {
    if (!window.confirm("Are you sure you want to delete this RFQ?")) return;

    const response = await postData(`rfq/${rfq_number}/delete`, {});
    if (response?.isSuccess) {
      dispatch(toastSuccess({ detail: "RFQ deleted successfully!" }));
    } else {
      dispatch(
        toastError({ detail: response?.msg || "Failed to delete RFQ." })
      );
    }
  };

  const submitQuote = async (rfqId) => {
    console.log("quotes on submit", quotes);
    const rfq = rfqs.find((r) => r.rfq_number === rfqId);
    const vendorId = user.id;
    const itemQuotes = (rfq.rfq_items || []).map((item, index) => {
      const itemKey = `${rfq.rfq_number}_${index + 1}`;
      console.log("item key value", itemKey);
      const quoted_price = parseFloat(quotes[itemKey]);
      console.log("quoted price value", quoted_price);

      return {
        item_id: index + 1,
        quoted_price: isNaN(quoted_price) ? 0 : quoted_price,
        item_name: item.item_name,
        status: "submitted",
      };
    });
    const payload = {
      rfq_id: rfqId,
      vendor_id: parseInt(vendorId),
      quotes: itemQuotes,
    };

    console.log("payload value::", payload);

    try {
      const token = localStorage.getItem("USERTOKEN");
      const response = await fetch("/apis/quotes", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log("Submit Quote  response", result);
      dispatch(toastSuccess({ detail: "Quote Submitted Successfully.." }));
    } catch (error) {
      console.error("Error submitting quote:", error);
    }
  };

  const handleRoadTransportQuoteSubmit = async (rfqId) => {
    const rfq = rfqs.find((r) => r.rfq_number === rfqId);
    const vendorId = user.id;

    if (!rfq || !rfq.road_transport_summary?.entries) {
      console.warn("Invalid RFQ or road transport data");
      return;
    }

    const quotesPayload = rfq.road_transport_summary.entries.map(
      (entry, index) => {
        const rowKey = `${rfq.rfq_number}_${index}`;
        const quoted_price = parseFloat(roadTransportQuotes[rowKey]);
        return {
          row_id: index + 1,
          source: entry.source,
          sourceZip: entry.sourceZip,
          destination: entry.destination,
          destinationZip: entry.destinationZip,
          loadingBy: entry.loadingBy,
          unloadingBy: entry.unloadingBy,
          material: entry.material,
          requirement: entry.requirement,
          requirementUnit: entry.requirementUnit,
          materialWeight: entry.materialWeight,
          materialUnit: entry.materialUnit,
          vehicleType: entry.vehicleType,
          dateTime: entry.dateTime,
          distance: entry.distance,
          distanceUnit: entry.distanceUnit,
          quoted_price: isNaN(quoted_price) ? 0 : quoted_price,
          vendor_id: vendorId,
          status: "submitted",
        };
      }
    );

    const payload = {
      rfq_id: rfq.rfq_number,
      vendor_id: vendorId,
      road_transport_quotes: quotesPayload,
    };

    console.log("🚛 Road Transport Quote Payload", payload);

    try {
      const token = localStorage.getItem("USERTOKEN");
      const response = await fetch("/apis/quotes", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log("Submit Quote  response", result);
      dispatch(toastSuccess({ detail: "Quote Submitted Successfully.." }));
    } catch (error) {
      console.error("Error submitting quote:", error);
    }
  };

  return (
    <div className="p-4">
      <h3>RFQ - Auction Management</h3>

      <div className="flex justify-content-end mb-3">
        <span className="p-input-icon-left w-full md:w-30rem">
          <i className="pi pi-search" />
          <InputText
            placeholder="Global Search"
            className="w-full"
            onInput={(e) => setGlobalFilter(e.target.value)}
          />
        </span>
      </div>
      {role === "user" && (
        <DataTable
          value={rfqs}
          paginator
          rows={10}
          responsiveLayout="scroll"
          sortMode="multiple"
          globalFilterFields={[
            "title",
            "type",
            "transport_mode",
            "currency",
            "rfq_number",
          ]}
          filters={filters}
          filterDisplay="menu"
          removableSort
          className="p-datatable-sm"
        >
          <Column
            body={(rowData) => rowData.auction_number || rowData.rfq_number}
            header="RFQ / Auction #"
            sortable
          />
          <Column
            header="Title"
            sortable
            filter
            filterPlaceholder="Search..."
            body={(rowData) => rowData.title?.toUpperCase()}
          />
          <Column
            body={(rowData) => rowData.form_type?.toUpperCase()}
            header="Status"
            sortable
            filter
            filterPlaceholder="Search..."
          />
          <Column
            header="Vendors Responded"
            sortable
            filter
            filterPlaceholder="Search..."
            body={(rowData) =>
              rowData.quote_count ? `${rowData.quote_count}` : "No Quotes"
            }
          />
          <Column
            field="open_date_time"
            header="Open Date"
            sortable
            filter
            body={(rowData) => formatDate(rowData.open_date_time)}
          />
          <Column
            field="close_date_time"
            header="End Date"
            sortable
            filter
            body={(rowData) => formatDate(rowData.close_date_time)}
          />
          <Column
            header="Actions"
            body={actionBodyTemplate}
            style={{ minWidth: "8rem" }}
          />
        </DataTable>
      )}
      {role === "vendor" && (
        <DataTable
          value={filteredRfqs}
          expandedRows={expandedRows}
          onRowToggle={(e) => setExpandedRows(e.data)}
          onRowExpand={(e) => fetchQuotesById(e.data.rfq_number)}
          rowExpansionTemplate={rowExpansionTemplate}
          dataKey="row_id"
          responsiveLayout="scroll"
          className="p-datatable-gridlines"
          paginator
          rows={5}
          header={header}
        >
          <Column expander style={{ width: "3rem" }} />
          <Column
            body={(rowData) => rowData.auction_number || rowData.rfq_number}
            header="RFQ / Auction #"
          />
          <Column
            body={(rowData) =>
              rowData.title ? rowData.title.toUpperCase() : ""
            }
            header="Title"
          />
          <Column
            body={(rowData) =>
              rowData.rfq_type ? rowData.rfq_type.toUpperCase() : ""
            }
            header="Type"
          />
          <Column field="buyer.email" header="Buyer Name" />
          <Column
            body={(rowData) => formatDate(rowData.close_date_time)}
            header="Submission Deadline"
          />
          <Column field="rfq_items.length" header="Items Count" />
          <Column
            body={(rowData) =>
              rowData.status
                ? getVendorStatusFromBuyerStatus(rowData.status).toUpperCase()
                : getVendorStatusFromBuyerStatus(
                    rowData.form_type
                  )?.toUpperCase()
                ? getVendorStatusFromBuyerStatus(
                    rowData.form_type
                  ).toUpperCase()
                : ""
            }
            header="Status"
          />
          <Column
            header="Actions"
            body={(rowData) => (
              <Button
                icon="pi pi-eye"
                className="p-button-sm p-button-info"
                onClick={() =>
                  navigate(
                    rowData.auction_number
                      ? `/rfq/view/${rowData.rfq_number}?source=auction`
                      : `/rfq/view/${rowData.rfq_number}`
                  )
                }
              />
            )}
          />
        </DataTable>
      )}
    </div>
  );
};

export default RfqManagement;
