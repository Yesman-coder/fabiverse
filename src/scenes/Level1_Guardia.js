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
