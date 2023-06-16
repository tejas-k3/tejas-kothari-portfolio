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
  flipped,
}) => {
  const isDarkMode = useContext(ThemeContext);
  const [isFlipped, setIsFlipped] = useState(flipped);
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
    setTileSize(`${getRandomSize()}px`);
    setIsAnimating(true);

    setTimeout(() => {
      setIsAnimating(false);
      if (tileName === "Color Shuffle") {
        shuffleColors();
      }
    }, 300);

    if(tileName !== "Color Shuffle")
      setIsFlipped(!isFlipped);
  };

  const handleLinkClick = () => {
    setTimeout(() => {
      window.open(content.url, "_blank");
    }, 500);
  };

  const renderContent = () => {
    if (content.type === "iconLink") {
      return (
        <IconContainer onClick={handleLinkClick}>
          {!isFlipped ? (
            <FlippedTile src={content.iconSrc} alt={content.iconAlt} />
          ) : (
            <Tile />
          )}
        </IconContainer>
      );
    } else {
      return <TileContent>{content}</TileContent>;
    }
  };

  return (
    <Tile
      style={tileStyle}
      isAnimating={isAnimating}
      tileSize={tileSize}
      onClick={handleClick}
    >
      <TileName>{isFlipped ? tileName : renderContent()}</TileName>
    </Tile>
  );
};
