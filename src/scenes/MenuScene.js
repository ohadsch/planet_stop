import Phaser from 'phaser';
import soundManager from '../audio/SoundManager.js';
import TERRAINS from '../data/terrains.js';

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
    this.add.text(width / 2, 100, 'PLANET STOP', {
      fontSize: '64px',
      fontFamily: 'Arial Black, Arial',
      color: '#ffffff',
      stroke: '#4444aa',
      strokeThickness: 4
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(width / 2, 160, 'Brake before the edge!', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#8888aa'
    }).setOrigin(0.5);

    // Start Run button
    this.createButton(width / 2, 260, 'Start Run (10 Levels)', () => {
      this.scene.start('GameScene', { attemptNumber: 1, totalAttempts: 10, scores: [], practiceMode: false });
    });

    // Practice Mode button
    this.createButton(width / 2, 330, 'Practice Mode', () => {
      this.showLevelSelect();
    });

    // How to Play button
    this.createButton(width / 2, 400, 'How to Play', () => {
      this.showHowToPlay();
    });

    // Best score display
    const bestScore = localStorage.getItem('planetStopBestScore') || 0;
    this.add.text(width / 2, 490, `Best Score: ${bestScore}`, {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffcc44'
    }).setOrigin(0.5);

    // Overlays (hidden by default)
    this.howToPlayContainer = this.createHowToPlayOverlay();
    this.howToPlayContainer.setVisible(false);

    this.levelSelectContainer = this.createLevelSelectOverlay();
    this.levelSelectContainer.setVisible(false);
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

    const bg = this.add.graphics();
    bg.fillStyle(0x3344aa, 1);
    bg.fillRoundedRect(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight, 8);
    bg.lineStyle(2, 0x5566cc);
    bg.strokeRoundedRect(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight, 8);

    const buttonText = this.add.text(x, y, text, {
      fontSize: '22px',
      fontFamily: 'Arial',
      color: '#ffffff'
    }).setOrigin(0.5);

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

  createLevelSelectOverlay() {
    const { width, height } = this.cameras.main;
    const container = this.add.container(0, 0);

    // Dimmed background
    const dimBg = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.85);
    dimBg.setInteractive(); // Block clicks through
    container.add(dimBg);

    // Panel
    const panel = this.add.graphics();
    panel.fillStyle(0x1a1a2e, 1);
    panel.fillRoundedRect(width / 2 - 340, 40, 680, 460, 12);
    panel.lineStyle(2, 0x4455cc);
    panel.strokeRoundedRect(width / 2 - 340, 40, 680, 460, 12);
    container.add(panel);

    // Title
    const title = this.add.text(width / 2, 70, 'Practice Mode - Select Level', {
      fontSize: '28px',
      fontFamily: 'Arial Black, Arial',
      color: '#ffffff'
    }).setOrigin(0.5);
    container.add(title);

    // Create level buttons in a grid (2 columns, 5 rows)
    const startX = width / 2 - 155;
    const startY = 115;
    const colWidth = 320;
    const rowHeight = 65;

    TERRAINS.forEach((terrain, index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      const x = startX + col * colWidth;
      const y = startY + row * rowHeight;

      // Level button background
      const btnBg = this.add.graphics();
      btnBg.fillStyle(0x2a2a4a, 1);
      btnBg.fillRoundedRect(x - 145, y - 25, 290, 55, 8);
      btnBg.lineStyle(1, 0x4455aa);
      btnBg.strokeRoundedRect(x - 145, y - 25, 290, 55, 8);
      container.add(btnBg);

      // Level number
      const levelNum = this.add.text(x - 125, y, `${index + 1}`, {
        fontSize: '24px',
        fontFamily: 'Arial Black',
        color: '#ffcc44'
      }).setOrigin(0, 0.5);
      container.add(levelNum);

      // Level name
      const levelName = this.add.text(x - 95, y - 8, terrain.name, {
        fontSize: '16px',
        fontFamily: 'Arial',
        color: '#ffffff'
      }).setOrigin(0, 0.5);
      container.add(levelName);

      // Level description
      const levelDesc = this.add.text(x - 95, y + 10, terrain.description, {
        fontSize: '11px',
        fontFamily: 'Arial',
        color: '#888899'
      }).setOrigin(0, 0.5);
      container.add(levelDesc);

      // Hit area
      const hitArea = this.add.rectangle(x, y, 290, 55, 0x000000, 0);
      hitArea.setInteractive({ useHandCursor: true });
      container.add(hitArea);

      hitArea.on('pointerover', () => {
        btnBg.clear();
        btnBg.fillStyle(0x3a3a6a, 1);
        btnBg.fillRoundedRect(x - 145, y - 25, 290, 55, 8);
        btnBg.lineStyle(2, 0x6677cc);
        btnBg.strokeRoundedRect(x - 145, y - 25, 290, 55, 8);
      });

      hitArea.on('pointerout', () => {
        btnBg.clear();
        btnBg.fillStyle(0x2a2a4a, 1);
        btnBg.fillRoundedRect(x - 145, y - 25, 290, 55, 8);
        btnBg.lineStyle(1, 0x4455aa);
        btnBg.strokeRoundedRect(x - 145, y - 25, 290, 55, 8);
      });

      hitArea.on('pointerdown', () => {
        soundManager.playClick();
        this.scene.start('GameScene', {
          attemptNumber: 1,
          totalAttempts: 1,
          scores: [],
          practiceMode: true,
          practiceTerrainIndex: index
        });
      });
    });

    // Close button
    const closeBtn = this.add.text(width / 2, 470, '[ Back to Menu ]', {
      fontSize: '20px',
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

  createHowToPlayOverlay() {
    const { width, height } = this.cameras.main;
    const container = this.add.container(0, 0);

    // Dimmed background
    const dimBg = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8);
    dimBg.setInteractive();
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
      '2. Press SPACE (or tap) to FULL BRAKE',
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

  showLevelSelect() {
    this.levelSelectContainer.setVisible(true);
  }

  showHowToPlay() {
    this.howToPlayContainer.setVisible(true);
  }
}
