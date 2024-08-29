import React, { useState } from 'react';
import { Button } from '@mui/material';
import { TextField } from '@mui/material';
import {Plus , Trash2} from 'lucide-react';
import { MenuItem, FormControl, InputLabel, Select } from '@mui/material';
import { Card, CardContent, CardHeader } from '@mui/material';

// Simulating the DropdownValues.js file
const initialDropdownValues = {
  Source: ['Source 1', 'Source 2', 'Source 3'],
  PlanType: ['Plan A', 'Plan B', 'Plan C'],
  IVRemarks: ['Remark 1', 'Remark 2', 'Remark 3'],
};

const DropdownDashboard = () => {
  const [dropdownValues, setDropdownValues] = useState(initialDropdownValues);
  const [newItems, setNewItems] = useState({
    Source: '',
    PlanType: '',
    IVRemarks: '',
  });
  const [selectedItems, setSelectedItems] = useState({
    Source: [],
    PlanType: [],
    IVRemarks: [],
  });

  const handleAddItem = (category) => {
    if (newItems[category].trim() !== '') {
      setDropdownValues((prev) => ({
        ...prev,
        [category]: [...prev[category], newItems[category]],
      }));
      setNewItems((prev) => ({ ...prev, [category]: '' }));
      console.log(`Added ${newItems[category]} to ${category}`);
    }
  };

  const handleDeleteItems = (category) => {
    setDropdownValues((prev) => ({
      ...prev,
      [category]: prev[category].filter((item) => !selectedItems[category].includes(item)),
    }));
    setSelectedItems((prev) => ({ ...prev, [category]: [] }));
    console.log(`Deleted ${selectedItems[category].join(', ')} from ${category}`);
  };

  const handleSelectChange = (category, value) => {
    setSelectedItems((prev) => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter((item) => item !== value)
        : [...prev[category], value],
    }));
  };

  return (
    <div className="space-y-4">
      {Object.entries(dropdownValues).map(([category, items]) => (
        // eslint-disable-next-line react/jsx-key
        <Card sx={{ width: '100%', maxWidth: 500 }}>
          <CardHeader>
        {category}
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <FormControl fullWidth>
                <InputLabel id={`${category}-label`}>{category}</InputLabel>
                <Select
                  labelId={`${category}-label`}
                  id={`${category}-select`}
                  value={selectedItems[category]}
                  onChange={(e) => handleSelectChange(category, e.target.value)}
                  label={category}
                >
                  {items.map((item) => (
                    <MenuItem key={item} value={item}>
                      {item}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <div className="flex space-x-2">
                <TextField
                  placeholder={`New ${category} item`}
                  value={newItems[category]}
                  onChange={(e) => setNewItems({ ...newItems, [category]: e.target.value })}
                />
                <Button  color ="secondary" onClick={() => handleAddItem(category)}>
                  <Plus className="mr-2 h-4 w-4 " /> Add
                </Button>
                <Button color="error" onClick={() => handleDeleteItems(category)} variant="outlined">
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DropdownDashboard;