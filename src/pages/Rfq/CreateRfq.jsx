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
import { useApi } from "../../utils/requests";
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
  { label: "Company", value: "company" },
];

const movementTypes = [
  { label: "Door To Door", value: "door_to_door" },
  { label: "Port To Port", value: "port_to_port" },
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

// const countryCurrencyMap = {
//   India: "INR",
//   USA: "USD",
//   Germany: "EUR",
//   UK: "GBP",
//   Japan: "JPY",
// };

const countryCurrencyMap = {
  Afghanistan: "AFN",
  Albania: "ALL",
  Asia: "AS",
  Africa: "AF",
  Algeria: "DZD",
  Andorra: "EUR",
  Angola: "AOA",
  Argentina: "ARS",
  Armenia: "AMD",
  Aruba: "AWG",
  Australia: "AUD",
  Austria: "EUR",
  Azerbaijan: "AZN",
  Bahamas: "BSD",
  Bahrain: "BHD",
  Bangladesh: "BDT",
  Barbados: "BBD",
  Belarus: "BYN",
  Belgium: "EUR",
  Belize: "BZD",
  Benin: "XOF",
  Bermuda: "BMD",
  Bhutan: "BTN",
  Bolivia: "BOB",
  "Bosnia and Herzegovina": "BAM",
  Botswana: "BWP",
  Brazil: "BRL",
  Brunei: "BND",
  Bulgaria: "BGN",
  "Burkina Faso": "XOF",
  Burundi: "BIF",
  "Cabo Verde": "CVE",
  Cambodia: "KHR",
  Cameroon: "XAF",
  Canada: "CAD",
  "Central African Republic": "XAF",
  Chile: "CLP",
  China: "CNY",
  Colombia: "COP",
  "Costa Rica": "CRC",
  Croatia: "HRK",
  Cuba: "CUP",
  Curaçao: "ANG",
  Cyprus: "EUR",
  Czechia: "CZK",
  Denmark: "DKK",
  Djibouti: "DJF",
  Dominica: "XCD",
  "Dominican Republic": "DOP",
  Ecuador: "USD",
  Egypt: "EGP",
  Europe: "EU",
  "El Salvador": "USD",
  Estonia: "EUR",
  Eswatini: "SZL",
  Ethiopia: "ETB",
  Fiji: "FJD",
  France: "EUR",
  Gabon: "XAF",
  Gulf: "GF",
  Gambia: "GMD",
  Georgia: "GEL",
  Germany: "EUR",
  Ghana: "GHS",
  Greece: "EUR",
  Grenada: "XCD",
  Guatemala: "GTQ",
  Guinea: "GNF",
  "Guinea-Bissau": "XOF",
  Guyana: "GYD",
  Haiti: "HTG",
  Honduras: "HNL",
  "Hong Kong": "HKD",
  Hungary: "HUF",
  Iceland: "ISK",
  India: "INR",
  Indonesia: "IDR",
  Iran: "IRR",
  Iraq: "IQD",
  Ireland: "EUR",
  Israel: "ILS",
  Italy: "EUR",
  Jamaica: "JMD",
  Japan: "JPY",
  Jordan: "JOD",
  Kazakhstan: "KZT",
  Kenya: "KES",
  Kuwait: "KWD",
  Kyrgyzstan: "KGS",
  Laos: "LAK",
  Lebanon: "LBP",
  Lesotho: "LSL",
  Liberia: "LRD",
  Libya: "LYD",
  Liechtenstein: "CHF",
  Lithuania: "EUR",
  Luxembourg: "EUR",
  Macao: "MOP",
  Mediterranean: "MED",
  Madagascar: "MGA",
  Malawi: "MWK",
  Malaysia: "MYR",
  Maldives: "MVR",
  Mali: "XOF",
  Malta: "EUR",
  Mauritania: "MRU",
  Mauritius: "MUR",
  Mexico: "MXN",
  Moldova: "MDL",
  Monaco: "EUR",
  Mongolia: "MNT",
  Montenegro: "EUR",
  Morocco: "MAD",
  Mozambique: "MZN",
  Myanmar: "MMK",
  Namibia: "NAD",
  Nepal: "NPR",
  Netherlands: "EUR",
  "New Zealand": "NZD",
  Nicaragua: "NIO",
  Niger: "XOF",
  Nigeria: "NGN",
  "North Korea": "KPW",
  "North Macedon**ia**": "MKD",
  Norway: "NOK",
  Oman: "OMR",
  Oceania: "OC",
  Pakistan: "PKR",
  Panama: "PAB",
  Paraguay: "PYG",
  Peru: "PEN",
  Philippines: "PHP",
  Poland: "PLN",
  Portugal: "EUR",
  Qatar: "QAR",
  Romania: "RON",
  Russia: "RUB",
  Rwanda: "RWF",
  "Saudi Arabia": "SAR",
  Senegal: "XOF",
  Serbia: "RSD",
  Seychelles: "SCR",
  "Sierra Leone": "SLL",
  Singapore: "SGD",
  Slovakia: "EUR",
  Slovenia: "EUR",
  "Solomon Islands": "SBD",
  Somalia: "SOS",
  "South Africa": "ZAR",
  "South Korea": "KRW",
  "South Sudan": "SSP",
  Spain: "EUR",
  "Sri Lanka": "LKR",
  Sudan: "SDG",
  Suriname: "SRD",
  Sweden: "SEK",
  Switzerland: "CHF",
  Syria: "SYP",
  Taiwan: "TWD",
  Tajikistan: "TJS",
  Tanzania: "TZS",
  Thailand: "THB",
  Togo: "XOF",
  Tonga: "TOP",
  "Trinidad and Tobago": "TTD",
  Tunisia: "TND",
  Turkey: "TRY",
  Turkmenistan: "TMT",
  Uganda: "UGX",
  Ukraine: "UAH",
  "United States East Coast": "USEC",
  "United Arab Emirates": "AED",
  "United Kingdom": "GBP",
  "United States": "USD",
  Uruguay: "UYU",
  Uzbekistan: "UZS",
  Vanuatu: "VUV",
  Venezuela: "VES",
  Vietnam: "VND",
  Yemen: "YER",
  Zambia: "ZMW",
  Zimbabwe: "ZWL",
};

// const currencyOptions = [
//   { label: "INR - Indian Rupee ₹", value: "INR" },
//   { label: "USD - US Dollar $", value: "USD" },
//   { label: "EUR - Euro €", value: "EUR" },
//   { label: "GBP - British Pound £", value: "GBP" },
//   { label: "JPY - Japanese Yen ¥", value: "JPY" },
// ];

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
  { label: "Forward", value: "forward" },
  { label: "Reverse", value: "reverse" },
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
  {
    label: "Paithan",
    value: "Paithan",
    address: `Ajanta Pharma Ltd.
Plant No. B-4/5/6
MIDC Area, Paithan
Aurangabad - 431 148.`,
  },
  {
    label: "Dahej",
    value: "Dahej",
    address: `AJANTA PHARMA LIMITED
SEZ - DAHEJ PLOT NO. Z/103/A,
SEZ-II, DAHEJ SEZ LIMITED,
VILLAGE-DAHEJ,
TAL.-VAGRA, DIST-BHARUCH,
GUJARAT-392130.`,
  },
  {
    label: "CWH",
    value: "CWH",
    address: `AJANTA PHARMA LTD
Gut No.378, Plot No.36,37
11 KM Stone, Aurangabad-Pune Highway, Waluj
Aurangabad- 431 113 (M.S.)`,
  },
  {
    label: "Pithampur",
    value: "Pithampur",
    address: `AJANTA PHARMA LIMITED
PLOT NO. M-55-56-57 INDORE SPECIAL ECONOMIC ZONE (ISEZ)
PHASE II – PITHAMPUR
DHAR - M.P - 454775`,
  },
  {
    label: "Non SEZ Mumbai Port",
    value: "NonSEZMumbaiPort",
    address: `Non SEZ Mumbai Port`,
  },
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

// const currencyOptions = [
//   { label: "USD", value: "USD" },
//   { label: "INR", value: "INR" },
//   { label: "EUR", value: "EUR" },
// ];

const CreateRfq = () => {
  const { postData, getData } = useApi();
  const usert = useSelector((state) => state.auth.user);
  //console.log("Current User:", usert);
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
  //console.log("source value", source);

  //const [customFactory, setCustomFactory] = useState("");
  const [customClearance, setCustomClearance] = useState("");

  const vendorsdonwloaded = useSelector((state) => state.vendors.data);
  //console.log("vendorsdonwloaded data", vendorsdonwloaded);

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
  const [formParsedData, setFormParsedData] = useState([]);

  const localSectionRef = useRef(null);
  const airSectionRef = useRef(null);
  const seaSectionRef = useRef(null);
  const submitSource = useRef("submit");
  const [formType, setFormType] = useState("draft");
  const [packageDimensions, setPackageDimensions] = useState([]);
  const [auctionType, setAuctionType] = useState("");
  const [type, setType] = useState("");
  const [rfqStatus, setRFQStatus] = useState("");
  const [currency, setCurrency] = useState("");
  const [dapCurrency, setDapCurrency] = useState("");

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
    temperature: null,
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
        manual_total_gross_weight: 0,
        total_cartons: 0,
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
        if (matched?.currency) {
          setCurrency(matched.currency);
        }
        if (matched?.dapCurrency) {
          setCurrency(matched.dapCurrency);
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
            preshipmentnumber: matched.buyer.preshipmentnumber || "",
            postshipmentnumber: matched.buyer.postshipmentnumber || "",
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
    // console.log(
    //   "roadTransportDataWithMetrics values::",
    //   roadTransportDataWithMetrics
    // );
    setValue("road_transport_summary", roadTransportDataWithMetrics);
  };

  const openDate = useWatch({ control, name: "open_date_time" });

  const selectedIndustry = useWatch({ control, name: "industry" });

  const subIndustriesOptions = defaultSubIndustries[selectedIndustry] || [];

  const selectedCountry = useWatch({ control, name: "country" });

  const totalGrossWeight = watch("package_summary.totalGrossWeight");

  // useEffect(() => {
  //   const currency = countryCurrencyMap[selectedCountry];
  //   if (currency) {
  //     setValue("currency", currency); // auto-set currency
  //   }
  // }, [selectedCountry, setValue]);

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
  const watchTemperatureType = watch("temperature");
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
      const formDataBuilt = buildParsedDataFromForm();
      //console.log("Form Parsed Data:", formDataBuilt);

      //console.log("Form Data:", data);
      //console.log("formType:", formType);
      submitSource.current = formType;
      if (submitSource.current === "next") {
        //console.log("Validated current step → going to next step");
        goNext();
      }

      if (
        submitSource.current === "submitted" ||
        submitSource.current === "draft"
      ) {
        //console.log("Selected Charges:", selectedCharges);
        const generatedRfqNumber = rfqNumber?.trim()
          ? rfqNumber
          : `RFQ_${Math.floor(100000 + Math.random() * 900000)}`;
        //console.log("Generated RFQ Number:", generatedRfqNumber);
        //console.log("source value:", source);
        // console.log(
        //   "submitSource value:",
        //   ["auction", "reverse", "forward"].includes(source)
        // );

        const abc = ["auction", "reverse", "forward"].includes(source)
          ? generatedRfqNumber.replace(/^RFQ_/, "AUC_")
          : "";

        //console.log("Auction Number:", abc);

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
                  //factory_location: data.factory_location,
                  factory_location: Array.isArray(data.factory_location)
                    ? data.factory_location.map((loc) => {
                        const match = factoryOptions.find(
                          (f) => f.value === loc
                        );
                        return match
                          ? { city: loc, address: match.address }
                          : { city: loc, address: "" };
                      })
                    : (() => {
                        const match = factoryOptions.find(
                          (f) => f.value === data.factory_location
                        );
                        return match
                          ? {
                              city: data.factory_location,
                              address: match.address,
                            }
                          : { city: data.factory_location, address: "" };
                      })(),
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
          //shipment_details: parsedData,
          shipment_details: parsedData.length > 0 ? parsedData : formDataBuilt,
        };

        rfqJson.form_type = formType;

        // if (
        //   rfqJson.shipment_details[0]?.package_summary &&
        //   rfqJson.shipment_details[0]?.package_summary
        //     .manual_total_gross_weight == null
        // ) {
        //   alert("⚠️ Manual Total Gross Weight is required!");
        //   return;
        // }

        //console.log("RFQ JSON:", rfqJson);

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

          //console.log("formData value", formData);

          try {
            const result = await postData("rfqs", formData);

            if (!result?.isSuccess && result?.msg) {
              return dispatch(toastError({ detail: result.msg }));
            }

            dispatch(toastSuccess({ detail: "RFQ Created Successfully.." }));
            navigate("/rfqs");
          } catch (err) {
            console.error("Error creating RFQ:", err);
          }
        } catch (error) {
          //console.error("Error creating rfq:", error);
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

  // const onUpload = (e) => {
  //   const uploadedFiles = e.files || [];

  //   setFiles((prevFiles) => {
  //     const allFiles = [...prevFiles, ...uploadedFiles];
  //     const uniqueFiles = Array.from(
  //       new Map(allFiles.map((f) => [f.name, f])).values()
  //     );
  //     return uniqueFiles;
  //   });
  // };

  const removeFile = (name) => {
    setFiles((prev) => prev.filter((f) => f.name !== name));
  };

  const [selectedVendorIds, setSelectedVendorIds] = useState([]);
  const [selectedIndustryFilters, setSelectedIndustryFilters] = useState([]);
  const [selectedProductFilters, setSelectedProductFilters] = useState([]);
  const [selectedCompanyFilters, setSelectedCompanyFilters] = useState([]);

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
  const companyfilt = Array.from(
    new Set(vendorsCleaned.map((v) => v.company).filter(Boolean))
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

    if (selectedVendorType === "company") {
      return (
        selectedCompanyFilters.length === 0 ||
        selectedCompanyFilters.includes(vendor.company)
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

  const buildParsedDataFromForm = () => {
    const temp = watch("temperature");
    const country = watch("country_exp_air");
    const factory = watch("factoryLocation");
    const clearance = watch("customs_clearance_location");
    const deliveryTerms = watch("delivery_terms");
    const pickupByFf = watch("pickup_by_ff_exp_air");
    const commodity = watch("commodity");
    const hsCode = watch("hs_code");
    const consignee = watch("door_delivery_address");
    const incoterm = watch("incoterm_exp_air");
    const notes = watch("new_notes");
    const newData = [
      {
        Temp: temp,
        Country: country,
        Factory: factory,
        Clearance: clearance,
        DeliveryTerms: deliveryTerms,
        FFPickup: pickupByFf,
        Commodity: commodity,
        HSCode: hsCode,
        Consignee: consignee,
        Incoterm: incoterm,
        Notes: notes,
        package_summary: watch("package_summary"),
      },
    ];
    setFormParsedData(newData);
    return newData;
  };

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
              manual_total_gross_weight: 0,
              total_cartons: 0,
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

      //console.log("Parsed Shipments:", shipments);
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

              {/* <div className="col-12 md:col-3">
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
              )} */}

              <div className="col-12 md:col-3">
                <label>Country</label>
                <Controller
                  control={control}
                  name="country"
                  disabled={isReadOnly}
                  render={({ field }) => (
                    <Dropdown
                      {...field}
                      options={Object.keys(countryCurrencyMap).map(
                        (country) => ({
                          label: country,
                          value: country,
                        })
                      )}
                      placeholder="Select Country"
                      className="w-full"
                      filter
                      filterBy="label"
                      //showClear
                    />
                  )}
                />
              </div>

              {source && selectedCountry && (
                <div className="formgrid grid">
                  <div className="col-12 md:col-6">
                    <label htmlFor="currency">Bid Currency</label>
                    <Controller
                      name="currency"
                      control={control}
                      render={({ field }) => (
                        <Dropdown
                          {...field}
                          id="currency"
                          options={currencyOptions}
                          className="w-full"
                          disabled={isReadOnly}
                          placeholder="Select Currency"
                          //disabled={true} // Make read-only
                          filter
                          filterBy="label"
                          //showClear
                        />
                      )}
                    />
                  </div>
                  <div className="col-12 md:col-6">
                    <label htmlFor="currency">DAP Currency Charges</label>
                    <Controller
                      name="dapCurrency"
                      control={control}
                      render={({ field }) => (
                        <Dropdown
                          {...field}
                          id="dapCurrency"
                          disabled={isReadOnly}
                          options={currencyOptions}
                          className="w-full"
                          placeholder="Select Currency"
                          //disabled={true} // Make read-only
                          filter
                          filterBy="label"
                          showClear
                        />
                      )}
                    />
                  </div>
                </div>
              )}

              <div className="col-12 md:col-3">
                <label>Open Date</label>
                <Controller
                  control={control}
                  name="open_date_time"
                  render={({ field }) => (
                    <Calendar
                      {...field}
                      className="w-full"
                      showTime
                      showIcon
                      dateFormat="dd/mm/yy"
                    />
                  )}
                />
              </div>
              <div className="col-12 md:col-3">
                <label>Close Date</label>
                <Controller
                  control={control}
                  name="close_date_time"
                  render={({ field }) => (
                    <Calendar
                      {...field}
                      className="w-full"
                      showTime
                      showIcon
                      dateFormat="dd/mm/yy"
                    />
                  )}
                />
              </div>

              {source && (
                <div className="field col-12 md:col-3">
                  <label>Select Auction Type</label>
                  <Controller
                    name="pickup_by_ff"
                    disabled={isReadOnly}
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
                                disabled={isReadOnly}
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
                        disabled={isReadOnly}
                        onChange={(e) => {
                          field.onChange(e.checked);
                          // if (e.checked) {
                          //   setValue("hide_current_bid_price", false);
                          //   dispatch(
                          //     toastError({
                          //       detail:
                          //         "You cannot enable both Same Bid and Hide Bid together. Hiding disabled.",
                          //     })
                          //   );
                          // }
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
                        disabled={isReadOnly}
                        onChange={(e) => {
                          field.onChange(e.checked);
                          // if (e.checked) {
                          //   setValue("same_bid_price_allowed", false);
                          //   dispatch(
                          //     toastError({
                          //       detail:
                          //         "You cannot enable both Hide Bid and Same Bid. Same Bid disabled.",
                          //     })
                          //   );
                          // }
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
                        disabled={isReadOnly}
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
              {/* <InputText {...register("description")} className="w-full" /> */}
              <InputTextarea
                id="description"
                {...register("description")}
                rows={4}
                placeholder=""
                className="w-full"
              />
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
                    <label>Origin Port</label>
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
                  {/* <div className="field col-12 md:col-4">
                    <label>Stuffing Location</label>
                    <Controller
                      name="stuffing_location"
                      control={control}
                      render={({ field }) => (
                        <MultiSelect
                          {...field}
                          value={
                            Array.isArray(field.value)
                              ? field.value
                              : field.value
                              ? [field.value]
                              : []
                          }
                          options={[
                            { label: "Mumbai", value: "Mumbai" },
                            { label: "Chennai", value: "Chennai" },
                            { label: "Delhi", value: "Delhi" },
                            { label: "Kolkata", value: "Kolkata" },
                            { label: "Hyderabad", value: "Hyderabad" },
                          ]}
                          placeholder="Select Stuffing Locations"
                          display="chip"
                          className="w-full"
                        />
                      )}
                    />
                  </div> */}

                  <div className="field col-12 md:col-4">
                    <label>Destination Port</label>
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
                {/* {parsedData.length > 0 ? (
                  <DataStepperForm
                    data={parsedData}
                    setData={setParsedData}
                    setValue={setValue}
                    type={"air"}
                    isReadOnly={isReadOnly}
                  />
                ) : ( */}
                <div className="grid formgrid p-fluid">
                  <div className="field col-4">
                    <label>Temp To be Maintained</label>
                    <InputText
                      {...register("temperature")}
                      className="w-full"
                    />
                  </div>
                  <div className="field col-12 md:col-2">
                    {/* <label>Country</label>
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
                      /> */}

                    {/* <label>Country</label>
                    <Controller
                      control={control}
                      name="country_exp_air"
                      disabled={isReadOnly}
                      render={({ field }) => (
                        <Dropdown
                          {...field}
                          options={Object.keys(countryCurrencyMap).map(
                            (country) => ({
                              label: country,
                              value: country,
                            })
                          )}
                          placeholder="Select Country"
                          className="w-full"
                          filter
                          filterBy="label"
                          //showClear
                        />
                      )}
                    /> */}
                  </div>
                  <div className="field col-12 md:col-3">
                    <label>Stuffing Location(s)</label>
                    <Controller
                      control={control}
                      name="factoryLocation"
                      render={({ field }) => (
                        <>
                          <MultiSelect
                            {...field}
                            value={
                              Array.isArray(field.value)
                                ? field.value
                                : field.value
                                ? [field.value]
                                : []
                            }
                            options={factoryOptions}
                            placeholder="Select Stuffing Locations"
                            display="chip"
                            className="w-full mb-2"
                            onChange={(e) => {
                              field.onChange(e.value);
                              if (!e.value?.includes("Others")) {
                                setCustomFactory("");
                              }
                            }}
                          />
                          {Array.isArray(field.value) &&
                            field.value.length > 0 && (
                              <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                                {field.value.map((val, idx) => {
                                  const factory = factoryOptions.find(
                                    (opt) => opt.value === val
                                  );
                                  return (
                                    <div
                                      key={idx}
                                      className="p-2 border rounded shadow-sm bg-gray-50"
                                    >
                                      <strong>{factory?.label}:</strong>{" "}
                                      {factory?.address}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                        </>
                      )}
                    />
                  </div>

                  <div className="field col-12 md:col-3">
                    <label>Customs Clearance Location(s)</label>
                    <Controller
                      control={control}
                      name="customs_clearance_location"
                      render={({ field }) => (
                        <>
                          <MultiSelect
                            {...field}
                            value={
                              Array.isArray(field.value)
                                ? field.value
                                : field.value
                                ? [field.value]
                                : []
                            }
                            options={factoryOptions}
                            placeholder="Select Customs Locations"
                            display="chip"
                            className="w-full mb-2"
                            onChange={(e) => {
                              field.onChange(e.value);
                              if (!e.value?.includes("Others")) {
                                setCustomClearance("");
                              }
                            }}
                          />
                          {Array.isArray(field.value) &&
                            field.value.length > 0 && (
                              <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                                {field.value.map((val, idx) => {
                                  const factory = factoryOptions.find(
                                    (opt) => opt.value === val
                                  );
                                  return (
                                    <div
                                      key={idx}
                                      className="p-2 border rounded shadow-sm bg-gray-50"
                                    >
                                      <strong>{factory?.label}:</strong>{" "}
                                      {factory?.address}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                        </>
                      )}
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

                  {/* <div className="field col-4">
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
                    <InputTextarea
                      {...register("new_notes")}
                      rows={4}
                      className="w-full"
                    />
                  </div> */}
                </div>
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
                      isReadOnly={isReadOnly}
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

          {watch("subindustry") === "Air Cargo" && (
            <div className="grid formgrid p-fluid">
              <fieldset
                disabled={isReadOnly}
                style={{ border: "none", padding: 0, margin: 0 }}
              >
                <PackageDimensionsForm
                  mode={watch("transport_mode")}
                  country={selectedCountry}
                  onPackagesChange={handlePackagesChange}
                  existingPackages={watch("package_summary")}
                  manualGrossWeight={
                    watch("package_summary")?.manual_total_gross_weight
                  }
                  valueOfShipment={watch("package_summary")?.value_of_shipment}
                  shipmentCurrency={watch("package_summary")?.shipment_currency}
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

                  {/* <div className="col-12 md:col-2">
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
                  </div> */}

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

                  {/* <div className="col-12 md:col-2">
                    <label className="mr-2">Notes</label>
                    <InputTextarea
                      id="req_quote_notes"
                      {...register("req_quote_notes")}
                      rows={4}
                      placeholder="Write Note"
                      className="w-full"
                    />
                  </div> */}
                </div>

                {/* <div className="mt-3 text-right">
                  <Button
                    label="Add Charges"
                    icon="pi pi-plus"
                    className="p-button-sm"
                  />
                </div> */}
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

                  {/* <div className="col-12 md:col-2">
                    <label className="mr-2">Notes</label>
                    <InputTextarea
                      id="notes"
                      {...register("notes")}
                      rows={4}
                      placeholder="Write Note"
                      className="w-full"
                    />
                  </div> */}
                </div>

                {/* <div className="mt-3 text-right">
                  <Button
                    label="Add Additional Bid Details"
                    icon="pi pi-plus"
                    className="p-button-sm p-button-outlined"
                  />
                </div> */}
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

          {/* {(watch("subindustry") === "Air Cargo" ||
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
          )} */}

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
                <h5 className="mb-3">Attached Files: {files.length}</h5>
                <ul className="list-none m-0 p-0">
                  {files.map((file, idx) => (
                    <li
                      key={idx}
                      className="flex justify-content-between align-items-center p-2 border-bottom-1 border-gray-300"
                    >
                      <a
                        href={`http://127.0.0.1:9000/uploads/rfq/${encodeURIComponent(
                          file.name
                        )}`}
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

      {activeIndex === 3 && !isReadOnly && (
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
                  setSelectedCompanyFilters([]);
                  if (e.value === "air") {
                    console.log("type of vendor", e.value);
                    setSelectedIndustryFilters(["air"]);
                  }
                  if (e.value === "ocean") {
                    console.log("type of vendor", e.value);
                    setSelectedIndustryFilters(["ocean"]);
                  }
                  if (e.value === "company") {
                    console.log("type of vendor", e.value);
                    //setSelectedCompanyFilters(["company"]);
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

              {selectedVendorType === "company" && (
                <MultiSelect
                  value={selectedCompanyFilters}
                  options={companyfilt.map((prod) => ({
                    label: prod,
                    value: prod,
                  }))}
                  onChange={(e) => setSelectedCompanyFilters(e.value)}
                  placeholder="Select Company"
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

                <div className="field col-12 md:col-6">
                  <label htmlFor="preshipmentnumber">Pre Shipment Number</label>
                  <InputText
                    id="preshipmentnumber"
                    value={buyer.preshipmentnumber}
                    onChange={(e) =>
                      updateField("preshipmentnumber", e.target.value)
                    }
                  />
                </div>

                <div className="field col-12 md:col-6">
                  <label htmlFor="postshipmentnumber">
                    Post Shipment Number
                  </label>
                  <InputText
                    id="postshipmentnumber"
                    value={buyer.postshipmentnumber}
                    onChange={(e) =>
                      updateField("postshipmentnumber", e.target.value)
                    }
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
                  onClick={handleSubmit(onSubmit("submitted"))}
                  disabled={
                    rfqStatus === "auctioned" ||
                    formType === "submitted" ||
                    isReadOnly
                  }
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
