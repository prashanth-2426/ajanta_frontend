import React, { useState, useEffect } from "react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import PackageDimensionsForm from "./PackageDimensionsForm";

const DataStepperForm = ({ data, setData, setValue, type }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [formData, setFormData] = useState(data[0] || {});

  const handleNext = () => {
    const newIndex = Math.min(currentIndex + 1, data.length - 1);
    setCurrentIndex(newIndex);
    setFormData(data[newIndex]);
  };

  const handlePrev = () => {
    const newIndex = Math.max(currentIndex - 1, 0);
    setCurrentIndex(newIndex);
    setFormData(data[newIndex]);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const [step, setStep] = useState(0);

  const currentShipment = data[currentIndex];

  useEffect(() => {
    if (currentShipment?.package_summary) {
      setValue("package_summary", currentShipment.package_summary);
    }
  }, [currentIndex, currentShipment, setValue]);

  const handlePackageChange = (updatedSummary) => {
    const updatedData = [...data];
    updatedData[currentIndex].package_summary = updatedSummary;
    setData(updatedData);
  };

  return (
    <div className="p-4">
      <div className="flex justify-content-between align-items-center mb-3">
        <h5>Uploaded {type} Transport Details</h5>
        <div className="flex align-items-center gap-3">
          <span>
            Section {currentIndex + 1} of {data.length}
          </span>
          <Button
            icon="pi pi-chevron-left"
            rounded
            onClick={handlePrev}
            disabled={currentIndex === 0}
          />
          <Button
            icon="pi pi-chevron-right"
            rounded
            onClick={handleNext}
            disabled={currentIndex === data.length - 1}
          />
          {/* <Button icon="pi pi-upload" rounded label="Upload Packing List" /> */}
        </div>
      </div>

      <div className="grid">
        {Object.keys(formData).map((field, index) => (
          <div className="col-12 md:col-6 lg:col-4 mt-3" key={index}>
            <label>{field}</label>
            <InputText
              className="w-full"
              value={formData[field]}
              onChange={(e) => handleChange(field, e.target.value)}
            />
          </div>
        ))}
      </div>

      <PackageDimensionsForm
        mode={type}
        onPackagesChange={handlePackageChange}
        existingPackages={currentShipment?.package_summary}
      />
    </div>
  );
};

export default DataStepperForm;
