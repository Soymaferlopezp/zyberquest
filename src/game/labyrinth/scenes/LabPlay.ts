import * as Phaser from "phaser";
import nodesData from "../data/nodes.json";

type EduNode = { id: string; title: string; lines: string[] };

export default class LabPlay extends Phaser.Scene {
  constructor() {
    super("LabPlay");
  }

  // ===== Core / player
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: { [k: string]: Phaser.Input.Keyboard.Key };
  private baseSpeed = 130;
  private speed = 130;
  private dashSpeed = 340;
  private dashCooldownMs = 3000;
  private dashLastAt = -9999;
  private dashDurationMs = 140;
  private dashing = false;

  // ===== World
  private walls!: Phaser.Tilemaps.TilemapLayer;
  private keysGroup!: Phaser.Physics.Arcade.Group;
  private keysCollected = 0;
  private requiredKeys = 3;
  private doorTile: Phaser.Tilemaps.Tile | null = null;
  private exitSprite!: Phaser.GameObjects.Sprite;

  // ===== Time / score
  private timeLeft = 90;
  private portalsCleared = 0;
  private score = 0;

  // ===== Nodes / portals
  private nodeSprites!: Phaser.GameObjects.Group;
  private portalSprites!: Phaser.GameObjects.Group;
  private interactRadius = 26;
  private eduPanel?: Phaser.GameObjects.Container;
  private eduShade?: Phaser.GameObjects.Rectangle;
  private eduOpen = false;
  private openNodeId: string | null = null;

  // ===== Tutorial gating
  private tutorialActive = true;
  private tutorialNode!: Phaser.GameObjects.Container;
  private tutorialPulse?: Phaser.Tweens.Tween;
  private tutorialHint?: Phaser.GameObjects.Text;

  // ===== Hazards (Hito 5)
  private lasers!: Phaser.Physics.Arcade.StaticGroup;
  private lasersActive = true;
  private slowZone!: Phaser.GameObjects.Rectangle;
  private slowBounds = new Phaser.Geom.Rectangle(0, 0, 0, 0);
  private drone!: Phaser.Physics.Arcade.Sprite;
  private droneWaypoints: { x: number; y: number }[] = [];
  private droneIdx = 0;
  private droneIFramesUntil = 0;

  // ===== Overlays & lifecycle
  private introOpen = true;
  private exitPulseTween?: Phaser.Tweens.Tween;

  // ===== Retry-safe disposables
  private disposables: Array<() => void> = [];
  private timers: Phaser.Time.TimerEvent[] = [];
  private tweensLive: Phaser.Tweens.Tween[] = [];
  private glitchOverlay?: Phaser.GameObjects.Rectangle;
  private portalResultHandler?: (ok: boolean) => void;

  init() {
    // Reset explicit state for clean restarts
    this.keysCollected = 0;
    this.requiredKeys = 3;
    this.timeLeft = 90;
    this.portalsCleared = 0;
    this.score = 0;

    this.eduOpen = false;
    this.openNodeId = null;
    this.tutorialActive = true;

    this.lasersActive = true;
    this.droneIFramesUntil = 0;

    this.dashing = false;
    this.dashLastAt = -9999;

    this.glitchOverlay = undefined;
  }

  // Helpers to track timers/tweens and clean later
  private trackTimer(t: Phaser.Time.TimerEvent) {
    this.timers.push(t);
    return t;
  }
  private trackTween(t: Phaser.Tweens.Tween) {
    this.tweensLive.push(t);
    return t;
  }

  private cleanup() {
    // keyboard/input disposables
    this.disposables.forEach((fn) => {
      try {
        fn();
      } catch {}
    });
    this.disposables = [];

    // game.events (portal result)
    if (this.portalResultHandler) {
      this.game.events.off("portal:result", this.portalResultHandler);
      this.portalResultHandler = undefined;
    }

    // timers/tweens
    this.timers.forEach((t) => {
      try {
        t.remove(false);
      } catch {}
    });
    this.timers = [];
    this.tweensLive.forEach((tw) => {
      try {
        tw.stop();
      } catch {}
    });
    this.tweensLive = [];

    // overlays
    this.glitchOverlay?.destroy();
    this.glitchOverlay = undefined;

    // ensure minigame & overlays are closed
    this.scene.get("PortalMiniGame")?.scene.stop();
    this.scene.get("PauseOverlay")?.scene.stop();
  }

