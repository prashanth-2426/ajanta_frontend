export const setLoginInfo = (user) => {
  localStorage.setItem("USERNAME", user.name);
  localStorage.setItem("USEREMAIL", user.email);
  localStorage.setItem("USERTOKEN", user.token);
};

export const clearLoginInfo = () => {
  localStorage.clear();
};

export const provideUserInfo = () => {
  return localStorage.getItem("USERTOKEN")
    ? {
        name: localStorage.getItem("USERNAME"),
        email: localStorage.getItem("USEREMAIL"),
        token: localStorage.getItem("USERTOKEN"),
      }
    : null;
};

export const formatDate = (dateString, includeT = false, friendly = false) => {
  if (!dateString) return "-";

  const dateObject = new Date(dateString);

  if (Number.isNaN(dateObject.getTime())) return "-";

  const day = String(dateObject.getDate()).padStart(2, "0");
  const monthNumber = String(dateObject.getMonth() + 1).padStart(2, "0");
  const year = dateObject.getFullYear();

  let hours = dateObject.getHours();
  const minutes = String(dateObject.getMinutes()).padStart(2, "0");

  if (includeT) {
    return `${year}-${monthNumber}-${day}T${String(hours).padStart(
      2,
      "0",
    )}:${minutes}`;
  }

  const ampm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12;
  hours = hours || 12;

  if (friendly) {
    const month = dateObject.toLocaleString("en-US", {
      month: "short",
    });

    return `${day} ${month} ${year} ${hours}:${minutes} ${ampm}`;
  }

  // Existing format remains unchanged
  return `${day}-${monthNumber}-${year} ${hours}:${minutes} ${ampm}`;
};
