import React from 'react';
import { Button } from 'react-bootstrap';

const Header = () => (
  <header style={{ height: 72, background: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', boxShadow: '0 2px 8px 0 rgba(40,167,69,0.10)', fontFamily: 'Segoe UI, Roboto, Arial, sans-serif' }}>
    <div style={{ fontWeight: 700, fontSize: '1.5rem', color: '#222', letterSpacing: 1 }}>Training Dashboard</div>
    <div>
      <Button variant="outline-success" style={{ fontWeight: 600, borderRadius: 24, marginRight: 12 }}>Profile</Button>
      <Button variant="danger" style={{ fontWeight: 600, borderRadius: 24 }}>Logout</Button>
    </div>
  </header>
);

export default Header;
