export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, character) {
    super(scene, x, y, character);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.character = character;
    this.speed = 160;
    this.jumpVel = character === 'milan' ? -624 : -520;
    this.interactables = [];
    this._moveLocked = false;
    this.abilityUsed = false;
    this._coyote = 0;
    this._jumpBuf = 0;
    this.COYOTE   = 80;
    this.JUMP_BUF = 100;

    this.setCollideWorldBounds(true);
    this.setDisplaySize(38, 58);
    this.body.setSize(34, 52).setOffset(2, 3);
    this.setDepth(5);

    this._cursors = scene.input.keyboard.createCursorKeys();
    this._wasd = scene.input.keyboard.addKeys({
      up:    Phaser.Input.Keyboard.KeyCodes.W,
      left:  Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });
    this._eKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this._qKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
    this._spaceKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    this._prompt = scene.add.text(0, -50, '[E]', {
      fontSize: '11px', fontFamily: 'monospace',
      color: '#ffffff', backgroundColor: '#00000088',
      padding: { x: 3, y: 2 }
    }).setOrigin(0.5).setDepth(6).setVisible(false);

    this._createAnims(scene);
    scene.registry.set('player', this);
  }

  _createAnims(scene) {
    const c = this.character;
    if (scene.anims.exists(`${c}_idle`)) return;
    const f0 = [{ key: c, frame: 0 }];
    scene.anims.create({ key: `${c}_idle`, frames: f0, frameRate: 1,  repeat: -1 });
    scene.anims.create({ key: `${c}_walk`, frames: f0, frameRate: 8,  repeat: -1 });
    scene.anims.create({ key: `${c}_jump`, frames: f0, frameRate: 1,  repeat:  0 });
    // When real spritesheet arrives, replace f0 above with:
    // walk: scene.anims.generateFrameNumbers(c, { start: 1, end: 4 })
    // jump: [{ key: c, frame: 5 }]
  }

  update(delta) {
    if (this._moveLocked) { this.setVelocityX(0); return; }

    const onGround = this.body.blocked.down;
    const left  = this._cursors.left.isDown  || this._wasd.left.isDown;
    const right = this._cursors.right.isDown || this._wasd.right.isDown;
    const jumpNow =
      Phaser.Input.Keyboard.JustDown(this._cursors.up)  ||
      Phaser.Input.Keyboard.JustDown(this._spaceKey)    ||
      Phaser.Input.Keyboard.JustDown(this._wasd.up);

    if (onGround) this._coyote = this.COYOTE;
    else          this._coyote = Math.max(0, this._coyote - delta);
    if (jumpNow)  this._jumpBuf = this.JUMP_BUF;
    else          this._jumpBuf = Math.max(0, this._jumpBuf - delta);

    if (left)       { this.setVelocityX(-this.speed); this.setFlipX(true); }
    else if (right) { this.setVelocityX(this.speed);  this.setFlipX(false); }
    else            { this.setVelocityX(0); }

    if (this._jumpBuf > 0 && this._coyote > 0) {
      this.setVelocityY(this.jumpVel);
      this._coyote = 0; this._jumpBuf = 0;
    }

    const c = this.character;
    if (!onGround)        this.play(`${c}_jump`, true);
    else if (left||right) this.play(`${c}_walk`, true);
    else                  this.play(`${c}_idle`, true);

    if (Phaser.Input.Keyboard.JustDown(this._eKey)) {
      const target = this._nearest(60);
      if (target) this.scene.events.emit('interact', target);
    }

    if (Phaser.Input.Keyboard.JustDown(this._qKey) && !this.abilityUsed) {
      this.abilityUsed = true;
      this.scene.events.emit('ability');
      if (this.character === 'fabi') {
        const target = this._nearest(220);
        if (target) {
          if (target.setTint) target.setTint(0xFFD700);
          this.scene.tweens.add({
            targets: target, alpha: 0.3, duration: 200,
            yoyo: true, repeat: 7,
            onComplete: () => {
              if (target.active) {
                target.setAlpha(1);
                if (target.clearTint) target.clearTint();
              }
            }
          });
        }
        if (this.scene.cache?.audio?.exists('sfx_ability'))
          this.scene.sound.play('sfx_ability', { volume: 0.7 });
      }
    }

    const nearest = this._nearest(60);
    if (nearest) {
      let txt = '[E]';
      if (nearest.requiresItem) {
        const inv = this.scene.registry.get('gameState')?.inventory ?? [];
        txt = inv.includes(nearest.requiresItem)
          ? `[E] usar ${nearest.requiresItem}`
          : `necesitas: ${nearest.requiresItem}`;
      }
      this._prompt.setText(txt).setPosition(nearest.x, nearest.y - 36).setVisible(true);
    } else {
      this._prompt.setVisible(false);
    }
  }

  _nearest(range) {
    this.interactables = this.interactables.filter(o => o?.active);
    let best = null, minD = range;
    for (const obj of this.interactables) {
      const d = Phaser.Math.Distance.Between(this.x, this.y, obj.x, obj.y);
      if (d < minD) { minD = d; best = obj; }
    }
    return best;
  }

  addInteractable(obj) { this.interactables.push(obj); }
  removeInteractable(obj) { this.interactables = this.interactables.filter(o => o !== obj); }
  lockMovement()       { this._moveLocked = true;  this.setVelocityX(0); }
  unlockMovement()     { this._moveLocked = false; }

  destroy(fromScene) {
    this._prompt?.destroy();
    super.destroy(fromScene);
  }
}
