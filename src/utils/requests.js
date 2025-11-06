import axios from "axios";
import { LoadingContext } from "../context/LoadingContext";
import React, { useContext } from "react";

export const useApi = () => {
  const { setLoading } = useContext(LoadingContext);

  const getData = async (url) => {
    setLoading(true);
    try {
      const { data } = await axios.get(`/apis/${url}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("USERTOKEN")}`,
        },
      });
      return data;
    } finally {
      setLoading(false);
    }
  };

  const postData = async (url, payload) => {
    setLoading(true);
    try {
      const { data } = await axios.post(`/apis/${url}`, payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("USERTOKEN")}`,
        },
      });
      return data;
    } catch (error) {
      if (error.response && error.response.data) {
        return {
          isSuccess: false,
          msg: error.response.data.msg || "Request failed",
        };
      }
      return {
        isSuccess: false,
        msg: error.message || "Unexpected error occurred",
      };
    } finally {
      setLoading(false);
    }
  };

  const deleteData = async (url) => {
    setLoading(true);
    try {
      const { data } = await axios.delete(`/apis/${url}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("USERTOKEN")}`,
        },
      });
      return data;
    } finally {
      setLoading(false);
    }
  };

  return { getData, postData, deleteData };
};
