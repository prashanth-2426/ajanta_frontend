import { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
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

const Password = () => {
  const { postData } = useApi();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const dispatch = useDispatch();

  const handleChange = (event) => {
    setEmail(event.target.value);
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateEmail(email)) {
      dispatch(toastError({ detail: "Please enter a valid email address." }));
      return;
    }

    try {
      const response = await postData("auth/validate-email", {
        email,
        //securityAnswer,
      });

      if (response.isSuccess) {
        setSuccessMessage(response.msg);
        // Pass email as state to the reset-password route
        navigate("/reset-password", { state: { email } });
        dispatch(toastSuccess({ detail: "Valid user" }));
      } else {
        dispatch(toastError({ detail: response.msg }));
      }
    } catch (error) {
      dispatch(
        toastError({ detail: "An error occurred. Please try again later." })
      );
    }
  };

  //if (user) return <Navigate to={"/"} replace />;

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
            Forget Password
          </h2>

          <div className="forget-password-container">
            <form onSubmit={handleSubmit} className="email-form">
              <div className="p-field">
                <span className="p-input-icon-left mt-2">
                  <i className="pi pi-envelope"></i>
                  <InputText
                    id="email"
                    type="email"
                    value={email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className={`w-full md:w-25rem text-color-secondary surface-50 border-200 ${
                      error ? "p-invalid" : ""
                    }`}
                  />
                </span>
                {error && <Message severity="error" text={error} />}
              </div>
              <div className="mt-3">
                <div className="button-group mt-3">
                  <Button
                    type="submit"
                    label="Submit"
                    icon="pi pi-check"
                    className="w-full"
                  />
                  <Button
                    label="Cancel"
                    icon="pi pi-times"
                    onClick={() => navigate("/login")}
                    className="w-full mt-2"
                  />
                </div>
              </div>
            </form>
            {successMessage && (
              <Message severity="success" text={successMessage} />
            )}
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

export default Password;
