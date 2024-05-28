import { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import Header from "./Header";
import axios from "axios";

const IVUser = () => {
  const [currentUserName, setCurrentUserName] = useState("");
  const [data, setData] = useState([]);
  console.log("data", data);
  const fetchCurrentUserName = () => {
    setCurrentUserName("Shubham Pandey");
  };

  useEffect(() => {
    fetchCurrentUserName();
  }, []);

  const handleSubmit = async () => {
    try {
      console.log("Submitting table data...");

      // Iterate through each appointment in the data array
      for (let appointment of data) {
        // Construct the payload for the API call
        const payload = {
          userAppointmentId: appointment.assignedUser,
          appointmentId: appointment._id, // Assuming each appointment has a unique _id
          ivRemarks: appointment.ivRemarks,
          source: appointment.source,
          planType: appointment.planType,
        };
        console.log("Payload ", payload);
        // Make an API call to update the appointment details
        await axios.post(
          `http://localhost:3000/api/appointments/update-individual-appointment-details`,
          payload
        );
      }

      // After all updates are sent, refresh the data or show a success message
      alert("All appointments updated successfully!");
    } catch (error) {
      console.error("Error submitting table data:", error);
      alert("An error occurred while updating appointments.");
    }
  };

  useEffect(() => {
    // Fetch appointments for the current user
    const fetchAppointments = async () => {
      const response = await axios.get(
        `http://localhost:3000/api/appointments/user-appointments/663dea9588212cdbb741d280`
      );
      console.log("response data ", response.data);

      setData(response.data[0].appointments); // for one office
    };

    fetchAppointments();
  }, []);

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
            field="ivRemarks"
            header="IV Remarks"
            body={(rowData, { rowIndex, field }) => (
              <InputText
                value={rowData.ivRemarks}
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
            field="patientId"
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
            field="memberId"
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
