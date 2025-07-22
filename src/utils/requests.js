import axios from "axios";

async function getData(url, method = "GET") {
  const { data } = await axios.get(`/apis/${url}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("USERTOKEN")}`,
    },
  });
  console.log("data value test", data);
  return data;
}

// async function postData(url, payload, method = "POST") {
//   const { data } = await axios.post(`/apis/${url}`, payload, {
//     headers: {
//       Authorization: `Bearer ${localStorage.getItem("USERTOKEN")}`,
//     },
//   });
//   return data;
// }

async function postData(url, payload, method = "POST") {
  try {
    const { data } = await axios.post(`/apis/${url}`, payload, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("USERTOKEN")}`,
      },
    });
    return data;
  } catch (error) {
    if (error.response && error.response.data) {
      // Return backend-provided error message
      return {
        isSuccess: false,
        msg: error.response.data.msg || "Request failed",
      };
    }

    // Fallback error for unknown issues
    return {
      isSuccess: false,
      msg: error.message || "Unexpected error occurred",
    };
  }
}

async function deleteData(url) {
  const { data } = await axios.delete(`/apis/${url}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("USERTOKEN")}`,
    },
  });
  return data;
}

export { getData, postData, deleteData };
