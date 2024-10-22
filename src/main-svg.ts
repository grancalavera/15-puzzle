import { loadFonts } from "./loadFonts";
import { Idx } from "./model";
import * as settings from "./settings";
import { initialState } from "./state";
import "./style.css";

const svg = <TTagName extends keyof SVGElementTagNameMap>(tagName: TTagName) =>
  document.createElementNS("http://www.w3.org/2000/svg", tagName);

async function main() {
  await loadFonts();
  const root = document.getElementById("app")!;

  const stage = container({
    width: settings.gameWidth,
    height: settings.gameHeight,
  });
  root.appendChild(stage);

  const outerRect = box({
    width: settings.gameWidth,
    height: settings.gameHeight,
    x: 0,
    y: 0,
    backgroundColor: settings.color.gray1,
  });

  const gameContent = container({
    width: settings.gridSize,
    height: settings.gridSize,
    x: settings.padding,
    y: settings.padding,
  });

  initialState.board.map((cell, i) => {
    const idx = i as Idx;
    const { x, y } = settings.getCellPosByIdx(idx);

    const tile = box({
      width: settings.cellSize,
      height: settings.cellSize,
      x,
      y,
      backgroundColor: settings.color.white,
      borderRadius: settings.borderRadius,
      class: "tile",
    });

    gameContent.appendChild(tile);
  });

  stage.appendChild(outerRect);
  stage.appendChild(gameContent);
}

main();

type BoxOptions = {
  width: number;
  height: number;
  x: number;
  y: number;
  backgroundColor: string;
  borderRadius?: number;
  class?: string;
};

const box = (options: BoxOptions) => {
  const b = svg("rect");
  if (options.class !== undefined) {
    b.setAttribute("class", options.class);
  }
  b.setAttribute("x", options.x.toString());
  b.setAttribute("y", options.y.toString());
  b.setAttribute("width", options.width.toString());
  b.setAttribute("height", options.height.toString());
  b.setAttribute("fill", options.backgroundColor);
  if (options.borderRadius !== undefined) {
    b.setAttribute("rx", options.borderRadius.toString());
    b.setAttribute("ry", options.borderRadius.toString());
  }
  return b;
};

type ContainerOptions = {
  width: number;
  height: number;
  x?: number;
  y?: number;
};

const container = (options: ContainerOptions) => {
  const c = svg("svg");
  c.setAttribute("viewBox", `0 0 ${options.width} ${options.height}`);
  c.setAttribute("width", options.width.toString());
  c.setAttribute("height", options.height.toString());
  c.setAttribute("x", options.x?.toString() ?? "0");
  c.setAttribute("y", options.y?.toString() ?? "0");
  return c;
};
