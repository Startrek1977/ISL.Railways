import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config/api';
import './TrainList.css';

function TrainList() {
  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTrains();
  }, []);

  const fetchTrains = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/trains`);
      setTrains(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load trains. Make sure the API is running.');
      console.error('Error fetching trains:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading trains...</div>;

  return (
    <div className="train-list">
      <h2>Train Schedule</h2>
      
      {error && <div className="error-message">{error}</div>}

      <div className="trains-table-container">
        <table className="trains-table">
          <thead>
            <tr>
              <th>Train Number</th>
              <th>Origin Station Number</th>
              <th>Origin Station Name</th>
              <th>Destination Station Number</th>
              <th>Destination Station Name</th>
            </tr>
          </thead>
          <tbody>
            {trains.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center' }}>No trains found</td>
              </tr>
            ) : (
              trains.map((train) => (
                <tr key={train.number}>
                  <td>{train.number}</td>
                  <td>{train.origin}</td>
                  <td>{train.originName || 'N/A'}</td>
                  <td>{train.destination}</td>
                  <td>{train.destinationName || 'N/A'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TrainList;
