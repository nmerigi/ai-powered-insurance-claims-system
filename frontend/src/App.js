// App.js
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AuthForm from './AuthForm';
import ClaimantDashboard from './ClaimantDashboard';
import InsurerDashboard from './InsurerDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthForm />} />
        <Route path="/claimant-dashboard" element={<ClaimantDashboard />} />
        <Route path="/insurer-dashboard" element={<InsurerDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
