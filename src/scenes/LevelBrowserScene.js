import Phaser from 'phaser';
import soundManager from '../audio/SoundManager.js';
import { fetchLevels, incrementPlayCount } from '../api/levelApi.js';

const CLIFF_X = 820;

export default class LevelBrowserScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LevelBrowserScene' });
  }

  create() {
    const { width, height } = this.cameras.main;
    this.cameras.main.setBackgroundColor('#0a0a1a');

    soundManager.init();

    this.currentSort = 'newest';
    this.levels = [];
    this.currentPage = 0;
    this.levelsPerPage = 6;
    this.isLoading = false;

    this.drawStarfield();
    this.createUI();
    this.loadLevels();
  }

  drawStarfield() {
    const graphics = this.add.graphics();
    for (let i = 0; i < 80; i++) {
      const x = Phaser.Math.Between(0, 960);
      const y = Phaser.Math.Between(0, 540);
      const alpha = Phaser.Math.FloatBetween(0.2, 0.6);
      graphics.fillStyle(0xffffff, alpha);
      graphics.fillCircle(x, y, 1);
    }
  }

  createUI() {
    const { width, height } = this.cameras.main;

    // Title
    this.add.text(width / 2, 30, 'Community Levels', {
      fontSize: '32px',
      fontFamily: 'Arial Black',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Back button
    const backBtn = this.add.text(20, 20, '< Back', {
      fontSize: '18px',
      color: '#88aaff'
    }).setInteractive({ useHandCursor: true });

    backBtn.on('pointerover', () => backBtn.setColor('#aaccff'));
    backBtn.on('pointerout', () => backBtn.setColor('#88aaff'));
    backBtn.on('pointerdown', () => {
      soundManager.playClick();
      this.scene.start('MenuScene');
    });

    // Sort buttons
    this.createSortButtons();

    // Level cards container
    this.cardsContainer = this.add.container(0, 0);

    // Navigation buttons
    this.createNavigation();

    // Loading indicator
    this.loadingText = this.add.text(width / 2, height / 2, 'Loading...', {
      fontSize: '24px',
      color: '#888899'
    }).setOrigin(0.5);
    this.loadingText.setVisible(false);

    // Empty state text
    this.emptyText = this.add.text(width / 2, height / 2, 'No levels yet!\nBe the first to create one.', {
      fontSize: '20px',
      color: '#666688',
      align: 'center'
    }).setOrigin(0.5);
    this.emptyText.setVisible(false);
  }

  createSortButtons() {
    const { width } = this.cameras.main;

    // Sort label
    this.add.text(width / 2 - 100, 65, 'Sort by:', {
      fontSize: '14px',
      color: '#888899'
    });

    // Newest button
    this.newestBtn = this.add.text(width / 2 - 30, 65, 'Newest', {
      fontSize: '16px',
      color: '#ffffff'
    }).setInteractive({ useHandCursor: true });

    // Separator
    this.add.text(width / 2 + 35, 65, '|', {
      fontSize: '16px',
      color: '#444466'
    });

    // Popular button
    this.popularBtn = this.add.text(width / 2 + 55, 65, 'Most Played', {
      fontSize: '16px',
      color: '#666688'
    }).setInteractive({ useHandCursor: true });

    this.newestBtn.on('pointerdown', () => {
      if (this.currentSort !== 'newest') {
        this.currentSort = 'newest';
        this.newestBtn.setColor('#ffffff');
        this.popularBtn.setColor('#666688');
        this.loadLevels();
        soundManager.playClick();
      }
    });

    this.popularBtn.on('pointerdown', () => {
      if (this.currentSort !== 'popular') {
        this.currentSort = 'popular';
        this.popularBtn.setColor('#ffffff');
        this.newestBtn.setColor('#666688');
        this.loadLevels();
        soundManager.playClick();
      }
    });
  }

  createNavigation() {
    const { width, height } = this.cameras.main;

    // Previous button
    this.prevBtn = this.add.text(width / 2 - 80, height - 40, '< Previous', {
      fontSize: '18px',
      color: '#88aaff'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    this.prevBtn.on('pointerover', () => this.prevBtn.setColor('#aaccff'));
    this.prevBtn.on('pointerout', () => this.prevBtn.setColor('#88aaff'));
    this.prevBtn.on('pointerdown', () => {
      if (this.currentPage > 0) {
        this.currentPage--;
        this.displayLevels();
        soundManager.playClick();
      }
    });

    // Page indicator
    this.pageText = this.add.text(width / 2, height - 40, '', {
      fontSize: '16px',
      color: '#888899'
    }).setOrigin(0.5);

    // Next button
    this.nextBtn = this.add.text(width / 2 + 80, height - 40, 'Next >', {
      fontSize: '18px',
      color: '#88aaff'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    this.nextBtn.on('pointerover', () => this.nextBtn.setColor('#aaccff'));
    this.nextBtn.on('pointerout', () => this.nextBtn.setColor('#88aaff'));
    this.nextBtn.on('pointerdown', () => {
      const maxPage = Math.ceil(this.levels.length / this.levelsPerPage) - 1;
      if (this.currentPage < maxPage) {
        this.currentPage++;
        this.displayLevels();
        soundManager.playClick();
      }
    });
  }

  async loadLevels() {
    this.isLoading = true;
    this.loadingText.setVisible(true);
    this.emptyText.setVisible(false);
    this.cardsContainer.removeAll(true);

    try {
      this.levels = await fetchLevels(this.currentSort);
      this.currentPage = 0;
      this.displayLevels();
    } catch (error) {
      console.error('Failed to load levels:', error);
      this.showError('Failed to load levels');
    }

    this.isLoading = false;
    this.loadingText.setVisible(false);
  }

  displayLevels() {
    this.cardsContainer.removeAll(true);

    if (this.levels.length === 0) {
      this.emptyText.setVisible(true);
      this.prevBtn.setVisible(false);
      this.nextBtn.setVisible(false);
      this.pageText.setVisible(false);
      return;
    }

    this.emptyText.setVisible(false);

    const start = this.currentPage * this.levelsPerPage;
    const end = Math.min(start + this.levelsPerPage, this.levels.length);
    const pageLevels = this.levels.slice(start, end);

    pageLevels.forEach((level, index) => {
      const card = this.createLevelCard(level, index);
      this.cardsContainer.add(card);
    });

    this.updateNavigation();
  }

  createLevelCard(level, index) {
    const cardWidth = 280;
    const cardHeight = 160;
    const col = index % 3;
    const row = Math.floor(index / 3);
    const startX = 60;
    const startY = 100;
    const gapX = 20;
    const gapY = 20;

    const x = startX + col * (cardWidth + gapX);
    const y = startY + row * (cardHeight + gapY);

    const container = this.add.container(x, y);

    // Card background
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e);
    bg.fillRoundedRect(0, 0, cardWidth, cardHeight, 10);
    bg.lineStyle(2, 0x3344aa);
    bg.strokeRoundedRect(0, 0, cardWidth, cardHeight, 10);
    container.add(bg);

    // Mini terrain preview
    const preview = this.createMiniPreview(level, cardWidth - 20, 70);
    preview.setPosition(10, 10);
    container.add(preview);

    // Level name
    const name = level.name || 'Unnamed Level';
    const displayName = name.length > 25 ? name.substring(0, 22) + '...' : name;
    const nameText = this.add.text(10, 85, displayName, {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#ffffff'
    });
    container.add(nameText);

    // Author
    const authorText = this.add.text(10, 105, `by ${level.authorName || 'Anonymous'}`, {
      fontSize: '12px',
      color: '#888899'
    });
    container.add(authorText);

    // Play count
    const playCount = level.playCount || 0;
    const playText = this.add.text(cardWidth - 10, 105, `${playCount} plays`, {
      fontSize: '12px',
      color: '#666677'
    }).setOrigin(1, 0);
    container.add(playText);

    // Play button
    const playBtn = this.add.text(cardWidth / 2, cardHeight - 20, '[ PLAY ]', {
      fontSize: '16px',
      color: '#88ff88'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    playBtn.on('pointerover', () => {
      playBtn.setColor('#aaffaa');
      bg.clear();
      bg.fillStyle(0x222244);
      bg.fillRoundedRect(0, 0, cardWidth, cardHeight, 10);
      bg.lineStyle(2, 0x4466cc);
      bg.strokeRoundedRect(0, 0, cardWidth, cardHeight, 10);
    });

    playBtn.on('pointerout', () => {
      playBtn.setColor('#88ff88');
      bg.clear();
      bg.fillStyle(0x1a1a2e);
      bg.fillRoundedRect(0, 0, cardWidth, cardHeight, 10);
      bg.lineStyle(2, 0x3344aa);
      bg.strokeRoundedRect(0, 0, cardWidth, cardHeight, 10);
    });

    playBtn.on('pointerdown', () => {
      this.playLevel(level);
    });

    container.add(playBtn);

    return container;
  }

  createMiniPreview(level, width, height) {
    const graphics = this.add.graphics();

    // Background
    let bgColor;
    try {
      bgColor = Phaser.Display.Color.HexStringToColor(level.backgroundColor).color;
    } catch {
      bgColor = 0x0a0a1a;
    }
    graphics.fillStyle(bgColor);
    graphics.fillRoundedRect(0, 0, width, height, 4);

    // Terrain
    const scaleX = width / CLIFF_X;
    const baseY = height * 0.7;
    const scaleY = height / 200;

    const groundColor = level.groundColor || 0x2a2a3a;
    graphics.fillStyle(groundColor);
    graphics.beginPath();

    const profile = level.elevationProfile || [{ x: 0, y: 0 }, { x: CLIFF_X, y: 0 }];
    graphics.moveTo(profile[0].x * scaleX, baseY + profile[0].y * scaleY);

    for (let i = 1; i < profile.length; i++) {
      graphics.lineTo(profile[i].x * scaleX, baseY + profile[i].y * scaleY);
    }

    graphics.lineTo(width, height);
    graphics.lineTo(0, height);
    graphics.closePath();
    graphics.fillPath();

    // Slope zones
    const zones = level.slopeZones || [];
    zones.forEach(zone => {
      const color = (zone.accelMult || 1) > 1 ? 0xaa6644 : 0x4466aa;
      graphics.fillStyle(color, 0.3);
      graphics.fillRect(
        zone.fromX * scaleX,
        0,
        (zone.toX - zone.fromX) * scaleX,
        height
      );
    });

    // Cliff edge
    graphics.lineStyle(2, 0xff4444);
    graphics.lineBetween(width - 2, 0, width - 2, height);

    return graphics;
  }

  updateNavigation() {
    const totalPages = Math.ceil(this.levels.length / this.levelsPerPage);

    this.pageText.setText(`Page ${this.currentPage + 1} / ${totalPages}`);
    this.pageText.setVisible(totalPages > 1);

    this.prevBtn.setVisible(totalPages > 1);
    this.nextBtn.setVisible(totalPages > 1);

    this.prevBtn.setAlpha(this.currentPage > 0 ? 1 : 0.3);
    this.nextBtn.setAlpha(this.currentPage < totalPages - 1 ? 1 : 0.3);
  }

  async playLevel(level) {
    soundManager.playClick();

    // Increment play count in background
    incrementPlayCount(level.id, level.playCount);

    // Build terrain object
    const customTerrain = {
      id: `COMMUNITY_${level.id}`,
      name: level.name || 'Community Level',
      description: `by ${level.authorName || 'Anonymous'}`,
      accel: level.accel,
      rollingResistance: level.rollingResistance,
      brakeDecel: level.brakeDecel,
      initialSpeed: level.initialSpeed,
      backgroundColor: level.backgroundColor,
      groundColor: level.groundColor,
      elevationProfile: level.elevationProfile,
      slopeZones: level.slopeZones
    };

    this.scene.start('GameScene', {
      attemptNumber: 1,
      totalAttempts: 1,
      scores: [],
      practiceMode: true,
      customTerrain: customTerrain,
      returnScene: 'LevelBrowserScene'
    });
  }

  showError(message) {
    const { width, height } = this.cameras.main;

    const errorText = this.add.text(width / 2, height / 2, message, {
      fontSize: '20px',
      color: '#ff6666'
    }).setOrigin(0.5);

    this.time.delayedCall(3000, () => {
      errorText.destroy();
    });
  }
}
