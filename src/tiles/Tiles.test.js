import React from "react";
import { render, fireEvent, waitFor, screen } from "@testing-library/react";
import { Tiles } from "./Tiles";

describe("Tiles component", () => {
  const tile = screen.getByRole("button");

  xit("should render content correctly", () => {
    const content = "Sample Content";
    render(<Tiles content={content} />);

    const tileContent = screen.getByText(content);
    expect(tileContent).toBeInTheDocument();
  });

  xit("should call shuffleColors when tileName is 'Color Shuffle'", () => {
    const shuffleColorsMock = jest.fn();
    render(
      <Tiles tileName="Color Shuffle" shuffleColors={shuffleColorsMock} />
    );

    waitFor(() => {
      expect(shuffleColorsMock).toHaveBeenCalled();
    });
  });

  xit("should toggle flip state when tileName is not 'Color Shuffle'", () => {
    render(<Tiles tileName="Sample Tile" />);

    fireEvent.click(tile);

    waitFor(() => {
      expect(tile).toHaveAttribute("aria-expanded", "true");
    });

    fireEvent.click(tile);

    waitFor(() => {
      expect(tile).toHaveAttribute("aria-expanded", "false");
    });
  });

  xit("should open link in a new tab when tile type is 'iconLink'", () => {
    const content = {
      type: "iconLink",
      iconSrc: "sample-icon.png",
      iconAlt: "Sample Icon",
      url: "https://example.com",
    };
    const windowOpenMock = jest.spyOn(window, "open").mockImplementation();
    render(<Tiles content={content} />);

    fireEvent.click(tile);

    waitFor(() => {
      fireEvent.click(tile);
      expect(windowOpenMock).toHaveBeenCalledWith(content.url, "_blank");
    });

    windowOpenMock.mockRestore();
  });
});
