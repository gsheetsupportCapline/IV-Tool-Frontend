import { useState } from "react";
import Table from "./Table";

const Status = ({ data, dateRange }) => {
  // State to keep track of the selected radio button
  const [selectedOption, setSelectedOption] = useState("");

  console.log("data in status component", data);
  console.log("dateRange in status component", dateRange);
  const filteredData = data.filter((item) => {
    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);
    const itemDate = new Date(item.appointmentDate);
    // console.log(
    //   `Comparing ${itemDate} with range ${dateRange.startDate} to ${dateRange.endDate}`
    // );
    console.log("item dat", itemDate);
    return startDate <= itemDate && endDate >= itemDate;
  });
  // console.log("Filtered data ", filteredData);

  const dataHeaderMapping = {
    "Patient ID": "patientId",
    "Appointment Date": "appointmentDate",
    Status: "status",
    "Plan Type": "planType",
    "IV Type": "ivType",
    Remarks: "remarks",
    "Insurance Name": "insuranceName",
  };

  const transformedData = filteredData.map((item) => {
    const newItem = {};
    Object.keys(dataHeaderMapping).forEach((header) => {
      if (header === "Appointment Date") {
        // Format the date using toLocaleDateString or a similar method
        newItem[header] = new Date(
          item[dataHeaderMapping[header]]
        ).toLocaleDateString();
      } else {
        // For other headers, just assign the value directly
        newItem[header] = item[dataHeaderMapping[header]];
      }
    });
    return newItem;
  });
  console.log("Transformed Data ", transformedData);
  // Function to handle radio button changes
  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
  };

  const headers = [
    "Patient ID",
    "Appointment Date",
    "Status",
    "Plan Type",
    "IV Type",
    "Remarks",
    "Insurance Name",
  ];

  const inProcessCount = filteredData.filter(
    (item) => item.status === "In Process"
  ).length;
  const completedCount = filteredData.filter(
    (item) => item.status === "Completed"
  ).length;
  return (
    <>
      <div className="flex items-center justify-center ">
        <ul className="mx-auto grid max-w-full w-full grid-cols-3 gap-x-5 px-8">
          <li className="">
            <input
              className="peer sr-only"
              type="radio"
              value="yes"
              name="answer"
              id="yes"
              checked={selectedOption === "yes"}
              onChange={handleOptionChange}
            />
            <label
              className="flex justify-center cursor-pointer rounded-full border border-gray-300 bg-white py-2 px-4 hover:bg-gray-50 focus:outline-none peer-checked:border-transparent peer-checked:ring-2 peer-checked:ring-indigo-500 transition-all duration-500 ease-in-out"
              htmlFor="yes"
            >
              IVs Additional Awaiting Info
            </label>
            {/* Conditional rendering based on the selected option */}
            {selectedOption === "yes" && (
              <div className="absolute bg-white shadow-lg left-0 p-6 border mt-2 border-indigo-300 rounded-lg w-[97vw] mx-auto transition-all duration-500 ease-in-out translate-x-40 opacity-0 invisible peer-checked:opacity-100 peer-checked:visible peer-checked:translate-x-1">
                <Table data={transformedData} headers={headers} />
              </div>
            )}
          </li>
          <li className="">
            <input
              className="peer sr-only"
              type="radio"
              value="no"
              name="answer"
              id="no"
              checked={selectedOption === "no"}
              onChange={handleOptionChange}
            />
            <label
              className="flex justify-center cursor-pointer rounded-full border border-gray-300 bg-white py-2 px-4 hover:bg-gray-50 focus:outline-none peer-checked:border-transparent peer-checked:ring-2 peer-checked:ring-indigo-500 transition-all duration-500 ease-in-out"
              htmlFor="no"
            >
              In-Process IVs {inProcessCount}
            </label>
            {/* Conditional rendering based on the selected option */}
            {selectedOption === "no" && (
              <div className="absolute bg-white shadow-lg left-0 p-6 border mt-2 border-indigo-300 rounded-lg w-[97vw] mx-auto transition-all duration-500 ease-in-out translate-x-40 opacity-0 invisible peer-checked:opacity-100 peer-checked:visible peer-checked:translate-x-1">
                <Table data={transformedData} headers={headers} />
              </div>
            )}
          </li>
          <li className="">
            <input
              className="peer sr-only"
              type="radio"
              value="yesno"
              name="answer"
              id="yesno"
              checked={selectedOption === "yesno"}
              onChange={handleOptionChange}
            />
            <label
              className="flex justify-center cursor-pointer rounded-full border border-gray-300 bg-white py-2 px-4 hover:bg-gray-50 focus:outline-none peer-checked:border-transparent peer-checked:ring-2 peer-checked:ring-indigo-500 transition-all duration-500 ease-in-out "
              htmlFor="yesno"
            >
              Completed IVs {completedCount}
            </label>
            {/* Conditional rendering based on the selected option */}
            {selectedOption === "yesno" && (
              <div className="absolute bg-white shadow-lg left-0 p-6 border mt-2 border-indigo-300 rounded-lg w-[97vw] mx-auto transition-all duration-500 ease-in-out translate-x-40 opacity-0 invisible peer-checked:opacity-100 peer-checked:visible peer-checked:translate-x-1">
                <Table data={transformedData} headers={headers} />
              </div>
            )}
          </li>
        </ul>
      </div>
    </>
  );
};

export default Status;
