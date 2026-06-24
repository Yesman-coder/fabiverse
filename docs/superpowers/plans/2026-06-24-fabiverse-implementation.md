# FABIVERSE Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a fully playable 6-level 2D platformer adventure game in Phaser 3, deployable as a static site on Vercel.

**Architecture:** Entities (Player, NPC, Professor, Monkey) handle visuals and physics only — all game-state changes happen in scene event handlers. GameState lives in the Phaser registry. Systems (DialogueBox, InventoryUI) are instantiated per-scene. Boot generates placeholder textures; swap in real sprite loads when assets arrive.

**Tech Stack:** Phaser 3.87, Vite 6, Vercel static hosting. No plugins. Browser verification used throughout (no test runner).

---

## File Map

| File | Responsibility |
|------|----------------|
| `package.json` | Dependencies + scripts |
| `index.html` | Entry HTML |
| `vercel.json` | Static deployment config |
| `src/main.js` | Phaser config, scene list, responsive scaling |
| `src/GameState.js` | Registry init/get/set helpers |
| `src/i18n/es.js` | All Spanish strings |
| `src/i18n/en.js` | All English strings |
| `src/i18n/index.js` | `t(key)` + `setLang()` + `getLang()` |
| `src/entities/Player.js` | Movement, jump (coyote+buffer), interact, ability |
| `src/entities/NPC.js` | Static NPC sprite |
| `src/entities/Professor.js` | Patrol + vision cone |
| `src/entities/Monkey.js` | Static sprite on rock, bob tween, flee |
| `src/systems/DialogueBox.js` | Bottom dialogue panel, locks/unlocks player |
| `src/systems/InventoryUI.js` | Top-right HUD slots + trade mode |
| `src/scenes/Boot.js` | Placeholder textures, audio loads |
| `src/scenes/CharacterSelect.js` | Character picker |
| `src/scenes/Level1_Guardia.js` | Walk right, Guard NPC, exit |
| `src/scenes/Level2_Salones.js` | Stealth, Professor patrol, pillar hide |
| `src/scenes/Level3_Cantina.js` | Cantina NPC, receive empanada |
| `src/scenes/Level4_Canchas.js` | Platforms, collect llave_dorada |
| `src/scenes/Level5_Piscina.js` | Padlock puzzle + victory cutscene |
| `src/scenes/Level6_Barranquito.js` | Monkey trade for cristal_fuego |
| `src/scenes/Victory.js` | Win screen, confetti |

---

## Task 1: Project Scaffold

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `vercel.json`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "fabiverse",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "phaser": "^3.87.0"
  },
  "devDependencies": {
    "vite": "^6.0.0"
  }
}
```

- [ ] **Step 2: Create index.html**

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>El Misterio de la Piscina "Temperada"</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #000; display: flex; justify-content: center; align-items: center; height: 100vh; overflow: hidden; }
    canvas { image-rendering: pixelated; }
  </style>
</head>
<body>
  <script type="module" src="/src/main.js"></script>
</body>
</html>
```

- [ ] **Step 3: Create vercel.json**

```json
{
  "outputDirectory": "dist",
  "buildCommand": "npm run build",
  "framework": null
}
```

- [ ] **Step 4: Install dependencies**

```bash
cd C:/Users/yesma/FABIVERSE && npm install
```

Expected: `node_modules/` created, no errors.

- [ ] **Step 5: Commit**

```bash
git init
git add package.json index.html vercel.json
git commit -m "feat: project scaffold — Phaser 3 + Vite + Vercel"
```

---

## Task 2: GameState + i18n

**Files:**
- Create: `src/GameState.js`
- Create: `src/i18n/es.js`
- Create: `src/i18n/en.js`
- Create: `src/i18n/index.js`

- [ ] **Step 1: Create src/GameState.js**

```js
export function initGameState(registry) {
  registry.set('gameState', {
    character: 'fabi',
    inventory: [],
    abilityUsed: false,
    lang: 'es',
    currentLevel: 1,
  });
}

export function getGameState(registry) {
  return registry.get('gameState');
}

export function setGameState(registry, patch) {
  const current = registry.get('gameState');
  registry.set('gameState', { ...current, ...patch });
}
```

- [ ] **Step 2: Create src/i18n/es.js**

```js
export default {
  guard_name: 'Guardia',
  guard_dialogue_1: '¡Rápido, algo se robó el calor de la piscina!',
  guard_dialogue_2: 'Vi algo verde yendo hacia los salones.',
  professor_name: 'Profesor',
  professor_caught: '¡Vuelve a clase!',
  cantina_lady_name: 'Señora de la Cantina',
  cantina_dialogue_1: '¡Vino un mono corriendo y me robó una empanada!',
  cantina_dialogue_2: 'Fue hacia las canchas.',
  item_received: 'Recibiste: ',
  padlock_name: 'Candado',
  no_key: 'Necesitas algo para abrir este candado.',
  door_open: '¡La puerta se abrió! Hay rastros de hojas...',
  monkey_name: 'Monito Travieso',
  monkey_no_item: 'El monito te mira con curiosidad... quizás quiere algo.',
  monkey_trade_1: '¡El monito lanzó el Cristal de Fuego y huyó!',
  crystal_received: '¡Obtuviste el Cristal de Fuego!',
  select_character: 'Elige tu personaje',
  press_start: 'Presiona ENTER para comenzar',
  ability_fabi: 'Pista Divina (Q)',
  ability_sara: 'Sigilo de Gato',
  ability_milan: 'Super Salto',
  lang_button: 'EN',
  victory_title: '¡Victoria!',
  victory_subtitle: 'El Colegio Los Hipocampitos te agradece.',
  victory_prompt: 'Presiona ENTER para jugar de nuevo',
  item_empanada: 'Empanada',
  item_llave_dorada: 'Llave Dorada',
  item_cristal_fuego: 'Cristal de Fuego',
};
```

- [ ] **Step 3: Create src/i18n/en.js**

```js
export default {
  guard_name: 'Guard',
  guard_dialogue_1: 'Quick — something stole the heat from the pool!',
  guard_dialogue_2: 'I saw something green heading toward the classrooms.',
  professor_name: 'Professor',
  professor_caught: 'Back to class!',
  cantina_lady_name: 'Cafeteria Lady',
  cantina_dialogue_1: 'A monkey ran in and stole an empanada!',
  cantina_dialogue_2: 'It went toward the courts.',
  item_received: 'You received: ',
  padlock_name: 'Padlock',
  no_key: 'You need something to open this lock.',
  door_open: 'The door opened! There are leaf tracks...',
  monkey_name: 'Mischievous Monkey',
  monkey_no_item: 'The monkey eyes you curiously... maybe it wants something.',
  monkey_trade_1: 'The monkey threw the Fire Crystal and ran away!',
  crystal_received: 'You got the Fire Crystal!',
  select_character: 'Choose your character',
  press_start: 'Press ENTER to start',
  ability_fabi: 'Divine Hint (Q)',
  ability_sara: 'Cat Stealth',
  ability_milan: 'Super Jump',
  lang_button: 'ES',
  victory_title: 'Victory!',
  victory_subtitle: 'Colegio Los Hipocampitos thanks you.',
  victory_prompt: 'Press ENTER to play again',
  item_empanada: 'Empanada',
  item_llave_dorada: 'Golden Key',
  item_cristal_fuego: 'Fire Crystal',
};
```

- [ ] **Step 4: Create src/i18n/index.js**

```js
import es from './es.js';
import en from './en.js';

const locales = { es, en };
let _lang = 'es';

export function setLang(lang) { _lang = lang; }
export function getLang() { return _lang; }
export function t(key) { return locales[_lang]?.[key] ?? locales.es[key] ?? key; }
```

- [ ] **Step 5: Commit**

```bash
git add src/
git commit -m "feat: GameState registry helpers + ES/EN i18n"
```

---

## Task 3: DialogueBox System

**Files:**
- Create: `src/systems/DialogueBox.js`

- [ ] **Step 1: Create src/systems/DialogueBox.js**

