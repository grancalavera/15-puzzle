import "./style.css";

import { initDevtools } from "@pixi/devtools";
import { gsap } from "gsap";
import { PixiPlugin } from "gsap/PixiPlugin";
import * as p from "pixi.js";
import { Application } from "pixi.js";
import {
  cellSize,
  contentWidth,
  gameHeight,
  gameWidth,
  gap,
  padding,
} from "./dimensions";
import { Cell, getColIdx, getRowIdx, Idx, isBlank } from "./model";
import { applyNextSwap, initialState, requestSwap, state$ } from "./state";
import { Button, Label } from "./components";

const getCellPosByIdx = (idx: Idx) => ({
  x: getColIdx(idx) * (cellSize + gap),
  y: getRowIdx(idx) * (cellSize + gap),
});

// class ShuffleButton {
//   el: p.Container;
//   constructor() {
//     this.el = new p.Container();
//     const bg = new p.Graphics()
//       .rect(padding, padding, cellSize * 4 + gap * 3, cellSize * 4 + gap * 3)
//       .fill({ color: "white", alpha: 0.9 });
//     bg.zIndex = 100;
//     this.el.addChild(bg);
//   }
// }

class CellElement {
  el: p.Container;

  #idx: Idx;
  #isBlank: boolean;
  #interactive: boolean;
  #bg: p.Graphics | undefined;

  #colorOver: p.ColorSource = 0xfefab7;
  #colorUp: p.ColorSource = "white";
  #colorDown: p.ColorSource = 0xdcd8a4;
  #colorBlank: p.ColorSource = "gray";

  onRequestSwap: (idx: Idx) => void = () => {};

  set interactive(value: boolean) {
    this.#interactive = value && !this.#isBlank;
    this.#resetBg();
  }

  get interactive() {
    return this.#interactive;
  }

  get idx() {
    return this.#idx;
  }

  async swap(idx: Idx): Promise<Idx> {
    if (this.#idx === idx) return idx;
    this.#idx = idx;
    await gsap
      .to(this.el, {
        pixi: getCellPosByIdx(this.#idx),
        duration: 0.15,
        // https://gsap.com/docs/v3/Eases
        ease: "power3.inOut",
      })
      .then();
    return idx;
  }

  #changeBg(color: p.ColorSource) {
    this.#bg?.removeFromParent();
    this.#bg = new p.Graphics().rect(0, 0, cellSize, cellSize).fill({ color });
    this.#bg.zIndex = 0;
    this.el.addChild(this.#bg);
  }

  #resetBg() {
    this.#changeBg(this.#isBlank ? this.#colorBlank : this.#colorUp);
  }

  constructor(idx: Idx, cell: Cell, interactive: boolean) {
    this.#idx = idx;
    this.#isBlank = isBlank(cell);
    this.#interactive = interactive && !this.#isBlank;

    const { x, y } = getCellPosByIdx(idx);
    this.el = new p.Container();
    this.el.zIndex = this.#isBlank ? 0 : 1;

    this.el.position.set(x, y);
    this.el.interactive = true;

    this.#resetBg();

    if (!this.#isBlank) {
      const label = new p.Text({ text: cell.toString() });
      label.anchor.set(0.5);
      label.zIndex = 1;
      label.position.set(cellSize / 2, cellSize / 2);
      this.el.addChild(label);
    }

    if (!this.#isBlank) {
      this.el.addEventListener("mouseover", () => {
        if (!this.#interactive) return;
        this.#changeBg(this.#colorOver);
      });

      this.el.addEventListener("mouseup", () => {
        if (!this.#interactive) return;
        this.#changeBg(this.#colorOver);
      });

      this.el.addEventListener("mouseout", () => {
        if (!this.#interactive) return;
        this.#changeBg(this.#colorUp);
      });

      this.el.addEventListener("mousedown", () => {
        if (!this.#interactive) return;
        this.#changeBg(this.#colorDown);
      });

      this.el.addEventListener("click", () => {
        if (!this.#interactive) return;
        this.onRequestSwap(this.#idx);
      });
    }
  }
}

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

const boardContainer = new p.Container();
boardContainer.position.set(padding, padding);

const cells: CellElement[] = [];

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
  const interactive = !isSolved && swappables.includes(idx);
  const cellElement = new CellElement(idx, cell, interactive);
  cellElement.onRequestSwap = requestSwap;
  cells.push(cellElement);
});

state$.subscribe(async (state) => {
  const { swappables, isSolved } = state;
  const [nextSwap] = state.swaps;

  cells.forEach((cellElement) => {
    cellElement.interactive =
      !nextSwap && !isSolved && swappables.includes(cellElement.idx);
  });

  if (!nextSwap) {
    return;
  }

  await Promise.all(
    cells
      .filter((x) => nextSwap.includes(x.idx))
      .map((x) => {
        const idx = x.idx === nextSwap[0] ? nextSwap[1] : nextSwap[0];
        return x.swap(idx);
      })
  );

  applyNextSwap();
});

app.stage.addChild(boardContainer);
boardContainer.addChild(...[...cells.values()].map((c) => c.el));

shuffleButton.root.position.set(padding, gameHeight - padding - cellSize);
app.stage.addChild(shuffleButton.root);
