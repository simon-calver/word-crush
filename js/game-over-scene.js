export default class GameOverScene extends Phaser.Scene {

  constructor() {
    super('GameOverScene');
  }

  create(data = { mainScene: Phaser.Scene }) {
    let { width, height } = this.sys.game.canvas;
    const menuY = 193;

    let backgroundTop = this.add.image(width / 2, menuY, 'menu-top').setOrigin(0.5, 0);
    let backgroundMiddle = this.add.image(width / 2, menuY + backgroundTop.displayHeight, 'menu-middle').setOrigin(0.5, 0);
    let backgroundBottom = this.add.image(width / 2, menuY + backgroundTop.displayHeight + backgroundMiddle.displayHeight, 'menu-top').setOrigin(0.5, 0);
    backgroundBottom.flipY = true;

    // Info text
    this.add.bitmapText(width / 2, height / 4 + 58, 'main-font', 'Game Over', 38).setOrigin(0.5);

    // Button
    let buttonBackground = this.add.image(width / 2, height / 4 + 132, 'button').setOrigin(0.5).setTint(0x848484);
    buttonBackground.displayWidth = 0.8 * width;
    buttonBackground.displayHeight = 60;

    let retryText = this.add.bitmapText(width / 2, height / 4 + 132, 'main-font', 'Play Again', 30).setOrigin(0.5).setInteractive();

    retryText.on('pointerdown', () => {
      data.mainScene.restart();
      this.scene.stop();
    }, this)
  }
}
