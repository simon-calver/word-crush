const ALPHABET = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
const PROBABILITY = [0.077, 0.02, 0.04, 0.038, 0.11, 0.013, 0.029, 0.023, 0.082, 0.0021, 0.024, 0.052, 0.027, 0.072, 0.061, 0.027, 0.0024, 0.072, 0.087, 0.067, 0.033, 0.01, 0.0084, 0.0027, 0.016, 0.0044];
const WORD_SCORE = [0, 0, 1, 2, 3, 5]; // Index is length of word, value is score

const TILE_COLOURS = [
  0xa4a4a4, // 0x848484, //0xF29B0D, //0x280df2,//0xff00ff,// 0xff7aff, // blank colour
  0x0d64f2, //0x0000ff, //0x0000ac //          // letter tile colour
];

const DETAIL_COLOUR = 0xa4a4a4;  // TILE_COLOURS[0];
const TILE_COLOUR = 0x0d64f2;
const BACKGROUND_COLOUR = 0x000000;

// import MenuType from './menu-type';

export default class MainScene extends Phaser.Scene {

  constructor() {
    super('MainScene');
  }

  preload() {
    this.load.bitmapFont('main-font', `assets/fonts/mont-heavy/mont-heavy.png`, `assets/fonts/mont-heavy/mont-heavy.xml`);

    this.load.image('border-tile', 'assets/images/border-tile.png');
    this.load.image('grid-tile', 'assets/images/grid-tile.png');
    this.load.image('letter-tile', 'assets/images/letter-tile.png');

    this.load.image('menu-top', 'assets/images/menu-top.png');
    this.load.image('menu-middle', 'assets/images/menu-middle.png');

    this.load.image('tab-line', 'assets/images/tab-line.png');

    this.load.image('button', 'assets/images/button.png');

    this.load.image('gear', 'assets/images/icons/gear.png');
    this.load.image('star', 'assets/images/icons/star.png');
    this.load.image('cross', 'assets/images/icons/cross.png');
    this.load.image('question', 'assets/images/icons/question.png');

    this.load.text('words', 'assets/text/word-list.txt');
    this.load.text('bad-words', 'assets/text/profanity-list.txt');
  }

  create() {
    this.input.setDefaultCursor('url(assets/cursors/hand.cur), pointer');

    // Use cumulative probability to choose letters, could define this as const at the top
    this.cumulativeProbability = PROBABILITY.map((sum => value => sum += value)(0));

    let { width, height } = this.sys.game.canvas;
    const menuTabHeight = 40;
    this.addMenuBar(width, menuTabHeight);

    this.tilesWithLetters = 0;

    let numberOfLetters = 90;
    this.gridSize = 5;

    this.drawGrid(this.gridSize, menuTabHeight);
    this.generateTiles(numberOfLetters);
    this.addNextTileDisplay(menuTabHeight);


    this.wordsFound = [] //['ALL', 'WORDS', 'FOUND', 'SHOWN', 'HERE', 'WORD']; //'ss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss'];
    this.wordsFoundBitmap = this.add.bitmapText(width / 2, 100 + menuTabHeight + 1.05 * 60 * this.gridSize, 'main-font', this.wordsFound.join('  '), 18).setOrigin(0.5, 0);
    this.wordsFoundBitmap.setMaxWidth(0.95 * width);
    this.wordsFoundBitmap.setCenterAlign();

    // Load valid word list
    let cache = this.cache.text;
    this.wordList = cache.get('words').split('\n'); // Need to make sure line endings are correct
    this.badWordList = cache.get('bad-words').split('\n'); // Need to make sure line endings are correct

    // Game timer
    // this.maxSeconds = 480; // Time limit in seconds
    // this.addTimer(320, 25);
    // this.timer = this.time.addEvent({
    //   delay: 1000 * this.maxSeconds, // The timer uses milliseconds
    // });

    this.totalScore = 0;
    this.scoreForTurn = 0;
    this.multiplier = 0;

    this.addScoreText(320, 80);


    this.isGameOver = false;
  }

