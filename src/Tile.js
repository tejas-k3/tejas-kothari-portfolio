import React from 'react';

const Tile = ({ tileName, content, isSquare, color }) => {
  const tileStyle = {
    backgroundColor: color,
    padding: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    width: isSquare ? '200px' : '400px', // Adjust the width as needed
    height: isSquare ? '200px' : 'auto', // Adjust the height as needed
    // borderRadius: isSquare ? '50%' : '0', // Add border-radius for square tiles
  };

  return (
    <div style={tileStyle}>
      <div>{tileName}</div>
      <div>{content}</div>
    </div>
  );
};

export default Tile;
