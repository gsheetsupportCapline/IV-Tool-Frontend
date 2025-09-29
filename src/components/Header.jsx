import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Disclosure } from '@headlessui/react';
import Logo from '../utils/Smilepoint_Dental.png';
import { useHistory, useLocation } from 'react-router-dom';
import './Header.css';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

// Memoized Navigation Button Component
const NavigationButton = React.memo(
  ({ item, isActive, isLogout, onNavigate }) => {
    const handleClick = useCallback(() => {
      onNavigate(item.link);
    }, [item.link, onNavigate]);

    return (
      <button
        onClick={handleClick}
        className={classNames(
          'nav-button px-4 py-2 text-sm font-medium rounded-lg shadow-md',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          isLogout
            ? 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500'
            : isActive
            ? 'nav-button-active text-white focus:ring-blue-500'
            : 'bg-slate-700 hover:bg-blue-600 text-slate-100 hover:text-white focus:ring-blue-500'
        )}
        aria-current={isActive ? 'page' : undefined}
      >
        <span className="nav-button-text">{item.text}</span>
      </button>
    );
  }
);

NavigationButton.displayName = 'NavigationButton';

// Memoized Logo Component
const LogoSection = React.memo(() => (
  <div className="flex items-center space-x-4 flex-shrink-0">
    <div className="logo-container">
      <img
        className="h-10 w-auto rounded-lg bg-white p-1 shadow-sm"
        src={Logo}
        alt="SmilePoint Dental"
      />
    </div>
    <div className="hidden md:block">
      <h1 className="text-white text-lg font-bold tracking-wide">SmileIV</h1>
      <p className="text-slate-300 text-xs">Smilepoint's Patient IV System</p>
    </div>
  </div>
));

LogoSection.displayName = 'LogoSection';

// Memoized Navigation Container
const NavigationContainer = React.memo(
  ({ navigation, currentPath, onNavigate }) => {
    return (
      <div className="navigation-container">
        {navigation.map((item) => {
          if (!item.show) return null;

          const isLogout = item.text === 'Log Out';
          const isActive = currentPath === item.link;

          return (
            <NavigationButton
              key={item.text}
              item={item}
              isActive={isActive}
              isLogout={isLogout}
              onNavigate={onNavigate}
            />
          );
        })}
      </div>
    );
  }
);

NavigationContainer.displayName = 'NavigationContainer';

const Header = () => {
  const history = useHistory();
  const location = useLocation();
  const [userRole, setUserRole] = useState(() => {
    // Initialize userRole from localStorage immediately
    return localStorage.getItem('role') || '';
  });

  // Only set userRole once on mount, not on every render
  useEffect(() => {
    const storedUserRole = localStorage.getItem('role');
    if (storedUserRole && storedUserRole !== userRole) {
      setUserRole(storedUserRole);
    }
  }, []); // Empty dependency array - only run once

  // Memoize navigation array - only recreate when userRole changes
  const navigation = useMemo(
    () => [
      { link: '/schedule-patient', text: 'Scheduled Patients', show: true },
      { link: '/awaitingIV', text: 'IVs Awaiting', show: true },
      { link: '/request-rush', text: 'Request a Rush', show: true },
      {
        link: '/admin',
        text: 'Assign IVs',
        show: userRole === 'admin',
      },
      {
        link: '/admin-dashboard',
        text: 'Dashboard',
        show: userRole === 'admin',
      },
      {
        link: '/dashboard',
        text: 'Dashboard',
        show: userRole === 'user',
      },
      { link: '/', text: 'Log Out', show: true },
    ],
    [userRole]
  );

  // Memoized navigation handler to prevent recreation
  const handleNavigation = useCallback(
    (link) => {
      if (location.pathname === link) return;
      history.push(link);
    },
    [history, location.pathname]
  );
  return (
    <Disclosure
      as="nav"
      className="sticky top-0 z-50 bg-gradient-to-r from-slate-800 to-slate-900 header-background"
    >
      <div className="shadow-lg border-b border-slate-700 backdrop-blur-sm header-nav-container">
        <div className="w-full px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between w-full">
            <LogoSection />
            <NavigationContainer
              navigation={navigation}
              currentPath={location.pathname}
              onNavigate={handleNavigation}
            />
          </div>
        </div>
      </div>
    </Disclosure>
  );
};

// Export memoized Header component
export default React.memo(Header);
