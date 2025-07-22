import React, { useState, useEffect, useRef, useContext } from "react";
import { useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useWatch } from "react-hook-form";
import { Steps } from "primereact/steps";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { Checkbox } from "primereact/checkbox";
import { InputText } from "primereact/inputtext";
import { MultiSelect } from "primereact/multiselect";
import { Button } from "primereact/button";
import { InputNumber } from "primereact/inputnumber";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { FileUpload } from "primereact/fileupload";
import { Card } from "primereact/card";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { RadioButton } from "primereact/radiobutton";
import { Tooltip } from "primereact/tooltip";
import { InputTextarea } from "primereact/inputtextarea";
import * as XLSX from "xlsx";
import DataStepperForm from "./DataStepperForm";
import PackageDimensionsForm from "./PackageDimensionsForm";
import TransportAuctionForm from "./TransportAuctionForm";
import QuotingChargesBlock from "./QuotingChargesBlock";
import { toastError, toastSuccess } from "../../store/toastSlice";
import { useParams, useNavigate } from "react-router-dom";
import { getData } from "../../utils/requests";
import { LayoutContext } from "../../store/layoutContext";

const eximModes = [
  { label: "Export", value: "export" },
  { label: "Import", value: "import" },
];

const vendorTypeOptions = [
  { label: "All", value: "all" },
  { label: "Local", value: "local" },
  { label: "International", value: "international" },
  { label: "Air", value: "air" },
  { label: "Ocean", value: "ocean" },
  { label: "Industry", value: "industry" },
  { label: "Product", value: "product" },
];

const movementTypes = [
  { label: "Door to Door", value: "door_to_door" },
  { label: "Airport(Origin) To Airport(Destination)", value: "port_to_port" },
];

const packageTypes = [
  { label: "Box", value: "box" },
  { label: "Crate", value: "crate" },
  { label: "Pallet", value: "pallet" },
];

const materials = [
  { label: "Promotional Material", value: "promotional_material" },
  { label: "Sample Shipment", value: "sample_shipment" },
  { label: "Textile", value: "textile" },
  { label: "Pharma", value: "pharma" },
  { label: "Chemicals", value: "chemicals" },
  { label: "Others", value: "others" },
];

const modeOptions = [
  {
    label: "Ocean FCL - Shipping Container",
    value: "fcl",
  },
  {
    label: "Ocean LCL - Shipping Container",
    value: "lcl",
  },
];

const auctionTypes = [
  { label: "Forward", value: "forward" },
  { label: "Reverse", value: "reverse" },
  { label: "Transport", value: "transport" },
];

const transportTypes = [
  { label: "Import", value: "import" },
  { label: "Export", value: "export" },
];

const transportModes = [
  { label: "Local", value: "local" },
  { label: "Air", value: "air" },
  { label: "Sea", value: "sea" },
];

const countries = [
  { label: "India", value: "India" },
  { label: "USA", value: "USA" },
  { label: "UK", value: "UK" },
];

const emailOptions = [
  "user1@example.com",
  "user2@example.com",
  "vendor@example.com",
  "admin@example.com",
];

const industries = [
  { label: "Adhesives and Sealants", value: "adhesives_and_sealants" },
  { label: "Agriculture and Farming", value: "agriculture_and_farming" },
  { label: "Aerospace and Defense", value: "aerospace_and_defense" },
  { label: "Automotive", value: "automotive" },
  {
    label: "Banking and Financial Services",
    value: "banking_and_financial_services",
  },
  { label: "Biotechnology", value: "biotechnology" },
  { label: "Chemicals and Gases", value: "chemicals_and_gases" },
  { label: "Construction", value: "construction" },
  { label: "Consumer Goods", value: "consumer_goods" },
  { label: "Defense and Security", value: "defense_and_security" },
  { label: "E-Commerce", value: "e_commerce" },
  { label: "Education and Training", value: "education_and_training" },
  { label: "Electrical and Electronics", value: "electrical_and_electronics" },
  { label: "Energy and Utilities", value: "energy_and_utilities" },
  { label: "Engineering Services", value: "engineering_services" },
  { label: "Entertainment and Media", value: "entertainment_and_media" },
  { label: "Environmental Services", value: "environmental_services" },
  { label: "Fashion and Apparel", value: "fashion_and_apparel" },
  { label: "Financial Technology (FinTech)", value: "fintech" },
  { label: "Food and Beverage", value: "food_and_beverage" },
  { label: "Furniture and Fixtures", value: "furniture_and_fixtures" },
  {
    label: "Government and Public Sector",
    value: "government_and_public_sector",
  },
  {
    label: "Healthcare and Pharmaceuticals",
    value: "healthcare_and_pharmaceuticals",
  },
  { label: "Hospitality and Tourism", value: "hospitality_and_tourism" },
  { label: "Industrial Equipment", value: "industrial_equipment" },
  { label: "Information Technology (IT)", value: "information_technology" },
  { label: "Insurance", value: "insurance" },
  { label: "Legal Services", value: "legal_services" },
  {
    label: "Logistics and Transportation",
    value: "logistics_and_transportation",
  },
  { label: "Machinery and Tools", value: "machinery_and_tools" },
  { label: "Manufacturing", value: "manufacturing" },
  { label: "Marine and Shipping", value: "marine_and_shipping" },
  { label: "Medical Devices", value: "medical_devices" },
  { label: "Metals and Mining", value: "metals_and_mining" },
  { label: "Nonprofit Organizations", value: "nonprofit_organizations" },
  { label: "Oil and Gas", value: "oil_and_gas" },
  { label: "Packaging", value: "packaging" },
  { label: "Paper and Pulp", value: "paper_and_pulp" },
  { label: "Pharmaceuticals", value: "pharmaceuticals" },
  { label: "Plastics and Rubber", value: "plastics_and_rubber" },
  { label: "Printing and Publishing", value: "printing_and_publishing" },
  { label: "Real Estate and Property", value: "real_estate" },
  { label: "Retail and Wholesale", value: "retail_and_wholesale" },
  { label: "Robotics and Automation", value: "robotics_and_automation" },
  { label: "Software and SaaS", value: "software_and_saas" },
  { label: "Sports and Recreation", value: "sports_and_recreation" },
  { label: "Telecommunications", value: "telecommunications" },
  { label: "Textiles and Apparel", value: "textiles_and_apparel" },
  { label: "Utilities", value: "utilities" },
  { label: "Waste Management", value: "waste_management" },
  { label: "Wood and Furniture", value: "wood_and_furniture" },
  { label: "Automotive", value: "Automotive" },
  { label: "Electronics", value: "Electronics" },
  { label: "Construction", value: "Construction" },
  { label: "Logistics", value: "Logistics" },
];

const types = [
  { label: "Forward", value: "Forward" },
  { label: "Reverse", value: "Reverse" },
];

const seacargoTypes = [
  { label: "General", value: "general" },
  { label: "Hazardous", value: "hazardous" },
];

const subIndustries = [
  { label: "Air Cargo", value: "Air Cargo" },
  { label: "Ocean Freight", value: "Ocean Freight" },
  { label: "Road Transport", value: "Road Transport" },
];

const defaultSubIndustries = {
  automotive: [
    { label: "Car Parts", value: "Car Parts" },
    { label: "Electric Vehicles", value: "Electric Vehicles" },
    { label: "Tires", value: "Tires" },
    { label: "Lubricants", value: "Lubricants" },
  ],
  agriculture_and_farming: [
    { label: "Seeds", value: "Seeds" },
    { label: "Fertilizers", value: "Fertilizers" },
    { label: "Irrigation Equipment", value: "Irrigation Equipment" },
    { label: "Agro Tools", value: "Agro Tools" },
  ],
  chemicals_and_gases: [
    { label: "Industrial Chemicals", value: "Industrial Chemicals" },
    { label: "Specialty Chemicals", value: "Specialty Chemicals" },
    { label: "Medical Gases", value: "Medical Gases" },
    { label: "Explosives", value: "Explosives" },
  ],
  construction_and_building: [
    { label: "Cement", value: "Cement" },
    { label: "Steel", value: "Steel" },
    { label: "Aggregates", value: "Aggregates" },
    { label: "Pipes & Fittings", value: "Pipes & Fittings" },
  ],
  electrical_and_electronics: [
    { label: "Wires and Cables", value: "Wires and Cables" },
    { label: "Printed Circuit Boards", value: "Printed Circuit Boards" },
    { label: "Motors", value: "Motors" },
    { label: "LED Lights", value: "LED Lights" },
  ],
  food_and_beverages: [
    { label: "Packaged Foods", value: "Packaged Foods" },
    { label: "Beverages", value: "Beverages" },
    { label: "Frozen Foods", value: "Frozen Foods" },
    { label: "Dairy Products", value: "Dairy Products" },
  ],
  healthcare_and_pharma: [
    { label: "Pharmaceuticals", value: "Pharmaceuticals" },
    { label: "Surgical Equipment", value: "Surgical Equipment" },
    { label: "Medical Devices", value: "Medical Devices" },
    { label: "Nutraceuticals", value: "Nutraceuticals" },
  ],
  it_and_software: [
    { label: "Software Services", value: "Software Services" },
    { label: "Hardware Components", value: "Hardware Components" },
    { label: "Data Centers", value: "Data Centers" },
    { label: "Networking Devices", value: "Networking Devices" },
  ],
  Logistics: [
    { label: "Air Cargo", value: "Air Cargo" },
    { label: "Ocean Freight", value: "Ocean Freight" },
    { label: "Road Transport", value: "Road Transport" },
  ],
  mining_and_metals: [
    { label: "Iron Ore", value: "Iron Ore" },
    { label: "Bauxite", value: "Bauxite" },
    { label: "Aluminum Products", value: "Aluminum Products" },
    { label: "Copper", value: "Copper" },
  ],
  oil_and_gas: [
    { label: "Crude Oil", value: "Crude Oil" },
    { label: "LPG", value: "LPG" },
    { label: "Lubricants", value: "Lubricants" },
    { label: "Natural Gas", value: "Natural Gas" },
  ],
  packaging_materials: [
    { label: "Plastic Packaging", value: "Plastic Packaging" },
    { label: "Corrugated Boxes", value: "Corrugated Boxes" },
    { label: "Glass Bottles", value: "Glass Bottles" },
    { label: "Laminated Films", value: "Laminated Films" },
  ],
  textiles_and_garments: [
    { label: "Raw Fabrics", value: "Raw Fabrics" },
    { label: "Finished Garments", value: "Finished Garments" },
    { label: "Dyes and Chemicals", value: "Dyes and Chemicals" },
    { label: "Footwear", value: "Footwear" },
  ],
  renewable_energy: [
    { label: "Solar Panels", value: "Solar Panels" },
    { label: "Wind Turbines", value: "Wind Turbines" },
    { label: "Battery Storage", value: "Battery Storage" },
    { label: "Inverters", value: "Inverters" },
  ],
};

const regions = [
  { label: "USEC", value: "usec" },
  { label: "USWC", value: "uswc" },
  { label: "EUROPE", value: "europe" },
  { label: "MIDDLE EAST", value: "middle east" },
  { label: "ASIA", value: "asia" },
];

const factoryOptions = [
  { label: "Paithan", value: "Paithan" },
  { label: "Dahej", value: "Dahej" },
  { label: "CWH", value: "CWH" },
  { label: "Pithampur", value: "Pithampur" },
  { label: "Others", value: "Others" },
];

const commodityOptions = [
  { label: "20' Standard", value: "20" },
  { label: "20' Reefer", value: "20 reefer" },
  { label: "40' Standard", value: "40" },
  { label: "40' Reefer", value: "40 reefer" },
  { label: "40' High Cube (HQ)", value: "40 hq" },
  { label: "Cold Storage", value: "cold_storage" },
  { label: "Normal", value: "normal" },
];

