import React, { useState, useEffect } from "react";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";

const currencies = [{ label: "INR", value: "INR" }];
const units = [
  { label: "kg", value: "kg" },
  { label: "ton", value: "ton" },
];
const distanceUnits = [{ label: "KM", value: "KM" }];
const materials = [
  { label: "Steel", value: "Steel" },
  { label: "Cement", value: "Cement" },
];
const vehicleTypes = [{ label: "Truck", value: "Truck" }];
const parties = [
  { label: "Self", value: "Self" },
  { label: "Third Party", value: "Third Party" },
];

const TransportAuctionForm = ({
  mode,
  onRoadTransportChange,
  existingRoadTransportDetails = {},
}) => {
  const [entries, setEntries] = useState(() =>
    existingRoadTransportDetails.entries?.length
      ? existingRoadTransportDetails.entries
      : [
          {
            source: "",
            sourceZip: "",
            destination: "",
            destinationZip: "",
            loadingBy: "",
            unloadingBy: "",
            material: "",
            requirement: 1,
            requirementUnit: "",
            materialWeight: 1,
            materialUnit: "",
            vehicleType: "",
            dateTime: null,
            distance: "",
            distanceUnit: "",
            auctionPrice: "",
            lastPrice: "",
            decrement: "",
            notes: "",
          },
        ]
  );

  const previousRoadTransportDetailsRef = React.useRef();

  useEffect(() => {
    const dataToSend = {
      entries,
    };

    const stringified = JSON.stringify(dataToSend);
    if (
      stringified !== JSON.stringify(previousRoadTransportDetailsRef.current)
    ) {
      previousRoadTransportDetailsRef.current = dataToSend;
      onRoadTransportChange?.(dataToSend);
    }
  }, [entries, onRoadTransportChange]);

  const updateField = (index, field, value) => {
    const updated = [...entries];
    updated[index][field] = value;
    setEntries(updated);
    onRoadTransportChange?.({ entries: updated });
  };

  const addEntry = () => {
    setEntries([
      ...entries,
      {
        source: "",
        sourceZip: "",
        destination: "",
        destinationZip: "",
        loadingBy: "",
        unloadingBy: "",
        material: "",
        requirement: 1,
        requirementUnit: "",
        materialWeight: 1,
        materialUnit: "",
        vehicleType: "",
        dateTime: null,
        distance: "",
        distanceUnit: "",
        auctionPrice: "",
        lastPrice: "",
        decrement: "",
        notes: "",
      },
    ]);
  };

  const removeEntry = (index) => {
    const updated = [...entries];
    updated.splice(index, 1);
    setEntries(updated);
  };

  return (
    <div className="p-fluid">
      {entries.map((entry, index) => (
        <div
          key={index}
          className="border-1 surface-border p-3 mb-4 border-round"
        >
          <div className="p-fluid grid formgrid">
            <div className="col-12 md:col-3">
              <label>Source Location</label>
              <InputText
                value={entry.source}
                onChange={(e) => updateField(index, "source", e.target.value)}
              />
            </div>
            <div className="col-12 md:col-3">
              <label>Source ZIP / Post / Pincode</label>
              <InputText
                value={entry.sourceZip}
                onChange={(e) =>
                  updateField(index, "sourceZip", e.target.value)
                }
              />
            </div>
            <div className="col-12 md:col-3">
              <label>Destination Location</label>
              <InputText
                value={entry.destination}
                onChange={(e) =>
                  updateField(index, "destination", e.target.value)
                }
              />
            </div>
            <div className="col-12 md:col-3">
              <label>Destination ZIP / Post / Pincode</label>
              <InputText
                value={entry.destinationZip}
                onChange={(e) =>
                  updateField(index, "destinationZip", e.target.value)
                }
              />
            </div>

            <div className="col-6 md:col-3 mt-2">
              <label>Loading By</label>
              <Dropdown
                value={entry.loadingBy}
                options={parties}
                onChange={(e) => updateField(index, "loadingBy", e.value)}
                className="w-full"
              />
            </div>
            <div className="col-6 md:col-3 mt-2">
              <label>Unloading By</label>
              <Dropdown
                value={entry.unloadingBy}
                options={parties}
                onChange={(e) => updateField(index, "unloadingBy", e.value)}
                className="w-full"
              />
            </div>
            <div className="col-6 md:col-3 mt-2">
              <label>Material Type</label>
              <Dropdown
                value={entry.material}
                options={materials}
                onChange={(e) => updateField(index, "material", e.value)}
                className="w-full"
              />
            </div>
            <div className="col-3 md:col-1 mt-2">
              <label>Requirement</label>
              <InputNumber
                value={entry.requirement}
                onValueChange={(e) =>
                  updateField(index, "requirement", e.value)
                }
              />
            </div>
            <div className="col-3 md:col-2 mt-4">
              <Dropdown
                value={entry.requirementUnit}
                options={units}
                onChange={(e) => updateField(index, "requirementUnit", e.value)}
                placeholder="Unit"
              />
            </div>
            <div className="col-3 md:col-1 mt-2">
              <label>Material Weight</label>
              <InputNumber
                value={entry.materialWeight}
                onValueChange={(e) =>
                  updateField(index, "materialWeight", e.value)
                }
              />
            </div>
            <div className="col-3 md:col-2 mt-6">
              <Dropdown
                value={entry.materialUnit}
                options={units}
                onChange={(e) => updateField(index, "materialUnit", e.value)}
                placeholder="Unit"
              />
            </div>

            <div className="col-12 md:col-3 mt-4">
              <label>Vehicle Type</label>
              <Dropdown
                value={entry.vehicleType}
                options={vehicleTypes}
                onChange={(e) => updateField(index, "vehicleType", e.value)}
                className="w-full"
              />
            </div>
            <div className="col-6 md:col-3 mt-4">
              <label>Vehicle Required Date & Time</label>
              <Calendar
                value={entry.dateTime}
                onChange={(e) => updateField(index, "dateTime", e.value)}
                showIcon
                showTime
                className="w-full"
              />
            </div>
            <div className="col-3 md:col-2 mt-4">
              <label>Total Distance</label>
              <InputNumber
                value={entry.distance}
                onValueChange={(e) => updateField(index, "distance", e.value)}
              />
            </div>
            <div className="col-3 md:col-1 mt-6">
              <Dropdown
                value={entry.distanceUnit}
                options={distanceUnits}
                onChange={(e) => updateField(index, "distanceUnit", e.value)}
                placeholder="KM"
              />
            </div>

            <div className="col-12 md:col-4 mt-3">
              <label>Auction Start Price (Per Unit)</label>
              <div className="p-inputgroup">
                <InputNumber
                  value={entry.auctionPrice}
                  onValueChange={(e) =>
                    updateField(index, "auctionPrice", e.value)
                  }
                />
                <span className="p-inputgroup-addon">per unit</span>
              </div>
            </div>
            <div className="col-12 md:col-4 mt-3">
              <label>Last Purchase Price (Per Unit)</label>
              <div className="p-inputgroup">
                <InputNumber
                  value={entry.lastPrice}
                  onValueChange={(e) =>
                    updateField(index, "lastPrice", e.value)
                  }
                />
                <span className="p-inputgroup-addon">per unit</span>
              </div>
            </div>
            <div className="col-12 md:col-4 mt-3">
              <label>Bid Decrement Value</label>
              <div className="p-inputgroup">
                <InputNumber
                  value={entry.decrement}
                  onValueChange={(e) =>
                    updateField(index, "decrement", e.value)
                  }
                />
                <span className="p-inputgroup-addon">per unit</span>
              </div>
            </div>

            <div className="col-12 mt-3">
              <label>Additional Details</label>
              <InputText
                value={entry.notes}
                onChange={(e) => updateField(index, "notes", e.target.value)}
                className="w-full"
                placeholder="Write any notes..."
              />
            </div>

            <div className="col-12 flex justify-content-end">
              {index > 0 && (
                <Button
                  icon="pi pi-trash"
                  className="p-button-rounded p-button-danger mr-2"
                  onClick={() => removeEntry(index)}
                />
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Add New Row Button */}
      <div className="flex justify-content-end">
        <Button
          icon="pi pi-plus"
          className="p-button-rounded p-button-success"
          onClick={addEntry}
        />
      </div>
    </div>
  );
};

export default TransportAuctionForm;
