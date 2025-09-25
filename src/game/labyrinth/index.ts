import Phaser from "phaser";
import { makeGameConfig } from "./config";

let game: Phaser.Game | null = null;

export function createPhaserGame(parent: HTMLElement){
  if (game) return game;
  const config = makeGameConfig(parent);
  game = new Phaser.Game(config);
  return game;
}

export function destroyPhaserGame(){
  if (game){
    game.destroy(true);
    game = null;
  }
}
