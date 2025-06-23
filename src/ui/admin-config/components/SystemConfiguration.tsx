import React, { useEffect, useState } from 'react';
import { apiClient } from '../client';
import { SystemConfig } from '../types';
import './SystemConfiguration.css';

const SystemConfiguration: React.FC = () => {
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const data = await apiClient.get<SystemConfig>('/config');
        setConfig(data);
      } catch (err) {
        setError('Failed to load configuration.');
        console.error(err);
      }
    };

    fetchConfig();
  }, []);

  return (
    <div>
      <h2>System Configuration</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {config ? (
        <div className="config-section">
          <h3>Current Configuration</h3>
          <ul>
            {Object.entries(config).map(([key, value]) => (
              <li key={key}>
                <strong>{key}:</strong> {JSON.stringify(value, null, 2)}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p>Loading configuration...</p>
      )}
    </div>
  );
};

export default SystemConfiguration;