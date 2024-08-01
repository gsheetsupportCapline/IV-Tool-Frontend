import { useState, useEffect } from "react";

import Header from "./Header";
import Status from "./Status";
import OfficeAndDateSelector from "./OfficeAndDateSelector";
import BASE_URL from "../config/apiConfig";
const Home = () => {
  const [selectedOffice, setSelectedOffice] = useState("");
  const [data, setData] = useState([]);

  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(
        `${BASE_URL}/api/appointments/fetch-appointments/${selectedOffice}`
      );
      const responseData = await response.json();
      console.log("Fetched data:", responseData);
      if (responseData && responseData.appointments) {
        const sortedAppointments = responseData.appointments.sort((a, b) => {
          // Assuming appointmentDate is in ISO 8601 format
          return new Date(b.appointmentDate) - new Date(a.appointmentDate);
        });
        setData(sortedAppointments);
      } else {
        console.log("API did not return data ", responseData);
        setData([]);
      }
    };
    fetchData();
  }, [selectedOffice]);

  return (
    <>
      <Header />
      <OfficeAndDateSelector
        onOfficeChange={setSelectedOffice}
        onDateChange={(dates) => setDateRange(dates)}
      />
      <Status data={data} dateRange={dateRange} />
    </>
  );
};

export default Home;
