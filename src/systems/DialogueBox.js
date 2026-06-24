import { t } from '../i18n/index.js';

export default class DialogueBox {
  constructor(scene) {
    this.scene = scene;
    this._open = false;
    this._lines = [];
    this._idx = 0;
    this._onComplete = null;

    this.bg = scene.add.rectangle(400, 410, 780, 88, 0x0d0d2b, 0.93)
      .setScrollFactor(0).setDepth(20).setVisible(false);
    this.border = scene.add.rectangle(400, 410, 784, 92, 0x5577ff, 0)
      .setStrokeStyle(2, 0x5577ff).setScrollFactor(0).setDepth(20).setVisible(false);
    this.speakerTxt = scene.add.text(16, 372, '', {
      fontSize: '13px', fontFamily: 'monospace', color: '#88aaff', fontStyle: 'bold'
    }).setScrollFactor(0).setDepth(21).setVisible(false);
    this.bodyTxt = scene.add.text(16, 390, '', {
      fontSize: '13px', fontFamily: 'monospace', color: '#ffffff',
      wordWrap: { width: 752 }
    }).setScrollFactor(0).setDepth(21).setVisible(false);
    this.arrow = scene.add.text(758, 428, '▶', {
      fontSize: '11px', fontFamily: 'monospace', color: '#88aaff'
    }).setScrollFactor(0).setDepth(21).setVisible(false);

    scene.tweens.add({ targets: this.arrow, alpha: 0.2, duration: 400, yoyo: true, repeat: -1 });
    scene.input.keyboard.on('keydown-SPACE', () => this._advance());
    scene.input.keyboard.on('keydown-E', () => this._advance());
  }

  // speakerKey: i18n key for speaker name (or '' for none)
  // lineKeys: array of i18n keys
  // onComplete: optional callback fired after last line is dismissed
  show(speakerKey, lineKeys, onComplete) {
    if (this._open) return;
    this._open = true;
    this._lines = lineKeys.map(k => t(k));
    this._idx = 0;
    this._onComplete = onComplete || null;
    this.speakerTxt.setText(speakerKey ? t(speakerKey) : '');
    this.bodyTxt.setText(this._lines[0]);
    this._setVisible(true);
    const player = this.scene.registry.get('player');
    if (player) player.lockMovement();
  }

  _advance() {
    if (!this._open) return;
    this._idx++;
    if (this._idx < this._lines.length) {
      this.bodyTxt.setText(this._lines[this._idx]);
    } else {
      this._close();
    }
  }

  _close() {
    this._open = false;
    this._setVisible(false);
    const player = this.scene.registry.get('player');
    if (player) player.unlockMovement();
    this.scene.events.emit('dialogueComplete');
    if (this._onComplete) this._onComplete();
  }

  isOpen() { return this._open; }

  _setVisible(v) {
    [this.bg, this.border, this.speakerTxt, this.bodyTxt, this.arrow]
      .forEach(o => o.setVisible(v));
  }

  destroy() {
    [this.bg, this.border, this.speakerTxt, this.bodyTxt, this.arrow]
      .forEach(o => o.destroy());
  }
}
