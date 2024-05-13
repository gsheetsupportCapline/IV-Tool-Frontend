// src/components/OfficeDropdown.jsx
import React from "react";

const OfficeDropdown = ({ onSelect }) => {
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

  return (
    <select
      className="shadow appearance-none border rounded py-2 px-3 w-full bg-gray-700 leading-tight focus:outline-none focus:shadow-outline"
      onChange={(e) => onSelect(e.target.value)}
    >
      <option value="">Select an Office</option>
      {officeNames.map((office) => (
        <option key={office} value={office}>
          {office}
        </option>
      ))}
    </select>
  );
};

export default OfficeDropdown;
