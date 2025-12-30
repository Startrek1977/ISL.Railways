import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config/api';
import './TrainList.css';

function TrainList() {
  const [trains, setTrains] = useState([]);
  const [stations, setStations] = useState([]);
  const [newTrain, setNewTrain] = useState({ number: '', origin: '', destination: '' });
  const [editingTrain, setEditingTrain] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTrains();
    fetchStations();
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

  const fetchStations = async () => {
    try {
      const response = await axios.get(`${API_URL}/stations`);
      setStations(response.data);
    } catch (err) {
      console.error('Error fetching stations:', err);
    }
  };

  const handleAddTrain = async (e) => {
    e.preventDefault();
    const trainNumber = parseInt(newTrain.number);
    const origin = parseInt(newTrain.origin);
    const destination = parseInt(newTrain.destination);
    
    if (trainNumber < 10 || trainNumber > 100) {
      setError('Train number must be between 10 and 100');
      return;
    }

    if (origin === destination) {
      setError('Origin and destination must be different');
      return;
    }

    try {
      await axios.post(`${API_URL}/trains`, {
        number: trainNumber,
        origin: origin,
        destination: destination
      });
      setNewTrain({ number: '', origin: '', destination: '' });
      fetchTrains();
      setError('');
    } catch (err) {
      setError(err.response?.data || 'Failed to add train');
    }
  };

  const handleUpdateTrain = async (e) => {
    e.preventDefault();
    
    if (editingTrain.origin === editingTrain.destination) {
      setError('Origin and destination must be different');
      return;
    }

    try {
      await axios.put(`${API_URL}/trains/${editingTrain.number}`, editingTrain);
      setEditingTrain(null);
      fetchTrains();
      setError('');
    } catch (err) {
      setError(err.response?.data || 'Failed to update train');
    }
  };

  const handleDeleteTrain = async (number) => {
    if (window.confirm('Are you sure you want to delete this train?')) {
      try {
        await axios.delete(`${API_URL}/trains/${number}`);
        fetchTrains();
        setError('');
      } catch (err) {
        setError(err.response?.data || 'Failed to delete train');
      }
    }
  };

  if (loading) return <div className="loading">Loading trains...</div>;

  return (
    <div className="train-list">
      <h2>🚂 Trains</h2>
      
      {error && <div className="error-message">{error}</div>}

      <div className="add-train-form">
        <h3>Add New Train</h3>
        <form onSubmit={handleAddTrain}>
          <input
            type="number"
            placeholder="Train Number (10-100)"
            value={newTrain.number}
            onChange={(e) => setNewTrain({ ...newTrain, number: e.target.value })}
            required
            min="10"
            max="100"
          />
          <select
            value={newTrain.origin}
            onChange={(e) => setNewTrain({ ...newTrain, origin: e.target.value })}
            required
          >
            <option value="">Select Origin Station</option>
            {stations.map((station) => (
              <option key={station.number} value={station.number}>
                {station.number} - {station.name}
              </option>
            ))}
          </select>
          <select
            value={newTrain.destination}
            onChange={(e) => setNewTrain({ ...newTrain, destination: e.target.value })}
            required
          >
            <option value="">Select Destination Station</option>
            {stations.map((station) => (
              <option key={station.number} value={station.number}>
                {station.number} - {station.name}
              </option>
            ))}
          </select>
          <button type="submit">Add Train</button>
        </form>
      </div>

      {editingTrain && (
        <div className="edit-train-form">
          <h3>Edit Train</h3>
          <form onSubmit={handleUpdateTrain}>
            <input
              type="number"
              value={editingTrain.number}
              disabled
            />
            <select
              value={editingTrain.origin}
              onChange={(e) => setEditingTrain({ ...editingTrain, origin: parseInt(e.target.value) })}
              required
            >
              <option value="">Select Origin Station</option>
              {stations.map((station) => (
                <option key={station.number} value={station.number}>
                  {station.number} - {station.name}
                </option>
              ))}
            </select>
            <select
              value={editingTrain.destination}
              onChange={(e) => setEditingTrain({ ...editingTrain, destination: parseInt(e.target.value) })}
              required
            >
              <option value="">Select Destination Station</option>
              {stations.map((station) => (
                <option key={station.number} value={station.number}>
                  {station.number} - {station.name}
                </option>
              ))}
            </select>
            <button type="submit">Update</button>
            <button type="button" onClick={() => setEditingTrain(null)}>Cancel</button>
          </form>
        </div>
      )}

      <div className="trains-table-container">
        <table className="trains-table">
          <thead>
            <tr>
              <th>Train Number</th>
              <th>Origin</th>
              <th>Destination</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {trains.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center' }}>No trains found. Add one above!</td>
              </tr>
            ) : (
              trains.map((train) => (
                <tr key={train.number}>
                  <td>{train.number}</td>
                  <td>{train.origin} - {train.originName}</td>
                  <td>{train.destination} - {train.destinationName}</td>
                  <td>
                    <button onClick={() => setEditingTrain(train)} className="btn-edit">Edit</button>
                    <button onClick={() => handleDeleteTrain(train.number)} className="btn-delete">Delete</button>
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

export default TrainList;
