import { useState } from "react";
import Datepicker from "react-tailwindcss-datepicker"; // Ensure this is the correct import

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
    <div className="flex items-center my-1 bg-slate-400">
      <p className="mr-4 ml-10">Appointment Date</p>
      <div className="w-1/4">
        <Datepicker
          value={value}
          onChange={handleValueChange}
          showShortcuts={true}
        />
      </div>
    </div>
  );
};

export default DatePicker;
