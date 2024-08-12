// src/components/OfficeDropdown.jsx

const OfficeDropdown = ({
  onSelect,
  allowedOffices,
  showAllOffices = false,
}) => {
  const officeNames = [
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
  ];
  // Check if officeOptions is null (indicating admin role)
  // If not null, filter officeNames based on officeOptions
  const filteredOfficeNames = showAllOffices
    ? officeNames
    : officeNames.filter((name) => allowedOffices.includes(name));

  return (
    <>
   
    <select onChange={(e) => onSelect(e.target.value)}>
      <option value="">Select Office</option>
      {filteredOfficeNames.map((office) => (
        <option key={office} value={office}>
          {office}
        </option>
      ))}
    </select>
    
 
    </>
   
  );
};

export default OfficeDropdown;
