import React, { useState } from "react";
import { Dropdown } from "primereact/dropdown";
import { Checkbox } from "primereact/checkbox";
import { Button } from "primereact/button";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { InputNumber } from "primereact/inputnumber";
import PackageDimensionsForm from "./PackageDimensionsForm";

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

const currencies = [
  { label: "USD", value: "usd" },
  { label: "INR", value: "inr" },
  { label: "Euro", value: "euro" },
];

const cargoTypes = [
  { label: "General", value: "general" },
  { label: "Hazardous", value: "hazardous" },
];

const charges = [
  "Ocean Freight",
  "VGM",
  "ENS",
  "BL Fee",
  "Local Pick Up",
  "Customs Clearance",
  "CFS charges",
  "Insurance",
  "Survey Fee",
  "MUC",
  "THC",
  "Weighment & MUC",
  "DAP Charges",
  "Admin charges",
  "ISPS",
  "Peak Season Surcharge",
  "Seal charges",
  "Non- Stackable Charges",
  "AMS",
  "Security Manifest Documentation",
  "CO2 Emissions",
  "Port Charges",
  "Inland Transportation",
];

const bidDetails = [
  "Shipping Line",
  "Bid Validity",
  "Transit Time",
  "Sailing Schedule",
  "Detension Free Time",
  "Trans Shipment Via",
  "Cut-Off Date",
  "ETD Date",
];

