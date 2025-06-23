import React from 'react';
import ParaManagement from './components/ParaManagement';
import KnowledgeProcessing from './components/KnowledgeProcessing';
import SystemConfiguration from './components/SystemConfiguration';
import './AdminDashboard.css';

/**
 * AdminDashboard component
 * 
 * This component serves as the main dashboard for the administration and processing interface.
 * It will provide access to system configuration, PARA organization, and knowledge processing features.
 */
const AdminDashboard: React.FC = () => {
  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Admin & Processing Dashboard</h1>
        <p>Welcome to the central hub for managing your Second Brain system.</p>
      </header>
      
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <SystemConfiguration />
        </div>
        <div className="dashboard-card">
          <ParaManagement />
        </div>
        <div className="dashboard-card">
          <KnowledgeProcessing />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;