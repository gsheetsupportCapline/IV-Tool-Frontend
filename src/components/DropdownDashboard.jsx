// DropdownDashboard.jsx

import React, { useState, useEffect } from 'react';
import { getDropdownValues, updateDropdownValues } from './DropdownValues';
import Dropdown from './Dropdown';

const DropdownDashboard = () => {
  const [ivRemarks, setIvRemarks] = useState([]);
  const [source, setSource] = useState([]);
  const [planType, setPlanType] = useState([]);
  const [officeNames, setOfficeNames] = useState([]);
  const [insuranceNames, setInsuranceNames] = useState([]);
  const [newItem, setNewItem] = useState('');

  useEffect(() => {
    const { ivRemarksDropdownOptions, sourceDropdownOptions, planTypeDropdownOptions, officeNames, insuranceNames } = getDropdownValues();
    setIvRemarks(ivRemarksDropdownOptions);
    setSource(sourceDropdownOptions);
    setPlanType(planTypeDropdownOptions);
    setOfficeNames(officeNames);
    setInsuranceNames(insuranceNames);
  }, []);

  const handleAddItem = (type, newItem) => {
    switch (type) {
      case 'ivRemarks':
        setIvRemarks([...ivRemarks, { id: Date.now(), ivRemarks: newItem }]);
        break;
      case 'source':
        setSource([...source, { id: Date.now(), source: newItem }]);
        break;
      case 'planType':
        setPlanType([...planType, { id: Date.now(), planType: newItem }]);
        break;
      case 'officeNames':
        setOfficeNames([...officeNames, { id: Date.now(), officeName: newItem }]);
        break;
      case 'insuranceNames':
        setInsuranceNames([...insuranceNames, { id: Date.now(), name: newItem }]);
        break;
      default:
        break;
    }
    setNewItem('');
    updateDropdownValues({
      ivRemarksDropdownOptions: ivRemarks,
      sourceDropdownOptions: source,
      planTypeDropdownOptions: planType,
      officeNames: officeNames,
      insuranceNames: insuranceNames
    });
  };

  const handleDeleteItem = (type) => {
    switch (type) {
      case 'ivRemarks':
        setIvRemarks(ivRemarks.slice(0, -1));
        break;
      case 'source':
        setSource(source.slice(0, -1));
        break;
      case 'planType':
        setPlanType(planType.slice(0, -1));
        break;
      case 'officeNames':
        setOfficeNames(officeNames.slice(0, -1));
        break;
      case 'insuranceNames':
        setInsuranceNames(insuranceNames.slice(0, -1));
        break;
      default:
        break;
    }
    updateDropdownValues({
      ivRemarksDropdownOptions: ivRemarks,
      sourceDropdownOptions: source,
      planTypeDropdownOptions: planType,
      officeNames: officeNames,
      insuranceNames: insuranceNames
    });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Dropdown Dashboard</h1>
      
      {Object.entries({
        ivRemarks: ivRemarks,
        source: source,
        planType: planType,
        officeNames: officeNames,
        insuranceNames: insuranceNames
      }).map(([key, items]) => (
        <div key={key} className="mb-4">
          <h2 className="text-xl font-semibold mb-2">{key.replace(/([A-Z])/g, ' $1').trim()}</h2>
          <Dropdown type={key} value={items[0]?.id || ''} onChange={(e) => console.log(e.target.value)} />
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            className="w-full p-2 mb-2"
            placeholder={`Enter new ${key.replace(/([A-Z])/g, ' $1').trim()}`}
          />
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={() => handleAddItem(key, newItem)}
          >
            Add New {key.replace(/([A-Z])/g, ' $1').trim()}
          </button>
          <button
            className="bg-red-500 text-white px-4 py-2 rounded ml-2"
            onClick={() => handleDeleteItem(key)}
          >
            Delete Last Item
          </button>
        </div>
      ))}
    </div>
  );
};

export default DropdownDashboard;