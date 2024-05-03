import { React, useState } from "react";
import Datepicker from "react-tailwindcss-datepicker";

const officeNames = [
  "Aransas",
  "Azle",
  "Beaumont",
  "Benbrook",
  "Brodie",
  "Calallen",
  "Crosby",
  "Devine",
  "Elgin",
  "Huffman",
  "Jasper",
  "Lavaca",
  "Liberty",
  "Lucas",
  "Lytle",
  "Mathis",
  "Potranco",
  "Rio Bravo",
  "Riverwalk",
  "Rockdale",
  "Rockwall",
  "San Mateo",
  "Sinton",
  "Splendora",
  "Springtown",
  "Tidwell",
  "Victoria",
  "Westgreen",
  "Winnie",
];

const DatePicker = () => {
  const [value, setValue] = useState({
    startDate: new Date(),
    endDate: new Date().setMonth(11),
  });
  const [selectedOffice, setSelectedOffice] = useState(officeNames[0]);
  const handleValueChange = (newValue) => {
    console.log("newValue:", newValue);
    setValue(newValue);
  };
  const handleOfficeChange = (event) => {
    setSelectedOffice(event.target.value);
  };
  return (
    <div className="flex items-center my-1 bg-slate-400">
      <select
        className="mr-4 bg-slate-500"
        value={selectedOffice}
        onChange={handleOfficeChange}
      >
        {officeNames.map((office) => (
          <option key={office} value={office}>
            {office}
          </option>
        ))}
      </select>
      <p className="mr-4">Appointment Date</p>
      <div className="w-1/4  ">
        <Datepicker value={value} onChange={handleValueChange} />
      </div>
    </div>
  );
};

export default DatePicker;
