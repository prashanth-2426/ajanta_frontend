// utils/exchangeRates.js
export const getRates = async (base, symbols = "INR") => {
  try {
    const response = await fetch(
      `/apis/exchange/rates?base=${base}&symbols=INR`
    );
    const data = await response.json();
    return data.rates[symbols];
  } catch (err) {
    return 1; // fallback
  }
};
