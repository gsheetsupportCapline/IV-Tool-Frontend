// ProductionIV.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

import Datepicker from 'react-tailwindcss-datepicker';
import * as DropdownValues from './DropdownValues';
import BASE_URL from '../config/apiConfig';
const ProductionIV = () => {
  const [users, setUsers] = useState([]);
  const [data, setData] = useState([]);
  const [value, setValue] = useState({
    startDate: null,
    endDate: null,
  });
  const [userIdToUserMap, setUserIdToUserMap] = useState({});
  const [dateType, setDateType] = useState('appointmentDate');
  const handleValueChange = (newValue) => {
    console.log('New Value:', newValue); // Debugging
    setValue({
      startDate: new Date(newValue.startDate),
      endDate: new Date(newValue.endDate),
    });
  };

  const handleDateTypeChange = (e) => {
    setDateType(e.target.value);
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
        console.error('Error fetching users', error);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!value.startDate || !value.endDate) {
        return; // Don't fetch data if dates are not selected
      }

      const startDateParam = value.startDate.toISOString().split('T')[0];
      const endDateParam = value.endDate.toISOString().split('T')[0];

      const url = `${BASE_URL}/api/appointments/completed-appointments?startDate=${startDateParam}&endDate=${endDateParam}&dateType=${dateType}`;

      try {
        const response = await axios.get(url);
        setData(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [value, dateType]);

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
      .filter((user) => user.role == 'user')
      .map((user) => user.name);
    const headers = ['Office', ...userName];

    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 flex-1">
        <div
          className="overflow-auto"
          style={{ maxHeight: 'calc(100vh - 12rem)' }}
        >
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0">
              <tr>
                {headers.map((header, index) => (
                  <th
                    key={index}
                    className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider border-b-2 border-gray-200"
                  >
                    {index === 0 ? '🏢' : '👤'} {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {DropdownValues.officeNames.map((officeNameObj, index) => (
                <tr
                  key={index}
                  className={`hover:bg-blue-50 transition-colors duration-200 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                  }`}
                >
                  <td className="px-6 py-3 text-left font-medium text-gray-900 border-r border-gray-200">
                    {officeNameObj.officeName}
                  </td>
                  {userName.map((username, userIndex) => (
                    <td
                      key={userIndex}
                      className="px-6 py-3 text-center text-gray-700"
                    >
                      <span
                        className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-medium ${
                          (processedData[officeNameObj.officeName]?.[
                            username
                          ] || 0) > 0
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {processedData[officeNameObj.officeName]?.[username] ||
                          0}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full" style={{ maxHeight: 'calc(100vh - 8rem)' }}>
      <div className="bg-gray-100 p-3 rounded border mb-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <label className="text-gray-700 text-sm font-medium">Date Type:</label>
            <select
              value={dateType}
              onChange={handleDateTypeChange}
              className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 bg-white"
            >
              <option value="appointmentDate">Appointment Date</option>
              <option value="ivCompletedDate">Completion Date</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-gray-700 text-sm font-medium">Date Range:</label>
            <div className="border border-gray-300 rounded bg-white">
              <Datepicker value={value} onChange={handleValueChange} />
            </div>
          </div>
        </div>
      </div>
      {renderTable()}
    </div>
  );
};

export default ProductionIV;
