import React, { useContext } from 'react';
import './Tile.css';
import { ThemeContext } from './App'; // Import the ThemeContext from App.js

const Tile = ({ tileName, content, isSquare, color }) => {
  const isDarkMode = useContext(ThemeContext); // Access the theme value from the ThemeContext

  const tileStyle = {
    '--tile-color': color,
    '--text-color': isDarkMode ? 'white' : 'black', // Update the text color based on the theme value
    '--tile-width': isSquare ? '200px' : '400px',
    '--tile-height': isSquare ? '200px' : 'auto',
  };

  return (
    <div className="tile" style={tileStyle}>
      <div className="tile-name">{tileName}</div>
      <div className="tile-content">{content}</div>
    </div>
  );
};

export default Tile;