  addMenuBar(width, height) {
    let menuTabBackground = this.add.image(width / 2, height, 'tab-line').setOrigin(0.5, 0).setTint(DETAIL_COLOUR);
    menuTabBackground.displayWidth = width;
    menuTabBackground.displayHeight = 2;

    // let settingsIcon = this.add.sprite(width - 10, height / 2, 'gear').setOrigin(1, 0.5).setScale(0.5).setInteractive();
    let scoreIcon = this.add.sprite(width - 10, height / 2, 'star').setOrigin(1, 0.5).setScale(0.5).setInteractive();
    let howToPlayIcon = this.add.sprite(10, height / 2, 'question').setOrigin(0, 0.5).setScale(0.5).setInteractive();

    // settingsIcon.on('pointerdown', () => this.launchMenuScene('MenuScene', 'settings'));
    scoreIcon.on('pointerdown', () => this.launchMenuScene('MenuScene', 'stats'));
    howToPlayIcon.on('pointerdown', () => this.launchMenuScene('MenuScene', 'how_to_play'))
  }

  launchMenuScene(sceneName, menuType) {
    this.scene.launch(sceneName, { mainScene: this.scene, menuType: menuType });
    this.pasuseScenes();
  }

  pasuseScenes() {
    this.scene.pause('GameOverScene');
    this.scene.pause();
  }

  addNextTileDisplay(menuTabHeight) {
    let startX = 40;
    // Set the depths better!!
    this.secondNextTile = new LetterTile(this, startX + 10, 40 + menuTabHeight, 45, 27);
    this.secondNextTile.setDepth(-1);
    this.secondNextTile.addFade();

    this.nextTile = new LetterTile(this, startX + 60, 40 + menuTabHeight, 45, 27);
    this.nextTile.setDepth(-1);
    this.nextTile.addFade();

    this.currentTile = new LetterTile(this, startX + 120, 40 + menuTabHeight, 60);
    this.currentTile.setDepth(2);
    this.currentTile.addGlow(0.75);
    this.currentTile.glow.setDepth(1);
    this.currentTile.text.setDepth(2);

    this.displayPlayerTiles();
  }

  // addTimer(x, y) {
  //   this.timerText = this.add.bitmapText(x, y, 'main-font', this.timeToText(0), 28).setOrigin(1, 0.5);
  // }

  // // pauseTimer() {
  // //   this.timer.paused = true;
  // // }

  // timeToText(time) {
  //   const minutes = Phaser.Utils.String.Pad(Math.floor(time / 60), 2, '0', 1); // The last argument is the side the padding is added,: 1 for left, 2 for right
  //   const seconds = Phaser.Utils.String.Pad(Math.floor(time % 60), 2, '0', 1);
  //   return `${minutes}:${seconds}`;
  // }

  // update() {
  //   // const timeLeft = this.maxSeconds - Math.floor(this.timer.getElapsed() / 1000)
  //   // this.timerText.text = this.timeToText(timeLeft);
  //   // console.log(this.scoreForTurn);
  //   // console.log(this.totalScore);

  //   // console.log(this.tilesWithLetters);
  // }

