// Import necessary hooks and components
import { useState, useEffect } from "react";

import Datepicker from "react-tailwindcss-datepicker";
import * as DropdownValues from "./DropdownValues";
import BASE_URL from "../config/apiConfig";

const PendingIV = () => {
  const [value, setValue] = useState({
    // startDate: new Date(),
    startDate: null,
    // endDate: new Date(new Date().setMonth(new Date().getMonth() + 11)), // Correctly creates a new Date instance for endDate
    endDate: null,
  });

  const [data, setData] = useState([]);

  const handleValueChange = (newValue) => {
    console.log("New Value:", newValue);
    // Assuming newValue is { startDate: Date, endDate: Date }
    setValue({
      startDate: new Date(newValue.startDate),
      endDate: new Date(newValue.endDate),
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      const startDateParam = value.startDate.toISOString().split("T")[0];
      const endDateParam = value.endDate.toISOString().split("T")[0];

      const url = `${BASE_URL}/api/appointments/fetch-unassigned-appointments?startDate=${startDateParam}&endDate=${endDateParam}`;

      try {
        const response = await fetch(url);
        const responseData = await response.json();
        setData(responseData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [value]);

  const processDataForTable = () => {
    const processedData = {};

    data.forEach((item) => {
      item.offices.forEach((office) => {
        if (!processedData[item._id]) {
          processedData[item._id] = {};
        }
        if (office && office.officeName) {
          processedData[item._id][office.officeName] = office.count;
        }
      });
    });

    // Ensure all offices are present for every date, filling missing counts with 0
    const officeNames = DropdownValues.officeNames.map(
      (name) => name.officeName
    );
    officeNames.forEach((officeName) => {
      data.forEach((item) => {
        if (!processedData[item._id]) {
          processedData[item._id] = {};
        }
        if (!processedData[item._id][officeName]) {
          processedData[item._id][officeName] = 0;
        }
      });
    });

    return processedData;
  };

  const renderTable = () => {
    const processedData = processDataForTable();

    const uniqueDates = [...new Set(data.map((item) => item._id))].sort();
    const headers = ["Office", ...uniqueDates];

    return (
      <table>
        <thead>
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                className="px-4 py-2 bg-gray-200 text-gray-700 text-center sticky top-0"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {DropdownValues.officeNames.map((officeNameObj, index) => (
            <tr
              key={index}
              className={`border ${
                index % 2 === 0 ? "bg-white" : "bg-gray-100"
              }`}
            >
              <td className="border px-4 py-2 text-center">
                {officeNameObj.officeName}
              </td>
              {uniqueDates.map((date) => (
                // Accessing processedData with date and then office name
                <td key={date} className="border px-4 py-2 text-center">
                  {processedData[date]?.[officeNameObj.officeName] || 0}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <>
      <div className="flex items-center my-1 bg-slate-400">
        <p className="mr-4 ml-10 font-tahoma">Appointment Date</p>
        <div className="w-1/4">
          <Datepicker value={value} onChange={handleValueChange} />
        </div>
      </div>
      {renderTable()}
    </>
  );
};

export default PendingIV;
