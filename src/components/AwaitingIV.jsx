// Import necessary hooks and components
import { useState, useEffect } from "react";
import Header from "./Header";
import Datepicker from "react-tailwindcss-datepicker";
import { officeNames } from "./DropdownValues";
import BASE_URL from "../config/apiConfig";

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
      <div className="flex items-center my-1 bg-slate-400 p-2">
        <div className="flex space-x-4">
          <select className="form-select mt-2" onChange={handleOfficeChange}>
            <option value="">Office</option>
            {officeNames.map((office) => (
              <option key={office.id} value={office.officeName}>
                {office.officeName}
              </option>
            ))}
          </select>
          <div className="flex items-center my-1 bg-slate-400">
            <p className="mr-6 ml-10 whitespace-nowrap text-sm">
              Appointment Date
            </p>
            <div className="w-full">
              <Datepicker value={value} onChange={handleValueChange} />
            </div>
          </div>
        </div>
      </div>
      {/* Render Appointments in a Table */}
      <div className="mt-4 p-4 bg-white shadow-md rounded-lg w-full">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-light-blue text-black">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                IV Remarks
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                IV Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Plan Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Appt. Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Appt. Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Patient ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Ins Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Pt Name
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {appointments.map((appointment, index) => (
              <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : ""}>
                <td className="px-6 py-2">{appointment.ivRemarks}</td>
                <td className="px-6 py-2">{appointment.ivType}</td>
                <td className="px-6 py-2">{appointment.planType}</td>
                <td className="px-6 py-2">{appointment.appointmentDate}</td>
                <td className="px-6 py-2">{appointment.appointmentTime}</td>
                <td className="px-6 py-2">{appointment.patientId}</td>
                <td className="px-6 py-2">{appointment.insuranceName}</td>
                <td className="px-6 py-2">{appointment.patientName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default AwaitingIV;
