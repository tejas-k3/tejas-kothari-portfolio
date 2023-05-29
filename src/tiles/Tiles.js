import React, { useContext, useState } from "react";
import {
  TileName,
  IconContainer,
  FlippedTile,
  TileContent,
  Tile,
} from "./TileStyles";
import { ThemeContext } from "../ThemeContext";
import { getRandomSize } from "../utils";

export const Tiles = ({
  tileName,
  content,
  isSquare,
  color,
  shuffleColors,
}) => {
  const isDarkMode = useContext(ThemeContext);
  const [isFlipped, setIsFlipped] = useState(false);

  const tileStyle = {
    "--tile-color": color,
    "--text-color": isDarkMode ? "white" : "black",
  };

  const tileSize = `${getRandomSize()}px`;

  if (isSquare) {
    tileStyle["--tile-width"] = tileSize;
    tileStyle["--tile-height"] = tileSize;
  } else {
    tileStyle["--tile-width"] = "400px";
    tileStyle["--tile-height"] = tileSize;
  }

  const handleClick = () => {
    if (tileName === "Color Shuffle") {
      shuffleColors(); // Call the shuffleColors function passed from App.js
    } else {
      setIsFlipped(!isFlipped);
    }
  };

  const renderContent = () => {
    if (content.type === "iconLink") {
      return (
        <a href={content.url}>
          <IconContainer>
            {!isFlipped ? (
              <FlippedTile src={content.iconSrc} alt={content.iconAlt} />
            ) : (
              <Tile />
            )}
          </IconContainer>
        </a>
      );
    } else {
      return <TileContent>{content}</TileContent>;
    }
  };

  return (
    <Tile style={tileStyle} onClick={handleClick}>
      <TileName>
        {isFlipped ? <TileName>{tileName}</TileName> : renderContent()}
      </TileName>
    </Tile>
  );
};
