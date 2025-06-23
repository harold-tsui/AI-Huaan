import React from 'react';
import ReactDOM from 'react-dom/client';
import AdminDashboard from './AdminDashboard';

const rootElement = document.getElementById('app');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <AdminDashboard />
    </React.StrictMode>
  );
}