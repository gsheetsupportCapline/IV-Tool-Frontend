import { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import Header from "./Header";

const IVUser = () => {
  const [currentUserName, setCurrentUserName] = useState("");

  const fetchCurrentUserName = () => {
    setCurrentUserName("Shubham Pandey");
  };

  useEffect(() => {
    fetchCurrentUserName();
  }, []);

  const handleSubmit = () => {
    console.log("Submitting table data...");
  };

  const [data, setData] = useState([
    {
      office: "Office 1",
      appointmentType: "Appointment Type 1",
      appointmentDate: "2023-04-01",
      appointmentTime: "10:00 AM",
      patientID: "12345",
      insuranceName: "Insurance Name 1",
      insurancePhone: "123-456-7890",
      policyHolderName: "Policy Holder 1",
      policyHolderDOB: "1980-01-01",
      memberID: "Member ID 1",
      patientName: "Patient Name 1",
      patientDOB: "2000-01-01",
    },
    {
      office: "Office 2",
      appointmentType: "Appointment Type 1",
      appointmentDate: "2023-04-01",
      appointmentTime: "10:00 AM",
      patientID: "12345",
      insuranceName: "Insurance Name 1",
      insurancePhone: "123-456-7890",
      policyHolderName: "Policy Holder 1",
      policyHolderDOB: "1980-01-01",
      memberID: "Member ID 1",
      patientName: "Patient Name 1",
      patientDOB: "2000-01-01",
    },
    {
      office: "Office 3",
      appointmentType: "Appointment Type 1",
      appointmentDate: "2023-04-01",
      appointmentTime: "10:00 AM",
      patientID: "12345",
      insuranceName: "Insurance Name 1",
      insurancePhone: "123-456-7890",
      policyHolderName: "Policy Holder 1",
      policyHolderDOB: "1980-01-01",
      memberID: "Member ID 1",
      patientName: "Patient Name 1",
      patientDOB: "2000-01-01",
    },
    // Add more objects for more rows
  ]);

  const onEditorValueChange = (props, value) => {
    let updatedData = [...data];
    updatedData[props.rowIndex][props.field] = value;
    setData(updatedData);
  };

  return (
    <>
      <Header />
      <div className="card">
        <div>
          <label htmlFor="completedBy">Completed By:</label>
          <InputText id="completedBy" value={currentUserName} disabled />
        </div>
        <DataTable
          value={data}
          paginator
          rows={5}
          rowsPerPageOptions={[5, 10, 25, 50]}
          tableStyle={{ minWidth: "50rem" }}
          editMode="cell" // Enable cell editing
          onCellEditComplete={(e) => onEditorValueChange(e, e.value)} // Handle cell edit completion
        >
          <Column
            field="insurance"
            header="Insurance"
            body={(rowData, { rowIndex, field }) => (
              <InputText
                value={rowData.insurance}
                onChange={(e) =>
                  onEditorValueChange({ rowIndex, field }, e.target.value)
                }
                style={{
                  fontSize: "14px",
                  backgroundColor: "#e9ecef",
                  border: "1px solid #ced4da",
                }}
              />
            )}
            style={{ width: "15%" }}
          ></Column>
          <Column
            field="source"
            header="Source"
            body={(rowData, { rowIndex, field }) => (
              <InputText
                value={rowData.source}
                onChange={(e) =>
                  onEditorValueChange({ rowIndex, field }, e.target.value)
                }
                style={{
                  fontSize: "14px",
                  backgroundColor: "#e9ecef",
                  border: "1px solid #ced4da",
                }}
              />
            )}
            style={{ width: "15%" }}
          ></Column>
          <Column
            field="planType"
            header="Plan Type"
            body={(rowData, { rowIndex, field }) => (
              <InputText
                value={rowData.planType}
                onChange={(e) =>
                  onEditorValueChange({ rowIndex, field }, e.target.value)
                }
                style={{
                  fontSize: "14px",
                  backgroundColor: "#e9ecef",
                  border: "1px solid #ced4da",
                }}
              />
            )}
            style={{ width: "15%" }}
          ></Column>
          <Column
            field="office"
            header="Office"
            style={{ width: "15%" }}
          ></Column>
          <Column
            field="appointmentType"
            header="Appointment Type"
            style={{ width: "15%" }}
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
            field="patientID"
            header="Patient ID"
            style={{ width: "15%" }}
          ></Column>
          <Column
            field="insuranceName"
            header="Insurance Name"
            style={{ width: "15%" }}
          ></Column>
          <Column
            field="insurancePhone"
            header="Insurance Phone"
            style={{ width: "15%" }}
          ></Column>
          <Column
            field="policyHolderName"
            header="Policy Holder Name"
            style={{ width: "15%" }}
          ></Column>
          <Column
            field="policyHolderDOB"
            header="Policy Holder DOB"
            style={{ width: "15%" }}
          ></Column>
          <Column
            field="memberID"
            header="Member ID"
            style={{ width: "15%" }}
          ></Column>
          <Column
            field="patientName"
            header="Patient Name"
            style={{ width: "15%" }}
          ></Column>
          <Column
            field="patientDOB"
            header="Patient DOB"
            style={{ width: "15%" }}
          ></Column>
        </DataTable>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "20px",
          }}
        >
          <Button
            className="bg-indigo-500  w-1/6 text-white font-bold"
            label="Submit"
            onClick={handleSubmit}
          />
        </div>
      </div>
    </>
  );
};

export default IVUser;
