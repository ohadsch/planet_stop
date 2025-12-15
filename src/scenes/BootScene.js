import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // No external assets needed - we use Phaser Graphics
    // This scene exists for future asset loading if needed
  }

  create() {
    // Transition immediately to MenuScene
    this.scene.start('MenuScene');
  }
}