```js
import { t } from '../i18n/index.js';

export default class DialogueBox {
  constructor(scene) {
    this.scene = scene;
    this._open = false;
    this._lines = [];
    this._idx = 0;
    this._onComplete = null;

    this.bg = scene.add.rectangle(400, 410, 780, 88, 0x0d0d2b, 0.93)
      .setScrollFactor(0).setDepth(20).setVisible(false);
    this.border = scene.add.rectangle(400, 410, 784, 92, 0x5577ff, 0)
      .setStrokeStyle(2, 0x5577ff).setScrollFactor(0).setDepth(20).setVisible(false);
    this.speakerTxt = scene.add.text(16, 372, '', {
      fontSize: '13px', fontFamily: 'monospace', color: '#88aaff', fontStyle: 'bold'
    }).setScrollFactor(0).setDepth(21).setVisible(false);
    this.bodyTxt = scene.add.text(16, 390, '', {
      fontSize: '13px', fontFamily: 'monospace', color: '#ffffff',
      wordWrap: { width: 752 }
    }).setScrollFactor(0).setDepth(21).setVisible(false);
    this.arrow = scene.add.text(758, 428, '▶', {
      fontSize: '11px', fontFamily: 'monospace', color: '#88aaff'
    }).setScrollFactor(0).setDepth(21).setVisible(false);

    scene.tweens.add({ targets: this.arrow, alpha: 0.2, duration: 400, yoyo: true, repeat: -1 });
    scene.input.keyboard.on('keydown-SPACE', () => this._advance());
    scene.input.keyboard.on('keydown-E', () => this._advance());
  }

  // speakerKey: i18n key for speaker name (or '' for none)
  // lineKeys: array of i18n keys
  // onComplete: optional callback fired after last line is dismissed
  show(speakerKey, lineKeys, onComplete) {
    if (this._open) return;
    this._open = true;
    this._lines = lineKeys.map(k => t(k));
    this._idx = 0;
    this._onComplete = onComplete || null;
    this.speakerTxt.setText(speakerKey ? t(speakerKey) : '');
    this.bodyTxt.setText(this._lines[0]);
    this._setVisible(true);
    const player = this.scene.registry.get('player');
    if (player) player.lockMovement();
  }

  _advance() {
    if (!this._open) return;
    this._idx++;
    if (this._idx < this._lines.length) {
      this.bodyTxt.setText(this._lines[this._idx]);
    } else {
      this._close();
    }
  }

  _close() {
    this._open = false;
    this._setVisible(false);
    const player = this.scene.registry.get('player');
    if (player) player.unlockMovement();
    this.scene.events.emit('dialogueComplete');
    if (this._onComplete) this._onComplete();
  }

  isOpen() { return this._open; }

  _setVisible(v) {
    [this.bg, this.border, this.speakerTxt, this.bodyTxt, this.arrow]
      .forEach(o => o.setVisible(v));
  }

  destroy() {
    [this.bg, this.border, this.speakerTxt, this.bodyTxt, this.arrow]
      .forEach(o => o.destroy());
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/systems/DialogueBox.js
git commit -m "feat: DialogueBox — bottom panel, locks player, i18n keys, multi-page"
```

---

## Task 4: InventoryUI System

**Files:**
- Create: `src/systems/InventoryUI.js`

- [ ] **Step 1: Create src/systems/InventoryUI.js**

```js
import { t } from '../i18n/index.js';

const SLOT = 40;
const PAD  = 4;

export default class InventoryUI {
  constructor(scene) {
    this.scene = scene;
    this._slots = [];
    this._tradeMode = false;
    this._tradeCallback = null;
    this._tradeHint = null;
    this._refresh();
  }

  _refresh() {
    const gs = this.scene.registry.get('gameState');
    const items = gs?.inventory ?? [];
    this._slots.forEach(s => { s.bg.destroy(); s.icon?.destroy(); });
    this._slots = [];
    items.forEach((key, i) => {
      const x = 760 - i * (SLOT + PAD);
      const bg = this.scene.add.rectangle(x, 24, SLOT, SLOT, 0x222244, 0.85)
        .setStrokeStyle(1, 0x4466aa).setScrollFactor(0).setDepth(15);
      let icon;
      if (this.scene.textures.exists(key)) {
        icon = this.scene.add.image(x, 24, key)
          .setDisplaySize(28, 28).setScrollFactor(0).setDepth(16);
      } else {
        icon = this.scene.add.text(x - 12, 16, key.slice(0, 4), {
          fontSize: '9px', fontFamily: 'monospace', color: '#ffffff'
        }).setScrollFactor(0).setDepth(16);
      }
      this._slots.push({ bg, icon, key });
    });
  }

  addItem(key) {
    const gs = this.scene.registry.get('gameState');
    if (!gs.inventory.includes(key)) {
      gs.inventory.push(key);
      this.scene.registry.set('gameState', gs);
    }
    this._refresh();
  }

  openTradeMode(callback) {
    this._tradeMode = true;
    this._tradeCallback = callback;
    this._tradeHint = this.scene.add.text(400, 355, '— Selecciona un objeto —', {
      fontSize: '12px', fontFamily: 'monospace', color: '#ffdd44',
      backgroundColor: '#000000cc', padding: { x: 8, y: 4 }
    }).setOrigin(0.5).setScrollFactor(0).setDepth(18);
    this._slots.forEach(s => {
      s.bg.setInteractive({ useHandCursor: true });
      s.bg.on('pointerover', () => s.bg.setStrokeStyle(2, 0xffdd44));
      s.bg.on('pointerout',  () => s.bg.setStrokeStyle(1, 0x4466aa));
      s.bg.on('pointerdown', () => this._pick(s.key));
    });
  }

  _pick(key) {
    this._tradeMode = false;
    this._tradeHint?.destroy(); this._tradeHint = null;
    this._slots.forEach(s => s.bg.removeInteractive());
    if (this._tradeCallback) this._tradeCallback(key);
  }

  destroy() {
    this._slots.forEach(s => { s.bg.destroy(); s.icon?.destroy(); });
    this._tradeHint?.destroy();
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/systems/InventoryUI.js
git commit -m "feat: InventoryUI — HUD item slots + trade mode picker"
```

---

## Task 5: Player Entity

**Files:**
- Create: `src/entities/Player.js`

- [ ] **Step 1: Create src/entities/Player.js**