  drawGrid(gridSize, menuTabHeight) {
    let { width, height } = this.sys.game.canvas;
    let cellWidth = 60;

    let startX = (width - 1.05 * gridSize * cellWidth + cellWidth) / 2;
    let startY = 120 + menuTabHeight;

    this.tiles = []
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        let tile = new GridCell(this, startX + i * 1.05 * cellWidth, startY + j * 1.05 * cellWidth, cellWidth);

        tile.on('pointerdown', () => {
          this.input.setDefaultCursor('url(assets/cursors/hand-dark.cur), pointer');

          if (!tile.isLocked) {
            this.placeTile(tile);

            // Delay checking for words so tile can be clicked again
            if (!tile.justClicked) {
              tile.justClicked = true;
              this.time.addEvent({
                delay: 200,
                callback: () => {
                  this.checkForWords();
                  tile.justClicked = false;
                  // Stop unlocked tiles from being clicked, only locked ones are interactive so
                  // they can be unlocked. This is not nicely done!
                  if (!tile.isLocked) {
                    tile.disableInteractive();
                  }
                }
              });
            } else {
              // Stop tile from making words
              tile.lockCell();
            }

          } else {
            tile.unlockCell();
            // Add delay to allow multiple cells to be unlocked???
            this.time.addEvent({
              delay: 400,
              callback: () => {
                this.checkForWords();
              }
            });
          }

          this.time.addEvent({
            delay: 200,
            callback: () => {
              this.input.setDefaultCursor('url(assets/cursors/hand.cur), pointer');
            }
          });

        });

        // Add to array of tiles
        this.tiles.push(tile);
      }
    }
  }

  placeTile(tile) {
    let currentTile = '';
    if (this.placeTile.length) {
      currentTile = this.playerTiles.pop();
    }

    if (tile.hasLetter && this.switchTiles) {
      // If there is already a tile in this cell switch with the current one (if switchTiles is true)
      this.playerTiles.push(tile.getText())
      tile.setText(currentTile);
    } else if (this.currentTile && !tile.hasLetter) {
      // Otherwise only add a tile if the cell is empty
      tile.setText(currentTile);
    } else {
      // Add tile back if no interaction is possible. Maybe do this in a neater way?
      this.playerTiles.push(currentTile)
    }

    this.displayPlayerTiles();
  }

  addScoreText(x, y) {
    this.scoreText = this.add.bitmapText(x, y, 'main-font', this.scoreToString(this.totalScore), 36).setOrigin(1, 0.5);//.setDropShadow(4, 4, 0x000000);
    this.updateScore();
  }

  scoreToString(score) {
    return Phaser.Utils.String.Pad(Math.floor(Math.abs(score)), 4, ' ', 1);
  }

  checkForWords() {
    // Add this.ischeckingforwords so this does not get called while it is currently checking. Or make asyncronous??
    // I don't think this causes any errors but it seems uneccessary to call it as often as it is (especially if unlocking multiple tiles)
    // May also cause multiplier to incrase if turns taken quickly (is this a feature?)
    let indicesToUpdate = [];
    for (let i = 0; i < this.gridSize; i++) {
      // Get letters and corresponding grid point for the rows and columns
      let columns = Array.from(Array(this.gridSize).keys()).map(index => [this.gridSize * i + index, this.tiles[this.gridSize * i + index].getText()]);
      let rows = Array.from(Array(this.gridSize).keys()).map(index => [i + this.gridSize * index, this.tiles[i + this.gridSize * index].getText()]);

      for (const letters of [columns, rows]) {
        let word = letters[0][1];
        let wordIndices = letters[0][1] ? [letters[0][0]] : [];

        for (let j = 1; j < this.gridSize; j++) {
          if (letters[j][1]) {
            word += letters[j][1];
            wordIndices.push(letters[j][0])
          }
          if (!letters[j][1] || j == this.gridSize - 1) {
            if (this.isValidWord(word)) {
              this.wordFound(word, wordIndices);
              indicesToUpdate.push(wordIndices);
            }
            word = "";
            wordIndices = [];
          }
        }
      }
    }

    for (const indices of indicesToUpdate) {
      for (const i of indices) {
        this.tiles[i].resetCell();
      }
    }
    this.displayWordsFound();

    // New words may have been made by removing these letters so run this again if indicesToUpdate is non-empty
    if (indicesToUpdate.length) {
      // Add delay so words are not added at the same time
      this.time.addEvent({
        delay: 1000,
        callback: () => {
          this.checkForWords();
        }
      });
    } else {
      let score = this.scoreForTurn * this.multiplier;
      this.updateScore(score);

      if (this.tilesWithLetters == this.gridSize ** 2 || !this.playerTiles.length) {
        // The grid is full and no words are made: game over!
        this.gameOver();
      }
    }
  }

  gameOver() {
    // Stop this from being called more than once during game
    if (!this.isGameOver) {
      this.isGameOver = true;

      // Stop all tiles from being interactive, otherwise it will keep checking for words
      for (let tile of this.tiles) {
        tile.disableInteractive();
      }
      this.computeFinalScore();

      this.scene.launch('GameOverScene', { mainScene: this.scene });
    }
  }

  computeFinalScore() {
    let delay = 0;
    let { width, _ } = this.sys.game.canvas;

    let allTileScore = 10;
    if (!this.playerTiles.length) {
      this.movingText(width / 2, 190, `all tiles used +${allTileScore}`)
      this.updateScore(allTileScore);
      delay = 1500;
    }

    let gridClearScore = 20;
    if (!this.tilesWithLetters) {
      this.movingText(width / 2, 190, `grid cleared +${gridClearScore}`, delay)
      this.updateScore(gridClearScore);
    }

    this.submitScore(this.totalScore);
  }

  updateScore(score) {
    this.scoreForTurn = 0;
    this.multiplier = 0;
    if (score) {
      this.increaseScoreTween(score);
    }
  }

  increaseScoreTween(score) {
    // Increase the score by incrementing one point at a time in the display
    this.tweens.addCounter({
      from: this.totalScore,
      to: this.totalScore += score,
      duration: Math.abs(500),
      ease: Phaser.Math.Easing.Sine.Out,
      onUpdate: function (tween) {
        this.scoreText.text = this.scoreToString(tween.getValue());
      }.bind(this)
    });
  }

  submitScore(score) {
    getStats().then(response => {
      let currentPlayed = parseInt(response['played']);
      let newAvg = (currentPlayed * parseFloat(response['average']) + score) / (currentPlayed + 1);
      let newHigh = Math.max(parseInt(response['high']), score);

      setScoreCookie({
        user: response['user'],
        played: currentPlayed + 1,
        average: newAvg,
        high: newHigh
      });
    });

    getUser()
      .then(response => updateScore(response, score))
      .catch(error => console.log('Error:', error));
  }

  wordFound(word, wordIndices) {
    word = this.censorWord(word);
    this.wordsFound.push(word.toUpperCase());
    this.scoreForTurn += WORD_SCORE[word.length];
    this.multiplier += 1;

    let x = this.tiles[wordIndices.slice(-1)].x;
    let y = this.tiles[wordIndices.slice(-1)].y;

    // Word score text
    this.movingText(x, y, `+${WORD_SCORE[word.length]}`);
    if (this.multiplier > 1) {
      this.movingText(x + 30, y - 30, `x${this.multiplier}`);
    }
  }

  censorWord(word) {
    if (this.badWordList.includes(word)) {
      console.log(word.length)
      return word.replace(word.substring(1, word.length - 1), "*".repeat(word.length - 2));
    } else {
      return word;
    }
  }

  showWordScore(gridIndex, score) {
    this.movingText(this.tiles[gridIndex].x, this.tiles[gridIndex].y, `+${score}`);
  }

  showMultiplier(gridIndex, multiplier) {
    this.movingText(this.tiles[gridIndex].x, this.tiles[gridIndex].y, `x${multiplier}`);
  }

  movingText(x, y, text, delay = 0) {
    let bmt = this.add.bitmapText(x, y, 'main-font', text, 24).setOrigin(0.5, 0.5).setTint(0xffff00).setDepth(20).setVisible(false);

    this.tweens.addCounter({
      from: 2,
      to: 0.0,
      delay: delay,
      duration: 2500,
      onStart: function () {
        bmt.setVisible(true)
      },
      onUpdate: function (tween) {
        bmt.y -= 0.5;
        // Only starts fading once half way through tween, can this be done better?
        if (tween.getValue() <= 1.0) {
          bmt.setAlpha(tween.getValue());
        }
      },
      onComplete: function (tween) {
        bmt.destroy();
      }
    });
  }

  generateTiles(playerTileCount) {
    this.playerTiles = [];
    for (let i = 0; i < playerTileCount; i++) {
      // Random letter picker based on letter frequency: 
      // 1. Get random number in range 0..1
      // 2. Find first index in cumulative probabilities that this is greater than
      let random = Phaser.Math.FloatBetween(0, 1);
      let letterIndex = this.cumulativeProbability.findIndex(function (number) {
        return number > random;
      });
      this.playerTiles.push(ALPHABET[letterIndex]);
    }

    // this.playerTiles = ['F', 'U', 'C', 'k', 'S'] //'O', 'S', 'Q', 'W', 'T', 'O', 'W', 'R', 'D', 'S']

  }

  displayCurrentTile() {
    this.currentTile.setText(this.playerTiles.slice(-1));
  }

  displayPlayerTiles() {
    this.currentTile.setText(this.playerTiles.slice(-1));
    this.nextTile.setText(this.playerTiles.slice(-2, -1));
    this.secondNextTile.setText(this.playerTiles.slice(-3, -2));

    if (this.playerTiles.length == 2) {
      this.secondNextTile.remove();
    }
    if (this.playerTiles.length == 1) {
      this.nextTile.remove();
    }
    if (this.playerTiles.length == 0) {
      this.currentTile.remove();
    }
  }

  displayWordsFound() {
    this.wordsFoundBitmap.text = this.wordsFound.join('  ');
  }

  isValidWord(word) {
    return this.wordList.includes(word);
  }
}

