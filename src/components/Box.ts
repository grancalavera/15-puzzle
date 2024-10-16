import { ColorSource, Container, ContainerChild, Graphics } from "pixi.js";

export type WithRoot = {
  root: ContainerChild;
};

export type BoxOptions = {
  bgColor: ColorSource;
  width: number;
  height: number;
  borderRadius?: number;
};

export class Box implements WithRoot {
  #root: ContainerChild;
  #bg: Graphics;
  #width: number;
  #height: number;
  #borderRadius?: number;

  get root() {
    return this.#root;
  }

  constructor(options: BoxOptions) {
    this.#width = options.width;
    this.#height = options.height;
    this.#borderRadius = options.borderRadius;
    this.#bg = this.#createBg(options.bgColor);
    this.#root = new Container();
    this.#root.addChild(this.#bg);
  }

  setBgColor(color: ColorSource) {
    this.#bg.removeFromParent();
    this.#bg.destroy();
    this.#bg = this.#createBg(color);
    this.#root.addChild(this.#bg);
  }

  #createBg(color?: ColorSource) {
    return typeof this.#borderRadius === "number"
      ? new Graphics()
          .roundRect(0, 0, this.#width, this.#height, this.#borderRadius)
          .fill({ color })
      : new Graphics().rect(0, 0, this.#width, this.#height).fill({ color });
  }
}
