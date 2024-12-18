import { gsap } from "gsap";
import { Container, ContainerChild } from "pixi.js";
import { Cell, getColIdx, getRowIdx, Idx } from "../model";
import {
  borderRadius,
  cellSize,
  color,
  gap,
  largerText,
  solvedTileText,
  swapSpeed,
} from "../settings";
import { Box, WithRoot } from "./Box";
import { Button } from "./Button";
import { Label } from "./Label";

export type SwapSpeed = "slow" | "fast";

export type SwappableTileOptions = {
  onSwap: (idx: Idx) => void;
  disabled?: boolean;
  idx: Idx;
  cell: Cell;
};

export type SwappableTile = WithRoot & {
  readonly idx: Idx;
  readonly cell: Cell;
  disabled: boolean;
  solved: boolean;
  swap(idx: Idx, speed: SwapSpeed): Promise<Idx>;
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

  get solved() {
    return this.#solved;
  }

  set solved(value: boolean) {
    this.#solved = value;
  }

  #solved: boolean = false;

  #root: ContainerChild;
  #idx: Idx;
  #bg: Box;
  readonly cell: Cell;

  constructor({ idx, cell }: SwappableTileOptions) {
    this.#root = new Container();
    this.#idx = idx;
    const { x, y } = getCellPosByIdx(idx);
    this.#root.position.set(x, y);
    this.#root.zIndex = 0;
    this.cell = cell;

    this.#bg = new Box({
      bgColor: color.gray3,
      height: cellSize,
      width: cellSize,
    });

    this.#root.addChild(this.#bg.root);
  }

  async swap(idx: Idx, speed: SwapSpeed): Promise<Idx> {
    this.#idx = await swapTile(this, idx, speed);
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

  get solved() {
    return this.#solved;
  }

  set solved(value: boolean) {
    this.#solved = value;
    if (value) {
      this.#solvedTile.root.alpha = 0;
      this.#root.addChild(this.#solvedTile.root);
      gsap.to(this.#solvedTile.root, {
        alpha: 1,
        duration: Math.random() * 0.3 + 0.07,
        ease: "power3.inOut",
      });
    } else {
      this.#root.removeChild(this.#solvedTile.root);
    }
  }

  #solved: boolean = false;
  #root: ContainerChild;
  #idx: Idx;
  #button: Button;
  #solvedTile: Label;

  readonly cell: Cell;

  constructor({ idx, cell, disabled, onSwap }: SwappableTileOptions) {
    this.#root = new Container();
    this.#idx = idx;
    const { x, y } = getCellPosByIdx(idx);
    this.#root.position.set(x, y);
    this.#root.zIndex = 1;
    this.cell = cell;
    const text = (cell + 1).toString();

    this.#button = new Button({
      text,
      disabled,
      buttonStyle: {
        disabledColor: color.white,
        overColor: color.green1,
        upColor: color.white,
        downColor: color.white,
      },
      textStyle: largerText,
      height: cellSize,
      width: cellSize,
      onClick: () => onSwap(this.#idx),
    });

    this.#solvedTile = new Label({
      text,
      bgColor: color.pink,
      height: cellSize,
      width: cellSize,
      borderRadius: borderRadius,
      textStyle: solvedTileText,
    });

    this.#root.addChild(this.#button.root);
  }

  async swap(idx: Idx, speed: SwapSpeed): Promise<Idx> {
    this.#idx = await swapTile(this, idx, speed);
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

const swapTile = async (
  tile: SwappableTile,
  idx: Idx,
  speed: SwapSpeed
): Promise<Idx> => {
  if (tile.idx === idx) return tile.idx;

  await gsap
    .to(tile.root, {
      pixi: getCellPosByIdx(idx),
      duration: swapSpeed[speed],
      // https://gsap.com/docs/v3/Eases
      ease: "power3.inOut",
    })
    .then();

  return idx;
};
