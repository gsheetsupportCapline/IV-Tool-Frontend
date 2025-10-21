import { useState, useEffect } from 'react';
import OfficeDropdown from './OfficeDropdown';
import DatePicker from './DatePicker';
import { fetchOfficeOptions } from '../utils/fetchOfficeOptions';

const OfficeAndDateSelector = ({ onOfficeChange, onDateChange }) => {
  const [selectedOffice, setSelectedOffice] = useState('');
  const [allowedOffices, setAllowedOffices] = useState([]);

  // const [dateRange, setDateRange] = useState({
  //   startDate: null,
  //   endDate: null,
  // });

  useEffect(() => {
    const loadOffices = async () => {
      try {
        const role = localStorage.getItem('role');
        const offices = await fetchOfficeOptions();
        const officeNamesList = offices.map((office) => office.name);

        if (role === 'admin') {
          // Admins can see all offices from API
          setAllowedOffices(officeNamesList);
        } else if (role === 'officeuser') {
          // Office users see only their assigned offices
          const assignedOfficesString = localStorage.getItem('assignedOffice');
          const assignedOffices = assignedOfficesString
            ? assignedOfficesString.split(',').map((o) => o.trim())
            : [];
          setAllowedOffices(assignedOffices);
          setSelectedOffice(assignedOfficesString);
          onOfficeChange(assignedOfficesString);
        } else {
          // Default case, set an empty array if the role is unknown or not supported
          setAllowedOffices([]);
        }
      } catch (error) {
        console.error('Error loading offices:', error);
        setAllowedOffices([]);
      }
    };

    loadOffices();
  }, []);

  const handleOfficeChange = (selectedOffice) => {
    setSelectedOffice(selectedOffice);
    onOfficeChange(selectedOffice); // Notify parent component of the change
  };

  const handleDateChange = (dates) => {
    onDateChange(dates); // Notify parent component of the change
  };

  return (
    <div className="flex   bg-slate-400 p-2 font-tahoma">
      <div className="flex space-x-4 rounded">
        <OfficeDropdown
          onSelect={handleOfficeChange}
          allowedOffices={allowedOffices}
          showAllOffices={localStorage.getItem('role') !== 'officeuser'}
        />
        <DatePicker onDateChange={handleDateChange} />
      </div>
    </div>
  );
};

export default OfficeAndDateSelector;
