import { useState, useEffect } from 'react';

import { Disclosure } from '@headlessui/react';
import Logo from '../utils/Smilepoint_Dental.png';
import { useHistory, useLocation } from 'react-router-dom';

// const navigation = [
//   { name: "Scheduled Patients", href: "/schedule-patient", current: true },
//   { name: "Ivs Awaiting", href: "/awaitingIV", current: false },
//   { name: "Request a Rush", href: "/request-rush", current: false },
//   { name: "Assign IVs", href: "/admin", current: false },
//   { name: "Dashboard", href: "/admin-dashboard", current: false },
//   { name: "Log Out", href: "/", current: false },
// ];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}
const Header = () => {
  const history = useHistory();
  const location = useLocation();
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const storedUserRole = localStorage.getItem('role');
    if (storedUserRole) {
      setUserRole(storedUserRole);
    }
  }, []);

  const navigation = [
    { link: '/schedule-patient', text: 'Scheduled Patients', show: true },
    { link: '/awaitingIV', text: 'IVs Awaiting', show: true },
    { link: '/request-rush', text: 'Request a Rush', show: true },
    {
      link: '/admin',
      text: 'Assign IVs',
      show: userRole == 'admin' ? true : false,
    },
    {
      link: '/admin-dashboard',
      text: 'Dashboard',
      show: userRole == 'admin' ? true : false,
    },
    {
      link: '/dashboard',
      text: 'Dashboard',
      show: userRole == 'user' ? true : false,
    },
    { link: '/', text: 'Log Out', show: true },
  ];
  return (
    <Disclosure as="nav">
      {({ open }) => (
        <>
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 shadow-lg border-b border-slate-700">
            <div className="w-full px-6 lg:px-8">
              <div className="flex h-16 items-center justify-between w-full">
                {/* Logo Section */}
                <div className="flex items-center space-x-4">
                  <img
                    className="h-10 w-auto rounded-lg bg-white p-1 shadow-sm"
                    src={Logo}
                    alt="SmilePoint Dental"
                  />
                  <div className="hidden md:block">
                    <h1 className="text-white text-lg font-bold tracking-wide">
                      IV Management System
                    </h1>
                    <p className="text-slate-300 text-xs">
                      Professional Dental Solutions
                    </p>
                  </div>
                </div>

                {/* Navigation Section */}
                <div className="flex items-center space-x-2">
                  {navigation.map((item) => {
                    if (item.show) {
                      const isLogout = item.text === 'Log Out';
                      const isActive = location.pathname === item.link;
                      return (
                        <button
                          key={item.text}
                          onClick={() => history.push(item.link)}
                          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 ${
                            isLogout
                              ? 'bg-red-600 hover:bg-red-700 text-white'
                              : isActive
                              ? 'bg-blue-600 text-white shadow-lg scale-105 border-2 border-blue-400'
                              : 'bg-slate-700 hover:bg-blue-600 text-slate-100 hover:text-white'
                          }`}
                          aria-current={isActive ? 'page' : undefined}
                        >
                          {item.text}
                        </button>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </Disclosure>
  );
};

export default Header;
