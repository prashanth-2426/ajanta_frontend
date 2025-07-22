// utils/statusMapper.js

export const getVendorStatusFromBuyerStatus = (buyerStatus = "") => {
  const statusMap = {
    draft: null, // Hide RFQ for vendors
    submitted: "OPEN",
    received_quotes: "OPEN", // Default for vendors until they submit
    evaluated: "UNDER REVIEW",
    negotiation: "NEGOTIATION REQUESTED",
    accepted: "QUOTE ACCEPTED",
    rejected: "REJECTED",
    auctioned: "AUCTION INVITED",
  };

  const normalized = buyerStatus?.toLowerCase();
  return statusMap[normalized] || "PENDING";
};
