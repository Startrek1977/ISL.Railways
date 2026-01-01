import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config/api';
import './StationList.css';

function StationList() {
  const [stations, setStations] = useState([]);
  const [newStation, setNewStation] = useState({ number: '', name: '' });
  const [editingStation, setEditingStation] = useState(null);
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

  const handleAddStation = async (e) => {
    e.preventDefault();
    const stationNumber = parseInt(newStation.number);
    
    if (stationNumber < 1000 || stationNumber > 8000) {
      setError('Station number must be between 1000 and 8000');
      return;
    }

    try {
      await axios.post(`${API_URL}/stations`, {
        number: stationNumber,
        name: newStation.name
      });
      setNewStation({ number: '', name: '' });
      fetchStations();
      setError('');
    } catch (err) {
      setError(err.response?.data || 'Failed to add station');
    }
  };

  const handleUpdateStation = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/stations/${editingStation.number}`, editingStation);
      setEditingStation(null);
      fetchStations();
      setError('');
    } catch (err) {
      setError(err.response?.data || 'Failed to update station');
    }
  };

  const handleDeleteStation = async (number) => {
    if (window.confirm('Are you sure you want to delete this station?')) {
      try {
        await axios.delete(`${API_URL}/stations/${number}`);
        fetchStations();
        setError('');
      } catch (err) {
        setError(err.response?.data || 'Failed to delete station');
      }
    }
  };

  if (loading) return <div className="loading">Loading stations...</div>;

  return (
    <div className="station-list">
      <h2>🚉 Stations</h2>
      
      {error && <div className="error-message">{error}</div>}

      <div className="add-station-form">
        <h3>Add New Station</h3>
        <form onSubmit={handleAddStation}>
          <input
            type="number"
            placeholder="Station Number (1000-8000)"
            value={newStation.number}
            onChange={(e) => setNewStation({ ...newStation, number: e.target.value })}
            required
            min="1000"
            max="8000"
          />
          <input
            type="text"
            placeholder="Station Name"
            value={newStation.name}
            onChange={(e) => setNewStation({ ...newStation, name: e.target.value })}
            required
            maxLength="100"
          />
          <button type="submit">Add Station</button>
        </form>
      </div>

      {editingStation && (
        <div className="edit-station-form">
          <h3>Edit Station</h3>
          <form onSubmit={handleUpdateStation}>
            <input
              type="number"
              value={editingStation.number}
              disabled
            />
            <input
              type="text"
              placeholder="Station Name"
              value={editingStation.name}
              onChange={(e) => setEditingStation({ ...editingStation, name: e.target.value })}
              required
            />
            <button type="submit">Update</button>
            <button type="button" onClick={() => setEditingStation(null)}>Cancel</button>
          </form>
        </div>
      )}

      <div className="stations-table-container">
        <table className="stations-table">
          <thead>
            <tr>
              <th>Number</th>
              <th>Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {stations.length === 0 ? (
              <tr>
                <td colSpan="3" style={{ textAlign: 'center' }}>No stations found. Add one above!</td>
              </tr>
            ) : (
              stations.map((station) => (
                <tr key={station.number}>
                  <td>{station.number}</td>
                  <td>{station.name}</td>
                  <td>
                    <button onClick={() => setEditingStation(station)} className="btn-edit">Edit</button>
                    <button onClick={() => handleDeleteStation(station.number)} className="btn-delete">Delete</button>
                  </td>
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
