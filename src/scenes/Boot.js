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
