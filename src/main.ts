import "./style.css";

import { initDevtools } from "@pixi/devtools";
import { gsap } from "gsap";
import { PixiPlugin } from "gsap/PixiPlugin";
import * as p from "pixi.js";
import { Application } from "pixi.js";
import { assertNever } from "./assertNever";
import { Box } from "./components/Box";
import { Label } from "./components/Label";
import { Switch } from "./components/Switch";
import {
  BlankTile,
  SwappableTile,
  SwappableTileOptions,
  Tile,
} from "./components/Tile";
import { loadFonts } from "./loadFonts";
import { Idx, isBlank, Swap } from "./model";
import {
  appHeight,
  appWidth,
  cellSize,
  color,
  contentWidth,
  counterHeight,
  counterText,
  gridSize,
  padding,
} from "./settings";
import { createActor, fromPromise } from "xstate";
import {
  AnimateSwapsInput,
  gameMachine,
  GameSnapshot,
  getCounterText,
  getSwappableIdxs,
} from "./state";

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

  const game = createActor(
    gameMachine.provide({
      actors: {
        animateSwaps: fromPromise<void, AnimateSwapsInput>(({ input }) =>
          swapTiles(input.swaps, input.speed)
        ),
      },
    })
  );

  const shuffleSolve = new Switch({
    width: contentWidth,
    height: cellSize,
    text: "Shuffle",
    onChange: (value) => {
      if (value) {
        shuffleSolve.setText("Solve");
        game.send({ type: "SHUFFLE" });
      } else {
        shuffleSolve.setText("Shuffle");
        game.send({ type: "SOLVE" });
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

  const initial = game.getSnapshot();

  const tiles: SwappableTile[] = initial.context.board.map((cell, i) => {
    const idx = i as Idx;

    const options: SwappableTileOptions = {
      idx,
      cell,
      disabled: !getSwappableIdxs(initial).includes(idx),
      onSwap: (idx) => game.send({ type: "SWAP", idx }),
    };

    const tile: SwappableTile = isBlank(cell)
      ? new BlankTile(options)
      : new Tile(options);

    tile.solved = initial.matches("solved");

    return tile;
  });

  const swapTiles = async (
    swaps: Swap[],
    speed: AnimateSwapsInput["speed"]
  ): Promise<void> => {
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

  const render = (snapshot: GameSnapshot) => {
    counter.setText(getCounterText(snapshot));

    // animations run inside the machine's `animateSwaps` actor; here we only
    // set up what the player can interact with in each state
    switch (snapshot.value) {
      case "playing": {
        shuffleSolve.disabled = false;
        enableSwappableTiles(getSwappableIdxs(snapshot));
        return;
      }
      case "solved": {
        shuffleSolve.disabled = false;
        disableAllTiles(true);
        shuffleSolve.setChecked(false);
        shuffleSolve.setText("Shuffle");
        return;
      }
      case "swapping":
      case "shuffling":
      case "solving": {
        shuffleSolve.disabled = true;
        disableAllTiles();
        return;
      }
      default: {
        assertNever(snapshot.value);
      }
    }
  };

  game.subscribe(render);
  render(initial);
  game.start();

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
