
const TILE_COLOURS = [
  0xa4a4a4, // 0x848484, //0xF29B0D, //0x280df2,//0xff00ff,// 0xff7aff, // blank colour
  0x0d64f2, //0x0000ff, //0x0000ac //          // letter tile colour
];

const DETAIL_COLOUR = 0xa4a4a4;  // TILE_COLOURS[0];
const TILE_COLOUR = 0x0d64f2;
const BACKGROUND_COLOUR = 0x000000;

class EmptyTile {
  constructor() {
  }

  getLetter() {
    return ' ';
  }

  setTilePosition() {
  }

  resetPosition() {
  }

  remove() {
  }
  // getGridPos() {

  // }
}


class LetterTile extends Phaser.GameObjects.Container {
  constructor(scene, x, y, cellSize, letter, gridPos, fontSize = 36) {
    super(scene, x, y); //, [this.tile, this.text]);
    scene.add.existing(this);

    // this.scene = scene;

    this.tile = scene.add.image(0, 0, 'letter-tile').setOrigin(0.5).setTint(TILE_COLOURS[1]);
    this.tile.displayHeight = cellSize, this.tile.displayWidth = cellSize;
    this.text = scene.add.bitmapText(0, 0, 'main-font', letter.toUpperCase(), fontSize).setOrigin(0.5).setDropShadow(2, 2, 0x000000);

    scene.add.existing(this.tile);
    scene.add.existing(this.text);

    this.add(this.tile);
    this.add(this.text);

    this.setSize(cellSize, cellSize);

    this.id = gridPos;

    // super(scene, x, y, [this.tile, this.text]);
    // scene.add.existing(this);

    // Put into container so it can be dragged
    // this.container = scene.add.container(x, y, [this.tile, this.text]);
    // scene.add.existing(this.container);

    // this.container.setSize(cellSize, cellSize);

    this.tileOriginX = x;
    this.tileOriginY = y;

    // console.log(this.originX)
    this.allowDrag = true;

    this.setInteractive();
    scene.input.setDraggable(this);

    // if (topTile) {
    //   this.addGlow(0.75);

    //   this.container.setInteractive();
    //   scene.input.setDraggable(this.container);
    //   // scene.input.on('drag', function (pointer, gameObject, dragX, dragY) {
    //   //   console.log(this.originX);
    //   //   // if (this.allowDrag) {
    //   //   //   gameObject.x = dragX;
    //   //   //   gameObject.y = dragY;
    //   //   //   if (Math.abs(dragX - this.originX) > 10) {
    //   //   //     this.allowDrag = false;
    //   //   //   }
    //   //   // }
    //   // }, this);
    //   // } else {
    //   //   this.addFade();
    // }

    // this.setText();
    // this.getGridPos();
  }

  resetPosition() {
    // Tween to new position, or could use physics and acceleration?
    const speed = 0.1; // pix per millisec
    const duration = Phaser.Math.Distance.Between(this.x, this.y, this.tileOriginX, this.tileOriginY) / speed;

    this.scene.tweens.add({
      targets: this,
      x: this.tileOriginX,
      y: this.tileOriginY,
      duration: duration,
    });


    // Increase the score by incrementing one point at a time in the display
    // this.tweens.addCounter({
    //   from: oldScore,
    //   to: newScore,
    //   duration: 1000,
    //   onStart: function () {
    //     this.scoreText.setTint(textColour);
    //   }.bind(this),
    //   onUpdate: function (tween) {
    //     this.updateScoreText(tween.getValue());
    //   }.bind(this),
    //   onComplete: function () {
    //     this.scoreText.setTint(0xffffff);
    //     emitter.explode(10, width - 20 - this.scoreText.width / 2, 20);
    //   }.bind(this)
    // });

    // console.log(this.position)
    // this.x = this.tileOriginX;
    // this.y = this.tileOriginY;
  }

  deactivate() {
    this.tile.setVisible(false);
    this.setText(' ')
  }

  setTilePosition(pos) {
    this.tileOriginX = pos.x;
    this.tileOriginY = pos.y;
    // this.x = x;
    // this.y = y;
  }

  // setPosition(x, y) { 
  //   this.tileOriginX = x;
  //   this.tileOriginY = y;
  //   this.x = x;
  //   this.y = y;
  // }

  getGridPos() {
    // console.log(this)
    let gridX = (this.tileOriginX - this.scene.startX) / this.scene.cellWidth;
    let gridY = (this.tileOriginY - this.scene.startY) / this.scene.cellWidth;
    return { gridX, gridY }
  }

  getLetter() {
    return this.text.text.toLowerCase();
  }

  updateLetter() {
    const { gridX, gridY } = this.getGridPos();
    this.setLetter(this.scene.letterGrid[gridX][gridY]);
  }

  setLetter(letter) {
    this.text.text = letter.toUpperCase();
  }

  remove() {
    this.tile.setTint('0x222222');
    // console.log(this.container)
    this.scene.time.addEvent({
      delay: 2000,
      loop: false,
      callback: this.destroy, //this.spawnShape,
      callbackScope: this
    }, this);
    // this.container.destroy();
  }
}

export { EmptyTile, LetterTile };