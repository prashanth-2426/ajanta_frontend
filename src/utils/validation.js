export const validateEmail = (email) => {
  var re =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

export const validatePassword = (password) => {
  var re =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return re.test(String(password));
};

export const validateName = (name) => {
  const pattern = /^(?=.*[a-zA-Z0-9._ -])[a-zA-Z0-9._ -]{5,50}$/;
  return pattern.test(String(name));
};

export const validStartTime = (dateTime) => {
  return new Date(dateTime) > new Date();
};

export const validEndTime = (startTime, endTime) => {
  return new Date(endTime) > new Date(startTime);
};

export const validateContacts = (contacts) => {
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(contacts);
};
