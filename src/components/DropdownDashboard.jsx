import { useState, useEffect } from 'react';
import { Button } from '@mui/material';
import { TextField } from '@mui/material';
import { Plus, Trash2 } from 'lucide-react';
import { MenuItem, FormControl, InputLabel, Select } from '@mui/material';
import { Card, CardContent, CardHeader } from '@mui/material';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import BASE_URL from '../config/apiConfig';
import { Grid, Box } from '@mui/material';
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
  useEffect(() => {
    fetch(`${BASE_URL}/api/dropdownValues/`)
      .then((response) => {
        // console.log('Response:', response);
        return response.json();
      })
      .then((data) => {
        // console.log('Received Data:', data);
        const formattedData = formatApiData(data);
        setDropdownValues(formattedData);
      })
      .catch((error) => {
        console.error('Error fetching dropdown values:', error);
        console.error('Full error stack:', error.stack);
      });
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

          // Update local state
          setDropdownValues((prev) => ({
            ...prev,
            [category]: [
              ...prev[category],
              {
                id: nextId.toString(),
                name: newItems[category],
                username: username,
                timestamp: timestamp,
              },
            ],
          }));
          setNewItems((prev) => ({ ...prev, [category]: '' }));
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

        // Update local state
        setDropdownValues((prev) => ({
          ...prev,
          [category]: prev[category].filter(
            (item) => !selectedIds.includes(item.id)
          ),
        }));
        setSelectedItems((prev) => ({ ...prev, [category]: [] }));
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
  const handleSelectChange = (category, value) => {
    setSelectedItems((prev) => {
      if (!prev[category]) {
        prev[category] = [];
      }
      return {
        ...prev,
        [category]: prev[category].includes(value)
          ? prev[category].filter((item) => item !== value)
          : [...prev[category], value],
      };
    });
  };

  return (
    <>
      <div
        className="flex flex-col h-full"
        style={{
          minHeight: 'calc(100vh - 7.5rem)',
          maxHeight: 'calc(100vh - 7.5rem)',
        }}
      >
        <Grid container spacing={2}>
          {Object.entries(dropdownValues).map(([category, items]) => (
            // eslint-disable-next-line react/jsx-key
            <Grid item xs={12} sm={6} md={6} lg={6} xl={6}>
              <Box sx={{ height: '100%' }}>
                <Card sx={{ width: '100%', maxWidth: 500 }}>
                  <CardHeader>{category}</CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <FormControl fullWidth>
                        <InputLabel id={`${category}-label`}>
                          {category}
                        </InputLabel>
                        <Select
                          labelId={`${category}-label`}
                          id={`${category}-select`}
                          value={selectedItems[category]}
                          onChange={(e) =>
                            handleSelectChange(category, e.target.value)
                          }
                          label={category}
                        >
                          {items.map((item, index) => (
                            <MenuItem key={index._id} value={item.id}>
                              {item.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <div className="flex space-x-2">
                        <TextField
                          placeholder={`New ${category} item`}
                          value={newItems[category]}
                          onChange={(e) =>
                            setNewItems({
                              ...newItems,
                              [category]: e.target.value,
                            })
                          }
                        />
                        <Button
                          color="secondary"
                          variant="contained"
                          onClick={() => handleAddItem(category)}
                        >
                          <Plus className="mr-2 h-4 w-4 " /> Add
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
                          onClick={() => handleDeleteItems(category)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Box>
            </Grid>
          ))}
        </Grid>
        <Snackbar
          open={openSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }} // Position at top right
          autoHideDuration={6000}
          onClose={() => setOpenSnackbar(false)}
        >
          <Alert
            onClose={() => setOpenSnackbar(false)}
            severity={snackbarSeverity}
            variant="filled"
            sx={{ width: '100%', marginTop: '50px' }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </div>
    </>
  );
};

export default DropdownDashboard;
