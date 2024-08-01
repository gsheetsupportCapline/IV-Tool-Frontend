// ProductionIV.jsx
import { useState, useEffect } from "react";
import axios from "axios";

import Datepicker from "react-tailwindcss-datepicker";
import * as DropdownValues from "./DropdownValues";
import BASE_URL from "../config/apiConfig";
const ProductionIV = () => {
  const [users, setUsers] = useState([]);
  const [data, setData] = useState([]);
  const [value, setValue] = useState({
    startDate: null,
    endDate: null,
  });
  const [userIdToUserMap, setUserIdToUserMap] = useState({});
  const handleValueChange = (newValue) => {
    console.log("New Value:", newValue); // Debugging
    setValue({
      startDate: new Date(newValue.startDate),
      endDate: new Date(newValue.endDate),
    });
  };
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/auth/users`);
        const usersData = response.data.data;
        console.log(usersData);
        // Create a mapping of userId to user details
        const userMap = usersData.reduce((acc, user) => {
          acc[user._id] = user;
          return acc;
        }, {});

        setUserIdToUserMap(userMap);

        // Set the users state
        setUsers(usersData);
      } catch (error) {
        console.error("Error fetching users", error);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const startDateParam = value.startDate.toISOString().split("T")[0];
      const endDateParam = value.endDate.toISOString().split("T")[0];

      const url = `${BASE_URL}/api/appointments/completed-appointments?startDate=${startDateParam}&endDate=${endDateParam}`;

      try {
        const response = await axios.get(url);
        setData(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [value]);

  const processDataForTable = () => {
    const processedData = {};

    data.forEach(({ office, completedCount }) => {
      completedCount.forEach(({ userId, count }) => {
        const user = userIdToUserMap[userId];
        if (!processedData[office]) {
          processedData[office] = {};
        }
        if (user) {
          processedData[office][user.name] =
            (processedData[office][user.name] || 0) + count;
        } else {
          console.warn(`No user found for userId: ${userId}`);
        }
      });
    });
    console.log(processedData);
    return processedData;
  };
  const renderTable = () => {
    const processedData = processDataForTable(userIdToUserMap);
    const userName = users
      .filter((user) => user.role == "user")
      .map((user) => user.name);
    const headers = ["Office", ...userName];

    return (
      <table>
        <thead>
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                className="px-4 py-2 bg-gray-200 text-gray-700 text-center sticky top-1"
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

              {userName.map((username, userIndex) => (
                <td key={userIndex} className="border px-4 py-2 text-center">
                  {processedData[officeNameObj.officeName]?.[username] || 0}
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

export default ProductionIV;
