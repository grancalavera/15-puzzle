import "./style.css";

import { initDevtools } from "@pixi/devtools";
import { gsap } from "gsap";
import { PixiPlugin } from "gsap/PixiPlugin";
import * as p from "pixi.js";
import { Application } from "pixi.js";
import { Button } from "./components/Button";
import {
  BlankTile,
  SwappableTile,
  SwappableTileOptions,
  Tile,
} from "./components/Tile";
import {
  cellSize,
  contentWidth,
  gameHeight,
  gameWidth,
  padding,
} from "./dimensions";
import { Idx, isBlank } from "./model";
import { applyNextSwap, initialState, requestSwap, state$ } from "./state";

gsap.registerPlugin(PixiPlugin);
PixiPlugin.registerPIXI(p);

const app = new Application();
initDevtools({ app });
await app.init({
  width: gameWidth,
  height: gameHeight,
  backgroundColor: "bisque",
});

const appElement = document.querySelector<HTMLDivElement>("#app")!;
appElement.appendChild(app.canvas);

const background = new p.Graphics()
  .rect(0, 0, gameWidth, gameHeight)
  .fill({ color: "gray" });

app.stage.addChild(background);

const gameContent = new p.Container();
gameContent.position.set(padding, padding);

const tiles: SwappableTile[] = [];

const shuffleButton = new Button({
  style: {
    disabledColor: 0xdddddd,
    overColor: 0xfefab7,
    downColor: 0xdcd8a4,
    upColor: "white",
  },
  width: contentWidth,
  height: cellSize,
  text: "Shuffle",
  onClick: () => {
    requestSwap(11);
  },
});

initialState.board.forEach((cell, i) => {
  const { swappables, isSolved } = initialState;
  const idx = i as Idx;
  const options: SwappableTileOptions = {
    idx,
    cell,
    disabled: !swappables.includes(idx) || isSolved,
    onRequestSwap: requestSwap,
  };

  const tile = isBlank(cell) ? new BlankTile(options) : new Tile(options);
  tile.onRequestSwap = requestSwap;
  tiles.push(tile);
});

state$.subscribe(async (state) => {
  const { swappables, isSolved } = state;
  const [nextSwap] = state.swaps;

  tiles.forEach((tile) => {
    tile.disabled = !swappables.includes(tile.idx) || nextSwap || isSolved;
  });

  if (!nextSwap) {
    return;
  }

  await Promise.all(
    tiles
      .filter((x) => nextSwap.includes(x.idx))
      .map((x) => {
        const idx = x.idx === nextSwap[0] ? nextSwap[1] : nextSwap[0];
        return x.swap(idx);
      })
  );

  applyNextSwap();
});

app.stage.addChild(gameContent);
gameContent.addChild(...[...tiles.values()].map((tile) => tile.root));

shuffleButton.root.position.set(padding, gameHeight - padding - cellSize);
app.stage.addChild(shuffleButton.root);
