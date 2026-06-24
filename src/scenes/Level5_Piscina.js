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

    // ── Background: indoor pool area ──────────────────────────────────
    this.add.rectangle(400, 225, 800, 450, 0x7ABDE6);
    // Ceiling with skylights
    this.add.rectangle(400, 22, 800, 44, 0x5599BB);
    [160, 320, 480, 640].forEach(sx => {
      this.add.rectangle(sx, 22, 70, 40, 0xDDEEFF, 0.6);
      this.add.rectangle(sx, 52, 70, 44, 0xFFFF99, 0.12);
    });
    // Wall tile pattern
    for (let ty = 80; ty < 270; ty += 28)
      for (let tx = 0; tx < 800; tx += 52)
        this.add.rectangle(tx + 26, ty, 50, 26,
          (tx + ty) % 104 === 0 ? 0xCCEEFF : 0xBBDDEE, 0.50);
    // Pool title sign
    this.add.text(400, 74, '"Piscina Temperada"', {
      fontSize: '14px', fontFamily: 'monospace', color: '#003366',
      backgroundColor: '#ffffffcc', padding: { x: 8, y: 4 }
    }).setOrigin(0.5);
    // Pool water
    this.add.rectangle(400, 330, 600, 120, 0x7ec8e3);
    // Pool tile border (top + bottom)
    for (let i = 0; i < 12; i++) {
      const c = i % 2 === 0 ? 0x1188CC : 0x44AAEE;
      this.add.rectangle(104 + i * 51, 271, 49, 13, c);
      this.add.rectangle(104 + i * 51, 391, 49, 13, c);
    }
    // Lane dividers
    for (let l = 1; l < 5; l++)
      this.add.rectangle(115 + l * 115, 330, 5, 100, 0xFF8800, 0.55);
    // Lifeguard chair
    this.add.rectangle(52, 318, 8, 30, 0xDD4400);
    this.add.rectangle(52, 301, 32, 16, 0xFF6600);
    // ── End background ────────────────────────────────────────────────
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
    this._padlock.requiresItem = 'llave_dorada';
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
    // Background
    this.add.rectangle(400, 225, 800, 450, 0x1a88cc);

    // Pool base
    this.add.rectangle(400, 330, 600, 120, 0x3399ff);

    // Shimmer highlights animating alpha
    for (let i = 0; i < 8; i++) {
      const shimmer = this.add.rectangle(80 + i * 70, 300 + (i % 3) * 22, 60, 10, 0xaaeeff, 0.7);
      this.tweens.add({
        targets: shimmer, alpha: 0.1,
        duration: 350 + i * 70, yoyo: true, repeat: -1
      });
    }

    // Wave text
    this.add.text(400, 200, '~ ~ ~ ~ ~', {
      fontSize: '28px', fontFamily: 'monospace', color: '#aaeeff'
    }).setOrigin(0.5);

    // Steam particles rising
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