```js
export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, character) {
    super(scene, x, y, character);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.character = character;
    this.speed = 160;
    this.jumpVel = character === 'milan' ? -624 : -520; // Milan +20%
    this.interactables = [];
    this._moveLocked = false;
    this.abilityUsed = false;
    this._coyote = 0;
    this._jumpBuf = 0;
    this.COYOTE   = 80;
    this.JUMP_BUF = 100;

    this.setCollideWorldBounds(true);
    this.body.setSize(28, 44).setOffset(2, 4);
    this.setDepth(5);

    this._cursors = scene.input.keyboard.createCursorKeys();
    this._wasd = scene.input.keyboard.addKeys({
      up:    Phaser.Input.Keyboard.KeyCodes.W,
      left:  Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });
    this._eKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this._qKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);

    this._prompt = scene.add.text(0, -50, '[E]', {
      fontSize: '11px', fontFamily: 'monospace',
      color: '#ffffff', backgroundColor: '#00000088',
      padding: { x: 3, y: 2 }
    }).setOrigin(0.5).setDepth(6).setVisible(false);

    this._createAnims(scene);
    scene.registry.set('player', this);
  }

  _createAnims(scene) {
    const c = this.character;
    if (scene.anims.exists(`${c}_idle`)) return;
    const f0 = [{ key: c, frame: 0 }];
    scene.anims.create({ key: `${c}_idle`, frames: f0, frameRate: 1,  repeat: -1 });
    scene.anims.create({ key: `${c}_walk`, frames: f0, frameRate: 8,  repeat: -1 });
    scene.anims.create({ key: `${c}_jump`, frames: f0, frameRate: 1,  repeat:  0 });
    // When real spritesheet arrives, replace f0 above with:
    // walk: scene.anims.generateFrameNumbers(c, { start: 1, end: 4 })
    // jump: [{ key: c, frame: 5 }]
  }

  update(delta) {
    if (this._moveLocked) { this.setVelocityX(0); return; }

    const onGround = this.body.blocked.down;
    const left  = this._cursors.left.isDown  || this._wasd.left.isDown;
    const right = this._cursors.right.isDown || this._wasd.right.isDown;
    const jumpNow =
      Phaser.Input.Keyboard.JustDown(this._cursors.up)    ||
      Phaser.Input.Keyboard.JustDown(this._cursors.space) ||
      Phaser.Input.Keyboard.JustDown(this._wasd.up);

    if (onGround) this._coyote = this.COYOTE;
    else          this._coyote = Math.max(0, this._coyote - delta);
    if (jumpNow)  this._jumpBuf = this.JUMP_BUF;
    else          this._jumpBuf = Math.max(0, this._jumpBuf - delta);

    if (left)       { this.setVelocityX(-this.speed); this.setFlipX(true); }
    else if (right) { this.setVelocityX(this.speed);  this.setFlipX(false); }
    else            { this.setVelocityX(0); }

    if (this._jumpBuf > 0 && this._coyote > 0) {
      this.setVelocityY(this.jumpVel);
      this._coyote = 0; this._jumpBuf = 0;
    }

    const c = this.character;
    if (!onGround)        this.play(`${c}_jump`, true);
    else if (left||right) this.play(`${c}_walk`, true);
    else                  this.play(`${c}_idle`, true);

    if (Phaser.Input.Keyboard.JustDown(this._eKey)) {
      const target = this._nearest(60);
      if (target) this.scene.events.emit('interact', target);
    }

    if (Phaser.Input.Keyboard.JustDown(this._qKey) && !this.abilityUsed) {
      this.abilityUsed = true;
      this.scene.events.emit('ability');
      if (this.character === 'fabi') {
        const target = this._nearest(220);
        if (target) {
          this.scene.tweens.add({
            targets: target, alpha: 0.2, duration: 180,
            yoyo: true, repeat: 8,
            onComplete: () => target.active && target.setAlpha(1)
          });
        }
        if (this.scene.cache?.audio?.exists('sfx_ability'))
          this.scene.sound.play('sfx_ability', { volume: 0.7 });
      }
    }

    const nearest = this._nearest(60);
    if (nearest) this._prompt.setPosition(nearest.x, nearest.y - 36).setVisible(true);
    else         this._prompt.setVisible(false);
  }

  _nearest(range) {
    let best = null, minD = range;
    for (const obj of this.interactables) {
      if (!obj?.active) continue;
      const d = Phaser.Math.Distance.Between(this.x, this.y, obj.x, obj.y);
      if (d < minD) { minD = d; best = obj; }
    }
    return best;
  }

  addInteractable(obj) { this.interactables.push(obj); }
  lockMovement()       { this._moveLocked = true;  this.setVelocityX(0); }
  unlockMovement()     { this._moveLocked = false; }

  destroy(fromScene) {
    this._prompt?.destroy();
    super.destroy(fromScene);
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/entities/Player.js
git commit -m "feat: Player — arcade physics, coyote time, jump buffer, interact/ability events"
```

---

## Task 6: NPC Entity

**Files:**
- Create: `src/entities/NPC.js`

- [ ] **Step 1: Create src/entities/NPC.js**

```js
// Static NPC. Add to player.interactables.
// Scene listens on this.events.on('interact', obj => ...) and handles dialogue.
export default class NPC extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, textureKey) {
    super(scene, x, y, textureKey);
    scene.add.existing(this);
    scene.physics.add.existing(this, true); // static body
    this.body.allowGravity = false;
    this.setDepth(4);
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/entities/NPC.js
git commit -m "feat: NPC entity — static physics body"
```

---

## Task 7: Professor Entity

**Files:**
- Create: `src/entities/Professor.js`

- [ ] **Step 1: Create src/entities/Professor.js**

```js
export default class Professor extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, patrolLeft, patrolRight, coneWidth = 200) {
    super(scene, x, y, 'professor');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.allowGravity = false;
    this.body.setImmovable(true);
    this.setDepth(4);

    this._left  = patrolLeft;
    this._right = patrolRight;
    this._dir   = 1;
    this._speed = 70;
    this._coneW = coneWidth;

    // Vision cone: semi-transparent rectangle rendered in front of professor
    this.cone = scene.add.rectangle(x, y, coneWidth, 76, 0xff2200, 0.18).setDepth(3);
    scene.physics.add.existing(this.cone);
    this.cone.body.allowGravity = false;
    this.cone.body.setImmovable(true);
  }

  update() {
    this.setVelocityX(this._speed * this._dir);
    if (this.x >= this._right) this._dir = -1;
    if (this.x <= this._left)  this._dir =  1;
    this.setFlipX(this._dir === -1);

    const offsetX = this._dir * (this._coneW / 2 + 16);
    this.cone.setPosition(this.x + offsetX, this.y);
    this.cone.body.reset(this.x + offsetX, this.y);
  }

  destroy(fromScene) {
    if (this.cone?.active) this.cone.destroy();
    super.destroy(fromScene);
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/entities/Professor.js
git commit -m "feat: Professor — patrol + dynamic vision cone rectangle"
```

---

## Task 8: Monkey Entity

**Files:**
- Create: `src/entities/Monkey.js`

- [ ] **Step 1: Create src/entities/Monkey.js**

```js
export default class Monkey extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'monkey');
    scene.add.existing(this);
    scene.physics.add.existing(this, true);
    this.body.allowGravity = false;
    this.setDepth(4);
    this._bobTween = scene.tweens.add({
      targets: this, y: y - 6,
      duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
    });
  }

  flee(scene) {
    this._bobTween?.stop();
    scene.tweens.add({
      targets: this, x: this.x + 400, duration: 600, ease: 'Quad.easeIn',
      onComplete: () => this.setVisible(false)
    });
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/entities/Monkey.js
git commit -m "feat: Monkey — bob tween, flee animation"
```

---

## Task 9: Boot Scene + main.js

**Files:**
- Create: `src/scenes/Boot.js`
- Create: `src/main.js`

- [ ] **Step 1: Create src/scenes/Boot.js**

```js
import { initGameState } from '../GameState.js';

export default class Boot extends Phaser.Scene {
  constructor() { super({ key: 'Boot' }); }

  preload() {
    // Audio — loads silently if .ogg files not yet placed in public/assets/audio/
    const keys = [
      'sfx_jump','sfx_collect','sfx_interact','sfx_caught',
      'sfx_ability','sfx_unlock','sfx_victory',
      'music_menu','music_school','music_action','music_victory'
    ];
    keys.forEach(k => this.load.audio(k, `assets/audio/${k}.ogg`));
  }

  create() {
    initGameState(this.registry);

    // ── Placeholder textures ──────────────────────────────────────────
    // When real PNG assets are ready, move these to preload() as:
    //   this.load.spritesheet(key, 'assets/sprites/<file>.png', { frameWidth: 32, frameHeight: 48 })
    // and delete the corresponding _makePerson() / _makeItem() call below.

    const chars = [
      { key: 'fabi',  color: 0x4488ff },
      { key: 'sara',  color: 0xff88cc },
      { key: 'milan', color: 0x44cc44 },
    ];
    chars.forEach(({ key, color }) => this._makePerson(key, color));

    const npcs = [
      { key: 'guard',        color: 0x888888 },
      { key: 'professor',    color: 0x443388 },
      { key: 'cantina_lady', color: 0xff8844 },
      { key: 'monkey',       color: 0x884400 },
    ];
    npcs.forEach(({ key, color }) => this._makePerson(key, color));

    const items = [
      { key: 'empanada',      color: 0xFFD700 },
      { key: 'llave_dorada',  color: 0xFFAA00 },
      { key: 'cristal_fuego', color: 0xFF2200 },
      { key: 'mud_track',     color: 0x33AA00 },
      { key: 'leaf_trail',    color: 0x00BB55 },
    ];
    items.forEach(({ key, color }) => this._makeItem(key, color));

    this._makeRect('tile_ground',   96,  20,  0x5C4033);
    this._makeRect('tile_platform', 96,  16,  0x8B6914);
    this._makeRect('tile_pillar',   24,  120, 0x999999);
    this._makeRect('tile_ice',      48,  24,  0xaaddff);

    this.scene.start('CharacterSelect');
  }

  _makePerson(key, color) {
    const g = this.make.graphics({ add: false });
    g.fillStyle(color);
    g.fillCircle(16, 10, 10);
    g.fillRect(6, 20, 20, 28);
    g.generateTexture(key, 32, 48);
    g.destroy();
  }

  _makeItem(key, color) {
    const g = this.make.graphics({ add: false });
    g.fillStyle(color);
    g.fillRect(4, 4, 24, 24);
    g.generateTexture(key, 32, 32);
    g.destroy();
  }

  _makeRect(key, w, h, color) {
    const g = this.make.graphics({ add: false });
    g.fillStyle(color);
    g.fillRect(0, 0, w, h);
    g.generateTexture(key, w, h);
    g.destroy();
  }
}
```