const QuotingChargesBlock = () => {
  const [selectedMode, setSelectedMode] = useState(null);
  const [selectedCargoType, setSelectedCargoType] = useState(null);
  const [selectedCharges, setSelectedCharges] = useState([]);
  const [selectedBidDetails, setSelectedBidDetails] = useState([]);

  const { control, register, handleSubmit, watch } = useForm({
    defaultValues: {
      rfq_items: [{ item_name: "", quantity: 0, unit: "", target_price: 0 }],
    },
  });

  const watchMode = watch("mode");

  const toggleSelection = (val, selected, setter) => {
    if (selected.includes(val)) {
      setter(selected.filter((c) => c !== val));
    } else {
      setter([...selected, val]);
    }
  };

  return (
    <div className="p-3 surface-section border-round shadow-1">
      <div className="grid mb-3">
        <div className="col-12 md:col-3">
          <label>Mode</label>
          <Controller
            control={control}
            name="mode"
            render={({ field }) => (
              <Dropdown {...field} options={modeOptions} className="w-full" />
            )}
          />
        </div>

        <div className="col-12 md:col-6">
          <label className="block mb-1 font-medium">Cargo Type</label>
          <Dropdown
            value={selectedCargoType}
            options={cargoTypes}
            onChange={(e) => setSelectedCargoType(e.value)}
            placeholder="Select Cargo Type"
            className="w-full"
          />
        </div>
      </div>

      {watch("mode") === "fcl" && (
        <div className="grid mb-3 mt-3">
          <div className="col-12 md:col-2 mr-2">
            <div class="p-inputgroup">
              <input
                class="p-inputtext p-component"
                placeholder="0"
                data-pc-name="inputtext"
                data-pc-section="root"
                fdprocessedid="g2m2xs"
              />
              <button
                aria-label="Search"
                class="p-button p-component"
                data-pc-name="button"
                data-pc-section="root"
                fdprocessedid="4buovf"
              >
                <span class="p-button-label p-c" data-pc-section="label">
                  20 Feet
                </span>
              </button>
            </div>
          </div>
          <div className="col-12 md:col-2 mr-2">
            <div class="p-inputgroup">
              <input
                class="p-inputtext p-component"
                placeholder="0"
                data-pc-name="inputtext"
                data-pc-section="root"
                fdprocessedid="g2m2xs"
              />
              <button
                aria-label="Search"
                class="p-button p-component"
                data-pc-name="button"
                data-pc-section="root"
                fdprocessedid="4buovf"
              >
                <span class="p-button-label p-c" data-pc-section="label">
                  40 Feet
                </span>
              </button>
            </div>
          </div>

          <div className="col-12 md:col-2 mr-2">
            <div class="p-inputgroup">
              <input
                class="p-inputtext p-component"
                placeholder="0"
                data-pc-name="inputtext"
                data-pc-section="root"
                fdprocessedid="g2m2xs"
              />
              <button
                aria-label="Search"
                class="p-button p-component"
                data-pc-name="button"
                data-pc-section="root"
                fdprocessedid="4buovf"
              >
                <span class="p-button-label p-c" data-pc-section="label">
                  45 Feet
                </span>
              </button>
            </div>
          </div>

          <div className="col-12 md:col-2 mr-2">
            <div class="p-inputgroup">
              <input
                class="p-inputtext p-component"
                placeholder="0"
                data-pc-name="inputtext"
                data-pc-section="root"
                fdprocessedid="g2m2xs"
              />
              <button
                aria-label="Search"
                class="p-button p-component"
                data-pc-name="button"
                data-pc-section="root"
                fdprocessedid="4buovf"
              >
                <span class="p-button-label p-c" data-pc-section="label">
                  ISO Tank
                </span>
              </button>
            </div>
          </div>

          <div className="col-12 md:col-2">
            <div class="p-inputgroup">
              <input
                class="p-inputtext p-component"
                placeholder="0"
                data-pc-name="inputtext"
                data-pc-section="root"
                fdprocessedid="g2m2xs"
              />
              <button
                aria-label="Search"
                class="p-button p-component"
                data-pc-name="button"
                data-pc-section="root"
                fdprocessedid="4buovf"
              >
                <span class="p-button-label p-c" data-pc-section="label">
                  Flex Tank
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {watch("mode") === "fcl" && (
        <div className="flex justify-content-between align-items-center mb-3">
          <h5 className="m-0">Weight & Value</h5>
        </div>
      )}

      {watch("mode") === "fcl" && (
        <div className="grid formgrid p-fluid pt-4">
          <div className="field col-12 md:col-4">
            <label>Total Weight (In Unit)</label>
            <InputNumber className="w-full" />
          </div>
          <div className="field col-12 md:col-4">
            <label>Total Weight (In CBM)</label>
            <InputNumber className="w-full" />
          </div>

          <div className="field col-12 md:col-4">
            <label>Value of Shipment</label>
            <div className="flex gap-2">
              <InputNumber className="w-full" />
              <Dropdown
                className="w-full"
                options={currencies}
                placeholder="Currency"
              />
            </div>
          </div>
        </div>
      )}

      {watch("mode") === "lcl" && (
        <PackageDimensionsForm mode={watch("mode")} />
      )}

      <div className="flex justify-content-between align-items-center mb-2">
        <h5 className="m-0">Required Charges to be Quoted</h5>
        <div className="ml-auto">
          <Button
            label="Add Charges"
            icon="pi pi-plus"
            className="p-button-sm p-button-success"
          />
        </div>
      </div>
      <div className="grid">
        {charges.map((charge, idx) => (
          <div className="col-6 md:col-3 lg:col-2 mt-3" key={idx}>
            <Checkbox
              inputId={`charge_${idx}`}
              checked={selectedCharges.includes(charge)}
              onChange={() =>
                toggleSelection(charge, selectedCharges, setSelectedCharges)
              }
            />
            <label htmlFor={`charge_${idx}`} className="ml-2">
              {charge}
            </label>
          </div>
        ))}
      </div>

      <div className="flex justify-content-between align-items-center mt-4 mb-2">
        <h5 className="m-0">Additional Bid Details</h5>
        <div className="ml-auto">
          <Button
            label="Add Additional Bid Details"
            icon="pi pi-plus"
            className="p-button-sm p-button-success"
          />
        </div>
      </div>
      <div className="grid">
        {bidDetails.map((detail, idx) => (
          <div className="col-6 md:col-3 lg:col-2 mt-3" key={idx}>
            <Checkbox
              inputId={`bidDetail_${idx}`}
              checked={selectedBidDetails.includes(detail)}
              onChange={() =>
                toggleSelection(
                  detail,
                  selectedBidDetails,
                  setSelectedBidDetails
                )
              }
            />
            <label htmlFor={`bidDetail_${idx}`} className="ml-2">
              {detail}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuotingChargesBlock;