class GridCell extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, cellSize, fontSize = 36) {
    super(scene, x, y, 'grid-tile').setOrigin(0.5).setTint(TILE_COLOURS[0]).setInteractive();
    scene.add.existing(this);

    this.displayHeight = cellSize, this.displayWidth = cellSize;

    this.text = scene.add.bitmapText(x, y, 'main-font', '', fontSize).setOrigin(0.5).setDepth(1).setDropShadow(2, 2, 0x000000)
    this.hasLetter = false;
    this.justClicked = false;
    this.isLocked = false;
    this.isReseting = false;
  }

  setText(newText) {
    this.text.text = newText;
    if (newText) {
      this.hasLetter = true;
      this.setTint(TILE_COLOURS[1]);
      this.setTexture('letter-tile');
      // Increase tile count
      this.scene.tilesWithLetters += 1;
    } else {
      this.hasLetter = false;
      this.setTint(TILE_COLOURS[0]);
      this.setTexture('grid-tile');
    }
  }

  lockCell() {
    this.isLocked = true;
    this.lock = this.scene.add.sprite(this.x, this.y, 'border-tile').setOrigin(0.5).setTint(BACKGROUND_COLOUR);// DETAIL_COLOUR); //BACKGROUND_COLOUR);// 0x404040);
    this.lock.displayHeight = this.displayHeight, this.lock.displayWidth = this.displayWidth;
  }

  unlockCell() {
    if (this.isLocked) {
      this.isLocked = false;
      this.lock.destroy();
    }
  }

  getText() {
    if (this.isLocked) {
      return '-';
    } else {
      return this.hasLetter ? this.text.text.toLowerCase() : '';
    }
  }

  addGlow(alpha = 0) {
    this.glow = this.scene.add.sprite(this.x, this.y, 'letter-tile').setOrigin(0.5).setTint(0xffffff).setDepth(-1).setAlpha(alpha);

    this.glow.displayHeight = 1.1 * this.displayHeight;
    this.glow.displayWidth = 1.1 * this.displayWidth;
  }

  addFade() {
    this.fade = this.scene.add.sprite(this.x, this.y, 'letter-tile').setOrigin(0.5).setTint(0x000000).setDepth(1).setAlpha(0.5);

    this.fade.displayHeight = this.displayHeight;
    this.fade.displayWidth = this.displayWidth;
  }

  resetCell() {
    if (!this.isReseting) {
      // Does the order matter here? can a press after hasletter =false but before disable do anything?

      this.isReseting = true;
      this.hasLetter = false;
      this.unlockCell();
      this.disableInteractive();

      this.scene.tilesWithLetters -= 1;

      this.addGlow();

      this.scene.tweens.add({
        targets: this.glow,
        alpha: 1,
        duration: 400,
        ease: 'Power2',
        yoyo: true,
        onComplete: function (tween) {
          this.setText('');
          this.setTint(TILE_COLOURS[0]);
          this.setInteractive();
          this.glow.destroy();
          this.isReseting = false;
        }.bind(this)
      });
    }
  }

  remove() {
    this.text.destroy();
    if (this.glow) {
      this.glow.destroy();
    }
    this.destroy();
  }
}

