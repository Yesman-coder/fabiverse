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
