import "./style.css";

import { initDevtools } from "@pixi/devtools";
import { gsap } from "gsap";
import { PixiPlugin } from "gsap/PixiPlugin";
import * as p from "pixi.js";
import { Application } from "pixi.js";
import { Cell, getColIdx, getRowIdx, gridCount, Idx, isBlank } from "./model";
import { initialState, state$, swap } from "./state";

const getCellPosByIdx = (idx: Idx) => ({
  x: getColIdx(idx) * (cellSize + gap),
  y: getRowIdx(idx) * (cellSize + gap),
});
class CellElement {
  el: p.Container;

  #idx: Idx;
  #isBlank: boolean;
  #isSwappable: boolean;
  #isSolved: boolean;
  #bg: p.Graphics | undefined;

  #colorOver: p.ColorSource = 0xfefab7;
  #colorUp: p.ColorSource = "white";
  #colorDown: p.ColorSource = 0xdcd8a4;
  #colorBlank: p.ColorSource = "gray";

  onSwap: (idx: Idx) => void = () => {};

  update(idx: Idx, isSwappable: boolean, isSolved: boolean) {
    this.#idx = idx;
    this.#isSwappable = isSwappable;
    this.#isSolved = isSolved;
    const { x, y } = getCellPosByIdx(idx);
    this.el.position.set(x, y);
    this.#resetBg();
  }

  #changeBg(color: p.ColorSource) {
    this.#bg?.removeFromParent();
    this.#bg = new p.Graphics().rect(0, 0, cellSize, cellSize).fill({ color });
    this.#bg.zIndex = 0;
    this.el.addChild(this.#bg);
  }

  get #isInteractive() {
    return !this.#isBlank && this.#isSwappable; //&& !this.#isSolved;
  }

  #resetBg() {
    this.#changeBg(this.#isBlank ? this.#colorBlank : this.#colorUp);
  }

  constructor(idx: Idx, cell: Cell, isSwappable: boolean, isSolved: boolean) {
    this.#idx = idx;
    this.#isBlank = isBlank(cell);
    this.#isSwappable = isSwappable;
    this.#isSolved = isSolved;

    const { x, y } = getCellPosByIdx(idx);
    this.el = new p.Container();
    this.el.position.set(x, y);
    this.el.interactive = true;

    this.#resetBg();

    if (!this.#isBlank) {
      const label = new p.Text({ text: (cell + 1).toString() });
      label.anchor.set(0.5);
      label.zIndex = 1;
      label.position.set(cellSize / 2, cellSize / 2);
      this.el.addChild(label);
    }

    if (!this.#isBlank) {
      this.el.addEventListener("mouseover", () => {
        if (!this.#isInteractive) return;
        this.#changeBg(this.#colorOver);
      });

      this.el.addEventListener("mouseup", () => {
        if (!this.#isInteractive) return;
        this.#changeBg(this.#colorOver);
      });

      this.el.addEventListener("mouseout", () => {
        if (!this.#isInteractive) return;
        this.#changeBg(this.#colorUp);
      });

      this.el.addEventListener("mousedown", () => {
        if (!this.#isInteractive) return;
        this.#changeBg(this.#colorDown);
      });

      this.el.addEventListener("click", () => {
        if (!this.#isInteractive) return;
        this.onSwap(this.#idx);
      });
    }
  }
}

gsap.registerPlugin(PixiPlugin);
PixiPlugin.registerPIXI(p);

const app = new Application();
initDevtools({ app });

const gap = 2;
const padding = 8;
const cellSize = 100;
const gameSize = cellSize * gridCount + gap * (gridCount - 1) + padding * 2;

await app.init({
  width: gameSize,
  height: gameSize,
  backgroundColor: "bisque",
});

const appElement = document.querySelector<HTMLDivElement>("#app")!;
appElement.appendChild(app.canvas);

const background = new p.Graphics()
  .rect(0, 0, gameSize, gameSize)
  .fill({ color: "gray" });
app.stage.addChild(background);

const boardContainer = new p.Container();
boardContainer.position.set(padding, padding);

app.stage.addChild(boardContainer);

const cellMap = new Map<Cell, CellElement>();

initialState.board.forEach((cell, i) => {
  const idx = i as Idx;
  const isSwappable = initialState.swappables.includes(idx);
  const cellElement = new CellElement(
    idx,
    cell,
    isSwappable,
    initialState.isSolved
  );
  cellElement.onSwap = swap;
  cellMap.set(cell, cellElement);
});

state$.subscribe((state) => {
  const { board, swappables, isSolved } = state;
  board.forEach((cell, i) => {
    const idx = i as Idx;
    const isSwappable = swappables.includes(idx);
    const cellElement = cellMap.get(cell);
    if (!cellElement) return;
    cellElement.update(idx, isSwappable, isSolved);
  });
});

boardContainer.addChild(...[...cellMap.values()].map((c) => c.el));
