import React, { useContext, useState } from 'react';
import './Tile.css';
import { ThemeContext } from './App';

const Tile = ({ tileName, content, isSquare, color, shuffleColors }) => {
  const isDarkMode = useContext(ThemeContext);
  const [isFlipped, setIsFlipped] = useState(false);

  const getRandomSize = () => {
    const minSize = 50;
    const maxSize = 200;
    const num = Math.floor(Math.random() * (maxSize - minSize + 1) + minSize);
    return num;
  };

  const tileStyle = {
    '--tile-color': color,
    '--text-color': isDarkMode ? 'white' : 'black',
  };

  const tileSize = `${getRandomSize()}px`;
  if (isSquare) {
    tileStyle['--tile-width'] = tileSize;
    tileStyle['--tile-height'] = tileSize;
  } else {
    tileStyle['--tile-width'] = '400px';
    tileStyle['--tile-height'] = tileSize;
  }

  const handleClick = () => {
    if (tileName === 'Color Shuffle') {
      shuffleColors(); // Call the shuffleColors function passed from App.js
    } else {
      setIsFlipped(!isFlipped);
    }
  };

  const tileClass = `tile ${isFlipped ? 'flipped' : ''}`;

  return (
    <div className={tileClass} style={tileStyle} onClick={handleClick}>
      <div className="tile-content">
        {isFlipped ? (
          <div className="tile-name">{tileName}</div>
        ) : (
          <div className="tile-name">{content}</div>
        )}
      </div>
    </div>
  );
};

export default Tile;
