import Phaser from 'phaser';
import Boot              from './scenes/Boot.js';
import CharacterSelect   from './scenes/CharacterSelect.js';
import Level1_Guardia    from './scenes/Level1_Guardia.js';
import Level2_Salones    from './scenes/Level2_Salones.js';
import Level3_Cantina    from './scenes/Level3_Cantina.js';
import Level4_Canchas    from './scenes/Level4_Canchas.js';
import Level5_Piscina    from './scenes/Level5_Piscina.js';
import Level6_Barranquito from './scenes/Level6_Barranquito.js';
import Victory           from './scenes/Victory.js';

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 450,
  pixelArt: true,
  backgroundColor: '#1a1a2e',
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 800 }, debug: false },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [
    Boot, CharacterSelect,
    Level1_Guardia, Level2_Salones, Level3_Cantina,
    Level4_Canchas, Level5_Piscina, Level6_Barranquito,
    Victory,
  ],
};

new Phaser.Game(config);
