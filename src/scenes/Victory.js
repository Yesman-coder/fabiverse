import { t, setLang } from '../i18n/index.js';
import { getGameState } from '../GameState.js';

export default class Victory extends Phaser.Scene {
  constructor() { super({ key: 'Victory' }); }

  create() {
    const gs = getGameState(this.registry);
    setLang(gs.lang);

    this.add.rectangle(400, 225, 800, 450, 0x0a1628);
    this._spawnConfetti();

    this.add.text(400, 150, t('victory_title'), {
      fontSize: '52px', fontFamily: 'monospace', color: '#FFD700', fontStyle: 'bold'
    }).setOrigin(0.5);
    this.add.text(400, 230, t('victory_subtitle'), {
      fontSize: '18px', fontFamily: 'monospace', color: '#ffffff',
      wordWrap: { width: 700 }
    }).setOrigin(0.5);
    this.add.text(400, 290, 'Colegio Los Hipocampitos', {
      fontSize: '14px', fontFamily: 'monospace', color: '#88aaff'
    }).setOrigin(0.5);

    const prompt = this.add.text(400, 400, t('victory_prompt'), {
      fontSize: '14px', fontFamily: 'monospace', color: '#ffdd44'
    }).setOrigin(0.5);
    this.tweens.add({ targets: prompt, alpha: 0.2, duration: 600, yoyo: true, repeat: -1 });

    if (this.cache.audio.exists('music_victory'))
      this.sound.play('music_victory', { volume: 0.7 });

    this.input.keyboard.on('keydown-ENTER', () => {
      this.sound.stopAll();
      this.scene.start('CharacterSelect');
    });
  }

  _spawnConfetti() {
    const colors = [0xFF6B6B, 0xFFD700, 0x4ECDC4, 0x45B7D1, 0x96CEB4, 0xFFEAA7];
    for (let i = 0; i < 40; i++) {
      const x = Phaser.Math.Between(0, 800);
      const sq = this.add.rectangle(x, Phaser.Math.Between(-20, 0), 8, 8,
        colors[i % colors.length]);
      this.tweens.add({
        targets: sq, y: 500, x: x + Phaser.Math.Between(-60, 60),
        angle: Phaser.Math.Between(-360, 360),
        duration: Phaser.Math.Between(2000, 4000),
        delay: Phaser.Math.Between(0, 1500),
        repeat: -1,
        onRepeat: () => { sq.x = Phaser.Math.Between(0, 800); sq.y = -20; }
      });
    }
  }
}
