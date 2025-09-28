import { useState, useEffect } from 'react';
import Header from './Header';
import Status from './Status';
import OfficeDropdown from './OfficeDropdown';
import DatePicker from './DatePicker';
import BASE_URL from '../config/apiConfig';
import PageNotFound from './PageNotFound';

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
    const role = localStorage.getItem('role');
    if (role === 'admin') {
      setAllowedOffices([
        'Aransas',
        'Azle',
        'Beaumont',
        'Benbrook',
        'Calallen',
        'Crosby',
        'Devine',
        'Elgin',
        'Grangerland',
        'Huffman',
        'Jasper',
        'Lavaca',
        'Liberty',
        'Lytle',
        'Mathis',
        'Potranco',
        'Rio Bravo',
        'Riverwalk',
        'Rockdale',
        'Sinton',
        'Splendora',
        'Springtown',
        'Tidwell',
        'Victoria',
        'Westgreen',
        'Winnie',
      ]);
    } else if (role === 'officeuser') {
      const assignedOfficesString = localStorage.getItem('assignedOffice');
      const assignedOffices = assignedOfficesString
        ? assignedOfficesString.split(',')
        : [];
      setAllowedOffices(assignedOffices);
      if (assignedOfficesString) {
        setSelectedOffice(assignedOfficesString);
      }
    } else {
      setAllowedOffices([]);
    }
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
          className="h-full overflow-auto"
          style={{ height: 'calc(100vh - 4rem)' }}
        >
          <div className="p-4">
            {/* Unified Filters Section */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 mb-4">
              <div className="grid grid-cols-3 gap-6 items-end">
                {/* Office Selector */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Office Name
                  </label>
                  <div className="h-10">
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
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Date Range
                  </label>
                  <div className="h-10">
                    <DatePicker onDateChange={setDateRange} />
                  </div>
                </div>

                {/* Patient ID Search */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Patient ID
                  </label>
                  <input
                    type="text"
                    value={patientIdInput}
                    onChange={handlePatientIdChange}
                    placeholder="Search Patient ID..."
                    className="w-full h-10 px-3 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-0 focus:border-slate-400 transition-colors"
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
