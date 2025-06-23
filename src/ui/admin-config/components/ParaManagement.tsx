import React, { useEffect, useState } from 'react';
import { apiClient } from '../client';
import { OrganizationConfig, OrganizationStatus, OrganizationHistory } from '../types';
import './ParaManagement.css';

const ParaManagement: React.FC = () => {
  const [config, setConfig] = useState<OrganizationConfig | null>(null);
  const [status, setStatus] = useState<OrganizationStatus | null>(null);
  const [history, setHistory] = useState<OrganizationHistory[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [config, status, history] = await Promise.all([
        apiClient.get<OrganizationConfig>('/organization/config'),
        apiClient.get<OrganizationStatus>('/organization/status'),
        apiClient.get<OrganizationHistory[]>('/organization/history'),
      ]);
        setConfig(config);
        setStatus(status);
        setHistory(history);
      } catch (err) {
        setError('Failed to load organization data.');
        console.error(err);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h2>PARA Organization</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div className="para-section">
        <h3>Organization Configuration</h3>
        {config ? (
          <ul>
            {Object.entries(config).map(([key, value]) => (
              <li key={key}>
                <strong>{key}:</strong> <pre>{JSON.stringify(value, null, 2)}</pre>
              </li>
            ))}
          </ul>
        ) : (
          <p>Loading...</p>
        )}
      </div>
      <div className="para-section">
        <h3>Organization Status</h3>
        {status ? (
          <ul>
            {Object.entries(status).map(([key, value]) => (
              <li key={key}>
                <strong>{key}:</strong> <pre>{JSON.stringify(value, null, 2)}</pre>
              </li>
            ))}
          </ul>
        ) : (
          <p>Loading...</p>
        )}
      </div>
      <div className="para-section">
        <h3>History</h3>
        {history.length > 0 ? (
          <ul>
            {history.map((item, index) => (
              <li key={index}>
                <pre>{JSON.stringify(item, null, 2)}</pre>
              </li>
            ))}
          </ul>
        ) : (
          <p>Loading or no history...</p>
        )}
      </div>
    </div>
  );
};

export default ParaManagement;