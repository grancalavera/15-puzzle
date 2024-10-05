import * as p from "pixi.js";
import "./style.css";

const app = new p.Application();
(globalThis as any).__PIXI_APP__ = app;

await app.init({ width: 400, height: 400, backgroundColor: 0xffffff });
const appElement = document.querySelector<HTMLDivElement>("#app")!;

const asset = "sun.png";
await p.Assets.load(asset);
const sprite = p.Sprite.from(asset);

sprite.anchor.set(0.5);
sprite.y = 200;
app.stage.addChild(sprite);

appElement.appendChild(app.canvas);

let elapsed = 0;

const mapCoordinate =
  (fromMin: number, fromMax: number, toMin: number, toMax: number) =>
  (value: number): number =>
    ((value - fromMin) * (toMax - toMin)) / (fromMax - fromMin) + toMin;

const mapXCoordinate = mapCoordinate(-1, 1, 75, 350);
const mapYCoordinate = mapCoordinate(-1, 1, 75, 350);
const mapRotation = mapCoordinate(-1, 1, 0, Math.PI * 2);

app.ticker.add((ticker) => {
  elapsed += ticker.deltaTime;
  const a = Math.cos(elapsed / 50);
  const b = Math.cos(elapsed / 20);
  sprite.rotation = mapRotation(a);
  sprite.x = mapXCoordinate(a);
  sprite.y = mapYCoordinate(b);
});
