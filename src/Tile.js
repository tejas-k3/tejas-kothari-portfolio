import React, { useContext, useState } from 'react';
import './Tile.css';
import { ThemeContext } from './App';

const Tile = ({ tileName, content, isSquare, color }) => {
  const isDarkMode = useContext(ThemeContext);
  const [isFlipped, setIsFlipped] = useState(false);

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
    setIsFlipped(!isFlipped);
  };

  const tileClass = `tile ${isFlipped ? 'flipped' : ''}`;

  return (
    <div className={tileClass} style={tileStyle} onClick={handleClick}>
      <div className="tile-content">
        {isFlipped ? content : <div className="tile-name">{tileName}</div>}
      </div>
    </div>
  );
};


export default Tile;

