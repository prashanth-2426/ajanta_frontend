import React, { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { FileUpload } from "primereact/fileupload";
import { FilterMatchMode } from "primereact/api";
import { useApi } from "../../utils/requests";
import { Button } from "primereact/button";

const VendorManagement = () => {
  const { postData, getData } = useApi();
  const [vendors, setVendors] = useState([]);
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    industry: { value: null, matchMode: FilterMatchMode.CONTAINS },
    subIndustry: { value: null, matchMode: FilterMatchMode.CONTAINS },
    product: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });
  const [expandedRows, setExpandedRows] = useState(null);

  const fetchVendors = async () => {
    try {
      const data = await getData("vendors");
      setVendors(data);
    } catch (error) {
      console.error("Failed to fetch vendors:", error);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleExcelUpload = async ({ files }) => {
    const file = files[0];
    const formData = new FormData();
    formData.append("excel", file);

    try {
      const token = localStorage.getItem("USERTOKEN");
      const response = await fetch("/apis/vendors/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();
      //console.log("Upload result:", result);
      setVendors(result.data);
    } catch (error) {
      //console.error("Error uploading file:", error);
    }
  };

  // Template for row expansion
  const rowExpansionTemplate = (vendor) => {
    return (
      <div className="p-3 bg-gray-50 rounded">
        <h5>Additional Details</h5>
        <div className="grid">
          <div className="col-6">
            <strong>Email:</strong> {vendor.email}
          </div>
          <div className="col-6">
            <strong>Mobile:</strong> {vendor.mobile || "-"}
          </div>
          <div className="col-6">
            <strong>GST Number:</strong> {vendor.gst_number || "-"}
          </div>
          <div className="col-6">
            <strong>PAN Number:</strong> {vendor.pan_number || "-"}
          </div>
          <div className="col-6">
            <strong>Address Line 1:</strong> {vendor.address_line1 || "-"}
          </div>
          <div className="col-6">
            <strong>Address Line 2:</strong> {vendor.address_line2 || "-"}
          </div>
          <div className="col-4">
            <strong>City:</strong> {vendor.city || "-"}
          </div>
          <div className="col-4">
            <strong>State:</strong> {vendor.state || "-"}
          </div>
          <div className="col-4">
            <strong>Country:</strong> {vendor.country || "-"}
          </div>
          <div className="col-4">
            <strong>Zipcode:</strong> {vendor.zipcode || "-"}
          </div>
          <div className="col-4">
            <strong>Registration Source:</strong>{" "}
            {vendor.registration_source || "-"}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4">
      <div className="flex justify-content-between align-items-center mb-3">
        <h3>Vendor Management</h3>
        <FileUpload
          mode="basic"
          chooseLabel="Upload Excel"
          name="excel"
          accept=".xlsx, .xls"
          customUpload
          uploadHandler={handleExcelUpload}
          auto
        />
      </div>

      <DataTable
        value={vendors}
        paginator
        rows={10}
        responsiveLayout="scroll"
        sortMode="multiple"
        dataKey="id"
        expandedRows={expandedRows}
        onRowToggle={(e) => setExpandedRows(e.data)}
        rowExpansionTemplate={rowExpansionTemplate}
        filters={filters}
        filterDisplay="menu"
        removableSort
      >
        <Column expander style={{ width: "3rem" }} />
        <Column field="company" header="Company Name" sortable />
        <Column
          field="industry"
          header="Industry"
          sortable
          filter
          filterPlaceholder="Search..."
        />
        <Column
          field="subIndustry"
          header="Sub Industry"
          sortable
          filter
          filterPlaceholder="Search..."
        />
        <Column
          field="product"
          header="Product"
          sortable
          filter
          filterPlaceholder="Search..."
        />
        <Column field="name" header="Contact Person" sortable />
        <Column field="createdAt" header="Registered On" sortable />
        <Column field="is_approved" header="Active" sortable />
        <Column
          header="Action"
          body={() => (
            <Button
              icon="pi pi-trash"
              className="p-button-danger p-button-sm"
            />
          )}
        />
      </DataTable>
    </div>
  );
};

export default VendorManagement;
