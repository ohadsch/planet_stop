import Phaser from 'phaser';
import soundManager from '../audio/SoundManager.js';

export default class ResultsScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ResultsScene' });
  }

  init(data) {
    this.scores = data.scores || [];
  }

  create() {
    const { width, height } = this.cameras.main;

    this.cameras.main.setBackgroundColor('#0a0a1a');
    this.drawStarfield();

    // Calculate total
    const totalScore = this.scores.reduce((sum, s) => sum + s.score, 0);
    const maxPossible = this.scores.length * 100;

    // Check and save best score
    const bestScore = parseInt(localStorage.getItem('planetStopBestScore') || '0');
    const isNewBest = totalScore > bestScore;
    if (isNewBest) {
      localStorage.setItem('planetStopBestScore', totalScore.toString());
      soundManager.playHighScore();
    }

    // Title
    this.add.text(width / 2, 40, 'RUN COMPLETE', {
      fontSize: '42px',
      fontFamily: 'Arial Black, Arial',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Total score
    const scoreColor = totalScore >= 700 ? '#44ff44' : totalScore >= 400 ? '#ffcc44' : '#ff8844';
    this.add.text(width / 2, 95, `Total Score: ${totalScore}`, {
      fontSize: '36px',
      fontFamily: 'Arial Black, Arial',
      color: scoreColor
    }).setOrigin(0.5);

    // New best indicator
    if (isNewBest) {
      this.add.text(width / 2, 130, 'NEW BEST!', {
        fontSize: '20px',
        fontFamily: 'Arial',
        color: '#ffff44'
      }).setOrigin(0.5);
    } else {
      this.add.text(width / 2, 130, `Best: ${bestScore}`, {
        fontSize: '18px',
        fontFamily: 'Arial',
        color: '#888888'
      }).setOrigin(0.5);
    }

    // Breakdown panel
    const panelX = width / 2 - 280;
    const panelY = 160;
    const panelWidth = 560;
    const panelHeight = 280;

    const panel = this.add.graphics();
    panel.fillStyle(0x1a1a2e, 0.9);
    panel.fillRoundedRect(panelX, panelY, panelWidth, panelHeight, 10);
    panel.lineStyle(2, 0x3344aa);
    panel.strokeRoundedRect(panelX, panelY, panelWidth, panelHeight, 10);

    // Header
    this.add.text(panelX + 20, panelY + 10, 'Terrain', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#8888aa'
    });
    this.add.text(panelX + panelWidth - 80, panelY + 10, 'Score', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#8888aa'
    });

    // Divider
    panel.lineStyle(1, 0x3344aa);
    panel.lineBetween(panelX + 10, panelY + 35, panelX + panelWidth - 10, panelY + 35);

    // Score rows
    this.scores.forEach((entry, index) => {
      const rowY = panelY + 45 + index * 24;
      const rowColor = entry.score === 0 ? '#ff6666' :
                       entry.score >= 80 ? '#66ff66' :
                       entry.score >= 50 ? '#ffcc44' : '#ffffff';

      // Attempt number
      this.add.text(panelX + 20, rowY, `${index + 1}.`, {
        fontSize: '15px',
        fontFamily: 'Arial',
        color: '#666688'
      });

      // Terrain name
      this.add.text(panelX + 45, rowY, entry.terrain, {
        fontSize: '15px',
        fontFamily: 'Arial',
        color: '#ccccdd'
      });

      // Score
      this.add.text(panelX + panelWidth - 50, rowY, entry.score.toString(), {
        fontSize: '15px',
        fontFamily: 'Arial',
        color: rowColor
      }).setOrigin(0.5, 0);

      // Score bar
      const barWidth = (entry.score / 100) * 80;
      panel.fillStyle(entry.score === 0 ? 0x663333 : 0x336633, 0.5);
      panel.fillRect(panelX + panelWidth - 140, rowY + 3, barWidth, 12);
    });

    // Performance message
    let message, messageColor;
    if (totalScore >= 900) {
      message = 'LEGENDARY DRIVER!';
      messageColor = '#ffff44';
    } else if (totalScore >= 700) {
      message = 'Excellent run!';
      messageColor = '#44ff44';
    } else if (totalScore >= 500) {
      message = 'Good effort!';
      messageColor = '#88ff88';
    } else if (totalScore >= 300) {
      message = 'Keep practicing!';
      messageColor = '#ffcc44';
    } else {
      message = 'Needs improvement...';
      messageColor = '#ff8844';
    }

    this.add.text(width / 2, panelY + panelHeight + 20, message, {
      fontSize: '22px',
      fontFamily: 'Arial',
      color: messageColor
    }).setOrigin(0.5);

    // Buttons
    this.createButton(width / 2 - 100, 500, 'Play Again', () => {
      this.scene.start('GameScene', { attemptNumber: 1, totalAttempts: 10, scores: [] });
    });

    this.createButton(width / 2 + 100, 500, 'Main Menu', () => {
      this.scene.start('MenuScene');
    });
  }

  drawStarfield() {
    const graphics = this.add.graphics();
    for (let i = 0; i < 80; i++) {
      const x = (i * 97) % 960;
      const y = (i * 53) % 540;
      const alpha = 0.2 + ((i * 17) % 60) / 100;
      graphics.fillStyle(0xffffff, alpha);
      graphics.fillCircle(x, y, 1 + (i % 2));
    }
  }

  createButton(x, y, text, callback) {
    const btn = this.add.text(x, y, `[ ${text} ]`, {
      fontSize: '22px',
      fontFamily: 'Arial',
      color: '#88aaff'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => btn.setColor('#aaccff'));
    btn.on('pointerout', () => btn.setColor('#88aaff'));
    btn.on('pointerdown', () => {
      soundManager.playClick();
      callback();
    });

    return btn;
  }
}
