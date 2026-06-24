import { t, setLang, getLang } from '../i18n/index.js';
import { getGameState, setGameState } from '../GameState.js';
import Player    from '../entities/Player.js';
import Monkey    from '../entities/Monkey.js';
import DialogueBox  from '../systems/DialogueBox.js';
import InventoryUI  from '../systems/InventoryUI.js';

export default class Level6_Barranquito extends Phaser.Scene {
  constructor() { super({ key: 'Level6_Barranquito' }); }

  create() {
    this.events.off('interact');
    const gs = getGameState(this.registry);
    setLang(gs.lang);
    setGameState(this.registry, { currentLevel: 6, abilityUsed: false });

    // ── Background: jungle ravine / El Barranquito ────────────────────
    this.add.rectangle(400, 225, 800, 450, 0x1a3a0e); // dark jungle
    // Sky peek through canopy
    this.add.rectangle(400, 50, 800, 100, 0x4a8a55, 0.5);
    // Far background tree silhouettes
    [60, 180, 340, 520, 670, 760].forEach(tx => {
      const h = 150 + (tx % 60);
      this.add.rectangle(tx, 200 - h / 2, 28, h, 0x1a4010, 0.8);
      this.add.ellipse(tx, 200 - h + 10, 78, 58, 0x1e4d14, 0.7);
    });
    // Mid-layer foliage
    for (let fx = -20; fx < 820; fx += 70) {
      this.add.ellipse(fx, 390, 110, 60, 0x2d5a1b);
      this.add.ellipse(fx + 25, 380, 80, 50, 0x3a6e22);
    }
    // Mossy rocks on ground
    [120, 260, 450, 700].forEach(rx => {
      this.add.ellipse(rx, 428, 60, 28, 0x556644);
      this.add.ellipse(rx + 8, 422, 40, 20, 0x667755, 0.7);
    });
    // Hanging vines
    [150, 350, 550, 730].forEach(vx => {
      for (let vy = 0; vy < 200; vy += 18)
        this.add.circle(vx + Math.sin(vy * 0.3) * 6, vy + 10, 3, 0x336622, 0.7);
    });
    // Waterfall (right side)
    for (let wy = 60; wy < 410; wy += 12)
      this.add.rectangle(752, wy, 10, 10, 0x88CCFF, 0.28 + (wy % 24) * 0.01);
    // ── End background ────────────────────────────────────────────────
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
    this._monkey.setDisplaySize(38, 58);

    // Invisible zone over rock — added to player interactables
    this._rockZone = this.add.rectangle(580, 308, 100, 50, 0xffffff, 0);
    this._rockZone.requiresItem = 'empanada';
    this.physics.add.existing(this._rockZone, true);

    this._player = new Player(this, 60, 390, gs.character);
    this.physics.add.collider(this._player, this._ground);
    this._player.addInteractable(this._rockZone);

    this._dialogue = new DialogueBox(this);
    this._invUI    = new InventoryUI(this);
    this._traded   = false;
    this._crystal  = null;

    this.input.keyboard.removeKey(Phaser.Input.Keyboard.KeyCodes.E);
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
    setGameState(this.registry, { inventory: gs.inventory.filter(k => k !== 'empanada') });
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
