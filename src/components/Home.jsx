import { useState, useEffect } from "react";
import Header from "./Header";
import Status from "./Status";
import OfficeDropdown from "./OfficeDropdown";
import DatePicker from "./DatePicker";
import BASE_URL from "../config/apiConfig";
import PageNotFound from "./PageNotFound";
import { fetchOfficeOptions } from "../utils/fetchOfficeOptions";

const Home = ({ pageState, setPageState, statusState, setStatusState }) => {
  // Use lifted state if available, otherwise use local state
  const [allowedOffices, setAllowedOffices] = useState([]);

  // Get state values - use pageState if available
  const selectedOffice = pageState?.selectedOffice ?? "";
  const data = pageState?.data ?? [];
  const error = pageState?.error ?? false;
  const loading = pageState?.loading ?? false;
  const dateRange = pageState?.dateRange ?? { startDate: null, endDate: null };
  const patientIdInput = pageState?.patientIdInput ?? "";

  // Update functions that use the lifted state
  const setSelectedOffice = (value) => {
    if (setPageState) {
      setPageState((prev) => ({ ...prev, selectedOffice: value }));
    }
  };

  const setData = (value) => {
    if (setPageState) {
      setPageState((prev) => ({ ...prev, data: value }));
    }
  };

  const setError = (value) => {
    if (setPageState) {
      setPageState((prev) => ({ ...prev, error: value }));
    }
  };

  const setLoading = (value) => {
    if (setPageState) {
      setPageState((prev) => ({ ...prev, loading: value }));
    }
  };

  const setDateRange = (value) => {
    if (setPageState) {
      setPageState((prev) => ({ ...prev, dateRange: value }));
    }
  };

  const setPatientIdInput = (value) => {
    if (setPageState) {
      setPageState((prev) => ({ ...prev, patientIdInput: value }));
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${BASE_URL}/api/appointments/fetch-appointments/${selectedOffice}?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`,
      );
      const responseData = await response.json();
      console.log("Fetched data:", responseData);
      if (responseData && responseData.appointments) {
        const sortedAppointments = responseData.appointments.sort((a, b) => {
          return new Date(b.appointmentDate) - new Date(a.appointmentDate);
        });
        setData(sortedAppointments);
      } else {
        console.log("API did not return data ", responseData);
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

        const role = localStorage.getItem("role");
        if (role === "officeuser") {
          const assignedOfficesString = localStorage.getItem("assignedOffice");
          const assignedOffices = assignedOfficesString
            ? assignedOfficesString.split(",").map((o) => o.trim())
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
        console.error("Error loading offices:", error);
        setAllowedOffices([]);
      }
    };

    loadOffices();
  }, []);

  // Don't auto-fetch on mount if data already exists (preserves state across navigation)
  useEffect(() => {
    // Only fetch if office and dates are set AND data is empty
    if (
      selectedOffice.length > 0 &&
      dateRange.startDate &&
      dateRange.endDate &&
      data.length === 0 &&
      !loading
    ) {
      fetchData();
    }
  }, []);

  // Manual fetch function for button click or filter changes
  const handleFetchData = () => {
    if (selectedOffice.length > 0 && dateRange.startDate && dateRange.endDate) {
      fetchData();
    }
  };

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
          style={{ height: "calc(100vh - 4rem)" }}
        >
          <div className="p-3">
            {/* Compact Filters Section */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-3 mb-3">
              <div className="flex items-center gap-4 justify-between">
                {/* Left side - Office Name, Date Range, Search Button */}
                <div className="flex items-center gap-4 flex-1">
                  {/* Office Selector */}
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-slate-700 whitespace-nowrap min-w-[80px]">
                      Office Name:
                    </label>
                    <div className="w-48 h-8">
                      <OfficeDropdown
                        onSelect={setSelectedOffice}
                        allowedOffices={allowedOffices}
                        showAllOffices={
                          localStorage.getItem("role") !== "officeuser"
                        }
                        value={selectedOffice}
                      />
                    </div>
                  </div>

                  {/* Date Range */}
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-slate-700 whitespace-nowrap min-w-[80px]">
                      Date Range:
                    </label>
                    <div className="w-56 h-8">
                      <DatePicker
                        onDateChange={setDateRange}
                        value={dateRange}
                      />
                    </div>
                  </div>

                  {/* Search Button */}
                  <button
                    onClick={handleFetchData}
                    disabled={
                      !selectedOffice ||
                      !dateRange.startDate ||
                      !dateRange.endDate ||
                      loading
                    }
                    className="h-8 px-6 bg-slate-800 text-white text-sm font-medium rounded-md hover:bg-slate-700 focus:outline-none focus:ring-0 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
                  >
                    Search
                  </button>
                </div>

                {/* Right side - Patient ID Search */}
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-slate-700 whitespace-nowrap min-w-[70px]">
                    Patient ID:
                  </label>
                  <input
                    type="text"
                    value={patientIdInput}
                    onChange={handlePatientIdChange}
                    placeholder="Search Patient ID..."
                    className="w-48 h-8 px-3 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-0 focus:border-slate-400 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Results Section */}
            <Status
              data={data}
              dateRange={dateRange}
              patientId={patientIdInput}
              statusState={statusState}
              setStatusState={setStatusState}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
