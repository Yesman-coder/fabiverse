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

    // ── Background: school hallway (1600px scrolling) ─────────────────
    this.add.rectangle(LEVEL_W / 2, 225, LEVEL_W, 450, 0xE8D0A0); // warm wall
    // Ceiling and floor bands
    this.add.rectangle(LEVEL_W / 2, 22, LEVEL_W, 44, 0xC4A870);
    this.add.rectangle(LEVEL_W / 2, 428, LEVEL_W, 30, 0xA0825A);
    // Alternating floor tiles
    for (let tx = 0; tx < LEVEL_W; tx += 48)
      this.add.rectangle(tx + 24, 428, 46, 28, tx % 96 === 0 ? 0xB8956A : 0xA8856A);
    // Fluorescent ceiling lights every 300px
    for (let lx = 150; lx < LEVEL_W; lx += 300) {
      this.add.rectangle(lx, 30, 90, 10, 0xFFFACC, 0.9);
      this.add.rectangle(lx, 30, 94, 14, 0xCCBB88).setStrokeStyle(1, 0xAA9966);
    }
    // Classroom doors with room numbers
    for (let dx = 220; dx < LEVEL_W - 100; dx += 280) {
      this.add.rectangle(dx, 310, 54, 210, 0x8B5E3C);
      this.add.rectangle(dx, 310, 58, 214, 0x0).setStrokeStyle(2, 0x5C3A1E);
      this.add.circle(dx + 20, 310, 5, 0xCCAA44);
      this.add.text(dx, 218, String(100 + Math.floor(dx / 280)), {
        fontSize: '9px', fontFamily: 'monospace', color: '#5C3A1E'
      }).setOrigin(0.5);
    }
    // Bulletin board near start
    this.add.rectangle(90, 230, 130, 90, 0x2a5c2a);
    this.add.text(90, 222, '-- AVISOS --', { fontSize: '7px', fontFamily: 'monospace', color: '#aaffaa' }).setOrigin(0.5);
    this.add.text(90, 236, 'Examen Martes', { fontSize: '6px', fontFamily: 'monospace', color: '#ccffcc' }).setOrigin(0.5);
    this.add.text(90, 248, 'Fiesta Viernes', { fontSize: '6px', fontFamily: 'monospace', color: '#ccffcc' }).setOrigin(0.5);
    // ── End background ────────────────────────────────────────────────

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
    if (this._prof?.cone) {
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
    }

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
