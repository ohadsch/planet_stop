import Phaser from 'phaser';
import BootScene from './scenes/BootScene.js';
import MenuScene from './scenes/MenuScene.js';
import GameScene from './scenes/GameScene.js';
import ResultsScene from './scenes/ResultsScene.js';
import LevelEditorScene from './scenes/LevelEditorScene.js';
import LevelBrowserScene from './scenes/LevelBrowserScene.js';

// Phaser game configuration
const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  backgroundColor: '#0a0a1a',
  render: {
    pixelArt: false,
    antialias: true
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 960,
    height: 540
  },
  scene: [BootScene, MenuScene, GameScene, ResultsScene, LevelEditorScene, LevelBrowserScene]
};

// Create the game instance
const game = new Phaser.Game(config);

// Handle resize
window.addEventListener('resize', () => {
  game.scale.refresh();
});
