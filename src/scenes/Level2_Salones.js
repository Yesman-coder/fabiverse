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
