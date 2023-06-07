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
  const [isAnimating, setIsAnimating] = useState(false);
  const [tileSize, setTileSize] = useState(`${getRandomSize()}px`);

  const tileStyle = {
    "--tile-color": color,
    "--text-color": isDarkMode ? "white" : "black",
  };

  if (isSquare) {
    tileStyle["--tile-width"] = tileSize;
    tileStyle["--tile-height"] = tileSize;
  } else {
    tileStyle["--tile-width"] = "400px";
    tileStyle["--tile-height"] = tileSize;
  }

  const handleClick = () => {
    setIsAnimating(true);

    if (tileName === "Color Shuffle") {
      setTileSize(`${getRandomSize()}px`);
      setTimeout(() => {
        setIsAnimating(false);
        shuffleColors();
      }, 600);
    } else {
      setTileSize(`${getRandomSize()}px`);
      setTimeout(() => {
        setIsAnimating(false);
        setIsFlipped(!isFlipped);
      }, 600);
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
    <Tile style={tileStyle} isAnimating={isAnimating} tileSize={tileSize} onClick={handleClick}>
      <TileName>
        {isFlipped ? <TileName>{tileName}</TileName> : renderContent()}
      </TileName>
    </Tile>
  );
};
