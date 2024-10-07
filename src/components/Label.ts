import { ColorSource, Container, ContainerChild, Text } from "pixi.js";
import { Box, BoxOptions } from "./Box";

export type LabelOptions = BoxOptions & {
  text?: string;
};

export class Label {
  #text: Text;
  #bg: Box;
  #root: ContainerChild;

  get root() {
    return this.#root;
  }

  constructor({ text, ...boxOptions }: LabelOptions) {
    this.#root = new Container();

    this.#bg = new Box(boxOptions);
    this.#root.addChild(this.#bg.root);

    this.#text = new Text({ text });
    this.#text.anchor.set(0.5);
    this.#text.position.set(boxOptions.width / 2, boxOptions.height / 2);
    this.#root.addChild(this.#text);
  }

  setText(text: string) {
    this.#text.text = text;
  }

  setBgColor(color: ColorSource) {
    this.#bg.setBgColor(color);
  }
}
