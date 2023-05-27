import React, { useContext } from 'react';
import './Tile.css';
import { ThemeContext } from './App'; // Import the ThemeContext from App.js

const Tile = ({ tileName, content, isSquare, color }) => {
  const isDarkMode = useContext(ThemeContext); // Access the theme value from the ThemeContext

  const tileStyle = {
    '--tile-color': color,
    '--text-color': isDarkMode ? 'white' : 'black', // Update the text color based on the theme value
  };

  const getRandomSize = () => {
    const minSize = 50;
    const maxSize = 400;
    var num = Math.floor(Math.random() * (maxSize - minSize + 1) + minSize);
    // console.log(num);
    return num;
  };

  const tileSize = `${getRandomSize()}px`;

  if (isSquare) {
    tileStyle['--tile-width'] = tileSize;
    tileStyle['--tile-height'] = tileSize;
  } else {
    tileStyle['--tile-width'] = '400px';
    tileStyle['--tile-height'] = tileSize;
  }

  return (
    <div className="tile" style={tileStyle}>
      <div className="tile-name">{tileName}</div>
      <div className="tile-content">{content}</div>
    </div>
  );
};

export default Tile;