import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BASE_URL from '../config/apiConfig';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [userFilter, setUserFilter] = useState('active');
  const [hasChanges, setHasChanges] = useState(false);
  const [originalUsers, setOriginalUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const shiftTimeOptions = [
    { value: '6PM-3AM', label: '6PM-3AM' },
    { value: '7PM-4AM', label: '7PM-4AM' },
    { value: '8PM-5AM', label: '8PM-5AM' },
  ];

  useEffect(() => {
    console.log('BASE_URL from config:', BASE_URL);
    console.log('Environment variables:', {
      VITE_REACT_APP_API_URL: import.meta.env.VITE_REACT_APP_API_URL,
      NODE_ENV: import.meta.env.NODE_ENV,
    });
    fetchUsers();
  }, []);

  const fetchUsers = async (filterByActive = null) => {
    try {
      setLoading(true);
      let apiUrl = `${BASE_URL}/api/auth/users`;

      // Add isActive parameter if filter is specified
      if (filterByActive !== null) {
        apiUrl += `?isActive=${filterByActive}`;
      }

      console.log('Fetching users from:', apiUrl);

      const response = await axios.get(apiUrl);
      const usersData = response.data.data || response.data || [];
      console.log('Received users data:', usersData);

      const usersWithDefaults = usersData
        .filter((user) => user.role === 'user') // Only show users with role 'user'
        .map((user) => ({
          ...user,
          shiftTime: user.shiftTime || '8PM-5AM',
          isActive: user.isActive !== undefined ? user.isActive : true,
        }));

      console.log('Users with defaults applied:', usersWithDefaults);
      console.log('Sample user structure:', usersWithDefaults[0]);
      console.log(
        'User IDs:',
        usersWithDefaults.map((u) => ({
          name: u.name,
          id: u._id,
          email: u.email,
        }))
      );

      setUsers(usersWithDefaults);
      setOriginalUsers(JSON.parse(JSON.stringify(usersWithDefaults)));
    } catch (error) {
      console.error('Error fetching users:', error);

      let errorMessage = 'Error loading users: ';
      if (error.response) {
        errorMessage += `${error.response.status} - ${
          error.response.data?.message || error.response.statusText
        }`;
      } else if (error.request) {
        errorMessage += 'Network error. Please check your connection.';
      } else {
        errorMessage += error.message;
      }

      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleUserIsActiveChange = (userId, isActive) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user._id === userId ? { ...user, isActive } : user
      )
    );
    setHasChanges(true);
  };

  const handleShiftTimeChange = (userId, shiftTime) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user._id === userId ? { ...user, shiftTime: shiftTime } : user
      )
    );
    setHasChanges(true);
  };

  const saveChanges = async () => {
    try {
      const changedUsers = users.filter((user) => {
        const original = originalUsers.find((orig) => orig._id === user._id);
        return (
          original &&
          (original.isActive !== user.isActive ||
            original.shiftTime !== user.shiftTime)
        );
      });

      if (changedUsers.length === 0) {
        alert('No changes to save.');
        return;
      }

      console.log('Saving changes for users:', changedUsers);

      await Promise.all(
        changedUsers.map((user) => {
          const updateUrl = `${BASE_URL}/api/user-update/${user._id}`;
          console.log(
            `Updating user ${user._id} (${user.name}) at URL: ${updateUrl}`
          );
          console.log(`User data being sent:`, {
            isActive: user.isActive,
            shiftTime: user.shiftTime,
          });
          console.log(`Full user object:`, user);

          return axios.put(updateUrl, {
            isActive: user.isActive,
            shiftTime: user.shiftTime,
          });
        })
      );

      setOriginalUsers(JSON.parse(JSON.stringify(users)));
      setHasChanges(false);
      alert('Changes saved successfully!');

      // Refresh the list after save based on current filter
      await handleFilterChange(userFilter);

      // Refresh the list after save based on current filter
      await handleFilterChange(userFilter);
    } catch (error) {
      console.error('Error saving changes:', error);

      // More detailed error message
      let errorMessage = 'Error saving changes: ';
      if (error.response) {
        // Server responded with error status
        errorMessage += `${error.response.status} - ${
          error.response.data?.message || error.response.statusText
        }`;
        console.error('Server error response:', error.response.data);
      } else if (error.request) {
        // Network error
        errorMessage += 'Network error. Please check your connection.';
      } else {
        // Other error
        errorMessage += error.message;
      }

      alert(errorMessage);
    }
  };

  const handleFilterChange = async (filterType) => {
    setUserFilter(filterType);
    if (filterType === 'active') {
      await fetchUsers(true);
    } else if (filterType === 'inactive') {
      await fetchUsers(false);
    } else {
      await fetchUsers(); // Fetch all users
    }
  };

  const filteredUsers = users; // Show all users, don't filter on client side

  console.log('Current filter:', userFilter);
  console.log('Total users:', users.length);
  console.log('Filtered users:', filteredUsers.length);
  console.log(
    'Users with active status:',
    users.map((u) => ({ name: u.name, isActive: u.isActive }))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading users...</div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col h-full p-4"
      style={{
        minHeight: 'calc(100vh - 7.5rem)',
        maxHeight: 'calc(100vh - 7.5rem)',
        padding: '15px',
      }}
    >
      <div className="bg-gray-100 p-3 rounded border mb-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <label className="text-gray-700 text-sm font-medium">
              Show Users:
            </label>
            <div className="flex bg-gray-200 rounded p-1">
              <button
                onClick={() => handleFilterChange('active')}
                className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
                  userFilter === 'active'
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-transparent text-gray-700 hover:bg-gray-300'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => handleFilterChange('inactive')}
                className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
                  userFilter === 'inactive'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'bg-transparent text-gray-700 hover:bg-gray-300'
                }`}
              >
                Inactive
              </button>
            </div>
          </div>

          {hasChanges && (
            <button
              onClick={saveChanges}
              className="bg-blue-600 text-white px-4 py-1.5 text-sm font-medium rounded hover:bg-blue-700 transition-colors"
            >
              Save Changes
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="bg-white rounded border">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Shift Time
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {user.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {user.email}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <select
                        value={user.shiftTime}
                        onChange={(e) =>
                          handleShiftTimeChange(user._id, e.target.value)
                        }
                        className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500 bg-white"
                      >
                        {shiftTimeOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center">
                        <button
                          onClick={() =>
                            handleUserIsActiveChange(user._id, !user.isActive)
                          }
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                            user.isActive ? 'bg-green-600' : 'bg-red-500'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              user.isActive ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                        <span
                          className={`ml-2 text-xs font-medium ${
                            user.isActive ? 'text-green-700' : 'text-red-700'
                          }`}
                        >
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageUsers;
