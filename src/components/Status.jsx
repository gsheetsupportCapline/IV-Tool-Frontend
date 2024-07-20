import { useState } from "react";
import Table from "./Table";
import { useEffect } from "react";
const Status = ({ data, dateRange }) => {
  // State to keep track of the selected radio button
  const [selectedOption, setSelectedOption] = useState("");
  const [allFilteredAppointmentCount, setAllFilteredAppointmentCount] =
    useState(0);
  const [inProcessCount, setInProcessCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
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

    const isInDateRange = startDate <= itemDate && endDate >= itemDate;
    switch (selectedOption) {
      case "yes":
        return isInDateRange; // No additional filtering, show all items
      case "no":
        return item.completionStatus === "In Process" && isInDateRange;
      case "yesno":
        return item.completionStatus === "Completed" && isInDateRange;
      default:
        return false; // Hide items that don't match any filter
    }
  });
  console.log("Filtered data ", filteredData);

  const dataHeaderMapping = {
    "Patient ID": "patientId",
    "Appointment Date": "appointmentDate",
    "Completion Status": "completionStatus",
    "Plan Type": "planType",
    "IV Type": "ivType",
    Remarks: "ivRemarks",
    "Insurance Name": "insuranceName",
  };

  const transformedData = filteredData.map((item) => {
    const newItem = {};
    Object.keys(dataHeaderMapping).forEach((header) => {
      if (header === "Appointment Date") {
        // Format the date using toLocaleDateString
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
    "Completion Status",
    "Plan Type",
    "IV Type",
    "Remarks",
    "Insurance Name",
  ];
  // const allFilteredAppointment = filteredData.length;
  // const inProcessCount = filteredData.filter(
  //   (item) => item.completionStatus === "In Process"
  // ).length;
  // const completedCount = filteredData.filter(
  //   (item) => item.completionStatus === "Completed"
  // ).length;

  // Inside your Status component

  useEffect(() => {
    let allFilteredAppointment = 0;
    let inProcess = 0;
    let completed = 0;

    // Directly filter and count items during iteration
    data.forEach((item) => {
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      const itemDate = new Date(item.appointmentDate);
      const isInDateRange = startDate <= itemDate && endDate >= itemDate;
      // Only proceed if the item is within the date range
      if (isInDateRange) {
        if (!item.completionStatus) return; // Skip items without a completionStatus

        if (item.completionStatus === "In Process") {
          inProcess++;
        } else if (item.completionStatus === "Completed") {
          completed++;
        }

        allFilteredAppointment++; // Increment for each item in the date range
      }
    });

    setAllFilteredAppointmentCount(allFilteredAppointment);
    setInProcessCount(inProcess);
    setCompletedCount(completed);
  }, [data, dateRange]); // Depend on data and dateRange
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
              All Appointments {allFilteredAppointmentCount}
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
