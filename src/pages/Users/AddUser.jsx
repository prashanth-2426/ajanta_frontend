import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { useDispatch } from "react-redux";
import { toastError, toastSuccess } from "../../store/toastSlice";
import { useApi } from "../../utils/requests";

const roleOptions = [
  { label: "Admin", value: "admin" },
  { label: "Vendor", value: "vendor" },
  { label: "User", value: "user" },
  { label: "HOD", value: "hod" },
  { label: "Marketing", value: "marketing" },
];

const industryOptions = [
  { label: "Air", value: "air" },
  { label: "Ocean", value: "ocean" },
  { label: "Road", value: "road" },
];

const AddUser = () => {
  const { postData, getData } = useApi();
  const dispatch = useDispatch();
  const { userId } = useParams(); // 👈 get userId from URL
  const isEdit = Boolean(userId);
  //console.log("isEdit mode", isEdit);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user",
    company: "",
    mobile: "",
    industry: "",
    subIndustry: "",
    product: "",
    gst_number: "",
    pan_number: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    country: "",
    zipcode: "",
    is_approved: true,
    registration_source: "manual",
  });

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (form.password !== form.confirmPassword) {
      dispatch(toastError({ detail: "Passwords do not match." }));
      return;
    }

    const { confirmPassword, ...payload } = form;
    const response = await postData("auth/register", {
      ...payload,
      isEdit,
      ...(isEdit && { id: userId }),
    });

    if (response?.isSuccess) {
      dispatch(toastSuccess({ detail: "User added successfully!" }));
      setForm((prev) => ({ ...prev, password: "", confirmPassword: "" }));
    } else {
      dispatch(
        toastError({ detail: response?.msg || "Failed to create user." })
      );
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      if (!isEdit) return;

      try {
        const res = await getData(`users/${userId}`); // 👈 GET /apis/users/1
        if (res?.user) {
          setForm((prev) => ({
            ...prev,
            ...res.user,
            password: "",
            confirmPassword: "",
          }));
        }
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    };

    fetchUser();
  }, [isEdit, userId]);

  return (
    <div className="p-4">
      <h3 className="mb-4">{isEdit ? "Edit User" : "Create New User"}</h3>
      <div className="grid formgrid">
        {/* Basic Info */}
        <div className="col-12 md:col-6">
          <label htmlFor="name">Full Name</label>
          <InputText
            id="name"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className="w-full"
          />
        </div>
        <div className="col-12 md:col-6">
          <label htmlFor="email">Email</label>
          <InputText
            id="email"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className="w-full"
          />
        </div>

        <div className="col-12 md:col-6">
          <label htmlFor="password">Password</label>
          <Password
            id="password"
            value={form.password}
            onChange={(e) => handleChange("password", e.target.value)}
            toggleMask
            className="w-full"
            inputClassName="w-full"
          />
        </div>
        <div className="col-12 md:col-6">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <Password
            id="confirmPassword"
            value={form.confirmPassword}
            onChange={(e) => handleChange("confirmPassword", e.target.value)}
            feedback={false}
            toggleMask
            className="w-full"
            inputClassName="w-full"
          />
        </div>

        <div className="col-12 md:col-4">
          <label>Role</label>
          <Dropdown
            value={form.role}
            options={roleOptions}
            onChange={(e) => handleChange("role", e.value)}
            className="w-full"
          />
        </div>

        <div className="col-12 md:col-4">
          <label>Mobile</label>
          <InputText
            value={form.mobile}
            onChange={(e) => handleChange("mobile", e.target.value)}
            className="w-full"
          />
        </div>

        <div className="col-12 md:col-4">
          <label>Company</label>
          <InputText
            value={form.company}
            onChange={(e) => handleChange("company", e.target.value)}
            className="w-full"
          />
        </div>

        {/* Business Info */}
        {/* <div className="col-12 md:col-4">
          <label>Industry</label>
          <InputText
            value={form.industry}
            onChange={(e) => handleChange("industry", e.target.value)}
            className="w-full"
          />
        </div> */}

        {form.role === "vendor" && (
          <>
            <div className="col-12 md:col-4">
              <label>Industry</label>
              <Dropdown
                value={form.industry}
                options={industryOptions}
                onChange={(e) => handleChange("industry", e.value)}
                placeholder="Select Industry"
                className="w-full"
              />
            </div>
            <div className="col-12 md:col-4">
              <label>Sub Industry</label>
              <InputText
                value={form.subIndustry}
                onChange={(e) => handleChange("subIndustry", e.target.value)}
                className="w-full"
              />
            </div>
            <div className="col-12 md:col-4">
              <label>Product</label>
              <InputText
                value={form.product}
                onChange={(e) => handleChange("product", e.target.value)}
                className="w-full"
              />
            </div>

            {/* Tax IDs */}
            <div className="col-12 md:col-6">
              <label>GST Number</label>
              <InputText
                value={form.gst_number}
                onChange={(e) => handleChange("gst_number", e.target.value)}
                className="w-full"
              />
            </div>
            <div className="col-12 md:col-6">
              <label>PAN Number</label>
              <InputText
                value={form.pan_number}
                onChange={(e) => handleChange("pan_number", e.target.value)}
                className="w-full"
              />
            </div>

            {/* Address */}
            <div className="col-12 md:col-6">
              <label>Address Line 1</label>
              <InputText
                value={form.address_line1}
                onChange={(e) => handleChange("address_line1", e.target.value)}
                className="w-full"
              />
            </div>
            <div className="col-12 md:col-6">
              <label>Address Line 2</label>
              <InputText
                value={form.address_line2}
                onChange={(e) => handleChange("address_line2", e.target.value)}
                className="w-full"
              />
            </div>

            <div className="col-12 md:col-3">
              <label>City</label>
              <InputText
                value={form.city}
                onChange={(e) => handleChange("city", e.target.value)}
                className="w-full"
              />
            </div>
            <div className="col-12 md:col-3">
              <label>State</label>
              <InputText
                value={form.state}
                onChange={(e) => handleChange("state", e.target.value)}
                className="w-full"
              />
            </div>
            <div className="col-12 md:col-3">
              <label>Country</label>
              <InputText
                value={form.country}
                onChange={(e) => handleChange("country", e.target.value)}
                className="w-full"
              />
            </div>
            <div className="col-12 md:col-3">
              <label>Zipcode</label>
              <InputText
                value={form.zipcode}
                onChange={(e) => handleChange("zipcode", e.target.value)}
                className="w-full"
              />
            </div>
          </>
        )}

        <div className="col-12 text-right">
          <Button label="Create User" onClick={handleSubmit} className="mt-3" />
        </div>
      </div>
    </div>
  );
};

export default AddUser;
