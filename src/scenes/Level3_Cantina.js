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

    // ── Background: school cantina interior ───────────────────────────
    this.add.rectangle(400, 225, 800, 450, 0xF5E0B0); // warm wall
    // Ceiling band
    this.add.rectangle(400, 20, 800, 40, 0xD4A85A);
    // Hanging cantina sign
    this.add.rectangle(400, 44, 190, 32, 0x8B4513);
    this.add.text(400, 44, 'LA CANTINA', { fontSize: '11px', fontFamily: 'monospace', color: '#FFDD88' }).setOrigin(0.5);
    // Chalkboard menu on back wall
    this.add.rectangle(200, 180, 200, 110, 0x1a3d1a);
    this.add.rectangle(200, 180, 204, 114, 0x0).setStrokeStyle(2, 0x886644);
    this.add.text(200, 150, 'MENU DEL DIA', { fontSize: '8px', fontFamily: 'monospace', color: '#88EE88' }).setOrigin(0.5);
    this.add.text(200, 167, 'Empanadas  $500', { fontSize: '7px', fontFamily: 'monospace', color: '#aaffaa' }).setOrigin(0.5);
    this.add.text(200, 180, 'Jugo       $200', { fontSize: '7px', fontFamily: 'monospace', color: '#aaffaa' }).setOrigin(0.5);
    this.add.text(200, 193, 'Arroz      $300', { fontSize: '7px', fontFamily: 'monospace', color: '#aaffaa' }).setOrigin(0.5);
    this.add.text(200, 206, 'Postre     $400', { fontSize: '7px', fontFamily: 'monospace', color: '#aaffaa' }).setOrigin(0.5);
    // Windows (right wall)
    [580, 680].forEach(wx => {
      this.add.rectangle(wx, 190, 64, 80, 0xAADDFF, 0.65);
      this.add.rectangle(wx, 190, 68, 84, 0x0).setStrokeStyle(2, 0x998866);
      this.add.rectangle(wx, 260, 64, 60, 0xFFFF99, 0.10); // sunlight shaft
    });
    // Tiled floor (alternating)
    for (let tx = 0; tx < 800; tx += 44)
      this.add.rectangle(tx + 22, 432, 42, 22, tx % 88 === 0 ? 0xDDCC99 : 0xCCBB88);
    // Background tables
    [100, 620].forEach(tx => {
      this.add.rectangle(tx, 350, 80, 8, 0xAA7733);
      this.add.rectangle(tx - 28, 370, 6, 22, 0x885522);
      this.add.rectangle(tx + 28, 370, 6, 22, 0x885522);
    });
    // ── End background ────────────────────────────────────────────────
    this.add.rectangle(400, 358, 400, 40, 0x8B6914); // counter

    const gnd = this.add.tileSprite(400, 438, 800, 24, 'tile_ground');
    this._ground = this.physics.add.staticGroup();
    this.physics.add.existing(gnd, true);
    this._ground.add(gnd);

    this._lady = new NPC(this, 400, 338, 'cantina_lady');
    this._lady.setDisplaySize(38, 58);

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