const cargoTypes = [
  { label: "DRY (General Cargo)", value: "dry" },
  { label: "REEFER (Refrigerated)", value: "reefer" },
  { label: "HAZ (Hazardous)", value: "haz" },
  { label: "OOG (Out of Gauge)", value: "oog" },
  { label: "LCL (Less than Container Load)", value: "lcl" },
  { label: "FCL (Full Container Load)", value: "fcl" },
  { label: "BREAK BULK", value: "break_bulk" },
  { label: "LIQUID", value: "liquid" },
  { label: "DANGEROUS GOODS", value: "dg" },
  { label: "PROJECT CARGO", value: "project" },
  { label: "VEHICLES", value: "vehicles" },
  { label: "LIVE ANIMALS", value: "live_animals" },
  { label: "PERISHABLE", value: "perishable" },
  { label: "Cold Storage", value: "cold_storage" },
  { label: "Normal", value: "normal" },
];

const equipmentSizes = [
  { label: "20' DC (Dry Container)", value: "20DC" },
  { label: "40' DC (Dry Container)", value: "40DC" },
  { label: "40' HC (High Cube)", value: "40HC" },
  { label: "45' HC (High Cube)", value: "45HC" },
  { label: "40' RF (Reefer Container)", value: "40RF" },
  { label: "20' RF (Reefer Container)", value: "20RF" },
  { label: "20' OT (Open Top)", value: "20OT" },
  { label: "40' OT (Open Top)", value: "40OT" },
  { label: "20' FR (Flat Rack)", value: "20FR" },
  { label: "40' FR (Flat Rack)", value: "40FR" },
  { label: "20' TK (Tank Container)", value: "20TK" },
  { label: "20' PL (Platform)", value: "20PL" },
];

const incotermOptions = [
  { label: "EXW (Ex Works)", value: "EXW" },
  { label: "FCA (Free Carrier)", value: "FCA" },
  { label: "FAS (Free Alongside Ship)", value: "FAS" },
  { label: "FOB (Free On Board)", value: "FOB" },
  { label: "CFR (Cost and Freight)", value: "CFR" },
  { label: "CIF (Cost, Insurance & Freight)", value: "CIF" },
  { label: "CPT (Carriage Paid To)", value: "CPT" },
  { label: "CIP (Carriage & Insurance Paid To)", value: "CIP" },
  { label: "DAP (Delivered At Place)", value: "DAP" },
  { label: "DPU (Delivered at Place Unloaded)", value: "DPU" },
  { label: "DDP (Delivered Duty Paid)", value: "DDP" },
];

const unitOptions = [
  { label: "Select Unit", value: "" },
  { label: "1K", value: "1K" },
  { label: "Bags", value: "Bags" },
  { label: "Bottles", value: "Bottles" },
  { label: "Box", value: "Box" },
  { label: "CBM", value: "CBM" },
  { label: "CFT", value: "CFT" },
  { label: "Dozens", value: "Dozens" },
  { label: "EUR 1 Pallet", value: "EUR_1_Pallet" },
  { label: "EUR 2 Pallet", value: "EUR_2_Pallet" },
  { label: "Feet", value: "Feet" },
  { label: "Gallon", value: "Gallon" },
  { label: "Grams", value: "Grams" },
  { label: "Gross", value: "Gross" },
  { label: "HUN", value: "HUN" },
  { label: "Inch", value: "Inch" },
  { label: "ISO Tank", value: "ISO_Tank" },
  { label: "Kg", value: "Kg" },
  { label: "KM", value: "KM" },
];

const currencyOptions = [
  { label: "USD", value: "USD" },
  { label: "INR", value: "INR" },
  { label: "EUR", value: "EUR" },
];

