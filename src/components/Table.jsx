import React, { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

const fetchData = async () => {
  return [
    {
      name: "John Doe",
      country: { name: "USA" },
      company: "ABC Corp",
      representative: { name: "Jane Doe" },
    },
    // Add more mock data as needed
  ];
};

const Table = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchData().then((data) => setData(data));
  }, []);

  return (
    <div className="card">
      <DataTable
        value={data}
        paginator
        rows={5}
        rowsPerPageOptions={[5, 10, 25, 50]}
        tableStyle={{ minWidth: "50rem" }}
      >
        <Column
          field="status"
          header="IV Status"
          style={{ width: "10%" }}
        ></Column>
        <Column
          field="remarks"
          header="IV Remarks"
          style={{ width: "10%" }}
        ></Column>
        <Column
          field="iv_type"
          header="IV Type"
          style={{ width: "10%" }}
        ></Column>
        <Column
          field="plan_type"
          header="Plan Type"
          style={{ width: "10%" }}
        ></Column>

        <Column
          field="appointmentDate"
          header="Appointment Date"
          style={{ width: "15%" }}
        ></Column>
        <Column
          field="appointmentTime"
          header="Appointment Time"
          style={{ width: "15%" }}
        ></Column>
        <Column
          field="patientId"
          header="Patient Id"
          style={{ width: "10%" }}
        ></Column>
        <Column
          field="insuranceName"
          header="Insurance Name"
          style={{ width: "25%" }}
        ></Column>
      </DataTable>
    </div>
  );
};

export default Table;
