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
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
        {/* Table Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-4">
          <h3 className="text-lg font-semibold text-white">
            Production Summary
          </h3>
          <p className="text-slate-300 text-sm mt-1">
            Completed appointments by office and team member
          </p>
        </div>

        {/* Table Content */}
        <div
          className="overflow-auto"
          style={{ maxHeight: 'calc(100vh - 20rem)' }}
        >
          <table className="w-full">
            <thead className="bg-slate-50 sticky top-0">
              <tr>
                {headers.map((header, index) => (
                  <th
                    key={index}
                    className="px-6 py-4 text-left text-sm font-semibold text-slate-700 border-b border-slate-200"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {DropdownValues.officeNames.map((officeNameObj, index) => (
                <tr
                  key={index}
                  className={`hover:bg-blue-50 transition-colors duration-200 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-slate-25'
                  }`}
                >
                  <td className="px-6 py-4 font-medium text-slate-900 border-r border-slate-100">
                    {officeNameObj.officeName}
                  </td>
                  {userName.map((username, userIndex) => {
                    const count =
                      processedData[officeNameObj.officeName]?.[username] || 0;
                    return (
                      <td key={userIndex} className="px-6 py-4 text-center">
                        <div
                          className={`inline-flex items-center justify-center px-3 py-2 rounded-lg text-sm font-semibold min-w-[50px] ${
                            count > 0
                              ? 'bg-green-100 text-green-800 border border-green-200'
                              : 'bg-slate-100 text-slate-500 border border-slate-200'
                          }`}
                        >
                          {count}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="bg-slate-50 px-4 py-2 border-t border-slate-200">
          <div className="flex justify-between items-center text-xs text-slate-600">
            <span>Total Offices: {DropdownValues.officeNames.length}</span>
            <span>Active Team Members: {userName.length}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4">
      {/* Page Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">
          IV Team Production
        </h1>
        <p className="text-slate-600 text-sm">
          Monitor team performance and completion statistics
        </p>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-lg shadow border border-slate-200 p-4 mb-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Date Type Filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-slate-700 whitespace-nowrap">
              Date Type:
            </label>
            <select
              value={dateType}
              onChange={handleDateTypeChange}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-slate-700 text-sm"
            >
              <option value="appointmentDate">Appointment Date</option>
              <option value="ivCompletedDate">Completion Date</option>
            </select>
          </div>

          {/* Date Range Filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-slate-700 whitespace-nowrap">
              Date Range:
            </label>
            <div className="border border-slate-300 rounded-lg bg-white">
              <Datepicker
                value={value}
                onChange={handleValueChange}
                inputClassName="text-sm px-3 py-2 border-0 focus:ring-0"
                toggleClassName="text-slate-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Production Table */}
      {renderTable()}
    </div>
  );
};

export default ProductionIV;