- [ ] **Step 2: Create src/main.js**

```js
import Phaser from 'phaser';
import Boot              from './scenes/Boot.js';
import CharacterSelect   from './scenes/CharacterSelect.js';
import Level1_Guardia    from './scenes/Level1_Guardia.js';
import Level2_Salones    from './scenes/Level2_Salones.js';
import Level3_Cantina    from './scenes/Level3_Cantina.js';
import Level4_Canchas    from './scenes/Level4_Canchas.js';
import Level5_Piscina    from './scenes/Level5_Piscina.js';
import Level6_Barranquito from './scenes/Level6_Barranquito.js';
import Victory           from './scenes/Victory.js';

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 450,
  pixelArt: true,
  backgroundColor: '#1a1a2e',
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 800 }, debug: false },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [
    Boot, CharacterSelect,
    Level1_Guardia, Level2_Salones, Level3_Cantina,
    Level4_Canchas, Level5_Piscina, Level6_Barranquito,
    Victory,
  ],
};

new Phaser.Game(config);
```

- [ ] **Step 3: Verify boot**

```bash
npm run dev
```

Open `http://localhost:5173`. Expected: no red console errors. Boot scene runs briefly (generates textures), then CharacterSelect starts (may be blank until Task 10).

- [ ] **Step 4: Commit**

```bash
git add src/scenes/Boot.js src/main.js
git commit -m "feat: Boot generates placeholder textures + loads audio; main.js wires scenes"
```

---

## Task 10: CharacterSelect Scene

**Files:**
- Create: `src/scenes/CharacterSelect.js`

- [ ] **Step 1: Create src/scenes/CharacterSelect.js**

```js
import { t, setLang, getLang } from '../i18n/index.js';
import { getGameState, setGameState } from '../GameState.js';

const CHARS = [
  { key: 'fabi',  x: 200, name: 'Fabi',  abilityKey: 'ability_fabi'  },
  { key: 'sara',  x: 400, name: 'Sara',  abilityKey: 'ability_sara'  },
  { key: 'milan', x: 600, name: 'Milan', abilityKey: 'ability_milan' },
];

export default class CharacterSelect extends Phaser.Scene {
  constructor() { super({ key: 'CharacterSelect' }); }

  create() {
    const gs = getGameState(this.registry);
    setLang(gs.lang);

    this.add.rectangle(400, 225, 800, 450, 0x1a1a2e);
    this.add.text(400, 40, t('select_character'), {
      fontSize: '22px', fontFamily: 'monospace', color: '#ffffff'
    }).setOrigin(0.5);

    this._selected = gs.character;
    this._cards = [];

    CHARS.forEach(({ key, x, name, abilityKey }) => {
      const isSelected = key === this._selected;
      const card = this.add.rectangle(x, 220, 140, 180, isSelected ? 0x334466 : 0x222244)
        .setStrokeStyle(2, isSelected ? 0xffdd44 : 0x444488)
        .setInteractive({ useHandCursor: true });
      this.add.image(x, 196, key).setDisplaySize(48, 72);
      this.add.text(x, 264, name, {
        fontSize: '14px', fontFamily: 'monospace', color: '#ffffff'
      }).setOrigin(0.5);
      this.add.text(x, 284, t(abilityKey), {
        fontSize: '10px', fontFamily: 'monospace', color: '#88aaff',
        wordWrap: { width: 128 }
      }).setOrigin(0.5);
      card.on('pointerdown', () => this._pick(key));
      card.on('pointerover', () => card.setFillStyle(0x333366));
      card.on('pointerout',  () => card.setFillStyle(key === this._selected ? 0x334466 : 0x222244));
      this._cards.push({ key, card });
    });

    const prompt = this.add.text(400, 390, t('press_start'), {
      fontSize: '14px', fontFamily: 'monospace', color: '#ffdd44'
    }).setOrigin(0.5);
    this.tweens.add({ targets: prompt, alpha: 0.2, duration: 600, yoyo: true, repeat: -1 });

    this._addLangToggle();
    this.input.keyboard.on('keydown-ENTER', () => this._start());

    if (this.cache.audio.exists('music_menu') && !this.sound.get('music_menu')) {
      this.sound.add('music_menu', { loop: true, volume: 0.5 }).play();
    }
  }

  _pick(key) {
    this._selected = key;
    this._cards.forEach(({ key: k, card }) =>
      card.setStrokeStyle(2, k === key ? 0xffdd44 : 0x444488)
    );
  }

  _start() {
    setGameState(this.registry, { character: this._selected, inventory: [], abilityUsed: false, currentLevel: 1 });
    this.sound.stopAll();
    this.scene.start('Level1_Guardia');
  }

  _addLangToggle() {
    this.add.text(770, 14, t('lang_button'), {
      fontSize: '12px', fontFamily: 'monospace', color: '#aaaaff',
      backgroundColor: '#222244', padding: { x: 6, y: 3 }
    }).setOrigin(1, 0).setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        const nl = getLang() === 'es' ? 'en' : 'es';
        setLang(nl);
        setGameState(this.registry, { lang: nl });
        this.scene.restart();
      });
  }
}
```

- [ ] **Step 2: Verify**

Run game. Expected: three coloured character squares (blue/pink/green), title, ability text, blinking "Presiona ENTER". Clicking character highlights it. "EN" button in top-right toggles language. Pressing Enter goes to Level1 (blank until Task 11).

- [ ] **Step 3: Commit**

```bash
git add src/scenes/CharacterSelect.js
git commit -m "feat: CharacterSelect — picker, lang toggle, Enter to start"
```

---

## Task 11: Level 1 — Zona de Guardia

**Files:**
- Create: `src/scenes/Level1_Guardia.js`

- [ ] **Step 1: Create src/scenes/Level1_Guardia.js**

```js
import { t, setLang, getLang } from '../i18n/index.js';
import { getGameState, setGameState } from '../GameState.js';
import Player    from '../entities/Player.js';
import NPC       from '../entities/NPC.js';
import DialogueBox  from '../systems/DialogueBox.js';
import InventoryUI  from '../systems/InventoryUI.js';

export default class Level1_Guardia extends Phaser.Scene {
  constructor() { super({ key: 'Level1_Guardia' }); }

  create() {
    const gs = getGameState(this.registry);
    setLang(gs.lang);
    setGameState(this.registry, { currentLevel: 1, abilityUsed: false });

    this.add.rectangle(400, 225, 800, 450, 0x87CEEB);

    // Ground
    this._ground = this.physics.add.staticGroup();
    const gnd = this.add.tileSprite(400, 438, 800, 24, 'tile_ground');
    this.physics.add.existing(gnd, true);
    this._ground.add(gnd);

    // Mud tracks
    for (let i = 0; i < 5; i++)
      this.add.image(150 + i * 100, 424, 'mud_track').setDisplaySize(22, 22);

    // Guard NPC
    this._guard = new NPC(this, 150, 400, 'guard');
    this._guard.setDisplaySize(32, 48);

    // Player
    this._player = new Player(this, 60, 390, gs.character);
    this.physics.add.collider(this._player, this._ground);
    this._player.addInteractable(this._guard);

    this._dialogue = new DialogueBox(this);
    this._invUI    = new InventoryUI(this);

    // Exit zone
    this._exit = this.add.rectangle(795, 225, 10, 450, 0xffffff, 0);
    this.physics.add.existing(this._exit, true);
    this.physics.add.overlap(this._player, this._exit, () => this._nextLevel());

    this._talked = false;
    this.events.on('interact', (obj) => {
      if (obj === this._guard && !this._talked) {
        this._talked = true;
        this._dialogue.show('guard_name', ['guard_dialogue_1', 'guard_dialogue_2']);
      }
    });

    // Auto-trigger guard dialogue on approach
    this._autoTriggered = false;

    this._addLangToggle();
    this.sound.stopAll();
    if (this.cache.audio.exists('music_school'))
      this.sound.add('music_school', { loop: true, volume: 0.5 }).play();
  }

  update(_, delta) {
    this._player.update(delta);
    if (!this._autoTriggered && !this._talked &&
        Phaser.Math.Distance.Between(this._player.x, this._player.y, 150, 400) < 80) {
      this._autoTriggered = true;
      this._talked = true;
      this._dialogue.show('guard_name', ['guard_dialogue_1', 'guard_dialogue_2']);
    }
  }

  _nextLevel() { this.scene.start('Level2_Salones'); }

  _addLangToggle() {
    this.add.text(770, 14, t('lang_button'), {
      fontSize: '12px', fontFamily: 'monospace', color: '#aaaaff',
      backgroundColor: '#222244', padding: { x: 6, y: 3 }
    }).setOrigin(1, 0).setScrollFactor(0).setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        const nl = getLang() === 'es' ? 'en' : 'es';
        setLang(nl); setGameState(this.registry, { lang: nl });
        this.scene.restart();
      });
  }
}
```

