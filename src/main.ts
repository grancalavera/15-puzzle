import { gsap } from "gsap";
import * as PIXI from "pixi.js";
import "./style.css";
import { PixiPlugin } from "gsap/PixiPlugin";
import { initDevtools } from "@pixi/devtools";

// register the plugin
gsap.registerPlugin(PixiPlugin);

// give the plugin a reference to the PIXI object
PixiPlugin.registerPIXI(PIXI);

const app = new PIXI.Application();
initDevtools({ app });

await app.init({ width: 400, height: 400, backgroundColor: 0xffffff });
const appElement = document.querySelector<HTMLDivElement>("#app")!;

const asset = "sun.png";
await PIXI.Assets.load(asset);
const sprite = PIXI.Sprite.from(asset);

sprite.anchor.set(0.5);
sprite.y = 200;
sprite.x = 70;
app.stage.addChild(sprite);
appElement.appendChild(app.canvas);

gsap.to(sprite, {
  ease: "power2.inOut",
  duration: 1,
  x: 330,
  rotation: Math.PI * 0.5,
  onComplete: () => {
    console.log("Animation completed");
  },
});

// let elapsed = 0;

// const mapCoordinate =
//   (fromMin: number, fromMax: number, toMin: number, toMax: number) =>
//   (value: number): number =>
//     ((value - fromMin) * (toMax - toMin)) / (fromMax - fromMin) + toMin;

// const mapXCoordinate = mapCoordinate(-1, 1, 75, 350);
// const mapYCoordinate = mapCoordinate(-1, 1, 75, 350);
// const mapRotation = mapCoordinate(-1, 1, 0, Math.PI * 2);

// app.ticker.add((ticker) => {
//   elapsed += ticker.deltaTime;
//   const a = Math.cos(elapsed / 50);
//   const b = Math.cos(elapsed / 20);
//   sprite.rotation = mapRotation(a);
//   sprite.x = mapXCoordinate(a);
//   sprite.y = mapYCoordinate(b);
// });
