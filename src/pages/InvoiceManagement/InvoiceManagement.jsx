// InvoiceManagementPage.jsx
import React, { useState, useEffect } from "react";
import {
  Button,
  Calendar,
  Dropdown,
  FileUpload,
  InputNumber,
  InputTextarea,
  DataTable,
  Column,
} from "primereact";
import { Dialog } from "primereact/dialog";

const transportModes = ["Air", "Sea", "Road", "Material"];
const auctionTypes = ["Forward Auction", "Reverse Auction"];

const InvoiceManagement = () => {
  const [invoices, setInvoices] = useState([]);
  const [visible, setVisible] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState({
    rfq_id: "",
    vendor_id: null,
    invoice_amount: null,
    description: "",
    invoice_file: null,
    transport_mode: "Air",
    auction_type: "Forward Auction",
  });

  const handleFileUpload = (e) => {
    setInvoiceForm({ ...invoiceForm, invoice_file: e.files[0] });
  };

  const handleSubmit = () => {
    const newInvoice = {
      ...invoiceForm,
      id: Date.now(),
      status: "Pending",
      created_at: new Date(),
    };
    setInvoices([...invoices, newInvoice]);
    setVisible(false);
  };

  const updateStatus = (invoiceId, status) => {
    const updated = invoices.map((inv) =>
      inv.id === invoiceId ? { ...inv, status } : inv
    );
    setInvoices(updated);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between align-items-center mb-3">
        <h3>Invoice Management</h3>
        <Button label="Upload Invoice" onClick={() => setVisible(true)} />
      </div>

      <Dialog
        header="Upload Invoice"
        visible={visible}
        style={{ width: "40vw" }}
        onHide={() => setVisible(false)}
      >
        <div className="p-fluid">
          <label>RFQ ID</label>
          <InputTextarea
            value={invoiceForm.rfq_id}
            onChange={(e) =>
              setInvoiceForm({ ...invoiceForm, rfq_id: e.target.value })
            }
          />

          <label>Vendor ID</label>
          <InputNumber
            value={invoiceForm.vendor_id}
            onValueChange={(e) =>
              setInvoiceForm({ ...invoiceForm, vendor_id: e.value })
            }
          />

          <label>Invoice Amount</label>
          <InputNumber
            value={invoiceForm.invoice_amount}
            onValueChange={(e) =>
              setInvoiceForm({ ...invoiceForm, invoice_amount: e.value })
            }
            mode="currency"
            currency="INR"
            locale="en-IN"
          />

          <label>Description</label>
          <InputTextarea
            value={invoiceForm.description}
            rows={3}
            onChange={(e) =>
              setInvoiceForm({ ...invoiceForm, description: e.target.value })
            }
          />

          <label>Transport Mode</label>
          <Dropdown
            value={invoiceForm.transport_mode}
            options={transportModes}
            onChange={(e) =>
              setInvoiceForm({ ...invoiceForm, transport_mode: e.value })
            }
            className="mb-2"
          />

          <label>Auction Type</label>
          <Dropdown
            value={invoiceForm.auction_type}
            options={auctionTypes}
            onChange={(e) =>
              setInvoiceForm({ ...invoiceForm, auction_type: e.value })
            }
          />

          <label>Upload Invoice (PDF)</label>
          <FileUpload
            mode="basic"
            name="demo[]"
            accept="application/pdf"
            auto
            customUpload
            onSelect={handleFileUpload}
            chooseLabel="Choose File"
          />
        </div>
        <Button label="Submit" className="mt-3" onClick={handleSubmit} />
      </Dialog>

      <div className="mt-4">
        <DataTable
          value={invoices}
          paginator
          rows={5}
          emptyMessage="No invoices uploaded yet."
          responsiveLayout="scroll"
        >
          <Column field="rfq_id" header="RFQ ID" sortable />
          <Column field="vendor_id" header="Vendor ID" sortable />
          <Column
            field="invoice_amount"
            header="Amount"
            sortable
            body={(row) => `₹ ${row.invoice_amount}`}
          />
          <Column field="auction_type" header="Auction Type" sortable />
          <Column field="transport_mode" header="Transport" sortable />
          <Column field="status" header="Status" />
          <Column
            header="Actions"
            body={(row) => (
              <>
                <Button
                  icon="pi pi-check"
                  className="p-button-sm p-button-success mr-2"
                  onClick={() => updateStatus(row.id, "Approved")}
                />
                <Button
                  icon="pi pi-replay"
                  className="p-button-sm p-button-warning"
                  onClick={() =>
                    updateStatus(row.id, "Resend for Clarification")
                  }
                />
              </>
            )}
          />
        </DataTable>
      </div>
    </div>
  );
};

export default InvoiceManagement;