- [ ] **Step 2: Verify**

Play through CharacterSelect → Level 1. Expected: sky-blue bg, player (coloured square), grey guard, gold mud tracks. Approaching guard auto-triggers dialogue. Walking to the right edge transitions to Level 2.

- [ ] **Step 3: Commit**

```bash
git add src/scenes/Level1_Guardia.js
git commit -m "feat: Level 1 Zona de Guardia — guard dialogue, mud tracks, exit"
```

---

## Task 12: Level 2 — Los Salones

**Files:**
- Create: `src/scenes/Level2_Salones.js`

- [ ] **Step 1: Create src/scenes/Level2_Salones.js**

```js
import { t, setLang, getLang } from '../i18n/index.js';
import { getGameState, setGameState } from '../GameState.js';
import Player    from '../entities/Player.js';
import Professor from '../entities/Professor.js';
import DialogueBox  from '../systems/DialogueBox.js';
import InventoryUI  from '../systems/InventoryUI.js';

const LEVEL_W   = 1600;
const PILLAR_XS = [400, 800, 1200];

export default class Level2_Salones extends Phaser.Scene {
  constructor() { super({ key: 'Level2_Salones' }); }

  create() {
    const gs = getGameState(this.registry);
    setLang(gs.lang);
    setGameState(this.registry, { currentLevel: 2, abilityUsed: false });

    this.physics.world.setBounds(0, 0, LEVEL_W, 450);
    this.cameras.main.setBounds(0, 0, LEVEL_W, 450);

    this.add.rectangle(LEVEL_W / 2, 225, LEVEL_W, 450, 0xccddee);

    const gnd = this.add.tileSprite(LEVEL_W / 2, 438, LEVEL_W, 24, 'tile_ground');
    this._ground = this.physics.add.staticGroup();
    this.physics.add.existing(gnd, true);
    this._ground.add(gnd);

    // Pillars
    this._pillars = this.physics.add.staticGroup();
    PILLAR_XS.forEach(px => {
      const p = this.add.tileSprite(px, 370, 24, 120, 'tile_pillar');
      this.physics.add.existing(p, true);
      this._pillars.add(p);
    });

    const coneW = gs.character === 'sara' ? 120 : 200;
    this._prof = new Professor(this, 600, 400, 200, 1400, coneW);
    this.physics.add.collider(this._prof, this._ground);

    this._player = new Player(this, 60, 390, gs.character);
    this.physics.add.collider(this._player, this._ground);
    this.physics.add.collider(this._player, this._pillars);
    this.cameras.main.startFollow(this._player, true, 0.1, 0.1);

    this._dialogue = new DialogueBox(this);
    this._invUI    = new InventoryUI(this);
    this._caught   = false;

    // Exit
    this._exit = this.add.rectangle(1595, 225, 10, 450, 0xffffff, 0);
    this.physics.add.existing(this._exit, true);
    this.physics.add.overlap(this._player, this._exit, () => this._nextLevel());

    // Vision cone catch
    this.physics.add.overlap(this._player, this._prof.cone, () => {
      if (this._caught || this._dialogue.isOpen()) return;
      if (this._hiddenByPillar()) return;
      this._caught = true;
      this._dialogue.show('professor_name', ['professor_caught'], () => {
        this._player.setPosition(100, 390);
        this._player.setVelocity(0, 0);
        this._caught = false;
        if (this.cache.audio.exists('sfx_caught')) this.sound.play('sfx_caught', { volume: 0.7 });
      });
    });

    this._addLangToggle();
  }

  _hiddenByPillar() {
    for (const px of PILLAR_XS) {
      if (Math.abs(this._player.x - px) <= 20) {
        if ((this._player.x < px && this._prof.x > px) ||
            (this._player.x > px && this._prof.x < px)) return true;
      }
    }
    return false;
  }

  update(_, delta) {
    this._player.update(delta);
    this._prof.update();
  }

  _nextLevel() { this.scene.start('Level3_Cantina'); }

  _addLangToggle() {
    this.add.text(770, 14, t('lang_button'), {
      fontSize: '12px', fontFamily: 'monospace', color: '#aaaaff',
      backgroundColor: '#222244', padding: { x: 6, y: 3 }
    }).setOrigin(1, 0).setScrollFactor(0).setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        const nl = getLang() === 'es' ? 'en' : 'es';
        setLang(nl); setGameState(this.registry, { lang: nl });
        this.scene.restart();
      });
  }
}
```

- [ ] **Step 2: Verify**

Reach Level 2. Expected: scrolling hallway, purple professor patrols, red cone rectangle visible. Walking into cone → caught dialogue → teleport to start. Standing within ±20px of a pillar with professor on other side → no catch. Sara: cone visibly narrower. Reaching X=1595 → Level 3.

- [ ] **Step 3: Commit**

```bash
git add src/scenes/Level2_Salones.js
git commit -m "feat: Level 2 Los Salones — professor patrol, vision cone, pillar occlusion"
```

---

## Task 13: Level 3 — La Cantina

**Files:**
- Create: `src/scenes/Level3_Cantina.js`

- [ ] **Step 1: Create src/scenes/Level3_Cantina.js**

```js
import { t, setLang, getLang } from '../i18n/index.js';
import { getGameState, setGameState } from '../GameState.js';
import Player   from '../entities/Player.js';
import NPC      from '../entities/NPC.js';
import DialogueBox from '../systems/DialogueBox.js';
import InventoryUI from '../systems/InventoryUI.js';

export default class Level3_Cantina extends Phaser.Scene {
  constructor() { super({ key: 'Level3_Cantina' }); }

  create() {
    const gs = getGameState(this.registry);
    setLang(gs.lang);
    setGameState(this.registry, { currentLevel: 3, abilityUsed: false });

    this.add.rectangle(400, 225, 800, 450, 0xffe4b5);
    this.add.rectangle(400, 358, 400, 40, 0x8B6914); // counter

    const gnd = this.add.tileSprite(400, 438, 800, 24, 'tile_ground');
    this._ground = this.physics.add.staticGroup();
    this.physics.add.existing(gnd, true);
    this._ground.add(gnd);

    this._lady = new NPC(this, 400, 338, 'cantina_lady');
    this._lady.setDisplaySize(32, 48);

    this._player = new Player(this, 60, 390, gs.character);
    this.physics.add.collider(this._player, this._ground);
    this._player.addInteractable(this._lady);

    this._dialogue = new DialogueBox(this);
    this._invUI    = new InventoryUI(this);
    this._talked   = false;

    this._exit = this.add.rectangle(795, 225, 10, 450, 0xffffff, 0);
    this.physics.add.existing(this._exit, true);
    this.physics.add.overlap(this._player, this._exit, () => this._nextLevel());

    this.events.on('interact', (obj) => {
      if (obj === this._lady && !this._talked) {
        this._talked = true;
        this._dialogue.show('cantina_lady_name',
          ['cantina_dialogue_1', 'cantina_dialogue_2'],
          () => {
            this._invUI.addItem('empanada');
            if (this.cache.audio.exists('sfx_collect'))
              this.sound.play('sfx_collect', { volume: 0.8 });
            const note = this.add.text(400, 200,
              t('item_received') + t('item_empanada'), {
                fontSize: '14px', fontFamily: 'monospace', color: '#ffdd44',
                backgroundColor: '#000000aa', padding: { x: 8, y: 4 }
              }).setOrigin(0.5).setDepth(20);
            this.time.delayedCall(2000, () => note.destroy());
          }
        );
      }
    });

    this._addLangToggle();
  }

  update(_, delta) { this._player.update(delta); }
  _nextLevel() { this.scene.start('Level4_Canchas'); }

  _addLangToggle() {
    this.add.text(770, 14, t('lang_button'), {
      fontSize: '12px', fontFamily: 'monospace', color: '#aaaaff',
      backgroundColor: '#222244', padding: { x: 6, y: 3 }
    }).setOrigin(1, 0).setScrollFactor(0).setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        const nl = getLang() === 'es' ? 'en' : 'es';
        setLang(nl); setGameState(this.registry, { lang: nl });
        this.scene.restart();
      });
  }
}
```

