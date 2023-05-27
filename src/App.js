import React, { useState } from "react";
import "./App.css";
import sunIcon from "./sun.svg";
import moonIcon from "./moon.svg";
import Tile from "./Tile";
import data from "./data.json";

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className={`App ${isDarkMode ? "dark" : "light"}`}>
      <header className="header">
        <div className="title">Tejas Kothari</div>
        <button className="theme-toggle" onClick={toggleTheme}>
          <img src={isDarkMode ? moonIcon : sunIcon} alt="Theme toggle" />
        </button>
      </header>
      <body>
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
      </body>
    </div>
  );
}

export default App;
