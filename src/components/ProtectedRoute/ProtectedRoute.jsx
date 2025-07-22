import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

import { useDispatch } from "react-redux";
import { removeCredentials } from "../../store/authSlice";

import { postData } from "../../utils/requests";

import Layout from "../Layout/Layout";

const ProtectedRoute = () => {
  const dispatch = useDispatch();

  const user = useSelector((state) => state.auth.user);
  const [isTokenValid, setIsTokenValid] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsTokenValid(false);
      return;
    }
    postData("auth/verify-token", user).then((response) => {
      if (!response.isSuccess) {
        dispatch(removeCredentials());
        setIsTokenValid(false);
        console.error("Token verification failed");
      }
    });
  }, []);

  // ✅ If user is missing or token invalid, redirect
  if (!user || !isTokenValid) {
    return <Navigate to="/login" replace />;
  }

  return <Layout />;
};

export default ProtectedRoute;
