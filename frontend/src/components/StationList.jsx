import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config/api';
import './StationList.css';

/**
 * Read-only StationList component.
 * Stations are seeded at database initialization and cannot be modified at runtime.
 * To change stations, update the seed data in the backend and recreate the database.
 */
function StationList() {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStations();
  }, []);

  const fetchStations = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/stations`);
      setStations(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load stations. Make sure the API is running.');
      console.error('Error fetching stations:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading stations...</div>;

  return (
    <div className="station-list">
      <h2>🚉 Stations</h2>
      
      {error && <div className="error-message">{error}</div>}

      <div className="info-message">
        <p>ℹ️ Stations are pre-configured and cannot be modified at runtime.</p>
        <p>These represent the Israeli railway network stations.</p>
      </div>

      <div className="stations-table-container">
        <table className="stations-table">
          <thead>
            <tr>
              <th>Number</th>
              <th>Name</th>
            </tr>
          </thead>
          <tbody>
            {stations.length === 0 ? (
              <tr>
                <td colSpan="2" style={{ textAlign: 'center' }}>No stations found.</td>
              </tr>
            ) : (
              stations.map((station) => (
                <tr key={station.number}>
                  <td>{station.number}</td>
                  <td>{station.name}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default StationList;
