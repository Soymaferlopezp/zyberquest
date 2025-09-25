import * as Phaser from "phaser";
import Boot from "./scenes/Boot";
import Preload from "./scenes/Preload";
import LabPlay from "./scenes/LabPlay";
import HUD from "./scenes/HUD";
import PauseOverlay from "./scenes/PauseOverlay";
import Results from "./scenes/Results";
import PortalMiniGame from "./scenes/PortalMiniGame";

export function makeGameConfig(parent?: HTMLElement): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent,
    width: 960,
    height: 540,
    backgroundColor: "#0A0D0A",
    pixelArt: true, // sprites nítidos
    physics: {
      default: "arcade",
      arcade: {
        gravity: { x: 0, y: 0 },
        debug: false,
      },
    },
    scene: [Boot, Preload, LabPlay, HUD, PauseOverlay, Results, PortalMiniGame],
    fps: { target: 60, forceSetTimeOut: true },
    render: {
      antialias: true,   // ayuda a que el texto se vea limpio
      roundPixels: true, // mantiene sprites alineados al pixel
    },
    scale: {
      mode: Phaser.Scale.NONE,
      autoCenter: Phaser.Scale.NO_CENTER,
      width: 960,
      height: 540,
    },
    // dom: { createContainer: true }, // si luego quieres overlays DOM
  };
}
