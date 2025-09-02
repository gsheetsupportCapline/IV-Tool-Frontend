import { useState, useEffect } from "react";
import Table from "./Table";

const Status = ({ data, dateRange, patientId }) => {
  const [selectedOption, setSelectedOption] = useState("no");
  const [filteredData, setFilteredData] = useState([]);

  const dataHeaderMapping = {
    "Patient ID": "patientId",
    "Appointment Date": "appointmentDate",
    "Completion Status": "completionStatus",
    "Plan Type": "planType",
    "IV Type": "ivType",
    Remarks: "ivRemarks",
    "Insurance Name": "insuranceName",
  };

  const hasValidFilters = () => {
    const hasDateRange = dateRange?.startDate && dateRange?.endDate;
    const hasPatientId = patientId && patientId.trim() !== '';
    return hasDateRange || hasPatientId;
  };
  const matchesPatientId = (item) => {
    if (!item || !item.patientId) {
      return false;
    }

    try {
      const searchValue = String(patientId).toLowerCase().trim();
      const itemValue = String(item.patientId).toLowerCase().trim();
      
      if (searchValue === '') {
        return true; // Return true when no patient ID filter
      }

      return itemValue === searchValue;
    } catch (error) {
      console.error('Error matching patient ID:', error);
      return false;
    }
  };

  const isInDateRange = (itemDate, startDate, endDate) => {
    try {
      if (!startDate || !endDate) return true; // Return true when no date range
      const start = new Date(startDate);
      const end = new Date(endDate);
      const date = new Date(itemDate);
      return start <= date && end >= date;
    } catch (error) {
      console.error('Error checking date range:', error);
      return false;
    }
  };

  const getFilteredData = () => {
    if (!hasValidFilters()) {
      return [];
    }
    // Apply base filters (patient ID and date range)
    let filtered = data.filter(item => 
      matchesPatientId(item) && 
      isInDateRange(item.appointmentDate, dateRange?.startDate, dateRange?.endDate)
    );

    // Apply status filter based on selected tab
    if (selectedOption !== "yes") {
      filtered = filtered.filter(item => {
        return selectedOption === "no" 
          ? item.completionStatus === "In Process"
          : item.completionStatus === "Completed";
      });
    }

    // Sort by appointment date and time
    filtered.sort((a, b) => {
      const dateTimeA = new Date(`${a.appointmentDate} ${a.appointmentTime}`);
      const dateTimeB = new Date(`${b.appointmentDate} ${b.appointmentTime}`);
      return dateTimeB - dateTimeA;
    });

    return filtered;
  };

  // Get counts based on base filters only (independent of selected tab)
  const getBaseCounts = () => {
    if (!hasValidFilters()) {
      return {
        all: 0,
        inProcess: 0,
        completed: 0
      };
    }
    const baseFiltered = data.filter(item => 
      matchesPatientId(item) && 
      isInDateRange(item.appointmentDate, dateRange?.startDate, dateRange?.endDate)
    );

    return {
      all: baseFiltered.length,
      inProcess: baseFiltered.filter(item => item.completionStatus === "In Process").length,
      completed: baseFiltered.filter(item => item.completionStatus === "Completed").length
    };
  };

  const transformData = (data) => {
    return data.map((item) => {
      const newItem = {};
      Object.keys(dataHeaderMapping).forEach((header) => {
        if (header === "Appointment Date") {
          newItem[header] = new Date(
            item[dataHeaderMapping[header]]
          ).toLocaleDateString();
        } else {
          newItem[header] = item[dataHeaderMapping[header]];
        }
      });
      return newItem;
    });
  };

  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
  };

  useEffect(() => {
    setFilteredData(getFilteredData());
  }, [data, dateRange, patientId, selectedOption]);

  const counts = getBaseCounts();

  return (
    <>
      <div className="flex items-center justify-center">
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
              className="flex justify-center cursor-pointer rounded-full border border-gray-300 bg-gray-50 py-2 px-4 hover:bg-slate-300 focus:outline-none peer-checked:border-transparent peer-checked:ring-2 peer-checked:ring-indigo-500 transition-all duration-500 ease-in-out"
              htmlFor="yes"
            >
              <p className="mr-4 ml-10 font-tahoma">All Appointments [{counts.all}]</p>
            </label>
            {selectedOption === "yes" && (
              <div className="absolute bg-slate-50 shadow-lg left-0 p-6 border mt-2 border-indigo-300 rounded-lg w-[100vw] h-[70vh] mx-auto transition-all duration-500 ease-in-out translate-x-40 opacity-0 invisible peer-checked:opacity-100 peer-checked:visible peer-checked:translate-x-1">
                <Table data={transformData(filteredData)} headers={Object.keys(dataHeaderMapping)} />
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
              className="flex justify-center cursor-pointer rounded-full border border-gray-300 bg-grey-50 py-2 px-4 hover:bg-slate-300 focus:outline-none peer-checked:border-transparent peer-checked:ring-2 peer-checked:ring-indigo-500 transition-all duration-500 ease-in-out"
              htmlFor="no"
            >
              <p className="mr-4 ml-10 font-tahoma">In-Process IVs [{counts.inProcess}]</p>
            </label>
            {selectedOption === "no" && (
              <div className="absolute bg-slate-50 shadow-lg left-0 p-6 border mt-2 border-indigo-300 rounded-lg w-[100vw] h-[70vh] mx-auto transition-all duration-500 ease-in-out translate-x-40 opacity-0 invisible peer-checked:opacity-100 peer-checked:visible peer-checked:translate-x-1">
                <Table data={transformData(filteredData)} headers={Object.keys(dataHeaderMapping)} />
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
              className="flex justify-center cursor-pointer rounded-full border border-gray-300 bg-grey-50 py-2 px-4 hover:bg-slate-300 focus:outline-none peer-checked:border-transparent peer-checked:ring-2 peer-checked:ring-indigo-500 transition-all duration-500 ease-in-out"
              htmlFor="yesno"
            >
              <p className="mr-4 ml-10 font-tahoma">Completed IVs [{counts.completed}]</p>
            </label>
            {selectedOption === "yesno" && (
              <div className="absolute bg-slate-50 shadow-lg left-0 p-6 border mt-2 border-indigo-300 rounded-lg w-[100vw] h-[70vh] mx-auto transition-all duration-500 ease-in-out translate-x-40 opacity-0 invisible peer-checked:opacity-100 peer-checked:visible peer-checked:translate-x-1">
                <Table data={transformData(filteredData)} headers={Object.keys(dataHeaderMapping)} />
              </div>
            )}
          </li>
        </ul>
      </div>
    </>
  );
};

export default Status;