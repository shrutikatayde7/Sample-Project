import React, { useEffect, useState, useCallback } from 'react';
import { Nav } from 'react-bootstrap';
import './Sidebar.css'; // <-- Add this line


const Sidebar = ({ userType = 'admin' }) => {
  const [activeTab, setActiveTab] = useState(userType === 'admin' ? 'programs' : 'schedules');

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
    window.dispatchEvent(new CustomEvent('sidebarTabChange', { detail: tab }));
  }, []);

  useEffect(() => {
    const onExternal = (e) => setActiveTab(e.detail);
    window.addEventListener('sidebarTabChange', onExternal);
    return () => window.removeEventListener('sidebarTabChange', onExternal);
  }, []);

  return (
    <div className="sidebar d-flex flex-column border-end" style={{ borderRadius: 0, width: '100%', background: '#fff', fontFamily: 'Segoe UI, Roboto, Arial, sans-serif', boxShadow: '0 2px 16px 0 rgba(40,167,69,0.08)' }}>
      <div className="brand text-success fw-bold text-center py-4 border-bottom" style={{ borderRadius: 0, fontSize: '1.3rem', letterSpacing: 1 }}>
        GetOnboard
      </div>
      <Nav
        className="flex-column px-3 mt-3"
        activeKey={activeTab}
        onSelect={(k) => k && handleTabChange(k)}
      >
        {userType === 'admin' ? (
          <>
            <Nav.Link
              eventKey="programs"
              className="sidebar-link fw-semibold fs-6 py-2"
            >
              Programs
            </Nav.Link>
            <Nav.Link
              eventKey="schedules"
              className="sidebar-link fw-semibold fs-6 py-2"
            >
              Schedules
            </Nav.Link>
          </>
        ) : (
          <Nav.Link
            eventKey="schedules"
            className="sidebar-link fw-semibold fs-6 py-2"
          >
            My Schedules
          </Nav.Link>
        )}
      </Nav>
    </div>
  );
};

export default Sidebar;

