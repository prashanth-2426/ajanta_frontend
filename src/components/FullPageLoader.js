// src/components/FullPageLoader.js
import React, { useContext } from "react";
import { LoadingContext } from "../context/LoadingContext";
import "./FullPageLoader.css";

const FullPageLoader = () => {
  const { loading } = useContext(LoadingContext);
  if (!loading) return null;

  return (
    <div className="full-page-loader">
      <div className="spinner"></div>
    </div>
  );
};

export default FullPageLoader;
