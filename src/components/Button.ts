import { ColorSource, Container, ContainerChild } from "pixi.js";
import { Label, LabelOptions } from "./Label";
import { borderRadius } from "../settings";

export type ButtonOptions = Omit<LabelOptions, "bgColor"> & {
  buttonStyle: ButtonStyle;
  onClick?: () => void;
  disabled?: boolean;
  x?: number;
  y?: number;
};

type ButtonStyle = {
  disabledColor: ColorSource;
  overColor: ColorSource;
  upColor: ColorSource;
  downColor: ColorSource;
};

export class Button {
  onClick: () => void = () => {};

  get disabled() {
    return !this.#root.interactive;
  }

  set disabled(value: boolean) {
    this.#root.interactive = !value;
    this.#label.setBgColor(
      value ? this.#buttonStyle.disabledColor : this.#buttonStyle.upColor
    );
  }

  get root() {
    return this.#root;
  }

  setText(text: string) {
    this.#label.setText(text);
  }

  #root: ContainerChild;
  #buttonStyle: ButtonStyle;
  #label: Label;

  #handleOver = () => this.#label.setBgColor(this.#buttonStyle.overColor);
  #handleOut = () => this.#label.setBgColor(this.#buttonStyle.upColor);
  #handleDown = () => this.#label.setBgColor(this.#buttonStyle.downColor);
  #handleUp = () => this.#label.setBgColor(this.#buttonStyle.overColor);
  #handleClick = () => this.onClick();

  constructor(options: ButtonOptions) {
    const { buttonStyle, onClick, disabled, x, y, ...labelOptions } = options;
    this.#buttonStyle = buttonStyle;
    this.onClick = onClick ?? this.onClick;

    this.#root = new Container();
    this.#root.position.set(x, y);
    this.#root.addEventListener("mouseover", this.#handleOver);
    this.#root.addEventListener("mouseout", this.#handleOut);
    this.#root.addEventListener("mousedown", this.#handleDown);
    this.#root.addEventListener("mouseup", this.#handleUp);
    this.#root.addEventListener("pointerdown", this.#handleClick);
    this.#label = new Label({
      ...labelOptions,
      bgColor: buttonStyle.upColor,
      borderRadius,
    });
    this.#root.addChild(this.#label.root);

    // here because it depends on the container and the label
    this.disabled = !!disabled;
  }
}
