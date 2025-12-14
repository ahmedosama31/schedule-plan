import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SchedulerPage from './pages/SchedulerPage';
import AdminPage from './pages/AdminPage';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SchedulerPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </Router>
  );
};

export default App;
