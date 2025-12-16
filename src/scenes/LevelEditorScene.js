import Phaser from 'phaser';
import soundManager from '../audio/SoundManager.js';
import { saveLevel } from '../api/levelApi.js';

const CLIFF_X = 820;
const GROUND_BASE_Y = 400;

export default class LevelEditorScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LevelEditorScene' });
  }

  init(data) {
    // Restore editor state if returning from test play
    if (data && data.editorState) {
      this.levelData = { ...data.editorState };
    } else {
      this.levelData = null;
    }
  }

  create() {
    const { width, height } = this.cameras.main;
    this.cameras.main.setBackgroundColor('#0a0a1a');

    soundManager.init();

    // Initialize level data if not restored
    if (!this.levelData) {
      this.initializeLevelData();
    }

    this.drawStarfield();
    this.createHeader();
    this.createTerrainCanvas();
    this.createPhysicsSliders();
    this.createColorPickers();
    this.createSlopeZoneEditor();
    this.createActionButtons();
    this.createLivePreview();

    this.selectedPointIndex = null;
  }

  initializeLevelData() {
    this.levelData = {
      name: 'My Custom Level',
      description: '',
      authorName: '',
      accel: 180,
      rollingResistance: 15,
      brakeDecel: 340,
      initialSpeed: 50,
      backgroundColor: '#0a0a1a',
      groundColor: 0x2a2a3a,
      elevationProfile: [
        { x: 0, y: 0 },
        { x: 400, y: 0 },
        { x: CLIFF_X, y: 0 }
      ],
      slopeZones: []
    };
  }

  drawStarfield() {
    const graphics = this.add.graphics();
    for (let i = 0; i < 60; i++) {
      const x = Phaser.Math.Between(0, 960);
      const y = Phaser.Math.Between(0, 540);
      const alpha = Phaser.Math.FloatBetween(0.2, 0.6);
      graphics.fillStyle(0xffffff, alpha);
      graphics.fillCircle(x, y, 1);
    }
  }

  createHeader() {
    const { width } = this.cameras.main;

    // Title
    this.add.text(width / 2, 20, 'Level Editor', {
      fontSize: '28px',
      fontFamily: 'Arial Black',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Back button
    const backBtn = this.add.text(20, 15, '< Back', {
      fontSize: '18px',
      color: '#88aaff'
    }).setInteractive({ useHandCursor: true });

    backBtn.on('pointerover', () => backBtn.setColor('#aaccff'));
    backBtn.on('pointerout', () => backBtn.setColor('#88aaff'));
    backBtn.on('pointerdown', () => {
      soundManager.playClick();
      this.scene.start('MenuScene');
    });

    // Instructions
    this.add.text(width / 2, 48, 'Click canvas to add points | Drag to move | Right-click to delete', {
      fontSize: '12px',
      color: '#666688'
    }).setOrigin(0.5);
  }

  createTerrainCanvas() {
    const canvasX = 380;
    const canvasY = 70;
    const canvasWidth = 560;
    const canvasHeight = 180;

    // Canvas background
    this.canvasBg = this.add.rectangle(
      canvasX + canvasWidth / 2,
      canvasY + canvasHeight / 2,
      canvasWidth,
      canvasHeight,
      0x111122
    );
    this.canvasBg.setStrokeStyle(2, 0x333355);

    // Grid lines
    const grid = this.add.graphics();
    grid.lineStyle(1, 0x222244, 0.5);
    for (let x = canvasX; x <= canvasX + canvasWidth; x += 50) {
      grid.lineBetween(x, canvasY, x, canvasY + canvasHeight);
    }
    for (let y = canvasY; y <= canvasY + canvasHeight; y += 30) {
      grid.lineBetween(canvasX, y, canvasX + canvasWidth, y);
    }

    // Cliff edge marker
    const cliffScreenX = canvasX + (CLIFF_X / CLIFF_X) * (canvasWidth - 20);
    grid.lineStyle(2, 0xff4444, 0.8);
    grid.lineBetween(cliffScreenX, canvasY, cliffScreenX, canvasY + canvasHeight);

    // Terrain graphics
    this.terrainGraphics = this.add.graphics();

    // Point markers container
    this.pointMarkers = [];

    // Store canvas bounds for hit detection
    this.canvasBounds = {
      x: canvasX,
      y: canvasY,
      width: canvasWidth,
      height: canvasHeight,
      scaleX: (canvasWidth - 20) / CLIFF_X,
      scaleY: 1.5,
      centerY: canvasY + canvasHeight / 2
    };

    // Canvas click to add points
    this.canvasBg.setInteractive();
    this.canvasBg.on('pointerdown', (pointer) => {
      if (pointer.rightButtonDown()) return;
      this.addElevationPoint(pointer.x, pointer.y);
    });

    // Right-click context menu prevention
    this.input.mouse.disableContextMenu();

    this.updateTerrainDisplay();
  }

  screenToTerrain(screenX, screenY) {
    const b = this.canvasBounds;
    const terrainX = Math.round((screenX - b.x - 10) / b.scaleX);
    const terrainY = Math.round((screenY - b.centerY) / b.scaleY);
    return { x: terrainX, y: terrainY };
  }

  terrainToScreen(terrainX, terrainY) {
    const b = this.canvasBounds;
    const screenX = b.x + 10 + terrainX * b.scaleX;
    const screenY = b.centerY + terrainY * b.scaleY;
    return { x: screenX, y: screenY };
  }

  addElevationPoint(screenX, screenY) {
    const { x, y } = this.screenToTerrain(screenX, screenY);

    // Validate point is within bounds
    if (x <= 0 || x >= CLIFF_X) return;
    if (y < -80 || y > 80) return;

    // Check if too close to existing point
    const minDistance = 30;
    for (const point of this.levelData.elevationProfile) {
      if (Math.abs(point.x - x) < minDistance) return;
    }

    this.levelData.elevationProfile.push({ x, y });
    this.sortElevationProfile();
    this.updateTerrainDisplay();
    this.updateLivePreview();
    soundManager.playClick();
  }

  sortElevationProfile() {
    this.levelData.elevationProfile.sort((a, b) => a.x - b.x);
  }

  updateTerrainDisplay() {
    // Clear existing
    this.terrainGraphics.clear();
    this.pointMarkers.forEach(m => m.destroy());
    this.pointMarkers = [];

    const profile = this.levelData.elevationProfile;
    const b = this.canvasBounds;

    // Draw terrain line
    this.terrainGraphics.lineStyle(3, this.levelData.groundColor);
    this.terrainGraphics.beginPath();

    const firstScreen = this.terrainToScreen(profile[0].x, profile[0].y);
    this.terrainGraphics.moveTo(firstScreen.x, firstScreen.y);

    for (let i = 1; i < profile.length; i++) {
      const screen = this.terrainToScreen(profile[i].x, profile[i].y);
      this.terrainGraphics.lineTo(screen.x, screen.y);
    }
    this.terrainGraphics.strokePath();

    // Draw terrain fill
    this.terrainGraphics.fillStyle(this.levelData.groundColor, 0.3);
    this.terrainGraphics.beginPath();
    this.terrainGraphics.moveTo(firstScreen.x, firstScreen.y);
    for (let i = 1; i < profile.length; i++) {
      const screen = this.terrainToScreen(profile[i].x, profile[i].y);
      this.terrainGraphics.lineTo(screen.x, screen.y);
    }
    this.terrainGraphics.lineTo(b.x + b.width - 10, b.y + b.height);
    this.terrainGraphics.lineTo(b.x + 10, b.y + b.height);
    this.terrainGraphics.closePath();
    this.terrainGraphics.fillPath();

    // Draw slope zones with preset colors
    this.levelData.slopeZones.forEach(zone => {
      const typeName = this.getZoneTypeName(zone);
      const presets = this.getZonePresets();
      const colorHex = presets[typeName]?.color || (zone.accelMult > 1 ? '#cc6644' : '#4466cc');
      const color = Phaser.Display.Color.HexStringToColor(colorHex).color;
      const startScreen = this.terrainToScreen(zone.fromX, 0);
      const endScreen = this.terrainToScreen(zone.toX, 0);
      this.terrainGraphics.fillStyle(color, 0.4);
      this.terrainGraphics.fillRect(startScreen.x, b.y, endScreen.x - startScreen.x, b.height);
    });

    // Draw draggable points
    profile.forEach((point, index) => {
      const screen = this.terrainToScreen(point.x, point.y);
      const isEndpoint = index === 0 || index === profile.length - 1;
      const color = isEndpoint ? 0xff6644 : 0x44ff88;

      const marker = this.add.circle(screen.x, screen.y, 10, color);
      marker.setStrokeStyle(2, 0xffffff);
      marker.setData('pointIndex', index);

      if (!isEndpoint) {
        marker.setInteractive({ draggable: true, useHandCursor: true });

        marker.on('drag', (pointer, dragX, dragY) => {
          // Move marker visually
          marker.x = dragX;
          marker.y = dragY;

          // Update data
          const terrain = this.screenToTerrain(dragX, dragY);
          terrain.x = Math.max(10, Math.min(CLIFF_X - 10, terrain.x));
          terrain.y = Math.max(-80, Math.min(80, terrain.y));
          this.levelData.elevationProfile[index] = terrain;

          // Update terrain line without recreating markers
          this.updateTerrainLine();
          this.updateLivePreview();
        });

        marker.on('dragend', () => {
          // Sort and fully refresh when drag ends
          this.sortElevationProfile();
          this.updateTerrainDisplay();
          this.updateLivePreview();
        });

        marker.on('pointerdown', (pointer) => {
          if (pointer.rightButtonDown()) {
            // Delete point
            if (this.levelData.elevationProfile.length > 2) {
              this.levelData.elevationProfile.splice(index, 1);
              this.updateTerrainDisplay();
              this.updateLivePreview();
              soundManager.playClick();
            }
          }
        });
      }

      this.pointMarkers.push(marker);
    });
  }

  updateTerrainLine() {
    // Just update the terrain line graphics without touching markers
    this.terrainGraphics.clear();

    const profile = this.levelData.elevationProfile;
    const b = this.canvasBounds;

    // Draw terrain line
    this.terrainGraphics.lineStyle(3, this.levelData.groundColor);
    this.terrainGraphics.beginPath();

    const firstScreen = this.terrainToScreen(profile[0].x, profile[0].y);
    this.terrainGraphics.moveTo(firstScreen.x, firstScreen.y);

    for (let i = 1; i < profile.length; i++) {
      const screen = this.terrainToScreen(profile[i].x, profile[i].y);
      this.terrainGraphics.lineTo(screen.x, screen.y);
    }
    this.terrainGraphics.strokePath();

    // Draw terrain fill
    this.terrainGraphics.fillStyle(this.levelData.groundColor, 0.3);
    this.terrainGraphics.beginPath();
    this.terrainGraphics.moveTo(firstScreen.x, firstScreen.y);
    for (let i = 1; i < profile.length; i++) {
      const screen = this.terrainToScreen(profile[i].x, profile[i].y);
      this.terrainGraphics.lineTo(screen.x, screen.y);
    }
    this.terrainGraphics.lineTo(b.x + b.width - 10, b.y + b.height);
    this.terrainGraphics.lineTo(b.x + 10, b.y + b.height);
    this.terrainGraphics.closePath();
    this.terrainGraphics.fillPath();

    // Draw slope zones with preset colors
    this.levelData.slopeZones.forEach(zone => {
      const typeName = this.getZoneTypeName(zone);
      const presets = this.getZonePresets();
      const colorHex = presets[typeName]?.color || (zone.accelMult > 1 ? '#cc6644' : '#4466cc');
      const color = Phaser.Display.Color.HexStringToColor(colorHex).color;
      const startScreen = this.terrainToScreen(zone.fromX, 0);
      const endScreen = this.terrainToScreen(zone.toX, 0);
      this.terrainGraphics.fillStyle(color, 0.4);
      this.terrainGraphics.fillRect(startScreen.x, b.y, endScreen.x - startScreen.x, b.height);
    });
  }

  createPhysicsSliders() {
    const startX = 20;
    let y = 80;

    this.add.text(startX, y, 'Physics Settings', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#ffffff'
    });
    y += 30;

    const sliders = [
      { key: 'accel', label: 'Acceleration', min: 100, max: 300 },
      { key: 'rollingResistance', label: 'Rolling Resist.', min: 0, max: 60 },
      { key: 'brakeDecel', label: 'Brake Power', min: 150, max: 500 },
      { key: 'initialSpeed', label: 'Start Speed', min: 30, max: 100 }
    ];

    sliders.forEach(config => {
      this.createSlider(startX, y, config);
      y += 50;
    });
  }

  createSlider(x, y, config) {
    const width = 200;
    const height = 8;

    // Label
    this.add.text(x, y, config.label, {
      fontSize: '12px',
      color: '#aaaacc'
    });

    // Track
    const track = this.add.graphics();
    track.fillStyle(0x333344);
    track.fillRoundedRect(x, y + 18, width, height, 4);

    // Fill
    const fill = this.add.graphics();

    // Value text
    const valueText = this.add.text(x + width + 10, y + 12, '', {
      fontSize: '14px',
      color: '#ffffff'
    });

    // Calculate initial position
    const progress = (this.levelData[config.key] - config.min) / (config.max - config.min);
    const thumbX = x + progress * width;

    // Thumb
    const thumb = this.add.circle(thumbX, y + 22, 10, 0x4466cc);
    thumb.setStrokeStyle(2, 0x6688ee);
    thumb.setInteractive({ draggable: true, useHandCursor: true });

    // Update function
    const updateSlider = () => {
      const prog = (this.levelData[config.key] - config.min) / (config.max - config.min);
      fill.clear();
      fill.fillStyle(0x4466cc);
      fill.fillRoundedRect(x, y + 18, width * prog, height, 4);
      valueText.setText(Math.round(this.levelData[config.key]).toString());
    };

    updateSlider();

    thumb.on('drag', (pointer, dragX) => {
      const clampedX = Math.max(x, Math.min(x + width, dragX));
      thumb.x = clampedX;

      const prog = (clampedX - x) / width;
      this.levelData[config.key] = Math.round(config.min + prog * (config.max - config.min));
      updateSlider();
      this.updateLivePreview();
    });
  }

  createColorPickers() {
    const x = 20;
    let y = 310;

    this.add.text(x, y, 'Colors', {
      fontSize: '16px',
      color: '#ffffff'
    });
    y += 25;

    // Background color
    this.add.text(x, y, 'Background:', {
      fontSize: '12px',
      color: '#aaaacc'
    });

    this.bgColorBox = this.add.rectangle(x + 90, y + 8, 30, 20,
      Phaser.Display.Color.HexStringToColor(this.levelData.backgroundColor).color);
    this.bgColorBox.setStrokeStyle(2, 0x666677);
    this.bgColorBox.setInteractive({ useHandCursor: true });
    this.bgColorBox.on('pointerdown', () => this.showColorPalette('background'));

    y += 30;

    // Ground color
    this.add.text(x, y, 'Ground:', {
      fontSize: '12px',
      color: '#aaaacc'
    });

    this.groundColorBox = this.add.rectangle(x + 90, y + 8, 30, 20, this.levelData.groundColor);
    this.groundColorBox.setStrokeStyle(2, 0x666677);
    this.groundColorBox.setInteractive({ useHandCursor: true });
    this.groundColorBox.on('pointerdown', () => this.showColorPalette('ground'));
  }

  showColorPalette(type) {
    // Remove existing palette
    if (this.colorPalette) {
      this.colorPalette.destroy();
    }

    const colors = [
      0x0a0a1a, 0x1a0a0a, 0x0a1a0a, 0x0a0a2a, 0x1a1a1a,
      0x1a1a2e, 0x2a2a3a, 0x3a3a4a, 0x2a2a4a, 0x4a2a2a,
      0x2a4a2a, 0x3a4a5a, 0x4a4a2a, 0x5a3a4a, 0x302838
    ];

    this.colorPalette = this.add.container(140, 330);

    // Background
    const bg = this.add.graphics();
    bg.fillStyle(0x222233);
    bg.fillRoundedRect(0, 0, 160, 80, 8);
    bg.lineStyle(1, 0x444466);
    bg.strokeRoundedRect(0, 0, 160, 80, 8);
    this.colorPalette.add(bg);

    colors.forEach((color, i) => {
      const col = i % 5;
      const row = Math.floor(i / 5);
      const swatch = this.add.rectangle(15 + col * 30, 15 + row * 22, 24, 18, color);
      swatch.setStrokeStyle(1, 0x555566);
      swatch.setInteractive({ useHandCursor: true });

      swatch.on('pointerdown', () => {
        if (type === 'background') {
          this.levelData.backgroundColor = '#' + color.toString(16).padStart(6, '0');
          this.bgColorBox.setFillStyle(color);
        } else {
          this.levelData.groundColor = color;
          this.groundColorBox.setFillStyle(color);
          this.updateTerrainDisplay();
        }
        this.updateLivePreview();
        this.colorPalette.destroy();
        this.colorPalette = null;
        soundManager.playClick();
      });

      this.colorPalette.add(swatch);
    });
  }

  createSlopeZoneEditor() {
    const x = 20;
    let y = 400;

    this.add.text(x, y, 'Slope Zones', {
      fontSize: '16px',
      color: '#ffffff'
    });

    // Add zone button
    const addBtn = this.add.text(x + 100, y, '[ + Add ]', {
      fontSize: '14px',
      color: '#88aaff'
    }).setInteractive({ useHandCursor: true });

    addBtn.on('pointerover', () => addBtn.setColor('#aaccff'));
    addBtn.on('pointerout', () => addBtn.setColor('#88aaff'));
    addBtn.on('pointerdown', () => {
      this.showZoneEditorDialog(-1); // -1 means new zone
      soundManager.playClick();
    });

    y += 25;

    // Zone list container
    this.zoneListY = y;
    this.zoneContainer = this.add.container(x, y);
    this.updateZoneList();
  }

  // Zone type presets
  getZonePresets() {
    return {
      'Ice': { accelMult: 1.1, brakeMult: 0.5, resistAdd: -5, color: '#6688cc' },
      'Sand': { accelMult: 0.8, brakeMult: 1.2, resistAdd: 20, color: '#cc8844' },
      'Downhill': { accelMult: 1.4, brakeMult: 0.6, resistAdd: -10, color: '#cc6644' },
      'Uphill': { accelMult: 0.6, brakeMult: 1.3, resistAdd: 15, color: '#4466cc' },
      'Boost': { accelMult: 1.6, brakeMult: 0.8, resistAdd: -8, color: '#cc44aa' },
      'Mud': { accelMult: 0.7, brakeMult: 0.9, resistAdd: 30, color: '#665544' }
    };
  }

  getZoneTypeName(zone) {
    const presets = this.getZonePresets();
    for (const [name, preset] of Object.entries(presets)) {
      if (Math.abs(zone.accelMult - preset.accelMult) < 0.01 &&
          Math.abs(zone.brakeMult - preset.brakeMult) < 0.01) {
        return name;
      }
    }
    return zone.accelMult > 1 ? 'Fast' : 'Slow';
  }

  showZoneEditorDialog(zoneIndex) {
    const { width, height } = this.cameras.main;
    const isNew = zoneIndex === -1;

    // Close existing dialog
    if (this.zoneDialog) {
      this.zoneDialog.destroy();
    }

    // Default values for new zone or get existing
    let zone;
    if (isNew) {
      zone = { fromX: 200, toX: 500, accelMult: 1.1, brakeMult: 0.5, resistAdd: -5 };
    } else {
      zone = { ...this.levelData.slopeZones[zoneIndex] };
    }

    this.zoneDialog = this.add.container(0, 0);

    // Dim background
    const dimBg = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8);
    dimBg.setInteractive();
    this.zoneDialog.add(dimBg);

    // Panel
    const panelW = 340;
    const panelH = 320;
    const panel = this.add.graphics();
    panel.fillStyle(0x1a1a2e);
    panel.fillRoundedRect(width / 2 - panelW / 2, height / 2 - panelH / 2, panelW, panelH, 12);
    panel.lineStyle(2, 0x4455cc);
    panel.strokeRoundedRect(width / 2 - panelW / 2, height / 2 - panelH / 2, panelW, panelH, 12);
    this.zoneDialog.add(panel);

    // Title
    const title = this.add.text(width / 2, height / 2 - panelH / 2 + 25, isNew ? 'Add Slope Zone' : 'Edit Slope Zone', {
      fontSize: '20px',
      fontFamily: 'Arial Black',
      color: '#ffffff'
    }).setOrigin(0.5);
    this.zoneDialog.add(title);

    // Zone Type label
    const typeLabel = this.add.text(width / 2 - panelW / 2 + 20, height / 2 - 95, 'Zone Type:', {
      fontSize: '14px',
      color: '#aaaacc'
    });
    this.zoneDialog.add(typeLabel);

    // Zone type buttons
    const presets = this.getZonePresets();
    const presetNames = Object.keys(presets);
    let selectedType = this.getZoneTypeName(zone);

    const typeButtonsY = height / 2 - 70;
    const typeButtons = [];

    presetNames.forEach((name, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const btnX = width / 2 - 95 + col * 100;
      const btnY = typeButtonsY + row * 35;

      const preset = presets[name];
      const isSelected = name === selectedType;

      const btnBg = this.add.graphics();
      const btnColor = Phaser.Display.Color.HexStringToColor(preset.color).color;
      btnBg.fillStyle(isSelected ? btnColor : 0x333344);
      btnBg.fillRoundedRect(btnX - 45, btnY - 12, 90, 28, 4);
      if (isSelected) {
        btnBg.lineStyle(2, 0xffffff);
        btnBg.strokeRoundedRect(btnX - 45, btnY - 12, 90, 28, 4);
      }
      this.zoneDialog.add(btnBg);

      const btnText = this.add.text(btnX, btnY, name, {
        fontSize: '13px',
        color: '#ffffff'
      }).setOrigin(0.5);
      this.zoneDialog.add(btnText);

      const btnHit = this.add.rectangle(btnX, btnY, 90, 28, 0x000000, 0);
      btnHit.setInteractive({ useHandCursor: true });
      btnHit.on('pointerdown', () => {
        selectedType = name;
        zone.accelMult = preset.accelMult;
        zone.brakeMult = preset.brakeMult;
        zone.resistAdd = preset.resistAdd;
        // Refresh buttons
        typeButtons.forEach(tb => {
          const sel = tb.name === name;
          const c = Phaser.Display.Color.HexStringToColor(presets[tb.name].color).color;
          tb.bg.clear();
          tb.bg.fillStyle(sel ? c : 0x333344);
          tb.bg.fillRoundedRect(tb.x - 45, tb.y - 12, 90, 28, 4);
          if (sel) {
            tb.bg.lineStyle(2, 0xffffff);
            tb.bg.strokeRoundedRect(tb.x - 45, tb.y - 12, 90, 28, 4);
          }
        });
        soundManager.playClick();
      });
      this.zoneDialog.add(btnHit);

      typeButtons.push({ name, bg: btnBg, x: btnX, y: btnY });
    });

    // Position section
    const posY = height / 2 + 10;
    const posLabel = this.add.text(width / 2 - panelW / 2 + 20, posY, 'Position:', {
      fontSize: '14px',
      color: '#aaaacc'
    });
    this.zoneDialog.add(posLabel);

    // From X
    const fromLabel = this.add.text(width / 2 - 100, posY + 25, 'From:', {
      fontSize: '12px',
      color: '#888899'
    });
    this.zoneDialog.add(fromLabel);

    const fromValue = this.add.text(width / 2 - 55, posY + 25, zone.fromX.toString(), {
      fontSize: '14px',
      color: '#ffffff'
    });
    this.zoneDialog.add(fromValue);

    // From buttons
    const fromMinus = this.add.text(width / 2 - 25, posY + 25, '[-]', {
      fontSize: '12px', color: '#88aaff'
    }).setInteractive({ useHandCursor: true });
    fromMinus.on('pointerdown', () => {
      zone.fromX = Math.max(50, zone.fromX - 50);
      fromValue.setText(zone.fromX.toString());
    });
    this.zoneDialog.add(fromMinus);

    const fromPlus = this.add.text(width / 2 + 5, posY + 25, '[+]', {
      fontSize: '12px', color: '#88aaff'
    }).setInteractive({ useHandCursor: true });
    fromPlus.on('pointerdown', () => {
      zone.fromX = Math.min(zone.toX - 50, zone.fromX + 50);
      fromValue.setText(zone.fromX.toString());
    });
    this.zoneDialog.add(fromPlus);

    // To X
    const toLabel = this.add.text(width / 2 + 40, posY + 25, 'To:', {
      fontSize: '12px',
      color: '#888899'
    });
    this.zoneDialog.add(toLabel);

    const toValue = this.add.text(width / 2 + 70, posY + 25, zone.toX.toString(), {
      fontSize: '14px',
      color: '#ffffff'
    });
    this.zoneDialog.add(toValue);

    // To buttons
    const toMinus = this.add.text(width / 2 + 100, posY + 25, '[-]', {
      fontSize: '12px', color: '#88aaff'
    }).setInteractive({ useHandCursor: true });
    toMinus.on('pointerdown', () => {
      zone.toX = Math.max(zone.fromX + 50, zone.toX - 50);
      toValue.setText(zone.toX.toString());
    });
    this.zoneDialog.add(toMinus);

    const toPlus = this.add.text(width / 2 + 130, posY + 25, '[+]', {
      fontSize: '12px', color: '#88aaff'
    }).setInteractive({ useHandCursor: true });
    toPlus.on('pointerdown', () => {
      zone.toX = Math.min(800, zone.toX + 50);
      toValue.setText(zone.toX.toString());
    });
    this.zoneDialog.add(toPlus);

    // Save button
    const saveBtn = this.add.text(width / 2 - 50, height / 2 + panelH / 2 - 45, '[ Save ]', {
      fontSize: '18px',
      color: '#88ff88'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    saveBtn.on('pointerover', () => saveBtn.setColor('#aaffaa'));
    saveBtn.on('pointerout', () => saveBtn.setColor('#88ff88'));
    saveBtn.on('pointerdown', () => {
      if (isNew) {
        this.levelData.slopeZones.push(zone);
      } else {
        this.levelData.slopeZones[zoneIndex] = zone;
      }
      this.updateZoneList();
      this.updateTerrainDisplay();
      this.updateLivePreview();
      this.zoneDialog.destroy();
      this.zoneDialog = null;
      soundManager.playClick();
    });
    this.zoneDialog.add(saveBtn);

    // Cancel button
    const cancelBtn = this.add.text(width / 2 + 50, height / 2 + panelH / 2 - 45, '[ Cancel ]', {
      fontSize: '18px',
      color: '#aaaaaa'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    cancelBtn.on('pointerover', () => cancelBtn.setColor('#cccccc'));
    cancelBtn.on('pointerout', () => cancelBtn.setColor('#aaaaaa'));
    cancelBtn.on('pointerdown', () => {
      this.zoneDialog.destroy();
      this.zoneDialog = null;
      soundManager.playClick();
    });
    this.zoneDialog.add(cancelBtn);
  }

  updateZoneList() {
    this.zoneContainer.removeAll(true);

    this.levelData.slopeZones.forEach((zone, index) => {
      const row = this.add.container(0, index * 22);

      // Zone info - clickable to edit
      const typeName = this.getZoneTypeName(zone);
      const presets = this.getZonePresets();
      const color = presets[typeName]?.color || (zone.accelMult > 1 ? '#cc8866' : '#6688cc');

      const text = this.add.text(0, 0, `${index + 1}. ${typeName} (${zone.fromX}-${zone.toX})`, {
        fontSize: '11px',
        color: color
      }).setInteractive({ useHandCursor: true });

      text.on('pointerover', () => text.setStyle({ fontStyle: 'bold' }));
      text.on('pointerout', () => text.setStyle({ fontStyle: 'normal' }));
      text.on('pointerdown', () => {
        this.showZoneEditorDialog(index);
        soundManager.playClick();
      });
      row.add(text);

      // Delete button
      const delBtn = this.add.text(200, 0, '[X]', {
        fontSize: '11px',
        color: '#ff6666'
      }).setInteractive({ useHandCursor: true });

      delBtn.on('pointerdown', () => {
        this.levelData.slopeZones.splice(index, 1);
        this.updateZoneList();
        this.updateTerrainDisplay();
        this.updateLivePreview();
        soundManager.playClick();
      });
      row.add(delBtn);

      this.zoneContainer.add(row);
    });

    if (this.levelData.slopeZones.length === 0) {
      const emptyText = this.add.text(0, 0, 'No zones - click Add', {
        fontSize: '11px',
        color: '#666688'
      });
      this.zoneContainer.add(emptyText);
    }
  }

  createActionButtons() {
    const { width, height } = this.cameras.main;

    // Test Play button (left)
    this.createButton(width - 230, height - 30, 130, 'Test Play', 0x44aa44, () => {
      this.testPlayLevel();
    });

    // Save button (right)
    this.createButton(width - 80, height - 30, 140, 'Save & Publish', 0x4466cc, () => {
      this.showSaveDialog();
    });
  }

  createButton(x, y, buttonWidth, text, color, callback) {
    const buttonHeight = 36;

    const bg = this.add.graphics();
    bg.fillStyle(color);
    bg.fillRoundedRect(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight, 6);

    const buttonText = this.add.text(x, y, text, {
      fontSize: '16px',
      color: '#ffffff'
    }).setOrigin(0.5);

    const hitArea = this.add.rectangle(x, y, buttonWidth, buttonHeight, 0x000000, 0);
    hitArea.setInteractive({ useHandCursor: true });

    hitArea.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(color + 0x222222);
      bg.fillRoundedRect(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight, 6);
    });

    hitArea.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(color);
      bg.fillRoundedRect(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight, 6);
    });

    hitArea.on('pointerdown', () => {
      soundManager.playClick();
      callback();
    });
  }

  createLivePreview() {
    const x = 380;
    const y = 270;
    const previewWidth = 560;
    const previewHeight = 180;

    this.add.text(x, y - 15, 'Live Preview', {
      fontSize: '14px',
      color: '#888899'
    });

    // Preview frame
    this.previewFrame = this.add.rectangle(
      x + previewWidth / 2,
      y + previewHeight / 2,
      previewWidth,
      previewHeight,
      0x000000, 0
    );
    this.previewFrame.setStrokeStyle(2, 0x333355);

    // Preview graphics
    this.previewGraphics = this.add.graphics();

    // Store preview bounds
    this.previewBounds = { x, y, width: previewWidth, height: previewHeight };

    this.updateLivePreview();
  }

  updateLivePreview() {
    if (!this.previewGraphics) return;

    this.previewGraphics.clear();

    const b = this.previewBounds;
    const scale = b.width / 960;
    const groundY = b.y + b.height * 0.75;

    // Background
    const bgColor = Phaser.Display.Color.HexStringToColor(this.levelData.backgroundColor).color;
    this.previewGraphics.fillStyle(bgColor);
    this.previewGraphics.fillRect(b.x, b.y, b.width, b.height);

    // Terrain
    const profile = this.levelData.elevationProfile;
    this.previewGraphics.fillStyle(this.levelData.groundColor);
    this.previewGraphics.beginPath();

    const firstX = b.x + profile[0].x * scale;
    const firstY = groundY + profile[0].y * scale * 0.6;
    this.previewGraphics.moveTo(firstX, firstY);

    for (let i = 1; i < profile.length; i++) {
      const px = b.x + profile[i].x * scale;
      const py = groundY + profile[i].y * scale * 0.6;
      this.previewGraphics.lineTo(px, py);
    }

    this.previewGraphics.lineTo(b.x + b.width, b.y + b.height);
    this.previewGraphics.lineTo(b.x, b.y + b.height);
    this.previewGraphics.closePath();
    this.previewGraphics.fillPath();

    // Slope zones
    this.levelData.slopeZones.forEach(zone => {
      const color = zone.accelMult > 1 ? 0xaa6644 : 0x4466aa;
      this.previewGraphics.fillStyle(color, 0.3);
      this.previewGraphics.fillRect(
        b.x + zone.fromX * scale,
        b.y,
        (zone.toX - zone.fromX) * scale,
        b.height
      );
    });

    // Cliff edge
    this.previewGraphics.lineStyle(2, 0xff4444);
    this.previewGraphics.lineBetween(
      b.x + CLIFF_X * scale,
      b.y,
      b.x + CLIFF_X * scale,
      b.y + b.height
    );

    // Mini rover
    const roverX = b.x + 60;
    const roverY = groundY - 8;
    this.previewGraphics.fillStyle(0x3388dd);
    this.previewGraphics.fillRect(roverX, roverY, 25, 12);
    this.previewGraphics.fillStyle(0x1a1a22);
    this.previewGraphics.fillCircle(roverX + 5, roverY + 12, 4);
    this.previewGraphics.fillCircle(roverX + 20, roverY + 12, 4);

    // Stats
    this.previewGraphics.fillStyle(0xffffff);
    const statsY = b.y + b.height - 15;
    const stats = `Accel: ${this.levelData.accel} | Resist: ${this.levelData.rollingResistance} | Brake: ${this.levelData.brakeDecel} | Speed: ${this.levelData.initialSpeed}`;

    // Draw stats background
    this.previewGraphics.fillStyle(0x000000, 0.5);
    this.previewGraphics.fillRect(b.x, statsY - 3, b.width, 18);
  }

  testPlayLevel() {
    const testTerrain = {
      id: 'CUSTOM_TEST',
      name: this.levelData.name || 'Custom Level',
      description: 'Test Play',
      accel: this.levelData.accel,
      rollingResistance: this.levelData.rollingResistance,
      brakeDecel: this.levelData.brakeDecel,
      initialSpeed: this.levelData.initialSpeed,
      backgroundColor: this.levelData.backgroundColor,
      groundColor: this.levelData.groundColor,
      elevationProfile: [...this.levelData.elevationProfile],
      slopeZones: [...this.levelData.slopeZones]
    };

    this.scene.start('GameScene', {
      attemptNumber: 1,
      totalAttempts: 1,
      scores: [],
      practiceMode: true,
      customTerrain: testTerrain,
      returnScene: 'LevelEditorScene',
      editorState: { ...this.levelData }
    });
  }

  showSaveDialog() {
    const { width, height } = this.cameras.main;

    this.saveDialog = this.add.container(0, 0);

    // Dim background
    const dimBg = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8);
    dimBg.setInteractive();
    this.saveDialog.add(dimBg);

    // Panel - make it taller for better spacing
    const panelW = 380;
    const panelH = 280;
    const panelX = width / 2 - panelW / 2;
    const panelY = height / 2 - panelH / 2;

    const panel = this.add.graphics();
    panel.fillStyle(0x1a1a2e);
    panel.fillRoundedRect(panelX, panelY, panelW, panelH, 12);
    panel.lineStyle(2, 0x4455cc);
    panel.strokeRoundedRect(panelX, panelY, panelW, panelH, 12);
    this.saveDialog.add(panel);

    // Title
    const title = this.add.text(width / 2, panelY + 30, 'Save Level', {
      fontSize: '24px',
      fontFamily: 'Arial Black',
      color: '#ffffff'
    }).setOrigin(0.5);
    this.saveDialog.add(title);

    // Level name label
    const nameLabel = this.add.text(panelX + 20, panelY + 70, 'Level Name:', {
      fontSize: '14px',
      color: '#aaaacc'
    });
    this.saveDialog.add(nameLabel);

    // Store input positions for DOM elements
    this.inputPositions = {
      nameY: panelY + 95,
      authorY: panelY + 165,
      inputX: panelX + 20,
      inputWidth: panelW - 40
    };

    // Name input background (visual only, DOM input overlays this)
    this.nameInputBg = this.add.rectangle(
      panelX + panelW / 2,
      this.inputPositions.nameY + 15,
      this.inputPositions.inputWidth,
      32,
      0x222244
    );
    this.nameInputBg.setStrokeStyle(1, 0x444466);
    this.saveDialog.add(this.nameInputBg);

    // Author name label
    const authorLabel = this.add.text(panelX + 20, panelY + 140, 'Your Name (optional):', {
      fontSize: '14px',
      color: '#aaaacc'
    });
    this.saveDialog.add(authorLabel);

    // Author input background
    this.authorInputBg = this.add.rectangle(
      panelX + panelW / 2,
      this.inputPositions.authorY + 15,
      this.inputPositions.inputWidth,
      32,
      0x222244
    );
    this.authorInputBg.setStrokeStyle(1, 0x444466);
    this.saveDialog.add(this.authorInputBg);

    // Create DOM inputs for actual text entry
    this.createDOMInputs();

    // Save button
    const saveBtn = this.add.text(width / 2 - 60, panelY + panelH - 35, '[ Save ]', {
      fontSize: '20px',
      color: '#88ff88'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    saveBtn.on('pointerover', () => saveBtn.setColor('#aaffaa'));
    saveBtn.on('pointerout', () => saveBtn.setColor('#88ff88'));
    saveBtn.on('pointerdown', () => this.performSave());
    this.saveDialog.add(saveBtn);

    // Cancel button
    const cancelBtn = this.add.text(width / 2 + 60, panelY + panelH - 35, '[ Cancel ]', {
      fontSize: '20px',
      color: '#aaaaaa'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    cancelBtn.on('pointerover', () => cancelBtn.setColor('#cccccc'));
    cancelBtn.on('pointerout', () => cancelBtn.setColor('#aaaaaa'));
    cancelBtn.on('pointerdown', () => {
      this.removeDOMInputs();
      this.saveDialog.destroy();
      soundManager.playClick();
    });
    this.saveDialog.add(cancelBtn);
  }

  createDOMInputs() {
    const gameContainer = document.getElementById('game-container');
    const canvas = gameContainer.querySelector('canvas');
    const rect = canvas.getBoundingClientRect();

    // Calculate scale
    const scaleX = rect.width / 960;
    const scaleY = rect.height / 540;

    const pos = this.inputPositions;

    // Name input
    this.nameInput = document.createElement('input');
    this.nameInput.type = 'text';
    this.nameInput.value = this.levelData.name;
    this.nameInput.maxLength = 30;
    this.nameInput.style.cssText = `
      position: absolute;
      left: ${rect.left + pos.inputX * scaleX}px;
      top: ${rect.top + pos.nameY * scaleY}px;
      width: ${pos.inputWidth * scaleX}px;
      height: ${32 * scaleY}px;
      font-size: ${14 * Math.min(scaleX, scaleY)}px;
      background: #222244;
      border: 1px solid #6677aa;
      border-radius: 4px;
      color: white;
      padding: 0 10px;
      box-sizing: border-box;
      outline: none;
    `;
    document.body.appendChild(this.nameInput);
    this.nameInput.focus();

    // Author input
    this.authorInput = document.createElement('input');
    this.authorInput.type = 'text';
    this.authorInput.placeholder = 'Anonymous';
    this.authorInput.maxLength = 20;
    this.authorInput.style.cssText = `
      position: absolute;
      left: ${rect.left + pos.inputX * scaleX}px;
      top: ${rect.top + pos.authorY * scaleY}px;
      width: ${pos.inputWidth * scaleX}px;
      height: ${32 * scaleY}px;
      font-size: ${14 * Math.min(scaleX, scaleY)}px;
      background: #222244;
      border: 1px solid #6677aa;
      border-radius: 4px;
      color: white;
      padding: 0 10px;
      box-sizing: border-box;
      outline: none;
    `;
    document.body.appendChild(this.authorInput);
  }

  removeDOMInputs() {
    if (this.nameInput) {
      this.nameInput.remove();
      this.nameInput = null;
    }
    if (this.authorInput) {
      this.authorInput.remove();
      this.authorInput = null;
    }
  }

  async performSave() {
    const levelName = this.nameInput?.value || this.levelData.name;
    const authorName = this.authorInput?.value || 'Anonymous';

    this.levelData.name = levelName;
    this.levelData.authorName = authorName;

    // Show saving indicator
    this.nameInputText?.setText('Saving...');

    try {
      await saveLevel(this.levelData);

      this.removeDOMInputs();
      this.saveDialog.destroy();

      // Show success message
      this.showMessage('Level saved successfully!', 0x44aa44);

    } catch (error) {
      console.error('Save failed:', error);
      this.showMessage('Failed to save. Try again.', 0xaa4444);
    }
  }

  showMessage(text, color) {
    const { width, height } = this.cameras.main;

    const msgBg = this.add.graphics();
    msgBg.fillStyle(color, 0.9);
    msgBg.fillRoundedRect(width / 2 - 150, height / 2 - 25, 300, 50, 8);

    const msgText = this.add.text(width / 2, height / 2, text, {
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Auto-hide after 2 seconds
    this.time.delayedCall(2000, () => {
      msgBg.destroy();
      msgText.destroy();
    });
  }
}
