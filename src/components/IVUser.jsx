import { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import Header from "./Header";
import axios from "axios";
import { ListBox } from "primereact/listbox";

const IVUser = () => {
  const [currentUserName, setCurrentUserName] = useState("");
  const [data, setData] = useState([]);
  const [selectedIVRemark, setSelectedIVRemark] = useState(null);
  const [showListbox, setShowListbox] = useState(false);

  const ivRemarks = [
    { id: 1, remark: "Already done in same month" },
    { id: 2, remark: "Appt Cancelled" },
    { id: 3, remark: "Discounted Plan" },
    { id: 4, remark: "Benefit maxed out as per ES" },
    { id: 5, remark: "Benefit Response not Received" },
    { id: 6, remark: "Benefits not available on web" },
    { id: 7, remark: "Call insurance for policy holder" },
    { id: 8, remark: "Cash Patient - office" },
    { id: 9, remark: "Cash Patient - PI Team" },
    { id: 10, remark: "Completed" },
    { id: 11, remark: "Completed as Per Recall/Contx Workfow" },
    { id: 12, remark: "Coverage book Not available (HMO) (Day Team)" },
    { id: 13, remark: "Database Not Available (Day Team)" },
    { id: 14, remark: "Dependent not enrolled" },
    { id: 15, remark: "Emailed To Beam" },
    { id: 16, remark: "Fax not received" },
    { id: 17, remark: "Faxback Attached in SD" },
    { id: 18, remark: "Future activation date" },
    { id: 19, remark: "Inactive" },
    { id: 20, remark: "INCOMPLETE - Night IV needs to call for Benefits" },
    { id: 21, remark: "INCOMPLETE - Office needs to call for Benefits" },
    {
      id: 22,
      remark: "INCOMPLETE - Office needs to call for Benefits & History",
    },
    { id: 23, remark: "INCOMPLETE - Office needs to call for History" },
    { id: 24, remark: "Incomplete Information" },
    { id: 25, remark: "Ineligible" },
    { id: 26, remark: "Maintenance in Portal (Day Team)" },
    { id: 27, remark: "Maxed Out" },
    { id: 28, remark: "Medicaid IVs (Day Team)" },
    { id: 29, remark: "Medicaid IVs for Future Dates (Day Team)" },
    { id: 30, remark: "Medical Policy" },
    { id: 31, remark: "Missing Insurance Details" },
    { id: 32, remark: "No Dental Coverage" },
    { id: 33, remark: "No OON Benefits" },
    { id: 34, remark: "No OS Benefits" },
    { id: 35, remark: "Not able to contact with rep" },
    { id: 36, remark: "Not assigned to our office" },
    { id: 37, remark: "Not Found over Call" },
    { id: 38, remark: "office Closed" },
    { id: 39, remark: "Office denied to do the IV" },
    { id: 40, remark: "Only Ortho IV required as per ofc" },
    { id: 41, remark: "Only OS IV required as per ofc" },
    { id: 42, remark: "OS Patient" },
    { id: 43, remark: "Indemnity plan" },
    { id: 44, remark: "PCS Not Available (HMO) (Day Team)" },
    { id: 45, remark: "Pediatric Plan" },
    { id: 46, remark: "Policy Cancelled" },
    { id: 47, remark: "Portal Not Available (Day Team)" },
    { id: 48, remark: "Portal Not Working (Day Team)" },
    { id: 49, remark: "Previous Month" },
    { id: 50, remark: "Rep denied to provide info" },
    { id: 51, remark: "Repeated" },
    { id: 52, remark: "Return to Office" },
    { id: 53, remark: "Rush not Accepted" },
    { id: 54, remark: "Technical Issues" },
    { id: 55, remark: "Terminated" },
    { id: 56, remark: "Third party Issue - Office need to call" },
    { id: 57, remark: "To be done by Office" },
    { id: 58, remark: "To be Started" },
    { id: 59, remark: "Unable to retrive information" },
    { id: 60, remark: "Wrong information" },
    { id: 61, remark: "Provider not available on Provider Schedule" },
    { id: 62, remark: "Not Found over web, Night IV need to call" },
    { id: 63, remark: "Not found on web and call" },
    { id: 64, remark: "Not accepting HMO patient" },
    { id: 65, remark: "Completed, Not updated in ES, IV emailed" },
    { id: 66, remark: "Missing Insurance Details, No info ES" },
    { id: 67, remark: "Not Found over web" },
    { id: 68, remark: "Ortho/OS Provider on Scheduler" },
    { id: 69, remark: "IV Return - TX on Exchange above 18 years" },
    {
      id: 70,
      remark: "Office Is closed for the day, Patient need to reschedule.",
    },
    { id: 71, remark: "Faxback Attached in Drive" },
    { id: 72, remark: "Completed, Not assigned to Facility" },
    { id: 73, remark: "Technical Issue - Not received OTP/Fax" },
    { id: 74, remark: "Unable to check Provider/Facility Status" },
    { id: 75, remark: "Updated ES, IV has not created" },
    { id: 76, remark: "IV not created, Email sent for benefits" },
  ];

  const renderListBox = () => {
    return (
      <div className="p-d-flex p-ai-center">
        <span>{selectedIVRemark}</span>
        <button onClick={() => setShowListbox(true)}>Select</button>
        {showListbox && (
          <ListBox
            filter
            value={selectedIVRemark}
            onChange={(e) => {
              setSelectedIVRemark(e.value);
              setShowListbox(false);
            }}
            options={ivRemarks}
            optionLabel="remark"
            style={{ maxHeight: "200px", overflowY: "auto" }}
          />
        )}
      </div>
    );
  };

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
      // Pass userId here
      const response = await axios.get(
        `http://localhost:3000/api/appointments/user-appointments/66579cdeb9606e7391e09afb`
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
            body={renderListBox}
            style={{ width: "15%" }}
          />
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
