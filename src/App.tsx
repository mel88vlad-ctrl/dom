import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PrototypeUI from './components/PrototypeUI';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <div className="flex h-screen w-full bg-white dark:bg-[#121212] text-gray-900 dark:text-gray-100 overflow-hidden font-sans">
            <PrototypeUI />
          </div>
        } />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}
