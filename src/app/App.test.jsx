import React from "react";
import { render, screen } from "@testing-library/react";
import { App } from "./App";

xit("renders learn react link", () => {
  render(<App />);
  const linkElement = screen.getByText(/Tejas Kothari/i);
  expect(linkElement).toBeInTheDocument();
});
