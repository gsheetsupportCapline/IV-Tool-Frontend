// src/components/OfficeDropdown.jsx
import { useState, useEffect } from 'react';
import { fetchOfficeOptions } from '../utils/fetchOfficeOptions';

const OfficeDropdown = ({
  onSelect,
  allowedOffices,
  showAllOffices = false,
}) => {
  const [officeNames, setOfficeNames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOffices = async () => {
      try {
        setLoading(true);
        const offices = await fetchOfficeOptions();
        setOfficeNames(offices);
      } catch (error) {
        console.error('Error loading offices:', error);
        setOfficeNames([]);
      } finally {
        setLoading(false);
      }
    };

    loadOffices();
  }, []);

  // Check if officeOptions is null (indicating admin role)
  // If not null, filter officeNames based on officeOptions
  const filteredOfficeNames = showAllOffices
    ? officeNames
    : officeNames.filter((office) => allowedOffices.includes(office.name));

  return (
    <select
      className="w-full h-10 px-3 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-0 focus:border-slate-400 transition-colors bg-white text-slate-700"
      onChange={(e) => onSelect(e.target.value)}
      disabled={loading}
    >
      {loading ? (
        <option value="">Loading offices...</option>
      ) : (
        <>
          {filteredOfficeNames.length > 0 && (
            <>
              {filteredOfficeNames.length > 1 && (
                <option value="">Select Office</option>
              )}
              {filteredOfficeNames.map((office) => (
                <option key={office.id} value={office.name}>
                  {office.name}
                </option>
              ))}
            </>
          )}
        </>
      )}
    </select>
  );
};

export default OfficeDropdown;
