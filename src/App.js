import React, { useState } from 'react';
import './App.css';
import sunIcon from './sun.svg';
import moonIcon from './moon.svg';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className={`App ${isDarkMode ? 'dark' : 'light'}`}>
      <header className="header">
        <div className="title">Tejas Kothari</div>
        <button className="theme-toggle" onClick={toggleTheme}>
          <img src={isDarkMode ? moonIcon : sunIcon} alt="Theme toggle" />
        </button>
      </header>
      {/* Rest of your application content */}
    </div>
  );
}

export default App;
