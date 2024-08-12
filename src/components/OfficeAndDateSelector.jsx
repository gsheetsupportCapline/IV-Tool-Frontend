import { useState, useEffect } from "react";
import OfficeDropdown from "./OfficeDropdown";
import DatePicker from "./DatePicker";

const OfficeAndDateSelector = ({ onOfficeChange, onDateChange }) => {
  const [selectedOffice, setSelectedOffice] = useState("");
  const [allowedOffices, setAllowedOffices] = useState([]);

  // const [dateRange, setDateRange] = useState({
  //   startDate: null,
  //   endDate: null,
  // });

  useEffect(() => {
    const role = localStorage.getItem("role");
    let assignedOffices = [];
    if (role === "admin") {
      // Admins can see all offices
      setAllowedOffices([
        "Aransas",
        "Azle",
        "Beaumont",
        "Benbrook",
        "Calallen",
        "Crosby",
        "Devine",
        "Elgin",
        "Grangerland",
        "Huffman",
        "Jasper",
        "Lavaca",
        "Liberty",
        "Lytle",
        "Mathis",
        "Potranco",
        "Rio Bravo",
        "Riverwalk",
        "Rockdale",
        "Sinton",
        "Splendora",
        "Springtown",
        "Tidwell",
        "Victoria",
        "Westgreen",
        "Winnie",
        "OS",
      ]);
    } else if (role === "officeuser") {
      // Office users see only their assigned offices
      const assignedOfficesString = localStorage.getItem("assignedOffice");
      assignedOffices = assignedOfficesString
        ? assignedOfficesString.split(",")
        : [];
      setAllowedOffices(assignedOffices);
    } else {
      // Default case, set an empty array if the role is unknown or not supported
      setAllowedOffices([]);
    }
  }, []);

  const handleOfficeChange = (selectedOffice) => {
    setSelectedOffice(selectedOffice);
    onOfficeChange(selectedOffice); // Notify parent component of the change
  };

  const handleDateChange = (dates) => {
    onDateChange(dates); // Notify parent component of the change
  };

  return (
    <div className="flex  my-1 bg-slate-400 p-2">
      <div className="flex items-center space-x-4  ">
        <OfficeDropdown
         
          onSelect={handleOfficeChange}
          allowedOffices={allowedOffices}
          showAllOffices={localStorage.getItem("role") !== "officeuser"}
        />
        <DatePicker onDateChange={handleDateChange} />
      </div>
    </div>
  );
};

export default OfficeAndDateSelector;