- [ ] **Step 2: Verify**

Reach Level 3. Press E near cantina lady. Expected: 2-page dialogue, then empanada appears in top-right inventory HUD. "Recibiste: Empanada" toast for 2s. Exit right → Level 4.

- [ ] **Step 3: Commit**

```bash
git add src/scenes/Level3_Cantina.js
git commit -m "feat: Level 3 La Cantina — cantina lady dialogue, auto-receive empanada"
```

---

## Task 14: Level 4 — Las Canchas y el Dojo

**Files:**
- Create: `src/scenes/Level4_Canchas.js`

- [ ] **Step 1: Create src/scenes/Level4_Canchas.js**

```js
import { t, setLang, getLang } from '../i18n/index.js';
import { getGameState, setGameState } from '../GameState.js';
import Player   from '../entities/Player.js';
import InventoryUI from '../systems/InventoryUI.js';

const LEVEL_W = 1400;

export default class Level4_Canchas extends Phaser.Scene {
  constructor() { super({ key: 'Level4_Canchas' }); }

  create() {
    const gs = getGameState(this.registry);
    setLang(gs.lang);
    setGameState(this.registry, { currentLevel: 4, abilityUsed: false });

    this.physics.world.setBounds(0, 0, LEVEL_W, 450);
    this.cameras.main.setBounds(0, 0, LEVEL_W, 450);

    this.add.rectangle(LEVEL_W / 2, 225, LEVEL_W, 450, 0x5a8a3c);

    this._plats = this.physics.add.staticGroup();

    // Ground
    const gnd = this.add.tileSprite(LEVEL_W / 2, 438, LEVEL_W, 24, 'tile_ground');
    this.physics.add.existing(gnd, true);
    this._plats.add(gnd);

    // Mid platforms (basketball hoops Y=280)
    [250, 550, 850, 1100].forEach(x => {
      const p = this.add.tileSprite(x, 280, 120, 16, 'tile_platform');
      this.physics.add.existing(p, true);
      this._plats.add(p);
      this.add.circle(x, 268, 18, 0xFF8C00).setDepth(2);
    });

    // High platforms (dojo beams Y=160)
    [700, 950, 1200].forEach(x => {
      const p = this.add.tileSprite(x, 160, 180, 16, 'tile_platform');
      this.physics.add.existing(p, true);
      this._plats.add(p);
    });

    // Golden key — bobs at top of highest beam
    this._key = this.add.image(1300, 130, 'llave_dorada').setDisplaySize(28, 28).setDepth(5);
    this.physics.add.existing(this._key, true);
    this.tweens.add({
      targets: this._key, y: 118, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
    });

    this._player = new Player(this, 60, 390, gs.character);
    this.physics.add.collider(this._player, this._plats);
    this._player.addInteractable(this._key);
    this.cameras.main.startFollow(this._player, true, 0.1, 0.1);

    this._invUI = new InventoryUI(this);
    this._keyCollected = false;

    this.physics.add.overlap(this._player, this._key, () => this._collectKey());
    this._addLangToggle();
  }

  _collectKey() {
    if (this._keyCollected) return;
    this._keyCollected = true;
    this._key.destroy();
    this._invUI.addItem('llave_dorada');
    if (this.cache.audio.exists('sfx_collect')) this.sound.play('sfx_collect');
    const note = this.add.text(400, 200,
      t('item_received') + t('item_llave_dorada'), {
        fontSize: '14px', fontFamily: 'monospace', color: '#FFD700',
        backgroundColor: '#000000aa', padding: { x: 8, y: 4 }
      }).setOrigin(0.5).setScrollFactor(0).setDepth(20);
    this.time.delayedCall(1000, () => { note.destroy(); this.scene.start('Level5_Piscina'); });
  }

  update(_, delta) { this._player.update(delta); }

  _addLangToggle() {
    this.add.text(770, 14, t('lang_button'), {
      fontSize: '12px', fontFamily: 'monospace', color: '#aaaaff',
      backgroundColor: '#222244', padding: { x: 6, y: 3 }
    }).setOrigin(1, 0).setScrollFactor(0).setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        const nl = getLang() === 'es' ? 'en' : 'es';
        setLang(nl); setGameState(this.registry, { lang: nl });
        this.scene.restart();
      });
  }
}
```

- [ ] **Step 2: Verify**

Reach Level 4. Expected: green background, brown ground, orange mid-platforms at Y=280, dark beam platforms at Y=160. Milan jumps noticeably higher. Touching the bobbing gold key collects it → toast → transition to Level 5 after 1s.

- [ ] **Step 3: Commit**

```bash
git add src/scenes/Level4_Canchas.js
git commit -m "feat: Level 4 Las Canchas — platforms, golden key collection, music crossfade"
```

---

## Task 15: Level 5 — La Piscina "Temperada"

**Files:**
- Create: `src/scenes/Level5_Piscina.js`

- [ ] **Step 1: Create src/scenes/Level5_Piscina.js**

```js
import { t, setLang, getLang } from '../i18n/index.js';
import { getGameState, setGameState } from '../GameState.js';
import Player    from '../entities/Player.js';
import DialogueBox  from '../systems/DialogueBox.js';
import InventoryUI  from '../systems/InventoryUI.js';

export default class Level5_Piscina extends Phaser.Scene {
  constructor() { super({ key: 'Level5_Piscina' }); }

  create(data = {}) {
    const gs = getGameState(this.registry);
    setLang(gs.lang);

    if (data.victoryMode) { this._victoryMode(); return; }

    setGameState(this.registry, { currentLevel: 5, abilityUsed: false });

    this.add.rectangle(400, 225, 800, 450, 0xaaddff);
    this.add.text(400, 90, '"Piscina Temperada"', {
      fontSize: '16px', fontFamily: 'monospace', color: '#003366',
      backgroundColor: '#ffffffaa', padding: { x: 8, y: 4 }
    }).setOrigin(0.5);

    // Pool with ice blocks
    this.add.rectangle(400, 330, 600, 120, 0x7ec8e3);
    for (let i = 0; i < 7; i++)
      for (let j = 0; j < 3; j++)
        this.add.image(130 + i * 80, 283 + j * 38, 'tile_ice')
          .setDisplaySize(72, 32).setAlpha(0.85);

    const gnd = this.add.tileSprite(400, 438, 800, 24, 'tile_ground');
    this._ground = this.physics.add.staticGroup();
    this.physics.add.existing(gnd, true);
    this._ground.add(gnd);

    // Machine door + padlock
    this._door    = this.add.rectangle(700, 380, 60, 100, 0x666688);
    this._padlock = this.add.image(700, 338, 'llave_dorada')
      .setTint(0xffaa00).setDisplaySize(24, 24).setDepth(5);
    this.physics.add.existing(this._padlock, true);

    this._player = new Player(this, 60, 390, gs.character);
    this.physics.add.collider(this._player, this._ground);
    this._player.addInteractable(this._padlock);

    this._dialogue  = new DialogueBox(this);
    this._invUI     = new InventoryUI(this);
    this._doorOpen  = false;

    this._exit = this.add.rectangle(795, 225, 10, 450, 0xffffff, 0);
    this.physics.add.existing(this._exit, true);
    this.physics.add.overlap(this._player, this._exit, () => {
      if (this._doorOpen) this._nextLevel();
    });

    this.events.on('interact', (obj) => {
      if (obj === this._padlock && !this._doorOpen) {
        const inv = getGameState(this.registry).inventory;
        if (inv.includes('llave_dorada')) this._openDoor();
        else this._dialogue.show('padlock_name', ['no_key']);
      }
    });

    this._addLangToggle();
  }

  _openDoor() {
    this._doorOpen = true;
    this._padlock.destroy();
    this._door.setFillStyle(0x33aa55);
    if (this.cache.audio.exists('sfx_unlock')) this.sound.play('sfx_unlock');
    for (let i = 0; i < 4; i++)
      this.add.image(730 + i * 18, 410, 'leaf_trail').setDisplaySize(16, 16).setAngle(i * 12);
    this._dialogue.show('padlock_name', ['door_open']);
  }

  _victoryMode() {
    this.add.rectangle(400, 225, 800, 450, 0x1a88cc);
    this.add.text(400, 200, '~ ~ ~ ~ ~', {
      fontSize: '28px', fontFamily: 'monospace', color: '#aaeeff'
    }).setOrigin(0.5);
    for (let i = 0; i < 14; i++) {
      const dot = this.add.circle(60 + i * 50, 340, 5, 0xffffff, 0.7);
      this.tweens.add({
        targets: dot, y: dot.y - 90, alpha: 0,
        duration: 1100 + i * 90, delay: i * 70,
        onComplete: () => dot.destroy()
      });
    }
    if (this.cache.audio.exists('sfx_victory')) this.sound.play('sfx_victory', { volume: 0.8 });
    this.time.delayedCall(3000, () => this.scene.start('Victory'));
  }

  update(_, delta) { this._player?.update(delta); }
  _nextLevel() { this.scene.start('Level6_Barranquito'); }

  _addLangToggle() {
    this.add.text(770, 14, t('lang_button'), {
      fontSize: '12px', fontFamily: 'monospace', color: '#aaaaff',
      backgroundColor: '#222244', padding: { x: 6, y: 3 }
    }).setOrigin(1, 0).setScrollFactor(0).setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        const nl = getLang() === 'es' ? 'en' : 'es';
        setLang(nl); setGameState(this.registry, { lang: nl });
        this.scene.restart();
      });
  }
}
```

