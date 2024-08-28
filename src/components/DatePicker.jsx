import { useState } from "react";
import Datepicker from "react-tailwindcss-datepicker"; 


const DatePicker = ({ onDateChange }) => {
  const [value, setValue] = useState({
    startDate: null,
    endDate: null,
  });

  const handleValueChange = (newValue) => {
    console.log("newValue:", newValue);
    setValue(newValue);
    onDateChange(newValue);
  };

  return (
    <div className="flex items-center my-1 bg-blue-500  rounded" >
      <p className="mr-4 ml-10 text-white ">Appointment </p>
      <div className="w-full">
        <Datepicker
          value={value}
          onChange={handleValueChange}
          showShortcuts={true}
          primaryColor={"blue"}
        />
      </div>
    </div>
  );
};

export default DatePicker;
