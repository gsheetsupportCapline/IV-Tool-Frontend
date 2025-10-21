// utils/fetchOfficeOptions.js
import axios from 'axios';
import BASE_URL from '../config/apiConfig';

/**
 * Fetch office options from API based on user role
 * @returns {Promise<Array>} Array of office objects with id and name/officeName
 */
export const fetchOfficeOptions = async () => {
  try {
    const userRole = localStorage.getItem('role');

    if (userRole === 'officeuser') {
      // For office users, get only assigned office
      const assignedOffice = localStorage.getItem('assignedOffice');
      const assignedOffices = assignedOffice ? assignedOffice.split(',') : [];

      // Return in format matching API response
      return assignedOffices.map((office, index) => ({
        id: index + 1,
        name: office.trim(),
        officeName: office.trim(),
      }));
    } else {
      // For other roles, fetch all offices from API
      const encodedCategory = encodeURIComponent('Office');
      const response = await axios.get(
        `${BASE_URL}/api/dropdownValues/${encodedCategory}`
      );

      // Ensure consistent format with both 'name' and 'officeName' properties
      return response.data.options.map((option) => ({
        ...option,
        officeName: option.name || option.officeName,
        name: option.name || option.officeName,
      }));
    }
  } catch (error) {
    console.error('Error fetching office options:', error);
    // Return empty array on error instead of throwing
    return [];
  }
};
