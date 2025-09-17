import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './components/App';
import EmployeeDashboard from './components/EmployeeDashboard';
import Login from './components/Login';

function MainRouter() {
  const employeeEmail = localStorage.getItem('employeeEmail');
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/employee"
          element={employeeEmail ? <EmployeeDashboard /> : <Navigate to="/login" />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default MainRouter;