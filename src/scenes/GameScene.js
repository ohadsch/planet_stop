import Phaser from 'phaser';
import TERRAINS from '../data/terrains.js';
import soundManager from '../audio/SoundManager.js';

// Layout constants
const X_START = 100;
const CLIFF_X = 820;
const GROUND_BASE_Y = 400;
const ROVER_WIDTH = 50;
const ROVER_HEIGHT = 28;
const STOP_THRESHOLD = 5;

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  init(data) {
    this.attemptNumber = data.attemptNumber || 1;
    this.totalAttempts = data.totalAttempts || 10;
    this.scores = data.scores || [];
    this.practiceMode = data.practiceMode || false;
    this.practiceTerrainIndex = data.practiceTerrainIndex;
    this.customTerrain = data.customTerrain || null;
    this.returnScene = data.returnScene || 'MenuScene';
    this.editorState = data.editorState || null;

    // Get terrain - custom terrain takes priority, then practice mode, then regular cycle
    if (this.customTerrain) {
      this.terrain = this.customTerrain;
    } else if (this.practiceMode && this.practiceTerrainIndex !== undefined) {
      this.terrain = TERRAINS[this.practiceTerrainIndex] || TERRAINS[0];
    } else {
      this.terrain = TERRAINS[this.attemptNumber - 1] || TERRAINS[0];
    }

    this.roverX = X_START;
    this.roverV = this.terrain.initialSpeed;
    this.hasBraked = false;
    this.attemptOver = false;
  }

  create() {
    const { width, height } = this.cameras.main;

    // Apply terrain-specific background color
    this.cameras.main.setBackgroundColor(this.terrain.backgroundColor || '#0a0a1a');
    this.drawStarfield();
    this.drawTerrain();

    // Rover container for rotation
    this.roverContainer = this.add.container(0, 0);
    this.roverGraphics = this.add.graphics();
    this.roverContainer.add(this.roverGraphics);
    this.updateRover();

    this.createUI();

    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.input.on('pointerdown', () => this.triggerBrake());

    // Initialize and start engine sound
    soundManager.init();
    soundManager.startEngine(this.roverV);
  }

  drawStarfield() {
    const graphics = this.add.graphics();
    // Use seeded random for consistent stars per terrain
    const seed = this.terrain.id.charCodeAt(0);
    for (let i = 0; i < 100; i++) {
      const x = ((seed * 13 + i * 97) % 960);
      const y = ((seed * 7 + i * 53) % 280);
      const alpha = 0.2 + ((i * 17) % 80) / 100;
      const size = 1 + (i % 2);
      graphics.fillStyle(0xffffff, alpha);
      graphics.fillCircle(x, y, size);
    }
  }

  getTerrainY(x) {
    const profile = this.terrain.elevationProfile;
    if (!profile || profile.length === 0) return GROUND_BASE_Y;
    if (x <= profile[0].x) return GROUND_BASE_Y + profile[0].y;
    if (x >= profile[profile.length - 1].x) return GROUND_BASE_Y + profile[profile.length - 1].y;

    for (let i = 0; i < profile.length - 1; i++) {
      if (x >= profile[i].x && x < profile[i + 1].x) {
        const t = (x - profile[i].x) / (profile[i + 1].x - profile[i].x);
        const y = profile[i].y + t * (profile[i + 1].y - profile[i].y);
        return GROUND_BASE_Y + y;
      }
    }
    return GROUND_BASE_Y;
  }

  getTerrainAngle(x) {
    const dx = 5;
    const y1 = this.getTerrainY(x - dx);
    const y2 = this.getTerrainY(x + dx);
    return Math.atan2(y2 - y1, dx * 2);
  }

  drawTerrain() {
    const graphics = this.add.graphics();

    // Draw void/abyss beyond cliff
    graphics.fillStyle(0x020208);
    graphics.fillRect(CLIFF_X, 0, 200, 540);

    // Draw falling stars in void
    graphics.fillStyle(0x333355, 0.3);
    for (let i = 0; i < 20; i++) {
      const x = CLIFF_X + 20 + (i * 37) % 120;
      const y = 200 + (i * 53) % 300;
      graphics.fillCircle(x, y, 1);
    }

    // Build terrain polygon points
    const terrainPoints = [];

    // Top surface
    for (let x = 0; x <= CLIFF_X; x += 5) {
      terrainPoints.push({ x: x, y: this.getTerrainY(x) });
    }
    terrainPoints.push({ x: CLIFF_X, y: this.getTerrainY(CLIFF_X) });
    terrainPoints.push({ x: CLIFF_X, y: 540 });
    terrainPoints.push({ x: 0, y: 540 });

    // Draw main terrain fill with terrain-specific color
    const groundColor = this.terrain.groundColor || 0x2a2a3a;
    graphics.fillStyle(groundColor);
    graphics.beginPath();
    graphics.moveTo(terrainPoints[0].x, terrainPoints[0].y);
    for (let i = 1; i < terrainPoints.length; i++) {
      graphics.lineTo(terrainPoints[i].x, terrainPoints[i].y);
    }
    graphics.closePath();
    graphics.fillPath();

    // Draw subsurface layer (darker)
    graphics.fillStyle(groundColor - 0x101010);
    graphics.beginPath();
    const subOffset = 40;
    graphics.moveTo(0, this.getTerrainY(0) + subOffset);
    for (let x = 0; x <= CLIFF_X; x += 10) {
      graphics.lineTo(x, this.getTerrainY(x) + subOffset);
    }
    graphics.lineTo(CLIFF_X, 540);
    graphics.lineTo(0, 540);
    graphics.closePath();
    graphics.fillPath();

    // Draw terrain surface line
    const surfaceColor = groundColor + 0x202020;
    graphics.lineStyle(3, surfaceColor);
    graphics.beginPath();
    graphics.moveTo(0, this.getTerrainY(0));
    for (let x = 5; x <= CLIFF_X; x += 5) {
      graphics.lineTo(x, this.getTerrainY(x));
    }
    graphics.strokePath();

    // Draw slope zone indicators
    if (this.terrain.slopeZones) {
      for (const zone of this.terrain.slopeZones) {
        let color, alpha;
        if (zone.accelMult < 1) {
          color = 0x4466aa;
          alpha = 0.2;
        } else if (zone.accelMult > 1) {
          color = 0xaa6644;
          alpha = 0.2;
        } else {
          color = 0x666666;
          alpha = 0.1;
        }

        graphics.fillStyle(color, alpha);
        graphics.beginPath();
        graphics.moveTo(zone.fromX, this.getTerrainY(zone.fromX));
        for (let x = zone.fromX; x <= zone.toX; x += 5) {
          graphics.lineTo(x, this.getTerrainY(x));
        }
        graphics.lineTo(zone.toX, 540);
        graphics.lineTo(zone.fromX, 540);
        graphics.closePath();
        graphics.fillPath();
      }
    }

    // Draw distance markers
    graphics.lineStyle(1, surfaceColor, 0.5);
    for (let x = 200; x < CLIFF_X; x += 100) {
      const y = this.getTerrainY(x);
      graphics.lineBetween(x, y, x, y + 15);
    }

    // Cliff edge warning
    graphics.lineStyle(4, 0xff4444);
    const cliffY = this.getTerrainY(CLIFF_X);
    graphics.lineBetween(CLIFF_X, cliffY - 40, CLIFF_X, cliffY);

    // Danger stripes near cliff
    graphics.lineStyle(2, 0xffaa00, 0.6);
    for (let x = CLIFF_X - 60; x < CLIFF_X; x += 12) {
      const y = this.getTerrainY(x);
      graphics.lineBetween(x, y, x + 6, y - 8);
    }

    // Draw horizon line
    graphics.lineStyle(1, 0x333355);
    graphics.lineBetween(0, 160, 960, 160);
  }

  updateRover() {
    this.roverGraphics.clear();

    const centerX = this.roverX + ROVER_WIDTH / 2;
    const terrainY = this.getTerrainY(centerX);
    const angle = this.getTerrainAngle(centerX);

    this.roverContainer.setPosition(centerX, terrainY);
    this.roverContainer.setRotation(angle);

    const g = this.roverGraphics;
    const hw = ROVER_WIDTH / 2;

    // Shadow
    g.fillStyle(0x000000, 0.3);
    g.fillEllipse(0, 4, ROVER_WIDTH - 4, 10);

    // Rover body
    g.fillStyle(0x3388dd);
    g.fillRoundedRect(-hw, -ROVER_HEIGHT - 4, ROVER_WIDTH, ROVER_HEIGHT, 6);

    // Body highlight
    g.fillStyle(0x55aaff, 0.4);
    g.fillRoundedRect(-hw + 4, -ROVER_HEIGHT, ROVER_WIDTH - 8, 8, 3);

    // Cabin
    g.fillStyle(0x225588);
    g.fillRoundedRect(-hw + 8, -ROVER_HEIGHT - 12, ROVER_WIDTH - 24, 12, 4);

    // Window
    g.fillStyle(0x88ddff, 0.6);
    g.fillRoundedRect(-hw + 12, -ROVER_HEIGHT - 10, ROVER_WIDTH - 32, 8, 2);

    // Headlight beam
    g.fillStyle(0xffffcc, 0.15);
    g.fillTriangle(
      hw, -ROVER_HEIGHT / 2 - 4,
      hw + 60, -ROVER_HEIGHT - 20,
      hw + 60, 10
    );

    // Headlight
    g.fillStyle(0xffffaa);
    g.fillCircle(hw - 2, -ROVER_HEIGHT / 2 - 4, 5);

    // Wheels
    g.fillStyle(0x1a1a22);
    g.fillCircle(-hw + 10, -2, 10);
    g.fillCircle(hw - 10, -2, 10);

    // Wheel hubs
    g.fillStyle(0x444455);
    g.fillCircle(-hw + 10, -2, 4);
    g.fillCircle(hw - 10, -2, 4);

    // Brake lights when braking
    if (this.hasBraked && this.roverV > 0) {
      g.fillStyle(0xff3333);
      g.fillRect(-hw - 3, -ROVER_HEIGHT + 4, 4, ROVER_HEIGHT - 12);
      g.fillStyle(0xff3333, 0.3);
      g.fillCircle(-hw - 5, -ROVER_HEIGHT / 2 - 4, 12);
    }

    // Dust particles when moving fast
    if (this.roverV > 100 && !this.hasBraked) {
      g.fillStyle(0x888888, 0.4);
      for (let i = 0; i < 5; i++) {
        const dx = -hw - 10 - Math.random() * 30;
        const dy = Math.random() * 20 - 10;
        g.fillCircle(dx, dy, 2 + Math.random() * 3);
      }
    }
  }

  getZoneModifiers(x) {
    const zones = this.terrain.slopeZones || [];
    for (const zone of zones) {
      if (x >= zone.fromX && x <= zone.toX) {
        return {
          accelMult: zone.accelMult || 1,
          brakeMult: zone.brakeMult || 1,
          resistAdd: zone.resistAdd || 0
        };
      }
    }
    return { accelMult: 1, brakeMult: 1, resistAdd: 0 };
  }

  createUI() {
    const { width } = this.cameras.main;

    const attemptLabel = this.practiceMode
      ? 'Practice Mode'
      : `Attempt ${this.attemptNumber} / ${this.totalAttempts}`;

    this.attemptText = this.add.text(20, 20, attemptLabel, {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: this.practiceMode ? '#88ff88' : '#ffffff'
    });

    this.terrainText = this.add.text(20, 50, this.terrain.name, {
      fontSize: '24px',
      fontFamily: 'Arial Black, Arial',
      color: '#88aaff'
    });

    this.add.text(20, 82, this.terrain.description, {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#666688'
    });

    this.speedText = this.add.text(width - 20, 20, 'Speed: 0', {
      fontSize: '22px',
      fontFamily: 'Arial',
      color: '#ffcc44'
    }).setOrigin(1, 0);

    this.zoneText = this.add.text(width - 20, 50, '', {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#888888'
    }).setOrigin(1, 0);

    this.instructionText = this.add.text(width / 2, 500, 'Press SPACE to FULL BRAKE', {
      fontSize: '26px',
      fontFamily: 'Arial',
      color: '#88ff88'
    }).setOrigin(0.5);

    this.distanceText = this.add.text(width / 2, 530, '', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#aaaaaa'
    }).setOrigin(0.5);
  }

  triggerBrake() {
    if (this.hasBraked || this.attemptOver) return;
    this.hasBraked = true;
    this.instructionText.setText('BRAKING...');
    this.instructionText.setColor('#ff8844');
    soundManager.playBrake();
  }

  update(time, delta) {
    if (this.attemptOver) return;

    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.triggerBrake();
    }

    const dt = delta / 1000;
    const zone = this.getZoneModifiers(this.roverX + ROVER_WIDTH / 2);

    // Update zone indicator
    if (zone.accelMult !== 1) {
      if (zone.accelMult < 1) {
        this.zoneText.setText('UPHILL');
        this.zoneText.setColor('#6688cc');
      } else {
        this.zoneText.setText('DOWNHILL');
        this.zoneText.setColor('#cc8866');
      }
    } else {
      this.zoneText.setText('');
    }

    const accel = this.terrain.accel * zone.accelMult;
    const resist = this.terrain.rollingResistance + zone.resistAdd;

    if (!this.hasBraked) {
      this.roverV += accel * dt;
      this.roverV -= resist * dt;
    } else {
      const brake = this.terrain.brakeDecel * zone.brakeMult;
      this.roverV -= brake * dt;
    }

    this.roverV = Math.max(0, this.roverV);
    this.roverX += this.roverV * dt;

    this.updateRover();
    this.speedText.setText(`Speed: ${Math.round(this.roverV)}`);

    // Update engine sound
    soundManager.updateEngine(this.roverV, this.hasBraked);

    const frontX = this.roverX + ROVER_WIDTH;
    const distanceToEdge = CLIFF_X - frontX;
    this.distanceText.setText(`Distance to edge: ${Math.round(distanceToEdge)}px`);

    if (frontX >= CLIFF_X) {
      this.endAttemptFellOff();
    } else if (this.hasBraked && this.roverV < STOP_THRESHOLD) {
      this.endAttemptStopped(distanceToEdge);
    }
  }

  endAttemptFellOff() {
    this.attemptOver = true;
    this.roverV = 0;

    soundManager.stopEngine();
    soundManager.playFall();

    this.instructionText.setText('FELL OFF!');
    this.instructionText.setColor('#ff4444');
    this.distanceText.setText('');

    // Camera shake
    this.cameras.main.shake(300, 0.02);

    // Animate rover falling
    const startY = this.roverContainer.y;
    const startRotation = this.roverContainer.rotation;

    // Tumble and fall into the void
    this.tweens.add({
      targets: this.roverContainer,
      y: startY + 450,
      rotation: startRotation + Math.PI * 2,
      x: this.roverContainer.x + 80,
      scaleX: 0.2,
      scaleY: 0.2,
      alpha: 0,
      duration: 1400,
      ease: 'Quad.easeIn',
      onComplete: () => {
        this.distanceText.setText('Score: 0');
        this.scores.push({ terrain: this.terrain.name, score: 0 });
        this.showEndOverlay(0, -1);
      }
    });
  }

  endAttemptStopped(distanceToEdge) {
    this.attemptOver = true;
    this.roverV = 0;

    soundManager.stopEngine();
    soundManager.playSuccess();

    const maxScorableDistance = 300;
    const closeness = Math.max(0, Math.min(1, 1 - (distanceToEdge / maxScorableDistance)));
    const score = Math.round(100 * closeness);

    this.instructionText.setText('STOPPED!');
    this.instructionText.setColor('#44ff44');
    this.distanceText.setText(`${Math.round(distanceToEdge)}px from edge - Score: ${score}`);

    this.scores.push({ terrain: this.terrain.name, score: score });
    this.showEndOverlay(score, distanceToEdge);
  }

  showEndOverlay(score, distanceToEdge) {
    const { width, height } = this.cameras.main;

    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.6);

    const panel = this.add.graphics();
    panel.fillStyle(0x1a1a2e, 0.95);
    panel.fillRoundedRect(width / 2 - 200, height / 2 - 120, 400, 240, 12);
    panel.lineStyle(2, 0x4455cc);
    panel.strokeRoundedRect(width / 2 - 200, height / 2 - 120, 400, 240, 12);

    const resultText = distanceToEdge < 0 ? 'FELL OFF!' : 'STOPPED!';
    const resultColor = distanceToEdge < 0 ? '#ff4444' : '#44ff44';

    this.add.text(width / 2, height / 2 - 80, resultText, {
      fontSize: '36px',
      fontFamily: 'Arial Black, Arial',
      color: resultColor
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 - 30, `Score: ${score}`, {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: '#ffffff'
    }).setOrigin(0.5);

    if (distanceToEdge >= 0) {
      this.add.text(width / 2, height / 2 + 5, `${Math.round(distanceToEdge)}px from edge`, {
        fontSize: '18px',
        fontFamily: 'Arial',
        color: '#aaaaaa'
      }).setOrigin(0.5);
    }

    // Running total (only in regular mode)
    if (!this.practiceMode) {
      const totalSoFar = this.scores.reduce((sum, s) => sum + s.score, 0);
      this.add.text(width / 2, height / 2 + 40, `Total: ${totalSoFar} / ${this.attemptNumber * 100}`, {
        fontSize: '18px',
        fontFamily: 'Arial',
        color: '#ffcc44'
      }).setOrigin(0.5);
    }

    let buttonText;
    if (this.practiceMode) {
      buttonText = 'Try Again';
    } else {
      const isLastAttempt = this.attemptNumber >= this.totalAttempts;
      buttonText = isLastAttempt ? 'See Results' : 'Next Attempt';
    }

    const btn = this.add.text(width / 2, height / 2 + 75, `[ ${buttonText} ]`, {
      fontSize: '22px',
      fontFamily: 'Arial',
      color: '#88aaff'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => btn.setColor('#aaccff'));
    btn.on('pointerout', () => btn.setColor('#88aaff'));
    btn.on('pointerdown', () => {
      soundManager.playClick();
      this.nextAttempt();
    });

    // Quit to menu button (protected with hold-to-confirm)
    const quitBtn = this.add.text(width / 2, height / 2 + 110, 'Hold to Quit', {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#666688'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    // Progress bar background
    const progressBg = this.add.graphics();
    progressBg.fillStyle(0x333344);
    progressBg.fillRoundedRect(width / 2 - 50, height / 2 + 122, 100, 6, 3);

    // Progress bar fill
    const progressFill = this.add.graphics();
    let holdProgress = 0;
    let isHolding = false;
    const holdDuration = 1000; // ms to hold

    quitBtn.on('pointerdown', () => {
      isHolding = true;
      holdProgress = 0;
    });

    quitBtn.on('pointerup', () => {
      isHolding = false;
      holdProgress = 0;
      progressFill.clear();
    });

    quitBtn.on('pointerout', () => {
      isHolding = false;
      holdProgress = 0;
      progressFill.clear();
    });

    // Update hold progress
    this.time.addEvent({
      delay: 16,
      loop: true,
      callback: () => {
        if (isHolding) {
          holdProgress += 16;
          const progress = Math.min(holdProgress / holdDuration, 1);

          progressFill.clear();
          progressFill.fillStyle(0xaa6666);
          progressFill.fillRoundedRect(width / 2 - 50, height / 2 + 122, 100 * progress, 6, 3);

          if (progress >= 1) {
            isHolding = false;
            soundManager.playClick();
            if (this.returnScene === 'LevelEditorScene' && this.editorState) {
              this.scene.start('LevelEditorScene', { editorState: this.editorState });
            } else {
              this.scene.start(this.returnScene);
            }
          }
        }
      }
    });
  }

  nextAttempt() {
    if (this.customTerrain) {
      // Custom terrain (from editor or browser), restart same level
      this.scene.restart({
        attemptNumber: 1,
        totalAttempts: 1,
        scores: [],
        practiceMode: true,
        customTerrain: this.customTerrain,
        returnScene: this.returnScene,
        editorState: this.editorState
      });
    } else if (this.practiceMode) {
      // In practice mode, restart the same level
      this.scene.restart({
        attemptNumber: 1,
        totalAttempts: 1,
        scores: [],
        practiceMode: true,
        practiceTerrainIndex: this.practiceTerrainIndex
      });
    } else if (this.attemptNumber >= this.totalAttempts) {
      // Go to results scene
      this.scene.start('ResultsScene', { scores: this.scores });
    } else {
      this.scene.restart({
        attemptNumber: this.attemptNumber + 1,
        totalAttempts: this.totalAttempts,
        scores: this.scores
      });
    }
  }
}
