import Phaser from 'phaser';
import soundManager from '../audio/SoundManager.js';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    const { width, height } = this.cameras.main;

    // Initialize sound manager
    soundManager.init();

    // Background with stars
    this.cameras.main.setBackgroundColor('#0a0a1a');
    this.drawStarfield();

    // Title
    this.add.text(width / 2, 120, 'PLANET STOP', {
      fontSize: '64px',
      fontFamily: 'Arial Black, Arial',
      color: '#ffffff',
      stroke: '#4444aa',
      strokeThickness: 4
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(width / 2, 180, 'Brake before the edge!', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#8888aa'
    }).setOrigin(0.5);

    // Start button
    this.createButton(width / 2, 300, 'Start Run (10 Attempts)', () => {
      this.scene.start('GameScene');
    });

    // How to Play button
    this.createButton(width / 2, 370, 'How to Play', () => {
      this.showHowToPlay();
    });

    // Best score display
    const bestScore = localStorage.getItem('planetStopBestScore') || 0;
    this.add.text(width / 2, 480, `Best Score: ${bestScore}`, {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffcc44'
    }).setOrigin(0.5);

    // How to Play overlay (hidden by default)
    this.howToPlayContainer = this.createHowToPlayOverlay();
    this.howToPlayContainer.setVisible(false);
  }

  drawStarfield() {
    const graphics = this.add.graphics();
    for (let i = 0; i < 100; i++) {
      const x = Phaser.Math.Between(0, 960);
      const y = Phaser.Math.Between(0, 540);
      const alpha = Phaser.Math.FloatBetween(0.3, 1);
      const size = Phaser.Math.Between(1, 2);
      graphics.fillStyle(0xffffff, alpha);
      graphics.fillCircle(x, y, size);
    }
  }

  createButton(x, y, text, callback) {
    const buttonWidth = 280;
    const buttonHeight = 50;

    // Button background
    const bg = this.add.graphics();
    bg.fillStyle(0x3344aa, 1);
    bg.fillRoundedRect(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight, 8);
    bg.lineStyle(2, 0x5566cc);
    bg.strokeRoundedRect(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight, 8);

    // Button text
    const buttonText = this.add.text(x, y, text, {
      fontSize: '22px',
      fontFamily: 'Arial',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Interactive zone
    const hitArea = this.add.rectangle(x, y, buttonWidth, buttonHeight, 0x000000, 0);
    hitArea.setInteractive({ useHandCursor: true });

    hitArea.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(0x4455cc, 1);
      bg.fillRoundedRect(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight, 8);
      bg.lineStyle(2, 0x6677dd);
      bg.strokeRoundedRect(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight, 8);
    });

    hitArea.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(0x3344aa, 1);
      bg.fillRoundedRect(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight, 8);
      bg.lineStyle(2, 0x5566cc);
      bg.strokeRoundedRect(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight, 8);
    });

    hitArea.on('pointerdown', () => {
      soundManager.playClick();
      callback();
    });

    return { bg, buttonText, hitArea };
  }

  createHowToPlayOverlay() {
    const { width, height } = this.cameras.main;
    const container = this.add.container(0, 0);

    // Dimmed background
    const dimBg = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8);
    container.add(dimBg);

    // Panel
    const panel = this.add.graphics();
    panel.fillStyle(0x1a1a2e, 1);
    panel.fillRoundedRect(width / 2 - 300, 80, 600, 380, 12);
    panel.lineStyle(2, 0x4455cc);
    panel.strokeRoundedRect(width / 2 - 300, 80, 600, 380, 12);
    container.add(panel);

    // Title
    const title = this.add.text(width / 2, 110, 'How to Play', {
      fontSize: '32px',
      fontFamily: 'Arial Black, Arial',
      color: '#ffffff'
    }).setOrigin(0.5);
    container.add(title);

    // Instructions
    const instructions = [
      '1. Your rover auto-drives toward the cliff edge',
      '2. Press SPACE (or click) to FULL BRAKE',
      '3. You can only brake ONCE per attempt',
      '4. Score based on how close you stop to the edge',
      '5. Fall off = 0 points',
      '',
      '10 attempts, 10 different terrains.',
      'Each terrain has unique physics!',
      '',
      'Goal: Maximize your total score!'
    ];

    instructions.forEach((line, i) => {
      const text = this.add.text(width / 2, 160 + i * 26, line, {
        fontSize: '18px',
        fontFamily: 'Arial',
        color: '#ccccdd'
      }).setOrigin(0.5);
      container.add(text);
    });

    // Close button
    const closeBtn = this.add.text(width / 2, 420, '[ Close ]', {
      fontSize: '22px',
      fontFamily: 'Arial',
      color: '#88aaff'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    closeBtn.on('pointerover', () => closeBtn.setColor('#aaccff'));
    closeBtn.on('pointerout', () => closeBtn.setColor('#88aaff'));
    closeBtn.on('pointerdown', () => {
      soundManager.playClick();
      container.setVisible(false);
    });
    container.add(closeBtn);

    return container;
  }

  showHowToPlay() {
    this.howToPlayContainer.setVisible(true);
  }
}
