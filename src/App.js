import React, { useState } from 'react';
import './App.css';
import sunImage from './sun.jpg';
import moonImage from './moon.jpg';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleToggle = () => {
    setIsDarkMode(prevMode => !prevMode);
  };

  return (
    <div className={`App ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="slider-container">
        <input type="checkbox" className="slider" id="slider" onChange={handleToggle} />
        <label htmlFor="slider" className="slider-label">
          <div className={`slider-button ${isDarkMode ? 'night' : 'day'}`}>
            <div className="slider-icon">
              <img src={isDarkMode ? moonImage : sunImage} alt="Icon" className="icon" />
            </div>
          </div>
        </label>
      </div>
      <h1>Welcome to My Website</h1>
      <p>This is a sample text. Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
    </div>
  );
}

export default App;
