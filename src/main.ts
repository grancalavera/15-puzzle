import "./style.css";

import { initDevtools } from "@pixi/devtools";
import { gsap } from "gsap";
import { PixiPlugin } from "gsap/PixiPlugin";
import * as p from "pixi.js";
import { Application } from "pixi.js";
import { assertNever } from "./assertNever";
import { Box } from "./components/Box";
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
import { Idx, isBlank, Swap } from "./model";
import { beginSwap, endSwap, initialState, state$ } from "./state";

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

const background = new Box({
  bgColor: "gray",
  width: gameWidth,
  height: gameHeight,
});

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
  onClick: () => beginSwap(11),
});
shuffleButton.root.position.set(padding, gameHeight - padding - cellSize);

initialState.board.forEach((cell, i) => {
  const idx = i as Idx;
  const enabled =
    initialState.kind === "NotSolved" && initialState.swappables.includes(idx);

  const options: SwappableTileOptions = {
    idx,
    cell,
    disabled: !enabled,
    onSwap: beginSwap,
  };

  const tile: SwappableTile = isBlank(cell)
    ? new BlankTile(options)
    : new Tile(options);

  tiles.push(tile);
});

const swapTiles = async (swaps: Swap[]): Promise<void> => {
  const [next, ...rest] = swaps;

  if (!next) {
    return;
  }

  const [first, second] = next;

  await Promise.all(
    tiles
      .filter((tile) => next.includes(tile.idx))
      .map((tile) => tile.swap(tile.idx === first ? second : first))
  );

  await swapTiles(rest);
};

const disableAllTiles = () => {
  tiles.forEach((tile) => {
    tile.disabled = true;
  });
};

const enableSwappableTiles = (swappables: Idx[]) => {
  tiles.forEach((tile) => {
    tile.disabled = !swappables.includes(tile.idx);
  });
};

state$.subscribe(async (state) => {
  switch (state.kind) {
    case "NotSolved": {
      const { swappables } = state;
      enableSwappableTiles(swappables);
      return;
    }
    case "Solved": {
      return;
    }
    case "Swapping": {
      disableAllTiles();
      const { swaps } = state;
      await swapTiles(swaps);
      endSwap();
      return;
    }
    default: {
      assertNever(state);
    }
  }
});

appElement.appendChild(app.canvas);
app.stage.addChild(background.root);
app.stage.addChild(gameContent);
gameContent.addChild(...[...tiles.values()].map((tile) => tile.root));
app.stage.addChild(shuffleButton.root);
