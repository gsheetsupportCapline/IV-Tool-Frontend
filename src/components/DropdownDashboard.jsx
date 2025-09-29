import { useState, useEffect } from 'react';
import { Plus, Trash2, ChevronDown } from 'lucide-react';
import BASE_URL from '../config/apiConfig';
const initialDropdownValues = {
  ivRemarksDropdownOptions: [],
  sourceDropdownOptions: [],
  planTypeDropdownOptions: [],
  insuranceNames: [],
};

const DropdownDashboard = () => {
  const [dropdownValues, setDropdownValues] = useState(initialDropdownValues);
  const [newItems, setNewItems] = useState({
    ivRemarksDropdownOptions: '',
    sourceDropdownOptions: '',
    planTypeDropdownOptions: '',
    insuranceNames: '',
  });
  const [selectedItems, setSelectedItems] = useState({
    ivRemarksDropdownOptions: [],
    sourceDropdownOptions: [],
    planTypeDropdownOptions: [],
    insuranceNames: [],
  });
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [username, setUsername] = useState(
    localStorage.getItem('loggedinUserName')
  );
  const [timestamp, setTimestamp] = useState(new Date().toISOString());

  const fetchDropdownValues = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/dropdownValues/`);
      const data = await response.json();
      const formattedData = formatApiData(data);
      setDropdownValues(formattedData);
    } catch (error) {
      console.error('Error fetching dropdown values:', error);
      console.error('Full error stack:', error.stack);
    }
  };

  useEffect(() => {
    fetchDropdownValues();
  }, []);
  const formatApiData = (apiData) => {
    const formattedData = {};
    apiData.forEach((item) => {
      const category = item.category;
      formattedData[category] = item.options.map((option) => ({
        id: option.id,
        name: option.name,
        _id: option._id,
      }));
    });
    return formattedData;
  };

  const handleAddItem = async (category) => {
    if (newItems[category].trim() !== '') {
      const existingNames = dropdownValues[category].map((item) => item.name);

      if (!existingNames.includes(newItems[category])) {
        try {
          // Find the current highest ID in the category
          const currentIds = dropdownValues[category].map((item) => item.id);
          console.log(currentIds);
          const nextId = Math.max(...currentIds) + 1 || 1; // Start at 1 if the array is empty

          const response = await fetch(`${BASE_URL}/api/dropdownValues/add`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              category,
              options: [
                {
                  id: nextId,
                  name: newItems[category],
                  username: username,
                  timestamp: timestamp,
                },
              ],
            }),
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          console.log('Added item successfully:', data);

          // Clear input field and refresh the list from server
          setNewItems((prev) => ({ ...prev, [category]: '' }));
          await fetchDropdownValues();

          console.log(`Added ${newItems[category]} to ${category}`);
          // Set snackbar message and open it
          setSnackbarMessage(
            `Added ${newItems[category]} to ${category} successfully!`
          );
          setOpenSnackbar(true);
          setSnackbarSeverity('success');
        } catch (error) {
          console.error('Error adding item:', error);
          setSnackbarMessage(`Error adding item: ${error.message}`);
          setOpenSnackbar(true);
          setSnackbarSeverity('error');
        }
      } else {
        console.warn(`${newItems[category]} already exists in ${category}.`);
        // Optionally, you can clear the input field here
        setNewItems((prev) => ({ ...prev, [category]: '' }));
      }
    }
  };

  const handleDeleteItems = async (category) => {
    const selectedIds = selectedItems[category] || [];
    if (selectedIds.length > 0) {
      try {
        const response = await fetch(`${BASE_URL}/api/dropdownValues/delete`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            category,
            optionIds: selectedIds,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Deleted items successfully:', data);

        // Clear selected items first
        setSelectedItems((prev) => ({ ...prev, [category]: [] }));

        // Refresh the dropdown values from server to show updated list
        await fetchDropdownValues();

        console.log(`Deleted ${selectedIds.length} items from ${category}`);
        setSnackbarMessage(
          `Deleted ${selectedIds.length} items from ${category} successfully!`
        );
        setOpenSnackbar(true);
        setSnackbarSeverity('success');
      } catch (error) {
        console.error('Error deleting items:', error);
        setSnackbarMessage(`Error deleting items: ${error.message}`);
        setOpenSnackbar(true);
        setSnackbarSeverity('error');
      }
    } else {
      setSnackbarMessage('No items selected for deletion');
      setOpenSnackbar(true);
      setSnackbarSeverity('error');
    }
  };

  return (
    <div className="p-6">
      {/* Page Header */}

      {/* Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Object.entries(dropdownValues).map(([category, items]) => (
          <div
            key={category}
            className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden"
          >
            {/* Card Header */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-4">
              <h3 className="text-lg font-semibold text-white capitalize">
                {category.replace(/([A-Z])/g, ' $1').trim()}
              </h3>
            </div>

            {/* Card Content */}
            <div className="p-6 space-y-4">
              {/* Dropdown Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Select Items to Delete
                </label>
                <div className="relative">
                  <select
                    multiple
                    value={selectedItems[category] || []}
                    onChange={(e) => {
                      const selectedValues = Array.from(
                        e.target.selectedOptions,
                        (option) => option.value
                      );
                      setSelectedItems((prev) => ({
                        ...prev,
                        [category]: selectedValues,
                      }));
                    }}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-slate-700 min-h-[120px]"
                  >
                    {items.map((item) => (
                      <option key={item._id} value={item.id} className="py-1">
                        {item.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-3 h-5 w-5 text-slate-400 pointer-events-none" />
                </div>
                <p className="text-xs text-slate-500">
                  Hold Ctrl/Cmd to select multiple items
                </p>
              </div>

              {/* Add New Item */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-700">
                  Add New Item
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder={`Enter new ${category
                      .replace(/([A-Z])/g, ' $1')
                      .toLowerCase()} item`}
                    value={newItems[category]}
                    onChange={(e) =>
                      setNewItems({
                        ...newItems,
                        [category]: e.target.value,
                      })
                    }
                    className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                  <button
                    onClick={() => handleAddItem(category)}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2 shadow-sm"
                  >
                    <Plus className="h-4 w-4" />
                    Add
                  </button>
                </div>
              </div>

              {/* Delete Button */}
              <div className="pt-2">
                <button
                  onClick={() => handleDeleteItems(category)}
                  disabled={(selectedItems[category] || []).length === 0}
                  className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Selected ({(selectedItems[category] || []).length})
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Toast Notifications */}
      {openSnackbar && (
        <div className="fixed top-4 right-4 z-50">
          <div
            className={`px-6 py-4 rounded-lg shadow-lg text-white font-medium ${
              snackbarSeverity === 'success' ? 'bg-green-600' : 'bg-red-600'
            }`}
          >
            {snackbarMessage}
          </div>
        </div>
      )}
    </div>
  );
};

export default DropdownDashboard;
