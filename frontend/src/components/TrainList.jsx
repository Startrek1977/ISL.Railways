import { useState, useEffect, useCallback, useRef } from 'react';
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
  const isRtl = i18n.language === 'he';
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
  const tableContainerRef = useRef(null);

  useEffect(() => {
    fetchTrains();
    fetchStations();
  }, []);

  // Handle Escape key to cancel editing
  const handleKeyDown = useCallback((event) => {
    if (event.key === 'Escape') {
      if (editingTrainNumber !== null) {
        setEditingTrainNumber(null);
        setEditingTrain(null);
        setError('');
      } else if (addingNewTrain) {
        setAddingNewTrain(false);
        setNewTrain(null);
        setError('');
      }
      // Remove focus from any active element
      if (document.activeElement) {
        document.activeElement.blur();
      }
    }
  }, [editingTrainNumber, addingNewTrain]);

  useEffect(() => {
    if (editingTrainNumber !== null || addingNewTrain) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [editingTrainNumber, addingNewTrain, handleKeyDown]);

  // Handle click outside table to cancel editing
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tableContainerRef.current && !tableContainerRef.current.contains(event.target)) {
        if (editingTrainNumber !== null) {
          setEditingTrainNumber(null);
          setEditingTrain(null);
          setError('');
        } else if (addingNewTrain) {
          setAddingNewTrain(false);
          setNewTrain(null);
          setError('');
        }
      }
    };

    if (editingTrainNumber !== null || addingNewTrain) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [editingTrainNumber, addingNewTrain]);

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
    // Automatically select the row being edited
    setSelectedTrain(train.number);
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
          <svg width="18" height="18" viewBox="0 0 24 24" style={{ marginRight: isRtl ? '0' : '6px', marginLeft: isRtl ? '6px' : '0', verticalAlign: 'middle', filter: 'drop-shadow(1px 1px 1px rgba(0,0,0,0.3))' }}>
            <defs>
              <linearGradient id="searchGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#e0e0e0" />
              </linearGradient>
            </defs>
            <circle cx="10" cy="10" r="6" fill="none" stroke="url(#searchGrad)" strokeWidth="2.5"/>
            <line x1="14.5" y1="14.5" x2="20" y2="20" stroke="url(#searchGrad)" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
          {t('common.search')}
        </button>
        <button onClick={handleClearFilter} className="btn-clear" disabled={!filterDate}>
          <svg width="18" height="18" viewBox="0 0 24 24" style={{ marginRight: isRtl ? '0' : '6px', marginLeft: isRtl ? '6px' : '0', verticalAlign: 'middle', filter: 'drop-shadow(1px 1px 1px rgba(0,0,0,0.3))' }}>
            <defs>
              <linearGradient id="clearGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#e0e0e0" />
              </linearGradient>
            </defs>
            <circle cx="12" cy="12" r="9" fill="url(#clearGrad)" opacity="0.2"/>
            <path d="M16 8L8 16M8 8l8 8" stroke="url(#clearGrad)" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
          {t('common.clear')}
        </button>
      </div>

      <div className="table-actions">
        <button onClick={handleAddNewTrain} className="btn-add" disabled={addingNewTrain}>
          <svg width="18" height="18" viewBox="0 0 24 24" style={{ marginRight: isRtl ? '0' : '6px', marginLeft: isRtl ? '6px' : '0', verticalAlign: 'middle', filter: 'drop-shadow(1px 1px 1px rgba(0,0,0,0.3))' }}>
            <defs>
              <linearGradient id="addGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#c8e6c9" />
              </linearGradient>
            </defs>
            <circle cx="12" cy="12" r="9" fill="url(#addGrad)" opacity="0.3"/>
            <path d="M12 6v12M6 12h12" stroke="url(#addGrad)" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
          {t('trains.addNew')}
        </button>
        <button
          onClick={handleDeleteTrain}
          className="btn-delete-selected"
          disabled={!selectedTrain}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" style={{ marginRight: isRtl ? '0' : '6px', marginLeft: isRtl ? '6px' : '0', verticalAlign: 'middle', filter: 'drop-shadow(1px 1px 1px rgba(0,0,0,0.3))' }}>
            <defs>
              <linearGradient id="deleteGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#ffcdd2" />
              </linearGradient>
            </defs>
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12z" fill="url(#deleteGrad)" opacity="0.4"/>
            <path d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="url(#deleteGrad)"/>
            <rect x="6" y="7" width="12" height="12" rx="1" fill="none" stroke="url(#deleteGrad)" strokeWidth="1.5"/>
            <path d="M9 10v7M12 10v7M15 10v7" stroke="url(#deleteGrad)" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          {t('trains.delete')}
        </button>
      </div>

      <div className="trains-table-container" ref={tableContainerRef}>
        <table className="trains-table">
          <thead>
            <tr>
              <th className="col-train-number">{t('trains.headers.trainNumber')}</th>
              <th className="col-station-number">{t('trains.headers.originNumber')}</th>
              <th className="col-station-name">
                <svg width="36" height="36" viewBox="0 0 24 24" style={{ marginRight: isRtl ? '0' : '6px', marginLeft: isRtl ? '6px' : '0', verticalAlign: 'middle', filter: 'drop-shadow(1px 1px 1px rgba(0,0,0,0.3))' }}>
                  <defs>
                    <linearGradient id="platformSign1" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#1565c0" />
                      <stop offset="50%" stopColor="#1976d2" />
                      <stop offset="100%" stopColor="#0d47a1" />
                    </linearGradient>
                    <linearGradient id="bracket1" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#757575" />
                      <stop offset="50%" stopColor="#9e9e9e" />
                      <stop offset="100%" stopColor="#616161" />
                    </linearGradient>
                  </defs>
                  {/* Top rail/bar */}
                  <rect x="1" y="2" width="22" height="3" fill="url(#bracket1)" stroke="#424242" strokeWidth="0.5" rx="1"/>
                  {/* Hanging chains/brackets */}
                  <rect x="4" y="5" width="1.5" height="4" fill="url(#bracket1)" stroke="#424242" strokeWidth="0.3"/>
                  <rect x="18.5" y="5" width="1.5" height="4" fill="url(#bracket1)" stroke="#424242" strokeWidth="0.3"/>
                  {/* Main sign board */}
                  <rect x="2" y="9" width="20" height="12" fill="url(#platformSign1)" stroke="#0d47a1" strokeWidth="0.5" rx="1"/>
                  {/* White border inside */}
                  <rect x="3.5" y="10.5" width="17" height="9" fill="none" stroke="white" strokeWidth="0.5" rx="0.5"/>
                  {/* Train departing - facing away */}
                  <g transform={isRtl ? "translate(12, 15) scale(-0.65, 0.65)" : "translate(12, 15) scale(0.65, 0.65)"}>
                    <g transform="translate(-12.5, -5.5)">
                      <path d="M0,0 L14.2276931,0 C19.8997459,0 25,4.91810349 25,8.79081655 C25,10.0060762 23.9701728,11 22.7127541,11 L0,11 L0,0 Z" fill="none" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M24.4140625,6.57054014 L17.092219,6.57054014 C16.0819996,6.57054014 15.2560976,5.61001065 15.2560976,4.43511891 L15.2560976,2.29832263 L20.7344813,2.29832263" fill="none" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                      <rect x="5.64613821" y="2.29832263" width="6.56077236" height="4.27221751" fill="none" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                      <polyline points="0 6.57054014 2.59695122 6.57054014 2.59695122 2.29832263 0 2.29832263" fill="none" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                    </g>
                  </g>
                </svg>
                {t('trains.headers.originName')}
              </th>
              <th className="col-station-number">{t('trains.headers.destinationNumber')}</th>
              <th className="col-station-name">
                <svg width="36" height="36" viewBox="0 0 24 24" style={{ marginRight: isRtl ? '0' : '6px', marginLeft: isRtl ? '6px' : '0', verticalAlign: 'middle', filter: 'drop-shadow(1px 1px 1px rgba(0,0,0,0.3))' }}>
                  <defs>
                    <linearGradient id="platformSign2" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#2e7d32" />
                      <stop offset="50%" stopColor="#388e3c" />
                      <stop offset="100%" stopColor="#1b5e20" />
                    </linearGradient>
                    <linearGradient id="bracket2" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#757575" />
                      <stop offset="50%" stopColor="#9e9e9e" />
                      <stop offset="100%" stopColor="#616161" />
                    </linearGradient>
                  </defs>
                  {/* Top rail/bar */}
                  <rect x="1" y="2" width="22" height="3" fill="url(#bracket2)" stroke="#424242" strokeWidth="0.5" rx="1"/>
                  {/* Hanging chains/brackets */}
                  <rect x="4" y="5" width="1.5" height="4" fill="url(#bracket2)" stroke="#424242" strokeWidth="0.3"/>
                  <rect x="18.5" y="5" width="1.5" height="4" fill="url(#bracket2)" stroke="#424242" strokeWidth="0.3"/>
                  {/* Main sign board */}
                  <rect x="2" y="9" width="20" height="12" fill="url(#platformSign2)" stroke="#1b5e20" strokeWidth="0.5" rx="1"/>
                  {/* White border inside */}
                  <rect x="3.5" y="10.5" width="17" height="9" fill="none" stroke="white" strokeWidth="0.5" rx="0.5"/>
                  {/* Train arriving - facing toward */}
                  <g transform={isRtl ? "translate(12, 15) scale(0.65, 0.65)" : "translate(12, 15) scale(-0.65, 0.65)"}>
                    <g transform="translate(-12.5, -5.5)">
                      <path d="M0,0 L14.2276931,0 C19.8997459,0 25,4.91810349 25,8.79081655 C25,10.0060762 23.9701728,11 22.7127541,11 L0,11 L0,0 Z" fill="none" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M24.4140625,6.57054014 L17.092219,6.57054014 C16.0819996,6.57054014 15.2560976,5.61001065 15.2560976,4.43511891 L15.2560976,2.29832263 L20.7344813,2.29832263" fill="none" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                      <rect x="5.64613821" y="2.29832263" width="6.56077236" height="4.27221751" fill="none" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                      <polyline points="0 6.57054014 2.59695122 6.57054014 2.59695122 2.29832263 0 2.29832263" fill="none" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                    </g>
                  </g>
                </svg>
                {t('trains.headers.destinationName')}
              </th>
              <th className="col-day">{t('trains.headers.dayOfWeek')}</th>
              <th className="col-actions">{t('trains.headers.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {addingNewTrain && newTrain && (
              <tr className="editing-row">
                <td className="col-train-number">{newTrain.number}</td>
                <td className="col-station-number">{newTrain.origin || '-'}</td>
                <td className="col-station-name">
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
                <td className="col-station-number">{newTrain.destination || '-'}</td>
                <td className="col-station-name">
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
                <td className="col-day">
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
                <td className="col-actions">
                  <button onClick={handleSaveNewTrain} className="btn-icon-save" title={t('common.save')}>
                    <svg width="24" height="24" viewBox="0 0 24 24" style={{ verticalAlign: 'middle' }}>
                      <defs>
                        <linearGradient id="saveGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#81c784" />
                          <stop offset="50%" stopColor="#4caf50" />
                          <stop offset="100%" stopColor="#388e3c" />
                        </linearGradient>
                      </defs>
                      <circle cx="12" cy="12" r="10" fill="url(#saveGrad1)" stroke="#2e7d32" strokeWidth="1"/>
                      <path d="M9 16.17L5.53 12.7l-1.06 1.06L9 18.29l10.53-10.53-1.06-1.06z" fill="white"/>
                    </svg>
                  </button>
                  <button onClick={handleCancelNewTrain} className="btn-icon-cancel" title={t('common.cancel')}>
                    <svg width="24" height="24" viewBox="0 0 24 24" style={{ verticalAlign: 'middle' }}>
                      <defs>
                        <linearGradient id="cancelGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#bdbdbd" />
                          <stop offset="50%" stopColor="#9e9e9e" />
                          <stop offset="100%" stopColor="#757575" />
                        </linearGradient>
                      </defs>
                      <circle cx="12" cy="12" r="10" fill="url(#cancelGrad1)" stroke="#616161" strokeWidth="1"/>
                      <path d="M15.5 8.5L8.5 15.5M8.5 8.5l7 7" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                    </svg>
                  </button>
                </td>
              </tr>
            )}
            {trains.length === 0 && !addingNewTrain ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center' }}>{t('trains.noTrains')}</td>
              </tr>
            ) : (
              trains.map((train) => (
                <tr
                  key={train.number}
                  className={`${selectedTrain === train.number ? 'selected-row' : ''} ${editingTrainNumber === train.number ? 'editing-row' : ''} ${editingTrainNumber === null && !addingNewTrain ? 'clickable-row' : ''} ${(editingTrainNumber !== null || addingNewTrain) && editingTrainNumber !== train.number ? 'disabled-row' : ''}`}
                  onClick={() => editingTrainNumber === null && !addingNewTrain && handleRowSelect(train.number)}
                >
                  <td className="col-train-number">{train.number}</td>
                  <td className="col-station-number">{train.origin}</td>
                  <td className="col-station-name">
                    {editingTrainNumber === train.number ? (
                      <select
                        value={editingTrain.origin}
                        onChange={(e) => setEditingTrain({ ...editingTrain, origin: e.target.value })}
                        className="station-select"
                        onClick={(e) => e.stopPropagation()}
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
                  <td className="col-station-number">{train.destination}</td>
                  <td className="col-station-name">
                    {editingTrainNumber === train.number ? (
                      <select
                        value={editingTrain.destination}
                        onChange={(e) => setEditingTrain({ ...editingTrain, destination: e.target.value })}
                        className="station-select"
                        onClick={(e) => e.stopPropagation()}
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
                  <td className="col-day">
                    {editingTrainNumber === train.number ? (
                      <select
                        value={editingTrain.dayOfWeek}
                        onChange={(e) => setEditingTrain({ ...editingTrain, dayOfWeek: e.target.value })}
                        className="day-select"
                        onClick={(e) => e.stopPropagation()}
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
                  <td className="col-actions" onClick={(e) => e.stopPropagation()}>
                    {editingTrainNumber === train.number ? (
                      <>
                        <button onClick={handleSaveEditTrain} className="btn-icon-save" title={t('common.save')}>
                          <svg width="24" height="24" viewBox="0 0 24 24" style={{ verticalAlign: 'middle' }}>
                            <defs>
                              <linearGradient id="saveGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#81c784" />
                                <stop offset="50%" stopColor="#4caf50" />
                                <stop offset="100%" stopColor="#388e3c" />
                              </linearGradient>
                            </defs>
                            <circle cx="12" cy="12" r="10" fill="url(#saveGrad2)" stroke="#2e7d32" strokeWidth="1"/>
                            <path d="M9 16.17L5.53 12.7l-1.06 1.06L9 18.29l10.53-10.53-1.06-1.06z" fill="white"/>
                          </svg>
                        </button>
                        <button onClick={handleCancelEdit} className="btn-icon-cancel" title={t('common.cancel')}>
                          <svg width="24" height="24" viewBox="0 0 24 24" style={{ verticalAlign: 'middle' }}>
                            <defs>
                              <linearGradient id="cancelGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#bdbdbd" />
                                <stop offset="50%" stopColor="#9e9e9e" />
                                <stop offset="100%" stopColor="#757575" />
                              </linearGradient>
                            </defs>
                            <circle cx="12" cy="12" r="10" fill="url(#cancelGrad2)" stroke="#616161" strokeWidth="1"/>
                            <path d="M15.5 8.5L8.5 15.5M8.5 8.5l7 7" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                          </svg>
                        </button>
                      </>
                    ) : (
                      <button onClick={() => handleEditTrain(train)} className="btn-edit" title={t('common.edit')}>
                        <svg width="24" height="24" viewBox="0 0 24 24" style={{ verticalAlign: 'middle' }}>
                          <defs>
                            <linearGradient id={`pencilBody${train.number}`} x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#ffeb3b" />
                              <stop offset="50%" stopColor="#ffc107" />
                              <stop offset="100%" stopColor="#ff9800" />
                            </linearGradient>
                            <linearGradient id={`pencilWood${train.number}`} x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#ffe0b2" />
                              <stop offset="100%" stopColor="#c8a06e" />
                            </linearGradient>
                            <linearGradient id={`pencilEraser${train.number}`} x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#f8bbd9" />
                              <stop offset="100%" stopColor="#e91e63" />
                            </linearGradient>
                            <linearGradient id={`pencilFerrule${train.number}`} x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#e0e0e0" />
                              <stop offset="50%" stopColor="#9e9e9e" />
                              <stop offset="100%" stopColor="#757575" />
                            </linearGradient>
                          </defs>
                          {/* Main pencil body - yellow/orange */}
                          <polygon points="7,14 15,6 19,10 11,18" fill={`url(#pencilBody${train.number})`} stroke="#e65100" strokeWidth="1"/>
                          {/* Wood tip - triangular cone */}
                          <polygon points="2,22 11,18 7,14" fill={`url(#pencilWood${train.number})`} stroke="#8d6e63" strokeWidth="0.7"/>
                          {/* Graphite core - centered in wood tip */}
                          <polygon points="2,22 6.5,20 4.5,18" fill="#303030"/>
                          {/* Metal ferrule band */}
                          <polygon points="15,6 19,10 20.5,8.5 16.5,4.5" fill={`url(#pencilFerrule${train.number})`} stroke="#616161" strokeWidth="0.7"/>
                          {/* Eraser */}
                          <polygon points="16.5,4.5 20.5,8.5 22,7 21,4 18,3" fill={`url(#pencilEraser${train.number})`} stroke="#c2185b" strokeWidth="0.7"/>
                        </svg>
                      </button>
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
