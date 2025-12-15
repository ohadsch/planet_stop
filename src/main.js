import Phaser from 'phaser';
import BootScene from './scenes/BootScene.js';
import MenuScene from './scenes/MenuScene.js';
import GameScene from './scenes/GameScene.js';
import ResultsScene from './scenes/ResultsScene.js';

// Phaser game configuration
const config = {
  type: Phaser.AUTO,
  width: 960,
  height: 540,
  parent: 'game-container',
  backgroundColor: '#0a0a1a',
  scene: [BootScene, MenuScene, GameScene, ResultsScene]
};

// Create the game instance
const game = new Phaser.Game(config);
