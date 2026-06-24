export default class Professor extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, patrolLeft, patrolRight, coneWidth = 200) {
    super(scene, x, y, 'professor');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.allowGravity = false;
    this.body.setImmovable(true);
    this.setDepth(4);

    this._left  = patrolLeft;
    this._right = patrolRight;
    this._dir   = 1;
    this._speed = 70;
    this._coneW = coneWidth;

    // Vision cone: semi-transparent rectangle rendered in front of professor
    this.cone = scene.add.rectangle(x, y, coneWidth, 76, 0xff2200, 0.18).setDepth(3);
    scene.physics.add.existing(this.cone);
    this.cone.body.allowGravity = false;
    this.cone.body.setImmovable(true);
  }

  update() {
    this.setVelocityX(this._speed * this._dir);
    if (this.x >= this._right) this._dir = -1;
    if (this.x <= this._left)  this._dir =  1;
    this.setFlipX(this._dir === -1);

    const offsetX = this._dir * (this._coneW / 2 + 16);
    this.cone.setPosition(this.x + offsetX, this.y);
    this.cone.body.reset(this.x + offsetX, this.y);
  }

  destroy(fromScene) {
    if (this.cone?.active) this.cone.destroy();
    super.destroy(fromScene);
  }
}
