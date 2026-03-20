import React, { useState } from "react";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { FileUpload } from "primereact/fileupload";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import axios from "axios";
import { useApi } from "../../utils/requests";
import { formatDate } from "../../utils/local";

const BASE_URL = process.env.REACT_APP_API_URL;

const VendorCostUpload = ({ row, refreshData = () => {} }) => {
  const toast = React.useRef(null);
  const { postData, getData } = useApi();

  const [form, setForm] = useState({
    freight_amount: "",
    dap_amount: "",
    custom_duty_amount: "",
    others_amount: "",
    remark: "",
  });

  const [files, setFiles] = useState({
    freight: null,
    dap: null,
    custom_duty: null,
    others: null,
  });

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileSelect = (event, type) => {
    const file = event.files?.[0];

    console.log("Selected File:", type, file);

    setFiles((prev) => ({
      ...prev,
      [type]: file,
    }));
  };

  const validateForm = () => {
    if (!form.freight_amount || !files.freight) {
      showError("Freight amount and attachment required");
      return false;
    }

    if (!form.dap_amount || !files.dap) {
      showError("DAP amount and attachment required");
      return false;
    }

    if (!form.custom_duty_amount || !files.custom_duty) {
      showError("Custom Duty amount and attachment required");
      return false;
    }

    return true;
  };

  const showError = (msg) => {
    toast.current.show({
      severity: "error",
      summary: "Validation",
      detail: msg,
      life: 3000,
    });
  };

  const showSuccess = (msg) => {
    toast.current.show({
      severity: "success",
      summary: "Success",
      detail: msg,
      life: 3000,
    });
  };

  const submitDocuments = async () => {
    if (!validateForm()) return;

    const formData = new FormData();

    formData.append("rfq_number", row.rfqNumberForQuoteSummary);
    formData.append("vendor_id", row.user.id);

    formData.append("freight_amount", form.freight_amount);
    formData.append("dap_amount", form.dap_amount);
    formData.append("custom_duty_amount", form.custom_duty_amount);
    formData.append("others_amount", form.others_amount);

    // push all files into same documents array
    if (files.freight) formData.append("documents", files.freight);
    if (files.dap) formData.append("documents", files.dap);
    if (files.custom_duty) formData.append("documents", files.custom_duty);
    if (files.others) formData.append("documents", files.others);

    try {
      await postData(`invoices/submit`, formData, {});

      showSuccess("Invoice documents submitted successfully");

      refreshData();
    } catch (err) {
      showError("Failed to submit invoice");
    }
  };

  const returnToBuyer = async () => {
    if (!form.remark) {
      showError("Remark required when returning");
      return;
    }

    try {
      await axios.post(`${BASE_URL}/api/vendor/return-cost-breakdown`, {
        //rfq_number: row.rfq_number,
        //vendor_id: row.vendor_id,
        remark: form.remark,
      });

      showSuccess("Returned to buyer");

      refreshData && refreshData();
    } catch (err) {
      showError("Return failed");
    }
  };

  return (
    <div className="p-3 border-round surface-card mt-4">
      <Toast ref={toast} />

      {row.invoiceDetails && Object.keys(row.invoiceDetails).length > 0 && (
        <div className="p-3 border-round shadow-1 surface-card border-blue-300 bg-blue-50">
          <h5 className="mb-3 text-blue-700">Submitted Invoice Details</h5>

          {/* Submitted Date */}
          <div className="text-sm mb-2">
            <strong>Submitted On:</strong>{" "}
            {formatDate(row.invoiceDetails?.submitted_on)}
          </div>

          {/* Amount Breakdown */}
          <div className="text-sm mb-2">
            <div>
              <strong>Freight Amount:</strong>{" "}
              {row.invoiceDetails?.freight_amount || "-"}
            </div>

            <div>
              <strong>DAP Amount:</strong>{" "}
              {row.invoiceDetails?.dap_amount || "-"}
            </div>

            <div>
              <strong>Custom Duty:</strong>{" "}
              {row.invoiceDetails?.custom_duty_amount || "-"}
            </div>

            <div>
              <strong>Other Charges:</strong>{" "}
              {row.invoiceDetails?.others_amount || "-"}
            </div>
          </div>

          {/* Attachments */}
          {row.invoiceDetails?.attached_file?.length > 0 && (
            <div>
              <strong>Files:</strong>

              {row.invoiceDetails.attached_file.map((file, i) => (
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
        </div>
      )}

      <div className="grid">
        {/* Freight */}
        <div className="col-12 md:col-6">
          <label className="font-medium">Freight Amount</label>

          <InputText
            className="w-full mt-1"
            value={form.freight_amount}
            onChange={(e) => handleChange("freight_amount", e.target.value)}
          />

          <FileUpload
            mode="basic"
            chooseLabel="Upload Freight Doc"
            auto={false}
            className="mt-2"
            onSelect={(e) => handleFileSelect(e, "freight")}
          />
        </div>

        {/* DAP */}
        <div className="col-12 md:col-6">
          <label className="font-medium">DAP Amount</label>

          <InputText
            className="w-full mt-1"
            value={form.dap_amount}
            onChange={(e) => handleChange("dap_amount", e.target.value)}
          />

          <FileUpload
            mode="basic"
            chooseLabel="Upload DAP Doc"
            auto={false}
            className="mt-2"
            onSelect={(e) => handleFileSelect(e, "dap")}
          />
        </div>

        {/* Custom Duty */}
        <div className="col-12 md:col-6">
          <label className="font-medium">Custom Duty</label>

          <InputText
            className="w-full mt-1"
            value={form.custom_duty_amount}
            onChange={(e) => handleChange("custom_duty_amount", e.target.value)}
          />

          <FileUpload
            mode="basic"
            chooseLabel="Upload Custom Duty Doc"
            auto={false}
            className="mt-2"
            onSelect={(e) => handleFileSelect(e, "custom_duty")}
          />
        </div>

        {/* Others */}
        <div className="col-12 md:col-6">
          <label className="font-medium">Others</label>

          <InputText
            className="w-full mt-1"
            value={form.others_amount}
            onChange={(e) => handleChange("others_amount", e.target.value)}
          />

          <FileUpload
            mode="basic"
            chooseLabel="Upload Others Doc"
            auto={false}
            className="mt-2"
            onSelect={(e) => handleFileSelect(e, "others")}
          />
        </div>
      </div>

      {/* Remark */}
      <div className="mt-4">
        <label className="font-medium">Remark</label>

        <InputTextarea
          rows={3}
          className="w-full mt-1"
          value={form.remark}
          onChange={(e) => handleChange("remark", e.target.value)}
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-2 mt-4">
        <Button
          label="Submit Documents"
          icon="pi pi-check"
          severity="success"
          onClick={submitDocuments}
        />

        <Button
          label="Return to Buyer"
          icon="pi pi-undo"
          severity="danger"
          onClick={returnToBuyer}
        />
      </div>
    </div>
  );
};

export default VendorCostUpload;
