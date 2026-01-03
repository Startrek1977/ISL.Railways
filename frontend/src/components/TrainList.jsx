import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config/api';
import './TrainList.css';

function TrainList() {
  const [trains, setTrains] = useState([]);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingTrainNumber, setEditingTrainNumber] = useState(null);
  const [editingTrain, setEditingTrain] = useState(null);
  const [addingNewTrain, setAddingNewTrain] = useState(false);
  const [newTrain, setNewTrain] = useState(null);
  const [selectedTrain, setSelectedTrain] = useState(null);

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

  const getNextTrainNumber = () => {
    if (trains.length === 0) return 10;
    const maxNumber = Math.max(...trains.map(t => t.number));
    return maxNumber + 10 <= 100 ? maxNumber + 10 : null;
  };

  const handleAddNewTrain = () => {
    const nextNumber = getNextTrainNumber();
    if (nextNumber === null || nextNumber > 100) {
      setError('Cannot add more trains. Maximum train number (100) reached.');
      return;
    }
    
    setNewTrain({
      number: nextNumber,
      origin: '',
      destination: ''
    });
    setAddingNewTrain(true);
    setError('');
  };

  const handleSaveNewTrain = async () => {
    if (!newTrain.origin || !newTrain.destination) {
      setError('Please select both origin and destination stations');
      return;
    }

    if (newTrain.origin === newTrain.destination) {
      setError('Origin and destination must be different');
      return;
    }

    try {
      await axios.post(`${API_URL}/trains`, {
        number: newTrain.number,
        origin: parseInt(newTrain.origin),
        destination: parseInt(newTrain.destination)
      });
      setAddingNewTrain(false);
      setNewTrain(null);
      fetchTrains();
      setError('');
    } catch (err) {
      setError(err.response?.data || 'Failed to add train');
    }
  };

  const handleCancelNewTrain = () => {
    setAddingNewTrain(false);
    setNewTrain(null);
    setError('');
  };

  const handleEditTrain = (train) => {
    setEditingTrainNumber(train.number);
    setEditingTrain({
      number: train.number,
      origin: train.origin.toString(),
      destination: train.destination.toString()
    });
    setError('');
  };

  const handleSaveEditTrain = async () => {
    if (!editingTrain.origin || !editingTrain.destination) {
      setError('Please select both origin and destination stations');
      return;
    }

    if (editingTrain.origin === editingTrain.destination) {
      setError('Origin and destination must be different');
      return;
    }

    try {
      await axios.put(`${API_URL}/trains/${editingTrain.number}`, {
        number: editingTrain.number,
        origin: parseInt(editingTrain.origin),
        destination: parseInt(editingTrain.destination)
      });
      setEditingTrainNumber(null);
      setEditingTrain(null);
      fetchTrains();
      setError('');
    } catch (err) {
      setError(err.response?.data || 'Failed to update train');
    }
  };

  const handleCancelEdit = () => {
    setEditingTrainNumber(null);
    setEditingTrain(null);
    setError('');
  };

  const handleDeleteTrain = async () => {
    if (!selectedTrain) {
      setError('Please select a train to delete');
      return;
    }

    if (window.confirm(`Are you sure you want to delete train ${selectedTrain}?`)) {
      try {
        await axios.delete(`${API_URL}/trains/${selectedTrain}`);
        setSelectedTrain(null);
        fetchTrains();
        setError('');
      } catch (err) {
        setError(err.response?.data || 'Failed to delete train');
      }
    }
  };

  const handleRowSelect = (trainNumber) => {
    setSelectedTrain(trainNumber === selectedTrain ? null : trainNumber);
  };

  if (loading) return <div className="loading">Loading trains...</div>;

  return (
    <div className="train-list">
      <h2>Train Schedule</h2>
      
      {error && <div className="error-message">{error}</div>}

      <div className="table-actions">
        <button onClick={handleAddNewTrain} className="btn-add" disabled={addingNewTrain}>
          Add New Train
        </button>
        <button 
          onClick={handleDeleteTrain} 
          className="btn-delete-selected"
          disabled={!selectedTrain}
        >
          Delete Train
        </button>
      </div>

      <div className="trains-table-container">
        <table className="trains-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}></th>
              <th>Train Number</th>
              <th>Origin Station Number</th>
              <th>Origin Station Name</th>
              <th>Destination Station Number</th>
              <th>Destination Station Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {addingNewTrain && newTrain && (
              <tr className="editing-row">
                <td>
                  <input 
                    type="radio" 
                    name="trainSelect" 
                    disabled 
                  />
                </td>
                <td>{newTrain.number}</td>
                <td>{newTrain.origin || '-'}</td>
                <td>
                  <select 
                    value={newTrain.origin}
                    onChange={(e) => setNewTrain({ ...newTrain, origin: e.target.value })}
                    className="station-select"
                  >
                    <option value="">Select Origin</option>
                    {stations.map(station => (
                      <option key={station.number} value={station.number}>
                        {station.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td>{newTrain.destination || '-'}</td>
                <td>
                  <select 
                    value={newTrain.destination}
                    onChange={(e) => setNewTrain({ ...newTrain, destination: e.target.value })}
                    className="station-select"
                  >
                    <option value="">Select Destination</option>
                    {stations.map(station => (
                      <option key={station.number} value={station.number}>
                        {station.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <button onClick={handleSaveNewTrain} className="btn-save">Save</button>
                  <button onClick={handleCancelNewTrain} className="btn-cancel">Cancel</button>
                </td>
              </tr>
            )}
            {trains.length === 0 && !addingNewTrain ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center' }}>No trains found</td>
              </tr>
            ) : (
              trains.map((train) => (
                <tr 
                  key={train.number}
                  className={selectedTrain === train.number ? 'selected-row' : ''}
                >
                  <td>
                    <input 
                      type="radio" 
                      name="trainSelect" 
                      checked={selectedTrain === train.number}
                      onChange={() => handleRowSelect(train.number)}
                    />
                  </td>
                  <td>{train.number}</td>
                  <td>{train.origin}</td>
                  <td>
                    {editingTrainNumber === train.number ? (
                      <select 
                        value={editingTrain.origin}
                        onChange={(e) => setEditingTrain({ ...editingTrain, origin: e.target.value })}
                        className="station-select"
                      >
                        <option value="">Select Origin</option>
                        {stations.map(station => (
                          <option key={station.number} value={station.number}>
                            {station.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      train.originName || 'N/A'
                    )}
                  </td>
                  <td>{train.destination}</td>
                  <td>
                    {editingTrainNumber === train.number ? (
                      <select 
                        value={editingTrain.destination}
                        onChange={(e) => setEditingTrain({ ...editingTrain, destination: e.target.value })}
                        className="station-select"
                      >
                        <option value="">Select Destination</option>
                        {stations.map(station => (
                          <option key={station.number} value={station.number}>
                            {station.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      train.destinationName || 'N/A'
                    )}
                  </td>
                  <td>
                    {editingTrainNumber === train.number ? (
                      <>
                        <button onClick={handleSaveEditTrain} className="btn-save">Save</button>
                        <button onClick={handleCancelEdit} className="btn-cancel">Cancel</button>
                      </>
                    ) : (
                      <button onClick={() => handleEditTrain(train)} className="btn-edit">Edit</button>
                    )}
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
