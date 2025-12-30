import { useState } from 'react';
import StationList from './components/StationList';
import TrainList from './components/TrainList';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('stations');

  return (
    <div className="app">
      <header className="app-header">
        <h1>🚂 ISL Railways Management System</h1>
        <p>Full-Stack Railway Management Application</p>
      </header>

      <nav className="tabs">
        <button 
          className={`tab ${activeTab === 'stations' ? 'active' : ''}`}
          onClick={() => setActiveTab('stations')}
        >
          Stations
        </button>
        <button 
          className={`tab ${activeTab === 'trains' ? 'active' : ''}`}
          onClick={() => setActiveTab('trains')}
        >
          Trains
        </button>
      </nav>

      <main className="app-content">
        {activeTab === 'stations' ? <StationList /> : <TrainList />}
      </main>

      <footer className="app-footer">
        <p>© 2025 ISL Railways. Built with React + .NET Core + MSSQL</p>
      </footer>
    </div>
  );
}

export default App;
