import { t } from '../i18n/index.js';

const SLOT = 40;
const PAD  = 4;

export default class InventoryUI {
  constructor(scene) {
    this.scene = scene;
    this._slots = [];
    this._tradeMode = false;
    this._tradeCallback = null;
    this._tradeHint = null;
    this._refresh();
  }

  _refresh() {
    const gs = this.scene.registry.get('gameState');
    const items = gs?.inventory ?? [];
    this._slots.forEach(s => { s.bg.destroy(); s.icon?.destroy(); });
    this._slots = [];
    items.forEach((key, i) => {
      const x = 760 - i * (SLOT + PAD);
      const bg = this.scene.add.rectangle(x, 24, SLOT, SLOT, 0x222244, 0.85)
        .setStrokeStyle(1, 0x4466aa).setScrollFactor(0).setDepth(15);
      let icon;
      if (this.scene.textures.exists(key)) {
        icon = this.scene.add.image(x, 24, key)
          .setDisplaySize(28, 28).setScrollFactor(0).setDepth(16);
      } else {
        icon = this.scene.add.text(x - 12, 16, key.slice(0, 4), {
          fontSize: '9px', fontFamily: 'monospace', color: '#ffffff'
        }).setScrollFactor(0).setDepth(16);
      }
      this._slots.push({ bg, icon, key });
    });
  }

  addItem(key) {
    const gs = this.scene.registry.get('gameState');
    if (!gs.inventory.includes(key)) {
      gs.inventory.push(key);
      this.scene.registry.set('gameState', gs);
    }
    this._refresh();
  }

  openTradeMode(callback) {
    this._tradeMode = true;
    this._tradeCallback = callback;
    this._tradeHint = this.scene.add.text(400, 355, '— Selecciona un objeto —', {
      fontSize: '12px', fontFamily: 'monospace', color: '#ffdd44',
      backgroundColor: '#000000cc', padding: { x: 8, y: 4 }
    }).setOrigin(0.5).setScrollFactor(0).setDepth(18);
    this._slots.forEach(s => {
      s.bg.setInteractive({ useHandCursor: true });
      s.bg.on('pointerover', () => s.bg.setStrokeStyle(2, 0xffdd44));
      s.bg.on('pointerout',  () => s.bg.setStrokeStyle(1, 0x4466aa));
      s.bg.on('pointerdown', () => this._pick(s.key));
    });
  }

  _pick(key) {
    this._tradeMode = false;
    this._tradeHint?.destroy(); this._tradeHint = null;
    this._slots.forEach(s => s.bg.removeInteractive());
    if (this._tradeCallback) this._tradeCallback(key);
  }

  destroy() {
    this._slots.forEach(s => { s.bg.destroy(); s.icon?.destroy(); });
    this._tradeHint?.destroy();
  }
}
