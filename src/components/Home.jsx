import { useState, useEffect } from "react";

import Header from "./Header";
import Status from "./Status";
import OfficeAndDateSelector from "./OfficeAndDateSelector";
import BASE_URL from "../config/apiConfig";
import PageNotFound from "./PageNotFound";
const Home = () => {
  const [selectedOffice, setSelectedOffice] = useState("");
  const [data, setData] = useState([]);
  const [error, setError] = useState(false);

  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });

  const fetchData = async () => {
    try {
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
    } catch (error) {
      setError(error);
    }
  };
  useEffect(() => {
    if (selectedOffice.length > 0) fetchData();
  }, [selectedOffice]);

  return (
    <>
      <Header />
      {error ? (
        <PageNotFound />
      ) : (
        <>
          <OfficeAndDateSelector
            onOfficeChange={setSelectedOffice}
            onDateChange={(dates) => setDateRange(dates)}
          />
          <Status data={data} dateRange={dateRange} />
        </>
      )}
    </>
  );
};

export default Home;
