import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { getData } from "../../utils/requests";
import * as XLSX from "xlsx";

const unitOptions = [
  { label: "CM", value: "cm" },
  { label: "IN", value: "in" },
];

const weightUnits = [
  { label: "KG", value: "kg" },
  { label: "LB", value: "lb" },
];

const packageTypes = [
  { label: "Box", value: "box" },
  { label: "Pallets", value: "pallets" },
  { label: "Crate", value: "crate" },
];

const currencyOptions = [
  { label: "Indian Rupee", value: "INR" },
  { label: "US Dollar", value: "USD" },
  { label: "Euro", value: "EUR" },
  { label: "British Pound", value: "GBP" },
];

const volumetricFactor = 6000;

const PackageDimensionsForm = ({
  mode,
  country,
  onPackagesChange,
  existingPackages = {},
  manualGrossWeight,
  valueOfShipment,
  shipmentCurrency,
}) => {
  console.log("mode value is", mode);
  console.log("exising pacakge details", existingPackages);
  const usert = useSelector((state) => state.auth.user);
  const role = usert.role;
  const isReadOnly = role === "vendor";
  const [value_of_shipment, setValueOfShipment] = useState(0);
  const [manual_total_gross_weight, setManualTotalGrossWeight] = useState(null);
  //const [total_cartons, setTotalCartons] = useState(null);
  const [shipment_currency, setShipmentCurrency] = useState(null);
  const [previousAuctions, setPreviousAuctions] = useState([]);
  const [packages, setPackages] = useState(() =>
    existingPackages.packages?.length
      ? existingPackages.packages
      : [
          {
            number: 0,
            type: "",
            length: "",
            breadth: "",
            height: "",
            dim_unit: "cm",
            gross_weight: "",
            weight_unit: "kg",
          },
        ]
  );

  useEffect(() => {
    if (existingPackages?.packages?.length > 0) {
      setPackages(existingPackages.packages);
    }
  }, [existingPackages]);

  useEffect(() => {
    if (existingPackages.manual_total_gross_weight) {
      console.log(
        "manualGrossWeight value in useEffect:",
        existingPackages.manual_total_gross_weight
      );
      setManualTotalGrossWeight(existingPackages.manual_total_gross_weight);
    }
  }, [existingPackages.manual_total_gross_weight]);

  useEffect(() => {
    if (existingPackages.value_of_shipment) {
      setValueOfShipment(existingPackages.value_of_shipment);
    }
  }, [existingPackages.value_of_shipment]);
  useEffect(() => {
    if (existingPackages.shipment_currency) {
      setShipmentCurrency(existingPackages.shipment_currency);
    }
  }, [existingPackages.shipmentCurrency]);
  // useEffect(() => {
  //   if (totalCartons) {
  //     setTotalCartons(totalCartons);
  //   }
  // }, [totalCartons]);

  const [freightRatePerKg, setFreightRatePerKg] = useState(0);

  const previousPackagesRef = useRef();

  useEffect(() => {
    const totalCBM = packages
      .reduce((sum, pkg) => sum + parseFloat(calculateCBM(pkg)), 0)
      .toFixed(4);

    const totalVolumetricWeight = packages
      .reduce((sum, pkg) => sum + parseFloat(calculateVolumetricWeight(pkg)), 0)
      .toFixed(2);

    const totalGrossWeight = calculateTotalGrossWeight(packages);
    const totalCartons = calculateTotalCartons(packages);

    const dataToSend = {
      packages,
      value_of_shipment,
      manual_total_gross_weight,
      //total_cartons,
      shipment_currency,
      totalGrossWeight,
      volumetricFactor,
      totalVolumetricWeight,
      totalCBM,
    };

    const stringified = JSON.stringify(dataToSend);
    if (stringified !== JSON.stringify(previousPackagesRef.current)) {
      previousPackagesRef.current = dataToSend;
      onPackagesChange?.(dataToSend);
    }
  }, [
    packages,
    value_of_shipment,
    manual_total_gross_weight,
    //total_cartons,
    shipment_currency,
    onPackagesChange,
  ]);

  const handleChange = (index, field, value) => {
    const updated = [...packages];
    updated[index][field] = value;
    setPackages(updated);
  };

  const addPackage = () => {
    setPackages((prev) => [
      ...prev,
      {
        number: 0,
        type: "",
        length: "",
        breadth: "",
        height: "",
        dim_unit: "cm",
        gross_weight: "",
        weight_unit: "kg",
      },
    ]);
  };

  const removePackage = (index) => {
    setPackages((prev) => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
  };

  const calculateVolumetricWeight = (pkg) => {
    const l = parseFloat(pkg.length) || 0;
    const b = parseFloat(pkg.breadth) || 0;
    const h = parseFloat(pkg.height) || 0;
    const qty = parseFloat(pkg.number) || 0;
    return (((l * b * h) / volumetricFactor) * qty).toFixed(2);
  };

  const calculateCBM = (pkg) => {
    const l = parseFloat(pkg.length) || 0;
    const b = parseFloat(pkg.breadth) || 0;
    const h = parseFloat(pkg.height) || 0;
    const qty = parseFloat(pkg.number) || 0;

    return ((l * b * h * qty) / 1000000).toFixed(4);
  };

  const calculateTotalGrossWeight = (packages) => {
    return packages
      .reduce((sum, pkg) => {
        const qty = parseFloat(pkg.number) || 0;
        const weight = parseFloat(pkg.gross_weight) || 0;
        //return sum + qty * weight;
        return sum + weight;
      }, 0)
      .toFixed(2);
  };

  const calculateTotalCartons = (packages) => {
    return packages
      .reduce((sum, pkg) => {
        const qty = parseFloat(pkg.number) || 0;
        return sum + qty;
      }, 0)
      .toFixed(2);
  };

  const totalCBM = packages
    .reduce((sum, pkg) => sum + parseFloat(calculateCBM(pkg)), 0)
    .toFixed(4);

  const totalVolumetricWeight = packages
    .reduce((sum, pkg) => sum + parseFloat(calculateVolumetricWeight(pkg)), 0)
    .toFixed(2);

  const totalGrossWeight = calculateTotalGrossWeight(packages);
  const totalCartons = calculateTotalCartons(packages);

  const calculateChargeableWeight = (pkg) => {
    const gross = parseFloat(pkg.gross_weight) || 0;
    const vol = parseFloat(calculateVolumetricWeight(pkg)) || 0;
    return Math.max(gross, vol).toFixed(2);
  };

  const calculateAirFreightCost = (pkg) => {
    const chargeable = parseFloat(calculateChargeableWeight(pkg)) || 0;
    return (chargeable * freightRatePerKg).toFixed(2);
  };

  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);

      const formatted = data.map((row) => ({
        number: parseFloat(row["Number of Packages"] || 0),
        type:
          (row["Type"] &&
            packageTypes.find(
              (opt) => opt.label.toLowerCase() === row["Type"].toLowerCase()
            )?.value) ||
          "",
        length: parseFloat(row["Length"] || 0),
        breadth: parseFloat(row["Breadth"] || 0),
        height: parseFloat(row["Height"] || 0),
        dim_unit:
          (row["Dim Unit"] &&
            unitOptions.find(
              (opt) => opt.label.toLowerCase() === row["Dim Unit"].toLowerCase()
            )?.value) ||
          "",
        gross_weight: parseFloat(row["Gross Weight"] || 0),
        weight_unit:
          (row["Weight Unit"] &&
            weightUnits.find(
              (opt) =>
                opt.label.toLowerCase() === row["Weight Unit"].toLowerCase()
            )?.value) ||
          "",
      }));

      setPackages(formatted);
    };

    reader.readAsBinaryString(file);
  };

  const fileInputRef = useRef(null);

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleSampleDownload = () => {
    const fileUrl = "/sample/Package_Dimensions_Template.xlsx";
    const link = document.createElement("a");
    link.href = fileUrl;
    link.setAttribute("download", "Sample_Package_Dimensions_Template.xlsx");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCurrencyChange = (field, value, index = null) => {
    if (index !== null) {
      const updated = [...packages];
      updated[index][field] = value;
      setPackages(updated);
    } else {
      if (field === "value_of_shipment") setValueOfShipment(value);
      if (field === "manual_total_gross_weight")
        setManualTotalGrossWeight(value);
      if (field === "shipment_currency") setShipmentCurrency(value);
    }
  };

  useEffect(() => {
    if (country && totalGrossWeight && parseFloat(totalGrossWeight) !== 0) {
      console.log("selected totalGrossWeight value:", totalGrossWeight);
      console.log("selected country value is", country);
      const fetchPreviousAuctions = async () => {
        try {
          const data = await getData(
            `quotesummary/previous-auctions/${country}/${totalGrossWeight}`
          );
          console.log("Previous Auctions Data:", data);
          setPreviousAuctions(data);
        } catch (error) {
          console.error("Failed to fetch previous auctions data", error);
        }
      };
      fetchPreviousAuctions();
    }
  }, [country, totalGrossWeight]);

  return (
    <div className="p-2">
      <Card title="Package Dimensions" className="p-2">
        <div className="mb-3">
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleExcelUpload}
            ref={fileInputRef}
            style={{ display: "none" }}
          />
        </div>
        <div className="flex justify-content-between align-items-center mb-3">
          <h5 className="m-0">Weight & Value</h5>
          <div className="flex gap-2">
            <Button
              icon="pi pi-download"
              label="Sample File"
              className="p-button-sm p-button-info"
              onClick={handleSampleDownload}
              disabled={isReadOnly}
            />
            <Button
              icon="pi pi-upload"
              label="Upload Package Data"
              className="p-button-sm p-button-success"
              onClick={handleButtonClick}
              type="button"
              disabled={isReadOnly}
            />
          </div>
        </div>

        {/* <div className="col-12 md:col-3">
          <label>Freight Rate per Kg</label>
          <InputNumber
            value={freightRatePerKg}
            onValueChange={(e) => setFreightRatePerKg(e.value)}
            className="w-full"
            useGrouping={false}
          />
        </div> */}

        {packages.map((pkg, index) => (
          <div className="grid align-items-end mb-3" key={index}>
            <div className="col-12 md:col-2">
              <label>Qty & Type</label>
              <div className="p-inputgroup w-full">
                <InputNumber
                  value={pkg.number}
                  disabled={isReadOnly}
                  onValueChange={(e) => handleChange(index, "number", e.value)}
                  placeholder="Qty"
                  className="w-full"
                />
                <Dropdown
                  value={pkg.type}
                  options={packageTypes}
                  onChange={(e) => handleChange(index, "type", e.value)}
                  placeholder="Type"
                  className="w-10rem"
                  disabled={isReadOnly}
                />
              </div>
            </div>
            {/* <div className="col-12 md:col-2">
              <label>Type</label>
              <Dropdown
                value={pkg.type}
                options={packageTypes}
                onChange={(e) => handleChange(index, "type", e.value)}
                placeholder="Select"
                className="w-full"
              />
            </div> */}
            <div className="col-12 md:col-1">
              <label>L</label>
              <InputNumber
                value={pkg.length}
                disabled={isReadOnly}
                mode="decimal"
                minFractionDigits={2}
                onValueChange={(e) => handleChange(index, "length", e.value)}
                className="w-full"
              />
            </div>
            <div className="col-12 md:col-1">
              <label>B</label>
              <InputNumber
                value={pkg.breadth}
                disabled={isReadOnly}
                mode="decimal"
                minFractionDigits={2}
                onValueChange={(e) => handleChange(index, "breadth", e.value)}
                className="w-full"
              />
            </div>
            <div className="col-12 md:col-1">
              <label>H</label>
              <InputNumber
                value={pkg.height}
                disabled={isReadOnly}
                mode="decimal"
                minFractionDigits={2}
                onValueChange={(e) => handleChange(index, "height", e.value)}
                className="w-full"
              />
            </div>
            <div
              className="col-12"
              style={{ flexBasis: "8%", flexGrow: 0, flexShrink: 0 }}
            >
              <label>Dim Unit</label>
              <Dropdown
                value={pkg.dim_unit}
                options={unitOptions}
                onChange={(e) => handleChange(index, "dim_unit", e.value)}
                className="w-full"
                disabled={isReadOnly}
              />
            </div>
            <div className="col-12 md:col-2">
              <label>Gross Wt & Unit</label>
              <div className="p-inputgroup w-full">
                <InputNumber
                  value={pkg.gross_weight}
                  disabled={isReadOnly}
                  mode="decimal"
                  minFractionDigits={2}
                  onValueChange={(e) =>
                    handleChange(index, "gross_weight", e.value)
                  }
                  className="w-full"
                />
                <Dropdown
                  value={pkg.weight_unit}
                  options={weightUnits}
                  onChange={(e) => handleChange(index, "weight_unit", e.value)}
                  className="w-10rem"
                  disabled={isReadOnly}
                />
              </div>
            </div>
            <div className="col-12 md:col-1">
              <label>Vol. Wt</label>
              <InputNumber
                disabled={isReadOnly}
                value={calculateVolumetricWeight(pkg)}
                readOnly
                className="w-full"
              />
            </div>
            {/* <div className="col-12 md:col-1">
              <label>Chargeable Wt</label>
              <InputNumber
                value={calculateChargeableWeight(pkg)}
                readOnly
                className="w-full"
              />
            </div> */}

            {/* <div className="col-12 md:col-2">
              <label>Air Freight Cost</label>
              <InputNumber
                value={calculateAirFreightCost(pkg)}
                readOnly
                className="w-full"
              />
            </div> */}
            <div className="col-12 md:col-1">
              {index > 0 && (
                <Button
                  icon="pi pi-trash"
                  className="p-button-danger"
                  onClick={() => removePackage(index)}
                  disabled={isReadOnly}
                />
              )}
            </div>
          </div>
        ))}

        <Button
          icon="pi pi-plus"
          label="Add Package"
          onClick={addPackage}
          className="mt-3"
          disabled={isReadOnly}
        />

        <div className="grid mt-4">
          <div className="col-12 md:col-4">
            <label>Total Cartons / Pallets</label>
            <div className="p-inputgroup w-full">
              <InputNumber
                disabled={isReadOnly}
                value={totalCartons}
                //onValueChange={(e) => setTotalCartons(e.value)}
                className="w-25rem"
              />
            </div>
          </div>

          <div className="col-12 md:col-3">
            <label>Total Gross Weight Auto Calculated</label>
            <InputNumber
              disabled={isReadOnly}
              mode="decimal"
              minFractionDigits={2}
              value={totalGrossWeight}
              className="w-full"
            />
          </div>

          <div className="col-12 md:col-4">
            <label>Manual Total Gross Weight</label>
            <div className="p-inputgroup w-full">
              <InputNumber
                disabled={isReadOnly}
                value={manual_total_gross_weight}
                mode="decimal"
                onValueChange={(e) => setManualTotalGrossWeight(e.value)}
                minFractionDigits={2}
                className="w-25rem"
              />
            </div>
          </div>

          {/* {mode === "air" && ( */}
          <div className="col-12 md:col-3">
            <label>Volumetric Wt. Factor</label>
            <InputNumber
              disabled={isReadOnly}
              value={volumetricFactor}
              readOnly
              className="w-full"
            />
          </div>
          {/* )} */}

          {/* {mode === "air" && ( */}
          <div className="col-12 md:col-3">
            <label>Total Volumetric Weight</label>
            <div className="p-inputgroup w-full">
              <InputNumber
                disabled={isReadOnly}
                value={totalVolumetricWeight}
                mode="decimal"
                minFractionDigits={2}
                className="w-full"
              />
              <span className="p-inputgroup-addon">KG</span>
            </div>
          </div>
          {/* )} */}

          {/* {mode === "lcl" && ( */}
          <div className="col-12 md:col-3">
            <label>Total Weight (In CBM)</label>
            <InputNumber
              disabled={isReadOnly}
              value={totalCBM}
              className="w-full"
            />
          </div>
          {/* )} */}

          <div className="col-12 md:col-4">
            <label>Value of Shipment & Currency</label>
            <div className="p-inputgroup w-full">
              <InputNumber
                disabled={isReadOnly}
                value={value_of_shipment}
                mode="decimal"
                minFractionDigits={2}
                onValueChange={(e) =>
                  handleCurrencyChange("value_of_shipment", e.value)
                }
                className="w-25rem"
              />
              <Dropdown
                value={shipment_currency}
                options={currencyOptions}
                onChange={(e) =>
                  handleCurrencyChange("shipment_currency", e.value)
                }
                className="w-15rem"
                disabled={isReadOnly}
              />
            </div>
          </div>
        </div>
      </Card>
      {previousAuctions.length > 0 && (
        <Card title="Previous Auctions (Similar Weight)" className="p-3">
          <div className="flex flex-wrap gap-3">
            {previousAuctions.map((auction, index) => (
              <div
                key={index}
                className="p-3 border-round shadow-2 surface-card"
                style={{ width: "300px" }}
              >
                <p>
                  <strong>RFQ:</strong> {auction.rfq_number}
                </p>
                <p>
                  <strong>Shipment Number:</strong> {auction.shipment_number}
                </p>
                <p>
                  <strong>Weight:</strong> {auction.totalGrossWeight} kg
                </p>
                {auction.vendors?.map((vendor, vIndex) =>
                  vendor.package_quotes?.map((pkg, i) =>
                    pkg.quotes?.map((quote, j) => (
                      <div
                        key={`${vIndex}-${i}-${j}`}
                        className="p-2 border-top-1 border-300 mt-2"
                      >
                        <p>
                          <strong>Vendor Company:</strong> {vendor.company}
                        </p>
                        <p>
                          <strong>Vendor Email:</strong> {vendor.email}
                        </p>
                        <p>
                          <strong>Airline:</strong> {quote.airline_name}
                        </p>
                        <p>
                          <strong>Last Shipment Per Kg:</strong>{" "}
                          {quote.freight_per_kg}
                        </p>
                        <p>
                          <strong>Last Shipment DDP Amount:</strong>{" "}
                          {quote.dap_ddp_charges}
                        </p>
                        <p>
                          <strong>Total Chargeable Weight:</strong>{" "}
                          {quote.chargeable_weight}
                        </p>
                        <p>
                          <strong>Last Shipment Freight Amt (in FC):</strong>{" "}
                          {quote.chargeable_weight}
                        </p>
                        <p>
                          <strong>
                            Last Shipment Haulage Destination Amt (in FC):
                          </strong>{" "}
                          {quote.chargeable_weight}
                        </p>
                      </div>
                    ))
                  )
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default PackageDimensionsForm;
