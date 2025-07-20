// App.js
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AuthForm from './AuthForm';
import ClaimantDashboard from './ClaimantDashboard';
import InsurerDashboard from './InsurerDashboard';
import SubmitClaim from './SubmitClaim';
import ClaimDetails from './ClaimDetails';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthForm />} />
        <Route path="/claimant-dashboard" element={<ClaimantDashboard />} />
        <Route path="/insurer-dashboard" element={<InsurerDashboard />} />
        <Route path="/submit-claim" element={<SubmitClaim/>} />
        <Route path="/claim-details" element={<ClaimDetails />}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
