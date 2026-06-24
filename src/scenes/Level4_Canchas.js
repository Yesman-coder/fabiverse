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

    // ── Background: sports field / dojo ───────────────────────────────
    this.add.rectangle(LEVEL_W / 2, 225, LEVEL_W, 450, 0x5a8a3c); // grass
    // Sky strip at top
    this.add.rectangle(LEVEL_W / 2, 60, LEVEL_W, 120, 0x88CCFF);
    // Clouds
    [[200, 40], [500, 30], [900, 45], [1200, 35]].forEach(([cx, cy]) => {
      this.add.ellipse(cx, cy, 100, 36, 0xFFFFFF, 0.85);
      this.add.ellipse(cx + 30, cy - 8, 70, 28, 0xFFFFFF, 0.80);
    });
    // Treeline at horizon
    this.add.rectangle(LEVEL_W / 2, 112, LEVEL_W, 22, 0x3d6b32);
    // Court lines
    this.add.rectangle(LEVEL_W / 2, 436, LEVEL_W, 3, 0xFFFFFF, 0.35);
    for (let lx = 0; lx < LEVEL_W; lx += 200)
      this.add.rectangle(lx, 436, 2, 30, 0xFFFFFF, 0.28);
    // Dojo building (right background)
    this.add.rectangle(1150, 175, 340, 210, 0xCC9933, 0.75);
    this.add.rectangle(1150, 72, 380, 24, 0xAA7722, 0.80);
    this.add.text(1150, 88, 'DOJO', { fontSize: '12px', fontFamily: 'monospace', color: '#332200' }).setOrigin(0.5).setAlpha(0.85);
    [1040, 1150, 1260].forEach(wx => this.add.rectangle(wx, 185, 36, 44, 0x99BBDD, 0.6));
    // ── End background ────────────────────────────────────────────────

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
    this.physics.add.existing(this._key);
    this._key.body.allowGravity = false;
    this._key.body.setImmovable(true);
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
    this.tweens.killTweensOf(this._key);
    this._key.destroy();
    this._key = null;
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
