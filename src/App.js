import React, { useState, createContext } from "react";
import "./App.css";
import sunIcon from "./sun.svg";
import moonIcon from "./moon.svg";
import Tile from "./Tile";
import data from "./data.json";

const ThemeContext = createContext();

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <ThemeContext.Provider value={isDarkMode}>
      <div className={`App ${isDarkMode ? "dark" : "light"}`}>
        <header className="header">
          <div className="title">Tejas Kothari</div>
          <button className="theme-toggle" onClick={toggleTheme}>
            <img src={isDarkMode ? moonIcon : sunIcon} alt="Theme toggle" />
          </button>
        </header>
        <div className="tile-container">
          {data.tiles.map((tile, index) => (
            <Tile
              key={index}
              tileName={tile.tileName}
              content={tile.content}
              isSquare={tile.isSquare}
              color={tile.color}
            />
          ))}
        </div>
      </div>
    </ThemeContext.Provider>
  );
}

export default App;
export { ThemeContext };
