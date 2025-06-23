import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Button, Container, Typography } from '@mui/material';
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CheckInPage from './pages/CheckInPage';
import Navbar from './components/Navbar';
import CompanyCalendarPage from './pages/CompanyCalendarPage';
import CheckOutPage from './pages/CheckOutPage';
import NotificationsPage from './pages/NotificationsPage';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/checkin" element={<CheckInPage />} />
        <Route path="/calendar" element={<CompanyCalendarPage />} />
        <Route path="/checkout" element={<CheckOutPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
      </Routes>
    </Router>
  );
}

export default App
