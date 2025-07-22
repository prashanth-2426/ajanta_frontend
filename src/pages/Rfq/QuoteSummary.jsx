import React, { useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Panel } from "primereact/panel";
import { getData, postData } from "../../utils/requests";

const QuoteSummary = () => {
  const [data, setData] = useState([]);

  const fetchQuoteSummary = async () => {
    try {
      const data = await getData("quotesummary/quotes-summary");
      console.log("Fetched Quotes Summary:", data);
      setData(data);
    } catch (error) {
      console.error("Error fetching Qutoes Summary:", error);
    }
  };

  useEffect(() => {
    fetchQuoteSummary();
  }, []);

  const handleUpdateStatus = async (rfq_id, status) => {
    try {
      const res = await postData("rfqs/update-status", { rfq_id, status });
      if (res.isSuccess) {
        alert(res.message);
        fetchQuoteSummary();
      }
    } catch (err) {
      console.error("Status update failed:", err);
      alert("Failed to update status");
    }
  };

  const vendorTable = (vendors) => (
    <DataTable value={vendors} responsiveLayout="scroll" className="mt-2">
      <Column field="vendor_name" header="Vendor" />
      <Column field="company" header="Company" />
      <Column field="email" header="Email" />
      <Column field="rank" header="Rank" />
      <Column field="total" header="Total Quote" />
      <Column
        header="Quoted Items"
        body={(rowData) =>
          rowData.quotes.map(
            (q) =>
              `${q.item_name}: ₹${q.quoted_price}` +
              (rowData.quotes.indexOf(q) < rowData.quotes.length - 1
                ? ", "
                : "")
          )
        }
      />
    </DataTable>
  );

  return (
    <div className="p-4">
      <h3>Quote Summary by RFQ</h3>
      {data.map((rfq, i) => (
        <Panel key={i} header={`${rfq.rfq_number} - ${rfq.title}`} toggleable>
          <p>{rfq.description}</p>
          {vendorTable(rfq.vendors)}

          <div className="mt-3 flex justify-content-end">
            <button
              className="p-button p-button-success"
              onClick={() => handleUpdateStatus(rfq.rfq_number, "evaluated")}
            >
              Mark as Evaluated
            </button>
          </div>
        </Panel>
      ))}
    </div>
  );
};

export default QuoteSummary;
