import "./style.css";

import { initDevtools } from "@pixi/devtools";
import { gsap } from "gsap";
import { PixiPlugin } from "gsap/PixiPlugin";
import * as p from "pixi.js";
import { Application } from "pixi.js";
import { assertNever } from "./assertNever";
import { Box } from "./components/Box";
import { Switch } from "./components/Switch";
import {
  BlankTile,
  SwappableTile,
  SwappableTileOptions,
  SwapSpeed,
  Tile,
} from "./components/Tile";
import { loadFonts } from "./loadFonts";
import { Idx, isBlank, Swap } from "./model";
import {
  cellSize,
  color,
  contentWidth,
  appHeight,
  appWidth,
  gridSize,
  padding,
  counterHeight,
  counterText,
} from "./settings";
import {
  beginShuffle,
  beginSolve,
  beginSwap,
  endShuffle,
  endSolve,
  endSwap,
  GameState,
  initialState,
  state$,
} from "./state";
import { Label } from "./components/Label";

gsap.registerPlugin(PixiPlugin);
PixiPlugin.registerPIXI(p);

async function main() {
  await loadFonts();

  const app = new Application();

  initDevtools({ app });

  await app.init({
    width: appWidth,
    height: appHeight,
    backgroundColor: color.black,
    antialias: true,
  });

  document.querySelector<HTMLDivElement>("#app")!.appendChild(app.canvas);

  const shuffleSolve = new Switch({
    width: contentWidth,
    height: cellSize,
    text: "Shuffle",
    onChange: (value) => {
      if (value) {
        shuffleSolve.setText("Solve");
        beginShuffle();
      } else {
        shuffleSolve.setText("Shuffle");
        beginSolve();
      }
    },
  });
  shuffleSolve.root.position.set(padding, appWidth);

  const counter = new Label({
    bgColor: color.gray1,
    width: contentWidth,
    height: counterHeight,
    text: "",
    textStyle: counterText,
  });

  const tiles: SwappableTile[] = initialState.board.map((cell, i) => {
    const idx = i as Idx;
    const enabled =
      initialState.kind === "NotSolved" &&
      initialState.swappables.includes(idx);

    const options: SwappableTileOptions = {
      idx,
      cell,
      disabled: !enabled,
      onSwap: beginSwap,
    };

    const tile: SwappableTile = isBlank(cell)
      ? new BlankTile(options)
      : new Tile(options);

    tile.solved = initialState.kind === "Solved";

    return tile;
  });

  const swapTiles = async (swaps: Swap[], speed: SwapSpeed): Promise<void> => {
    const [next, ...rest] = swaps;

    if (!next) return;

    const [first, second] = next;

    await Promise.all(
      tiles
        .filter((tile) => next.includes(tile.idx))
        .map((tile) => tile.swap(tile.idx === first ? second : first, speed))
    );

    await swapTiles(rest, speed);
  };

  const disableAllTiles = (solve?: boolean) => {
    tiles.forEach((tile) => {
      tile.disabled = true;
      tile.solved = !!solve;
    });
  };

  const enableSwappableTiles = (swappables: Idx[]) => {
    tiles.forEach((tile) => {
      tile.disabled = !swappables.includes(tile.idx);
    });
  };

  const updateCounter = (state: GameState) => {
    const count =
      state.kind === "NotSolved" ? state.history.length.toString() : "";
    counter.setText(count.toString());
  };

  state$.subscribe(async (state) => {
    shuffleSolve.disabled = false;

    switch (state.kind) {
      case "NotSolved": {
        const { swappables } = state;
        updateCounter(state);
        enableSwappableTiles(swappables);
        return;
      }
      case "Solved": {
        disableAllTiles(true);
        shuffleSolve.setChecked(false);
        shuffleSolve.setText("Shuffle");
        return;
      }
      case "Swapping": {
        const { swaps } = state;
        disableAllTiles();
        await swapTiles(swaps, "slow");
        endSwap();
        return;
      }
      case "Shuffling": {
        const { shuffles } = state;
        shuffleSolve.disabled = true;
        disableAllTiles();
        await swapTiles(shuffles, "fast");
        endShuffle();
        return;
      }
      case "Solving": {
        const { solution } = state;
        shuffleSolve.disabled = true;
        disableAllTiles();
        await swapTiles(solution, "fast");
        endSolve();
        return;
      }
      default: {
        assertNever(state);
      }
    }
  });

  const gameBackground = new Box({
    bgColor: color.gray1,
    width: appWidth,
    height: appHeight,
  });

  const gameContent = new p.Container();
  const gameContentBackground = new Box({
    bgColor: color.gray3,
    width: gridSize,
    height: gridSize,
  });

  gameContent.position.set(padding, padding);
  gameContent.addChild(gameContentBackground.root);

  app.stage.addChild(gameBackground.root);
  app.stage.addChild(shuffleSolve.root);
  app.stage.addChild(gameContent);
  tiles.forEach((tile) => gameContent.addChild(tile.root));

  counter.root.position.set(padding, appHeight - counterHeight - padding);
  app.stage.addChild(counter.root);
}

main();
