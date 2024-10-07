import {
  ColorSource,
  Container,
  ContainerChild,
  Graphics,
  Text,
} from "pixi.js";

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
    return this.#disabled;
  }

  set disabled(value: boolean) {
    this.#disabled = value;
    if (value) {
      this.#disable();
    } else {
      this.#enable();
    }
  }

  get root() {
    return this.#root;
  }

  #root: ContainerChild;
  #style: ButtonStyle;
  #label: Label;
  #disabled: boolean;

  #handleOver = () => {
    this.#label.setBgColor(this.#style.overColor);
  };

  #handleOut = () => {
    this.#label.setBgColor(this.#style.upColor);
  };

  #handleDown = () => {
    this.#label.setBgColor(this.#style.downColor);
  };

  #handleUp = () => {
    this.#label.setBgColor(this.#style.overColor);
  };

  #handleClick = () => {
    this.onClick();
  };

  constructor(options: ButtonOptions) {
    const { style, onClick, disabled, ...labelOptions } = options;
    this.#root = new Container();
    this.#root.interactive = true;

    this.#style = style;
    this.#disabled = disabled ?? false;
    this.onClick = onClick ?? this.onClick;

    this.#label = new Label({
      ...labelOptions,
      bgColor: style.upColor,
    });

    if (!disabled) {
      this.#enable();
    } else {
      this.#disable();
    }

    this.#root.addEventListener("mouseover", this.#handleOver);
    this.#root.addEventListener("mouseout", this.#handleOut);
    this.#root.addEventListener("mousedown", this.#handleDown);
    this.#root.addEventListener("mouseup", this.#handleUp);
    this.#root.addEventListener("click", this.#handleClick);

    this.#root.addChild(this.#label.root);
  }

  #enable() {
    this.#root.interactive = true;
    this.#label.setBgColor(this.#style.upColor);
  }

  #disable() {
    this.#root.interactive = false;
    this.#label.setBgColor(this.#style.disabledColor);
  }
}

type LabelOptions = {
  text?: string;
  bgColor: ColorSource;
  width: number;
  height: number;
};

export class Label {
  #text: Text;
  #bg?: Graphics;
  #root: ContainerChild;
  #width: number;
  #height: number;

  get root() {
    return this.#root;
  }

  constructor(options: LabelOptions) {
    this.#root = new Container();

    this.#width = options.width;
    this.#height = options.height;

    this.#text = new Text({ text: options.text });
    this.#text.anchor.set(0.5);
    this.#text.position.set(options.width / 2, options.height / 2);
    this.#text.zIndex = 1;

    this.#root.addChild(this.#text);
    this.#createBg(options.bgColor);
  }

  setText(text: string) {
    this.#text.text = text;
  }

  setBgColor(color: ColorSource) {
    this.#bg?.removeFromParent();
    this.#createBg(color);
  }

  #createBg(color?: ColorSource) {
    this.#bg = new Graphics()
      .rect(0, 0, this.#width, this.#height)
      .fill({ color });
    this.#bg.zIndex = 0;
    this.#root.addChild(this.#bg);
  }
}