const CreateRfq = () => {
  const usert = useSelector((state) => state.auth.user);
  console.log("Current User:", usert);
  const { rfqNumber } = useParams();
  const [isEditMode, setIsEditMode] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const [useMyDetails, setUseMyDetails] = useState(true);
  const [customFactory, setCustomFactory] = useState("");
  const [selectedVendorType, setSelectedVendorType] = useState("all");
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const source = queryParams.get("source");
  console.log("source value", source);

  const vendorsdonwloaded = useSelector((state) => state.vendors.data);
  console.log("vendorsdonwloaded data", vendorsdonwloaded);

  const { setBreadcrumbs } = useContext(LayoutContext);

  const filteredIndustries =
    source === "forward"
      ? industries.filter((item) => item.value !== "logistics")
      : industries;

  const vendorCardHeader = (
    <div className="flex justify-content-between align-items-center w-full">
      <h5 className="m-0">Select Vendors</h5>
      <Dropdown
        value={selectedVendorType}
        options={vendorTypeOptions}
        onChange={(e) => setSelectedVendorType(e.value)}
        placeholder="Type"
        className="w-12rem"
      />
    </div>
  );

  const [parsedData, setParsedData] = useState([]);

  const localSectionRef = useRef(null);
  const airSectionRef = useRef(null);
  const seaSectionRef = useRef(null);
  const submitSource = useRef("submit");
  const [formType, setFormType] = useState("draft");
  const [auctionType, setAuctionType] = useState("");
  const [rfqStatus, setRFQStatus] = useState("");

  const [currentIndex, setCurrentIndex] = useState(0);
  const totalSections = 5;

  const [isOpen, setIsOpen] = useState(true);

  const role = usert.role;
  const isReadOnly = role === "vendor";

  const [selectedCharges, setSelectedCharges] = useState([]);
  const [selectedAdditionalBidCharges, setSelectedAdditionalBidCharges] =
    useState([]);

  const handleChargeToggle = (label) => {
    setSelectedCharges((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label]
    );
  };

  const handleAdditionalBidChargeToggle = (label) => {
    setSelectedAdditionalBidCharges((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label]
    );
  };

  const toggleBlock = () => {
    setIsOpen((prev) => !prev);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) setCurrentIndex((prev) => prev - 1);
  };

  const handleNext = () => {
    if (currentIndex < totalSections - 1) setCurrentIndex((prev) => prev + 1);
  };

  const [buyer, setBuyer] = useState({
    name: "",
    email: "",
    mobile: "",
    location: "",
  });

  useEffect(() => {
    if (useMyDetails && usert && !buyer.name) {
      setBuyer({
        name: usert.name,
        email: usert.email,
        mobile: usert.mobile || "",
        location: usert.location || "",
      });
    }
  }, [useMyDetails, usert]);

  const updateField = (field, value) => {
    setBuyer((prev) => ({ ...prev, [field]: value }));
  };

  const [form, setForm] = useState({
    type: null,
    transport_type: null,
    transport_mode: null,
    title: "",
    description: "",
    open_date: null,
    close_date: null,
    same_bid_allowed: false,
    hide_current_bid: false,
    items: [{ item_name: "", quantity: "", unit: "", notes: "" }],
  });

  const handleFieldChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...form.items];
    updatedItems[index][field] = value;
    setForm({ ...form, items: updatedItems });
  };

  const { control, setValue, register, handleSubmit, watch, getValues } =
    useForm({
      defaultValues: {
        rfq_items: [{ item_name: "", quantity: 0, unit: "", target_price: 0 }],
      },
      package_summary: {
        packages: [],
        value_of_shipment: 0,
        shipment_currency: null,
        totalGrossWeight: 0,
        totalVolumetricWeight: 0,
        totalCBM: 0,
        volumetricFactor: 5000,
      },
      road_transport_summary: {
        road_transport_details: [],
      },
    });

  useEffect(() => {
    if (source === "forward" || source === "reverse") {
      setValue("type", source);
    }
  }, [source, setValue]);

  useEffect(() => {
    const fetchRFQData = async () => {
      if (rfqNumber) {
        setIsEditMode(true);
        const rfqs = await getData("rfqs");
        const matched =
          rfqs.find(
            (r) =>
              r.rfq_number === rfqNumber &&
              r.auction_number &&
              r.auction_number.trim() !== ""
          ) || rfqs.find((r) => r.rfq_number === rfqNumber);
        if (matched) {
          Object.entries(matched).forEach(([key, value]) => {
            if (
              (key === "open_date_time" || key === "close_date_time") &&
              value
            ) {
              const parsedDate = new Date(value);
              if (!isNaN(parsedDate)) {
                setValue(key, parsedDate);
              }
            } else {
              setValue(key, value);
            }
          });
        }
        if (matched?.vendors?.length) {
          setSelectedVendorIds(matched.vendors.map((v) => v.id));
        }
        if (matched?.form_type) {
          setFormType(matched.form_type);
        }
        if (matched?.type) {
          setAuctionType(matched.type);
        }
        if (matched?.status) {
          setRFQStatus(matched.status);
        }
        if (matched?.shipment_details) {
          setParsedData(matched.shipment_details);
        }
        if (matched?.attachment_filenames) {
          setFiles(
            matched.attachment_filenames.map((fileName) => ({
              name: fileName,
            }))
          );
        }

        if (matched.buyer) {
          setBuyer({
            name: matched.buyer.name || "",
            email: matched.buyer.email || "",
            mobile: matched.buyer.mobile || "",
            location: matched.buyer.location || "",
          });
        }
      }
    };

    fetchRFQData();
  }, [rfqNumber, setValue]);

  const handlePackagesChange = (packageDataWithMetrics) => {
    setValue("package_summary", packageDataWithMetrics);
  };

  const handleRoadTransportChange = (roadTransportDataWithMetrics) => {
    console.log(
      "roadTransportDataWithMetrics values::",
      roadTransportDataWithMetrics
    );
    setValue("road_transport_summary", roadTransportDataWithMetrics);
  };

  const openDate = useWatch({ control, name: "open_date_time" });

  const selectedIndustry = useWatch({ control, name: "industry" });

  const subIndustriesOptions = defaultSubIndustries[selectedIndustry] || [];

  useEffect(() => {
    if (openDate) {
      const open = new Date(openDate);
      const close = new Date(open.getTime() + 30 * 60 * 1000);
      setValue("close_date_time", close, { shouldValidate: true });
    }
  }, [openDate, setValue]);

  useEffect(() => {
    if (source === "forward" || source === "reverse") {
      setValue("type", source);
    }
  }, [source, setValue]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "rfq_items",
  });

  const watchType = watch("type");
  const watchEximMode = watch("exim_mode");
  const watchTransportMode = watch("transport_mode");

  const watchTransportTypeMode = watch("transport_type");

  const watchIndustryMode = watch("industry");
  const watchSubIndustryMode = watch("subindustry");

  const watchSameBid = watch("same_bid_price_allowed");
  const watchHideBid = watch("hide_current_bid_price");
  const watchMode = watch("mode");

  const onSubmit =
    (formType = "submitted") =>
    async (data) => {
      console.log("Form Data:", data);
      console.log("formType:", formType);
      submitSource.current = formType;
      if (submitSource.current === "next") {
        console.log("Validated current step → going to next step");
        goNext();
      }

      if (
        submitSource.current === "submitted" ||
        submitSource.current === "draft"
      ) {
        console.log("Selected Charges:", selectedCharges);
        const generatedRfqNumber = rfqNumber?.trim()
          ? rfqNumber
          : `RFQ_${Math.floor(100000 + Math.random() * 900000)}`;
        console.log("Generated RFQ Number:", generatedRfqNumber);
        console.log("source value:", source);
        console.log(
          "submitSource value:",
          ["auction", "reverse", "forward"].includes(source)
        );

        const abc = ["auction", "reverse", "forward"].includes(source)
          ? generatedRfqNumber.replace(/^RFQ_/, "AUC_")
          : "";

        console.log("Auction Number:", abc);

        const rfqJson = {
          ...data,
          rfq_number: generatedRfqNumber,
          auction_number: abc,
          form_type: submitSource.current,
          rfq_type: source || data.type,
          rfq_items:
            Array.isArray(data.rfq_items) &&
            data.rfq_items.some(
              (item) =>
                item.item_name?.trim() ||
                Number(item.quantity) > 0 ||
                item.unit?.trim() ||
                Number(item.target_price) > 0
            )
              ? data.rfq_items
              : undefined,
          rfq_transport_local:
            data.transport_mode === "local"
              ? {
                  factory_location: data.factory_location,
                  destination_address: data.destination_address,
                  pickup_required: data.pickup_required,
                  gross_weight: data.gross_weight,
                  volume_weight: data.volume_weight,
                  temperature: data.temperature,
                  commodity: data.commodity,
                  number_of_cartoons: data.number_of_cartoons,
                  hs_code: data.hs_code,
                  incoterm_selection: data.incoterm_selection,
                  notes: data.notes,
                }
              : undefined,
          rfq_transport_sea:
            data.transport_mode === "sea"
              ? {
                  pol_port_of_loading: data.pol_port_of_loading,
                  pod_port_of_discharge: data.pod_port_of_discharge,
                  commodity: data.commodity,
                  container_type: data.container_type,
                  cargo_weight: data.cargo_weight,
                  cargo_volume: data.cargo_volume,
                  cargo_value_with_currency: data.cargo_value_with_currency,
                  consignee_details: data.consignee_details,
                  hsn_codes: data.hsn_codes,
                  notes: data.notes,
                }
              : undefined,
          rfq_transport_air:
            data.transport_mode === "air"
              ? {
                  gross_weight: data.gross_weight,
                  volume_weight: data.volume_weight,
                  temperature: data.temperature,
                  country: data.country,
                  factory_location: data.factory_location,
                  customs_clearance_location: data.customs_clearance_location,
                  delivery_terms: data.delivery_terms,
                  pickup_by_ff: data.pickup_by_ff,
                  commodity: data.commodity,
                  no_of_cartons: data.no_of_cartons,
                  hs_code: data.hs_code,
                  door_delivery_address: data.door_delivery_address,
                  incoterm_selection: data.incoterm_selection,
                  notes: data.notes,
                }
              : undefined,
          vendors: selectedVendors,
          attachment_filenames: files.map((f) => f.name),
          buyer: buyer,
          shipment_details: parsedData,
        };

        rfqJson.form_type = formType;

        console.log("RFQ JSON:", rfqJson);

        try {
          const token = localStorage.getItem("USERTOKEN");
          const formData = new FormData();

          const rfqPayload = {
            ...rfqJson,
            attachments: undefined,
          };

          formData.append("data", JSON.stringify(rfqPayload));

          files.forEach((file) => {
            formData.append("attachments", file);
          });

          console.log("formData value", formData);

          const response = await fetch("/apis/rfqs", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              //"Content-Type": "application/json",
            },
            body: formData,
          });

          const result = await response.json();
          console.log("create rfq response", result);
          dispatch(toastSuccess({ detail: "RFQ Created Successfully.." }));
          navigate("/rfqs");
        } catch (error) {
          console.error("Error creating rfq:", error);
        }
      }
    };

  const steps = [
    { label: "Details" },
    { label: "Items" },
    { label: "Attachments" },
    { label: "Vendors" },
    { label: "Buyer Contact" },
  ];

  const handleStepChange = (index) => {
    setActiveIndex(index);
  };

  const goNext = () =>
    setActiveIndex((prev) => Math.min(prev + 1, steps.length - 1));
  const goBack = () => setActiveIndex((prev) => Math.max(prev - 1, 0));

  const [files, setFiles] = useState([]);

  const onUpload = (e) => {
    const uploadedFiles = e.files || [];
    setFiles([...files, ...uploadedFiles]);
  };

  const removeFile = (name) => {
    setFiles((prev) => prev.filter((f) => f.name !== name));
  };

  const [selectedVendorIds, setSelectedVendorIds] = useState([]);
  const [selectedIndustryFilters, setSelectedIndustryFilters] = useState([]);
  const [selectedProductFilters, setSelectedProductFilters] = useState([]);

  const vendorsCleaned = Array.from(
    new Map(vendorsdonwloaded.map((v) => [v.name, v])).values()
  ).map((v, index) => ({
    id: v.id,
    name: v.name,
    email: v.email,
    mobile: v.mobile,
    company: v.company,
    industry: v.industry,
    subIndustry: v.subIndustry,
    product: v.product,
  }));

  const industriesfilt = Array.from(
    new Set(vendorsCleaned.map((v) => v.industry).filter(Boolean))
  );
  const productsfilt = Array.from(
    new Set(vendorsCleaned.map((v) => v.product).filter(Boolean))
  );

  const filteredVendors = vendorsCleaned.filter((vendor) => {
    if (selectedVendorType === "all") return true;

    if (
      selectedVendorType === "industry" ||
      selectedVendorType === "air" ||
      selectedVendorType === "ocean"
    ) {
      return (
        selectedIndustryFilters.length === 0 ||
        selectedIndustryFilters.includes(vendor.industry)
      );
    }

    if (selectedVendorType === "product") {
      return (
        selectedProductFilters.length === 0 ||
        selectedProductFilters.includes(vendor.product)
      );
    }

    return true;
  });

  const selectedVendors = filteredVendors.filter((v) =>
    selectedVendorIds.includes(v.id)
  );

  useEffect(() => {
    if (watch("transport_mode") === "local" && localSectionRef.current) {
      localSectionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [watch("transport_mode")]);

  useEffect(() => {
    if (watch("transport_mode") === "air" && airSectionRef.current) {
      airSectionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [watch("transport_mode")]);

  useEffect(() => {
    if (watch("transport_mode") === "sea" && seaSectionRef.current) {
      seaSectionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [watch("transport_mode")]);

  const handleExcelUploadt = (e, export_type) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];

      const allRows = XLSX.utils.sheet_to_json(ws, {
        header: 1,
        defval: "",
      });

      const headerRowIndex = export_type === "sea_export" ? 4 : 0;
      const newShipmentSliceCheckIndex = export_type === "sea_export" ? 9 : 11;
      const uptoColumnSelectIndex = export_type === "sea_export" ? 8 : 11;
      const headers = allRows[headerRowIndex];
      const dataRows = allRows.slice(headerRowIndex + 1);

      const shipments = [];
      let currentShipment = null;

      dataRows.forEach((row) => {
        const isNewShipment = row
          .slice(0, newShipmentSliceCheckIndex)
          .some((cell) => cell !== "");

        const number = parseFloat(row[11] || 0);
        const type = row[12];
        const length = parseFloat(row[13] || 0);
        const breadth = parseFloat(row[14] || 0);
        const height = parseFloat(row[15] || 0);
        const dim_unit = (row[16] || "cm").toLowerCase();
        const gross_weight = parseFloat(row[17] || 0);
        const weight_unit = (row[18] || "kg").toLowerCase();
        const factor = dim_unit === "in" ? 366 : 6000;

        const volWeight = (length * breadth * height * number) / factor;
        const cbm = (length * breadth * height * number) / 1_000_000;

        const packageObj = {
          number,
          type,
          length,
          breadth,
          height,
          dim_unit,
          gross_weight,
          weight_unit,
        };

        if (isNewShipment) {
          const rowData = {};
          headers.forEach((header, index) => {
            if (index <= uptoColumnSelectIndex) {
              rowData[header] = row[index] ?? "";
            }
          });

          currentShipment = {
            ...rowData,
            package_summary: {
              packages: [packageObj],
              totalGrossWeight: gross_weight,
              volumetricFactor: factor,
              totalVolumetricWeight: volWeight,
              chargeableWeight: Math.max(gross_weight, volWeight),
              totalCBM: cbm,
              value_of_shipment: 0,
              shipment_currency: "INR",
            },
          };

          shipments.push(currentShipment);
        } else if (currentShipment) {
          const summary = currentShipment.package_summary;

          summary.packages.push(packageObj);
          summary.totalGrossWeight += gross_weight;
          summary.totalVolumetricWeight += volWeight;
          summary.totalCBM += cbm;
          summary.chargeableWeight = Math.max(
            summary.chargeableWeight,
            gross_weight,
            volWeight
          );
        }
      });

      shipments.forEach((s) => {
        const p = s.package_summary;
        p.totalGrossWeight = p.totalGrossWeight.toFixed(2);
        p.totalVolumetricWeight = p.totalVolumetricWeight.toFixed(2);
        p.totalCBM = p.totalCBM.toFixed(4);
      });

      console.log("Parsed Shipments:", shipments);
      setParsedData(shipments);
    };

    reader.readAsBinaryString(file);
  };

  const [currentIndexAirExp, setCurrentIndexAirExp] = useState(0);

  const currentShipmentAirExp = parsedData[currentIndexAirExp] || {};
  const totalShipments = parsedData.length;

  const handlePreviousAirExp = () => {
    if (currentIndexAirExp > 0) setCurrentIndexAirExp((prev) => prev - 1);
  };

  const handleNextAirExp = () => {
    if (currentIndexAirExp < parsedData.length - 1)
      setCurrentIndexAirExp((prev) => prev + 1);
  };

  const handleExcelUploadAirExp = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { defval: "" });

      const shipments = rows.map((row) => {
        const l = parseFloat(row["L"]);
        const b = parseFloat(row["B"]);
        const h = parseFloat(row["H"]);
        const qty = parseFloat(row["Qty"]);
        const grossWeight = parseFloat(row["GrossWt"]);
        const dimUnit = row["DimUnit"]?.toLowerCase() || "cm";
        const weightUnit = row["WeightUnit"]?.toLowerCase() || "kg";

        const factor = dimUnit === "in" ? 366 : 6000;
        const volWt = ((l * b * h * qty) / factor).toFixed(2);
        const chargeable = Math.max(grossWeight, volWt);

        return {
          temperature: row["Temp"],
          country: row["Country"],
          factory_location: row["Factory"],
          customs_clearance_location: row["Clearance"],
          delivery_terms: row["DeliveryTerms"],
          pickup_by_ff: row["FF Pickup"],
          commodity: row["Commodity"],
          hs_code: row["HS Code"],
          door_delivery_address: row["Consignee"],
          incoterm_selection: row["Incoterm"],
          notes: row["Notes"],
          package_summary: {
            packages: [
              {
                number: qty,
                type: row["Type"],
                length: l,
                breadth: b,
                height: h,
                dim_unit: dimUnit,
                gross_weight: grossWeight,
                weight_unit: weightUnit,
              },
            ],
            totalGrossWeight: grossWeight,
            totalVolumetricWeight: volWt,
            totalCBM: ((l * b * h * qty) / 1000000).toFixed(4),
            chargeableWeight: chargeable,
          },
        };
      });

      setParsedData(shipments);
      setCurrentIndexAirExp(0);
    };

    reader.readAsBinaryString(file);
  };

  return (
    <div className="p-4">
      <Steps
        model={steps}
        activeIndex={activeIndex}
        onSelect={(e) => handleStepChange(e.index)}
        readOnly={false}
      />

      {activeIndex === 0 && (
        <form onSubmit={handleSubmit(onSubmit)} className="p-4">
          <fieldset
            disabled={isReadOnly}
            style={{ border: "none", padding: 0, margin: 0 }}
          >
            <div className="grid mb-3">
              <div className="col-12 md:col-3">
                <label>Title</label>
                <InputText {...register("title")} className="w-full" />
              </div>

              {/* {(source === null || source === undefined) && ( */}
              <div className="col-12 md:col-3">
                <label>Type</label>
                <Controller
                  control={control}
                  name="type"
                  disabled={isReadOnly}
                  render={({ field }) => (
                    <Dropdown {...field} options={types} className="w-full" />
                  )}
                />
              </div>
              {/* )} */}

              <div className="col-12 md:col-3">
                <label>Industry</label>
                <Controller
                  control={control}
                  name="industry"
                  disabled={isReadOnly}
                  render={({ field }) => (
                    <Dropdown
                      filter
                      {...field}
                      options={Object.keys(defaultSubIndustries)
                        .filter(
                          (key) =>
                            !(
                              watch("type")?.toLowerCase() === "forward" &&
                              key?.toLowerCase() === "logistics"
                            )
                        )
                        .map((key) => ({
                          label: key
                            .replace(/_/g, " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase()),
                          value: key,
                        }))}
                      className="w-full"
                    />
                  )}
                />
              </div>
              <div className="col-12 md:col-3">
                <label>Subindustry</label>
                <Controller
                  control={control}
                  name="subindustry"
                  disabled={isReadOnly}
                  render={({ field }) => (
                    <Dropdown
                      {...field}
                      options={subIndustriesOptions}
                      className="w-full"
                    />
                  )}
                />
              </div>

              <div className="col-12 md:col-3">
                <label>Country</label>
                <Controller
                  control={control}
                  name="country"
                  disabled={isReadOnly}
                  render={({ field }) => (
                    <Dropdown
                      {...field}
                      options={countries}
                      className="w-full"
                    />
                  )}
                />
              </div>
              {source && (
                <div className="col-12 md:col-3">
                  <label htmlFor="currency">Bid Currency</label>
                  <Controller
                    name="currency"
                    control={control}
                    render={({ field }) => (
                      <Dropdown
                        id="currency"
                        {...field}
                        options={[
                          { label: "INR - Indian Rupee ₹", value: "INR" },
                          { label: "USD - US Dollar $", value: "USD" },
                          { label: "EUR - Euro €", value: "EUR" },
                          { label: "GBP - British Pound £", value: "GBP" },
                          { label: "JPY - Japanese Yen ¥", value: "JPY" },
                        ]}
                        placeholder="Select Currency"
                        className="w-full"
                      />
                    )}
                  />
                </div>
              )}

              <div className="col-12 md:col-3">
                <label>Open Date</label>
                <Controller
                  control={control}
                  name="open_date_time"
                  render={({ field }) => (
                    <Calendar {...field} className="w-full" showTime showIcon />
                  )}
                />
              </div>
              <div className="col-12 md:col-3">
                <label>Close Date</label>
                <Controller
                  control={control}
                  name="close_date_time"
                  render={({ field }) => (
                    <Calendar {...field} className="w-full" showTime showIcon />
                  )}
                />
              </div>

              {source && (
                <div className="field col-12 md:col-3">
                  <label>Select Auction Type</label>
                  <Controller
                    name="pickup_by_ff"
                    control={control}
                    render={({ field }) => (
                      <div className="flex gap-3">
                        {["Open Price", "Fixed Price", "Variable Price"].map(
                          (option) => (
                            <div
                              key={option}
                              className="flex align-items-center"
                            >
                              <RadioButton
                                inputId={`pickup_by_ff_${option}`}
                                value={option}
                                onChange={(e) => field.onChange(e.value)}
                                checked={field.value === option}
                              />
                              <label
                                htmlFor={`pickup_by_ff_${option}`}
                                className="ml-2"
                              >
                                {option}
                              </label>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  />
                </div>
              )}
            </div>
          </fieldset>

          <fieldset
            disabled={isReadOnly}
            style={{ border: "none", padding: 0, margin: 0 }}
          >
            <div className="grid mb-3">
              {source && (
                <div className="col-12 md:col-3">
                  <label className="mr-2">Same Bid Price Allowed</label>
                  <Controller
                    control={control}
                    name="same_bid_price_allowed"
                    render={({ field }) => (
                      <Checkbox
                        onChange={(e) => {
                          field.onChange(e.checked);
                          if (e.checked) {
                            setValue("hide_current_bid_price", false);
                            dispatch(
                              toastError({
                                detail:
                                  "You cannot enable both Same Bid and Hide Bid together. Hiding disabled.",
                              })
                            );
                          }
                        }}
                        checked={field.value}
                      />
                    )}
                  />
                </div>
              )}
              {source && (
                <div className="col-12 md:col-3">
                  <label className="mr-2">Hide Current Bid Price</label>
                  <Controller
                    control={control}
                    name="hide_current_bid_price"
                    render={({ field }) => (
                      <Checkbox
                        onChange={(e) => {
                          field.onChange(e.checked);
                          if (e.checked) {
                            setValue("same_bid_price_allowed", false);
                            dispatch(
                              toastError({
                                detail:
                                  "You cannot enable both Hide Bid and Same Bid. Same Bid disabled.",
                              })
                            );
                          }
                        }}
                        checked={field.value}
                      />
                    )}
                  />
                </div>
              )}

              {watch("subindustry") === "Air Cargo" && (
                <div className="col-12 md:col-3">
                  <label className="mr-2">Allow Multiple Airline Quote</label>
                  <Controller
                    control={control}
                    name="allow_multiple_airline_quote"
                    render={({ field }) => (
                      <Checkbox
                        onChange={(e) => field.onChange(e.checked)}
                        checked={field.value}
                      />
                    )}
                  />
                </div>
              )}

              {watch("subindustry") === "Ocean Freight" && (
                <div className="col-12 md:col-3">
                  <label className="mr-2">
                    Allow Multiple Shipping Line Quote
                  </label>
                  <Controller
                    control={control}
                    name="allow_multiple_shipping_line_quote"
                    render={({ field }) => (
                      <Checkbox
                        onChange={(e) => field.onChange(e.checked)}
                        checked={field.value}
                      />
                    )}
                  />
                </div>
              )}
              {watch("subindustry") === "Ocean Freight" && (
                <div className="field col-12 md:col-3">
                  <label>Bid Price</label>
                  <div className="flex gap-3">
                    <Controller
                      name="pickup_by_ff"
                      control={control}
                      defaultValue=""
                      render={({ field }) => (
                        <div className="flex gap-3">
                          {["Freight Only", "Freight + Tax"].map((option) => (
                            <div
                              key={option}
                              className="flex align-items-center"
                            >
                              <RadioButton
                                inputId={`pickup_by_ff_${option}`}
                                value={option}
                                onChange={field.onChange}
                                checked={field.value === option}
                              />
                              <label
                                htmlFor={`pickup_by_ff_${option}`}
                                className="ml-2"
                              >
                                {option}
                              </label>
                            </div>
                          ))}
                        </div>
                      )}
                    />
                  </div>
                </div>
              )}
            </div>
          </fieldset>

          <fieldset
            disabled={isReadOnly}
            style={{ border: "none", padding: 0, margin: 0 }}
          >
            <div className="col-12 md:col-12">
              <label>Description</label>
              <InputText {...register("description")} className="w-full" />
            </div>
          </fieldset>

          {watch("transport_mode") === "sea" &&
            watch("transport_type") === "import" && (
              <div className="surface-section p-3 mt-3 border-round shadow-1">
                <div className="flex justify-content-between align-items-center mb-3 flex-wrap">
                  <h5 className="m-0">Import Sea Transport Details</h5>
                  <div className="flex align-items-center gap-2 mt-2 md:mt-0">
                    {/* Previous Button */}
                    <Button
                      icon="pi pi-angle-left"
                      className="p-button-rounded p-button-outlined p-button-sm"
                      aria-label="Previous"
                      onClick={() => console.log("Previous Sea Transport")}
                    />

                    {/* Next Button */}
                    <Button
                      icon="pi pi-angle-right"
                      className="p-button-rounded p-button-outlined p-button-sm"
                      aria-label="Next"
                      onClick={() => console.log("Next Sea Transport")}
                    />

                    <label
                      htmlFor="packingListUpload"
                      className="font-medium text-sm"
                    >
                      Upload Packing List
                    </label>
                    <Button
                      icon="pi pi-upload"
                      className="p-button-rounded p-button-outlined p-button-sm"
                      aria-label="Upload"
                      onClick={() =>
                        document.getElementById("packingListUpload").click()
                      }
                    />
                    <input
                      type="file"
                      id="packingListUpload"
                      accept=".pdf,.doc,.docx,.xls,.xlsx"
                      style={{ display: "none" }}
                      onChange={(e) =>
                        console.log("Selected file:", e.target.files[0])
                      }
                    />
                  </div>
                </div>
                <div className="grid formgrid p-fluid">
                  <div className="field col-12 md:col-2">
                    <label>Origin Port</label>
                    <InputText
                      {...register("Origin_location")}
                      className="w-full"
                    />
                  </div>
                  <div className="field col-12 md:col-2">
                    <label>Destination Port</label>
                    <InputText
                      {...register("Origin_location")}
                      className="w-full"
                    />
                  </div>
                  <div className="field col-12 md:col-2">
                    <label>Exim Mode</label>
                    <InputText
                      {...register("no_of_packages")}
                      className="w-full"
                    />
                  </div>
                  <div className="field col-12 md:col-2">
                    <label>Incoterm</label>
                    <InputText
                      {...register("no_of_packages")}
                      className="w-full"
                    />
                  </div>
                  <div className="field col-12 md:col-2">
                    <label>Total Weight in CBM</label>
                    <InputText
                      {...register("no_of_packages")}
                      className="w-full"
                    />
                  </div>
                  <div className="field col-12 md:col-2">
                    <label>Value of Shipment</label>
                    <InputText
                      {...register("no_of_packages")}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            )}

          {watch("transport_mode") === "air" &&
            watch("transport_type") === "import" && (
              <div className="surface-section p-3 mt-3 border-round shadow-1">
                <div className="flex justify-content-between align-items-center mb-3 flex-wrap">
                  <h5 className="m-0">Import Air Transport Details</h5>
                  <div className="flex align-items-center gap-2 mt-2 md:mt-0">
                    {/* Previous Button */}
                    <Button
                      icon="pi pi-angle-left"
                      className="p-button-rounded p-button-outlined p-button-sm"
                      aria-label="Previous"
                      onClick={() => console.log("Previous Sea Transport")}
                    />

                    {/* Next Button */}
                    <Button
                      icon="pi pi-angle-right"
                      className="p-button-rounded p-button-outlined p-button-sm"
                      aria-label="Next"
                      onClick={() => console.log("Next Sea Transport")}
                    />

                    <label
                      htmlFor="packingListUpload"
                      className="font-medium text-sm"
                    >
                      Upload Packing List
                    </label>
                    <Button
                      icon="pi pi-upload"
                      className="p-button-rounded p-button-outlined p-button-sm"
                      aria-label="Upload"
                      onClick={() =>
                        document.getElementById("packingListUpload").click()
                      }
                    />
                    <input
                      type="file"
                      id="packingListUpload"
                      accept=".pdf,.doc,.docx,.xls,.xlsx"
                      style={{ display: "none" }}
                      onChange={(e) =>
                        console.log("Selected file:", e.target.files[0])
                      }
                    />
                  </div>
                </div>
                <div className="grid formgrid p-fluid">
                  <div className="field col-12 md:col-2">
                    <label>Origin Location</label>
                    <InputText
                      {...register("Origin_location")}
                      className="w-full"
                    />
                  </div>
                  <div className="field col-12 md:col-2">
                    <label>Destination Location</label>
                    <InputText
                      {...register("Origin_location")}
                      className="w-full"
                    />
                  </div>
                  <div className="field col-12 md:col-2">
                    <label>No of Packages</label>
                    <InputText
                      {...register("no_of_packages")}
                      className="w-full"
                    />
                  </div>
                  <div className="field col-12 md:col-2">
                    <label>Gross Weight per Package</label>
                    <InputText
                      {...register("no_of_packages")}
                      className="w-full"
                    />
                  </div>
                  <div className="field col-12 md:col-2">
                    <label>Total Volumetric Weight</label>
                    <InputText
                      {...register("no_of_packages")}
                      className="w-full"
                    />
                  </div>
                  <div className="field col-12 md:col-2">
                    <label>HS Code</label>
                    <InputText
                      {...register("no_of_packages")}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            )}
        </form>
      )}

      {activeIndex === 1 && (
        <form onSubmit={handleSubmit(onSubmit)} className="p-4">
          {(watch("subindustry") === "Air Cargo" ||
            watch("subindustry") === "Ocean Freight") && (
            <fieldset
              disabled={isReadOnly}
              style={{ border: "none", padding: 0, margin: 0 }}
            >
              <Card className="mt-3">
                <div className="flex justify-content-between align-items-center mb-3">
                  <h5 className="m-0">Address & Services</h5>
                  <Button
                    icon={isOpen ? "pi pi-chevron-up" : "pi pi-chevron-down"}
                    className="p-button-text"
                    onClick={toggleBlock}
                  />
                </div>

                <div className="grid formgrid p-fluid">
                  <div className="field col-12 md:col-4">
                    <label>Exim Mode</label>
                    <Controller
                      name="exim_mode"
                      disabled={isReadOnly}
                      control={control}
                      render={({ field }) => (
                        <Dropdown
                          {...field}
                          options={eximModes}
                          placeholder="Select"
                          className="w-full"
                        />
                      )}
                    />
                  </div>
                  <div className="field col-12 md:col-4">
                    <label>Movement Type</label>
                    <Controller
                      name="movement_type"
                      disabled={isReadOnly}
                      control={control}
                      render={({ field }) => (
                        <Dropdown
                          {...field}
                          options={movementTypes}
                          placeholder="Select"
                          className="w-full"
                        />
                      )}
                    />
                  </div>
                  <div className="field col-12 md:col-4">
                    <label>Incoterm</label>
                    <Controller
                      name="incoterm"
                      disabled={isReadOnly}
                      control={control}
                      render={({ field }) => (
                        <Dropdown
                          {...field}
                          options={incotermOptions}
                          placeholder="Select"
                          className="w-full"
                        />
                      )}
                    />
                  </div>

                  <div className="field col-12 md:col-4">
                    <label>Origin Airport</label>
                    <InputText
                      {...register("origin_airport")}
                      className="w-full"
                    />
                  </div>
                  <div className="field col-12 md:col-4">
                    <label>Origin Address</label>
                    <InputText
                      {...register("origin_address")}
                      className="w-full"
                    />
                  </div>
                  <div className="field col-12 md:col-4">
                    <label>Stuffing Location</label>
                    <InputText
                      {...register("stuffing_location")}
                      className="w-full"
                    />
                  </div>

                  <div className="field col-12 md:col-4">
                    <label>Destination Airport</label>
                    <InputText
                      {...register("destination_airport")}
                      className="w-full"
                    />
                  </div>
                  <div className="field col-12 md:col-4">
                    <label>Destination Address</label>
                    <InputText
                      {...register("destination_address")}
                      className="w-full"
                    />
                  </div>
                  <div className="field col-12 md:col-4">
                    <label>DeStuffing Location</label>
                    <InputText
                      {...register("destuffing_location")}
                      className="w-full"
                    />
                  </div>
                </div>
              </Card>
            </fieldset>
          )}

          {watch("subindustry") === "Air Cargo" &&
            watch("exim_mode") === "export" && (
              <div
                ref={airSectionRef}
                className="surface-section p-3 mt-3 border-round shadow-1"
              >
                <div className="flex justify-content-between align-items-center mb-3 flex-wrap">
                  <h5 className="m-0">Export Air Transport Details</h5>
                  <div className="flex align-items-center gap-2 mt-2 md:mt-0">
                    {/* Previous Button */}
                    <Button
                      icon="pi pi-angle-left"
                      className="p-button-rounded p-button-outlined p-button-sm"
                      aria-label="Previous"
                      onClick={() => console.log("Previous Sea Transport")}
                    />

                    {/* Next Button */}
                    <Button
                      icon="pi pi-angle-right"
                      className="p-button-rounded p-button-outlined p-button-sm"
                      aria-label="Next"
                      onClick={() => console.log("Next Sea Transport")}
                    />

                    <label
                      htmlFor="packingListUpload"
                      className="font-medium text-sm"
                    >
                      Upload Packing List
                    </label>
                    <input
                      type="file"
                      id="packingListUpload"
                      accept=".pdf,.doc,.docx,.xls,.xlsx"
                      style={{ display: "none" }}
                      onChange={(e) => handleExcelUploadt(e, "air_export")}
                    />
                  </div>
                </div>
                {parsedData.length > 0 ? (
                  <DataStepperForm
                    data={parsedData}
                    setData={setParsedData}
                    setValue={setValue}
                    type={"air"}
                  />
                ) : (
                  <div className="grid formgrid p-fluid">
                    <div className="field col-12 md:col-2">
                      <label>Temp To be Maintained</label>
                      <Controller
                        name="temperature"
                        control={control}
                        defaultValue={null}
                        render={({
                          field: { onChange, onBlur, value, name, ref },
                        }) => (
                          <InputText
                            id={name}
                            inputRef={ref}
                            value={value}
                            onValueChange={(e) => onChange(e.value)}
                            onBlur={onBlur}
                            className="w-full"
                            useGrouping={false}
                          />
                        )}
                      />
                    </div>
                    <div className="field col-12 md:col-2">
                      <label>Country</label>
                      <Controller
                        control={control}
                        name="country_exp_air"
                        disabled={isReadOnly}
                        render={({ field }) => (
                          <Dropdown
                            {...field}
                            options={countries}
                            className="w-full"
                          />
                        )}
                      />
                    </div>

                    <div className="field col-12 md:col-2">
                      <label>Factory Location</label>
                      <Controller
                        control={control}
                        name="factoryLocation"
                        render={({ field }) => (
                          <>
                            <Dropdown
                              {...field}
                              options={factoryOptions}
                              placeholder="Select Factory"
                              className="w-full mb-2"
                              onChange={(e) => {
                                field.onChange(e.value);
                                if (e.value !== "Others") {
                                  setCustomFactory("");
                                }
                              }}
                            />
                            {field.value === "Others" && (
                              <InputText
                                value={customFactory}
                                onChange={(e) => {
                                  console.log(
                                    "setting custom factory",
                                    e.target.value
                                  );
                                  setCustomFactory(e.target.value);
                                }}
                                onBlur={() => {
                                  if (customFactory.trim()) {
                                    field.onChange(customFactory.trim());
                                  }
                                }}
                                placeholder="Enter factory location"
                                className="w-full"
                              />
                            )}
                          </>
                        )}
                      />
                    </div>

                    <div className="field col-12 md:col-3">
                      <label>Customs Clearance Location</label>
                      <InputText
                        {...register("customs_clearance_location")}
                        className="w-full"
                      />
                    </div>

                    <div className="field col-12 md:col-3">
                      <label>Delivery Terms</label>
                      <InputText
                        {...register("delivery_terms")}
                        className="w-full"
                      />
                    </div>

                    <div className="field col-12 md:col-3">
                      <label>Pickup by Freight Forwarder(FF)</label>
                      {/* <InputText {...register("pickup_by_ff")} className="w-full" /> */}
                      <div className="flex gap-3">
                        <Controller
                          name="pickup_by_ff_exp_air"
                          control={control}
                          render={({ field }) => (
                            <div className="flex gap-3">
                              {["Yes", "No", "NA"].map((option) => (
                                <div
                                  key={option}
                                  className="flex align-items-center"
                                >
                                  <RadioButton
                                    inputId={`pickup_by_ff_exp_air_${option}`}
                                    value={option}
                                    onChange={(e) => field.onChange(e.value)}
                                    checked={field.value === option}
                                  />
                                  <label
                                    htmlFor={`pickup_by_ff_exp_air_${option}`}
                                    className="ml-2"
                                  >
                                    {option}
                                  </label>
                                </div>
                              ))}
                            </div>
                          )}
                        />
                      </div>
                    </div>

                    <div className="field col-12 md:col-3">
                      <label>Commodity</label>
                      <Controller
                        name="commodity"
                        control={control}
                        defaultValue=""
                        render={({ field }) => (
                          <Dropdown
                            {...field}
                            options={commodityOptions}
                            placeholder="Select Commodity"
                            className="w-full"
                          />
                        )}
                      />
                    </div>

                    <div className="field col-2">
                      <label>HS Code</label>
                      <InputText {...register("hs_code")} className="w-full" />
                    </div>

                    <div className="field col-4">
                      <label>Door Delivery Address / Consignee Details</label>
                      <InputText
                        {...register("door_delivery_address")}
                        className="w-full"
                      />
                    </div>

                    <div className="field col-4">
                      <label>Incoterm Selection</label>
                      <Controller
                        name="incoterm_exp_air"
                        control={control}
                        defaultValue=""
                        render={({ field }) => (
                          <Dropdown
                            value={field.value}
                            onChange={(e) => field.onChange(e.value)}
                            options={incotermOptions}
                            placeholder="Select Incoterm"
                            className="w-full"
                          />
                        )}
                      />
                    </div>

                    <div className="field col-12">
                      <label>Notes</label>
                      <InputText {...register("notes")} className="w-full" />
                    </div>
                  </div>
                )}
                {/* Removed Vendor fields code */}
              </div>
            )}

          {/* Sea Transport Fields Section - for Buyer && user?.role === "buyer" && */}
          {watch("subindustry") === "Ocean Freight" &&
            watch("exim_mode") === "export" && (
              <div
                ref={seaSectionRef}
                className="surface-section p-3 mt-3 border-round shadow-1"
              >
                <div className="flex justify-content-between align-items-center mb-3 flex-wrap">
                  <h5 className="m-0">Sea Transport Details</h5>
                  <div className="flex align-items-center gap-2 mt-2 md:mt-0">
                    {/* Upload Label */}
                    <label
                      htmlFor="packingListUpload"
                      className="font-medium text-sm ml-3"
                    >
                      Upload Packing List Sea
                    </label>

                    <Button
                      icon="pi pi-upload"
                      className="p-button-rounded p-button-outlined p-button-sm"
                      aria-label="Upload"
                      onClick={() =>
                        document.getElementById("packingListUpload").click()
                      }
                    />

                    <input
                      type="file"
                      id="packingListUpload"
                      accept=".pdf,.doc,.docx,.xls,.xlsx"
                      style={{ display: "none" }}
                      onChange={(e) => handleExcelUploadt(e, "sea_export")}
                    />
                  </div>
                </div>

                <div className="grid formgrid p-fluid">
                  {parsedData.length > 0 && (
                    <DataStepperForm
                      data={parsedData}
                      setData={setParsedData}
                      setValue={setValue}
                      type={"sea"}
                    />
                  )}

                  <div className="field col-12 md:col-3">
                    <label>POL (Port of Loading)</label>
                    <InputText
                      {...register("pol_port_of_loading")}
                      className="w-full"
                    />
                  </div>

                  <div className="field col-12 md:col-3">
                    <label>POD (Port of Discharge)</label>
                    <InputText
                      {...register("pod_port_of_discharge")}
                      className="w-full"
                    />
                  </div>

                  <div className="field col-12 md:col-3">
                    <label>Commodity</label>
                    {/* <InputText {...register("commodity")} className="w-full" /> */}
                    <Controller
                      name="commodity"
                      control={control}
                      defaultValue=""
                      render={({ field }) => (
                        <Dropdown
                          {...field}
                          options={commodityOptions}
                          placeholder="Select Commodity"
                          className="w-full"
                        />
                      )}
                    />
                  </div>

                  <div className="field col-12 md:col-3">
                    <label>Cargo / Container Type</label>
                    <Controller
                      name="container_type"
                      control={control}
                      defaultValue=""
                      render={({ field }) => (
                        <Dropdown
                          {...field}
                          options={cargoTypes}
                          placeholder="Select Cargo type"
                          className="w-full"
                        />
                      )}
                    />
                  </div>

                  <div className="field col-12 md:col-3">
                    <label>Equipment Size</label>
                    <Controller
                      name="container_type"
                      control={control}
                      defaultValue=""
                      render={({ field }) => (
                        <Dropdown
                          {...field}
                          options={equipmentSizes}
                          placeholder="Select Equipment Size"
                          className="w-full"
                        />
                      )}
                    />
                  </div>

                  <div className="field col-12 md:col-3">
                    <label>Incoterm Selection</label>
                    <Controller
                      name="incoterm"
                      control={control}
                      defaultValue=""
                      render={({ field }) => (
                        <Dropdown
                          {...field}
                          options={incotermOptions}
                          placeholder="Select Incoterm"
                          className="w-full"
                        />
                      )}
                    />
                  </div>

                  <div className="field col-12 md:col-3">
                    <label>Cargo Weight (KG)</label>
                    <InputText
                      {...register("cargo_weight")}
                      className="w-full"
                    />
                  </div>

                  <div className="field col-12 md:col-3">
                    <label>Cargo Volume (CBM)</label>
                    <InputText
                      {...register("cargo_volume")}
                      className="w-full"
                    />
                  </div>

                  <Tooltip target="[data-pr-tooltip]" />
                  <div className="field col-12 md:col-3">
                    <label htmlFor="freeDays">Free Days at Destination</label>
                    <span
                      className="p-input-icon-right"
                      data-pr-tooltip="Enter allowed free storage days at destination. Example: 2 W/Days per diem"
                    >
                      <InputText
                        id="freeDays"
                        {...register("free_days")}
                        keyfilter="pint"
                        className="w-full"
                        placeholder="Enter number of free days"
                      />
                    </span>
                  </div>

                  <div className="field col-12 md:col-3">
                    <label htmlFor="monthlyVolume">
                      Monthly Volume (Containers)
                    </label>
                    <InputNumber
                      id="monthlyVolume"
                      name="monthly_volume"
                      useGrouping={false}
                      placeholder="Enter number"
                      className="w-full"
                    />
                  </div>

                  <div className="field col-12 md:col-6">
                    <label htmlFor="cargoNotes">Cargo Condition Notes</label>
                    <InputTextarea
                      id="cargoNotes"
                      name="cargo_condition_notes"
                      rows={4}
                      placeholder="e.g., No cross-docking. Temperature control required."
                      className="w-full"
                      autoResize
                    />
                  </div>

                  <div className="field col-12 md:col-3">
                    <label>Cargo Value with Currency</label>
                    <InputText
                      {...register("cargo_value_with_currency")}
                      className="w-full"
                    />
                  </div>

                  <div className="field col-12 md:col-3">
                    <label>Consignee Details</label>
                    <InputText
                      {...register("consignee_details")}
                      className="w-full"
                    />
                  </div>

                  <div className="field col-12 md:col-3">
                    <label>HSN Codes</label>
                    <InputText {...register("hsn_codes")} className="w-full" />
                  </div>

                  <div className="field col-12">
                    <label>Notes</label>
                    <InputText {...register("notes")} className="w-full" />
                  </div>
                </div>

                {watch("subindustry") === "Ocean Freight" && (
                  <div className="grid formgrid p-fluid">
                    {/* <QuotingChargesBlock /> */}

                    <div className="field col-12 md:col-3">
                      <label>Mode</label>
                      <Controller
                        control={control}
                        name="mode"
                        render={({ field }) => (
                          <Dropdown
                            {...field}
                            options={modeOptions}
                            className="w-full"
                          />
                        )}
                      />
                    </div>

                    <div className="col-12 md:col-3">
                      <label className="block mb-1 font-medium">
                        Cargo Type
                      </label>
                      <Controller
                        control={control}
                        name="cargoType"
                        render={({ field }) => (
                          <Dropdown
                            {...field}
                            options={seacargoTypes}
                            className="w-full"
                          />
                        )}
                      />
                    </div>

                    {watch("mode") === "fcl" && (
                      <div className="grid mb-3 mt-3">
                        <div className="col-12 md:col-2 mr-2">
                          <div class="p-inputgroup">
                            <Controller
                              name="twenty_feet_no"
                              control={control}
                              defaultValue={0}
                              render={({ field }) => (
                                <InputNumber
                                  inputId="twenty_feet_no"
                                  value={field.value}
                                  onValueChange={(e) => field.onChange(e.value)}
                                  useGrouping={false}
                                  className="w-full"
                                />
                              )}
                            />
                            <button
                              aria-label="Search"
                              class="p-button p-component"
                              data-pc-name="button"
                              data-pc-section="root"
                              fdprocessedid="4buovf"
                            >
                              <span
                                class="p-button-label p-c"
                                data-pc-section="label"
                              >
                                20 Feet
                              </span>
                            </button>
                          </div>
                        </div>
                        <div className="col-12 md:col-2 mr-2">
                          <div class="p-inputgroup">
                            <Controller
                              name="fourty_feet_no"
                              control={control}
                              defaultValue={0}
                              render={({ field }) => (
                                <InputNumber
                                  inputId="fourty_feet_no"
                                  value={field.value}
                                  onValueChange={(e) => field.onChange(e.value)}
                                  useGrouping={false}
                                  className="w-full"
                                />
                              )}
                            />
                            <button
                              aria-label="Search"
                              class="p-button p-component"
                              data-pc-name="button"
                              data-pc-section="root"
                              fdprocessedid="4buovf"
                            >
                              <span
                                class="p-button-label p-c"
                                data-pc-section="label"
                              >
                                40 Feet
                              </span>
                            </button>
                          </div>
                        </div>

                        <div className="col-12 md:col-2 mr-2">
                          <div class="p-inputgroup">
                            <Controller
                              name="fourty_five_feet_no"
                              control={control}
                              defaultValue={0}
                              render={({ field }) => (
                                <InputNumber
                                  inputId="fourty_five_feet_no"
                                  value={field.value}
                                  onValueChange={(e) => field.onChange(e.value)}
                                  useGrouping={false}
                                  className="w-full"
                                />
                              )}
                            />
                            <button
                              aria-label="Search"
                              class="p-button p-component"
                              data-pc-name="button"
                              data-pc-section="root"
                              fdprocessedid="4buovf"
                            >
                              <span
                                class="p-button-label p-c"
                                data-pc-section="label"
                              >
                                45 Feet
                              </span>
                            </button>
                          </div>
                        </div>

                        <div className="col-12 md:col-2 mr-2">
                          <div class="p-inputgroup">
                            <Controller
                              name="iso_tank_no"
                              control={control}
                              defaultValue={0}
                              render={({ field }) => (
                                <InputNumber
                                  inputId="iso_tank_no"
                                  value={field.value}
                                  onValueChange={(e) => field.onChange(e.value)}
                                  useGrouping={false}
                                  className="w-full"
                                />
                              )}
                            />

                            <button
                              aria-label="Search"
                              class="p-button p-component"
                              data-pc-name="button"
                              data-pc-section="root"
                              fdprocessedid="4buovf"
                            >
                              <span
                                class="p-button-label p-c"
                                data-pc-section="label"
                              >
                                ISO Tank
                              </span>
                            </button>
                          </div>
                        </div>

                        <div className="col-12 md:col-2">
                          <div class="p-inputgroup">
                            <Controller
                              name="flex_tank_no"
                              control={control}
                              defaultValue={0}
                              render={({ field }) => (
                                <InputNumber
                                  inputId="flex_tank_no"
                                  value={field.value}
                                  onValueChange={(e) => field.onChange(e.value)}
                                  useGrouping={false}
                                  className="w-full"
                                />
                              )}
                            />
                            <button
                              aria-label="Search"
                              class="p-button p-component"
                              data-pc-name="button"
                              data-pc-section="root"
                              fdprocessedid="4buovf"
                            >
                              <span
                                class="p-button-label p-c"
                                data-pc-section="label"
                              >
                                Flex Tank
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

          {watch("subindustry") === "Air Cargo" &&
            Array.isArray(parsedData) &&
            parsedData.length === 0 && (
              <div className="grid formgrid p-fluid">
                <fieldset
                  disabled={isReadOnly}
                  style={{ border: "none", padding: 0, margin: 0 }}
                >
                  <PackageDimensionsForm
                    mode={watch("transport_mode")}
                    onPackagesChange={handlePackagesChange}
                    existingPackages={watch("package_summary")}
                  />
                </fieldset>
              </div>
            )}

          {watch("subindustry") === "Air Cargo" && (
            <fieldset
              disabled={isReadOnly}
              style={{ border: "none", padding: 0, margin: 0 }}
            >
              <Card title="Required Charges to be Quoted" className="mb-4">
                <div className="grid">
                  <div className="col-12 md:col-2">
                    <label className="mr-2">Air Freight</label>
                    <Controller
                      control={control}
                      name="air_freight"
                      render={({ field }) => (
                        <Checkbox
                          onChange={(e) => field.onChange(e.checked)}
                          checked={field.value}
                          disabled={isReadOnly}
                        />
                      )}
                    />
                  </div>

                  <div className="col-12 md:col-2">
                    <label className="mr-2">Local Pick Up</label>
                    <Controller
                      control={control}
                      name="local_pickup"
                      render={({ field }) => (
                        <Checkbox
                          onChange={(e) => field.onChange(e.checked)}
                          checked={field.value}
                          disabled={isReadOnly}
                        />
                      )}
                    />
                  </div>

                  <div className="col-12 md:col-2">
                    <label className="mr-2">Customs Clearance</label>
                    <Controller
                      control={control}
                      name="customs_clearance"
                      render={({ field }) => (
                        <Checkbox
                          onChange={(e) => field.onChange(e.checked)}
                          checked={field.value}
                          disabled={isReadOnly}
                        />
                      )}
                    />
                  </div>
                  <div className="col-12 md:col-2">
                    <label className="mr-2">Admin charges</label>
                    <Controller
                      control={control}
                      name="admin_charges"
                      render={({ field }) => (
                        <Checkbox
                          onChange={(e) => field.onChange(e.checked)}
                          checked={field.value}
                          disabled={isReadOnly}
                        />
                      )}
                    />
                  </div>

                  <div className="col-12 md:col-2">
                    <label className="mr-2">CO2 Emissions</label>
                    <Controller
                      control={control}
                      name="co2_emissions"
                      render={({ field }) => (
                        <Checkbox
                          onChange={(e) => field.onChange(e.checked)}
                          checked={field.value}
                          disabled={isReadOnly}
                        />
                      )}
                    />
                  </div>

                  <div className="col-12 md:col-2">
                    <label className="mr-2">DAP</label>
                    <Controller
                      control={control}
                      name="req_quote_dap"
                      render={({ field }) => (
                        <Checkbox
                          onChange={(e) => field.onChange(e.checked)}
                          checked={field.value}
                          disabled={isReadOnly}
                        />
                      )}
                    />
                  </div>

                  <div className="col-12 md:col-2">
                    <label className="mr-2">Others</label>
                    <Controller
                      control={control}
                      name="quote_charge_others"
                      render={({ field }) => (
                        <Checkbox
                          onChange={(e) => field.onChange(e.checked)}
                          checked={field.value}
                          disabled={isReadOnly}
                        />
                      )}
                    />
                  </div>

                  <div className="col-12 md:col-2">
                    <label className="mr-2">Notes</label>
                    <InputTextarea
                      id="req_quote_notes"
                      {...register("req_quote_notes")}
                      rows={4}
                      placeholder="Write Note"
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="mt-3 text-right">
                  <Button
                    label="Add Charges"
                    icon="pi pi-plus"
                    className="p-button-sm"
                  />
                </div>
              </Card>
            </fieldset>
          )}

          {watch("subindustry") === "Ocean Freight" && (
            <fieldset
              disabled={isReadOnly}
              style={{
                border: "none",
                paddingTop: 10,
                paddingLeft: 0,
                paddingRight: 0,
                paddingBottom: 0,
                margin: 0,
              }}
            >
              <Card title="Required Charges to be Quoted" className="mb-4">
                <div className="grid">
                  <div className="col-12 md:col-2">
                    <label className="mr-2">Ocean Freight</label>
                    <Controller
                      control={control}
                      name="air_freight"
                      render={({ field }) => (
                        <Checkbox
                          onChange={(e) => field.onChange(e.checked)}
                          checked={field.value}
                          disabled={isReadOnly}
                        />
                      )}
                    />
                  </div>

                  <div className="col-12 md:col-2">
                    <label className="mr-2">VGM</label>
                    <Controller
                      control={control}
                      name="VGM"
                      render={({ field }) => (
                        <Checkbox
                          onChange={(e) => field.onChange(e.checked)}
                          checked={field.value}
                          disabled={isReadOnly}
                        />
                      )}
                    />
                  </div>

                  <div className="col-12 md:col-2">
                    <label className="mr-2">ENS</label>
                    <Controller
                      control={control}
                      name="ENS"
                      render={({ field }) => (
                        <Checkbox
                          onChange={(e) => field.onChange(e.checked)}
                          checked={field.value}
                          disabled={isReadOnly}
                        />
                      )}
                    />
                  </div>
                  <div className="col-12 md:col-2">
                    <label className="mr-2">BL Fee</label>
                    <Controller
                      control={control}
                      name="ble_fee"
                      render={({ field }) => (
                        <Checkbox
                          onChange={(e) => field.onChange(e.checked)}
                          checked={field.value}
                          disabled={isReadOnly}
                        />
                      )}
                    />
                  </div>

                  <div className="col-12 md:col-2">
                    <label className="mr-2">Local Pick Up</label>
                    <Controller
                      control={control}
                      name="local_pickup"
                      render={({ field }) => (
                        <Checkbox
                          onChange={(e) => field.onChange(e.checked)}
                          checked={field.value}
                          disabled={isReadOnly}
                        />
                      )}
                    />
                  </div>

                  <div className="col-12 md:col-2">
                    <label className="mr-2">Customs Clearance</label>
                    <Controller
                      control={control}
                      name="customs_clearance"
                      render={({ field }) => (
                        <Checkbox
                          onChange={(e) => field.onChange(e.checked)}
                          checked={field.value}
                          disabled={isReadOnly}
                        />
                      )}
                    />
                  </div>

                  <div className="col-12 md:col-2">
                    <label className="mr-2">CFS charges</label>
                    <Controller
                      control={control}
                      name="cfs_charges"
                      render={({ field }) => (
                        <Checkbox
                          onChange={(e) => field.onChange(e.checked)}
                          checked={field.value}
                          disabled={isReadOnly}
                        />
                      )}
                    />
                  </div>

                  <div className="col-12 md:col-2">
                    <label className="mr-2">Insurance</label>
                    <Controller
                      control={control}
                      name="insurance"
                      render={({ field }) => (
                        <Checkbox
                          onChange={(e) => field.onChange(e.checked)}
                          checked={field.value}
                          disabled={isReadOnly}
                        />
                      )}
                    />
                  </div>

                  <div className="col-12 md:col-2">
                    <label className="mr-2">Survey Fee</label>
                    <Controller
                      control={control}
                      name="survey_fee"
                      render={({ field }) => (
                        <Checkbox
                          onChange={(e) => field.onChange(e.checked)}
                          checked={field.value}
                          disabled={isReadOnly}
                        />
                      )}
                    />
                  </div>
                  <div className="col-12 md:col-2">
                    <label className="mr-2">MUC</label>
                    <Controller
                      control={control}
                      name="MUC"
                      render={({ field }) => (
                        <Checkbox
                          onChange={(e) => field.onChange(e.checked)}
                          checked={field.value}
                          disabled={isReadOnly}
                        />
                      )}
                    />
                  </div>
                  <div className="col-12 md:col-2">
                    <label className="mr-2">THC</label>
                    <Controller
                      control={control}
                      name="THC"
                      render={({ field }) => (
                        <Checkbox
                          onChange={(e) => field.onChange(e.checked)}
                          checked={field.value}
                          disabled={isReadOnly}
                        />
                      )}
                    />
                  </div>
                  <div className="col-12 md:col-2">
                    <label className="mr-2">Weighment & MUC</label>
                    <Controller
                      control={control}
                      name="weighment_muc"
                      render={({ field }) => (
                        <Checkbox
                          onChange={(e) => field.onChange(e.checked)}
                          checked={field.value}
                          disabled={isReadOnly}
                        />
                      )}
                    />
                  </div>
                  <div className="col-12 md:col-2">
                    <label className="mr-2">DAP Charges</label>
                    <Controller
                      control={control}
                      name="dap_charges"
                      render={({ field }) => (
                        <Checkbox
                          onChange={(e) => field.onChange(e.checked)}
                          checked={field.value}
                          disabled={isReadOnly}
                        />
                      )}
                    />
                  </div>
                  <div className="col-12 md:col-2">
                    <label className="mr-2">Admin charges</label>
                    <Controller
                      control={control}
                      name="admin_charges"
                      render={({ field }) => (
                        <Checkbox
                          onChange={(e) => field.onChange(e.checked)}
                          checked={field.value}
                          disabled={isReadOnly}
                        />
                      )}
                    />
                  </div>
                  <div className="col-12 md:col-2">
                    <label className="mr-2">ISPS</label>
                    <Controller
                      control={control}
                      name="ISPS"
                      render={({ field }) => (
                        <Checkbox
                          onChange={(e) => field.onChange(e.checked)}
                          checked={field.value}
                          disabled={isReadOnly}
                        />
                      )}
                    />
                  </div>
                  <div className="col-12 md:col-2">
                    <label className="mr-2">Peak Season Surcharge</label>
                    <Controller
                      control={control}
                      name="peak_season_surcharge"
                      render={({ field }) => (
                        <Checkbox
                          onChange={(e) => field.onChange(e.checked)}
                          checked={field.value}
                          disabled={isReadOnly}
                        />
                      )}
                    />
                  </div>
                  <div className="col-12 md:col-2">
                    <label className="mr-2">Seal charges</label>
                    <Controller
                      control={control}
                      name="seal_charges"
                      render={({ field }) => (
                        <Checkbox
                          onChange={(e) => field.onChange(e.checked)}
                          checked={field.value}
                          disabled={isReadOnly}
                        />
                      )}
                    />
                  </div>
                  <div className="col-12 md:col-2">
                    <label className="mr-2">Non-Stackable Charges</label>
                    <Controller
                      control={control}
                      name="non_stackable_charges"
                      render={({ field }) => (
                        <Checkbox
                          onChange={(e) => field.onChange(e.checked)}
                          checked={field.value}
                          disabled={isReadOnly}
                        />
                      )}
                    />
                  </div>
                  <div className="col-12 md:col-2">
                    <label className="mr-2">AMS</label>
                    <Controller
                      control={control}
                      name="AMS"
                      render={({ field }) => (
                        <Checkbox
                          onChange={(e) => field.onChange(e.checked)}
                          checked={field.value}
                          disabled={isReadOnly}
                        />
                      )}
                    />
                  </div>
                  <div className="col-12 md:col-2">
                    <label className="mr-2">
                      Security Manifest Documentation
                    </label>
                    <Controller
                      control={control}
                      name="security_manifest_documentation"
                      render={({ field }) => (
                        <Checkbox
                          onChange={(e) => field.onChange(e.checked)}
                          checked={field.value}
                          disabled={isReadOnly}
                        />
                      )}
                    />
                  </div>
                  <div className="col-12 md:col-2">
                    <label className="mr-2">CO2 Emissions</label>
                    <Controller
                      control={control}
                      name="CO2_emissions"
                      render={({ field }) => (
                        <Checkbox
                          onChange={(e) => field.onChange(e.checked)}
                          checked={field.value}
                          disabled={isReadOnly}
                        />
                      )}
                    />
                  </div>
                  <div className="col-12 md:col-2">
                    <label className="mr-2">Port Charges</label>
                    <Controller
                      control={control}
                      name="port_charges"
                      render={({ field }) => (
                        <Checkbox
                          onChange={(e) => field.onChange(e.checked)}
                          checked={field.value}
                          disabled={isReadOnly}
                        />
                      )}
                    />
                  </div>
                  <div className="col-12 md:col-2">
                    <label className="mr-2">Inland Transportation</label>
                    <Controller
                      control={control}
                      name="inland_transportation"
                      render={({ field }) => (
                        <Checkbox
                          onChange={(e) => field.onChange(e.checked)}
                          checked={field.value}
                          disabled={isReadOnly}
                        />
                      )}
                    />
                  </div>
                </div>

                <div className="mt-3 text-right">
                  <Button
                    label="Add Charges"
                    icon="pi pi-plus"
                    className="p-button-sm"
                  />
                </div>
              </Card>
            </fieldset>
          )}

          {/* Additional Bid Details */}
          {watch("subindustry") === "Air Cargo" && (
            <fieldset
              disabled={isReadOnly}
              style={{ border: "none", padding: 0, margin: 0 }}
            >
              <Card title="Additional Bid Details">
                <div className="grid">
                  <div className="col-12 md:col-2">
                    <label className="mr-2">Airline</label>
                    <Controller
                      control={control}
                      name="airline"
                      render={({ field }) => (
                        <Checkbox
                          onChange={(e) => field.onChange(e.checked)}
                          checked={field.value}
                          disabled={isReadOnly}
                        />
                      )}
                    />
                  </div>
                  <div className="col-12 md:col-2">
                    <label className="mr-2">Bid Validity</label>
                    <Controller
                      control={control}
                      name="bid_validity"
                      render={({ field }) => (
                        <Checkbox
                          onChange={(e) => field.onChange(e.checked)}
                          checked={field.value}
                          disabled={isReadOnly}
                        />
                      )}
                    />
                  </div>
                  <div className="col-12 md:col-2">
                    <label className="mr-2">Transit Time</label>
                    <Controller
                      control={control}
                      name="transit_time"
                      render={({ field }) => (
                        <Checkbox
                          onChange={(e) => field.onChange(e.checked)}
                          checked={field.value}
                          disabled={isReadOnly}
                        />
                      )}
                    />
                  </div>
                  <div className="col-12 md:col-2">
                    <label className="mr-2">Trans Shipment Via</label>
                    <Controller
                      control={control}
                      name="Trans Shipment Via"
                      render={({ field }) => (
                        <Checkbox
                          onChange={(e) => field.onChange(e.checked)}
                          checked={field.value}
                          disabled={isReadOnly}
                        />
                      )}
                    />
                  </div>

                  <div className="col-12 md:col-2">
                    <label className="mr-2">Others</label>
                    <Controller
                      control={control}
                      name="others"
                      render={({ field }) => (
                        <Checkbox
                          onChange={(e) => field.onChange(e.checked)}
                          checked={field.value}
                          disabled={isReadOnly}
                        />
                      )}
                    />
                  </div>

                  <div className="col-12 md:col-2">
                    <label className="mr-2">Notes</label>
                    <InputTextarea
                      id="notes"
                      {...register("notes")}
                      rows={4}
                      placeholder="Write Note"
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="mt-3 text-right">
                  <Button
                    label="Add Additional Bid Details"
                    icon="pi pi-plus"
                    className="p-button-sm p-button-outlined"
                  />
                </div>
              </Card>
            </fieldset>
          )}

          {watch("subindustry") === "Ocean Freight" && (
            <fieldset
              disabled={isReadOnly}
              style={{ border: "none", padding: 0, margin: 0 }}
            >
              <Card title="Additional Bid Details">
                <div className="grid">
                  <div className="col-12 md:col-2">
                    <label className="mr-2">Shipping Line</label>
                    <Controller
                      control={control}
                      name="shipping_line"
                      render={({ field }) => (
                        <Checkbox
                          onChange={(e) => field.onChange(e.checked)}
                          checked={field.value}
                          disabled={isReadOnly}
                        />
                      )}
                    />
                  </div>
                  <div className="col-12 md:col-2">
                    <label className="mr-2">Bid Validity</label>
                    <Controller
                      control={control}
                      name="bid_validity"
                      render={({ field }) => (
                        <Checkbox
                          onChange={(e) => field.onChange(e.checked)}
                          checked={field.value}
                          disabled={isReadOnly}
                        />
                      )}
                    />
                  </div>
                  <div className="col-12 md:col-2">
                    <label className="mr-2">Transit Time</label>
                    <Controller
                      control={control}
                      name="transit_time"
                      render={({ field }) => (
                        <Checkbox
                          onChange={(e) => field.onChange(e.checked)}
                          checked={field.value}
                          disabled={isReadOnly}
                        />
                      )}
                    />
                  </div>
                  <div className="col-12 md:col-2">
                    <label className="mr-2">Sailing Schedule</label>
                    <Controller
                      control={control}
                      name="sailing_schedule"
                      render={({ field }) => (
                        <Checkbox
                          onChange={(e) => field.onChange(e.checked)}
                          checked={field.value}
                          disabled={isReadOnly}
                        />
                      )}
                    />
                  </div>

                  <div className="col-12 md:col-2">
                    <label className="mr-2">Detension Free Time</label>
                    <Controller
                      control={control}
                      name="detension_free_time"
                      render={({ field }) => (
                        <Checkbox
                          onChange={(e) => field.onChange(e.checked)}
                          checked={field.value}
                          disabled={isReadOnly}
                        />
                      )}
                    />
                  </div>

                  <div className="col-12 md:col-2">
                    <label className="mr-2">Trans Shipment Via</label>
                    <Controller
                      control={control}
                      name="trans_shipment_via"
                      render={({ field }) => (
                        <Checkbox
                          onChange={(e) => field.onChange(e.checked)}
                          checked={field.value}
                          disabled={isReadOnly}
                        />
                      )}
                    />
                  </div>
                  <div className="col-12 md:col-2">
                    <label className="mr-2">Cut-Off Date</label>
                    <Controller
                      control={control}
                      name="cut_off_date"
                      render={({ field }) => (
                        <Checkbox
                          onChange={(e) => field.onChange(e.checked)}
                          checked={field.value}
                          disabled={isReadOnly}
                        />
                      )}
                    />
                  </div>
                  <div className="col-12 md:col-2">
                    <label className="mr-2">ETD Date</label>
                    <Controller
                      control={control}
                      name="etd_date"
                      render={({ field }) => (
                        <Checkbox
                          onChange={(e) => field.onChange(e.checked)}
                          checked={field.value}
                          disabled={isReadOnly}
                        />
                      )}
                    />
                  </div>
                </div>

                <div className="mt-3 text-right">
                  <Button
                    label="Add Additional Bid Details"
                    icon="pi pi-plus"
                    className="p-button-sm p-button-outlined"
                  />
                </div>
              </Card>
            </fieldset>
          )}

          {(watch("subindustry") === "Air Cargo" ||
            watch("subindustry") === "Ocean Freight") && (
            <fieldset
              disabled={isReadOnly}
              style={{ border: "none", padding: 0, margin: 0 }}
            >
              <Card
                title="Material & Other Details (Optional)"
                className="mt-4"
              >
                <div className="grid formgrid p-fluid">
                  <div className="field col-12 md:col-4">
                    <label htmlFor="currency">Cargo Type</label>
                    <Controller
                      name="cargotype"
                      control={control}
                      render={({ field }) => (
                        <Dropdown
                          id="cargotype"
                          {...field}
                          options={cargoTypes}
                          placeholder="Select Cargo Type"
                          className="w-full"
                          disabled={isReadOnly}
                        />
                      )}
                    />
                  </div>

                  <div className="field col-12 md:col-4">
                    <label htmlFor="material">Material</label>
                    <Controller
                      name="material"
                      control={control}
                      render={({ field }) => (
                        <Dropdown
                          id="material"
                          {...field}
                          options={materials}
                          placeholder="Select Material"
                          className="w-full"
                          disabled={isReadOnly}
                        />
                      )}
                    />
                  </div>

                  <div className="field col-12 md:col-4">
                    <label htmlFor="hsCode">HS Code</label>
                    <InputText {...register("hsCode")} className="w-full" />
                  </div>

                  <div className="field col-12">
                    <label htmlFor="additionalDetails">
                      Additional Details
                    </label>
                    <InputTextarea
                      id="additionalDetails"
                      {...register("additionalDetails")}
                      rows={4}
                      placeholder="Write Additional Details..."
                      className="w-full"
                    />
                  </div>
                </div>
              </Card>
            </fieldset>
          )}

          {watch("subindustry") === "Road Transport" && (
            <div className="grid formgrid p-fluid">
              <TransportAuctionForm
                mode={watch("transport_mode")}
                onRoadTransportChange={handleRoadTransportChange}
                existingRoadTransportDetails={watch("road_transport_summary")}
              />
            </div>
          )}

          {watch("industry") !== "Logistics" && (
            <fieldset
              disabled={isReadOnly}
              style={{ border: "none", padding: 0, margin: 0 }}
            >
              <div>
                <h4 className="mt-4">Items</h4>

                {fields.map((item, index) => (
                  <div
                    key={item.id}
                    className="formgrid grid gap-2 align-items-end mb-3"
                  >
                    <div className="field col-12 md:col-3">
                      <label>Item Name</label>
                      <InputText
                        placeholder="Item Name"
                        {...register(`rfq_items.${index}.item_name`)}
                        className="w-full"
                      />
                    </div>

                    <div className="field col-12 md:col-3">
                      <label>Qty</label>
                      <Controller
                        control={control}
                        name={`rfq_items.${index}.quantity`}
                        render={({ field }) => (
                          <InputNumber
                            value={field.value}
                            onValueChange={(e) => field.onChange(e.value)}
                            useGrouping={false}
                            min={0}
                            showButtons
                            buttonLayout="horizontal"
                            incrementButtonIcon="pi pi-plus"
                            decrementButtonIcon="pi pi-minus"
                            className="w-full"
                            style={{ minWidth: 0 }}
                          />
                        )}
                      />
                    </div>

                    <div className="field col-12 md:col-3 mr-2">
                      <label>Unit</label>
                      <Controller
                        name={`rfq_items.${index}.unit`}
                        disabled={isReadOnly}
                        control={control}
                        render={({ field }) => (
                          <Dropdown
                            {...field}
                            value={field.value}
                            onValueChange={(e) => field.onChange(e.value)}
                            useGrouping={false}
                            options={unitOptions}
                            placeholder="Select Unit"
                            className="w-full"
                          />
                        )}
                      />
                    </div>

                    <div className="field col-12 md:col-3">
                      <label>Target Price</label>
                      <Controller
                        control={control}
                        name={`rfq_items.${index}.target_price`}
                        render={({ field }) => (
                          <InputNumber
                            value={field.value}
                            onValueChange={(e) => field.onChange(e.value)}
                            useGrouping={false}
                            min={0}
                            className="w-full"
                            showButtons
                            buttonLayout="horizontal"
                            incrementButtonIcon="pi pi-plus"
                            decrementButtonIcon="pi pi-minus"
                          />
                        )}
                      />
                    </div>

                    <div className="field col-12 md:col-2">
                      <Button
                        icon="pi pi-trash"
                        className="p-button-danger"
                        onClick={() => remove(index)}
                        type="button"
                      />
                    </div>
                  </div>
                ))}

                <Button
                  label="Add Item"
                  icon="pi pi-plus"
                  onClick={() =>
                    append({
                      item_name: "",
                      quantity: 0,
                      unit: 0,
                      target_price: 0,
                    })
                  }
                  type="button"
                  className="p-button-secondary mt-2"
                />
              </div>
            </fieldset>
          )}
        </form>
      )}

      {activeIndex === 2 && (
        <fieldset
          disabled={isReadOnly}
          style={{ border: "none", padding: 0, margin: 0 }}
        >
          <Card title="Upload Attachments" className="mt-4 shadow-2">
            <FileUpload
              name="rfqFiles[]"
              customUpload
              auto
              multiple
              chooseLabel="Choose"
              uploadLabel="Upload"
              cancelLabel="Clear"
              onSelect={onUpload}
              className="w-full"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.png"
            />

            {files.length > 0 && (
              <div className="mt-4">
                <h5 className="mb-3">Attached Files:</h5>
                <ul className="list-none m-0 p-0">
                  {files.map((file, idx) => (
                    <li
                      key={idx}
                      className="flex justify-content-between align-items-center p-2 border-bottom-1 border-gray-300"
                    >
                      <a
                        href={`/uploads/rfq/${encodeURIComponent(file.name)}`}
                        download={file.name}
                        className="text-primary underline cursor-pointer"
                      >
                        {file.name}
                      </a>
                      <Button
                        icon="pi pi-trash"
                        className="p-button-rounded p-button-text p-button-danger"
                        onClick={() => removeFile(file.name)}
                        tooltip="Remove"
                      />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
        </fieldset>
      )}

      {activeIndex === 3 && (
        <fieldset
          disabled={isReadOnly}
          style={{ border: "none", padding: 0, margin: 0 }}
        >
          <Card title="Select Vendors" className="mt-4 shadow-2">
            <div className="flex flex-column md:flex-row gap-3 align-items-center mb-3">
              <Dropdown
                value={selectedVendorType}
                disabled={isReadOnly}
                options={vendorTypeOptions}
                onChange={(e) => {
                  setSelectedVendorType(e.value);
                  setSelectedVendorIds([]);
                  setSelectedIndustryFilters([]);
                  setSelectedProductFilters([]);
                  if (e.value === "air") {
                    console.log("type of vendor", e.value);
                    setSelectedIndustryFilters(["air"]);
                  }
                  if (e.value === "ocean") {
                    console.log("type of vendor", e.value);
                    setSelectedIndustryFilters(["ocean"]);
                  }
                }}
                placeholder="Select Type"
                className="w-full md:w-14rem"
              />

              {selectedVendorType === "industry" && (
                <MultiSelect
                  value={selectedIndustryFilters}
                  options={industriesfilt.map((ind) => ({
                    label: ind,
                    value: ind,
                  }))}
                  onChange={(e) => setSelectedIndustryFilters(e.value)}
                  placeholder="Select Industries"
                  className="w-full md:w-20rem"
                />
              )}

              {selectedVendorType === "product" && (
                <MultiSelect
                  value={selectedProductFilters}
                  options={productsfilt.map((prod) => ({
                    label: prod,
                    value: prod,
                  }))}
                  onChange={(e) => setSelectedProductFilters(e.value)}
                  placeholder="Select Products"
                  className="w-full md:w-20rem"
                />
              )}

              <MultiSelect
                value={selectedVendorIds}
                disabled={isReadOnly}
                options={filteredVendors.map((v) => ({
                  label: v.name,
                  value: v.id,
                }))}
                onChange={(e) => setSelectedVendorIds(e.value)}
                placeholder="Select Vendors"
                display="chip"
                className="w-full"
              />
            </div>

            {selectedVendors.length > 0 && (
              <div className="mt-4">
                <h5 className="mb-3">Selected Vendor Details:</h5>
                <DataTable
                  value={selectedVendors}
                  responsiveLayout="scroll"
                  className="p-datatable-sm"
                >
                  <Column field="name" header="Name" />
                  <Column field="email" header="Email" />
                  <Column field="mobile" header="Mobile" />
                  <Column field="company" header="Company" />
                </DataTable>
              </div>
            )}
          </Card>
        </fieldset>
      )}

      {activeIndex === 4 && (
        <fieldset
          disabled={isReadOnly}
          style={{ border: "none", padding: 0, margin: 0 }}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="p-4">
            <Card title="Buyer Contact Information" className="mt-4 shadow-2">
              <div className="mb-3">
                <Checkbox
                  inputId="useDetails"
                  checked={useMyDetails}
                  onChange={(e) => setUseMyDetails(e.checked)}
                />
                <label htmlFor="useDetails" className="ml-2">
                  Use my account details
                </label>
              </div>

              <div className="grid formgrid p-fluid">
                <div className="field col-12 md:col-6">
                  <label htmlFor="buyerName">Name</label>
                  <InputText
                    id="buyerName"
                    value={buyer.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    disabled={useMyDetails}
                  />
                </div>

                <div className="field col-12 md:col-6">
                  <label htmlFor="buyerEmail">Email</label>
                  <InputText
                    id="buyerEmail"
                    value={buyer.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    disabled={useMyDetails}
                  />
                </div>

                <div className="field col-12 md:col-6">
                  <label htmlFor="buyerMobile">Mobile</label>
                  <InputText
                    id="buyerMobile"
                    value={buyer.mobile}
                    onChange={(e) => updateField("mobile", e.target.value)}
                  />
                </div>

                <div className="field col-12 md:col-6">
                  <label htmlFor="buyerLocation">Location</label>
                  <InputText
                    id="buyerLocation"
                    value={buyer.location}
                    onChange={(e) => updateField("location", e.target.value)}
                  />
                </div>
              </div>
            </Card>
          </form>
        </fieldset>
      )}

      {/* You can repeat similar layout for activeIndex === 1, 2, 3, 4 etc */}

      <div className="grid mt-4">
        <form className="col-12">
          <div className="flex justify-content-between flex-wrap gap-2">
            <div className="flex gap-2">
              <Button
                label="Back"
                icon="pi pi-arrow-left"
                className="p-button-text"
                onClick={goBack}
                disabled={activeIndex === 0}
                type="button"
              />
              {activeIndex < steps.length - 1 && (
                <Button
                  label="Next"
                  icon="pi pi-arrow-right"
                  iconPos="right"
                  className="p-button-outlined"
                  onClick={handleSubmit(onSubmit("next"))}
                  type="submit"
                />
              )}
            </div>

            {activeIndex === steps.length - 1 && (
              <div className="flex gap-2">
                {formType !== "submitted" && (
                  <Button
                    type="submit"
                    label="Save as Draft"
                    disabled={isReadOnly}
                    className="p-button-secondary"
                    onClick={handleSubmit(onSubmit("draft"))}
                  />
                )}
                <Button
                  type="submit"
                  label={source === "auction" ? "Create Auction" : "Submit RFQ"}
                  className="p-button-success"
                  disabled={isReadOnly}
                  onClick={handleSubmit(onSubmit("submitted"))}
                  // disabled={
                  //   rfqStatus === "auctioned" || formType === "submitted"
                  // }
                />
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRfq;
