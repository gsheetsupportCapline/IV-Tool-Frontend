import { useState, useEffect } from "react";
import DatePicker from "./DatePicker";
import Header from "./Header";
import Status from "./Status";

const Home = () => {
  const [data, setData] = useState([]);
  const officeName = localStorage.getItem("loggedInOffice");
  console.log(officeName);
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });

  const handleDateChange = (dates) => {
    console.log("dates in home", dates);
    if (dates) {
      setDateRange(dates);
    } else {
      console.log("date range is getting null ");
      setDateRange({ startDate: null, endDate: null });
    }
  };
  console.log("dateRange in Home:", dateRange);
  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(
        `http://localhost:3000/api/appointments/fetch-appointments/${officeName}`
      );
      const responseData = await response.json();
      if (responseData && responseData.appointments) {
        console.log(responseData);
        setData(responseData.appointments);
      } else {
        console.log("API did not return data ", responseData);
        setData([]);
      }
    };
    fetchData();
  }, [officeName]);
  return (
    <>
      <Header />
      <DatePicker officeName={officeName} onDateChange={handleDateChange} />
      <Status data={data} dateRange={dateRange} />
    </>
  );
};

export default Home;
