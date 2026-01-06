import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import DatePicker, { registerLocale } from 'react-datepicker';
import { he, enUS, ru, uk } from 'date-fns/locale';
import { API_URL } from '../config/api';
import 'react-datepicker/dist/react-datepicker.css';
import './TrainList.css';

registerLocale('he', he);
registerLocale('en', enUS);
registerLocale('ru', ru);
registerLocale('uk', uk);

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function TrainList() {
  const { t, i18n } = useTranslation();
  const [trains, setTrains] = useState([]);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingTrainNumber, setEditingTrainNumber] = useState(null);
  const [editingTrain, setEditingTrain] = useState(null);
  const [addingNewTrain, setAddingNewTrain] = useState(false);
  const [newTrain, setNewTrain] = useState(null);
  const [selectedTrain, setSelectedTrain] = useState(null);
  const [filterDate, setFilterDate] = useState(null);

  useEffect(() => {
    fetchTrains();
    fetchStations();
  }, []);

  const formatDateForApi = (date) => {
    if (!date) return null;
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const fetchTrains = async (date = null) => {
    try {
      setLoading(true);
      const formattedDate = formatDateForApi(date);
      const url = formattedDate
        ? `${API_URL}/trains?date=${formattedDate}`
        : `${API_URL}/trains`;
      const response = await axios.get(url);
      setTrains(response.data);
      setError('');
    } catch (err) {
      setError(t('trains.errors.loadFailed'));
      console.error('Error fetching trains:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchTrains(filterDate);
  };

  const handleClearFilter = () => {
    setFilterDate(null);
    fetchTrains(null);
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
    return maxNumber + 10;
  };

  const handleAddNewTrain = () => {
    const nextNumber = getNextTrainNumber();

    setNewTrain({
      number: nextNumber,
      origin: '',
      destination: '',
      dayOfWeek: 'Monday'
    });
    setAddingNewTrain(true);
    setError('');
  };

  const handleSaveNewTrain = async () => {
    if (!newTrain.origin || !newTrain.destination) {
      setError(t('trains.errors.selectBothStations'));
      return;
    }

    if (newTrain.origin === newTrain.destination) {
      setError(t('trains.errors.differentStations'));
      return;
    }

    try {
      await axios.post(`${API_URL}/trains`, {
        number: newTrain.number,
        origin: parseInt(newTrain.origin),
        destination: parseInt(newTrain.destination),
        dayOfWeek: newTrain.dayOfWeek
      });
      setAddingNewTrain(false);
      setNewTrain(null);
      fetchTrains();
      setError('');
    } catch (err) {
      setError(err.response?.data || t('trains.errors.addFailed'));
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
      destination: train.destination.toString(),
      dayOfWeek: train.dayOfWeek
    });
    setError('');
  };

  const handleSaveEditTrain = async () => {
    if (!editingTrain.origin || !editingTrain.destination) {
      setError(t('trains.errors.selectBothStations'));
      return;
    }

    if (editingTrain.origin === editingTrain.destination) {
      setError(t('trains.errors.differentStations'));
      return;
    }

    try {
      await axios.put(`${API_URL}/trains/${editingTrain.number}`, {
        number: editingTrain.number,
        origin: parseInt(editingTrain.origin),
        destination: parseInt(editingTrain.destination),
        dayOfWeek: editingTrain.dayOfWeek
      });
      setEditingTrainNumber(null);
      setEditingTrain(null);
      fetchTrains();
      setError('');
    } catch (err) {
      setError(err.response?.data || t('trains.errors.updateFailed'));
    }
  };

  const handleCancelEdit = () => {
    setEditingTrainNumber(null);
    setEditingTrain(null);
    setError('');
  };

  const handleDeleteTrain = async () => {
    if (!selectedTrain) {
      setError(t('trains.errors.selectToDelete'));
      return;
    }

    if (window.confirm(t('trains.confirmDelete', { number: selectedTrain }))) {
      try {
        await axios.delete(`${API_URL}/trains/${selectedTrain}`);
        setSelectedTrain(null);
        fetchTrains();
        setError('');
      } catch (err) {
        setError(err.response?.data || t('trains.errors.deleteFailed'));
      }
    }
  };

  const handleRowSelect = (trainNumber) => {
    setSelectedTrain(trainNumber === selectedTrain ? null : trainNumber);
  };

  if (loading) return <div className="loading">{t('trains.loading')}</div>;

  return (
    <div className="train-list">
      <h2>{t('trains.title')}</h2>

      {error && <div className="error-message">{error}</div>}

      <div className="filter-section">
        <label>{t('trains.filterByDate')}</label>
        <DatePicker
          selected={filterDate}
          onChange={(date) => setFilterDate(date)}
          locale={i18n.language}
          dateFormat="dd/MM/yyyy"
          className="date-picker"
          placeholderText={t('trains.selectDate')}
          isClearable
        />
        <button onClick={handleSearch} className="btn-search">
          {t('common.search')}
        </button>
        <button onClick={handleClearFilter} className="btn-clear" disabled={!filterDate}>
          {t('common.clear')}
        </button>
      </div>

      <div className="table-actions">
        <button onClick={handleAddNewTrain} className="btn-add" disabled={addingNewTrain}>
          {t('trains.addNew')}
        </button>
        <button
          onClick={handleDeleteTrain}
          className="btn-delete-selected"
          disabled={!selectedTrain}
        >
          {t('trains.delete')}
        </button>
      </div>

      <div className="trains-table-container">
        <table className="trains-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}></th>
              <th>{t('trains.headers.trainNumber')}</th>
              <th>{t('trains.headers.originNumber')}</th>
              <th>{t('trains.headers.originName')}</th>
              <th>{t('trains.headers.destinationNumber')}</th>
              <th>{t('trains.headers.destinationName')}</th>
              <th>{t('trains.headers.dayOfWeek')}</th>
              <th>{t('trains.headers.actions')}</th>
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
                    <option value="">{t('trains.selectOrigin')}</option>
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
                    <option value="">{t('trains.selectDestination')}</option>
                    {stations.map(station => (
                      <option key={station.number} value={station.number}>
                        {station.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <select
                    value={newTrain.dayOfWeek}
                    onChange={(e) => setNewTrain({ ...newTrain, dayOfWeek: e.target.value })}
                    className="day-select"
                  >
                    {DAYS_OF_WEEK.map(day => (
                      <option key={day} value={day}>
                        {t(`days.${day}`)}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <button onClick={handleSaveNewTrain} className="btn-save">{t('common.save')}</button>
                  <button onClick={handleCancelNewTrain} className="btn-cancel">{t('common.cancel')}</button>
                </td>
              </tr>
            )}
            {trains.length === 0 && !addingNewTrain ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center' }}>{t('trains.noTrains')}</td>
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
                        <option value="">{t('trains.selectOrigin')}</option>
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
                        <option value="">{t('trains.selectDestination')}</option>
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
                      <select
                        value={editingTrain.dayOfWeek}
                        onChange={(e) => setEditingTrain({ ...editingTrain, dayOfWeek: e.target.value })}
                        className="day-select"
                      >
                        {DAYS_OF_WEEK.map(day => (
                          <option key={day} value={day}>
                            {t(`days.${day}`)}
                          </option>
                        ))}
                      </select>
                    ) : (
                      t(`days.${train.dayOfWeek}`)
                    )}
                  </td>
                  <td>
                    {editingTrainNumber === train.number ? (
                      <>
                        <button onClick={handleSaveEditTrain} className="btn-save">{t('common.save')}</button>
                        <button onClick={handleCancelEdit} className="btn-cancel">{t('common.cancel')}</button>
                      </>
                    ) : (
                      <button onClick={() => handleEditTrain(train)} className="btn-edit">{t('common.edit')}</button>
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
