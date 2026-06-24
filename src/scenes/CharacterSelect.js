import { t, setLang, getLang } from '../i18n/index.js';
import { getGameState, setGameState } from '../GameState.js';

const CHARS = [
  { key: 'fabi',  x: 200, name: 'Fabi',  abilityKey: 'ability_fabi'  },
  { key: 'sara',  x: 400, name: 'Sara',  abilityKey: 'ability_sara'  },
  { key: 'milan', x: 600, name: 'Milan', abilityKey: 'ability_milan' },
];

export default class CharacterSelect extends Phaser.Scene {
  constructor() { super({ key: 'CharacterSelect' }); }

  create() {
    const gs = getGameState(this.registry);
    setLang(gs.lang);

    this.add.rectangle(400, 225, 800, 450, 0x1a1a2e);
    this.add.text(400, 40, t('select_character'), {
      fontSize: '22px', fontFamily: 'monospace', color: '#ffffff'
    }).setOrigin(0.5);

    this._selected = gs.character;
    this._cards = [];

    CHARS.forEach(({ key, x, name, abilityKey }) => {
      const isSelected = key === this._selected;
      const card = this.add.rectangle(x, 220, 140, 180, isSelected ? 0x334466 : 0x222244)
        .setStrokeStyle(2, isSelected ? 0xffdd44 : 0x444488)
        .setInteractive({ useHandCursor: true });
      this.add.image(x, 196, key).setDisplaySize(48, 72);
      this.add.text(x, 264, name, {
        fontSize: '14px', fontFamily: 'monospace', color: '#ffffff'
      }).setOrigin(0.5);
      this.add.text(x, 284, t(abilityKey), {
        fontSize: '10px', fontFamily: 'monospace', color: '#88aaff',
        wordWrap: { width: 128 }
      }).setOrigin(0.5);
      card.on('pointerdown', () => this._pick(key));
      card.on('pointerover', () => card.setFillStyle(0x333366));
      card.on('pointerout',  () => card.setFillStyle(key === this._selected ? 0x334466 : 0x222244));
      this._cards.push({ key, card });
    });

    const prompt = this.add.text(400, 390, t('press_start'), {
      fontSize: '14px', fontFamily: 'monospace', color: '#ffdd44'
    }).setOrigin(0.5);
    this.tweens.add({ targets: prompt, alpha: 0.2, duration: 600, yoyo: true, repeat: -1 });

    this._addLangToggle();
    this.input.keyboard.on('keydown-ENTER', () => this._start());

    if (this.cache.audio.exists('music_menu') && !this.sound.get('music_menu')) {
      this.sound.add('music_menu', { loop: true, volume: 0.5 }).play();
    }
  }

  _pick(key) {
    this._selected = key;
    this._cards.forEach(({ key: k, card }) =>
      card.setStrokeStyle(2, k === key ? 0xffdd44 : 0x444488)
    );
  }

  _start() {
    setGameState(this.registry, { character: this._selected, inventory: [], abilityUsed: false, currentLevel: 1 });
    this.sound.stopAll();
    this.scene.start('Level1_Guardia');
  }

  _addLangToggle() {
    this.add.text(770, 14, t('lang_button'), {
      fontSize: '12px', fontFamily: 'monospace', color: '#aaaaff',
      backgroundColor: '#222244', padding: { x: 6, y: 3 }
    }).setOrigin(1, 0).setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        const nl = getLang() === 'es' ? 'en' : 'es';
        setLang(nl);
        setGameState(this.registry, { lang: nl });
        this.scene.restart();
      });
  }
}
