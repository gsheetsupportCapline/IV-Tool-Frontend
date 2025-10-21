import { useState, useEffect } from 'react';
import Header from './Header';
import Status from './Status';
import OfficeDropdown from './OfficeDropdown';
import DatePicker from './DatePicker';
import BASE_URL from '../config/apiConfig';
import PageNotFound from './PageNotFound';
import { fetchOfficeOptions } from '../utils/fetchOfficeOptions';

const Home = () => {
  const [selectedOffice, setSelectedOffice] = useState('');
  const [allowedOffices, setAllowedOffices] = useState([]);
  const [data, setData] = useState([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });
  const [patientIdInput, setPatientIdInput] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${BASE_URL}/api/appointments/fetch-appointments/${selectedOffice}?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`
      );
      const responseData = await response.json();
      console.log('Fetched data:', responseData);
      if (responseData && responseData.appointments) {
        const sortedAppointments = responseData.appointments.sort((a, b) => {
          return new Date(b.appointmentDate) - new Date(a.appointmentDate);
        });
        setData(sortedAppointments);
      } else {
        console.log('API did not return data ', responseData);
        setData([]);
      }
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  // Set allowed offices based on user role
  useEffect(() => {
    const loadOffices = async () => {
      try {
        const offices = await fetchOfficeOptions();
        const officeNamesList = offices.map((office) => office.name);

        const role = localStorage.getItem('role');
        if (role === 'officeuser') {
          const assignedOfficesString = localStorage.getItem('assignedOffice');
          const assignedOffices = assignedOfficesString
            ? assignedOfficesString.split(',').map((o) => o.trim())
            : [];
          setAllowedOffices(assignedOffices);
          if (assignedOfficesString) {
            setSelectedOffice(assignedOfficesString.trim());
          }
        } else {
          // For admin and other roles, use all fetched offices
          setAllowedOffices(officeNamesList);
        }
      } catch (error) {
        console.error('Error loading offices:', error);
        setAllowedOffices([]);
      }
    };

    loadOffices();
  }, []);

  useEffect(() => {
    if (selectedOffice.length > 0 && dateRange.startDate && dateRange.endDate) {
      fetchData();
    }
  }, [selectedOffice, dateRange]);

  const handlePatientIdChange = (e) => {
    setPatientIdInput(e.target.value);
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

      {error ? (
        <PageNotFound />
      ) : (
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
                    <OfficeDropdown
                      onSelect={setSelectedOffice}
                      allowedOffices={allowedOffices}
                      showAllOffices={
                        localStorage.getItem('role') !== 'officeuser'
                      }
                    />
                  </div>
                </div>

                {/* Date Range */}
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-slate-700 whitespace-nowrap min-w-[80px]">
                    Date Range:
                  </label>
                  <div className="flex-1 h-8">
                    <DatePicker onDateChange={setDateRange} />
                  </div>
                </div>

                {/* Patient ID Search */}
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-slate-700 whitespace-nowrap min-w-[70px]">
                    Patient ID:
                  </label>
                  <input
                    type="text"
                    value={patientIdInput}
                    onChange={handlePatientIdChange}
                    placeholder="Search Patient ID..."
                    className="flex-1 h-8 px-3 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-0 focus:border-slate-400 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Results Section */}
            <Status
              data={data}
              dateRange={dateRange}
              patientId={patientIdInput}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
