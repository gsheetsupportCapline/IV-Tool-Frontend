import { useState } from "react";
import Datepicker from "react-tailwindcss-datepicker";

const DatePicker = ({ officeName, onDateChange }) => {
  const [value, setValue] = useState({
    // startDate: new Date(),
    // endDate: new Date().setMonth(11),
    startDate: null,
    endDate: null,
  });

  const handleValueChange = (newValue) => {
    console.log("newValue:", newValue);
    setValue(newValue);
    onDateChange(newValue);
  };

  return (
    <div className="flex items-center my-1 bg-slate-400  ">
      <div className="p-2 mr-4 bg-slate-500 rounded-xl">{officeName}</div>
      <p className="mr-4 ml-10">Appointment Date</p>
      <div className="w-1/4  ">
        <Datepicker value={value} onChange={handleValueChange} />
      </div>
    </div>
  );
};

export default DatePicker;
