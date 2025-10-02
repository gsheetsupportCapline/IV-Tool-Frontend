import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BASE_URL from '../config/apiConfig';

const UserAttendance = () => {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [users, setUsers] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [combinedData, setCombinedData] = useState([]);
  const [originalAttendanceData, setOriginalAttendanceData] = useState([]);
  const [hasAttendanceChanges, setHasAttendanceChanges] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState(new Set());

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/auth/users`);

      let userData = response.data;
      if (userData.data) {
        userData = userData.data;
      }

      // Filter active users with role 'user'
      const activeUsers = userData.filter(
        (user) => user.role === 'user' && user.isActive === true
      );

      setUsers(activeUsers);
      return activeUsers;
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch users data');
      return [];
    }
  };

  // Fetch attendance data for selected date
  const fetchAttendanceData = async (date) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/attendance/by-date?date=${date}`
      );

      let attendanceInfo = response.data;
      if (attendanceInfo.data) {
        attendanceInfo = attendanceInfo.data;
      }

      setAttendanceData(attendanceInfo);
      return attendanceInfo;
    } catch (err) {
      console.error('Error fetching attendance data:', err);
      setError('Failed to fetch attendance data');
      return [];
    }
  };

  // Combine user and attendance data
  const combineData = (usersList, attendanceList) => {
    const combined = usersList.map((user) => {
      // Find matching attendance record for this user
      const userAttendance = attendanceList.find(
        (attendance) => attendance.userId === user._id
      );

      const attendanceValue = userAttendance
        ? userAttendance.attendance
        : 'No Record';

      return {
        userId: user._id,
        userName: user.name,
        userEmail: user.email,
        shiftTime: user.shiftTime || 'Not Assigned',
        attendance: attendanceValue,
        originalAttendance: attendanceValue, // Store original for comparison
        assignedCount: userAttendance ? userAttendance.assigned.count : 0,
        appointmentIds: userAttendance
          ? userAttendance.assigned.appointmentIds
          : [],
        pendingIVs: 0, // Default to 0 for now
      };
    });

    setCombinedData(combined);
    setOriginalAttendanceData(
      combined.map((user) => ({
        userId: user.userId,
        attendance: user.attendance,
      }))
    );
    setHasAttendanceChanges(false);
  };

  // Load data when component mounts or date changes
  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const usersList = await fetchUsers();
      const attendanceList = await fetchAttendanceData(selectedDate);
      combineData(usersList, attendanceList);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount and when date changes
  useEffect(() => {
    loadData();
  }, [selectedDate]);

  // Handle checkbox selection
  const handleUserSelection = (userId) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  // Handle attendance dropdown change
  const handleAttendanceChange = (userId, newAttendance) => {
    const updatedData = combinedData.map((user) => {
      if (user.userId === userId) {
        return { ...user, attendance: newAttendance };
      }
      return user;
    });

    setCombinedData(updatedData);

    // Check if there are any changes from original data
    const hasChanges = updatedData.some((user) => {
      const original = originalAttendanceData.find(
        (orig) => orig.userId === user.userId
      );
      return original && original.attendance !== user.attendance;
    });

    setHasAttendanceChanges(hasChanges);
  };

  // Handle attendance update
  const handleUpdateAttendance = async () => {
    const changedUsers = combinedData.filter((user) => {
      const original = originalAttendanceData.find(
        (orig) => orig.userId === user.userId
      );
      return original && original.attendance !== user.attendance;
    });

    if (changedUsers.length === 0) {
      return;
    }

    setUpdating(true);

    try {
      // Prepare data for bulk save API
      const attendanceData = changedUsers.map((user) => ({
        userId: user.userId,
        date: selectedDate,
        attendance: user.attendance,
      }));

      const requestBody = {
        attendanceData: attendanceData,
      };

      console.log('Sending attendance update:', requestBody);

      // Call bulk save API
      const response = await axios.post(
        `${BASE_URL}/api/attendance/bulk-save`,
        requestBody
      );

      console.log('Attendance update response:', response.data);

      // Check if response is successful
      if (response.data.success || response.status === 200) {
        // Reset the original data to current state
        setOriginalAttendanceData(
          combinedData.map((user) => ({
            userId: user.userId,
            attendance: user.attendance,
          }))
        );
        setHasAttendanceChanges(false);

        // Show success message
        alert(
          `✅ Attendance updated successfully for ${changedUsers.length} user(s)`
        );

        // Optionally reload data to ensure consistency
        // await loadData();
      } else {
        throw new Error(response.data.message || 'Failed to update attendance');
      }
    } catch (err) {
      console.error('Error updating attendance:', err);

      // Show error message
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Failed to update attendance';
      alert(`❌ Error: ${errorMessage}`);

      // You might want to show a more user-friendly error display
      setError(`Failed to update attendance: ${errorMessage}`);
    } finally {
      setUpdating(false);
    }
  };

  // Calculate attendance summary
  const calculateSummary = () => {
    const summary = {
      totalActiveUsers: combinedData.length,
      noRecord: 0,
      present: 0,
      absent: 0,
      half: 0,
    };

    combinedData.forEach((user) => {
      switch (user.attendance) {
        case 'No Record':
          summary.noRecord++;
          break;
        case 'Present':
          summary.present++;
          break;
        case 'Absent':
          summary.absent++;
          break;
        case 'Half':
          summary.half++;
          break;
        default:
          break;
      }
    });

    return summary;
  };

  // Handle select all checkbox
  const handleSelectAll = () => {
    if (selectedUsers.size === combinedData.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(combinedData.map((user) => user.userId)));
    }
  };

  return (
    <div
      className="flex flex-col overflow-hidden"
      style={{
        height: 'calc(100vh - 7.5rem)',
        maxHeight: 'calc(100vh - 7.5rem)',
      }}
    >
      {/* Header with Date Picker */}
      <div className="bg-gray-100 p-3 rounded border mb-3 flex-shrink-0">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-semibold text-gray-800">
              🤖 Auto Assignment Dashboard
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Date Picker */}
            <div className="flex flex-col">
              <label className="text-gray-700 text-xs font-medium mb-1">
                Select Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 bg-white"
              />
            </div>

            {/* Refresh Button */}
            <button
              onClick={loadData}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm transition-colors flex items-center space-x-2 mt-4"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-3 mb-3 flex-shrink-0">
          <div className="flex items-center">
            <div className="text-red-400 mr-3">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-red-800 font-semibold text-sm">Error</h3>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="flex items-center justify-center py-8 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span className="text-gray-600 font-medium text-sm">
              Loading user attendance data...
            </span>
          </div>
        </div>
      )}

      {/* Data Table */}
      {!loading && !error && combinedData.length > 0 && (
        <div className="flex-1 min-h-0 mb-2">
          <div className="bg-white rounded border h-full">
            <div
              className="overflow-auto"
              style={{
                height: 'calc(100% - 0px)',
                maxHeight: 'calc(100vh - 16rem)', // Ensure table doesn't exceed viewport minus header and summary space
              }}
            >
              <table className="min-w-full">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                      <input
                        type="checkbox"
                        checked={
                          selectedUsers.size === combinedData.length &&
                          combinedData.length > 0
                        }
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                      User Name
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                      Shift Time
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                      Attendance
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                      Assigned IVs
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pending IVs
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {combinedData.map((user, index) => (
                    <tr
                      key={user.userId}
                      className={`hover:bg-gray-50 ${
                        selectedUsers.has(user.userId) ? 'bg-blue-50' : ''
                      }`}
                    >
                      <td className="px-3 py-2 border-r border-gray-200">
                        <input
                          type="checkbox"
                          checked={selectedUsers.has(user.userId)}
                          onChange={() => handleUserSelection(user.userId)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-3 py-2 text-sm font-medium text-gray-900 border-r border-gray-200">
                        <div>
                          <div className="font-medium">{user.userName}</div>
                          <div className="text-xs text-gray-500">
                            {user.userEmail}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-sm text-center text-gray-700 border-r border-gray-200">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            user.shiftTime === 'Not Assigned'
                              ? 'bg-gray-100 text-gray-600'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {user.shiftTime}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-sm text-center border-r border-gray-200">
                        <select
                          value={user.attendance}
                          onChange={(e) =>
                            handleAttendanceChange(user.userId, e.target.value)
                          }
                          className={`px-2 py-1 rounded text-xs font-medium border-0 focus:ring-2 focus:ring-blue-500 ${
                            user.attendance === 'Present'
                              ? 'bg-green-100 text-green-700'
                              : user.attendance === 'Absent'
                              ? 'bg-red-100 text-red-700'
                              : user.attendance === 'Half'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          <option value="No Record" disabled>
                            No Record
                          </option>
                          <option value="Present">Present</option>
                          <option value="Absent">Absent</option>
                          <option value="Half">Half</option>
                        </select>
                      </td>
                      <td className="px-3 py-2 text-sm text-center text-gray-700 border-r border-gray-200">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            user.assignedCount > 0
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {user.assignedCount}
                        </span>
                        {/* Hidden data for future use */}
                        <div
                          className="hidden"
                          data-appointment-ids={JSON.stringify(
                            user.appointmentIds
                          )}
                        >
                          {user.appointmentIds.join(',')}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-sm text-center text-gray-700">
                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
                          {user.pendingIVs}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* No Data Message */}
      {!loading && !error && combinedData.length === 0 && (
        <div className="flex-1 min-h-0 mb-2">
          <div className="bg-white rounded border h-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No Users Found
              </h3>
              <p className="text-gray-500">
                No active users found or no attendance data available for the
                selected date.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Compact Summary & Actions Row */}
      {!loading && !error && combinedData.length > 0 && (
        <div className="mt-2 bg-blue-50 border border-blue-200 rounded p-2 flex-shrink-0">
          <div className="flex items-center justify-between">
            {/* Compact Summary */}
            <div className="flex items-center space-x-4">
              <span className="text-blue-800 font-medium text-xs">📊</span>
              {(() => {
                const summary = calculateSummary();
                return (
                  <>
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-700">
                        {summary.totalActiveUsers}
                      </div>
                      <div className="text-xs text-blue-600">Total</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-600">
                        {summary.noRecord}
                      </div>
                      <div className="text-xs text-gray-500">No Record</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">
                        {summary.present}
                      </div>
                      <div className="text-xs text-green-500">Present</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-red-600">
                        {summary.absent}
                      </div>
                      <div className="text-xs text-red-500">Absent</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-yellow-600">
                        {summary.half}
                      </div>
                      <div className="text-xs text-yellow-500">Half</div>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Update Button */}
            {hasAttendanceChanges && (
              <button
                onClick={handleUpdateAttendance}
                disabled={updating}
                className={`px-3 py-1 rounded text-xs transition-colors flex items-center space-x-1 ${
                  updating
                    ? 'bg-gray-400 cursor-not-allowed text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {updating ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>Update</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Selected Users Info */}
      {selectedUsers.size > 0 && (
        <div className="mt-2 bg-blue-50 border border-blue-200 rounded p-2 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="text-blue-700 font-medium text-sm">
              {selectedUsers.size} user{selectedUsers.size > 1 ? 's' : ''}{' '}
              selected
            </div>
            <button
              onClick={() => setSelectedUsers(new Set())}
              className="text-blue-600 hover:text-blue-800 text-xs"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAttendance;