  create() {
    // Map & layers
    const map = this.make.tilemap({ key: "L1" });
    const tileW = map.tileWidth,
      tileH = map.tileHeight;
    const tiles = map.addTilesetImage("tiles_basic", "tiles_basic", tileW, tileH, 0, 0);
    if (!tiles) throw new Error("Tileset 'tiles_basic' not found.");
    const floor = map.createLayer("floors", tiles, 0, 0);
    const walls = map.createLayer("walls", tiles, 0, 0);
    if (!floor || !walls) throw new Error("Layers 'floors'/'walls' not found.");

    const SCALE = 2;
    floor.setScale(SCALE);
    walls.setScale(SCALE);
    this.walls = walls;
    walls.setCollision(1, true);

    // Center map
    const mapW = map.width * tileW * SCALE;
    const mapH = map.height * tileH * SCALE;
    const cam = this.cameras.main;
    const offX = Math.floor((cam.width - mapW) / 2);
    const offY = Math.floor((cam.height - mapH) / 2);
    floor.setPosition(offX, offY);
    walls.setPosition(offX, offY);

    // HUD init
    this.game.events.emit("hud:minimap:init", mapW, mapH);
    this.game.events.emit("hud:time:set", this.timeLeft);

    // Player
    const spawnX = offX + (map.width * tileW * SCALE) / 2;
    const spawnY = offY + (map.height * tileH * SCALE) / 2;
    this.player = this.physics.add.sprite(spawnX, spawnY, "player_dot").setDepth(10);
    (this.player.body as Phaser.Physics.Arcade.Body).setSize(14, 14).setOffset(2, 2);
    this.physics.add.collider(this.player, walls);

    // Input
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = {
      W: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      SPACE: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
      E: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E),
      P: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.P),
      ESC: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC),
    };

    // Door (top middle)
    const midX = Math.floor(map.width / 2);
    const maybeDoor = walls.getTileAt(midX, 0);
    if (maybeDoor && maybeDoor.index === 2) {
      this.doorTile = maybeDoor;
      walls.setCollision([1, 2], true);
    }

    // Exit ring (bottom middle)
    const exitX = offX + mapW / 2;
    const exitY = offY + mapH - 32;
    this.exitSprite = this.add.sprite(exitX, exitY, "exit_ring").setDepth(5);
    this.physics.add.existing(this.exitSprite, true);
    this.physics.add.overlap(this.player, this.exitSprite, () => {
      if (this.keysCollected >= this.requiredKeys) {
        this.scene.start("Results", {
          timeLeft: this.timeLeft,
          keys: this.keysCollected,
          portals: this.portalsCleared,
          score: this.score,
        });
      } else {
        this.game.events.emit("hud:toast", `Need more keys (${this.keysCollected}/${this.requiredKeys})`);
      }
    });

    // === Tutorial node (center) ===
    const tg = this.add.graphics().setDepth(8);
    tg.lineStyle(3, 0x00e5ff, 1).strokeCircle(0, 0, 14);
    tg.fillStyle(0x00e5ff, 0.18).fillCircle(0, 0, 12);
    this.tutorialNode = this.add.container(spawnX, spawnY - 32, [tg]);
    (this.tutorialNode as any).nodeId = "tutorial";

    this.tutorialPulse = this.trackTween(
      this.tweens.add({
        targets: this.tutorialNode,
        scaleX: { from: 1, to: 1.15 },
        scaleY: { from: 1, to: 1.15 },
        duration: 700,
        yoyo: true,
        repeat: -1,
        ease: "Sine.inOut",
      })
    );
    this.tutorialHint = this.add
      .text(this.tutorialNode.x, this.tutorialNode.y - 28, "Approach and press E", {
        color: "#00E5FF",
        fontSize: "12px",
      })
      .setOrigin(0.5)
      .setDepth(9);

    // Empty groups (spawn after tutorial)
    this.nodeSprites = this.add.group();
    this.portalSprites = this.add.group();

    // Edu panel (hidden)
    this.createEduPanel();

    // Tick timer (does NOT tick while intro/tutorial/edu are open)
    this.trackTimer(
      this.time.addEvent({
        delay: 1000,
        loop: true,
        callback: () => {
          if (this.introOpen || this.tutorialActive || this.eduOpen) return;
          this.timeLeft = Math.max(0, this.timeLeft - 1);
          this.game.events.emit("hud:time:set", this.timeLeft);
          if (this.timeLeft === 0) {
            this.game.events.emit("hud:toast", "Time up");
            this.scene.start("Results", {
              timeLeft: this.timeLeft,
              keys: this.keysCollected,
              portals: this.portalsCleared,
              score: this.score,
            });
          }
        },
      })
    );

    // Result from portal minigame (subscribe once, keep reference)
    if (this.portalResultHandler) {
      this.game.events.off("portal:result", this.portalResultHandler);
    }
    this.portalResultHandler = (ok: boolean) => {
      if (!ok) {
        const c = this.cameras.main;
        this.glitchOverlay = this.add
          .rectangle(c.width / 2, c.height / 2, c.width, c.height, 0x00e5ff, 0.06)
          .setScrollFactor(0)
          .setDepth(999);
        this.trackTween(
          this.tweens.add({
            targets: this.glitchOverlay,
            alpha: 0,
            duration: 8000,
            onComplete: () => {
              this.glitchOverlay?.destroy();
              this.glitchOverlay = undefined;
            },
          })
        );
        this.game.events.emit("hud:toast", "Glitch − vision 8s");
      } else {
        this.game.events.emit("hud:toast", "PORTAL ✓ +1 key");
        this.keysCollected++;
        this.portalsCleared++;
        this.game.events.emit("hud:set-keys", this.keysCollected);
        this.score += 40;
        this.game.events.emit("hud:set-score", this.score);
        this.tryOpenDoor();
      }
    };
    this.game.events.on("portal:result", this.portalResultHandler);

    // Pause
    const onPause = () => {
      if (this.introOpen) return;
      this.scene.launch("PauseOverlay");
      this.scene.pause();
      this.game.events.emit("hud:toast", "PAUSED");
    };
    this.input.keyboard?.on("keydown-P", onPause);
    this.disposables.push(() => this.input.keyboard?.off("keydown-P", onPause));

    // Scene lifecycle cleanup
    this.events.once("shutdown", () => this.cleanup());
    this.events.once("destroy", () => this.cleanup());

    // Intro overlay (scene-level)
    this.createIntroPanel();
  }

  update() {
    if (this.introOpen) return;

    // If edu panel is open, allow closing with E/Space
    if (this.eduOpen) {
      if (Phaser.Input.Keyboard.JustDown(this.wasd.E) || Phaser.Input.Keyboard.JustDown(this.wasd.SPACE)) {
        this.closeEduPanel();
      }
      return;
    }

    const body = this.player.body as Phaser.Physics.Arcade.Body;

    // === Tutorial mode (movement enabled, no hazards/time) ===
    if (this.tutorialActive) {
      // movement
      let vx = 0,
        vy = 0;
      const up = this.cursors.up?.isDown || this.wasd.W.isDown;
      const down = this.cursors.down?.isDown || this.wasd.S.isDown;
      const left = this.cursors.left?.isDown || this.wasd.A.isDown;
      const right = this.cursors.right?.isDown || this.wasd.D.isDown;
      if (up) vy -= 1;
      if (down) vy += 1;
      if (left) vx -= 1;
      if (right) vx += 1;

      const speed = this.dashing ? this.dashSpeed : this.baseSpeed;
      const len = Math.hypot(vx, vy) || 1;
      body.setVelocity((vx / len) * speed, (vy / len) * speed);

      // dash
      const now = this.time.now;
      if (Phaser.Input.Keyboard.JustDown(this.wasd.SPACE) && now - this.dashLastAt >= this.dashCooldownMs) {
        this.dashing = true;
        this.dashLastAt = now;
        this.time.delayedCall(this.dashDurationMs, () => (this.dashing = false));
      }
      const ratio = Phaser.Math.Clamp((now - this.dashLastAt) / this.dashCooldownMs, 0, 1);
      this.game.events.emit("hud:set-dash", ratio);

      // interact with tutorial node
      const dx = this.player.x - this.tutorialNode.x;
      const dy = this.player.y - this.tutorialNode.y;
      if (Math.hypot(dx, dy) <= this.interactRadius && Phaser.Input.Keyboard.JustDown(this.wasd.E)) {
        this.showEduPanel({
          id: "tutorial",
          title: "Tutorial — What’s the goal?",
          lines: [
            "Read short privacy/Zcash pills at cyan nodes (press E).",
            "Collect 3 keys to open the top door and reach the cyan ring (exit).",
            "Optional portal: solve the Caesar shift for bonus. Avoid lasers and drone.",
          ],
        });
        this.openNodeId = "tutorial";
      }

      // minimap update
      this.game.events.emit(
        "hud:minimap:update",
        this.player.x - this.cameras.main.scrollX,
        this.player.y - this.cameras.main.scrollY
      );
      return;
    }

    // === Normal gameplay ===
    // slow zone
    const pInSlow = this.slowBounds.contains(this.player.x, this.player.y);
    this.speed = this.baseSpeed * (pInSlow ? 0.6 : 1);

    // movement
    let vx = 0,
      vy = 0;
    const up = this.cursors.up?.isDown || this.wasd.W.isDown;
    const down = this.cursors.down?.isDown || this.wasd.S.isDown;
    const left = this.cursors.left?.isDown || this.wasd.A.isDown;
    const right = this.cursors.right?.isDown || this.wasd.D.isDown;
    if (up) vy -= 1;
    if (down) vy += 1;
    if (left) vx -= 1;
    if (right) vx += 1;

    const speed = this.dashing ? this.dashSpeed : this.speed;
    const len = Math.hypot(vx, vy) || 1;
    body.setVelocity((vx / len) * speed, (vy / len) * speed);

    // dash
    const now = this.time.now;
    if (Phaser.Input.Keyboard.JustDown(this.wasd.SPACE) && now - this.dashLastAt >= this.dashCooldownMs) {
      this.dashing = true;
      this.dashLastAt = now;
      this.time.delayedCall(this.dashDurationMs, () => (this.dashing = false));
    }
    const ratio = Phaser.Math.Clamp((now - this.dashLastAt) / this.dashCooldownMs, 0, 1);
    this.game.events.emit("hud:set-dash", ratio);

    // Interaction E
    if (Phaser.Input.Keyboard.JustDown(this.wasd.E)) {
      if (this.tryOpenNode()) return;
      if (this.tryEnterPortal()) return;
    }

    // Open door if ready
    this.tryOpenDoor();

    // minimap
    this.game.events.emit(
      "hud:minimap:update",
      this.player.x - this.cameras.main.scrollX,
      this.player.y - this.cameras.main.scrollY
    );
  }

  // ===== Gameplay spawn after tutorial
  private spawnGameplay() {
    this.tutorialActive = false;
    this.tutorialPulse?.stop();
    this.tutorialNode.destroy();
    this.tutorialHint?.destroy();

    // Keys
    this.keysGroup = this.physics.add.group();
    const bounds = this.walls;
    const offX = bounds.x;
    const offY = bounds.y;
    const mapW = bounds.width;
    const mapH = bounds.height;

    const keyPositions = [
      { x: offX + 60, y: offY + 60 },
      { x: offX + mapW - 60, y: offY + 60 },
      { x: offX + mapW / 2, y: offY + mapH - 60 },
    ];
    keyPositions.forEach((p) => {
      const s = this.physics.add.sprite(p.x, p.y, "key_coin");
      s.setCircle(6, 2, 2);
      (s.body as Phaser.Physics.Arcade.Body).setImmovable(true);
      this.keysGroup.add(s);
    });
    this.physics.add.overlap(this.player, this.keysGroup, (_pl, keyObj) => {
      const s = keyObj as Phaser.Physics.Arcade.Sprite;
      s.disableBody(true, true);
      this.keysCollected++;
      this.game.events.emit("hud:set-keys", this.keysCollected);
      this.game.events.emit("hud:toast", "KEY +1");
      this.score += 25;
      this.game.events.emit("hud:set-score", this.score);
      this.tryOpenDoor();
    });

    // Nodes (besides tutorial)
    this.nodeSprites = this.add.group();
    const nodes: EduNode[] = nodesData as EduNode[];
    const nodePositions = [
      { x: offX + 120, y: offY + 120, id: nodes[0]?.id ?? "n1" },
      { x: offX + mapW - 120, y: offY + 140, id: nodes[1]?.id ?? "n2" },
    ];
    nodePositions.forEach((p, i) => {
      const g = this.add.graphics().setDepth(8);
      g.fillStyle(0x00e5ff, 0.18).fillCircle(0, 0, 10).lineStyle(2, 0x00e5ff, 1).strokeCircle(0, 0, 10);
      const c = this.add.container(p.x, p.y, [g]);
      (c as any).nodeId = nodePositions[i].id;
      this.nodeSprites.add(c);
    });

    // Portal
    this.portalSprites = this.add.group();
    const portalHalo = this.add.graphics().setDepth(7);
    portalHalo.lineStyle(2, 0x00e5ff, 1).strokeCircle(0, 0, 12);
    const portalC = this.add.container(offX + mapW / 2, offY + mapH / 2 + 60, [portalHalo]);
    this.portalSprites.add(portalC);

    // Lasers
    this.lasers = this.physics.add.staticGroup();
    const laserY = offY + 110;
    const laserXs = [offX + 120, offX + mapW / 2 - 32, offX + mapW - 120 - 64];
    laserXs.forEach((x) => {
      const seg = this.physics.add.staticSprite(x, laserY, "laser_seg").setOrigin(0, 0.5);
      this.lasers.add(seg);
    });
    this.trackTimer(
      this.time.addEvent({
        delay: 900,
        loop: true,
        callback: () => {
          this.lasersActive = !this.lasersActive;
          this.lasers.getChildren().forEach((obj) => {
            (obj as Phaser.Physics.Arcade.Sprite).setAlpha(this.lasersActive ? 1 : 0.15);
          });
        },
      })
    );
    this.physics.add.overlap(this.player, this.lasers, () => {
      if (!this.lasersActive) return;
      this.hitPenalty(-6, "LASER −6s");
      const body = this.player.body as Phaser.Physics.Arcade.Body;
      body.velocity.scale(0.4);
    });

    // Slow zone
    const szW = 180,
      szH = 100;
    const szX = offX + mapW / 2 - szW / 2;
    const szY = offY + mapH / 2 - 20;
    this.slowZone = this.add
      .rectangle(szX, szY, szW, szH, 0x00e5ff, 0.05)
      .setOrigin(0, 0)
      .setDepth(3);
    this.add
      .rectangle(szX, szY, szW, szH)
      .setOrigin(0, 0)
      .setStrokeStyle(1, 0x00e5ff, 0.35)
      .setDepth(3);
    this.slowBounds.setTo(szX, szY, szW, szH);

    // Drone
    this.drone = this.physics.add.sprite(offX + 80, offY + mapH / 2, "drone_bot").setDepth(6);
    (this.drone.body as Phaser.Physics.Arcade.Body).setCircle(7, 1, 1).setImmovable(true);
    this.droneWaypoints = [
      { x: offX + 80, y: offY + mapH / 2 - 80 },
      { x: offX + mapW - 80, y: offY + mapH / 2 - 80 },
      { x: offX + mapW - 80, y: offY + mapH / 2 + 40 },
      { x: offX + 80, y: offY + mapH / 2 + 40 },
    ];
    this.droneIdx = 0;
    this.moveDroneToNext();
    this.physics.add.overlap(this.player, this.drone, () => {
      if (this.time.now < this.droneIFramesUntil) return;
      this.droneIFramesUntil = this.time.now + 800;
      this.hitPenalty(-8, "DRONE −8s");
      const body = this.player.body as Phaser.Physics.Arcade.Body;
      body.velocity.scale(0.3);
      this.cameras.main.shake(120, 0.004);
    });

    // Guide and start time on next tick
    this.game.events.emit("hud:toast", "Explore, collect 3 keys, and reach the cyan ring (exit)");
  }

  private tryOpenDoor(): void {
    if (this.doorTile === null) return;
    if (this.keysCollected < this.requiredKeys) return;
    this.doorTile.index = 0;
    this.walls.setCollision([1], true);
    this.game.events.emit("hud:toast", "ACCESS GRANTED → head to the cyan ring (exit)");
    this.exitPulseTween?.stop();
    this.exitSprite.setAlpha(1);
    this.exitPulseTween = this.trackTween(
      this.tweens.add({
        targets: this.exitSprite,
        alpha: { from: 1, to: 0.35 },
        duration: 500,
        yoyo: true,
        repeat: -1,
        ease: "Sine.inOut",
      })
    );
    this.doorTile = null;
  }

  private tryOpenNode(): boolean {
    const px = this.player.x,
      py = this.player.y;
    const children = this.nodeSprites.getChildren();
    for (const obj of children) {
      const c = obj as Phaser.GameObjects.Container;
      const dx = c.x - px,
        dy = c.y - py;
      if (Math.hypot(dx, dy) <= this.interactRadius) {
        const arr = nodesData as EduNode[];
        const data = arr.find((n) => n.id === (c as any).nodeId) ?? arr[0];
        this.showEduPanel(data);
        this.openNodeId = (c as any).nodeId || null;
        return true;
      }
    }
    return false;
  }

  private tryEnterPortal(): boolean {
    const px = this.player.x,
      py = this.player.y;
    const children = this.portalSprites.getChildren();
    for (const obj of children) {
      const c = obj as Phaser.GameObjects.Container;
      const dx = c.x - px,
        dy = c.y - py;
      if (Math.hypot(dx, dy) <= this.interactRadius) {
        this.scene.launch("PortalMiniGame", { phrase: "PRIVACY", seconds: 20 });
        return true;
      }
    }
    return false;
  }

  private createEduPanel() {
    const cam = this.cameras.main;
    const w = 440,
      h = 170;
    this.eduShade = this.add
      .rectangle(cam.width / 2, cam.height / 2, cam.width, cam.height, 0x000000, 0.45)
      .setScrollFactor(0)
      .setDepth(499)
      .setVisible(false)
      .setInteractive();
    const bg = this.add.rectangle(0, 0, w, h, 0x000000, 0.82).setStrokeStyle(2, 0xf4b728).setOrigin(0.5);
    const title = this.add.text(0, -h / 2 + 16, "", { color: "#00FF9C", fontSize: "16px" }).setOrigin(0.5, 0);
    const body = this.add
      .text(0, -h / 2 + 42, "", { color: "#E6FFE6", fontSize: "14px", wordWrap: { width: w - 32 } })
      .setOrigin(0.5, 0);
    const hint = this.add
      .text(0, h / 2 - 18, "Press E or click outside to close", { color: "#9FE870", fontSize: "12px" })
      .setOrigin(0.5, 1);
    const panel = this.add
      .container(cam.width / 2, cam.height / 2, [bg, title, body, hint])
      .setDepth(500)
      .setScrollFactor(0);
    panel.setVisible(false);
    this.eduPanel = panel;

    // Close on click
    this.eduShade.on("pointerdown", () => this.closeEduPanel());
    panel
      .setInteractive(new Phaser.Geom.Rectangle(-w / 2, -h / 2, w, h), Phaser.Geom.Rectangle.Contains)
      .on("pointerdown", () => this.closeEduPanel());

    (panel as any).setContent = (t: string, lines: string[]) => {
      title.setText(t);
      body.setText(lines.join("\n"));
    };
  }

  private showEduPanel(node: EduNode) {
    if (!this.eduPanel) return;
    (this.eduPanel as any).setContent(node.title, node.lines);
    this.eduShade?.setVisible(true);
    this.eduPanel.setVisible(true);
    this.eduOpen = true;
  }

  private closeEduPanel() {
    if (!this.eduOpen) return;
    this.eduShade?.setVisible(false);
    this.eduPanel?.setVisible(false);
    this.eduOpen = false;

    // If was tutorial, spawn gameplay
    if (this.openNodeId === "tutorial") {
      this.openNodeId = null;
      this.spawnGameplay();
      this.game.events.emit("hud:toast", "Tutorial ✓ — Timer is now running!");
    } else {
      this.openNodeId = null;
    }
  }

  private hitPenalty(deltaSeconds: number, toast: string) {
    this.timeLeft = Math.max(0, this.timeLeft + deltaSeconds);
    this.game.events.emit("hud:time:set", this.timeLeft);
    this.game.events.emit("hud:toast", toast);
    this.cameras.main.flash(90, 244, 183, 40);
  }

  private moveDroneToNext() {
    const next = this.droneWaypoints[this.droneIdx];
    this.droneIdx = (this.droneIdx + 1) % this.droneWaypoints.length;
    this.trackTween(
      this.tweens.add({
        targets: this.drone,
        x: next.x,
        y: next.y,
        duration: 1800,
        ease: "Sine.inOut",
        onComplete: () => this.moveDroneToNext(),
      })
    );
  }

  // Scene intro
  private createIntroPanel() {
    const cam = this.cameras.main;
    const w = 560,
      h = 300;

    const bg = this.add
      .rectangle(cam.width / 2, cam.height / 2, cam.width, cam.height, 0x000000, 0.6)
      .setScrollFactor(0)
      .setDepth(800)
      .setInteractive({ useHandCursor: true });
    const card = this.add
      .rectangle(cam.width / 2, cam.height / 2, w, h, 0x0a0d0a, 0.96)
      .setStrokeStyle(2, 0x00e5ff)
      .setScrollFactor(0)
      .setDepth(801);

    const title = this.add
      .text(cam.width / 2, cam.height / 2 - h / 2 + 16, "Mission: Explore the Privacy Maze", {
        color: "#00FF9C",
        fontSize: "18px",
        align: "center",
        wordWrap: { width: w - 32 },
      })
      .setOrigin(0.5, 0)
      .setDepth(802);

    const lines = [
      "First: interact with the central cyan node (E).",
      "Then: collect 3 keys to open the top door and reach the cyan ring (exit).",
      "Optional: Portal (E) — solve the Caesar shift (A/D or ←/→) for bonus. Avoid lasers and drone.",
      "Time starts after you finish the tutorial.",
    ];
    const body = this.add
      .text(cam.width / 2, title.y + 40, lines.join("\n"), {
        color: "#E6FFE6",
        fontSize: "14px",
        align: "left",
        wordWrap: { width: w - 40 },
      })
      .setOrigin(0.5, 0)
      .setDepth(802);

    const btn = this.add
      .rectangle(cam.width / 2, cam.height / 2 + h / 2 - 28, 180, 34, 0x111111, 1)
      .setStrokeStyle(2, 0xf4b728)
      .setScrollFactor(0)
      .setDepth(802)
      .setInteractive({ useHandCursor: true });
    const txt = this.add
      .text(btn.x, btn.y, "Okay / Start", { color: "#E6FFE6", fontSize: "16px" })
      .setOrigin(0.5)
      .setDepth(803);
    const xBtn = this.add
      .text(card.x + w / 2 - 18, card.y - h / 2 + 10, "✕", { color: "#F4B728", fontSize: "18px" })
      .setDepth(803)
      .setInteractive({ useHandCursor: true });

    const close = () => {
      [bg, card, title, body, btn, txt, xBtn].forEach((g) => g.destroy());
      this.introOpen = false;
      this.game.events.emit("hud:toast", "Find the central cyan node and press E");
    };

    bg.on("pointerdown", close);
    btn.on("pointerdown", close);
    btn.on("pointerover", () => btn.setAlpha(0.9));
    btn.on("pointerout", () => btn.setAlpha(1));
    xBtn.on("pointerdown", close);
    this.input.keyboard?.once("keydown-ENTER", close);
    this.input.keyboard?.once("keydown-SPACE", close);
    this.input.keyboard?.once("keydown-ESC", close);
  }
}
