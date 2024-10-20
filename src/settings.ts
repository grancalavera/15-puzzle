import { TextStyleOptions } from "pixi.js";
import { gridCount } from "./model";

export const gap = 1;
export const padding = 8;
export const cellSize = 65;
export const contentWidth = cellSize * gridCount + gap * (gridCount - 1);
export const buttonWidth = contentWidth / 2 - gap / 2;
export const gameWidth = contentWidth + padding * 2;
export const gameHeight = gameWidth + padding + cellSize;
export const swapSpeed = { slow: 0.15, fast: 0.07 };
export const shuffleCount = 100;
export const gridSize = cellSize * gridCount + gap * 3;
export const borderRadius = 6;

export const color = {
  black: "black",
  gray1: "#2f2f2f",
  gray2: "#3b3b3b",
  gray3: "#555555",
  gray4: "#858FA1",
  white: "white",
  pink: "#FEC9FA",
  darkPink: "#AE4CA8",
  green1: "#9CFE6B",
  green2: "#588E3D",
  purple: "#450599",
};

export const smallerText: TextStyleOptions = {
  fontFamily: "Inter",
  fontWeight: "bold",
  fontSize: 20,
  fill: color.purple,
};

export const largerText: TextStyleOptions = {
  fontFamily: "Inter",
  fontWeight: "bold",
  fontSize: 30,
  fill: color.black,
};
