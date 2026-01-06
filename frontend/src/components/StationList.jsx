import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { API_URL } from '../config/api';
import './StationList.css';

function StationList() {
  const { t } = useTranslation();
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
      setError(t('stations.errors.loadFailed'));
      console.error('Error fetching stations:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">{t('stations.loading')}</div>;

  return (
    <div className="station-list">
      <h2>{t('stations.title')}</h2>

      {error && <div className="error-message">{error}</div>}

      <div className="info-message">
        <p>{t('stations.infoLine1')}</p>
        <p>{t('stations.infoLine2')}</p>
      </div>

      <div className="stations-table-container">
        <table className="stations-table">
          <thead>
            <tr>
              <th>{t('stations.headers.number')}</th>
              <th>{t('stations.headers.name')}</th>
            </tr>
          </thead>
          <tbody>
            {stations.length === 0 ? (
              <tr>
                <td colSpan="2" style={{ textAlign: 'center' }}>{t('stations.noStations')}</td>
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