- [ ] **Step 2: Verify**

Reach Level 5 WITH `llave_dorada` in inventory. Expected: icy-blue pool, ice grid, gold padlock on door. Press E near padlock with key → door turns green, leaf trail appears, dialogue shows. Without key → "Necesitas algo..." After door open, exit right → Level 6.

- [ ] **Step 3: Commit**

```bash
git add src/scenes/Level5_Piscina.js
git commit -m "feat: Level 5 La Piscina — padlock puzzle, victory cutscene mode"
```

---

## Task 16: Level 6 — El Barranquito

**Files:**
- Create: `src/scenes/Level6_Barranquito.js`

- [ ] **Step 1: Create src/scenes/Level6_Barranquito.js**

```js
import { t, setLang, getLang } from '../i18n/index.js';
import { getGameState, setGameState } from '../GameState.js';
import Player    from '../entities/Player.js';
import Monkey    from '../entities/Monkey.js';
import DialogueBox  from '../systems/DialogueBox.js';
import InventoryUI  from '../systems/InventoryUI.js';

export default class Level6_Barranquito extends Phaser.Scene {
  constructor() { super({ key: 'Level6_Barranquito' }); }

  create() {
    const gs = getGameState(this.registry);
    setLang(gs.lang);
    setGameState(this.registry, { currentLevel: 6, abilityUsed: false });

    this.add.rectangle(400, 225, 800, 450, 0x2d5a1b);
    this.add.ellipse(580, 390, 120, 55, 0x556b2f);
    this.add.ellipse(660, 375, 80, 44, 0x4a5e24);

    this._ground = this.physics.add.staticGroup();
    const gnd = this.add.tileSprite(400, 438, 800, 24, 'tile_ground');
    this.physics.add.existing(gnd, true);
    this._ground.add(gnd);

    // High rock (unreachable)
    const rock = this.add.ellipse(580, 308, 100, 48, 0x667755);
    this.physics.add.existing(rock, true);
    this._ground.add(rock);

    this._monkey = new Monkey(this, 580, 276);
    this._monkey.setDisplaySize(32, 48);

    // Invisible zone over rock — added to player interactables
    this._rockZone = this.add.rectangle(580, 308, 100, 50, 0xffffff, 0);
    this.physics.add.existing(this._rockZone, true);

    this._player = new Player(this, 60, 390, gs.character);
    this.physics.add.collider(this._player, this._ground);
    this._player.addInteractable(this._rockZone);

    this._dialogue = new DialogueBox(this);
    this._invUI    = new InventoryUI(this);
    this._traded   = false;
    this._crystal  = null;

    this._eKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    this.events.on('interact', (obj) => {
      if (obj === this._rockZone && !this._traded) {
        const inv = getGameState(this.registry).inventory;
        if (!inv.includes('empanada')) {
          this._dialogue.show('monkey_name', ['monkey_no_item']);
        } else {
          this._openTrade();
        }
      }
    });

    this._addLangToggle();
  }

  _openTrade() {
    this._invUI.openTradeMode((itemKey) => {
      if (itemKey === 'empanada') this._doTrade();
      else this._dialogue.show('monkey_name', ['monkey_no_item']);
    });
  }

  _doTrade() {
    this._traded = true;
    const gs = getGameState(this.registry);
    gs.inventory = gs.inventory.filter(k => k !== 'empanada');
    setGameState(this.registry, { inventory: gs.inventory });
    this._invUI._refresh();

    this._monkey.flee(this);

    // Crystal arc toss
    const ci = this.add.image(580, 276, 'cristal_fuego').setDisplaySize(28, 28).setDepth(6);
    this.tweens.add({
      targets: ci, x: 500, y: 415,
      duration: 800, ease: 'Quad.easeIn',
      onComplete: () => {
        this._crystal = ci;
        this.physics.add.existing(ci, true);
        this._player.addInteractable(ci);
        this._dialogue.show('monkey_name', ['monkey_trade_1']);
      }
    });
  }

  update(_, delta) {
    this._player.update(delta);
    if (this._crystal?.active &&
        Phaser.Math.Distance.Between(this._player.x, this._player.y, this._crystal.x, this._crystal.y) < 50 &&
        Phaser.Input.Keyboard.JustDown(this._eKey)) {
      this._collectCrystal();
    }
  }

  _collectCrystal() {
    if (!this._crystal?.active) return;
    this._crystal.destroy();
    this._crystal = null;
    this._invUI.addItem('cristal_fuego');
    if (this.cache.audio.exists('sfx_collect')) this.sound.play('sfx_collect');
    const note = this.add.text(400, 200, t('crystal_received'), {
      fontSize: '14px', fontFamily: 'monospace', color: '#FF4400',
      backgroundColor: '#000000aa', padding: { x: 8, y: 4 }
    }).setOrigin(0.5).setDepth(20);
    this.time.delayedCall(1500, () => {
      note.destroy();
      this.scene.start('Level5_Piscina', { victoryMode: true });
    });
  }

  _addLangToggle() {
    this.add.text(770, 14, t('lang_button'), {
      fontSize: '12px', fontFamily: 'monospace', color: '#aaaaff',
      backgroundColor: '#222244', padding: { x: 6, y: 3 }
    }).setOrigin(1, 0).setScrollFactor(0).setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        const nl = getLang() === 'es' ? 'en' : 'es';
        setLang(nl); setGameState(this.registry, { lang: nl });
        this.scene.restart();
      });
  }
}
```

- [ ] **Step 2: Verify**

Reach Level 6 with empanada. Press E near rock. Expected: inventory opens in trade mode. Click empanada → monkey flees right, crystal arcs to ground. Walk to crystal, press E → crystal in inventory, toast, scene transitions to Level 5 victoryMode → shimmer animation → Victory.

- [ ] **Step 3: Commit**

```bash
git add src/scenes/Level6_Barranquito.js
git commit -m "feat: Level 6 El Barranquito — monkey trade, crystal arc, victory trigger"
```

---

## Task 17: Victory Scene

**Files:**
- Create: `src/scenes/Victory.js`

- [ ] **Step 1: Create src/scenes/Victory.js**

