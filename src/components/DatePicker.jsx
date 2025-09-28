import { useState } from 'react';
import Datepicker from 'react-tailwindcss-datepicker';

const DatePicker = ({ onDateChange }) => {
  const [value, setValue] = useState({
    startDate: null,
    endDate: null,
  });

  const handleValueChange = (newValue) => {
    console.log('newValue:', newValue);
    setValue(newValue);
    onDateChange(newValue);
  };

  return (
    <div className="w-full h-10">
      <Datepicker
        value={value}
        onChange={handleValueChange}
        showShortcuts={true}
        primaryColor={'slate'}
        inputClassName="w-full h-10 px-3 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-0 focus:border-slate-400 transition-colors bg-white text-slate-700"
        containerClassName="relative"
        toggleClassName="absolute right-3 top-1/2 transform -translate-y-1/2"
        displayFormat="MM/DD/YYYY"
        placeholder="Select Date Range"
      />
    </div>
  );
};

export default DatePicker;
