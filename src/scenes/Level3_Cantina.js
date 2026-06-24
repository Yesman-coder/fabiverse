import { t, setLang, getLang } from '../i18n/index.js';
import { getGameState, setGameState } from '../GameState.js';
import Player   from '../entities/Player.js';
import NPC      from '../entities/NPC.js';
import DialogueBox from '../systems/DialogueBox.js';
import InventoryUI from '../systems/InventoryUI.js';

export default class Level3_Cantina extends Phaser.Scene {
  constructor() { super({ key: 'Level3_Cantina' }); }

  create() {
    this.events.off('interact');
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
  _nextLevel() {
    this.time.removeAllEvents();
    this.scene.start('Level4_Canchas');
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
