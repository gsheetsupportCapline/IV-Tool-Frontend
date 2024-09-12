// Import necessary hooks and components
import { useState, useEffect } from "react";
import Header from "./Header";
import Datepicker from "react-tailwindcss-datepicker";
import { officeNames } from "./DropdownValues";
import BASE_URL from "../config/apiConfig";
import { DataGrid } from '@mui/x-data-grid';
import { Box } from '@mui/material';
const AwaitingIV = () => {
  const [value, setValue] = useState({
    startDate: null,
    endDate: null,
  });
  const [selectedOffice, setSelectedOffice] = useState(null); // New state for selected office
  const [appointments, setAppointments] = useState([]);
  const handleValueChange = (newValue) => {
    setValue({
      startDate: new Date(newValue.startDate),
      endDate: new Date(newValue.endDate),
    });
  };

  const handleOfficeChange = (event) => {
    setSelectedOffice(event.target.value);
  };

  useEffect(() => {
    const fetchData = async () => {
      let params = "";
      if (selectedOffice) {
        params += `&officeName=${selectedOffice}`;
      }
      const startDateParam = value.startDate.toISOString().split("T")[0];
      const endDateParam = value.endDate.toISOString().split("T")[0];

      const url = `${BASE_URL}/api/appointments/appointments-by-office-and-remarks?${params}&startDate=${startDateParam}&endDate=${endDateParam}`;
      console.log(url);
      try {
        const response = await fetch(url);
        const responseData = await response.json();
        setAppointments(responseData);
        //console.log(responseData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [value, selectedOffice]); // selectedOffice as a dependency

  return (
    <>
      <Header />
      <div className="flex items-center my-1 bg-slate-400 p-2 rounded">
        <div className="flex space-x-4 rounded ">
          <select className="form-select mt-2 rounded" onChange={handleOfficeChange}>
            <option value="">Select Office</option>
            {officeNames.map((office) => (
              <option key={office.id} value={office.officeName}>
                {office.officeName}
              </option>
            ))}
          </select>
          <div className="flex items-center my-1 bg-blue-500 rounded">
            <p className="mr-6 ml-10 text-white whitespace-nowrap font-tahoma">
              Appointment Date
            </p>
            <div className="w-full">
              <Datepicker value={value} onChange={handleValueChange} />
            </div>
          </div>
        </div>
      </div>
      {/* Render Appointments in a Table */}
       
      <Box sx={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={appointments}
          columns={[
            { field: 'ivRemarks', headerName: 'IV Remarks', flex: 1 },
            { field: 'ivType', headerName: 'IV Type', flex: 1 },
            { field: 'planType', headerName: 'Plan Type', flex: 1 },
            { field: 'appointmentDate', headerName: 'Appointment Date', flex: 1 },
            { field: 'appointmentTime', headerName: 'Appointment Time', flex: 1 },
            { field: 'patientId', headerName: 'Patient ID', flex: 1 },
            { field: 'insuranceName', headerName: 'Insurance Name', flex: 1 },
            { field: 'patientName', headerName: 'Patient Name', flex: 1 },
          ]}
          pageSize={5}
          rowsPerPageOptions={[5]}
          getRowId={(row) => row._id} 
        />
      </Box>
    </>
  );
};

export default AwaitingIV;
