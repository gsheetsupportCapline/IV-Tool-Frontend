// src/components/AdminDashboard.jsx

import { useState } from 'react';
import PendingIV from './PendingIV';
import AssignedIV from './AssignedIV';
import ProductionIV from './ProductionIV';
import DropdownDashboard from './DropdownDashboard';
import ManageUsers from './ManageUsers';
import Header from './Header';

const AdminDashboard = () => {
  const [selectedItem, setSelectedItem] = useState('PendingIV');

  return (
    <>
      <Header />
      <div className="flex" style={{ height: 'calc(100vh - 4rem)' }}>
        {/* Modern Business Sidebar */}
        <div className="w-1/5 bg-gradient-to-b from-slate-800 to-slate-900 shadow-xl">
          {/* Sidebar Header */}
          <div className="px-6 py-6 border-b border-slate-700">
            <h2 className="text-xl font-bold text-white tracking-wide">
              Admin Dashboard
            </h2>
            <p className="text-slate-300 text-sm mt-1">Management Panel</p>
          </div>

          {/* Navigation Menu */}
          <nav className="mt-6 px-4">
            <div className="space-y-2">
              {/* Pending IV */}
              <button
                onClick={() => setSelectedItem('PendingIV')}
                className={`w-full text-left px-4 py-3 text-sm font-medium transition-all duration-200 flex items-center space-x-3 ${
                  selectedItem === 'PendingIV'
                    ? 'bg-blue-600 text-white shadow-lg transform scale-[1.02]'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                <span>Pending IV</span>
              </button>

              {/* Assigned IV */}
              <button
                onClick={() => setSelectedItem('AssignedIV')}
                className={`w-full text-left px-4 py-3 text-sm font-medium transition-all duration-200 flex items-center space-x-3 ${
                  selectedItem === 'AssignedIV'
                    ? 'bg-blue-600 text-white shadow-lg transform scale-[1.02]'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                <span>Assigned IV</span>
              </button>

              {/* IV Team Production */}
              <button
                onClick={() => setSelectedItem('ProductionIV')}
                className={`w-full text-left px-4 py-3 text-sm font-medium transition-all duration-200 flex items-center space-x-3 ${
                  selectedItem === 'ProductionIV'
                    ? 'bg-blue-600 text-white shadow-lg transform scale-[1.02]'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                <span>IV Team Production</span>
              </button>

              {/* Divider */}
              <div className="border-t border-slate-700 my-4"></div>

              {/* Validations */}
              <button
                onClick={() => setSelectedItem('DropdownValues')}
                className={`w-full text-left px-4 py-3 text-sm font-medium transition-all duration-200 flex items-center space-x-3 ${
                  selectedItem === 'DropdownValues'
                    ? 'bg-blue-600 text-white shadow-lg transform scale-[1.02]'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                <span>Validations</span>
              </button>

              {/* Manage Users */}
              <button
                onClick={() => setSelectedItem('ManageUsers')}
                className={`w-full text-left px-4 py-3 text-sm font-medium transition-all duration-200 flex items-center space-x-3 ${
                  selectedItem === 'ManageUsers'
                    ? 'bg-blue-600 text-white shadow-lg transform scale-[1.02]'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                <span>Manage Users</span>
              </button>
            </div>
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="w-4/5 bg-gray-50 overflow-auto">
          <div className="p-6">
            {selectedItem === 'PendingIV' && <PendingIV />}
            {selectedItem === 'AssignedIV' && <AssignedIV />}
            {selectedItem === 'ProductionIV' && <ProductionIV />}
            {selectedItem === 'DropdownValues' && <DropdownDashboard />}
            {selectedItem === 'ManageUsers' && <ManageUsers />}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
