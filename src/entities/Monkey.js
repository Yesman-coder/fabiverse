export default class Monkey extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'monkey');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.allowGravity = false;
    this.setDepth(4);
    this._bobTween = scene.tweens.add({
      targets: this, y: y - 6,
      duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
    });
  }

  flee(scene) {
    this._bobTween?.stop();
    scene.tweens.add({
      targets: this, x: this.x + 400, duration: 600, ease: 'Quad.easeIn',
      onComplete: () => this.setVisible(false)
    });
  }
}
