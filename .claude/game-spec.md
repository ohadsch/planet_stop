# **Planet Stop — Game Specification (Phaser.js, Browser 2D)**

## **1) High concept**

**Planet Stop** is a 2D browser game where the player controls a space rover that auto-drives toward a cliff at the end of an alien road. In each attempt, the player makes **exactly one decision**: **when to hit full brake**.

Scoring rewards stopping **as close as possible to the cliff edge** without going over. Going off the cliff scores **0**.

A full game session consists of **10 attempts**, each on a different pre-selected terrain. The **final score** is the **sum of all 10 attempt scores**.

---

## **2) Target build constraints**

- Must be buildable to a playable prototype in a few hours.
- Use **Phaser 3** + JavaScript (or TypeScript if desired, but default to JS for speed).
- Keep visuals simple (rectangles/sprites), no complex art required.

---

## **3) Platform & controls**

- **Platform:** Desktop browser (Chrome recommended).
- **Controls:**
    - **SPACE** (or click/tap) = trigger **FULL BRAKE** (only once per attempt)
    - Optional: **R** = restart current attempt (debug only; can be removed)
- Only one action per attempt; after braking triggers, input is disabled until the attempt ends.

---

## **4) Core gameplay loop (per attempt)**

1. Attempt starts: rover is placed at the start of a straight track.
2. Rover **auto-accelerates** (or starts at a fixed initial speed) and moves toward the cliff.
3. The player chooses **one moment** to hit full brake.
4. Rover decelerates according to the terrain's braking profile until:
    - It **stops** on the track → score depends on distance to cliff edge.
    - It **crosses the cliff edge** → score = 0.
5. Show attempt result overlay, then "Next Attempt".

---

## **5) World layout**

- The world is mostly **1D movement** along the x-axis to keep implementation simple.
- Visual layout:
    - **Road/track**: horizontal strip across the screen
    - **Cliff edge**: a vertical marker at cliffX
    - **Void** beyond cliff: darker area / stars

### **Suggested coordinate layout**

- Canvas: 960 x 540 (or 800x600).
- Track starts at xStart = 120.
- Cliff edge at cliffX = 820.
- Rover sprite/rect starts at xStart and travels toward cliffX.

---

## **6) Physics model (simple and deterministic)**

Use a simple per-frame update (no need for Arcade Physics unless you want collisions).

### **State variables (per attempt)**

- x rover position (float)
- v rover velocity (float, pixels/sec)
- a rover acceleration (float, pixels/sec²)
- braking boolean (false until user triggers)
- hasBraked boolean (true after brake pressed, input locked)
- attemptOver boolean

### **Motion rules**

- Before braking:
    - Rover accelerates: v += accel * dt
    - Apply terrain rolling resistance: v -= rollingResistance * dt (clamp >= 0)
- After braking:
    - Apply braking deceleration: v -= brakeDecel * dt (clamp >= 0)
    - Optional: terrain can add "low gravity slide": reduce brakeDecel or increase rollingResistance accordingly.
- Update position:
    - x += v * dt

### **End conditions**

- **Fell off cliff**: if rover's front reaches or passes cliffX (simplify as x >= cliffX)
    - Score = 0
    - End attempt immediately, show "Fell Off!"
- **Stopped safely**: if braking is on and v <= stopThreshold (e.g. v < 5)
    - Clamp rover to current x
    - Score computed from distance-to-edge

---

## **7) Scoring**

Goal: reward closeness to cliff without crossing.

### **Distance definition**

- distanceToEdge = cliffX - xStop
- If distanceToEdge < 0 → fell off → score = 0

### **Points per attempt (simple)**

- Max points per attempt: **100**
- Define a "scoring window" maxScorableDistance = 300 px
    - If you stop farther than this, you still get small score (or 0—choose one).
- Suggested formula:
    - If fell off: score = 0
    - Else:
        - closeness = clamp(1 - (distanceToEdge / maxScorableDistance), 0, 1)
        - score = round(100 * closeness)
- This yields:
    - Stop at edge (distanceToEdge = 0) → 100
    - Stop 150px away → ~50
    - Stop 300px+ away → 0

### **Final score**

- Sum of 10 attempt scores: totalScore = Σ attemptScore[i]

---

## **8) Terrains (10 pre-selected levels)**

Each attempt uses a terrain config that changes driving feel. Keep it deterministic, not random, so players can compare scores.

### **Terrain config fields**

Each terrain is an object like:

```
{
  id: "CRATER_DUST",
  name: "Crater Dust Flats",
  description: "Dust reduces braking grip.",
  accel: 220,                // px/s^2
  rollingResistance: 18,     // px/s^2
  brakeDecel: 320,           // px/s^2
  initialSpeed: 60,          // px/s
  background: "dust",        // used for simple visuals
  slopeZones: [
    // optional segments that modify accel/resistance
    // { fromX: 300, toX: 520, accelMult: 0.9, brakeMult: 0.8, resistAdd: 10 }
  ]
}
```

### **Slope zones (optional but fun)**

