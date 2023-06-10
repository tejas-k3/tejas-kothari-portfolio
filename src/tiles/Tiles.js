import React, { useContext, useEffect, useState } from "react";
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
  const [shouldOpenLink, setShouldOpenLink] = useState(false);

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

    setIsFlipped(!isFlipped);
  };

  useEffect(() => {
    if (shouldOpenLink) {
      const timer = setTimeout(() => {
        window.open(content.url, "_blank");
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [shouldOpenLink, content.url]);

  const renderContent = () => {
    if (content.type === "iconLink") {
      const handleLinkClick = () => {
        setShouldOpenLink(true);
      };

      return (
        <IconContainer isAnimating={isAnimating} onClick={handleLinkClick}>
          {!isFlipped ? (
            <FlippedTile src={content.iconSrc} alt={content.iconAlt} />
          ) : (
            <Tile />
          )}
        </IconContainer>
      );
    } else {
      return <TileContent>{tileName}</TileContent>;
    }
  };

  return (
    <Tile
      style={tileStyle}
      isAnimating={isAnimating}
      tileSize={tileSize}
      onClick={handleClick}
    >
      <TileName>{isFlipped ? content : renderContent()}</TileName>
    </Tile>
  );
};
