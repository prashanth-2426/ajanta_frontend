import { useState } from "react";
import { Link, useNavigate, Navigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { Image } from "primereact/image";

import logoImg from "../../assets/images/ajantha_logo.png";
import loginImage from "../../assets/images/login-side.png"; // Add your image here
import { Message } from "primereact/message";
import { useApi } from "../../utils/requests";
import { setCredentials } from "../../store/authSlice";
import { fetchVendors } from "../../store/vendorSlice";
import { fetchUsers } from "../../store/userSlice";
import { toastError, toastSuccess } from "../../store/toastSlice";
import { validateEmail, validatePassword } from "../../utils/validation";
import Register from "../Register/Register";

const ResetPassword = () => {
  const { postData } = useApi();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Retrieve the email from location state
  const email = location.state?.email || "";

  const handleNewPasswordChange = (event) => {
    setNewPassword(event.target.value);
  };

  const handleConfirmPasswordChange = (event) => {
    setConfirmPassword(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      dispatch(
        toastError({
          detail: "New password and confirm password do not match.",
        })
      );
      return;
    }

    try {
      const { isSuccess, msg } = await postData("auth/update-password", {
        email,
        newPassword,
      });

      if (isSuccess) {
        dispatch(toastSuccess({ detail: msg }));
        navigate("/login");
      } else {
        dispatch(toastSuccess({ detail: msg }));
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-column md:flex-row">
      {/* Left Column - Login Form */}
      <div className="flex flex-column  items-center p-6 md:w-6 w-full bg-white">
        <div className="w-full max-w-md">
          <div className="flex justify-content-between align-items-center mb-4">
            <div className="flex flex-column">
              <Image src={logoImg} alt="logo" width="240" className="mb-2" />
              <span className="text-lg text-gray-600 text-center font-medium tracking-wide">
                E-Auction Platform
              </span>
            </div>
          </div>

          <h2 className="m-0 text-900 font-bold text-2xl mb-5 text-center">
            Reset Password
          </h2>

          <div className="forget-password-container">
            <form
              onSubmit={handleSubmit}
              className="email-form"
              autocomplete="off"
            >
              <div className="p-field mt-3">
                <span className="p-input-icon-left mt-2">
                  <i className="pi pi-lock"></i>
                  <InputText
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={handleNewPasswordChange}
                    placeholder="Enter new password"
                    className={`w-full md:w-25rem text-color-secondary surface-50 border-200`}
                    autoComplete="off"
                  />
                </span>
              </div>
              <div className="p-field mt-3">
                <span className="p-input-icon-left mt-2">
                  <i className="pi pi-lock"></i>
                  <InputText
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    placeholder="Confirm new password"
                    className={`w-full md:w-25rem text-color-secondary surface-50 border-200`}
                    autocomplete="off"
                  />
                </span>
              </div>
              <div className="button-group mt-3">
                <Button
                  type="submit"
                  label="Confirm"
                  icon="pi pi-check"
                  className="w-full"
                />
                <Button
                  label="Cancel"
                  icon="pi pi-times"
                  onClick={() => navigate("/login")}
                  className="mt-2 w-full"
                />
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Right Column - Image */}
      <div className="hidden md:flex w-6">
        <img
          src={loginImage}
          alt="Login"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
};

export default ResetPassword;
