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

export const formatDate = (dateString, includeT = false) => {
  const dateObject = new Date(dateString);

  // Extract date components
  const day = String(dateObject.getDate()).padStart(2, "0");
  const month = String(dateObject.getMonth() + 1).padStart(2, "0"); // Month is zero-based
  const year = dateObject.getFullYear();
  let hours = dateObject.getHours();
  const minutes = String(dateObject.getMinutes()).padStart(2, "0");

  if (includeT) return `${year}-${month}-${day}T${hours}:${minutes}`;

  const ampm = hours >= 12 ? "PM" : "AM";
  // Convert to 12-hour format
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 should be displayed as 12
  // Format the date

  return `${day}-${month}-${year} ${hours}:${minutes} ${ampm}`;
};
