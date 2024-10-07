import { gsap } from "gsap";
import { Container, ContainerChild } from "pixi.js";
import { cellSize, gap } from "../dimensions";
import { Cell, getColIdx, getRowIdx, Idx } from "../model";
import { Box, WithContainerChild } from "./Box";
import { Button } from "./Button";

export type SwappableTileOptions = {
  onRequestSwap: (idx: Idx) => void;
  disabled?: boolean;
  idx: Idx;
  cell: Cell;
};

export type SwappableTile = WithContainerChild & {
  readonly idx: Idx;
  disabled: boolean;
  onRequestSwap: (idx: Idx) => void;
  swap(idx: Idx): Promise<Idx>;
};

export class BlankTile implements SwappableTile {
  get idx() {
    return this.#idx;
  }

  get root() {
    return this.#root;
  }

  get disabled() {
    return !this.#root.interactive;
  }

  set disabled(value: boolean) {
    this.#root.interactive = !value;
  }

  onRequestSwap: (idx: Idx) => void = () => {};

  #root: ContainerChild;
  #idx: Idx;
  #bg: Box;

  constructor({ idx }: SwappableTileOptions) {
    this.#root = new Container();
    this.#idx = idx;
    const { x, y } = getCellPosByIdx(idx);
    this.#root.position.set(x, y);
    this.#root.zIndex = 0;

    this.#bg = new Box({
      bgColor: "gray",
      height: cellSize,
      width: cellSize,
    });

    this.#root.addChild(this.#bg.root);
  }

  async swap(idx: Idx): Promise<Idx> {
    this.#idx = await swapTile(this, idx);
    return this.#idx;
  }
}

export class Tile implements SwappableTile {
  get idx() {
    return this.#idx;
  }

  get root() {
    return this.#root;
  }

  onRequestSwap: (idx: Idx) => void = () => {};

  #root: ContainerChild;
  #idx: Idx;
  #button: Button;

  constructor({ idx, cell, disabled }: SwappableTileOptions) {
    this.#root = new Container();
    this.#idx = idx;
    const { x, y } = getCellPosByIdx(idx);
    this.#root.position.set(x, y);
    this.#root.zIndex = 1;

    this.#button = new Button({
      text: cell.toString(),
      disabled,
      style: {
        disabledColor: "white",
        overColor: 0xfefab7,
        upColor: "white",
        downColor: 0xdcd8a4,
      },
      height: cellSize,
      width: cellSize,
      onClick: () => this.onRequestSwap(this.#idx),
    });

    this.#root.addChild(this.#button.root);
  }

  async swap(idx: Idx): Promise<Idx> {
    this.#idx = await swapTile(this, idx);
    return this.#idx;
  }

  set disabled(value: boolean) {
    this.#button.disabled = value;
  }

  get disabled() {
    return this.#button.disabled;
  }
}

const getCellPosByIdx = (idx: Idx) => ({
  x: getColIdx(idx) * (cellSize + gap),
  y: getRowIdx(idx) * (cellSize + gap),
});

const swapTile = async (tile: SwappableTile, idx: Idx): Promise<Idx> => {
  if (tile.idx === idx) return tile.idx;
  await gsap
    .to(tile.root, {
      pixi: getCellPosByIdx(idx),
      duration: 0.15,
      // https://gsap.com/docs/v3/Eases
      ease: "power3.inOut",
    })
    .then();

  return idx;
};
