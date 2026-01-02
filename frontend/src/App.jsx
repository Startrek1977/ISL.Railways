import { useState } from 'react';
import StationList from './components/StationList';
import TrainList from './components/TrainList';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('trains');

  return (
    <div className="app">
      <header className="app-header">
        <h1>🚂 ISL Railways</h1>
        <p>Israeli Railway Train Schedule</p>
      </header>

      <nav className="app-nav">
        <button 
          className={activeTab === 'trains' ? 'active' : ''}
          onClick={() => setActiveTab('trains')}
        >
          Trains
        </button>
        <button 
          className={activeTab === 'stations' ? 'active' : ''}
          onClick={() => setActiveTab('stations')}
        >
          Stations
        </button>
      </nav>

      <main className="app-content">
        {activeTab === 'trains' ? <TrainList /> : <StationList />}
      </main>

      <footer className="app-footer">
        <p>© 2025 ISL Railways. Built with React + .NET Core + MSSQL</p>
      </footer>
    </div>
  );
}

export default App;
