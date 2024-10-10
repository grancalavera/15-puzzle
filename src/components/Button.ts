import { ColorSource, Container, ContainerChild } from "pixi.js";
import { Label, LabelOptions } from "./Label";

type ButtonOptions = Omit<LabelOptions, "bgColor"> & {
  style: ButtonStyle;
  onClick?: () => void;
  disabled?: boolean;
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
      value ? this.#style.disabledColor : this.#style.upColor
    );
  }

  get root() {
    return this.#root;
  }

  #root: ContainerChild;
  #style: ButtonStyle;
  #label: Label;

  #handleOver = () => this.#label.setBgColor(this.#style.overColor);
  #handleOut = () => this.#label.setBgColor(this.#style.upColor);
  #handleDown = () => this.#label.setBgColor(this.#style.downColor);
  #handleUp = () => this.#label.setBgColor(this.#style.overColor);
  #handleClick = () => this.onClick();

  constructor(options: ButtonOptions) {
    const { style, onClick, disabled, ...labelOptions } = options;
    this.#style = style;
    this.onClick = onClick ?? this.onClick;

    this.#root = new Container();
    this.#root.interactive = true;
    this.#root.addEventListener("mouseover", this.#handleOver);
    this.#root.addEventListener("mouseout", this.#handleOut);
    this.#root.addEventListener("mousedown", this.#handleDown);
    this.#root.addEventListener("mouseup", this.#handleUp);
    this.#root.addEventListener("pointerdown", this.#handleClick);

    this.#label = new Label({ ...labelOptions, bgColor: style.upColor });
    this.#root.addChild(this.#label.root);

    // here because it depends on the container and the label
    this.disabled = !!disabled;
  }
}
