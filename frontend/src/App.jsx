import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import StationList from './components/StationList';
import TrainList from './components/TrainList';
import './App.css';

const languages = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '/flags/us.svg' },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', flag: '/flags/il.svg' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '/flags/ru.svg' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', flag: '/flags/ua.svg' }
];

function App() {
  const [activeTab, setActiveTab] = useState('trains');
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const { t, i18n } = useTranslation();
  const langSwitcherRef = useRef(null);
  const menuRef = useRef(null);
  const toggleButtonRef = useRef(null);

  useEffect(() => {
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (langSwitcherRef.current && !langSwitcherRef.current.contains(event.target)) {
        setLangMenuOpen(false);
        setFocusedIndex(-1);
      }
    };

    if (langMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [langMenuOpen]);

  const changeLanguage = useCallback((lng) => {
    i18n.changeLanguage(lng);
    setLangMenuOpen(false);
    setFocusedIndex(-1);
    toggleButtonRef.current?.focus();
  }, [i18n]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event) => {
    if (!langMenuOpen) {
      if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
        event.preventDefault();
        setLangMenuOpen(true);
        setFocusedIndex(0);
      }
      return;
    }

    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        setLangMenuOpen(false);
        setFocusedIndex(-1);
        toggleButtonRef.current?.focus();
        break;
      case 'ArrowDown':
        event.preventDefault();
        setFocusedIndex(prev => (prev + 1) % languages.length);
        break;
      case 'ArrowUp':
        event.preventDefault();
        setFocusedIndex(prev => (prev - 1 + languages.length) % languages.length);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (focusedIndex >= 0) {
          changeLanguage(languages[focusedIndex].code);
        }
        break;
      case 'Tab':
        setLangMenuOpen(false);
        setFocusedIndex(-1);
        break;
      case 'Home':
        event.preventDefault();
        setFocusedIndex(0);
        break;
      case 'End':
        event.preventDefault();
        setFocusedIndex(languages.length - 1);
        break;
      default:
        break;
    }
  }, [langMenuOpen, focusedIndex, changeLanguage]);

  // Focus management for menu items
  useEffect(() => {
    if (langMenuOpen && focusedIndex >= 0 && menuRef.current) {
      const menuItems = menuRef.current.querySelectorAll('.lang-option');
      menuItems[focusedIndex]?.focus();
    }
  }, [focusedIndex, langMenuOpen]);

  const toggleMenu = () => {
    const newState = !langMenuOpen;
    setLangMenuOpen(newState);
    if (newState) {
      const currentIndex = languages.findIndex(l => l.code === i18n.language);
      setFocusedIndex(currentIndex >= 0 ? currentIndex : 0);
    } else {
      setFocusedIndex(-1);
    }
  };

  const currentLang = languages.find(l => l.code === i18n.language) || languages[0];
  const isRtl = i18n.language === 'he';

  return (
    <div className="app" dir={isRtl ? 'rtl' : 'ltr'}>
      <header className="app-header">
        <div
          className="language-switcher"
          ref={langSwitcherRef}
          onKeyDown={handleKeyDown}
        >
          <button
            ref={toggleButtonRef}
            className={`lang-toggle ${langMenuOpen ? 'open' : ''}`}
            onClick={toggleMenu}
            aria-haspopup="listbox"
            aria-expanded={langMenuOpen}
            aria-label={t('language.selectLanguage', 'Select language')}
            title={t('language.selectLanguage', 'Select language')}
          >
            <img src={currentLang.flag} alt="" className="flag-icon" aria-hidden="true" />
            <span className="lang-name">{currentLang.nativeName}</span>
            <svg
              className={`dropdown-arrow ${langMenuOpen ? 'open' : ''}`}
              width="12"
              height="12"
              viewBox="0 0 12 12"
              aria-hidden="true"
            >
              <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          {langMenuOpen && (
            <ul
              className="lang-menu"
              ref={menuRef}
              role="listbox"
              aria-label={t('language.availableLanguages', 'Available languages')}
              aria-activedescendant={focusedIndex >= 0 ? `lang-option-${languages[focusedIndex].code}` : undefined}
            >
              {languages.map((lang, index) => (
                <li key={lang.code} role="presentation">
                  <button
                    id={`lang-option-${lang.code}`}
                    className={`lang-option ${lang.code === i18n.language ? 'active' : ''} ${index === focusedIndex ? 'focused' : ''}`}
                    onClick={() => changeLanguage(lang.code)}
                    role="option"
                    aria-selected={lang.code === i18n.language}
                    tabIndex={index === focusedIndex ? 0 : -1}
                    title={lang.name !== lang.nativeName ? `${lang.name} (${lang.nativeName})` : lang.name}
                  >
                    <img src={lang.flag} alt="" className="flag-icon" aria-hidden="true" />
                    <span className="lang-native-name">{lang.nativeName}</span>
                    {lang.code === i18n.language && (
                      <svg className="checkmark" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                        <path d="M3 8L6.5 11.5L13 4.5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </button>
                </li>
              ))}
            </ul>
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
