import TrainList from './components/TrainList';
import './App.css';

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>🚂 ISL Railways</h1>
        <p>Israeli Railway Train Schedule</p>
      </header>

      <main className="app-content">
        <TrainList />
      </main>

      <footer className="app-footer">
        <p>© 2025 ISL Railways. Built with React + .NET Core + MSSQL</p>
      </footer>
    </div>
  );
}

export default App;
