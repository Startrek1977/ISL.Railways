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
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: isRtl ? '0' : '10px', marginLeft: isRtl ? '10px' : '0', verticalAlign: 'middle' }}>
            <path d="M12 2c-4 0-8 .5-8 4v9.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h2l2-2h4l2 2h2v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-4-4-8-4zM7.5 17c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm3.5-7H6V6h5v4zm2 0V6h5v4h-5zm3.5 7c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
          </svg>
          {t('nav.trains')}
        </button>
        <button
          className={activeTab === 'stations' ? 'active' : ''}
          onClick={() => setActiveTab('stations')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: isRtl ? '0' : '10px', marginLeft: isRtl ? '10px' : '0', verticalAlign: 'middle' }}>
            <rect x="3" y="2" width="2" height="20"/>
            <rect x="19" y="2" width="2" height="20"/>
            <rect x="5" y="5" width="14" height="1.5"/>
            <rect x="5" y="9" width="14" height="1.5"/>
            <rect x="5" y="13" width="14" height="1.5"/>
            <rect x="5" y="17" width="14" height="1.5"/>
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
