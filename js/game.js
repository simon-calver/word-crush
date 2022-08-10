
import GameOverScene from './game-over-scene.js';
import MainScene from './main-scene.js';
import MenuScene from './menu-scene.js';

// Load scenes
var gameOverScene = new GameOverScene();
var mainScene = new MainScene();
var menuScene = new MenuScene();

// Maximum width and height of game
const WIDTH = 360;
const HEIGHT = 720;
const MIN_WIDTH = 36;
const MIN_HEIGHT = 72;

// Set up Phaser game
var game = new Phaser.Game({
  type: Phaser.AUTO,
  dom: {
    createContainer: true
  },
  callbacks: {
    postBoot: function (game) {
      game.domContainer.style.pointerEvents = 'none';
    },
  },
  scale: {
    parent: 'phaser-app',
    mode: Phaser.Scale.WIDTH_CONTROLS_HEIGHT,
    width: WIDTH,
    height: HEIGHT,
    autoCenter: Phaser.Scale.CENTER_HORIZONTALLY,
    min: {
      width: MIN_WIDTH,
      height: MIN_HEIGHT
    },
    max: {
      width: WIDTH,
      height: HEIGHT
    }
  },
});

// Load scenes, the order they are loaded in will affect depth sorting
game.scene.add('MainScene', mainScene);
game.scene.add('GameOverScene', gameOverScene);
game.scene.add('MenuScene', menuScene);

// Start the game
game.scene.start('MainScene');
