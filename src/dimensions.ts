import { gridCount } from "./model";

export const gap = 2;
export const padding = 8;
export const cellSize = 100;
export const contentWidth = cellSize * gridCount + gap * (gridCount - 1);

export const gameWidth = contentWidth + padding * 2;
export const gameHeight = gameWidth + padding + cellSize;
