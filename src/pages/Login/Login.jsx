import { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { Image } from "primereact/image";

import logoImg from "../../assets/images/ajantha_logo.png";
import loginImage from "../../assets/images/login-side.png"; // Add your image here
import { useApi } from "../../utils/requests";
import { setCredentials } from "../../store/authSlice";
import { fetchVendors } from "../../store/vendorSlice";
import { fetchUsers } from "../../store/userSlice";
import { toastError, toastSuccess } from "../../store/toastSlice";
import { validateEmail, validatePassword } from "../../utils/validation";
import Register from "../Register/Register";

const Login = () => {
  const { postData } = useApi();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showRegister, setShowRegister] = useState(false);
  const user = useSelector((state) => state.auth.user);

  const [userDetails, setUserDetails] = useState({
    email: "",
    password: "",
  });

  const [remember, setRemember] = useState(false);
  const [errorDetails, setErrorDetails] = useState({
    email: false,
    password: false,
  });

  const changeHandler = (detail, value) => {
    setUserDetails({ ...userDetails, [detail]: value });
  };

  const loginHandler = async () => {
    let errors = {};
    errors.email = !validateEmail(userDetails.email);
    errors.password = !validatePassword(userDetails.password);
    setErrorDetails(errors);

    if (errors.email || errors.password) return;

    const data = await postData("auth/login", userDetails);
    if (data.isSuccess) {
      dispatch(setCredentials(data.user));
      dispatch(fetchVendors());
      dispatch(fetchUsers());
      dispatch(toastSuccess({ detail: data.msg }));
      navigate("/", { replace: true });
    } else {
      dispatch(toastError({ detail: data.msg }));
    }
  };

  const handleRegisterComplete = () => {
    setShowRegister(false); // Hide Register and show Login
  };

  if (user) return <Navigate to={"/"} replace />;

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
            {/* <Button
              label="Sign Up"
              className="p-button-outlined p-button-sm border-primary text-primary"
              onClick={() => setShowRegister(!showRegister)}
              style={{
                borderRadius: "8px",
                borderColor: "#2563eb",
                color: "#2563eb",
              }}
            /> */}
          </div>

          {!showRegister ? (
            <>
              <h2 className="m-0 text-900 font-bold text-2xl mb-5">
                Please Sign In
              </h2>

              <div className="mb-4">
                <label htmlFor="email" className="block text-600 text-sm mb-2">
                  Email address
                </label>
                <InputText
                  id="email"
                  value={userDetails.email}
                  onChange={(e) => changeHandler("email", e.target.value)}
                  placeholder="Enter email address"
                  className="w-full p-inputtext-lg"
                />
                {errorDetails.email && (
                  <small className="p-error">Invalid Email Address</small>
                )}
              </div>

              <div className="mb-4">
                <label
                  htmlFor="password"
                  className="block text-600 text-sm mb-2"
                >
                  Password
                </label>
                <Password
                  id="password"
                  value={userDetails.password}
                  onChange={(e) => changeHandler("password", e.target.value)}
                  toggleMask
                  feedback={false}
                  className="w-full"
                  inputClassName="w-full p-inputtext-lg"
                />
                {errorDetails.password && (
                  <small className="p-error">Invalid password</small>
                )}
              </div>

              {/* <div className="flex justify-content-between align-items-center mb-5">
                <div className="flex align-items-center">
                  <Checkbox
                    inputId="remember"
                    checked={remember}
                    onChange={(e) => setRemember(e.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="remember" className="text-sm">
                    Remember me
                  </label>
                </div>
                <a
                  href="#"
                  className="text-sm text-primary hover:underline cursor-pointer"
                >
                  I forgot my password
                </a>
              </div> */}

              <Button
                label="Sign In"
                className="w-full p-button-lg"
                style={{
                  background: "linear-gradient(to right, #2ebbd1, #3b228f)",
                  border: "none",
                  borderRadius: "10px",
                }}
                onClick={loginHandler}
              />
            </>
          ) : (
            <Register onRegisterComplete={handleRegisterComplete} />
          )}
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

export default Login;
