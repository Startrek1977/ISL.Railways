import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import StationList from './components/StationList';
import TrainList from './components/TrainList';
import './App.css';

const languages = [
  { code: 'en', name: 'English', flag: '/flags/us.svg' },
  { code: 'he', name: 'עברית', flag: '/flags/il.svg' },
  { code: 'ru', name: 'Русский', flag: '/flags/ru.svg' },
  { code: 'uk', name: 'Українська', flag: '/flags/ua.svg' }
];

function App() {
  const [activeTab, setActiveTab] = useState('trains');
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setLangMenuOpen(false);
  };

  const currentLang = languages.find(l => l.code === i18n.language) || languages[0];
  const isRtl = i18n.language === 'he';

  return (
    <div className="app" dir={isRtl ? 'rtl' : 'ltr'}>
      <header className="app-header">
        <div className="language-switcher">
          <button
            className="lang-toggle"
            onClick={() => setLangMenuOpen(!langMenuOpen)}
          >
            <img src={currentLang.flag} alt={currentLang.name} className="flag-icon" />
            <span>{currentLang.name}</span>
          </button>
          {langMenuOpen && (
            <div className="lang-menu">
              {languages.map(lang => (
                <button
                  key={lang.code}
                  className={`lang-option ${lang.code === i18n.language ? 'active' : ''}`}
                  onClick={() => changeLanguage(lang.code)}
                >
                  <img src={lang.flag} alt={lang.name} className="flag-icon" />
                  <span>{lang.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="header-content">
          <img src="/israel-railways-logo.svg" alt={t('app.logoAlt')} className="header-logo" />
          <p>{t('app.title')}</p>
        </div>
      </header>

      <nav className="app-nav">
        <button
          className={activeTab === 'trains' ? 'active' : ''}
          onClick={() => setActiveTab('trains')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" style={{ marginRight: isRtl ? '0' : '10px', marginLeft: isRtl ? '10px' : '0', verticalAlign: 'middle', filter: 'drop-shadow(1px 1px 1px rgba(0,0,0,0.3))' }}>
            <defs>
              <linearGradient id="trainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4fc3f7" />
                <stop offset="100%" stopColor="#0288d1" />
              </linearGradient>
              <linearGradient id="trainGradLight" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#b3e5fc" />
                <stop offset="100%" stopColor="#4fc3f7" />
              </linearGradient>
            </defs>
            <path d="M12 2c-4 0-8 .5-8 4v9.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h2l2-2h4l2 2h2v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-4-4-8-4z" fill="url(#trainGradLight)"/>
            <rect x="6" y="6" width="5" height="4" fill="url(#trainGrad)" rx="0.5"/>
            <rect x="13" y="6" width="5" height="4" fill="url(#trainGrad)" rx="0.5"/>
            <circle cx="7.5" cy="15.5" r="1.5" fill="url(#trainGrad)"/>
            <circle cx="16.5" cy="15.5" r="1.5" fill="url(#trainGrad)"/>
          </svg>
          {t('nav.trains')}
        </button>
        <button
          className={activeTab === 'stations' ? 'active' : ''}
          onClick={() => setActiveTab('stations')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" style={{ marginRight: isRtl ? '0' : '10px', marginLeft: isRtl ? '10px' : '0', verticalAlign: 'middle', filter: 'drop-shadow(1px 1px 1px rgba(0,0,0,0.3))' }}>
            <defs>
              <linearGradient id="stationGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#81c784" />
                <stop offset="100%" stopColor="#388e3c" />
              </linearGradient>
              <linearGradient id="stationGradLight" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#c8e6c9" />
                <stop offset="100%" stopColor="#81c784" />
              </linearGradient>
            </defs>
            <rect x="3" y="2" width="2.5" height="20" rx="0.5" fill="url(#stationGrad)"/>
            <rect x="18.5" y="2" width="2.5" height="20" rx="0.5" fill="url(#stationGrad)"/>
            <rect x="5.5" y="5" width="13" height="2" rx="0.3" fill="url(#stationGradLight)"/>
            <rect x="5.5" y="9" width="13" height="2" rx="0.3" fill="url(#stationGradLight)"/>
            <rect x="5.5" y="13" width="13" height="2" rx="0.3" fill="url(#stationGradLight)"/>
            <rect x="5.5" y="17" width="13" height="2" rx="0.3" fill="url(#stationGradLight)"/>
          </svg>
          {t('nav.stations')}
        </button>
      </nav>

      <main className="app-content">
        {activeTab === 'trains' ? <TrainList /> : <StationList />}
      </main>

      <footer className="app-footer">
        <p>© 2025 {t('app.footer')}</p>
      </footer>
    </div>
  );
}

export default App;
