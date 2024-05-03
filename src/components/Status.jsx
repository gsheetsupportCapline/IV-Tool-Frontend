import React, { useState } from "react";
import Table from "./Table";

function Status() {
  // State to keep track of the selected radio button
  const [selectedOption, setSelectedOption] = useState("");

  // Function to handle radio button changes
  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
  };

  return (
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
              <Table />
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
            In-Process IVs
          </label>
          {/* Conditional rendering based on the selected option */}
          {selectedOption === "no" && (
            <div className="absolute bg-white shadow-lg left-0 p-6 border mt-2 border-indigo-300 rounded-lg w-[97vw] mx-auto transition-all duration-500 ease-in-out translate-x-40 opacity-0 invisible peer-checked:opacity-100 peer-checked:visible peer-checked:translate-x-1">
              <Table />
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
            Completed IVs
          </label>
          {/* Conditional rendering based on the selected option */}
          {selectedOption === "yesno" && (
            <div className="absolute bg-white shadow-lg left-0 p-6 border mt-2 border-indigo-300 rounded-lg w-[97vw] mx-auto transition-all duration-500 ease-in-out translate-x-40 opacity-0 invisible peer-checked:opacity-100 peer-checked:visible peer-checked:translate-x-1">
              <Table />
            </div>
          )}
        </li>
      </ul>
    </div>
  );
}

export default Status;
