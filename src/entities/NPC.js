// Static NPC. Add to player.interactables.
// Scene listens on this.events.on('interact', obj => ...) and handles dialogue.
export default class NPC extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, textureKey) {
    super(scene, x, y, textureKey);
    scene.add.existing(this);
    scene.physics.add.existing(this, true); // static body
    this.body.allowGravity = false;
    this.setDepth(4);
  }
}
