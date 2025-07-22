import React, { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { FilterMatchMode } from "primereact/api";
import { getData, deleteData, postData } from "../../utils/requests";
import { useNavigate } from "react-router-dom";
import { toastSuccess, toastError } from "../../store/toastSlice";
import { useDispatch } from "react-redux";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [expandedRows, setExpandedRows] = useState(null);
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    role: { value: null, matchMode: FilterMatchMode.EQUALS },
  });
  const [globalFilter, setGlobalFilter] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const fetchUsers = async () => {
    try {
      const result = await getData("users");
      if (Array.isArray(result?.users)) setUsers(result.users);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    const response = await postData(`auth/${userId}/delete-user`, {});
    if (response?.isSuccess) {
      dispatch(toastSuccess({ detail: "User deleted successfully!" }));
      fetchUsers();
    } else {
      dispatch(toastError({ detail: "Failed to delete user." }));
    }
  };

  const toggleApproval = async (userId) => {
    try {
      const response = await postData(
        `auth/${userId}/toggle-user-approval`,
        {}
      );

      if (response?.isSuccess) {
        dispatch(toastSuccess({ detail: "User status updated." }));
        fetchUsers(); // Refresh list
      } else {
        dispatch(
          toastError({ detail: response.msg || "Failed to update status" })
        );
      }
    } catch (err) {
      console.error(err);
      dispatch(toastError({ detail: "Error updating status" }));
    }
  };

  const actionBodyTemplate = (rowData) => (
    <div className="flex gap-2">
      <Button
        icon={rowData.is_approved ? "pi pi-lock-open" : "pi pi-lock"}
        className={`p-button-sm ${
          rowData.is_approved ? "p-button-success" : "p-button-secondary"
        }`}
        onClick={() => toggleApproval(rowData.id)}
        tooltip={rowData.is_approved ? "Deactivate" : "Activate"}
      />
      <Button
        icon="pi pi-pencil"
        className="p-button-sm p-button-info"
        onClick={() => navigate(`/users/edit/${rowData.id}`)}
      />
      <Button
        icon="pi pi-trash"
        className="p-button-sm p-button-danger"
        onClick={() => handleDelete(rowData.id)}
      />
    </div>
  );

  const rowExpansionTemplate = (data) => (
    <div className="p-3 bg-gray-50 border-top-1 surface-border">
      <h5 className="mb-3">Additional Details</h5>
      <div className="grid">
        <div className="col-12 md:col-6">
          <strong>Industry:</strong> {data.industry || "—"}
        </div>
        <div className="col-12 md:col-6">
          <strong>Sub Industry:</strong> {data.subIndustry || "—"}
        </div>
        <div className="col-12 md:col-6">
          <strong>Product:</strong> {data.product || "—"}
        </div>
        <div className="col-12 md:col-6">
          <strong>GST Number:</strong> {data.gst_number || "—"}
        </div>
        <div className="col-12 md:col-6">
          <strong>PAN Number:</strong> {data.pan_number || "—"}
        </div>
        <div className="col-12 md:col-6">
          <strong>Registration Source:</strong>{" "}
          {data.registration_source || "—"}
        </div>
        <div className="col-12 md:col-6">
          <strong>Address:</strong>
          {[
            data.address_line1,
            data.address_line2,
            data.city,
            data.state,
            data.country,
            data.zipcode,
          ]
            .filter(Boolean)
            .join(", ") || "—"}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4">
      <div className="flex justify-content-between align-items-center mb-3">
        <h3>User Management</h3>
        <Button
          label="Add User"
          icon="pi pi-plus"
          onClick={() => navigate("/users/add")}
        />
      </div>

      <div className="flex justify-content-end mb-2">
        <span className="p-input-icon-left w-full md:w-30rem">
          <i className="pi pi-search" />
          <InputText
            placeholder="Global Search"
            value={globalFilter}
            onChange={(e) => {
              const val = e.target.value;
              let _filters = { ...filters };
              _filters["global"].value = val;
              setFilters(_filters);
              setGlobalFilter(val);
            }}
            className="w-full"
          />
        </span>
      </div>

      <DataTable
        value={users}
        paginator
        rows={10}
        responsiveLayout="scroll"
        filters={filters}
        globalFilterFields={["name", "email", "company", "role"]}
        filterDisplay="menu"
        className="p-datatable-sm"
        expandedRows={expandedRows}
        onRowToggle={(e) => setExpandedRows(e.data)}
        rowExpansionTemplate={rowExpansionTemplate}
        dataKey="id"
      >
        <Column expander style={{ width: "3rem" }} />
        <Column field="name" header="Name" sortable />
        <Column field="email" header="Email" sortable />
        <Column field="role" header="Role" sortable filter />
        <Column field="company" header="Company" sortable />
        <Column field="mobile" header="Mobile" />
        <Column header="Action" body={actionBodyTemplate} />
      </DataTable>
    </div>
  );
};

export default UserManagement;
