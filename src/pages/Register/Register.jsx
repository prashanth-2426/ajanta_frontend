"use client";
import { Button } from "primereact/button";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { InputText } from "primereact/inputtext";
import React, { useState } from "react";
import { Password } from "primereact/password";
import { Dropdown } from "primereact/dropdown";
//import { useRouter } from 'next/navigation';
import { Checkbox } from "primereact/checkbox";
import { useApi } from "../../utils/requests";
import { setCredentials } from "../../store/authSlice";
import { toastError, toastSuccess } from "../../store/toastSlice";
import { validateEmail, validatePassword } from "../../utils/validation";

const Register = ({ onRegisterComplete }) => {
  const { postData } = useApi();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [checked, setChecked] = useState(Boolean);
  const roleOptions = [
    // { label: "Buyer", value: "buyer" },
    { label: "Vendor", value: "vendor" },
    // { label: "Admin", value: "admin" },
  ];
  const user = useSelector((state) => state.auth.user);
  const [userDetails, setUserDetails] = useState({
    name: "",
    email: "",
    password: "",
    role: "vendor",
  });
  const [errorDetails, setErrorDetails] = useState({
    name: false,
    email: false,
    password: false,
    role: false,
  });

  //const router = useRouter();
  const navigateToDashboard = () => {
    //router.push('/');
  };

  const changeHandler = (detail, value) => {
    setUserDetails({ ...userDetails, [detail]: value });
  };

  const registrationHandler = async () => {
    let errors = {};
    let errorMessages = {};

    if (!validateEmail(userDetails.email)) {
      errors.email = true;
      errorMessages.email = "Please enter a valid email.";
    }

    if (!validatePassword(userDetails.password)) {
      errors.password = true;
      errorMessages.password =
        "Password must be at least 8 characters, with uppercase, lowercase, number, and special character.";
    }

    setErrorDetails(errors);

    if (errors.email || errors.password) {
      dispatch(
        toastError({ detail: errorMessages.email || errorMessages.password })
      );
      return;
    }

    //console.log("userdetails value", userDetails);

    const data = await postData("auth/register", userDetails);
    if (data.isSuccess) {
      //dispatch(setCredentials(data.user));
      dispatch(toastSuccess({ detail: data.msg }));
      onRegisterComplete();
      //navigate("/", { replace: true });
    } else {
      dispatch(toastError({ detail: data.msg }));
    }
  };

  return (
    <>
      <div className="surface-0">
        <div className="flex align-items-center justify-content-between flex-column h-screen">
          <div className="flex flex-column align-items-center justify-content-center w-full md:w-4  text-center py-6 px-4">
            <div className="mb-4">
              <div className="text-900 text-xl font-bold mb-2">Register</div>
              <span className="text-600 font-medium">
                Let&apos;s get started
              </span>
            </div>
            <div className="flex flex-column">
              <span className="p-input-icon-left w-full mb-4">
                <i className="pi pi-user"></i>
                <InputText
                  id="username"
                  type="text"
                  value={userDetails.name}
                  onChange={(e) => changeHandler("name", e.target.value)}
                  className="w-full md:w-25rem text-color-secondary surface-50 border-200"
                  placeholder="Username"
                />
              </span>
              <span className="p-input-icon-left w-full mb-4">
                <i className="pi pi-envelope"></i>
                <InputText
                  id="email"
                  type="text"
                  value={userDetails.email}
                  onChange={(e) => changeHandler("email", e.target.value)}
                  className="w-full md:w-25rem text-color-secondary surface-50 border-200"
                  placeholder="Email"
                />
              </span>
              <span className="p-input-icon-left w-full mb-4">
                <i className="pi pi-lock z-2"></i>
                <Password
                  id="password"
                  placeholder="Password"
                  value={userDetails.password}
                  onChange={(e) => changeHandler("password", e.target.value)}
                  className="w-full"
                  inputStyle={{ paddingLeft: "2.5rem" }}
                  inputClassName="w-full md:w-25rem text-color-secondary surface-50 border-200"
                  toggleMask
                ></Password>
              </span>
              <span className="p-input-icon-left w-full mb-4">
                <Dropdown
                  value={userDetails.role}
                  onChange={(e) => changeHandler("role", e.value)}
                  options={roleOptions}
                  placeholder="Select Role"
                  className="w-full md:w-25rem mb-4 text-color-secondary surface-50 border-200"
                />
              </span>
              <div className="mb-4 flex flex-wrap align-items-center">
                <Checkbox
                  id="rememberme"
                  onChange={(e) => setChecked(e.checked)}
                  checked={checked}
                  className="mr-2"
                />
                <label htmlFor="checkbox" className="text-900 font-medium mr-2">
                  {" "}
                  I have read the
                </label>
                <a className="text-600 cursor-pointer hover:text-primary cursor-pointer">
                  Terms and Conditions
                </a>
              </div>
              <Button
                label="Sign Up"
                className="w-full mb-4"
                onClick={registrationHandler}
                //v-ripple
              ></Button>
              <span className="font-medium text-600">
                Already have an account?{" "}
                <a className="font-semibold cursor-pointer text-900 hover:text-primary transition-colors transition-duration-300">
                  Login
                </a>
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;
