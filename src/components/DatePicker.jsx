import { useState, useEffect } from "react";
import Datepicker from "react-tailwindcss-datepicker";

const DatePicker = ({ onDateChange, value: externalValue }) => {
  const [value, setValue] = useState({
    startDate: null,
    endDate: null,
  });

  // Update internal state when external value changes
  useEffect(() => {
    if (externalValue) {
      setValue(externalValue);
    }
  }, [externalValue]);

  const handleValueChange = (newValue) => {
    console.log("DatePicker newValue:", newValue);
    setValue(newValue);
    onDateChange(newValue);
  };

  return (
    <div className="w-full h-10 relative z-[100]">
      <Datepicker
        value={value}
        onChange={handleValueChange}
        showShortcuts={true}
        primaryColor={"slate"}
        inputClassName="w-full h-10 px-3 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-0 focus:border-slate-400 transition-colors bg-white text-slate-700"
        containerClassName="relative z-[150]"
        popoverDirection="down"
        toggleClassName="absolute right-3 top-1/2 transform -translate-y-1/2 z-[110]"
        displayFormat="MM/DD/YYYY"
        placeholder="Select Date Range"
        configs={{
          shortcuts: {
            today: "Today",
            yesterday: "Yesterday",
            past: (period) => `Last ${period} Days`,
            currentMonth: "This Month",
            pastMonth: "Last Month",
          },
        }}
      />
    </div>
  );
};

export default DatePicker;
