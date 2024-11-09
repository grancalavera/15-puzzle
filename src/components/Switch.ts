import { gsap } from "gsap";
import { Container, ContainerChild } from "pixi.js";
import { borderRadius, cellSize, color, switchText } from "../settings";
import { Box, WithRoot } from "./Box";
import { Button } from "./Button";

type SwitchOptions = {
  width: number;
  height: number;
  text: string;
  onChange: (value: boolean) => void;
};

export class Switch implements WithRoot {
  #root: ContainerChild;
  #track: Box;
  #button: Button;
  #value = false;
  #buttonWidth: number;
  #disabled = false;

  get root() {
    return this.#root;
  }

  set disabled(value: boolean) {
    this.#button.disabled = value;
    this.#disabled = value;
    this.#button.root.alpha = value ? 0.4 : 1;
  }

  get disabled() {
    return this.#disabled;
  }

  setChecked(value: boolean, onComplete?: () => void) {
    this.#value = value;
    const xTo = this.#value ? this.#buttonWidth : 0;
    gsap.to(this.#button.root, {
      pixi: { x: xTo },
      duration: 0.25,
      ease: "power3.inOut",
      onComplete,
    });
  }

  setText(text: string) {
    this.#button.setText(text);
  }

  constructor(options: SwitchOptions) {
    this.#buttonWidth = options.width / 2;
    this.#root = new Container();

    this.#track = new Box({
      bgColor: color.gray2,
      width: options.width,
      height: options.height,
      borderRadius: borderRadius,
    });

    this.#button = new Button({
      text: options.text,
      onClick: () => {
        this.setChecked(!this.#value, () => {
          options.onChange(this.#value);
        });
      },
      textStyle: switchText,
      buttonStyle: {
        disabledColor: color.green1,
        overColor: color.green1,
        downColor: color.green1,
        upColor: color.green1,
      },
      width: this.#buttonWidth,
      height: cellSize,
    });

    this.#root.addChild(this.#track.root);
    this.#root.addChild(this.#button.root);
  }
}