class LetterTile extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, cellSize, fontSize = 36) {
    super(scene, x, y, 'letter-tile').setOrigin(0.5).setTint(TILE_COLOURS[0]).setInteractive();
    scene.add.existing(this);

    this.displayHeight = cellSize, this.displayWidth = cellSize;

    this.text = scene.add.bitmapText(x, y, 'main-font', '', fontSize).setOrigin(0.5).setDepth(1).setDropShadow(2, 2, 0x000000)
  }

  setText(newText) {
    this.text.text = newText;
    this.setTint(TILE_COLOURS[1]);
  }

  addGlow(alpha = 0) {
    this.glow = this.scene.add.sprite(this.x, this.y, 'letter-tile').setOrigin(0.5).setTint(0xffffff).setDepth(-1).setAlpha(alpha);

    this.glow.displayHeight = 1.1 * this.displayHeight;
    this.glow.displayWidth = 1.1 * this.displayWidth;
  }

  addFade() {
    this.fade = this.scene.add.sprite(this.x, this.y, 'letter-tile').setOrigin(0.5).setTint(0x000000).setDepth(1).setAlpha(0.5);

    this.fade.displayHeight = this.displayHeight;
    this.fade.displayWidth = this.displayWidth;
  }

  remove() {
    this.text.destroy();
    if (this.glow) {
      this.glow.destroy();
    }
    this.destroy();
  }
}
