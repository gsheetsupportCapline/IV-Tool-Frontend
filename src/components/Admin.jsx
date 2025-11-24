import { useState, useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import axios from 'axios';
import Header from './Header';
import Select from '@mui/material/Select';
import Datepicker from 'react-tailwindcss-datepicker';
import ShimmerTableComponent from './ShimmerTableComponent';
import BASE_URL from '../config/apiConfig';
import ImageViewer from 'react-simple-image-viewer';
import { fetchOfficeOptions } from '../utils/fetchOfficeOptions';

const Admin = () => {
  // Check user role for access control
  const userRole = localStorage.getItem('role');

  // If user is not admin, redirect them
  if (userRole !== 'admin') {
    console.log('Unauthorized access attempt to Admin page by role:', userRole);
    return (
      <Redirect to={userRole === 'user' ? '/dashboard' : '/schedule-patient'} />
    );
  }

  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedOffice, setSelectedOffice] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);
  const [value, setValue] = useState(0);
  const [rows, setRows] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [valueDate, setValueDate] = useState({
    startDate: null,
    endDate: null,
  });
  const [currentImage, setCurrentImage] = useState(0);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [images, setImages] = useState([]);
  const [patientIdFilter, setPatientIdFilter] = useState('');
  const [officeName, setOfficeName] = useState([]);

  // Close IV Modal states
  const [isCloseIVModalOpen, setIsCloseIVModalOpen] = useState(false);
  const [closeIVFormData, setCloseIVFormData] = useState({
    source: '',
    planType: '',
    ivRemarks: '',
    noteRemarks: '',
  });
  const [sourceOptions, setSourceOptions] = useState([]);
  const [planTypeOptions, setPlanTypeOptions] = useState([]);
  const [ivRemarksOptions, setIvRemarksOptions] = useState([]);

  // Fetch offices from API on component mount
  useEffect(() => {
    const loadOffices = async () => {
      try {
        const offices = await fetchOfficeOptions();
        // Add "AllOffices" option at the beginning for admin
        const officeList = [
          'AllOffices',
          ...offices.map((office) => office.name),
        ];
        setOfficeName(officeList);
      } catch (error) {
        console.error('Error loading offices:', error);
        setOfficeName(['AllOffices']); // At least show AllOffices option
      }
    };

    loadOffices();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/auth/users`);
        setUsers(response.data.data);
      } catch (error) {
        console.error('Error fetching users', error);
      }
    };
    fetchUsers();
  }, []);

  // Fetch dropdown options for Close IV form
  useEffect(() => {
    const fetchDropdownOptions = async (category) => {
      try {
        const encodedCategory = encodeURIComponent(category);
        const response = await axios.get(
          `${BASE_URL}/api/dropdownValues/${encodedCategory}`
        );
        return response.data.options;
      } catch (error) {
        console.error(`Error fetching ${category} options:`, error);
        return [];
      }
    };

    const loadOptions = async () => {
      const source = await fetchDropdownOptions('Source');
      const planType = await fetchDropdownOptions('Plan Type');
      const ivRemarks = await fetchDropdownOptions('IV Remarks');

      setSourceOptions(source);
      setPlanTypeOptions(planType);
      setIvRemarksOptions(ivRemarks);
    };

    loadOptions();
  }, []);

  // Custom cell renderer function
  const renderUserName = (params) => {
    const user = users.find((user) => user._id === params.row.assignedUser);
    return user ? user.name : params.row.assignedUser || 'Unassigned';
  };

  const handleViewImage = (imageUrl) => {
    const imagesArray = [imageUrl];
    setCurrentImage(0);
    setIsViewerOpen(true);
    setImages(imagesArray);
  };

  const closeImageViewer = () => {
    setCurrentImage(0);
    setIsViewerOpen(false);
  };

  const columns = [
    {
      field: 'status',
      headerName: 'Status',
      headerClassName: 'header-row',
      width: 150,
    },
    {
      field: 'completionStatus',
      headerName: 'Completion Status',
      headerClassName: 'header-row',
      width: 150,
    },
    {
      field: 'office',
      headerName: 'Office',
      headerClassName: 'header-row',
      width: 150,
    },
    {
      field: 'ivType',
      headerName: 'IV Type',
      headerClassName: 'header-row',
      width: 150,
    },
    {
      field: 'assignedUser',
      headerName: 'Assigned To',
      width: 150,
      renderCell: renderUserName,
      headerClassName: 'header-row',
    },
    {
      field: 'ivAssignedDate',
      headerName: 'Assigned Date',
      width: 150,
      headerClassName: 'header-row',
    },
    {
      field: 'appointmentType',
      headerName: 'Appointment Type',
      headerClassName: 'header-row',
      width: 150,
    },
    {
      field: 'appointmentDate',
      headerName: 'Appointment Date',
      headerClassName: 'header-row',
      width: 150,
    },
    {
      field: 'appointmentTime',
      headerName: 'Appointment Time',
      headerClassName: 'header-row',
      width: 150,
    },
    {
      field: 'patientId',
      headerName: 'Patient Id',
      headerClassName: 'header-row',
      width: 100,
    },
    {
      field: 'ivRequestedDate',
      headerName: 'IV Requested Date',
      headerClassName: 'header-row',
      width: 100,
    },
    {
      field: 'insuranceName',
      headerName: 'Insurance Name',
      headerClassName: 'header-row',
      width: 150,
    },
    {
      field: 'insurancePhone',
      headerName: 'Insurance Phone No',
      headerClassName: 'header-row',
      width: 150,
    },
    {
      field: 'policyHolderName',
      headerName: 'Policy Holder Name',
      headerClassName: 'header-row',
      width: 150,
    },
    {
      field: 'policyHolderDOB',
      headerName: 'Policy Holder DOB',
      headerClassName: 'header-row',
      width: 150,
    },
    {
      field: 'memberId',
      headerName: 'Member Id',
      headerClassName: 'header-row',
      width: 100,
    },
    {
      field: 'MIDSSN',
      headerName: 'MID/SSN',
      headerClassName: 'header-row',
      width: 100,
    },
    {
      field: 'imageUrl',
      headerName: 'Image',
      headerClassName: 'header-row',
      width: 100,
      renderCell: (params) => {
        return (
          <>
            {params.row.imageUrl && params.row.imageUrl.trim() !== '' ? (
              <button
                onClick={() => handleViewImage(params.row.imageUrl)}
                className="size-10 w-20 rounded-md bg-black text-white px-2 py-1 text-xs"
              >
                View Image
              </button>
            ) : null}
          </>
        );
      },
    },
    {
      field: 'employerName',
      headerName: 'Employer Name',
      headerClassName: 'header-row',
      width: 150,
    },
    {
      field: 'patientName',
      headerName: 'Patient Name',
      headerClassName: 'header-row',
      width: 150,
    },
  ];

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // Close IV Modal handlers
  const handleOpenCloseIVModal = () => {
    if (selectedRows.length === 0) {
      alert('Please select at least one appointment to close.');
      return;
    }
    setIsCloseIVModalOpen(true);
  };

  const handleCloseIVModal = () => {
    setIsCloseIVModalOpen(false);
    // Reset form data
    setCloseIVFormData({
      source: '',
      planType: '',
      ivRemarks: '',
      noteRemarks: '',
    });
  };

  const handleCloseIVFormChange = (field, value) => {
    setCloseIVFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCloseIVSubmit = async () => {
    // Validate required fields
    if (
      !closeIVFormData.source ||
      !closeIVFormData.planType ||
      !closeIVFormData.ivRemarks
    ) {
      alert('Source, Plan Type, and IV Remarks are mandatory fields.');
      return;
    }

    if (selectedRows.length === 0) {
      alert('No appointments selected.');
      return;
    }

    // Show confirmation
    const confirmed = window.confirm(
      `Are you sure you want to close ${selectedRows.length} appointment(s)?`
    );
    if (!confirmed) return;

    setLoading(true);

    try {
      // Get current user details from localStorage
      const completedBy = localStorage.getItem('loggedinUserName') || 'Admin';
      const assignedUserId = localStorage.getItem('loggedinUserId') || '';

      // Get current date and time in ISO format
      const currentDate = new Date().toISOString();

      // Prepare appointments array for bulk update with all required fields
      const appointments = selectedRows.map((row) => ({
        appointmentId: row._id,
        ivRemarks: closeIVFormData.ivRemarks,
        source: closeIVFormData.source,
        planType: closeIVFormData.planType,
        completedBy: completedBy,
        noteRemarks: closeIVFormData.noteRemarks || '',
        ivCompletedDate: currentDate,
        assignedUser: assignedUserId,
        ivAssignedByUserName: completedBy,
        ivAssignedDate: currentDate,
      }));

      console.log('Sending bulk update request:', { appointments });

      // Make API call
      const response = await axios.post(
        `${BASE_URL}/api/appointments/bulk-update-appointment-details`,
        { appointments },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Bulk update response:', response.data);

      // Handle response
      if (response.data.success) {
        const { successfulUpdates, failedUpdates, details } =
          response.data.results;

        if (failedUpdates === 0) {
          // All successful
          alert(`Successfully closed ${successfulUpdates} appointment(s).`);
        } else {
          // Partial success
          const failedList = details
            .filter((d) => d.status === 'failed')
            .map((d) => `ID: ${d.appointmentId} - ${d.error}`)
            .join('\n');

          alert(
            `Bulk update completed:\n\n` +
              `✅ Successful: ${successfulUpdates}\n` +
              `❌ Failed: ${failedUpdates}\n\n` +
              `Failed appointments:\n${failedList}`
          );
        }

        // Close modal and refresh data
        handleCloseIVModal();
        fetchAndFilterAppointments(value);
      } else {
        alert(
          `Error: ${response.data.message || 'Failed to update appointments'}`
        );
      }
    } catch (error) {
      console.error('Error closing IVs:', error);

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'An error occurred while closing IVs';

      alert(`Failed to close IVs: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuItemClick = async (user) => {
    setLoading(true);
    const selectedAppointmentIds = selectedRows.map((row) => row._id);

    // First check if user is present today before assigning
    try {
      const currentDate = new Date().toISOString().split('T')[0];
      const attendanceResponse = await axios.get(
        `${BASE_URL}/api/attendance/by-date`,
        {
          params: {
            date: currentDate,
            office: 'all',
          },
        }
      );

      let userAttendanceStatus = 'No Record';
      if (attendanceResponse.data.success) {
        const userAttendanceData = attendanceResponse.data.data.find(
          (u) => u.userId === user._id
        );
        if (userAttendanceData) {
          userAttendanceStatus = userAttendanceData.attendance;
        }
      }

      // Check if user is eligible for assignment (Present or Half)
      if (
        userAttendanceStatus !== 'Present' &&
        userAttendanceStatus !== 'Half'
      ) {
        setLoading(false);
        alert(
          `Cannot assign IVs to ${user.name}.\nUser attendance status: ${userAttendanceStatus}\nOnly users marked as 'Present' or 'Half' can be assigned IVs.`
        );
        return;
      }
    } catch (attendanceError) {
      setLoading(false);
      alert(`Error checking attendance for ${user.name}. Please try again.`);
      console.error('Error checking user attendance:', attendanceError);
      return;
    }

    // Process assignments sequentially to avoid state conflicts
    for (let i = 0; i < selectedAppointmentIds.length; i++) {
      const id = selectedAppointmentIds[i];
      try {
        const officeNameForCurrentId = selectedRows.find(
          (row) => row._id === id
        )?.office;

        if (!officeNameForCurrentId) {
          console.error('Office name not found for appointment ID:', id);
          continue;
        }

        const loggedInUserName = localStorage.getItem('loggedinUserName');
        const response = await axios.put(
          `${BASE_URL}/api/appointments/update-appointments/${officeNameForCurrentId}/${id}`,
          {
            userId: user._id,
            status: 'Assigned',
            completionStatus: 'In Process',
            ivAssignedDate: new Date().toISOString(),
            ivAssignedByUserName: loggedInUserName,
          }
        );

        const updatedAppointment = response.data;

        // Update the specific row immediately
        setRows((prevRows) => {
          const newRows = [...prevRows];
          const index = newRows.findIndex(
            (row) => row._id.toString() === updatedAppointment._id.toString()
          );
          if (index !== -1) {
            newRows[index] = updatedAppointment;
          }
          return newRows;
        });
      } catch (error) {
        console.error('Failed to update appointment', error);
      }
    }

    // Update attendance logic
    if (selectedAppointmentIds.length > 0) {
      try {
        const currentDate = new Date().toISOString().split('T')[0];
        let currentAssignedCount = 0;
        let currentAppointmentIds = [];

        try {
          const attendanceResponse = await axios.get(
            `${BASE_URL}/api/attendance/by-date`,
            {
              params: {
                date: currentDate,
                office: 'all',
              },
            }
          );

          if (attendanceResponse.data.success) {
            const userAttendanceData = attendanceResponse.data.data.find(
              (u) => u.userId === user._id
            );
            if (userAttendanceData && userAttendanceData.assigned) {
              currentAssignedCount = userAttendanceData.assigned.count || 0;
              currentAppointmentIds = [
                ...(userAttendanceData.assigned.appointmentIds || []),
              ];
            }
          }
        } catch (fetchError) {
          console.log(
            'No existing attendance data found, starting fresh for user:',
            user.name
          );
        }

        const updatedCount =
          currentAssignedCount + selectedAppointmentIds.length;
        const updatedAppointmentIds = [
          ...currentAppointmentIds,
          ...selectedAppointmentIds,
        ];

        const attendanceUpdateResponse = await axios.put(
          `${BASE_URL}/api/attendance/update-assigned`,
          {
            userId: user._id,
            date: currentDate,
            assigned: {
              count: updatedCount,
              appointmentIds: updatedAppointmentIds,
            },
          }
        );

        if (
          attendanceUpdateResponse.data.success ||
          attendanceUpdateResponse.status === 200
        ) {
          console.log(
            `Successfully updated attendance for user ${user.name}: ${updatedCount} total IVs`
          );
        }
      } catch (attendanceError) {
        console.error(
          `Error updating attendance for user ${user.name}:`,
          attendanceError
        );
      }
    }

    // Clear selection and refresh data to ensure consistency
    setSelectedRows([]);

    // Refresh the appointments data to show latest state
    setTimeout(() => {
      fetchAndFilterAppointments(value);
    }, 500);

    handleClose();
    setLoading(false);
  };

  const handleSelectionChange = (newSelection) => {
    const filteredSelection = newSelection.filter((id) => {
      const row = rows.find((row) => row._id === id);
      return row && row.completionStatus !== 'Completed';
    });

    const selectedRowsData = filteredSelection.map((id) =>
      rows.find((row) => row._id === id)
    );
    setSelectedRows(selectedRowsData);
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
    fetchAndFilterAppointments(newValue);
  };

  const handleUnassignClick = async () => {
    const selectedAppointmentIds = selectedRows.map((row) => row._id);

    // Group appointments by user for attendance updates
    const userAppointmentMap = {};
    selectedRows.forEach((row) => {
      if (row.assignedUser) {
        const userId = row.assignedUser;
        const user = users.find((u) => u._id === userId);

        if (user) {
          if (!userAppointmentMap[userId]) {
            userAppointmentMap[userId] = {
              user: user,
              appointmentIds: [],
            };
          }
          userAppointmentMap[userId].appointmentIds.push(row._id);
        }
      }
    });

    // Process unassignments
    for (let id of selectedAppointmentIds) {
      try {
        const officeNameForCurrentId = selectedRows.find(
          (row) => row._id === id
        )?.office;
        const response = await axios.put(
          `${BASE_URL}/api/appointments/update-appointments/${officeNameForCurrentId}/${id}`,
          {
            userId: null,
            status: 'Unassigned',
            completionStatus: 'IV Not Done',
            ivAssignedDate: null,
            ivAssignedByUserName: null,
          }
        );

        const updatedAppointment = response.data;
        const index = rows.findIndex(
          (row) => row._id === updatedAppointment._id
        );

        if (index !== -1) {
          const newRows = [...rows];
          newRows[index] = updatedAppointment;
          setRows(newRows);
        }
      } catch (error) {
        console.error('Failed to update appointment', error);
      }
    }

    // Update attendance for each affected user
    for (const userId in userAppointmentMap) {
      const { user, appointmentIds } = userAppointmentMap[userId];

      try {
        const currentDate = new Date().toISOString().split('T')[0];
        let currentAssignedCount = 0;
        let currentAppointmentIds = [];

        try {
          const attendanceResponse = await axios.get(
            `${BASE_URL}/api/attendance/by-date`,
            {
              params: {
                date: currentDate,
                office: 'all',
              },
            }
          );

          if (attendanceResponse.data.success) {
            const userAttendanceData = attendanceResponse.data.data.find(
              (u) => u.userId === userId
            );
            if (userAttendanceData && userAttendanceData.assigned) {
              currentAssignedCount = userAttendanceData.assigned.count || 0;
              currentAppointmentIds = [
                ...(userAttendanceData.assigned.appointmentIds || []),
              ];
            }
          }
        } catch (fetchError) {
          console.log('No existing attendance data found for user:', user.name);
        }

        // Remove unassigned appointment IDs from current list
        console.log(
          'Current appointment IDs in attendance:',
          currentAppointmentIds
        );
        console.log('Appointment IDs to remove:', appointmentIds);

        // Convert all IDs to strings for proper comparison
        const currentAppointmentIdsStr = currentAppointmentIds.map((id) =>
          id.toString()
        );
        const appointmentIdsToRemoveStr = appointmentIds.map((id) =>
          id.toString()
        );

        console.log('Current IDs as strings:', currentAppointmentIdsStr);
        console.log('IDs to remove as strings:', appointmentIdsToRemoveStr);

        const updatedAppointmentIds = currentAppointmentIdsStr.filter(
          (id) => !appointmentIdsToRemoveStr.includes(id)
        );

        console.log(
          'Updated appointment IDs after removal:',
          updatedAppointmentIds
        );

        // Decrease count by the number of unassigned appointments
        const updatedCount = Math.max(
          0,
          currentAssignedCount - appointmentIds.length
        );

        // Update attendance using same API pattern as Auto Assignment
        console.log(`Sending attendance update for ${user.name}:`, {
          userId,
          date: currentDate,
          assigned: {
            count: updatedCount,
            appointmentIds: updatedAppointmentIds,
          },
        });

        const attendanceUpdateResponse = await axios.put(
          `${BASE_URL}/api/attendance/update-assigned`,
          {
            userId: userId,
            date: currentDate,
            assigned: {
              count: updatedCount,
              appointmentIds: updatedAppointmentIds,
            },
          }
        );

        console.log(
          `Attendance update response for ${user.name}:`,
          attendanceUpdateResponse.data
        );

        if (
          attendanceUpdateResponse.data.success ||
          attendanceUpdateResponse.status === 200
        ) {
          console.log(
            `✅ Successfully updated attendance for user ${user.name}: ${updatedCount} total IVs (decreased by ${appointmentIds.length})`
          );
          console.log(
            `Final appointment IDs for ${user.name}:`,
            updatedAppointmentIds
          );
        }
      } catch (attendanceError) {
        console.error(
          `Error updating attendance for user ${user.name}:`,
          attendanceError
        );
      }
    }

    fetchAndFilterAppointments(value);
  };

  const fetchAndFilterAppointments = async (tabValue) => {
    if (!selectedOffice) {
      setRows([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `${BASE_URL}/api/appointments/fetch-appointments/${selectedOffice}?startDate=${valueDate.startDate}&endDate=${valueDate.endDate}`
      );
      const responseData = await response.json();

      if (responseData && responseData.appointments) {
        let filteredAppointments = responseData.appointments.map(
          (appointment) => ({
            ...appointment,
            appointmentDate: new Date(appointment.appointmentDate)
              .toISOString()
              .split('T')[0],
          })
        );

        if (patientIdFilter) {
          filteredAppointments = filteredAppointments.filter(
            (appointment) => appointment.patientId == patientIdFilter
          );
        }

        switch (tabValue) {
          case 0:
            filteredAppointments = filteredAppointments.filter(
              (appointment) => appointment.status === 'Unassigned'
            );
            break;
          case 1:
            filteredAppointments = filteredAppointments.filter(
              (appointment) => appointment.status === 'Assigned'
            );
            break;
          default:
            filteredAppointments = [];
        }

        filteredAppointments.sort((a, b) => {
          const dateCompare =
            new Date(a.appointmentDate) - new Date(b.appointmentDate);
          if (dateCompare === 0) {
            const [hourA, minuteA] = a.appointmentTime.split(':').map(Number);
            const [hourB, minuteB] = b.appointmentTime.split(':').map(Number);
            return hourA - hourB || minuteA - minuteB;
          }
          return dateCompare;
        });

        setRows(filteredAppointments);
      } else {
        setRows([]);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch appointments', error);
      setRows([]);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchAndFilterAppointments(value);
    setLoading(false);
  }, [value, valueDate, selectedOffice, patientIdFilter]);

  const handleValueChange = (newValue) => {
    setValueDate(newValue);
  };

  return (
    <div className="h-screen bg-slate-50 overflow-hidden relative">
      <Header />

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-gray-500 bg-opacity-30 z-50 flex justify-center items-center">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="text-slate-700 font-medium">
                Loading appointments...
              </span>
            </div>
          </div>
        </div>
      )}

      <div
        className="h-full overflow-hidden"
        style={{ height: 'calc(100vh - 4rem)' }}
      >
        <div className="p-3">
          {/* Compact Filters Section */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-3 mb-3">
            <div className="grid grid-cols-3 gap-4 items-center">
              {/* Office Selector */}
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-slate-700 whitespace-nowrap min-w-[80px]">
                  Office Name:
                </label>
                <div className="flex-1 h-8">
                  <Select
                    value={selectedOffice}
                    onChange={(e) => setSelectedOffice(e.target.value)}
                    displayEmpty
                    inputProps={{ 'aria-label': 'Select Office' }}
                    size="small"
                    sx={{
                      height: '32px',
                      fontSize: '14px',
                      width: '100%',
                    }}
                  >
                    <MenuItem value="">
                      <em>Select Office</em>
                    </MenuItem>
                    {officeName.map((name) => (
                      <MenuItem key={name} value={name}>
                        {name}
                      </MenuItem>
                    ))}
                  </Select>
                </div>
              </div>

              {/* Date Range */}
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-slate-700 whitespace-nowrap min-w-[80px]">
                  Date Range:
                </label>
                <div className="flex-1 h-8 border border-slate-300 rounded-md px-3 flex items-center">
                  <div className="w-full">
                    <Datepicker
                      value={valueDate}
                      onChange={handleValueChange}
                      inputClassName="w-full h-full bg-transparent border-none outline-none text-sm"
                      containerClassName="w-full h-full"
                      toggleClassName="hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Patient ID Search */}
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-slate-700 whitespace-nowrap min-w-[70px]">
                  Patient ID:
                </label>
                <input
                  type="text"
                  value={patientIdFilter}
                  onChange={(e) => setPatientIdFilter(e.target.value)}
                  placeholder="Search Patient ID..."
                  className="flex-1 h-8 px-3 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-0 focus:border-slate-400 transition-colors"
                />
              </div>
            </div>

            {/* Second Row - Tabs and Buttons */}
            <div className="grid grid-cols-2 gap-4 items-center mt-3 pt-3 border-t border-slate-200">
              {/* Status Tabs */}
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-slate-700 whitespace-nowrap min-w-[80px]">
                  Status:
                </label>
                <div className="flex-1">
                  <Tabs
                    value={value}
                    onChange={handleChange}
                    aria-label="status tabs"
                    sx={{
                      minHeight: '32px',
                      '& .MuiTab-root': {
                        minHeight: '32px',
                        padding: '4px 16px',
                        fontSize: '14px',
                        color: '#475569',
                        border: '1px solid #e2e8f0',
                        marginRight: '4px',
                        borderRadius: '6px',
                        '&.Mui-selected': {
                          backgroundColor: '#334155',
                          color: 'white',
                          borderColor: '#334155',
                        },
                      },
                      '& .MuiTabs-indicator': {
                        display: 'none',
                      },
                    }}
                  >
                    <Tab label="Unassigned" />
                    <Tab label="Assigned" />
                  </Tabs>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2">
                <Button
                  variant="contained"
                  onClick={handleOpenCloseIVModal}
                  size="small"
                  sx={{
                    fontSize: '12px',
                    padding: '6px 16px',
                    backgroundColor: '#10b981',
                    '&:hover': {
                      backgroundColor: '#059669',
                    },
                  }}
                >
                  Close IV
                </Button>
                <Button
                  variant="contained"
                  onClick={handleUnassignClick}
                  size="small"
                  sx={{
                    fontSize: '12px',
                    padding: '6px 16px',
                    backgroundColor: '#ef4444',
                    '&:hover': {
                      backgroundColor: '#dc2626',
                    },
                  }}
                >
                  Unassign
                </Button>
                <Button
                  variant="contained"
                  onClick={handleClick}
                  size="small"
                  sx={{
                    fontSize: '12px',
                    padding: '6px 16px',
                    backgroundColor: '#3b82f6',
                    '&:hover': {
                      backgroundColor: '#2563eb',
                    },
                  }}
                >
                  Assign to User
                </Button>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div
            className="bg-white rounded-lg shadow border border-slate-200 overflow-hidden"
            style={{ height: 'calc(100vh - 13rem)' }}
          >
            {isLoading ? (
              <div className="p-4">
                <ShimmerTableComponent />
              </div>
            ) : rows.length > 0 ? (
              <div style={{ height: '100%', width: '100%' }}>
                <DataGrid
                  rows={rows}
                  columns={columns}
                  pageSizeOptions={[25, 50, 100]}
                  checkboxSelection
                  onRowSelectionModelChange={handleSelectionChange}
                  getRowId={(row) => row._id.toString()}
                  sx={{
                    border: 'none',
                    '& .MuiDataGrid-columnHeader': {
                      backgroundColor: '#1e293b', // slate-800 dark header
                      color: '#ffffff',
                      fontWeight: '600',
                      fontSize: '14px',
                    },
                    '& .MuiDataGrid-columnHeaderTitle': {
                      color: '#ffffff',
                      fontWeight: '600',
                    },
                    '& .MuiDataGrid-columnSeparator': {
                      color: '#ffffff',
                    },
                    '& .MuiDataGrid-iconSeparator': {
                      color: '#ffffff',
                    },
                    '& .MuiDataGrid-sortIcon': {
                      color: '#ffffff',
                    },
                    '& .MuiDataGrid-menuIcon': {
                      color: '#ffffff',
                    },
                    '& .MuiDataGrid-columnHeaderTitleContainer .MuiDataGrid-iconButtonContainer':
                      {
                        color: '#ffffff',
                      },
                    '& .MuiDataGrid-cell': {
                      borderBottom: '1px solid #f1f5f9',
                      fontSize: '13px',
                    },
                    '& .MuiDataGrid-row:hover': {
                      backgroundColor: '#f8fafc',
                    },
                  }}
                />
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div className="text-slate-500 text-lg font-medium">
                  No appointments found
                </div>
                <div className="text-slate-400 text-sm mt-1">
                  No appointments match your current filter criteria
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Menu for user assignment */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        {users
          .filter((user) => user.role === 'user')
          .map((user) => (
            <MenuItem key={user._id} onClick={() => handleMenuItemClick(user)}>
              {user.name}
            </MenuItem>
          ))}
      </Menu>

      {/* Image Viewer */}
      {isViewerOpen && (
        <ImageViewer
          src={images}
          currentIndex={currentImage}
          onClose={closeImageViewer}
          disableScroll={true}
          closeOnClickOutside={true}
        />
      )}

      {/* Close IV Modal */}
      {isCloseIVModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop with blur */}
          <div
            className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={handleCloseIVModal}
          ></div>

          {/* Modal Content */}
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center">
                    <svg
                      className="w-6 h-6 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Close IVs in Bulk
                  </h2>
                  <p className="text-green-100 text-sm mt-1">
                    Selected Appointments: {selectedRows.length}
                  </p>
                </div>
                <button
                  onClick={handleCloseIVModal}
                  className="text-white hover:text-green-100 transition-colors text-2xl font-bold"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Required Fields Section */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <h3 className="text-amber-800 font-semibold mb-4 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Required Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Source Dropdown */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Source <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={closeIVFormData.source}
                      onChange={(e) =>
                        handleCloseIVFormChange('source', e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Select Source</option>
                      {sourceOptions.map((option) => (
                        <option key={option.id} value={option.name}>
                          {option.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Plan Type Dropdown */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Plan Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={closeIVFormData.planType}
                      onChange={(e) =>
                        handleCloseIVFormChange('planType', e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Select Plan Type</option>
                      {planTypeOptions.map((option) => (
                        <option key={option.id} value={option.name}>
                          {option.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* IV Remarks Dropdown */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      IV Remarks <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={closeIVFormData.ivRemarks}
                      onChange={(e) =>
                        handleCloseIVFormChange('ivRemarks', e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Select IV Remarks</option>
                      {ivRemarksOptions.map((option) => (
                        <option key={option.id} value={option.name}>
                          {option.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Optional Notes Section */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Note Remarks (Optional)
                </label>
                <textarea
                  value={closeIVFormData.noteRemarks}
                  onChange={(e) =>
                    handleCloseIVFormChange('noteRemarks', e.target.value)
                  }
                  rows={4}
                  placeholder="Add any additional notes or comments here..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                <button
                  onClick={handleCloseIVModal}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCloseIVSubmit}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium shadow-md hover:shadow-lg"
                >
                  Submit & Close IVs
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
