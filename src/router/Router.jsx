import React, { Suspense, useEffect, useRef } from "react";
import { Routes, Route } from "react-router-dom";
import { Toast } from "primereact/toast";

import ProtectedRoute from "../components/ProtectedRoute/ProtectedRoute";

import Login from "../pages/Login/Login";
import Password from "../pages/ForgetPassword/Password";
import ResetPassword from "../pages/NewPassword/ResetPassword";
import Register from "../pages/Register/Register";
import RegistrationDisabled from "../pages/Register/RegistrationDisabled";
import Home from "../pages/Home/Home";
import Conference from "../pages/Conference/Conference";
import Streaming from "../pages/Streaming/Streaming";
import Events from "../pages/Events/Events";
import MediaLibrary from "../pages/MediaLibrary/MediaLibrary";
import Editor from "../pages/Editor/Editor";
import CreateRfq from "../pages/Rfq/CreateRfq";
import RfqManagement from "../pages/Rfq/RfqManagement";
import VendorManagement from "../pages/VendorManagement/VendorManagement";
import InvoiceManagement from "../pages/InvoiceManagement/InvoiceManagement";
import AddUser from "../pages/Users/AddUser";
import UserManagement from "../pages/Users/UserManagement";
import { useSelector } from "react-redux";
import QuoteSummary from "../pages/Rfq/QuoteSummary";
import ViewQuote from "../pages/Rfq/ViewQuote";

const Router = () => {
  const toast = useRef(null);
  const toaster = useSelector((state) => state.toast.toast);

  useEffect(() => {
    if (toaster.detail) toast.current.show(toaster);
  }, [toaster]);

  return (
    <>
      <Toast ref={toast} />
      <Suspense>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/forget-password" element={<Password />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/Register" element={<RegistrationDisabled />} />
          <Route path="/" element={<ProtectedRoute />}>
            <Route index element={<Home />} />
            <Route path="vc" element={<Conference />} />
            <Route path="ls" element={<Streaming />} />
            <Route path="events" element={<Events />} />
            <Route path="library" element={<MediaLibrary />} />
            <Route path="editor" element={<Editor />} />
            <Route path="createrfq" element={<CreateRfq />} />
            <Route path="/rfq/view/:rfqNumber" element={<CreateRfq />} />
            <Route path="/rfqs" element={<RfqManagement />} />
            <Route path="/quotesummary" element={<QuoteSummary />} />
            <Route path="/quote-summary/:rfqNumber" element={<ViewQuote />} />
            <Route path="/users/add" element={<AddUser />} />
            <Route path="/users/edit/:userId" element={<AddUser />} />
            <Route path="/users/usermanagement" element={<UserManagement />} />
            <Route path="vendormanagement" element={<VendorManagement />} />
            <Route path="invoicemanagement" element={<InvoiceManagement />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  );
};

export default Router;
