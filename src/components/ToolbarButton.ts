import { buttonWidth, cellSize, color, smallerText } from "../settings";
import { Button, ButtonOptions } from "./Button";

type ToolbarButtonOptions = Pick<ButtonOptions, "text" | "onClick">;

export class ToolbarButton extends Button {
  set disabled(value: boolean) {
    super.root.alpha = value ? 0.1 : 1;
    super.disabled = value;
  }
  constructor(options: ToolbarButtonOptions) {
    super({
      ...options,
      textStyle: smallerText,
      buttonStyle: {
        disabledColor: color.green1,
        overColor: color.green1,
        downColor: color.green2,
        upColor: color.green1,
      },
      width: buttonWidth,
      height: cellSize,
    });
  }
}
