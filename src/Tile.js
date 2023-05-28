import React, { useContext, useState } from 'react';
import './Tile.css';
import { ThemeContext } from './App';

const Tile = ({ tileName, content, isSquare, color }) => {
  const isDarkMode = useContext(ThemeContext);
  const [isFlipped, setIsFlipped] = useState(false);
  const [tileColors, setTileColors] = useState([]);

  const tileStyle = {
    '--tile-color': color,
    '--text-color': isDarkMode ? 'white' : 'black',
  };

  const getRandomSize = () => {
    const minSize = 50;
    const maxSize = 200;
    var num = Math.floor(Math.random() * (maxSize - minSize + 1) + minSize);
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

  const handleClick = () => {
    if (tileName === "Color Shuffle") {
      shuffleColors();
    } else {
      setIsFlipped(!isFlipped);
    }
  };

  const shuffleColors = () => {
    const shuffledColors = [...tileColors];
    for (let i = shuffledColors.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledColors[i], shuffledColors[j]] = [shuffledColors[j], shuffledColors[i]];
    }
    setTileColors(shuffledColors);
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