To make "slopes" without rotating sprites, use zones that modify acceleration and braking in certain x ranges:

- Downhill zone: higher effective accel, weaker braking
- Uphill zone: lower accel, stronger resistance

Implementation: each frame, compute multipliers based on rover x, e.g.

- effectiveAccel = terrain.accel * zone.accelMult
- effectiveBrake = terrain.brakeDecel * zone.brakeMult
- effectiveResistance = terrain.rollingResistance + zone.resistAdd

### **Provide exactly 10 terrains (example set)**

Use these names and vary values to make each attempt feel different:

1. **Lunar Tarmac** (baseline)
2. **Ice Shelf** (low friction: low brakeDecel)
3. **Red Sand Drift** (high rolling resistance)
4. **Crater Dust Flats** (braking weaker in dust zone)
5. **Magnetic Ridge** (odd: accel strong mid-track)
6. **Basalt Slope** (downhill near end)
7. **Updraft Plateau** (uphill mid-track)
8. **Meteor Gravel** (bumpy: resistance spikes in patches)
9. **Thin Atmosphere** (low resistance, carries speed far)
10. **Final Test Track** (hardest, mixed zones)

---

## **9) Scenes / screens (Phaser Scenes)**

Implement as separate scenes for clarity.

### **A) Boot / Preload Scene**

- Load assets (or generate simple graphics).
- Minimal: you can use Phaser Graphics rectangles for rover/track/cliff to avoid asset work.

### **B) Menu Scene**

- Title: **Planet Stop**
- Buttons:
    - "Start Run (10 Attempts)"
    - "How to Play"
- Show best score (optional: stored in localStorage)

### **C) Game Scene (core)**

UI elements:

- Attempt indicator: Attempt 3 / 10
- Terrain name: Basalt Slope
- Current speed readout: Speed: 124
- Instruction text:
    - Before braking: Press SPACE to FULL BRAKE
    - After braking: Braking…
- Cliff marker visible

End-of-attempt overlay:

- Result: Stopped! or Fell Off!
- Attempt score: Score: 72
- Distance to edge: e.g. 14px from edge
- Button: Next Attempt

### **D) Results Scene**

- Show total score
- Show attempt breakdown list:
    - Terrain name + score
- Button: "Play Again"
- Button: "Back to Menu"

---

## **10) Data persistence (optional)**

- Save bestTotalScore to localStorage.
- Save lastRun breakdown optionally.

---

## **11) File structure (simple)**

Create a small Vite project (fast dev server) OR plain HTML.

### **Recommended for speed: Vite**

```
planet-stop/
  index.html
  package.json
  vite.config.js
  src/
    main.js
    scenes/
      BootScene.js
      MenuScene.js
      GameScene.js
      ResultsScene.js
    data/
      terrains.js
    ui/
      styles.css (optional)
```

If you prefer no build tools:

```
planet-stop/
  index.html
  game.js
  terrains.js
```

---

## **12) Implementation details (must-have)**

- Use Phaser 3.
- Use fixed timestep update with dt = delta / 1000.
- Rover movement is deterministic based on terrain config.
- Input triggers brake once; ignore further presses.
- Attempt advances automatically on "Next Attempt".
- Exactly 10 attempts per run, each terrain used once in order.

---

## **13) Edge cases / rules to define clearly**

- If player never presses brake:
    - Rover will eventually fall off → score 0.
- If rover stops extremely early:
    - Score likely 0 (depending on scoring window).
- Rover "stop threshold":
    - Use v < 5 px/s to count as stopped.
- Clamp velocity to non-negative.

---

## **14) Minimal art direction (optional)**

- Rover: small rectangle with a "headlight" triangle.
- Track: grey strip; cliff edge line is bright.
- Background changes per terrain (color gradients or starfield).
- Sound (optional):
    - engine hum
    - brake screech
    - "whoosh" fall

---

## **15) Pseudocode for the Game Scene update loop**

```
update(time, delta) {
  if (attemptOver) return;
  const dt = delta / 1000;

  // Determine zone modifiers based on rover x
  const zone = getZoneModifiers(terrain, rover.x);

  const accel = terrain.accel * zone.accelMult;
  const resist = terrain.rollingResistance + zone.resistAdd;

  if (!hasBraked) {
    rover.v += accel * dt;
    rover.v -= resist * dt;
  } else {
    const brake = terrain.brakeDecel * zone.brakeMult;
    rover.v -= brake * dt;
  }

  rover.v = Math.max(0, rover.v);
  rover.x += rover.v * dt;

  // Fell off cliff
  if (rover.x >= cliffX) endAttemptFellOff();

  // Stopped safely
  if (hasBraked && rover.v < stopThreshold) endAttemptStopped();
}
```

---

## **16) What Claude Code should generate**

Ask it to generate:

1. A Phaser 3 project (Vite or plain HTML) that runs locally.
2. The four scenes (Boot/Menu/Game/Results).
3. terrains.js with the 10 terrain configs.
4. Full scoring + 10-attempt run + results breakdown.
5. Simple placeholder graphics (no external assets required).
