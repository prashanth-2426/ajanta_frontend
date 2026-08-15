import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
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
import { InputText } from "primereact/inputtext";
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
import { Accordion, AccordionTab } from "primereact/accordion";
import { MultiSelect } from "primereact/multiselect";
import { ProgressSpinner } from "primereact/progressspinner";
import { set } from "react-hook-form";
import { Tag } from "primereact/tag";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";

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
  const [selectedCurrency, setSelectedCurrency] = useState(null);

  const [isFlatView, setIsFlatView] = useState(true);
  const [invAmount, setInvAmount] = useState(null);
  const [exchangeRate, setExchangeRate] = useState(null);
  const [shipmentValue, setShipmentValue] = useState(null);

  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const [showHodApprovalDialog, setShowHodApprovalDialog] = useState(false);
  const [showDocumentsUploadDialog, setShowDocumentsUploadDialog] =
    useState(false);

  const [showShareToMarketTeamDialog, setShowShareToMarketTeamDialog] =
    useState(false);

  const [showShareToAccountsTeamDialog, setShowShareToAccountsTeamDialog] =
    useState(false);

  const [showHODDecisionDialog, setShowHODDecisionDialog] = useState(false);
  const [showNegotiateDialog, setShowNegotiateDialog] = useState(false);
  const [showAuctionDialog, setShowAuctionDialog] = useState(false);
  const [acceptRemarks, setAcceptRemarks] = useState("");
  const [expandedRows, setExpandedRows] = useState(null);

  const [hodAttachment, setHodAttachment] = useState(null);

  const [dialogParams, setDialogParams] = useState(null);

  const [attachment, setAttachment] = useState([]);

  const [activeStep, setActiveStep] = useState("marketing");

  const usersdata = useSelector((state) => state.users.data);
  const hodUsers = Array.isArray(usersdata.users)
    ? usersdata.users.filter((u) => u.role === "hod")
    : [];
  const marketingUsers = Array.isArray(usersdata.users)
    ? usersdata.users.filter((u) => u.role === "marketing")
    : [];

  const accountsUsers = Array.isArray(usersdata.users)
    ? usersdata.users.filter((u) => u.role === "accounts")
    : [];

  const [selectedInvoice, setSelectedInvoice] = useState(null);
  //console.log("hodUsers in View Quote:", hodUsers);
  const [selectedHod, setSelectedHod] = useState(null);
  const [marketingHead, setMarketingHead] = useState([]);
  const [customMarketingEmail, setCustomMarketingEmail] = useState("");

  const [hodHead, setHODHead] = useState([]);
  const [customHodEmail, setCustomHodEmail] = useState("");

  const [accountsTeam, setAccountsTeam] = useState([]);
  const [marketingRemarks, setMarketingRemarks] = useState("");
  const [accountsRemarks, setAccountsRemarks] = useState("");
  const [marketingReviewStatus, setMarketingReviewStatus] = useState(false);
  const [isMarketingShareSubmitting, setIsMarketingShareSubmitting] =
    useState(false);

  const [rolesckt, setRole] = useState(null);
  const [userId, setUserId] = useState(uuidv4().slice(0, 8));

  const [filteredQuotes, setFilteredQuotes] = useState(null);
  const [visibleRows, setVisibleRows] = useState([]);

  const [auctionData, setAuctionData] = useState(null);
  const [hodApprovalStatusData, setHodApprovalStatusData] = useState([]);

  const [auctionPulse, setAuctionPulse] = useState(null);
  const [hodRejectedOn, setHodRejectedOn] = useState(null);
  const [attachedFiles, setAttachedFiles] = useState([]);

  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [hodStatusData, setHodStatusData] = useState([]);

  const navigate = useNavigate();

  const normalizeHodApprovalStatusData = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (typeof data === "object") return [data];
    return [];
  };

  const renderSelectedEmailSummary = (emails) => {
    const uniqueEmails = Array.from(new Set(emails || []));

    if (!uniqueEmails.length) {
      return null;
    }

    return (
      <div className="mt-2 p-2 border-round surface-100">
        <div className="text-sm text-600 mb-2">
          Selected: {uniqueEmails.length} email
          {uniqueEmails.length > 1 ? "s" : ""}
        </div>
        <div className="flex flex-wrap gap-2">
          {uniqueEmails.map((email) => (
            <Tag key={email} value={email} severity="info" />
          ))}
        </div>
      </div>
    );
  };

  const addCustomEmail = (type) => {
    const email = (
      type === "marketing" ? customMarketingEmail : customHodEmail
    )?.trim();

    if (!email) {
      dispatch(toastError({ detail: "Please enter an email address." }));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      dispatch(toastError({ detail: "Please enter a valid email address." }));
      return;
    }

    if (type === "marketing") {
      setMarketingHead((prev) =>
        prev.includes(email) ? prev : [...prev, email],
      );
      setCustomMarketingEmail("");
    } else {
      setHODHead((prev) => (prev.includes(email) ? prev : [...prev, email]));
      setCustomHodEmail("");
    }
  };

  const currencyOptions = [
    { label: "None", value: "" },
    { label: "AED - United Arab Emirates Dirham د.إ", value: "AED" },
    { label: "AS - Asia", value: "AS" },
    { label: "AF - Africa", value: "AF" },
    { label: "AFN - Afghan Afghani ؋", value: "AFN" },
    { label: "ALL - Albanian Lek L", value: "ALL" },
    { label: "AMD - Armenian Dram ֏", value: "AMD" },
    { label: "ANG - Netherlands Antillean Guilder ƒ", value: "ANG" },
    { label: "AOA - Angolan Kwanza Kz", value: "AOA" },
    { label: "ARS - Argentine Peso $", value: "ARS" },
    { label: "AUD - Australian Dollar $", value: "AUD" },
    { label: "AWG - Aruban Florin ƒ", value: "AWG" },
    { label: "AZN - Azerbaijani Manat ₼", value: "AZN" },
    { label: "BAM - Bosnia and Herzegovina Convertible Mark KM", value: "BAM" },
    { label: "BBD - Barbadian Dollar $", value: "BBD" },
    { label: "BDT - Bangladeshi Taka ৳", value: "BDT" },
    { label: "BGN - Bulgarian Lev лв", value: "BGN" },
    { label: "BHD - Bahraini Dinar .د.ب", value: "BHD" },
    { label: "BIF - Burundian Franc ₣", value: "BIF" },
    { label: "BMD - Bermudian Dollar $", value: "BMD" },
    { label: "BND - Brunei Dollar $", value: "BND" },
    { label: "BOB - Bolivian Boliviano Bs.", value: "BOB" },
    { label: "BRL - Brazilian Real R$", value: "BRL" },
    { label: "BSD - Bahamian Dollar $", value: "BSD" },
    { label: "BTN - Bhutanese Ngultrum Nu.", value: "BTN" },
    { label: "BWP - Botswana Pula P", value: "BWP" },
    { label: "BYN - Belarusian Ruble Br", value: "BYN" },
    { label: "BZD - Belize Dollar $", value: "BZD" },
    { label: "CAD - Canadian Dollar $", value: "CAD" },
    { label: "CDF - Congolese Franc ₣", value: "CDF" },
    { label: "CHF - Swiss Franc CHF", value: "CHF" },
    { label: "CLP - Chilean Peso $", value: "CLP" },
    { label: "CNY - Chinese Yuan ¥", value: "CNY" },
    { label: "COP - Colombian Peso $", value: "COP" },
    { label: "CRC - Costa Rican Colón ₡", value: "CRC" },
    { label: "CUP - Cuban Peso ₱", value: "CUP" },
    { label: "CVE - Cape Verdean Escudo $", value: "CVE" },
    { label: "CZK - Czech Koruna Kč", value: "CZK" },
    { label: "DJF - Djiboutian Franc ₣", value: "DJF" },
    { label: "DKK - Danish Krone kr", value: "DKK" },
    { label: "DOP - Dominican Peso $", value: "DOP" },
    { label: "DZD - Algerian Dinar دج", value: "DZD" },
    { label: "EGP - Egyptian Pound £", value: "EGP" },
    { label: "ERN - Eritrean Nakfa Nfk", value: "ERN" },
    { label: "ETB - Ethiopian Birr Br", value: "ETB" },
    { label: "EU - Europe", value: "EU" },
    { label: "EUR - Euro €", value: "EUR" },
    { label: "FJD - Fijian Dollar $", value: "FJD" },
    { label: "FKP - Falkland Islands Pound £", value: "FKP" },
    { label: "FOK - Faroese Króna kr", value: "FOK" },
    { label: "GBP - British Pound Sterling £", value: "GBP" },
    { label: "GEL - Georgian Lari ₾", value: "GEL" },
    { label: "GGP - Guernsey Pound £", value: "GGP" },
    { label: "GHS - Ghanaian Cedi ₵", value: "GHS" },
    { label: "GIP - Gibraltar Pound £", value: "GIP" },
    { label: "GF - Gulf", value: "GF" },
    { label: "GMD - Gambian Dalasi D", value: "GMD" },
    { label: "GNF - Guinean Franc ₣", value: "GNF" },
    { label: "GTQ - Guatemalan Quetzal Q", value: "GTQ" },
    { label: "GYD - Guyanese Dollar $", value: "GYD" },
    { label: "HKD - Hong Kong Dollar $", value: "HKD" },
    { label: "HNL - Honduran Lempira L", value: "HNL" },
    { label: "HRK - Croatian Kuna kn", value: "HRK" },
    { label: "HTG - Haitian Gourde G", value: "HTG" },
    { label: "HUF - Hungarian Forint Ft", value: "HUF" },
    { label: "IDR - Indonesian Rupiah Rp", value: "IDR" },
    { label: "ILS - Israeli New Shekel ₪", value: "ILS" },
    { label: "IMP - Isle of Man Pound £", value: "IMP" },
    { label: "INR - Indian Rupee ₹", value: "INR" },
    { label: "IQD - Iraqi Dinar ع.د", value: "IQD" },
    { label: "IRR - Iranian Rial ﷼", value: "IRR" },
    { label: "ISK - Icelandic Króna kr", value: "ISK" },
    { label: "JEP - Jersey Pound £", value: "JEP" },
    { label: "JMD - Jamaican Dollar $", value: "JMD" },
    { label: "JOD - Jordanian Dinar د.ا", value: "JOD" },
    { label: "JPY - Japanese Yen ¥", value: "JPY" },
    { label: "KES - Kenyan Shilling Sh", value: "KES" },
    { label: "KGS - Kyrgyzstani Som ⃀", value: "KGS" },
    { label: "KHR - Cambodian Riel ៛", value: "KHR" },
    { label: "KID - Kiribati Dollar $", value: "KID" },
    { label: "KMF - Comorian Franc ₣", value: "KMF" },
    { label: "KRW - South Korean Won ₩", value: "KRW" },
    { label: "KWD - Kuwaiti Dinar د.ك", value: "KWD" },
    { label: "KYD - Cayman Islands Dollar $", value: "KYD" },
    { label: "KZT - Kazakhstani Tenge ₸", value: "KZT" },
    { label: "LAK - Lao Kip ₭", value: "LAK" },
    { label: "LBP - Lebanese Pound ل.ل", value: "LBP" },
    { label: "LKR - Sri Lankan Rupee Rs", value: "LKR" },
    { label: "LRD - Liberian Dollar $", value: "LRD" },
    { label: "LSL - Lesotho Loti L", value: "LSL" },
    { label: "LYD - Libyan Dinar ل.د", value: "LYD" },
    { label: "MAD - Moroccan Dirham د.م.", value: "MAD" },
    { label: "MDL - Moldovan Leu L", value: "MDL" },
    { label: "MGA - Malagasy Ariary Ar", value: "MGA" },
    { label: "MKD - Macedonian Denar ден", value: "MKD" },
    { label: "MMK - Burmese Kyat Ks", value: "MMK" },
    { label: "MNT - Mongolian Tögrög ₮", value: "MNT" },
    { label: "MOP - Macanese Pataca P", value: "MOP" },
    { label: "MED - Mediterranean Region", value: "MED" },
    { label: "MRU - Mauritanian Ouguiya UM", value: "MRU" },
    { label: "MUR - Mauritian Rupee ₨", value: "MUR" },
    { label: "MVR - Maldivian Rufiyaa .ރ", value: "MVR" },
    { label: "MWK - Malawian Kwacha MK", value: "MWK" },
    { label: "MXN - Mexican Peso $", value: "MXN" },
    { label: "MYR - Malaysian Ringgit RM", value: "MYR" },
    { label: "MZN - Mozambican Metical MT", value: "MZN" },
    { label: "NAD - Namibian Dollar $", value: "NAD" },
    { label: "NGN - Nigerian Naira ₦", value: "NGN" },
    { label: "NIO - Nicaraguan Córdoba C$", value: "NIO" },
    { label: "NOK - Norwegian Krone kr", value: "NOK" },
    { label: "NPR - Nepalese Rupee ₨", value: "NPR" },
    { label: "NZD - New Zealand Dollar $", value: "NZD" },
    { label: "OC - Oceania", value: "OC" },
    { label: "OMR - Omani Rial ﷼", value: "OMR" },
    { label: "PAB - Panamanian Balboa B/.", value: "PAB" },
    { label: "PEN - Peruvian Sol S/", value: "PEN" },
    { label: "PGK - Papua New Guinean Kina K", value: "PGK" },
    { label: "PHP - Philippine Peso ₱", value: "PHP" },
    { label: "PKR - Pakistani Rupee ₨", value: "PKR" },
    { label: "PLN - Polish Złoty zł", value: "PLN" },
    { label: "PYG - Paraguayan Guaraní ₲", value: "PYG" },
    { label: "QAR - Qatari Riyal ﷼", value: "QAR" },
    { label: "RON - Romanian Leu lei", value: "RON" },
    { label: "RSD - Serbian Dinar din", value: "RSD" },
    { label: "RUB - Russian Ruble ₽", value: "RUB" },
    { label: "RWF - Rwandan Franc ₣", value: "RWF" },
    { label: "SAR - Saudi Riyal ﷼", value: "SAR" },
    { label: "SBD - Solomon Islands Dollar $", value: "SBD" },
    { label: "SCR - Seychellois Rupee ₨", value: "SCR" },
    { label: "SDG - Sudanese Pound ج.س.", value: "SDG" },
    { label: "SEK - Swedish Krona kr", value: "SEK" },
    { label: "SGD - Singapore Dollar $", value: "SGD" },
    { label: "SHP - Saint Helena Pound £", value: "SHP" },
    { label: "SLL - Sierra Leonean Leone Le", value: "SLL" },
    { label: "SOS - Somali Shilling Sh", value: "SOS" },
    { label: "SRD - Surinamese Dollar $", value: "SRD" },
    { label: "SSP - South Sudanese Pound £", value: "SSP" },
    { label: "STN - São Tomé and Príncipe Dobra Db", value: "STN" },
    { label: "SYP - Syrian Pound £", value: "SYP" },
    { label: "SZL - Swazi Lilangeni E", value: "SZL" },
    { label: "THB - Thai Baht ฿", value: "THB" },
    { label: "TJS - Tajikistani Somoni ЅМ", value: "TJS" },
    { label: "TMT - Turkmenistani Manat m", value: "TMT" },
    { label: "TND - Tunisian Dinar د.ت", value: "TND" },
    { label: "TOP - Tongan Paʻanga T$", value: "TOP" },
    { label: "TRY - Turkish Lira ₺", value: "TRY" },
    { label: "TTD - Trinidad and Tobago Dollar $", value: "TTD" },
    { label: "TVD - Tuvaluan Dollar $", value: "TVD" },
    { label: "TWD - New Taiwan Dollar $", value: "TWD" },
    { label: "TZS - Tanzanian Shilling Sh", value: "TZS" },
    { label: "UAH - Ukrainian Hryvnia ₴", value: "UAH" },
    { label: "USEC - United States East Coast", value: "USEC" },
    { label: "UGX - Ugandan Shilling Sh", value: "UGX" },
    { label: "USD - United States Dollar $", value: "USD" },
    { label: "UYU - Uruguayan Peso $U", value: "UYU" },
    { label: "UZS - Uzbekistani Soʻm so'm", value: "UZS" },
    { label: "VES - Venezuelan Bolívar Bs.S", value: "VES" },
    { label: "VND - Vietnamese Đồng ₫", value: "VND" },
    { label: "VUV - Vanuatu Vatu VT", value: "VUV" },
    { label: "WST - Samoan Tālā T", value: "WST" },
    { label: "XAF - Central African CFA Franc ₣", value: "XAF" },
    { label: "XCD - East Caribbean Dollar $", value: "XCD" },
    { label: "XOF - West African CFA Franc ₣", value: "XOF" },
    { label: "XPF - CFP Franc ₣", value: "XPF" },
    { label: "YER - Yemeni Rial ﷼", value: "YER" },
    { label: "ZAR - South African Rand R", value: "ZAR" },
    { label: "ZMW - Zambian Kwacha ZK", value: "ZMW" },
    { label: "ZWL - Zimbabwean Dollar $", value: "ZWL" },
  ];

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
              Value of Shipment in INR:
            </strong>
          }
          footerStyle={{ textAlign: "right" }}
        />

        <Column
          footer={
            exchangeRate ? (
              <strong style={{ color: "#0f5132", fontSize: "1.1rem" }}>
                ₹{" "}
                {invAmount
                  ? parseFloat(invAmount).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  : parseFloat(exchangeRate * shipmentValue).toLocaleString(
                      "en-US",
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      },
                    )}
              </strong>
            ) : null
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
    //if (Array.isArray(visibleRows) && visibleRows.length > 0) {
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

          // const finalGrandTotal = hasExchangeRate
          //   ? computedGrandTotal
          //   : Number(row.grandTotalValue || 0);

          const finalGrandTotal = Number(row.grandTotalValue || 0);

          return sum + finalGrandTotal;
        }, 0);

        console.log("Calculated invAmount with filters:", total);
        let newval = exchangeRate * shipmentValue;
        setInvAmount(newval);
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
    //} else {
    // 🔹 Case 2: No filters → full data
    // const total = rfq.shipments
    //   .flatMap((s) => s.quotes || [])
    //   .reduce((sum, q) => sum + Number(q.grandTotalValue || 0), 0);

    // setInvAmount(total);
    //}
  }, [rfq, exchangeRate, visibleRows, shipmentValue]);

  //useEffect(() => {
  const fetchSummary = async () => {
    try {
      const data = await getData(`quotesummary/quotes-summary/${rfqNumber}`);
      //console.log("RFQ Quote Summary:", data);
      setRfq(data);
      const firstQuote = data?.shipments
        ?.flatMap((shipment) => shipment.quotes || [])
        ?.find(
          (quote) =>
            quote.saveAndDownloadPdfDetails &&
            Object.keys(quote.saveAndDownloadPdfDetails).length > 0,
        );

      if (firstQuote?.saveAndDownloadPdfDetails) {
        setExchangeRate(
          firstQuote.saveAndDownloadPdfDetails.exchangeRate || "",
        );
        setSelectedCurrency(
          firstQuote.saveAndDownloadPdfDetails.currency || null,
        );
      }
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
      setHodApprovalStatusData(
        normalizeHodApprovalStatusData(
          response?.rfqRecord?.data?.hodAcceptRequestDetails,
        ),
      );
    } catch (error) {}
  };

  const now = new Date();

  const isScheduledAuction =
    auctionData?.startTime && new Date(auctionData.startTime) > now;

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const handleAuctionUpdated = async () => {
    // 1️⃣ wait 8 seconds
    await sleep(8000);

    // 2️⃣ fetch updated summary
    await fetchSummary();

    // 3️⃣ trigger animation AFTER fetchSummary finishes
    setAuctionPulse({
      emoji: "⚡",
      text: "Auction Update Received",
    });

    // 4️⃣ auto hide after 2s
    setTimeout(() => {
      setAuctionPulse(null);
    }, 2000);
  };

  const handleRejectSubmit = async () => {
    if (!rejectReason.trim()) {
      alert("Please enter rejection reason");
      return;
    }

    try {
      const payload = {
        rfq_number: rfq.rfq_number,
        action: "marketingteam_rejected",
        status: "rejected",
        reason: rejectReason,
        auction_id: auctionData?.id,
      };

      console.log("Reject payload:", payload);
      const token = localStorage.getItem("USERTOKEN");

      await postData("quotesummary/update-rfq-status", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      dispatch(toastSuccess({ detail: `Marketing Team has rejected the RFQ` }));
      setShowRejectDialog(false);
      setRejectReason("");
      fetchSummary();
    } catch (error) {
      console.error("Error rejecting:", error);
      dispatch(
        toastError({ detail: error.response?.data?.msg || "Failed to reject" }),
      );
    }
  };

  const handleInvoiceRejectSubmit = async () => {
    if (!rejectReason.trim()) {
      alert("Please enter rejection reason");
      return;
    }

    try {
      const payload = {
        rfq_number: rfq.rfq_number,
        action: "invoice_rejected",
        status: "rejected",
        reason: rejectReason,
        auction_id: auctionData?.id,
        vendor_id: selectedInvoice.vendor_id,
      };

      console.log("Reject payload:", payload);
      const token = localStorage.getItem("USERTOKEN");

      await postData("quotesummary/update-rfq-status", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      dispatch(toastSuccess({ detail: `Invoice has been rejected` }));
      setShowRejectDialog(false);
      setRejectReason("");
      fetchSummary();
    } catch (error) {
      console.error("Error rejecting:", error);
      dispatch(
        toastError({ detail: error.response?.data?.msg || "Failed to reject" }),
      );
    }
  };

  const handleApproveSubmit = async () => {
    try {
      const payload = {
        rfq_number: rfq.rfq_number,
        action: "marketingteam_approved",
        status: "approved",
        reason: "",
        auction_id: auctionData?.id,
      };

      console.log("Approve payload:", payload);

      const token = localStorage.getItem("USERTOKEN");

      await postData("quotesummary/update-rfq-status", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      dispatch(toastSuccess({ detail: `Marketing Team has approved the RFQ` }));

      fetchSummary();
    } catch (error) {
      console.error("Error approving:", error);

      dispatch(
        toastError({
          detail: error.response?.data?.msg || "Failed to approve",
        }),
      );
    }
  };

  const handleInvoiceApproveSubmit = () => {
    confirmDialog({
      message: "Are you sure you want to approve this invoice?",
      header: "Confirm Invoice Approval",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Yes, Approve",
      rejectLabel: "Cancel",
      acceptClassName: "p-button-success",
      rejectClassName: "p-button-secondary",

      accept: async () => {
        try {
          const payload = {
            rfq_number: rfq.rfq_number,
            action: "invoice_approved",
            status: "approved",
            reason: "",
            auction_id: auctionData?.id,
            vendor_id: selectedInvoice.vendor_id,
          };

          console.log("Approve payload:", payload);

          const token = localStorage.getItem("USERTOKEN");

          await postData("quotesummary/update-rfq-status", payload, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });

          dispatch(
            toastSuccess({
              detail: "Invoice has been approved successfully.",
            }),
          );

          fetchSummary();
        } catch (error) {
          console.error("Error approving:", error);

          dispatch(
            toastError({
              detail: error.response?.data?.msg || "Failed to approve invoice.",
            }),
          );
        }
      },
    });
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
      const negotiations = selectedVendors?.map((v) => ({
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

            // const finalGrandTotal = hasExchangeRate
            //   ? computedGrandTotal
            //   : Number(quote.grandTotalValue || 0);

            const firstBidPriceVal =
              quote.FirstBidPrice + exchangeRate * quote.dap_ddp_charges;

            const lastBidPriceVal =
              quote.grandTotalValue + exchangeRate * quote.dap_ddp_charges;

            const finalGrandTotal = Number(lastBidPriceVal || 0);

            // const baseAmount = hasShipmentValue ? shipmentValue : invAmount;

            // const percent = baseAmount
            //   ? (finalGrandTotal / baseAmount) * 100
            //   : null;

            const percent =
              hasExchangeRate && hasShipmentValue
                ? (finalGrandTotal / (exchangeRate * shipmentValue)) * 100
                : null;

            // ✅ Highest quote from current shipment
            const highestGrandTotal = Math.max(
              ...(shipment.quotes || []).map((q) =>
                Number(
                  q.grandTotalValue + q.dap_ddp_charges * exchangeRate || 0,
                ),
              ),
            );

            // ✅ Calculate savings for all quotes
            const savingsArray = (shipment.quotes || [])
              .map((q) => ({
                grandTotalValue: Number(
                  q.grandTotalValue + q.dap_ddp_charges * exchangeRate || 0,
                ),
                saving:
                  highestGrandTotal -
                  Number(
                    q.grandTotalValue + q.dap_ddp_charges * exchangeRate || 0,
                  ),
              }))
              .sort((a, b) => b.saving - a.saving); // highest saving => L1

            // ✅ Saving = Highest - Current
            const total_savingtest = highestGrandTotal - finalGrandTotal;

            // ✅ Rank based on saving
            const savingRankIndex = savingsArray.findIndex(
              (q) => q.saving === total_savingtest,
            );

            const savingRank = `L${savingRankIndex + 1}`;

            return {
              ...quote,
              ...(hasExchangeRate && { grandTotalValue: finalGrandTotal }), // 🔥 ONLY when exchangeRate exists
              percentage: percent ? Math.round(percent) : null,
              total_savingtest: total_savingtest,
              FirstBidPrice: firstBidPriceVal || 0,
              grandTotalValue: lastBidPriceVal || 0,
              savingRank,
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

    // const exportToPDFTest = async (
    //   auctionDetails = {},
    //   companyDetails = {},
    // ) => {
    //   const doc = new jsPDF("l", "mm", "a4");
    //   const pageWidth = doc.internal.pageSize.getWidth();

    //   const { totalSaving = "INR 2,00,000.00 (2.71%)" } = companyDetails;

    //   // Get the accepted vendor saving
    //   let acceptedSaving = "N/A";

    //   try {
    //     const acceptedRow = allQuotes.find(
    //       (q) =>
    //         q.acceptedDetails?.accepted_at &&
    //         q.acceptedDetails?.accepted_airline === q.airline_name,
    //     );

    //     if (acceptedRow) {
    //       const firstBid = acceptedRow.FirstBidPrice || 0;
    //       const finalBid = acceptedRow.grandTotalValue || 0;
    //       const savingValue = firstBid - finalBid;

    //       acceptedSaving = ` ${savingValue.toLocaleString("en-IN")} `;
    //     }
    //   } catch (err) {
    //     console.error("Saving calc error:", err);
    //   }

    //   const l1Quote = [...allQuotes]
    //     .map((q) => {
    //       const firstBid = q.FirstBidPrice || 0;
    //       const finalBid = q.grandTotalValue || 0;
    //       const saving = firstBid - finalBid;

    //       return {
    //         vendor_name: q.vendor_name,
    //         finalBid,
    //         saving,
    //       };
    //     })
    //     .sort((a, b) => a.finalBid - b.finalBid)[0]; // Smallest Final Bid = L1

    //   const L1TotalSavings = l1Quote ? l1Quote.saving.toFixed(2) : "N/A";

    //   //console.log("l1TotalSavings", L1TotalSavings);

    //   const {
    //     auctionId = rfq?.rfq_number || "N/A",
    //     auctionTitle = rfq?.title || "N/A",
    //     auctionType = rfq?.type || "N/A",
    //     country = rfq?.country || "N/A",
    //     subindustry = rfq?.subindustry || "N/A",
    //     hideCurrentBid = rfq?.hideCurrentBidPrice || "N/A",
    //     testAuction = "No",
    //     description = rfq?.description || "N/A",
    //     createdDate = rfq?.createdDate
    //       ? new Date(rfq?.createdDate).toLocaleString()
    //       : "N/A",
    //     openDate = rfq?.openDateTime
    //       ? new Date(rfq?.openDateTime).toLocaleString()
    //       : "N/A",
    //     closeDate = rfq?.closeDateTime
    //       ? new Date(rfq?.closeDateTime).toLocaleString()
    //       : "N/A",
    //   } = auctionDetails;

    //   acceptedSaving = acceptedSaving || "N/A";
    //   let currentY = 10; // 🔹 Track current vertical position

    //   // =========================
    //   // 🔹 Header (Centered Logo)
    //   // =========================
    //   const addHeader = () => {
    //     const logoWidth = 140;
    //     const logoHeight = 15;
    //     const logoX = (pageWidth - logoWidth) / 2;
    //     const logoY = currentY;

    //     try {
    //       doc.addImage(logoImg, "PNG", logoX, logoY, logoWidth, logoHeight);
    //     } catch (err) {
    //       console.error("Logo load error:", err);
    //     }

    //     currentY = logoY + logoHeight + 10; // move below logo
    //   };

    //   // =========================
    //   // 🔹 Auction Details Section
    //   // =========================
    //   const addAuctionDetails = () => {
    //     const lineSpacing = 7;
    //     const pageWidth = doc.internal.pageSize.getWidth();
    //     const marginLeft = 20;
    //     const valueX = 70;
    //     const maxTextWidth = pageWidth - valueX - 20; // available width for text

    //     doc.setFontSize(10);
    //     //doc.setFont("helvetica", "normal");

    //     const details = [
    //       ["Auction ID", auctionId, true],
    //       ["Auction Title", auctionTitle, true],
    //       ["Auction Type", auctionType],
    //       ["Country", country],
    //       ["Industry", subindustry],
    //       ["Hide Current Bid Price", hideCurrentBid],
    //       ["Test eAuction", testAuction],
    //       ["Description", description],
    //       ["__SPACER__", ""],
    //       ["Auction Created Date & Time", createdDate],
    //       ["Auction Open Date & Time", openDate],
    //       ["Auction Close Date & Time", closeDate],
    //       ["Total Saving - INR ", L1TotalSavings, true],
    //     ];

    //     details.forEach(([label, value, isBold]) => {
    //       if (label === "__SPACER__") {
    //         currentY += 10; // top margin
    //         return;
    //       }

    //       // Wrap long text properly
    //       const labelText = `${label}:`;
    //       const wrappedValue = doc.splitTextToSize(
    //         value?.toString() || "",
    //         maxTextWidth,
    //       );

    //       if (isBold) doc.setFont("helvetica", "bold");
    //       else doc.setFont("helvetica", "normal");

    //       // Draw label
    //       doc.text(labelText, marginLeft, currentY);
    //       // Draw wrapped value, one or multiple lines
    //       doc.setFont("helvetica", "normal");
    //       doc.text(wrappedValue, valueX, currentY);

    //       // Increase Y position based on text height
    //       currentY += lineSpacing * wrappedValue.length;
    //     });

    //     // Draw line separator
    //     doc.setDrawColor(200);
    //     doc.line(20, currentY, pageWidth - 20, currentY);
    //     currentY += 10;

    //     // Add Total Saving & Summary Title
    //     doc.setFont("helvetica", "bold");
    //     //doc.text(`Total Saving - ${totalSaving}`, 20, currentY);
    //     currentY += 8;
    //     doc.text(`Auction Quote Details`, 20, currentY);
    //     currentY += 10; // space before next section

    //     return currentY;
    //   };

    //   const quotedatalatestFinal = (startY) => {
    //     let yPos = startY;
    //     const topQuotes = allQuotes; // all vendors

    //     // 🧩 Combine all columns from all 3 tables
    //     const allCols = [
    //       "Vendor",
    //       "Airline",
    //       "Airport",
    //       "Chargeable Wt (kg)",
    //       "Freight / Kg (INR)",
    //       "AMS (INR)",
    //       "PAC (INR)",
    //       "AWB (INR)",
    //       "Other (INR)",
    //       "Currency",
    //       "DAP/DDP",
    //       "Exchange Rate",
    //       "Transit Days",
    //       "Routing",
    //       "Remark / Condition",
    //       "Target Price",
    //       "Total Charges (INR)",
    //       "Total Saving",
    //       "Percentage",
    //       "Rank",
    //       "isAccepted",
    //     ];

    //     // 🧠 Helper to build all rows dynamically
    //     const buildRows = (cols) =>
    //       topQuotes.map((q, index) => {
    //         console.log("Generating row for quote:", q);
    //         const lastNegotiation = Array.isArray(q.negotiation)
    //           ? q.negotiation.find(
    //               (n) =>
    //                 n.vendor_id === q.vendor_id &&
    //                 n.airline_name === q.airline_name,
    //             )
    //           : null;

    //         const lastPurchase = lastNegotiation?.last_purchase_price || "-";
    //         const firstBid = q.FirstBidPrice || 0;
    //         const finalBid = q.grandTotalValue || 0;
    //         const saving = firstBid - finalBid || 0;

    //         const isAccepted =
    //           q.acceptedDetails?.accepted_at &&
    //           q.acceptedDetails?.accepted_airline === q.airline_name;

    //         const routes = [
    //           { route: q.route1, schedule: q.flight_schedule1 },
    //           { route: q.route2, schedule: q.flight_schedule2 },
    //           { route: q.route3, schedule: q.flight_schedule3 },
    //         ]
    //           .filter((r) => r.route || r.schedule)
    //           .map((r) => {
    //             const routeText = r.route || "-";
    //             const scheduleText = r.schedule
    //               ? new Date(r.schedule).toLocaleDateString()
    //               : "-";
    //             return `${routeText}\n${scheduleText}`;
    //           })
    //           .join("\n");

    //         const row = {
    //           Vendor: q.vendor_name || "-",
    //           Airline: q.airline_name || "-",
    //           Airport: q.airport || "-",
    //           "Chargeable Wt (kg)": q.chargeable_weight || "-",
    //           "Freight / Kg (INR)": q.base_rate || "-",
    //           "AMS (INR)": q.ams || "-",
    //           "PAC (INR)": q.pac || "-",
    //           "AWB (INR)": q.awb || "-",
    //           "Other (INR)": q.other_charges || "-",
    //           Currency: q.currency || "-",
    //           "DAP/DDP": q.dap_ddp_charges || "-",
    //           "Exchange Rate": exchangeRate
    //             ? exchangeRate
    //             : q.exchangeRate || "-",
    //           "Transit Days": q.transit_days || "-",
    //           Routing: routes || "-",
    //           "Remark / Condition": q.remarks || "-",
    //           "Target Price": lastPurchase ? lastPurchase : "-",
    //           "Total Charges (INR)": finalBid
    //             ? parseFloat(finalBid).toFixed(2)
    //             : "-",
    //           "Total Saving": saving ? saving.toFixed(2) : "-",
    //           Percentage: q.percentage ? `${q.percentage}%` : "-",
    //           Rank: `L${index + 1}`,
    //           isAccepted: isAccepted ? "Yes" : "No",
    //         };

    //         return cols.map((col) => row[col]);
    //       });

    //     // 📄 Draw Combined Table
    //     doc.autoTable({
    //       startY: yPos,
    //       head: [allCols],
    //       body: buildRows(allCols),
    //       theme: "grid",
    //       styles: {
    //         fontSize: 8,
    //         cellPadding: 2,
    //         halign: "center",
    //         valign: "middle",
    //         lineColor: [200, 200, 200],
    //         overflow: "linebreak", // Wrap text
    //       },
    //       headStyles: {
    //         fillColor: [68, 114, 196],
    //         textColor: [255, 255, 255],
    //         fontStyle: "bold",
    //       },
    //       alternateRowStyles: { fillColor: [245, 245, 245] },
    //       margin: { top: 10, left: 10, right: 10 },
    //       tableWidth: "auto", // Fit table to page width
    //       showHead: "firstPage",
    //       didParseCell: (data) => {
    //         // Highlight top vendor (L1)
    //         if (data.cell.raw === "L1") {
    //           data.cell.styles.fillColor = [210, 255, 210];
    //         }
    //       },
    //     });

    //     return doc.lastAutoTable.finalY + 10;
    //   };

    //   const addSummaryBidSection = (startY) => {
    //     let y = startY;
    //     const pageWidth = doc.internal.pageSize.getWidth();

    //     // ==========================
    //     //  SECTION: SUMMARY TITLE
    //     // ==========================
    //     doc.setFontSize(12);
    //     doc.setFont("helvetica", "bold");
    //     doc.text("Summary Sheet of Bid", 20, y);
    //     y += 10;

    //     // ==========================
    //     //  EXTRACT SUMMARY ROWS
    //     // ==========================
    //     const summaryRows = allQuotes.map((q, i) => {
    //       const finalBid = q.grandTotalValue || 0;
    //       const firstBid = q.FirstBidPrice || 0;
    //       const saving = firstBid - finalBid;

    //       return {
    //         sr_no: i + 1,
    //         supplier: q.vendorName || q.vendor_name || q.vendor || "-",
    //         airline: q.airline_name || "-",
    //         transit: q.transit_days || "-",
    //         final_price: finalBid.toFixed(2),
    //         saving: saving.toFixed(2),
    //         position: q.acceptedDetails?.position || "",
    //       };
    //     });

    //     // Sort by savings for L1, L2, L3
    //     summaryRows.sort((a, b) => b.saving - a.saving);
    //     summaryRows.forEach((r, index) => {
    //       r.position = `L${index + 1}`;
    //     });

    //     // ==========================
    //     //  SUMMARY TABLE
    //     // ==========================
    //     doc.autoTable({
    //       startY: y,
    //       head: [
    //         [
    //           "Sr No",
    //           "Supplier",
    //           "Airline",
    //           "Transit Time",
    //           "Final Bid Price (INR)",
    //           "Saving (INR)",
    //           "Position",
    //         ],
    //       ],
    //       body: summaryRows.map((r) => [
    //         r.sr_no,
    //         r.supplier,
    //         r.airline,
    //         r.transit,
    //         r.final_price,
    //         r.saving,
    //         r.position,
    //       ]),
    //       styles: { fontSize: 9, cellPadding: 3 },
    //       headStyles: {
    //         halign: "center",
    //         fillColor: [230, 230, 230],
    //         textColor: 20,
    //         fontStyle: "bold",
    //       },
    //       alternateRowStyles: { fillColor: [245, 245, 245] },
    //       margin: { left: 20, right: 20 },
    //       didDrawPage: (data) => {
    //         y = data.cursor.y + 10;
    //       },
    //     });

    //     return y;
    //   };

    //   const extractAuctionActivity = (auctionData = {}) => {
    //     const invited = Array.isArray(auctionData.invited)
    //       ? auctionData.invited
    //       : [];

    //     const users = auctionData.users ? Object.values(auctionData.users) : [];

    //     const vendors = users.filter((u) => u.role === "vendor");

    //     const bids = auctionData.bids || {};
    //     const ranks = auctionData.ranks || {};

    //     const participated = vendors.filter((v) => bids[v.id]);

    //     const winnerId = Object.entries(ranks).find(
    //       ([, rank]) => rank === 1,
    //     )?.[0];

    //     return {
    //       invited,
    //       participated,
    //       bids,
    //       ranks,
    //       winnerId,
    //     };
    //   };

    //   const addAuctionActivitySection = (startY, auctionData) => {
    //     let y = startY;

    //     const { invited, participated, bids, ranks, winnerId } =
    //       extractAuctionActivity(auctionData);

    //     // ==========================
    //     // 🔹 Section Title
    //     // ==========================
    //     doc.setFont("helvetica", "bold");
    //     doc.setFontSize(12);
    //     doc.text("Auction Activity Summary", 20, y);
    //     y += 10;

    //     // ==========================
    //     // 📅 Auction Timeline
    //     // ==========================
    //     doc.setFontSize(10);
    //     doc.setFont("helvetica", "normal");

    //     doc.text(
    //       `Auction Number : ${auctionData?.auction_number || "N/A"}`,
    //       20,
    //       y,
    //     );
    //     y += 6;

    //     doc.text(
    //       `Auction Mode : ${(auctionData?.mode || "").toUpperCase()}`,
    //       20,
    //       y,
    //     );
    //     y += 6;

    //     doc.text(
    //       `Start Time : ${new Date(auctionData.startTime).toLocaleString()}`,
    //       20,
    //       y,
    //     );
    //     y += 6;

    //     doc.text(
    //       `End Time : ${new Date(auctionData.endTime).toLocaleString()}`,
    //       20,
    //       y,
    //     );
    //     y += 10;

    //     // ==========================
    //     // 📨 Invited Vendors Table
    //     // ==========================
    //     doc.setFont("helvetica", "bold");
    //     doc.text("Invited Vendors", 20, y);
    //     y += 6;

    //     doc.autoTable({
    //       startY: y,
    //       head: [["Email"]],
    //       body: invited.map((email) => [email]),
    //       theme: "grid",
    //       styles: { fontSize: 9, cellPadding: 3 },
    //       headStyles: {
    //         fillColor: [68, 114, 196],
    //         textColor: 255,
    //         fontStyle: "bold",
    //       },
    //       margin: { left: 20, right: 20 },
    //     });

    //     y = doc.lastAutoTable.finalY + 10;

    //     y = doc.lastAutoTable.finalY + 10;

    //     // ==========================
    //     // 🏆 Winner Summary
    //     // ==========================
    //     if (winnerId) {
    //       const winner = participated.find((v) => v.id === winnerId);

    //       doc.setFont("helvetica", "bold");
    //       doc.text("Auction Winner", 20, y);
    //       y += 6;

    //       doc.setFont("helvetica", "normal");
    //       doc.text(
    //         `Winner : ${winner?.name || "-"} (${winner?.company || "-"})`,
    //         20,
    //         y,
    //       );
    //       y += 6;

    //       doc.text(`Winning Bid : ${bids[winnerId]?.bid ?? "-"}`, 20, y);
    //       y += 10;
    //     }

    //     return y;
    //   };

    //   const generalDetails = {
    //     eximMode: rfq?.eximMode || "N/A",
    //     movementType: rfq?.movement_type || "N/A",
    //     incoterm: rfq?.incoterm_exp_air || "N/A",
    //     originAirport: rfq?.origin_airport || "N/A",
    //     originAddress: rfq?.origin_address || "N/A",
    //     stuffing: rfq?.stuffing_location || "N/A",
    //     destinationAirport: rfq?.destination_airport || "N/A",
    //     destinationAddress: rfq?.destination_address || "N/A",
    //     destuffing: rfq?.destuffing_location || "N/A",
    //     totalWeight: rfq?.totalGrossWeight + "KG",
    //     totalVolumetric: rfq?.totalVolumetricWeight + "KG",
    //     valueShipment: "INR" + rfq?.value_of_shipment || "N/A",
    //     //cargoType: "N/A",
    //     materialType: rfq?.material || "N/A",
    //     hsCode: rfq?.hs_code || "N/A",
    //     //additionalDetails: "N/A",
    //     volumetricFactor: rfq?.volumetricFactor || "N/A",
    //   };

    //   const addGeneralDetails = (startY) => {
    //     let y = startY;

    //     doc.setFont("helvetica", "bold");
    //     doc.setFontSize(12);
    //     doc.text("General Details", 20, y);
    //     y += 8;

    //     const rows = [
    //       [
    //         `Exim Mode : ${generalDetails.eximMode || "-"}`,
    //         `Movement Type : ${generalDetails.movementType || "-"}`,
    //         `Incoterm : ${generalDetails.incoterm || "-"}`,
    //       ],
    //       [
    //         `Origin Airport : ${generalDetails.originAirport || "-"}`,
    //         `Origin Address : ${generalDetails.originAddress || "-"}`,
    //         `Stuffing Location : ${generalDetails.stuffing || "-"}`,
    //       ],
    //       [
    //         `Destination Airport : ${generalDetails.destinationAirport || "-"}`,
    //         `Destination Address : ${generalDetails.destinationAddress || "-"}`,
    //         `DeStuffing Location : ${generalDetails.destuffing || "-"}`,
    //       ],
    //       [
    //         `Total Weight ( In Unit ) : ${generalDetails.totalWeight || "-"}`,
    //         `Total Volumetric Weight : ${
    //           generalDetails.totalVolumetric || "-"
    //         }`,
    //         `Value of Shipment : ${generalDetails.valueShipment || "-"}`,
    //       ],
    //       [
    //         // `Cargo Type : ${generalDetails.cargoType || "-"}`,
    //         `Material Type : ${generalDetails.materialType || "-"}`,
    //         `HS Code : ${generalDetails.hsCode || "-"}`,
    //       ],
    //       // [
    //       //   {
    //       //     content: `Additional Details : ${
    //       //       generalDetails.additionalDetails || "-"
    //       //     }`,
    //       //     colSpan: 3,
    //       //   },
    //       // ],
    //       [
    //         {
    //           content: `* Volumetric Weight Factor considered as : : ${
    //             generalDetails.volumetricFactor || "-"
    //           }`,
    //           colSpan: 3,
    //         },
    //       ],
    //     ];

    //     doc.autoTable({
    //       startY: y,
    //       head: [],
    //       body: rows,
    //       theme: "grid",
    //       styles: {
    //         fontSize: 9,
    //         valign: "middle",
    //         halign: "left",
    //         cellPadding: 3,
    //       },
    //       tableLineColor: [0, 0, 0],
    //       tableLineWidth: 0.2,
    //       margin: { left: 20, right: 20 },
    //       columnStyles: {
    //         0: { cellWidth: 180 / 3 },
    //         1: { cellWidth: 180 / 3 },
    //         2: { cellWidth: 180 / 3 },
    //       },
    //     });

    //     return doc.lastAutoTable.finalY + 10;
    //   };

    //   const containerDatat =
    //     rfq?.package_summary?.packages?.map((pkg) => ({
    //       packages: `${pkg.number || 0} ${pkg.type || "Packages"}`,
    //       dimension: `${pkg.length || 0} x ${pkg.breadth || 0} x ${
    //         pkg.height || 0
    //       } ${pkg.dim_unit?.toUpperCase() || ""}`,
    //       gross_weight: `${pkg.gross_weight || 0} ${
    //         pkg.weight_unit?.toUpperCase() || ""
    //       }`,
    //       charges: "Air Freight",
    //     })) || [];

    //   const containerData = [
    //     {
    //       packages: "12 Cartons",
    //       dimension: "37 x 36.5 x 26.5 CM",
    //       gross_weight: "13.13 KG",
    //       charges: "Air Freight",
    //     },
    //     {
    //       packages: "9 Cartons",
    //       dimension: "37 x 36.5 x 26.5 CM",
    //       gross_weight: "13.235 KG",
    //       charges: "Air Freight",
    //     },
    //   ];

    //   const addContainerAndCharges = (currentY, doc, data) => {
    //     const pageHeight = doc.internal.pageSize.getHeight();
    //     const marginBottom = 20;

    //     const checkPageBreak = (neededSpace = 10) => {
    //       if (currentY + neededSpace > pageHeight - marginBottom) {
    //         doc.addPage();
    //         currentY = 20; // reset top position
    //       }
    //     };

    //     // Section Title
    //     checkPageBreak(15);

    //     doc.setFontSize(12);
    //     doc.setFont("helvetica", "bold");
    //     doc.text("Container & Charges", 14, currentY);
    //     currentY += 8;

    //     const headers = [
    //       "No. of Packages",
    //       "Dimension",
    //       "Gross Weight / Package",
    //       "Charges",
    //     ];

    //     const columnWidths = [50, 70, 60, 40];
    //     let x = 14;

    //     doc.setFont("helvetica", "bold");
    //     doc.setFontSize(10);

    //     headers.forEach((h, index) => {
    //       doc.text(h, x, currentY);
    //       x += columnWidths[index];
    //     });

    //     currentY += 8;
    //     doc.line(14, currentY, 200, currentY);

    //     doc.setFont("helvetica", "normal");

    //     data.forEach((row) => {
    //       checkPageBreak(15); // ensure space before row

    //       let xPos = 14;
    //       currentY += 8;

    //       doc.text(row.packages, xPos, currentY);
    //       xPos += columnWidths[0];

    //       doc.text(row.dimension, xPos, currentY);
    //       xPos += columnWidths[1];

    //       doc.text(row.gross_weight, xPos, currentY);
    //       xPos += columnWidths[2];

    //       doc.text(row.charges, xPos, currentY);

    //       currentY += 3;
    //       doc.line(14, currentY, 200, currentY);
    //     });

    //     return currentY + 10;
    //   };

    //   const quotedatalatestFinalNew = (startY) => {
    //     let yPos = startY;
    //     const topQuotes = allQuotes; // all vendors

    //     // 🧩 Combine all columns from all 3 tables
    //     const allCols = [
    //       "Vendor",
    //       "Airline",
    //       "Transit Days",
    //       "Final Bid Price",
    //       "Percent %",
    //       "Total Saving",
    //       "Position",
    //     ];

    //     // 🧠 Helper to build all rows dynamically
    //     const buildRows = (cols) =>
    //       topQuotes.map((q, index) => {
    //         console.log("Generating row for quote:", q);
    //         const lastNegotiation = Array.isArray(q.negotiation)
    //           ? q.negotiation.find(
    //               (n) =>
    //                 n.vendor_id === q.vendor_id &&
    //                 n.airline_name === q.airline_name,
    //             )
    //           : null;

    //         const lastPurchase = lastNegotiation?.last_purchase_price || "-";
    //         const firstBid = q.FirstBidPrice || 0;
    //         const finalBid = q.grandTotalValue || 0;
    //         const saving = firstBid - finalBid || 0;

    //         const isAccepted =
    //           q.acceptedDetails?.accepted_at &&
    //           q.acceptedDetails?.accepted_airline === q.airline_name;

    //         const routes = [
    //           { route: q.route1, schedule: q.flight_schedule1 },
    //           { route: q.route2, schedule: q.flight_schedule2 },
    //           { route: q.route3, schedule: q.flight_schedule3 },
    //         ]
    //           .filter((r) => r.route || r.schedule)
    //           .map((r) => {
    //             const routeText = r.route || "-";
    //             const scheduleText = r.schedule
    //               ? new Date(r.schedule).toLocaleDateString()
    //               : "-";
    //             return `${routeText}\n${scheduleText}`;
    //           })
    //           .join("\n");

    //         const row = {
    //           Vendor: q.vendor_name || "-",
    //           Airline: q.airline_name || "-",
    //           "Transit Days": q.transit_days || "-",
    //           "Final Bid Price": finalBid,
    //           "Percent %":
    //             q.percentage !== undefined ? `${q.percentage}%` : "-",
    //           "Total Saving": saving ? saving.toFixed(2) : "-",
    //           Position: `L${index + 1}`,
    //         };

    //         return cols.map((col) => row[col]);
    //       });

    //     doc.setFontSize(12);
    //     doc.setFont("helvetica", "bold");
    //     doc.text("Participated Vendor and Bid Details", 10, yPos);

    //     yPos += 6;

    //     // 📄 Draw Combined Table
    //     doc.autoTable({
    //       startY: yPos,
    //       head: [allCols],
    //       body: buildRows(allCols),
    //       theme: "grid",
    //       styles: {
    //         fontSize: 8,
    //         cellPadding: 2,
    //         halign: "center",
    //         valign: "middle",
    //         lineColor: [200, 200, 200],
    //         overflow: "linebreak", // Wrap text
    //       },
    //       headStyles: {
    //         fillColor: [68, 114, 196],
    //         textColor: [255, 255, 255],
    //         fontStyle: "bold",
    //       },
    //       alternateRowStyles: { fillColor: [245, 245, 245] },
    //       margin: { top: 10, left: 10, right: 10 },
    //       tableWidth: "auto", // Fit table to page width
    //       showHead: "firstPage",
    //       didParseCell: (data) => {
    //         // Highlight top vendor (L1)
    //         if (data.cell.raw === "L1") {
    //           data.cell.styles.fillColor = [210, 255, 210];
    //         }
    //       },
    //     });

    //     return doc.lastAutoTable.finalY + 10;
    //   };

    //   // =========================
    //   // 🔹 Footer (Page Numbers)
    //   // =========================
    //   const addFooter = (pageNum, totalPages) => {
    //     doc.setFontSize(8);
    //     doc.setTextColor(100);
    //     doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth / 2, 290, {
    //       align: "center",
    //     });
    //   };

    //   // =========================
    //   // 🔹 Generate PDF Flow
    //   // =========================
    //   addHeader();
    //   currentY = addAuctionDetails();
    //   currentY = addAuctionActivitySection(currentY, auctionData);
    //   currentY = quotedatalatestFinalNew(currentY);
    //   currentY = addSummaryBidSection(currentY);
    //   currentY = addGeneralDetails(currentY);
    //   const hasPackages = containerDatat.some(
    //     (row) => parseInt(row.packages) > 0,
    //   );

    //   if (hasPackages) {
    //     currentY = addContainerAndCharges(currentY, doc, containerDatat);
    //   }
    //   currentY = quotedatalatestFinal(currentY);

    //   const totalPages = doc.internal.getNumberOfPages();
    //   for (let i = 1; i <= totalPages; i++) {
    //     doc.setPage(i);
    //     addFooter(i, totalPages);
    //   }

    //   doc.save(`Auction_${auctionId}_Details.pdf`);
    // };

    const exportToPDF = async (auctionDetails = {}, companyDetails = {}) => {
      const confirmed = window.confirm(
        `Do you want to save and download the PDF with:\n\n`,
      );

      if (!confirmed) {
        return;
      } else {
        try {
          const token = localStorage.getItem("USERTOKEN");
          await postData(
            "quotesummary/update-rfq-status",
            {
              shipment: shipmentValue,
              currency: selectedCurrency,
              exchangeRate: exchangeRate,
              rfq_number: rfq.rfq_number,
              action: "save_and_download_pdf",
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );
        } catch (error) {}
      }

      const doc = new jsPDF("l", "mm", "a4");
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let currentY = 12;

      const checkPageBreak = (space = 15) => {
        if (currentY + space > pageHeight - 20) {
          doc.addPage();
          currentY = 15;
        }
      };

      const { totalSaving = "INR 2,00,000.00 (2.71%)" } = companyDetails;

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
          acceptedSaving = `${savingValue.toLocaleString("en-IN")}`;
        }
      } catch (err) {
        console.error("Saving calc error:", err);
      }

      const l1Quote = [...allQuotes]
        .map((q) => {
          const firstBid = q.FirstBidPrice || 0;
          const finalBid = q.grandTotalValue || 0;
          return {
            vendor_name: q.vendor_name,
            finalBid,
            saving: firstBid - finalBid,
          };
        })
        .sort((a, b) => a.finalBid - b.finalBid)[0];

      const L1TotalSavings = l1Quote ? l1Quote.saving.toFixed(2) : "N/A";

      const {
        auctionId = rfq?.rfq_number || "N/A",
        auctionTitle = rfq?.title || "N/A",
        auctionType = rfq?.type || "N/A",
        country = rfq?.country || "N/A",
        subindustry = rfq?.subindustry || "N/A",
        hideCurrentBid = rfq?.hideCurrentBidPrice || "N/A",
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

      const addHeader = () => {
        const logoWidth = 140;
        const logoHeight = 15;
        const logoX = (pageWidth - logoWidth) / 2;

        try {
          doc.addImage(logoImg, "PNG", logoX, currentY, logoWidth, logoHeight);
        } catch (e) {}

        currentY += logoHeight + 8;
      };

      const addAuctionDetails = () => {
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text("Auction Details", 20, currentY);
        currentY += 8;

        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");

        const rows = [
          ["Auction ID", auctionId],
          ["Auction Title", auctionTitle],
          ["Auction Type", auctionType],
          ["Country", country],
          ["Industry", subindustry],
          ["Hide Current Bid", hideCurrentBid],
          ["Description", description],
          ["Created Date", createdDate],
          ["Open Date", openDate],
          ["Close Date", closeDate],
          ["Total Saving (INR)", L1TotalSavings],
        ];

        rows.forEach((r) => {
          checkPageBreak(20);

          const label = `${r[0]} :`;
          const value = String(r[1] || "N/A");

          // Force long strings to wrap
          const formattedValue = value.replace(/(.{80})/g, "$1 ");

          // Split text
          const splitValue = doc.splitTextToSize(formattedValue, 180);

          // Label
          doc.setFont("helvetica", "bold");
          doc.text(label, 20, currentY);

          // Value
          doc.setFont("helvetica", "normal");
          doc.text(splitValue, 70, currentY);

          // Dynamic row height
          const rowHeight = splitValue.length * 6;

          currentY += Math.max(rowHeight, 8);
        });

        currentY += 6;

        doc.setDrawColor(200);
        doc.line(20, currentY, pageWidth - 20, currentY);
        currentY += 8;
      };

      const addGeneralDetails = (startY) => {
        let y = startY;

        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("General Details", 20, y);

        y += 8;

        const rows = [
          [
            `Exim Mode : ${rfq?.eximMode || "-"}`,
            `Movement Type : ${rfq?.movement_type || "-"}`,
            `Incoterm : ${rfq?.incoterm_exp_air || "-"}`,
          ],
          [
            `Origin Airport : ${rfq?.origin_airport || "-"}`,
            `Origin Address : ${rfq?.origin_address || "-"}`,
            `Stuffing : ${rfq?.stuffing_location || "-"}`,
          ],
          [
            `Destination Airport : ${rfq?.destination_airport || "-"}`,
            `Destination Address : ${rfq?.destination_address || "-"}`,
            //`Destuffing : ${rfq?.destuffing_location || "-"}`,
            `Temperature : ${rfq?.temperature || "-"}`,
          ],
          [
            `TotalGross Weight : ${rfq?.totalGrossWeight} KG`,
            `Total Volumetric : ${rfq?.totalVolumetricWeight} KG`,
            //`Chargable Weight : ${rfq?.chargeable_weight || "-"} KG`,
            `Value of Shipment : INR ${rfq?.value_of_shipment || "-"}`,
          ],
          [
            `Material : ${rfq?.material || "-"}`,
            `HS Code : ${rfq?.hs_code || "-"}`,
            `Total Cartons / Pallets : ${rfq?.package_summary?.totalCartons || "-"}`,
          ],
          // [
          //   {
          //     content: `Volumetric Factor : ${rfq?.volumetricFactor || "-"}`,
          //     colSpan: 3,
          //   },
          // ],
        ];

        doc.autoTable({
          startY: y,
          body: rows,
          theme: "grid",
          styles: { fontSize: 9, cellPadding: 3 },
          margin: { left: 20, right: 20 },
        });

        return doc.lastAutoTable.finalY + 10;
      };

      const addContainerAndCharges = (startY, data) => {
        let y = startY;

        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Container & Charges", 20, y);

        y += 6;

        doc.autoTable({
          startY: y,
          head: [["No of Packages", "Dimension", "Gross Weight", "Charges"]],
          body: data.map((r) => [
            r.packages,
            r.dimension,
            r.gross_weight,
            r.charges,
          ]),
          styles: { fontSize: 9 },
          headStyles: { fillColor: [68, 114, 196], textColor: 255 },
          margin: { left: 20, right: 20 },
        });

        return doc.lastAutoTable.finalY + 10;
      };

      const addAuctionActivitySection = (startY, auctionData = {}) => {
        let y = startY;
        const pageHeight = doc.internal.pageSize.getHeight();
        const marginBottom = 20;

        const checkPageBreak = (needed = 15) => {
          if (y + needed > pageHeight - marginBottom) {
            doc.addPage();
            y = 20;
          }
        };

        const invited = Array.isArray(auctionData?.invited)
          ? auctionData.invited
          : [];

        const users = auctionData?.users
          ? Object.values(auctionData.users)
          : [];
        const vendors = users.filter((u) => u.role === "vendor");

        const bids = auctionData?.bids || {};
        const ranks = auctionData?.ranks || {};

        const participated = vendors.filter((v) => bids[v.id]);

        const winnerId = Object.entries(ranks).find(
          ([, rank]) => rank === 1,
        )?.[0];

        const winner = participated.find((v) => v.id === winnerId);

        checkPageBreak(20);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text("Auction Activity Summary", 20, y);

        y += 8;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);

        const timelineRows = [
          ["Auction Number", auctionData?.auction_number || "N/A"],
          ["Auction Mode", (auctionData?.mode || "").toUpperCase()],
          [
            "Start Time",
            auctionData?.startTime
              ? new Date(auctionData.startTime).toLocaleString()
              : "N/A",
          ],
          [
            "End Time",
            auctionData?.endTime
              ? new Date(auctionData.endTime).toLocaleString()
              : "N/A",
          ],
          ["Country", rfq?.country ? rfq.country : "N/A"],
          ["Industry", rfq?.subindustry ? rfq.subindustry : "N/A"],
          //["Hide Current Bid", rfq?.hideCurrentBid ? "Yes" : "No"],
          [
            "Description",
            rfq?.description
              ? rfq.description.replace(/\n/g, " ").trim()
              : "N/A",
          ],
          [
            "Created Date",
            rfq?.createdDate
              ? new Date(rfq.createdDate).toLocaleString()
              : "N/A",
          ],
          //["Total Saving (INR)", L1TotalSavings ? L1TotalSavings : "-"],
        ];

        timelineRows.forEach((row) => {
          const label = `${row[0]} :`;

          // convert value safely
          let value = String(row[1] || "N/A");

          // force wrap for very long continuous strings
          value = value.replace(/(.{60})/g, "$1 ");

          // split text based on width
          const splitValue = doc.splitTextToSize(value, 180);

          // calculate required height
          const lineHeight = 6;
          const rowHeight = splitValue.length * lineHeight;

          checkPageBreak(rowHeight + 5);

          // label
          doc.setFont("helvetica", "bold");
          doc.text(label, 20, y);

          // value
          doc.setFont("helvetica", "normal");
          doc.text(splitValue, 70, y);

          // move Y dynamically
          y += Math.max(rowHeight, 8);
        });

        y += 5;

        checkPageBreak(15);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text("Vendor Participation Summary", 20, y);

        y += 6;

        // Invited Vendors Details
        const invitedVendorDetails = (rfq?.invitedVendors || []).map(
          (v) => `Company : ${v.company || "-"}\n`,
          // `Vendor : ${v.name || "-"}\n` +
          // `Email : ${v.email || "-"}`,
        );

        // Participated Vendors Details
        const participatedVendorDetails = allQuotes.map(
          (q) => `Company : ${q.company || "-"}\n`,
          // `Vendor : ${q.vendor_name || "-"}\n` +
          // `Email : ${q.vendor_email || "-"}`,
        );

        // Max rows
        const maxRows = Math.max(
          invitedVendorDetails.length,
          participatedVendorDetails.length,
        );

        // Build rows
        const rows = Array.from({ length: maxRows }, (_, index) => [
          invitedVendorDetails[index] || "",
          participatedVendorDetails[index] || "",
        ]);

        doc.autoTable({
          startY: y,
          head: [["Invited Vendors", "Participated Vendors"]],
          body: rows,
          theme: "grid",
          styles: {
            fontSize: 9,
            cellPadding: 4,
            textColor: [0, 0, 0],
            lineColor: [120, 120, 120],
            lineWidth: 0.2,
            overflow: "linebreak",
            valign: "middle",
          },
          headStyles: {
            fillColor: [68, 114, 196],
            textColor: 255,
            fontStyle: "bold",
            fontSize: 10,
          },
          alternateRowStyles: {
            fillColor: [245, 245, 245],
          },
          margin: {
            left: 20,
            right: 20,
          },
        });

        return doc.lastAutoTable.finalY + 10;
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
          "Percentage",
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
              Vendor: q.company_name || "-",
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
              "Exchange Rate": exchangeRate
                ? exchangeRate
                : q.exchangeRate || "-",
              "Transit Days": q.transit_days || "-",
              Routing: routes || "-",
              "Remark / Condition": q.remarks || "-",
              "Target Price": lastPurchase ? lastPurchase : "-",
              "Total Charges (INR)": finalBid
                ? parseFloat(finalBid).toFixed(2)
                : "-",
              "Total Saving": saving ? saving.toFixed(2) : "-",
              Percentage: q.percentage ? `${q.percentage}%` : "-",
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
            fontSize: 9,
            cellPadding: 2,
            textColor: [0, 0, 0],
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

        return doc.lastAutoTable.finalY;
      };

      /* ==============================
   FOOTER
============================== */

      const addFooter = (page, total) => {
        doc.setFontSize(8);
        doc.setTextColor(120);
        doc.text(`Page ${page} of ${total}`, pageWidth / 2, pageHeight - 8, {
          align: "center",
        });
      };

      /* ==============================
   PDF FLOW
============================== */

      addHeader();
      currentY = addAuctionActivitySection(currentY, auctionData);
      currentY = addGeneralDetails(currentY);
      //currentY = quotedatalatestFinal(currentY);

      // const containerDatat =
      //   rfq?.package_summary?.packages?.map((pkg) => ({
      //     packages: `${pkg.number || 0} ${pkg.type || "Packages"}`,
      //     dimension: `${pkg.length || 0} x ${pkg.breadth || 0} x ${pkg.height || 0} ${pkg.dim_unit?.toUpperCase() || ""}`,
      //     gross_weight: `${pkg.gross_weight || 0} ${pkg.weight_unit?.toUpperCase() || ""}`,
      //     charges: "Air Freight",
      //   })) || [];

      // if (containerDatat.length) {
      //   currentY = addContainerAndCharges(currentY, containerDatat);
      // }

      const packages = rfq?.package_summary?.packages || [];

      const hasPackageData = packages.some(
        (pkg) =>
          Number(pkg.number) > 0 ||
          Number(pkg.length) > 0 ||
          Number(pkg.breadth) > 0 ||
          Number(pkg.height) > 0 ||
          Number(pkg.gross_weight) > 0,
      );

      if (hasPackageData) {
        const containerDatat = packages.map((pkg) => ({
          packages: `${pkg.number || 0} ${pkg.type || "Packages"}`,
          dimension: `${pkg.length || 0} x ${pkg.breadth || 0} x ${pkg.height || 0} ${pkg.dim_unit?.toUpperCase() || ""}`,
          gross_weight: `${pkg.gross_weight || 0} ${pkg.weight_unit?.toUpperCase() || ""}`,
          charges: "Air Freight",
        }));

        currentY = addContainerAndCharges(currentY, containerDatat);
      }

      const addVendorQuoteSummaryTable = (startY) => {
        let y = startY;

        checkPageBreak(30);

        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Vendor Quote Summary", 20, y);

        y += 8;

        const tableColumn = [
          "Vendor",
          "Airline",
          "Airport",
          "Chargeable Wt",
          "Freight",
          "AMS",
          "PAC",
          "AWB",
          "DAP/DDP",
          "Other",
          "First Bid",
          "Final Bid",
          //"Target Price",
          "Total Saving",
          "Percent %",
          "Rank",
        ];

        const totalSavingValueCheck =
          allQuotes.find((item) => item.rank === "L1")?.total_savingtest || 0;

        // const tableRows = allQuotesWithUniqueId.map((row) => {
        //   const matchedNegotiation =
        //     Array.isArray(row.negotiation) &&
        //     row.negotiation.find(
        //       (n) =>
        //         n.airline_name?.toLowerCase().trim() ===
        //         row.airline_name?.toLowerCase().trim(),
        //     );

        //   return [
        //     row.company || "-",
        //     row.airline_name || "-",
        //     row.airport || "-",
        //     row.chargeable_weight || "-",
        //     row.base_rate || "-",
        //     row.ams || "-",
        //     row.pac || "-",
        //     row.awb || "-",
        //     row.dap_ddp_charges
        //       ? `${row.dap_ddp_charges} (${row.currency})`
        //       : "-",
        //     row.other_charges || "-",
        //     `Rs ${parseFloat(row.FirstBidPrice || 0).toLocaleString("en-US", {
        //       minimumFractionDigits: 2,
        //       maximumFractionDigits: 2,
        //     })}`,
        //     `Rs ${parseFloat(row.grandTotalValue || 0).toLocaleString("en-US", {
        //       minimumFractionDigits: 2,
        //       maximumFractionDigits: 2,
        //     })}`,
        //     // matchedNegotiation?.last_purchase_price
        //     //   ? `Rs ${matchedNegotiation.last_purchase_price}`
        //     //   : "-",
        //     `Rs ${parseFloat(row.total_savingtest || 0).toLocaleString(
        //       "en-US",
        //       {
        //         minimumFractionDigits: 2,
        //         maximumFractionDigits: 2,
        //       },
        //     )}`,
        //     `${row.percentage || 0}%`,
        //     row.savingRank || "-",
        //   ];
        // });

        const tableRows = allQuotesWithUniqueId.flatMap((row) => {
          const quoteRow = [
            row.company || "-",
            row.airline_name || "-",
            row.airport || "-",
            row.chargeable_weight || "-",
            row.base_rate || "-",
            row.ams || "-",
            row.pac || "-",
            row.awb || "-",
            row.dap_ddp_charges
              ? `${row.dap_ddp_charges} (${row.currency})`
              : "-",
            row.other_charges || "-",
            `Rs ${parseFloat(row.FirstBidPrice || 0).toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`,
            `Rs ${parseFloat(row.grandTotalValue || 0).toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`,
            `Rs ${parseFloat(row.total_savingtest || 0).toLocaleString(
              "en-US",
              {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              },
            )}`,
            `${row.percentage || 0}%`,
            row.savingRank || "-",
          ];

          // Route Details
          const routes = [
            {
              route: row.route1,
              schedule: row.flight_schedule1,
            },
            {
              route: row.route2,
              schedule: row.flight_schedule2,
            },
            {
              route: row.route3,
              schedule: row.flight_schedule3,
            },
          ].filter((r) => r.route || r.schedule);

          if (!routes.length && !row.remarks) {
            return [quoteRow];
          }

          const routeContent = [
            "Flight Route Details",
            "------------------------------------------------------------",
            ...routes.map(
              (r, i) =>
                `Route ${i + 1} : ${r.route || "-"}      Flight : ${
                  r.schedule
                    ? new Date(r.schedule).toLocaleDateString("en-GB")
                    : "-"
                }`,
            ),
            row.remarks ? `Remarks : ${row.remarks}` : "",
          ]
            .filter(Boolean)
            .join("\n");

          const routeRow = [
            {
              content: routeContent,
              colSpan: quoteRow.length,
              styles: {
                fillColor: [248, 250, 252],
                textColor: [55, 65, 81],
                fontSize: 8,
                fontStyle: "normal",
                cellPadding: {
                  top: 3,
                  right: 5,
                  bottom: 3,
                  left: 5,
                },
                halign: "left",
                valign: "middle",
              },
            },
          ];

          return [quoteRow, routeRow];
        });

        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");

        //doc.text(`Total Saving : ${totalSavingValueCheck || 0}`, 20, y);
        doc.text(
          `Exchange Rate (${selectedCurrency || ""}) : ${
            parseFloat(exchangeRate).toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }) || "-"
          }`,
          20,
          y,
        );

        y += 8;

        doc.text(
          `Shipment Value (${selectedCurrency || ""}) : ${
            parseFloat(shipmentValue).toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }) || "-"
          }`,
          20,
          y,
        );

        doc.text(
          `Value of Shipment (${"INR"}):  ${
            parseFloat(exchangeRate * shipmentValue).toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }) || "-"
          }`,
          120,
          y,
        );

        y += 10;

        doc.autoTable({
          startY: y,
          head: [tableColumn],
          body: tableRows,
          theme: "grid",
          styles: {
            fontSize: 9,
            cellPadding: 2,
            textColor: [0, 0, 0],
            overflow: "linebreak",
          },
          headStyles: {
            fillColor: [41, 128, 185],
            textColor: 255,
            fontStyle: "bold",
          },
          alternateRowStyles: {
            fillColor: [245, 245, 245],
          },
          margin: {
            left: 10,
            right: 10,
          },
          // didParseCell: function (data) {
          //   const savingRank = data.row.raw[data.row.raw.length - 1];
          //   const totalSavingColumnIndex = 12;

          //   // Winner row
          //   if (data.section === "body" && savingRank === "L1") {
          //     data.cell.styles.fillColor = [220, 252, 231]; // Light green
          //     data.cell.styles.textColor = [120, 53, 15];
          //     data.cell.styles.fontStyle = "bold";

          //     // Winner's Total Saving cell - darker green
          //     if (data.column.index === totalSavingColumnIndex) {
          //       data.cell.styles.fillColor = [34, 197, 94]; // Strong green
          //       data.cell.styles.textColor = [255, 255, 255];
          //       data.cell.styles.fontStyle = "bold";
          //     }
          //   }
          // },
          didParseCell: function (data) {
            // Skip styling for Route Details row
            if (
              data.row.raw.length === 1 &&
              typeof data.row.raw[0] === "object" &&
              data.row.raw[0].colSpan
            ) {
              return;
            }

            const savingRank = data.row.raw[data.row.raw.length - 1];
            const totalSavingColumnIndex = 12;

            if (data.section === "body" && savingRank === "L1") {
              data.cell.styles.fillColor = [220, 252, 231];
              data.cell.styles.textColor = [120, 53, 15];
              data.cell.styles.fontStyle = "bold";

              if (data.column.index === totalSavingColumnIndex) {
                data.cell.styles.fillColor = [34, 197, 94];
                data.cell.styles.textColor = [255, 255, 255];
                data.cell.styles.fontStyle = "bold";
              }
            }
          },
        });

        return doc.lastAutoTable.finalY;
      };

      currentY = addVendorQuoteSummaryTable(currentY);

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
      attachedFile: row.hodAcceptRequestDetails?.attached_file || [],
      marketingAttachedFile:
        row.sharedtoMarketingTeamDetails?.attached_file || [],
      marketingTeamDataRemarks:
        row.sharedtoMarketingTeamDetails?.remarks || null,
      marketingTeamDataDate:
        row.sharedtoMarketingTeamDetails?.accepted_at || null,
      hodApprovalDataRemarks: row.hodAcceptRequestDetails?.remarks || null,
      hodApprovalDataDate: row.hodAcceptRequestDetails?.accepted_at || null,
      hodApprovedOnDate: row.hodAcceptRequestDetails?.hod_approved_on || null,
      hodApprovalDataRejectedDate:
        row.hodAcceptRequestDetails?.hod_rejected_on || null,
      hodApprovalDataMessage: row.hodAcceptRequestDetails?.hod_msg || null,
      buyerDocumentsSubmitted:
        row.buyerDocumentsUploadedDetails?.attached_file || [],
      buyerDocSubmittedDate:
        row.buyerDocumentsUploadedDetails?.submitted_at || null,
      sharedWithAccountsTeamDetails:
        row.sharedtoAccountsTeamDetails?.attached_file || [],
      saveAndDownloadPdfDetails: row.saveAndDownloadPdfDetails,
    }));

    console.log("allQuotesWithUniqueId", allQuotesWithUniqueId);

    const hodApprovalQuotes = allQuotesWithUniqueId.filter(
      (row, index, self) =>
        row.hodAcceptRequestDetails &&
        Object.keys(row.hodAcceptRequestDetails).length > 0 &&
        index ===
          self.findIndex(
            (r) =>
              r.vendor_id === row.vendor_id &&
              r.hodAcceptRequestDetails?.requested_airline ===
                row.hodAcceptRequestDetails?.requested_airline,
          ),
    );

    console.log("hodApprovalQuotes", hodApprovalQuotes);

    let hasHodApproved = hodApprovalQuotes.some(
      (item) => item.hodAcceptRequestDetails?.status === "hod_approved",
    );

    console.log("hasHodApproved value::", hasHodApproved);

    const buyerDocumentsQuotes = allQuotesWithUniqueId.filter(
      (row, index, self) =>
        row.buyerDocumentsSubmitted?.length > 0 &&
        index ===
          self.findIndex(
            (r) =>
              r.vendor_id === row.vendor_id &&
              r.buyerDocumentsUploadedDetails?.airline_name ===
                row.buyerDocumentsUploadedDetails?.airline_name,
          ),
    );

    console.log("buyerDocumentsQuotes", buyerDocumentsQuotes);

    // const marketingTeamStatusQuotes = allQuotesWithUniqueId.filter(
    //   (row, index, self) =>
    //     row.marketingAttachedFile?.length > 0 &&
    //     index ===
    //       self.findIndex(
    //         (r) =>
    //           r.vendor_id === row.vendor_id &&
    //           r.sharedtoMarketingTeamDetails?.marketing_email ===
    //             row.sharedtoMarketingTeamDetails?.marketing_email,
    //       ),
    // );
    const marketingTeamStatusQuotes = allQuotesWithUniqueId.filter(
      (row, index, self) =>
        row.marketingAttachedFile?.length > 0 &&
        index ===
          self.findIndex(
            (r) =>
              r.vendor_id === row.vendor_id &&
              JSON.stringify(
                r.sharedtoMarketingTeamDetails?.marketing_team_details || [],
              ) ===
                JSON.stringify(
                  row.sharedtoMarketingTeamDetails?.marketing_team_details ||
                    [],
                ),
          ),
    );

    console.log("marketingTeamStatusQuotes", marketingTeamStatusQuotes);

    const invoiceDetails = Object.values(
      allQuotesWithUniqueId.reduce((acc, row) => {
        const invoice = row.invoiceDetails;

        if (!invoice || Object.keys(invoice).length === 0) {
          return acc;
        }

        const key = `${row.vendor_id}-${invoice.vendor_email || ""}`;
        const existing = acc[key];

        const statusPriority = {
          invoice_approved: 3,
          invoice_rejected: 2,
          invoice_received: 1,
          received: 1,
        };

        const currentPriority =
          statusPriority[invoice.status] || invoice.status ? 1 : 0;
        const existingPriority =
          statusPriority[existing?.invoiceDetails?.status] ||
          (existing?.invoiceDetails?.status ? 1 : 0);

        const existingSubmitted = existing?.invoiceDetails?.submitted_on
          ? new Date(existing.invoiceDetails.submitted_on).getTime()
          : 0;
        const currentSubmitted = invoice.submitted_on
          ? new Date(invoice.submitted_on).getTime()
          : 0;

        if (!existing) {
          acc[key] = row;
          return acc;
        }

        if (
          currentPriority > existingPriority ||
          (currentPriority === existingPriority &&
            currentSubmitted > existingSubmitted)
        ) {
          acc[key] = row;
        }

        return acc;
      }, {}),
    );

    console.log("invoiceDetails", invoiceDetails);

    const sharedWithAccountsTeamDetails = allQuotesWithUniqueId.filter(
      (row, index, self) => {
        // check object has actual values
        const hasAccountsData =
          row.sharedtoAccountsTeamDetails &&
          Object.keys(row.sharedtoAccountsTeamDetails).length > 0;

        if (!hasAccountsData) return false;

        // avoid duplicate vendor/account rows
        return (
          index ===
          self.findIndex(
            (r) =>
              r.vendor_id === row.vendor_id &&
              r.sharedtoAccountsTeamDetails?.shared_on ===
                row.sharedtoAccountsTeamDetails?.shared_on,
          )
        );
      },
    );

    console.log("sharedWithAccountsTeamDetails", sharedWithAccountsTeamDetails);

    const attachedFileName =
      allQuotesWithUniqueId.find((row) => row.attachedFile)?.attachedFile ||
      null;

    const attachedFiles =
      allQuotesWithUniqueId.find((row) => row.attachedFile?.length > 0)
        ?.attachedFile || [];

    const marketingTeamReviewFileName =
      allQuotesWithUniqueId.find((row) => row.marketingAttachedFile)
        ?.marketingAttachedFile || null;

    const marketingAttachedFiles =
      allQuotesWithUniqueId.find((row) => row.marketingAttachedFile?.length > 0)
        ?.marketingAttachedFile || [];

    const buyerDocuments =
      allQuotesWithUniqueId.find(
        (row) => row.buyerDocumentsSubmitted?.length > 0,
      )?.buyerDocumentsSubmitted || [];

    //console.log("marketingTeamReviewFileName", marketingTeamReviewFileName);

    const marketingTeamReviewDataRemarks =
      allQuotesWithUniqueId.find((row) => row.marketingTeamDataRemarks)
        ?.marketingTeamDataRemarks || null;

    const marketingEmailID =
      allQuotesWithUniqueId.find((row) => row.sharedtoMarketingTeamDetails)
        ?.sharedtoMarketingTeamDetails?.marketing_email || null;

    const marketingTeamReviewDataDate =
      allQuotesWithUniqueId.find((row) => row.marketingTeamDataDate)
        ?.marketingTeamDataDate || null;

    //console.log("fullMarketingTeamReviewData", fullMarketingTeamReviewData);

    const hodApprovalDataRemarks =
      allQuotesWithUniqueId.find((row) => row.hodApprovalDataRemarks)
        ?.hodApprovalDataRemarks || null;

    const hodApprovalDataMessage =
      allQuotesWithUniqueId.find((row) => row.hodApprovalDataMessage)
        ?.hodApprovalDataMessage || null;

    const hodEmailID =
      allQuotesWithUniqueId.find((row) => row.hodAcceptRequestDetails)
        ?.hodAcceptRequestDetails?.hod_email || null;

    const hodApprovalDataDate =
      allQuotesWithUniqueId.find((row) => row.hodApprovalDataDate)
        ?.hodApprovalDataDate || null;

    const hodApprovedOnDate =
      allQuotesWithUniqueId.find((row) => row.hodApprovedOnDate)
        ?.hodApprovedOnDate || null;

    const hodRejectedOn =
      allQuotesWithUniqueId.find((row) => row.hodApprovalDataRejectedDate)
        ?.hodApprovalDataRejectedDate || null;

    const buyerDocSubmittedDate =
      allQuotesWithUniqueId.find((row) => row.buyerDocSubmittedDate)
        ?.buyerDocSubmittedDate || null;

    const quoteWithAttachment = allQuotesWithUniqueId.find(
      (row) => row.attachedFile && row.status === "requested_hod_approval",
    );

    const approvalMessage =
      quoteWithAttachment?.hodAcceptRequestDetails?.remarks ||
      "Exports team requested for approval";

    return (
      <div className="mt-4">
        {auctionPulse && (
          <div className="auction-pulse">
            <span className="emoji">{auctionPulse.emoji}</span>
            <span className="text">{auctionPulse.text}</span>
          </div>
        )}

        {auctionData && (
          <Buyer
            userId={userId}
            vendors={selectedVendors}
            existingAuction={auctionData}
            invitedVendors={rfq?.invitedVendors || []}
            onAuctionCreated={() => {
              setShowAuctionDialog(false);
              fetchAuctionData();
            }}
            onAuctionUpdated={handleAuctionUpdated}
          />
        )}

        {/* <h4 className="mb-3">✈️ All Shipment Quotes (Flat View)</h4> */}
        {/* <div className="flex justify-content-between align-items-center mb-3"> */}
        {/* <h3>RFQ Quotes Summary</h3> */}
        {/* <Button
            label="Download PDF"
            icon="pi pi-download"
            className="p-button-sm p-button-success"
            onClick={() => exportToPDF(allQuotes, rfq?.rfq_number)}
            disabled={allQuotes.length === 0}
          />
          {} */}
        {/* </div> */}

        <div className="overflow-x-auto">
          <div
            className="flex gap-4 align-items-start mt-5"
            style={{ minWidth: "1100px" }}
          >
            {/* ================= MARKETING TEAM ================= */}
            {marketingTeamStatusQuotes?.length > 0 && (
              <div
                className="surface-card border-round shadow-2 p-3 min-w-20rem flex-1 border-1 border-indigo-300"
                style={{
                  maxHeight: "650px",
                  minHeight: "368px",
                  overflowY: "auto",
                }}
              >
                {/* Header */}

                {marketingTeamStatusQuotes.map((quote) => {
                  const marketing = quote.sharedtoMarketingTeamDetails;

                  return (
                    <div
                      key={quote.uniqueId}
                      className="border-round border-1 surface-border p-3 mb-3"
                    >
                      <div className="flex align-items-center justify-content-between mb-3">
                        <div className="flex align-items-center gap-2">
                          <i className="pi pi-send text-yellow-600 text-xl"></i>
                          <h5 className="m-0">Marketing Team</h5>
                        </div>

                        <Tag
                          className={`px-2 py-1 border-round text-sm ${
                            marketing?.status === "marketingteam_rejected"
                              ? "bg-red-100 text-red-700"
                              : marketing?.status === "marketingteam_approved"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {/* {marketing?.status === "marketingteam_rejected"
                        ? "Rejected"
                        : marketing?.status === "marketingteam_approved"
                          ? "Approved"
                          : "Pending Approval"} */}
                          Submitted
                        </Tag>
                      </div>
                      {/* Vendor Info */}
                      {/* <div className="mb-3">
                        <div>
                          <strong>Vendor:</strong> {quote.vendor_name}
                        </div>

                        <div>
                          <strong>Airline:</strong> {quote.airline_name}
                        </div>
                      </div> */}

                      {/* Details */}
                      <div className="text-sm line-height-3">
                        {/* <div>
                          <strong>Marketing Name:</strong>{" "}
                          {marketing?.marketing_name || "-"}
                        </div>

                        <div>
                          <strong>Marketing Email:</strong>{" "}
                          {marketing?.marketing_email || "-"}
                        </div> */}
                        {marketing?.marketing_team_details?.length > 0 ? (
                          <div className="mt-2 flex flex-column gap-2">
                            {marketing.marketing_team_details.map(
                              (email, idx) => (
                                <div
                                  key={idx}
                                  className="p-2 border-round surface-100"
                                >
                                  <div>
                                    <strong>Email:</strong> {email}
                                  </div>
                                </div>
                              ),
                            )}
                          </div>
                        ) : (
                          <span>-</span>
                        )}

                        <div>
                          <strong>Comment:</strong> {marketing?.remarks || "-"}
                        </div>

                        <div>
                          <strong>Date:</strong>{" "}
                          {formatDate(
                            marketing?.approved_on ||
                              marketing?.rejected_on ||
                              marketing?.accepted_at,
                          )}
                        </div>
                      </div>

                      {/* Files */}
                      {marketing?.attached_file?.length > 0 && (
                        <div
                          className="mt-3 p-2 border-round-lg"
                          style={{
                            background: "#f8fafc",
                            border: "1px solid #e2e8f0",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "12px",
                              fontWeight: 700,
                              marginBottom: "6px",
                              color: "#334155",
                            }}
                          >
                            Attachments
                          </div>

                          <div
                            style={{
                              maxHeight: "90px",
                              overflowY: "auto",
                              paddingRight: "4px",
                            }}
                          >
                            {marketing.attached_file.map((file, i) => (
                              <div key={i}>
                                <a
                                  href={`${BASE_URL}/uploads/rfq/${encodeURIComponent(
                                    file,
                                  )}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 underline text-sm"
                                >
                                  {file}
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* ================= HOD APPROVAL ================= */}
            {hodApprovalStatusData?.length > 0 && (
              <div
                className="surface-card border-round shadow-2 p-3 min-w-20rem flex-1 border-1 border-indigo-300"
                style={{
                  maxHeight: "650px",
                  minHeight: "368px",
                  overflowY: "auto",
                }}
              >
                {hodApprovalStatusData.map((quote) => (
                  <div
                    key={quote.uniqueId}
                    className="border-round border-1 surface-border p-3 mb-3"
                  >
                    <div className="flex align-items-center justify-content-between mb-3">
                      <div className="flex align-items-center gap-2">
                        <i className="pi pi-check-circle text-green-600 text-xl"></i>
                        <h5 className="m-0">HOD Approval</h5>
                      </div>

                      <Tag
                        className={`px-2 py-1 border-round text-sm ${
                          quote.status === "requested_hod_approval"
                            ? "bg-yellow-100 text-yellow-700"
                            : quote.status === "hod_rejected"
                              ? "bg-red-100 text-red-700"
                              : "bg-green-100 text-green-700"
                        }`}
                      >
                        {quote.status === "requested_hod_approval"
                          ? "Pending Approval"
                          : quote.status === "hod_rejected"
                            ? "Rejected"
                            : quote.status === "hod_approved"
                              ? "Approved"
                              : "Pending Approval"}
                      </Tag>
                    </div>
                    <div className="text-sm line-height-3">
                      <div>
                        <strong>HOD Email:</strong> {quote.hod_email}
                      </div>

                      <div>
                        <strong>HOD Comment:</strong> {quote.decisionRemarks}
                      </div>

                      <div>
                        <strong>Buyer Comment:</strong> {quote.remarks}
                      </div>

                      <div>
                        <strong>Requested Date:</strong>{" "}
                        {formatDate(quote.requestedAt)}
                      </div>
                      <div>
                        <strong>HOD Approved Date:</strong>{" "}
                        {formatDate(quote.decisionAt)}
                      </div>
                    </div>

                    <div
                      className="mt-3 p-2 border-round-lg"
                      style={{
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      Vendor Details:
                      <div>
                        <strong>Vendor Name:</strong> {quote.vendor_name}
                      </div>
                      <div>
                        <strong>Airline:</strong> {quote.airline_name}
                      </div>
                    </div>

                    {quote.attached_file?.length > 0 && (
                      <div
                        className="mt-3 p-2 border-round-lg"
                        style={{
                          background: "#f8fafc",
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "12px",
                            fontWeight: 700,
                            marginBottom: "6px",
                            color: "#334155",
                          }}
                        >
                          Attachments
                        </div>

                        <div
                          style={{
                            maxHeight: "90px",
                            overflowY: "auto",
                            paddingRight: "4px",
                          }}
                        >
                          {quote.attached_file.map((file, i) => (
                            <div key={i}>
                              <a
                                href={`${BASE_URL}/uploads/rfq/${encodeURIComponent(
                                  file,
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 underline text-sm"
                              >
                                {file}
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* ================= BUYER DOCS ================= */}
            {buyerDocumentsQuotes?.length > 0 && (
              <div
                className="surface-card border-round shadow-2 p-3 min-w-20rem flex-1 border-1 border-indigo-300"
                style={{
                  maxHeight: "650px",
                  minHeight: "368px",
                  overflowY: "auto",
                }}
              >
                {buyerDocumentsQuotes.map((quote) => (
                  <div
                    key={quote.uniqueId}
                    className="border-round border-1 surface-border p-3 mb-3"
                  >
                    <div className="flex align-items-center justify-content-between mb-3">
                      <div className="flex align-items-center gap-2">
                        <i className="pi pi-folder-open text-blue-600 text-xl"></i>
                        <h5 className="m-0">Buyer → Vendor Docs</h5>
                      </div>

                      <Tag
                        value="Uploaded"
                        severity="info"
                        className="text-sm"
                      />
                    </div>
                    <div className="mb-3">
                      <div>
                        <strong>Vendor:</strong> {quote.vendor_name}
                      </div>

                      <div>
                        <strong>Airline:</strong> {quote.airline_name}
                      </div>
                    </div>

                    <div className="text-sm mb-3">
                      <strong>Submitted On:</strong>{" "}
                      {formatDate(quote.buyerDocSubmittedDate)}
                    </div>

                    {quote.buyerDocumentsSubmitted?.length > 0 && (
                      <div
                        className="mt-3 p-2 border-round-lg"
                        style={{
                          background: "#f8fafc",
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "12px",
                            fontWeight: 700,
                            marginBottom: "6px",
                            color: "#334155",
                          }}
                        >
                          Attachments
                        </div>
                        <div
                          style={{
                            maxHeight: "90px",
                            overflowY: "auto",
                            paddingRight: "4px",
                          }}
                        >
                          {quote.buyerDocumentsSubmitted.map((file, i) => (
                            <div key={i}>
                              <a
                                href={`${BASE_URL}/uploads/rfq/${encodeURIComponent(
                                  file,
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 underline text-sm"
                              >
                                {file}
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* ================= INVOICE SUBMISSION ================= */}
            {invoiceDetails?.length > 0 && (
              <div
                className="surface-card border-round shadow-2 p-3 min-w-20rem flex-1 border-1 border-indigo-300"
                style={{
                  maxHeight: "650px",
                  overflowY: "auto",
                }}
              >
                {invoiceDetails.map((quote) => (
                  <div
                    key={quote.uniqueId}
                    className="border-round-xl border-1 surface-border p-3 mb-3"
                    style={{
                      background: "#ffffff",
                      border: "1px solid #dbeafe",
                    }}
                  >
                    {/* HEADER */}
                    <div className="flex align-items-start justify-content-between gap-3 mb-2">
                      {/* LEFT */}
                      <div className="flex align-items-start gap-2">
                        <div>
                          <div
                            style={{
                              fontWeight: 700,
                              fontSize: "15px",
                              color: "#1e293b",
                            }}
                          >
                            <i className="pi pi-folder-open text-blue-600 text-xl"></i>{" "}
                            Vendor Invoice
                          </div>
                        </div>
                      </div>

                      {/* RIGHT */}
                      <div className="flex align-items-center gap-2 flex-wrap justify-content-end">
                        <Tag
                          value={
                            quote.invoiceDetails?.status === "invoice_rejected"
                              ? "Rejected"
                              : quote.invoiceDetails?.status ===
                                  "invoice_approved"
                                ? "Approved"
                                : "Received"
                          }
                          severity={
                            quote.invoiceDetails?.status === "invoice_rejected"
                              ? "danger"
                              : quote.invoiceDetails?.status ===
                                  "invoice_approved"
                                ? "success"
                                : "warning"
                          }
                        />

                        {/* SHARE */}
                        {(() => {
                          const sharedAccountsInfo =
                            quote?.invoiceDetails?.accountsTeamDetails || {};
                          const hasSharedAccounts =
                            Object.keys(sharedAccountsInfo).length > 0;
                          const accountsTeamLabel = Array.isArray(
                            sharedAccountsInfo.accounts_team_details,
                          )
                            ? sharedAccountsInfo.accounts_team_details.join(
                                ", ",
                              )
                            : sharedAccountsInfo.accounts_team_details ||
                              sharedAccountsInfo.accounts_team_detail ||
                              "-";
                          const sharedOnLabel = sharedAccountsInfo.shared_on
                            ? new Date(
                                sharedAccountsInfo.shared_on,
                              ).toLocaleString()
                            : "-";

                          return (
                            <i
                              className={`pi pi-share-alt text-lg ${
                                hasSharedAccounts
                                  ? "text-gray-400 cursor-not-allowed"
                                  : "text-blue-600 cursor-pointer"
                              }`}
                              title={
                                hasSharedAccounts
                                  ? `Shared with Accounts Team: ${accountsTeamLabel}\nShared On: ${sharedOnLabel}`
                                  : "Share with Accounts Team"
                              }
                              onClick={() => {
                                if (hasSharedAccounts) return;

                                setSelectedInvoice(quote.invoiceDetails);
                                setShowShareToAccountsTeamDialog(true);
                              }}
                            ></i>
                          );
                        })()}

                        {/* APPROVE */}
                        <i
                          className="pi pi-check-circle text-green-600 cursor-pointer text-lg"
                          title="Approve"
                          onClick={() => {
                            setSelectedInvoice(quote.invoiceDetails);
                            handleInvoiceApproveSubmit(true);
                          }}
                        ></i>

                        {/* REJECT */}
                        <i
                          className="pi pi-times-circle text-red-600 cursor-pointer text-lg"
                          title="Reject"
                          onClick={() => {
                            setSelectedInvoice(quote.invoiceDetails);
                            setShowRejectDialog(true);
                          }}
                        ></i>
                      </div>
                    </div>

                    {/* SUMMARY */}
                    <div
                      className="grid mt-2"
                      style={{
                        fontSize: "12px",
                        color: "#334155",
                        rowGap: "6px",
                      }}
                    >
                      <div className="col-6">
                        <strong>Freight:</strong>{" "}
                        {quote.invoiceDetails?.freight_amount || "-"}
                      </div>

                      <div className="col-6">
                        <strong>DAP:</strong>{" "}
                        {quote.invoiceDetails?.dap_amount || "-"}
                      </div>

                      <div className="col-6">
                        <strong>Custom:</strong>{" "}
                        {quote.invoiceDetails?.custom_duty_amount || "-"}
                      </div>

                      <div className="col-6">
                        <strong>Others:</strong>{" "}
                        {quote.invoiceDetails?.others_amount || "-"}
                      </div>

                      <div className="col-12">
                        <strong>Submitted:</strong>{" "}
                        {formatDate(quote.invoiceDetails?.submitted_on)}
                      </div>
                    </div>

                    {/* FILES */}
                    {quote.invoiceDetails?.attached_file?.length > 0 && (
                      <div
                        className="mt-3 p-2 border-round-lg"
                        style={{
                          background: "#f8fafc",
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "12px",
                            fontWeight: 700,
                            marginBottom: "6px",
                            color: "#334155",
                          }}
                        >
                          Attachments
                        </div>

                        <div
                          style={{
                            maxHeight: "90px",
                            overflowY: "auto",
                            paddingRight: "4px",
                          }}
                        >
                          {quote.invoiceDetails.attached_file.map((file, i) => (
                            <div
                              key={i}
                              style={{
                                marginBottom: "4px",
                              }}
                            >
                              <a
                                href={`${BASE_URL}/uploads/invoices/${encodeURIComponent(
                                  file,
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 text-sm"
                                style={{
                                  wordBreak: "break-word",
                                  textDecoration: "underline",
                                  fontSize: "12px",
                                }}
                              >
                                {file}
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* ================= ACCOUNTS TEAM ================= */}
            {/* {sharedWithAccountsTeamDetails?.length > 0 && (
              <div className="surface-card border-round shadow-2 p-3 min-w-20rem flex-1 border-1 border-purple-300">
                <div className="flex align-items-center justify-content-between mb-3">
                  <div className="flex align-items-center gap-2">
                    <i className="pi pi-wallet text-purple-600 text-xl"></i>
                    <h5 className="m-0">Accounts Team</h5>
                  </div>

                  <Tag value="Shared" severity="help" className="text-sm" />
                </div>

                {sharedWithAccountsTeamDetails.map((quote) => {
                  const accounts = quote.sharedtoAccountsTeamDetails;

                  return (
                    <div
                      key={quote.uniqueId}
                      className="border-round border-1 surface-border p-3 mb-3"
                    >
                      <div className="mb-3">
                        <div>
                          <strong>Vendor:</strong> {quote.vendor_name}
                        </div>

                        <div>
                          <strong>Airline:</strong> {quote.airline_name}
                        </div>
                      </div>

                      <div className="text-sm line-height-3">
                        <div>
                          <strong>Accounts Team:</strong>{" "}
                          {accounts?.accounts_team_details || "-"}
                        </div>

                        <div>
                          <strong>Remarks:</strong> {accounts?.remarks || "-"}
                        </div>

                        <div>
                          <strong>Shared On:</strong>{" "}
                          {formatDate(accounts?.shared_on)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )} */}
          </div>
        </div>

        {/* {attachedFiles.length > 0 && (
          <div className="p-3 mb-3 border-round bg-yellow-100 text-yellow-900 shadow-2">
            <div className="flex align-items-center gap-3">
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

              {hodApprovalDataMessage ? (
                <div className="p-3 border rounded bg-green-50 border-green-300">
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        hodApprovalDataMessage && buyerDocuments?.length > 0
                          ? "1fr 1fr"
                          : "1fr",
                      gap: "20px",
                      marginTop: "10px",
                    }}
                  >
                    {(hodApprovalDataMessage || hodRejectedOn) && (
                      <div
                        className={`p-3 border-round shadow-1 ${
                          hodRejectedOn
                            ? "bg-red-50 border-red-300"
                            : "bg-white"
                        }`}
                      >
                        <strong
                          className={
                            hodRejectedOn ? "text-red-700" : "text-green-700"
                          }
                        >
                          HOD Approval Status:{" "}
                          {hodRejectedOn ? "Rejected" : "Approved"}
                        </strong>
                        <br />
                        <strong>Requested HOD Approval:</strong> {hodEmailID}
                        <br />
                        <strong>Reason:</strong> {hodApprovalDataRemarks}
                        <br />
                        <strong>HOD Comment:</strong> {hodApprovalDataMessage}
                        <br />
                        <br />
                        <strong>
                          {hodRejectedOn ? "Rejected On:" : "Requested On:"}
                        </strong>{" "}
                        {formatDate(
                          hodRejectedOn ? hodRejectedOn : hodApprovalDataDate,
                        )}
                        <br />
                        {attachedFiles?.length > 0 && (
                          <>
                            <strong>Attachment:</strong>
                            {attachedFiles.map((file, index) => (
                              <div key={index}>
                                <a
                                  href={`${BASE_URL}/uploads/rfq/${encodeURIComponent(file)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-700 underline"
                                >
                                  {file}
                                </a>
                              </div>
                            ))}
                          </>
                        )}
                      </div>
                    )}


                    {buyerDocuments?.length > 0 && (
                      <div className="p-3 border-round bg-white shadow-1">
                        <strong className="text-green-700">
                          Buyer Submitted Documents
                        </strong>
                        <br />
                        <strong>Submitted On:</strong>{" "}
                        {formatDate(buyerDocSubmittedDate)}
                        {buyerDocuments.map((file, index) => (
                          <div key={index}>
                            <a
                              href={`${BASE_URL}/uploads/rfq/${encodeURIComponent(file)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-700 underline"
                            >
                              {file}
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-3 border rounded bg-yellow-50 border-yellow-300">
                  <strong className="text-yellow-700">
                    HOD Approval Status: Sent for Approval
                  </strong>
                  <br />
                  <strong>Requested HOD Approval:</strong> {hodEmailID}
                  <br />
                  <strong>Reason:</strong> {hodApprovalDataRemarks}
                  <br />
                  <strong>HOD Comment:</strong> {hodApprovalDataMessage}
                  <br />
                  <br />
                  <strong>Requested On:</strong>{" "}
                  {formatDate(hodApprovalDataDate)}
                  <br />
                  <strong>Attachment:</strong>
                  {attachedFiles?.map((file, index) => (
                    <div key={index}>
                      <a
                        href={`${BASE_URL}/uploads/rfq/${encodeURIComponent(file)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-700 underline"
                      >
                        {file}
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )} */}

        {/* {marketingAttachedFiles.length > 0 && (
          <div className="p-3 mb-3 border-round bg-yellow-100 text-yellow-900 shadow-2">
            <div className="flex align-items-center gap-3">
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

              <div style={{ width: "100%" }}>
                <strong>
                  Requested Marketing Team Review: {marketingEmailID}
                </strong>
                <br />
                <strong>Reason: {marketingTeamReviewDataRemarks}</strong>
                <br />
                <strong>
                  Requested On: {formatDate(marketingTeamReviewDataDate)}
                </strong>
                <br />
                <strong>Attachment: </strong>

                {marketingAttachedFiles?.map((file, index) => (
                  <div key={index}>
                    <a
                      href={`${BASE_URL}/uploads/rfq/${encodeURIComponent(file)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-700 underline"
                    >
                      {file}
                    </a>
                  </div>
                ))}


                <div className="flex gap-2 mt-3">
                  <button
                    className="p-button p-button-success"
                    onClick={() => setShowApproveDialog(true)}
                  >
                    Approved
                  </button>

                  <button
                    className="p-button p-button-danger"
                    onClick={() => setShowRejectDialog(true)}
                  >
                    Rejected
                  </button>
                </div>
              </div>
            </div>
          </div>
        )} */}

        <hr />

        <div className="flex justify-content-end align-items-center gap-4 mb-3 mt-5 flex-wrap">
          <div className="flex align-items-center gap-2">
            <label
              htmlFor="exchangeRate"
              style={{ minWidth: "110px", fontWeight: 600 }}
            >
              Exchange Rate :
            </label>

            <input
              id="exchangeRate"
              type="number"
              value={exchangeRate || ""}
              onChange={(e) => setExchangeRate(Number(e.target.value))}
              className="p-inputtext p-component"
              placeholder="Enter Exchange Rate"
              style={{ width: "180px" }}
            />
          </div>

          <div className="flex align-items-center gap-2">
            <label
              htmlFor="currency"
              style={{ minWidth: "110px", fontWeight: 600 }}
            >
              Currency :
            </label>

            <Dropdown
              id="currency"
              value={selectedCurrency}
              options={currencyOptions}
              onChange={(e) => setSelectedCurrency(e.value)}
              optionLabel="label"
              placeholder="Select Currency"
              filter
              showClear
              className="w-12rem"
            />
          </div>

          <div className="flex align-items-center gap-2">
            <label
              htmlFor="shipmentValue"
              style={{ minWidth: "130px", fontWeight: 600 }}
            >
              Shipment Value ({rfq?.package_summary?.shipment_currency || "N/A"}
              ):
            </label>

            <input
              id="shipmentValue"
              type="number"
              value={shipmentValue || ""}
              onChange={(e) => setShipmentValue(Number(e.target.value))}
              className="p-inputtext p-component"
              placeholder="Enter Shipment Value"
              style={{ width: "180px" }}
            />
          </div>

          <Button
            label="Save & Download PDF"
            icon="pi pi-download"
            className="p-button-sm p-button-success"
            onClick={() => exportToPDF(allQuotes, rfq?.rfq_number)}
            disabled={allQuotes.length === 0}
          />
        </div>

        <DataTable
          value={allQuotesWithUniqueId}
          responsiveLayout="scroll"
          className="p-datatable-sm"
          rowClassName={(rowData) =>
            rowData.savingRank === "L1" ? "winner-row" : ""
          }
          emptyMessage="No shipment quotes available"
          selection={selectedVendors}
          onSelectionChange={(e) => {
            console.log("DataTable onSelectionChange triggered", auctionData);

            // if auctionData exists → allow multiple selection
            if (auctionData && Object.keys(auctionData).length > 0) {
              const latestSelection = e.value?.slice(-1) || [];
              setSelectedVendors(latestSelection);
            } else {
              // otherwise allow only latest selected row
              setSelectedVendors(e.value || []);
            }
          }}
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
          <Column
            expander={(rowData) => {
              const hasFlightDetails =
                rowData.route1 ||
                rowData.route2 ||
                rowData.route3 ||
                rowData.flight_schedule1 ||
                rowData.flight_schedule2 ||
                rowData.flight_schedule3;

              return hasFlightDetails;
            }}
            style={{ width: "3rem" }}
          />
          <Column selectionMode="multiple" headerStyle={{ width: "3rem" }} />
          <Column header="Vendor" body={(row) => row.company} />
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
            body={(row) =>
              row.chargeable_weight != null
                ? `${Number(row.chargeable_weight).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })} kg`
                : "-"
            }
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
              row.dap_ddp_charges
                ? row.dap_ddp_charges + " (" + row.currency + ") "
                : "-"
            }
          />
          {/* <Column header="Ex Rate" body={(row) => row.exchangeRate || "-"} /> */}
          <Column header="Other" body={(row) => row.other_charges || "-"} />
          <Column
            header="First Bid Price"
            body={(row) => (
              <strong>
                ₹{" "}
                {parseFloat(row.FirstBidPrice).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </strong>
            )}
          />
          <Column
            header="Final Bid Price"
            body={(row) => (
              <strong>
                ₹{" "}
                {parseFloat(row.grandTotalValue).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </strong>
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
          {/* <Column
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
          /> */}
          <Column
            header="Total Saving"
            body={(row) => {
              const finalBid = row.grandTotalValue || 0;
              const saving =
                parseFloat(row.FirstBidPrice).toFixed(2) -
                parseFloat(finalBid).toFixed(2);

              return (
                <span>
                  ₹ {""}
                  {parseFloat(row.total_savingtest).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
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
              row.savingRank === "L1" ? (
                <span style={{ color: "green", fontWeight: "bold" }}>
                  {row.savingRank}
                </span>
              ) : (
                row.savingRank || "-"
              )
            }
          />
          <Column
            header="Status"
            body={(row) => {
              const normalizedHodEntries = Array.isArray(hodApprovalStatusData)
                ? hodApprovalStatusData
                : hodApprovalStatusData
                  ? [hodApprovalStatusData]
                  : [];

              const matchingHodEntry = normalizedHodEntries.find((item) => {
                const requestedAirline =
                  item?.requested_airline || item?.airline_name;
                return (
                  requestedAirline === row.airline_name ||
                  item?.vendor_id === row.vendor_id ||
                  item?.vendor_name === row.company
                );
              });

              const hodStatus =
                matchingHodEntry?.status || row.hodAcceptRequestDetails?.status;
              const hodAirline =
                matchingHodEntry?.requested_airline ||
                matchingHodEntry?.airline_name ||
                row.hodAcceptRequestDetails?.requested_airline;
              const matchesHodAirline =
                !hodAirline || hodAirline === row.airline_name;
              const hasHodAttachment =
                (row.attachedFile || []).length > 0 ||
                (matchingHodEntry?.attached_file || []).length > 0;
              const isAccepted =
                row.acceptedDetails?.accepted_at &&
                row.acceptedDetails?.accepted_airline === row.airline_name;

              if (isAccepted) {
                return (
                  <span
                    style={{
                      color: "green",
                      fontWeight: "bold",
                      fontSize: "0.7rem",
                    }}
                  >
                    ✅ Accepted
                  </span>
                );
              }

              if (hodStatus === "hod_approved" && matchesHodAirline) {
                return (
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "1.4rem",
                    }}
                  >
                    <span
                      style={{
                        color: "green",
                        fontWeight: "bold",
                        fontSize: "0.7rem",
                      }}
                      title="HOD Approved"
                    >
                      ✅ Approved
                    </span>

                    <span
                      style={{ color: "#0d6efd", cursor: "pointer" }}
                      title="Send Documents"
                      onClick={() => setShowDocumentsUploadDialog(true)}
                    >
                      📑
                    </span>

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
                  </span>
                );
              }

              if (hodStatus === "hod_rejected" && matchesHodAirline) {
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

              if (role === "hod" && hasHodAttachment) {
                return (
                  <div className="flex gap-2 justify-center">
                    <Button
                      icon="pi pi-check"
                      className="p-button-success p-button-rounded p-button-sm"
                      tooltip="Approve"
                      style={{ width: "1.5rem", height: "1.5rem", padding: 0 }}
                      disabled={
                        !selectedVendors?.some(
                          (item) =>
                            item.vendor_id === row.vendor_id &&
                            item.airline_name === row.airline_name,
                        )
                      }
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
                      disabled={
                        !selectedVendors?.some(
                          (item) => item.vendor_id === row.vendor_id,
                        )
                      }
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

              if (hodStatus === "requested_hod_approval" && matchesHodAirline) {
                return (
                  <span
                    style={{
                      color: "#d97706",
                      fontWeight: "bold",
                      fontSize: "0.7rem",
                    }}
                  >
                    ⏳ Pending
                  </span>
                );
              }

              return "-";
            }}
          />
        </DataTable>
      </div>
    );
  };

  const handleHodDecisionSubmit = async () => {
    try {
      const form = new FormData();
      form.append("rfq_number", rfq.rfq_number);
      form.append("action", dialogParams.actionType);
      form.append("vendors", dialogParams.vendor_id);
      form.append("requestedAirline", dialogParams.airline_name);
      form.append("hod_msg", acceptRemarks || "");
      form.append("hod_name", user?.name || "");
      form.append("hod_email", user?.email || "");

      const attachedFilesData =
        rfq?.shipments
          ?.flatMap((shipment) => shipment.quotes || [])
          ?.find((quote) => quote?.hodAcceptRequestDetails?.attached_file)
          ?.hodAcceptRequestDetails?.attached_file || null;

      console.log("Attached Files Data for HOD Decision:", attachedFilesData);

      form.append("existingAttachments", JSON.stringify(attachedFilesData));

      const token = localStorage.getItem("USERTOKEN");

      await postData("quotesummary/update-rfq-status", form, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      dispatch(
        toastSuccess({
          detail: "HOD Approval successfully!",
        }),
      );

      setShowHODDecisionDialog(false);
      setAcceptRemarks("");
      fetchSummary();
    } catch (error) {
      console.error("HOD Decision Error:", error);
      dispatch(toastError({ detail: "Error processing HOD decision." }));
    }
  };

  const handleSubmitClick = async () => {
    console.log("Attached Files:", attachedFiles);
    console.log("HOD Rejected On:", hodRejectedOn);

    const hodRejectedOnCheck =
      rfq?.shipments
        ?.flatMap((shipment) => shipment.quotes || [])
        ?.find((quote) => quote?.hodAcceptRequestDetails?.hod_rejected_on)
        ?.hodAcceptRequestDetails?.hod_rejected_on || null;

    if (hodRejectedOnCheck) {
      await handleHodDecisionSubmit();
    } else {
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
      setAcceptRemarks("");
      //fetchSummary();
      fetchAuctionData();
    }
  };

  const handleHodApprovalSubmit = async () => {
    try {
      const form = new FormData();
      form.append("rfq_number", rfq.rfq_number);
      form.append("action", "requested_hod_approval");
      form.append("remarks", acceptRemarks || "");
      form.append("hod_name", selectedHod?.name || "");
      form.append("hod_email", selectedHod?.email || "");

      if (!selectedVendors?.length || !selectedVendors[0]?.vendor_id) {
        return dispatch(
          toastError({
            detail: "Please select the vendor for hod approval request.",
          }),
        );
      }

      form.append("vendor_name", selectedVendors[0]?.vendor_name || "");
      form.append("vendor_email", selectedVendors[0]?.vendor_email || "");
      form.append("vendor_id", selectedVendors[0]?.vendor_id || "");
      form.append("airline_name", selectedVendors[0]?.airline_name || "");

      if (attachment) {
        //form.append("attachment", attachment);
        attachment.forEach((file) => {
          form.append("attachment", file);
        });
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
      setAttachment([]);
      setAcceptRemarks("");
      //fetchSummary();
      fetchAuctionData();
    } catch (error) {
      console.error("HOD Approval Error:", error);
      dispatch(toastError({ detail: "Error sending approval request." }));
    }
  };

  const handleDocumentsSubmit = async (selectedVendors) => {
    try {
      const form = new FormData();
      form.append("rfq_number", rfq.rfq_number);
      form.append("action", "documents_submitted_by_exports");
      form.append("remarks", acceptRemarks || "");
      form.append("vendor_name", selectedVendors[0]?.vendor_name || "");
      form.append("vendor_email", selectedVendors[0]?.vendor_email || "");
      form.append("vendor_id", selectedVendors[0]?.vendor_id || "");
      form.append("airline_name", selectedVendors[0]?.airline_name || "");

      if (attachment) {
        //form.append("attachment", attachment);
        attachment.forEach((file) => {
          form.append("attachment", file);
        });
      }

      const token = localStorage.getItem("USERTOKEN");

      await postData("quotesummary/update-rfq-status", form, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      dispatch(toastSuccess({ detail: "Documents Submitted successfully!" }));

      setShowDocumentsUploadDialog(false);
      setAttachment([]);
      setAcceptRemarks("");
      fetchSummary();
    } catch (error) {
      console.error("Documents Submit Error:", error);
      dispatch(toastError({ detail: "Error submitting documents." }));
    }
  };

  const handleShareToMarketingTeam = async () => {
    if (isMarketingShareSubmitting) return;

    setIsMarketingShareSubmitting(true);

    try {
      const form = new FormData();
      form.append("rfq_number", rfq.rfq_number);
      form.append("rfq_title", rfq.title || "");
      form.append("action", "shared_to_marketing_team");
      form.append("remarks", marketingRemarks || "");
      form.append("marketing_team_details", marketingHead || []);
      form.append("hod_team_details", hodHead || []);
      //form.append("marketing_name", marketingHead?.name || "");
      //form.append("marketing_email", marketingHead?.email || "");

      if (attachment) {
        //form.append("attachment", attachment);
        attachment.forEach((file) => {
          form.append("attachment", file);
        });
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
      setAttachment([]);
      setMarketingRemarks("");
      fetchSummary();
    } catch (error) {
      console.error("Marketing Team Share Error:", error);
      dispatch(toastError({ detail: "Error sharing to marketing team." }));
    } finally {
      setIsMarketingShareSubmitting(false);
    }
  };

  const handleShareToAccountsTeam = async () => {
    try {
      const form = new FormData();
      form.append("rfq_number", rfq.rfq_number);
      form.append("action", "shared_to_accounts_team");
      form.append("remarks", accountsRemarks || "");
      form.append("accounts_team_details", accountsTeam || []);
      form.append("selected_invoice", JSON.stringify(selectedInvoice) || {});
      form.append("vendor_id", selectedInvoice.vendor_id || "");

      const token = localStorage.getItem("USERTOKEN");

      await postData("/quotesummary/update-rfq-status", form, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      dispatch(
        toastSuccess({ detail: "Shared with Accounts Team successfully!" }),
      );

      setShowShareToAccountsTeamDialog(false);
      setAttachment([]);
      setSelectedInvoice(null);
      setAccountsRemarks("");
      fetchSummary();
    } catch (error) {
      console.error("Accounts Team Share Error:", error);
      dispatch(toastError({ detail: "Error sharing to accounts team." }));
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
    <>
      {/* <h3 className="mb-2">
        Quote Summary - {rfq?.rfq_number}{" "}
        <span className="text-gray-500 text-sm">({rfq?.title})</span>
      </h3> */}

      {/* <div className="flex justify-content-between align-items-center mb-3"> */}
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

      {/* <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <input
            type="text"
            placeholder="Search"
            className="p-inputtext p-component"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
        </span> */}
      {/* </div> */}

      {/* <Panel
        header={`${rfq?.title || ""} (${rfq?.rfq_number})`}
        toggleable
        collapsed={false}
      > */}
      {/* <p className="mb-3 text-sm text-gray-600">{rfq?.description}</p> */}

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

        {/* {hodQuote && ( */}
        <div>
          {/* {role === "hod" && (
              <Button
                label="✅ Accept Quote"
                className="p-button-success p-button-sm"
                //onClick={() => handleAction("accept_l1", rfq.rfq_number)}
                onClick={() => setShowAcceptDialog(true)}
                disabled={selectedVendors.length === 0}
              />
            )} */}

          <div style={{ display: "flex", gap: "10px" }}>
            {role === "user" && (
              <>
                {/* <Button
                  label={auctionData ? "✏️ Re-Auction" : "🏆 Conduct Auction"}
                  className="p-button-success p-button-sm"
                  onClick={() => setShowAuctionDialog(true)}
                  disabled={!auctionData && selectedVendors.length === 0}
                /> */}

                <Button
                  label="✏️ Edit-Re-Auction"
                  className="p-button-success p-button-sm"
                  onClick={() =>
                    navigate(
                      `/rfq/view/${rfq?.rfq_number}?source=auction&edit=true`,
                    )
                  }
                  disabled={!auctionData && selectedVendors.length === 0}
                />
              </>
            )}
          </div>
        </div>

        {role !== "hod" && (
          <Button
            label="Request HOD Approval"
            icon="pi pi-send"
            onClick={() => {
              if (!selectedVendors?.length || !selectedVendors[0]?.vendor_id) {
                return dispatch(
                  toastError({
                    detail:
                      "Please select the vendor for HOD approval request.",
                  }),
                );
              }

              setShowHodApprovalDialog(true);
            }}
          />
        )}
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
      {/* </Panel> */}

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
            onClick={handleSubmitClick}
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
            multiple
            className="p-inputtext w-full"
            onChange={(e) => {
              const newFiles = Array.from(e.target.files);
              setAttachment((prev) => [...prev, ...newFiles]);
            }}
          />
          {attachment?.length > 0 && (
            <div className="mt-2">
              {attachment?.map((file, index) => (
                <div key={index} className="flex justify-content-between mb-1">
                  <span>{file.name}</span>
                  <Button
                    icon="pi pi-times"
                    className="p-button-text p-button-sm"
                    onClick={() =>
                      setAttachment((prev) =>
                        prev.filter((_, i) => i !== index),
                      )
                    }
                  />
                </div>
              ))}
            </div>
          )}
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
        header="Submit Invoice and Documents"
        visible={showDocumentsUploadDialog}
        onHide={() => setShowDocumentsUploadDialog(false)}
        style={{ width: "35vw" }}
      >
        <div className="mb-3">
          {selectedVendors?.map((v) => (
            <div key={v.vendor_id} className="mb-2">
              <i className="pi pi-user mr-2" />
              <strong>{v.vendor_name}</strong> — {v.airline_name || "N/A"}
            </div>
          ))}
        </div>

        <div className="mb-3">
          <label>
            <strong>Attach File</strong>
          </label>
          <input
            type="file"
            multiple
            className="p-inputtext w-full"
            onChange={(e) => {
              const newFiles = Array.from(e.target.files);
              setAttachment((prev) => [...prev, ...newFiles]);
            }}
          />
          {attachment?.length > 0 && (
            <div className="mt-2">
              {attachment?.map((file, index) => (
                <div key={index} className="flex justify-content-between mb-1">
                  <span>{file.name}</span>
                  <Button
                    icon="pi pi-times"
                    className="p-button-text p-button-sm"
                    onClick={() =>
                      setAttachment((prev) =>
                        prev.filter((_, i) => i !== index),
                      )
                    }
                  />
                </div>
              ))}
            </div>
          )}
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
            label="Submit Documents"
            className="p-button-sm p-button-success"
            onClick={() => handleDocumentsSubmit(selectedVendors)}
          />
          <Button
            label="Cancel"
            className="p-button-secondary p-button-sm"
            onClick={() => setShowDocumentsUploadDialog(false)}
          />
        </div>
      </Dialog>

      <Dialog
        header="Share To Marketing Team"
        visible={showShareToMarketTeamDialog}
        onHide={() => setShowShareToMarketTeamDialog(false)}
        style={{ width: "35vw" }}
      >
        <div style={{ position: "relative" }}>
          {isMarketingShareSubmitting && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(255,255,255,0.78)",
                backdropFilter: "blur(3px)",
                zIndex: 10,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "8px",
              }}
            >
              <ProgressSpinner style={{ width: "40px", height: "40px" }} />
              <div className="mt-2 text-sm">Sharing...</div>
            </div>
          )}

          <div
            style={{
              pointerEvents: isMarketingShareSubmitting ? "none" : "auto",
            }}
            className="mb-3"
          >
            <label>
              <strong>Select Marketing Team</strong>
            </label>
            {/* <Dropdown
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
          /> */}
            <MultiSelect
              value={marketingHead}
              options={marketingUsers?.map((user) => ({
                label: `${user.name} (${user.email})`,
                value: user.email,
              }))}
              onChange={(e) => setMarketingHead(e.value)}
              placeholder="Select Marketing Team"
              className="w-full"
              filter
              display="chip"
              maxSelectedLabels={100}
            />
            {renderSelectedEmailSummary(marketingHead)}
            <div className="flex gap-2 mt-2">
              <InputText
                value={customMarketingEmail}
                onChange={(e) => setCustomMarketingEmail(e.target.value)}
                placeholder="Add custom email"
                className="w-full"
              />
              <Button
                label="Add"
                className="p-button-sm"
                onClick={() => addCustomEmail("marketing")}
              />
            </div>

            <label className="mt-3">
              <strong>Select HOD</strong>
            </label>
            <MultiSelect
              value={hodHead}
              options={hodUsers?.map((user) => ({
                label: `${user.name} (${user.email})`,
                value: user.email,
              }))}
              onChange={(e) => setHODHead(e.value)}
              placeholder="Select HOD"
              className="w-full"
              filter
              display="chip"
              maxSelectedLabels={100}
            />
            {renderSelectedEmailSummary(hodHead)}
            <div className="flex gap-2 mt-2">
              <InputText
                value={customHodEmail}
                onChange={(e) => setCustomHodEmail(e.target.value)}
                placeholder="Add custom email"
                className="w-full"
              />
              <Button
                label="Add"
                className="p-button-sm"
                onClick={() => addCustomEmail("hod")}
              />
            </div>
          </div>

          <div className="mb-3">
            <label>
              <strong>Attach File</strong>
            </label>
            <input
              type="file"
              multiple
              className="p-inputtext w-full"
              onChange={(e) => {
                const newFiles = Array.from(e.target.files);
                setAttachment((prev) => [...prev, ...newFiles]);
              }}
            />
            {attachment?.length > 0 && (
              <div className="mt-2">
                {attachment?.map((file, index) => (
                  <div
                    key={index}
                    className="flex justify-content-between mb-1"
                  >
                    <span>{file.name}</span>
                    <Button
                      icon="pi pi-times"
                      className="p-button-text p-button-sm"
                      onClick={() =>
                        setAttachment((prev) =>
                          prev.filter((_, i) => i !== index),
                        )
                      }
                    />
                  </div>
                ))}
              </div>
            )}
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
              label={isMarketingShareSubmitting ? "Sharing..." : "Share Now"}
              className="p-button-sm p-button-success"
              onClick={handleShareToMarketingTeam}
              disabled={isMarketingShareSubmitting}
              loading={isMarketingShareSubmitting}
            />
            <Button
              label="Cancel"
              className="p-button-secondary p-button-sm"
              onClick={() => setShowShareToMarketTeamDialog(false)}
              disabled={isMarketingShareSubmitting}
            />
          </div>
        </div>
      </Dialog>

      <Dialog
        header="Share To Accounts Team"
        visible={showShareToAccountsTeamDialog}
        onHide={() => setShowShareToAccountsTeamDialog(false)}
        style={{ width: "35vw" }}
      >
        <div className="mb-3">
          <label>
            <strong>Select Accounts Team</strong>
          </label>
          <MultiSelect
            value={accountsTeam}
            options={accountsUsers.map((user) => ({
              label: `${user.name} (${user.email})`,
              value: user.email, // ✅ store only email
            }))}
            onChange={(e) => setAccountsTeam(e.value)}
            placeholder="Select Accounts Team"
            className="w-full"
            filter
            display="chip"
          />
        </div>

        <div className="mb-3">
          {selectedInvoice ? (
            <>
              {/* Invoice Info */}
              <div className="mb-3 p-2 border-round surface-100">
                <div className="grid">
                  <div className="col-6">
                    <strong>Freight:</strong>{" "}
                    {selectedInvoice.freight_amount || "-"}
                  </div>

                  <div className="col-6">
                    <strong>DAP:</strong> {selectedInvoice.dap_amount || "-"}
                  </div>

                  <div className="col-6">
                    <strong>Custom Duty:</strong>{" "}
                    {selectedInvoice.custom_duty_amount || "-"}
                  </div>

                  <div className="col-6">
                    <strong>Others:</strong>{" "}
                    {selectedInvoice.others_amount || "-"}
                  </div>
                </div>
              </div>

              {/* Attachments */}
              {selectedInvoice?.attached_file?.length > 0 && (
                <div className="mb-3">
                  <strong>Files:</strong>
                  {selectedInvoice.attached_file.map((file, i) => (
                    <div key={i}>
                      <a
                        href={`${BASE_URL}/uploads/invoices/${encodeURIComponent(file)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline text-sm"
                      >
                        {file}
                      </a>
                    </div>
                  ))}
                </div>
              )}

              {/* Your existing fields remain SAME */}
            </>
          ) : (
            <p>No invoice selected</p>
          )}
        </div>

        <div className="mb-3">
          <label>Remarks</label>
          <InputTextarea
            rows={3}
            value={accountsRemarks}
            onChange={(e) => setAccountsRemarks(e.target.value)}
            placeholder="Enter remarks..."
            className="w-full"
          />
        </div>

        <div className="flex justify-content-end gap-2">
          <Button
            label="Share Now"
            className="p-button-sm p-button-success"
            onClick={handleShareToAccountsTeam}
          />
          <Button
            label="Cancel"
            className="p-button-secondary p-button-sm"
            onClick={() => setShowShareToAccountsTeamDialog(false)}
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
          {selectedVendors?.map((v) => (
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
                vendors: selectedVendors?.map((v) => v.vendor_id),
                acceptedAirline: selectedVendors?.map((v) => v.airline_name),
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
          re_auction={showAuctionDialog}
          onAuctionCreated={() => {
            setShowAuctionDialog(false);
            fetchAuctionData();
          }}
        />
      </Dialog>

      <Dialog
        header="Reject Marketing Review"
        visible={showRejectDialog}
        style={{ width: "400px" }}
        onHide={() => setShowRejectDialog(false)}
      >
        <div className="p-fluid">
          <label className="font-bold mb-2">Reason for Rejection</label>

          <textarea
            className="p-inputtext p-inputtextarea w-full"
            rows={4}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Enter reason for rejection..."
          />

          <div className="flex justify-content-end gap-2 mt-3">
            <button
              className="p-button p-button-text"
              onClick={() => setShowRejectDialog(false)}
            >
              Cancel
            </button>

            <button
              className="p-button p-button-danger"
              onClick={handleRejectSubmit}
            >
              Submit Rejection
            </button>
          </div>
        </div>
      </Dialog>

      <Dialog
        header="Approve Marketing Review"
        visible={showApproveDialog}
        style={{ width: "400px" }}
        onHide={() => setShowApproveDialog(false)}
      >
        <div className="p-fluid">
          <p style={{ marginBottom: "15px" }}>
            Are you sure you want to approve this RFQ from the Marketing Team?
          </p>

          <div className="flex justify-content-end gap-2 mt-3">
            <button
              className="p-button p-button-text"
              onClick={() => setShowApproveDialog(false)}
            >
              Cancel
            </button>

            <button
              className="p-button p-button-success"
              onClick={() => {
                handleApproveSubmit();
                setShowApproveDialog(false);
              }}
            >
              Confirm Approval
            </button>
          </div>
        </div>
      </Dialog>

      <Dialog
        header="Reject Invoice"
        visible={showRejectDialog}
        style={{ width: "400px" }}
        onHide={() => setShowRejectDialog(false)}
      >
        <div className="p-fluid">
          <label className="font-bold mb-2">Reason for Invoice Rejection</label>

          <textarea
            className="p-inputtext p-inputtextarea w-full"
            rows={4}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Enter reason for invoice rejection..."
          />

          <div className="flex justify-content-end gap-2 mt-3">
            <button
              className="p-button p-button-text"
              onClick={() => setShowRejectDialog(false)}
            >
              Cancel
            </button>

            <button
              className="p-button p-button-danger"
              onClick={handleInvoiceRejectSubmit}
            >
              Submit Rejection
            </button>
          </div>
        </div>
      </Dialog>

      <Dialog
        header="Approve Invoice"
        visible={showApproveDialog}
        style={{ width: "400px" }}
        onHide={() => setShowApproveDialog(false)}
      >
        <div className="p-fluid">
          <p style={{ marginBottom: "15px" }}>
            Are you sure you want to approve this invoice?
          </p>

          <div className="flex justify-content-end gap-2 mt-3">
            <button
              className="p-button p-button-text"
              onClick={() => setShowApproveDialog(false)}
            >
              Cancel
            </button>

            <button
              className="p-button p-button-success"
              onClick={() => {
                handleInvoiceApproveSubmit();
                setShowApproveDialog(false);
              }}
            >
              Confirm Approval
            </button>
          </div>
        </div>
      </Dialog>
      {/* <ConfirmDialog /> */}
    </>
  );
};

export default ViewQuote;