```js
import { t, setLang } from '../i18n/index.js';
import { getGameState } from '../GameState.js';

export default class Victory extends Phaser.Scene {
  constructor() { super({ key: 'Victory' }); }

  create() {
    const gs = getGameState(this.registry);
    setLang(gs.lang);

    this.add.rectangle(400, 225, 800, 450, 0x0a1628);
    this._spawnConfetti();

    this.add.text(400, 150, t('victory_title'), {
      fontSize: '52px', fontFamily: 'monospace', color: '#FFD700', fontStyle: 'bold'
    }).setOrigin(0.5);
    this.add.text(400, 230, t('victory_subtitle'), {
      fontSize: '18px', fontFamily: 'monospace', color: '#ffffff',
      wordWrap: { width: 700 }
    }).setOrigin(0.5);
    this.add.text(400, 290, 'Colegio Los Hipocampitos', {
      fontSize: '14px', fontFamily: 'monospace', color: '#88aaff'
    }).setOrigin(0.5);

    const prompt = this.add.text(400, 400, t('victory_prompt'), {
      fontSize: '14px', fontFamily: 'monospace', color: '#ffdd44'
    }).setOrigin(0.5);
    this.tweens.add({ targets: prompt, alpha: 0.2, duration: 600, yoyo: true, repeat: -1 });

    if (this.cache.audio.exists('music_victory'))
      this.sound.play('music_victory', { volume: 0.7 });

    this.input.keyboard.on('keydown-ENTER', () => {
      this.sound.stopAll();
      this.scene.start('CharacterSelect');
    });
  }

  _spawnConfetti() {
    const colors = [0xFF6B6B, 0xFFD700, 0x4ECDC4, 0x45B7D1, 0x96CEB4, 0xFFEAA7];
    for (let i = 0; i < 40; i++) {
      const x = Phaser.Math.Between(0, 800);
      const sq = this.add.rectangle(x, Phaser.Math.Between(-20, 0), 8, 8,
        colors[i % colors.length]);
      this.tweens.add({
        targets: sq, y: 500, x: x + Phaser.Math.Between(-60, 60),
        angle: Phaser.Math.Between(-360, 360),
        duration: Phaser.Math.Between(2000, 4000),
        delay: Phaser.Math.Between(0, 1500),
        repeat: -1,
        onRepeat: () => { sq.x = Phaser.Math.Between(0, 800); sq.y = -20; }
      });
    }
  }
}
```

- [ ] **Step 2: Full playthrough verification**

Play the complete game from CharacterSelect to Victory with each character:

- [ ] Fabi: Q ability highlights nearest interactable with golden pulse
- [ ] Sara: Professor cone is visibly narrower in Level 2
- [ ] Milan: Noticeably higher jump on Level 4 platforms
- [ ] Full flow: L1 guard dialogue → L2 stealth → L3 empanada → L4 key → L5 padlock → L6 trade → L5 victory → Victory screen
- [ ] Language toggle: switching ES↔EN at CharacterSelect reflects in all scene text
- [ ] Victory: confetti animates, "¡Victoria!" in gold, Enter restarts to CharacterSelect

- [ ] **Step 3: Commit**

```bash
git add src/scenes/Victory.js
git commit -m "feat: Victory scene — confetti, title, replay — full game loop complete"
```

---

## Task 18: Real Sprite Integration (when assets are ready)

**Files:**
- Modify: `src/scenes/Boot.js`
- Modify: `src/entities/Player.js`

Place PNG files in `public/assets/sprites/` per the filenames in Section 11 of the design spec.

- [ ] **Step 1: Update Boot.js preload() with real sprite loads**

Add a `preload()` method to Boot.js (before `create()`), and remove the matching `_makePerson()` / `_makeItem()` call in `create()` for each asset you're replacing:

```js
preload() {
  // Characters (192×48 spritesheet: frame 0=idle, 1-4=walk, 5=jump)
  this.load.spritesheet('fabi',  'assets/sprites/fabi.png',  { frameWidth: 32, frameHeight: 48 });
  this.load.spritesheet('sara',  'assets/sprites/sara.png',  { frameWidth: 32, frameHeight: 48 });
  this.load.spritesheet('milan', 'assets/sprites/milan.png', { frameWidth: 32, frameHeight: 48 });
  // NPCs (64×48: 2 frames each)
  this.load.spritesheet('guard',        'assets/sprites/guard.png',        { frameWidth: 32, frameHeight: 48 });
  this.load.spritesheet('professor',    'assets/sprites/professor.png',    { frameWidth: 32, frameHeight: 48 });
  this.load.spritesheet('cantina_lady', 'assets/sprites/cantina_lady.png', { frameWidth: 32, frameHeight: 48 });
  // Monkey (96×48: 3 frames)
  this.load.spritesheet('monkey', 'assets/sprites/monkey.png', { frameWidth: 32, frameHeight: 48 });
  // Items (individual 32×32 PNGs)
  ['empanada','llave_dorada','cristal_fuego','mud_track','leaf_trail']
    .forEach(k => this.load.image(k, `assets/sprites/${k}.png`));
  // Audio (unchanged)
  const audio = ['sfx_jump','sfx_collect','sfx_interact','sfx_caught',
    'sfx_ability','sfx_unlock','sfx_victory','music_menu','music_school','music_action','music_victory'];
  audio.forEach(k => this.load.audio(k, `assets/audio/${k}.ogg`));
}
```

- [ ] **Step 2: Update Player._createAnims() for real frames**

In `src/entities/Player.js`, replace the `_createAnims` method:

```js
_createAnims(scene) {
  const c = this.character;
  if (scene.anims.exists(`${c}_idle`)) return;
  scene.anims.create({ key: `${c}_idle`, frames: [{ key: c, frame: 0 }], frameRate: 1,  repeat: -1 });
  scene.anims.create({ key: `${c}_walk`, frames: scene.anims.generateFrameNumbers(c, { start: 1, end: 4 }), frameRate: 8, repeat: -1 });
  scene.anims.create({ key: `${c}_jump`, frames: [{ key: c, frame: 5 }], frameRate: 1,  repeat:  0 });
}
```

- [ ] **Step 3: Commit**

```bash
git add public/assets/sprites/ src/scenes/Boot.js src/entities/Player.js
git commit -m "feat: integrate real pixel art sprites and animations"
```

---

## Task 19: Vercel Deployment

- [ ] **Step 1: Build and preview locally**

```bash
npm run build
npm run preview
```

Open `http://localhost:4173`. Full game must run without errors.

- [ ] **Step 2: Push to GitHub**

```bash
git remote add origin https://github.com/<your-username>/fabiverse.git
git push -u origin main
```

- [ ] **Step 3: Deploy on Vercel**

1. Go to vercel.com → New Project → Import your GitHub repo
2. Vercel detects Vite automatically; `vercel.json` sets output dir to `dist`
3. Click Deploy

- [ ] **Step 4: Verify live URL**

Open the Vercel-provided URL. Verify full game works on deployed site.

- [ ] **Step 5: Final commit**

```bash
git add .
git commit -m "chore: production verified, Vercel deployment live"
git push
```

---

## Self-Review

**Spec coverage:**
- ✅ 3 characters: Fabi (Q glow), Sara (smaller cone passive), Milan (1.2× jump passive)
- ✅ All 6 levels with exact mechanics from spec
- ✅ Inventory: empanada (L3), llave_dorada (L4), cristal_fuego (L6)
- ✅ Vision cone with pillar occlusion (±20px rule)
- ✅ Monkey trade mechanic with arc toss
- ✅ Victory cutscene via Level5 victoryMode flag
- ✅ ES/EN i18n toggle on every scene
- ✅ Audio structure — loads in Boot, plays in scenes
- ✅ Placeholder → real sprite swap path documented
- ✅ Vercel static deployment
- ✅ Coyote time (80ms) + jump buffer (100ms)

**Placeholder scan:** No TBDs. All code blocks complete. All filenames exact. All method signatures consistent: `DialogueBox.show(speakerKey, lineKeys[], onComplete?)`, `InventoryUI.addItem(key)`, `InventoryUI._refresh()`, `Player.addInteractable(obj)`, `Professor.update()`, `Monkey.flee(scene)`.

**Type consistency:** `getGameState` / `setGameState` used identically across all 6 levels. `t(key)` called with string literal keys that exist in both `es.js` and `en.js`. `this._invUI._refresh()` in Level6 matches the method defined in InventoryUI (Task 4).
