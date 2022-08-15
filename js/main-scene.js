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
  }

  create() {
    // Use cumulative probability to choose letters, could define this as const at the top
    this.cumulativeProbability = PROBABILITY.map((sum => value => sum += value)(0));

    let { width, height } = this.sys.game.canvas;

    this.cellWidth = 62;
    this.tileWidth = 60;

    this.gridWidth = 5;
    this.gridHeight = 8;

    this.startX = (width - this.gridWidth * this.cellWidth + this.cellWidth) / 2;
    this.startY = 120;

    this.makeGrid();

    this.movesLeft = 20
    this.movesLeftText = this.add.bitmapText(width / 2, 0, 'main-font', this.movesLeft, 18).setOrigin(0.5, 0);

    this.allowDrag = true;

    this.input.on('drag', function (pointer, gameObject, dragX, dragY) {
      if (this.allowDrag) {
        gameObject.x = dragX;
        gameObject.y = dragY;
        if (Math.abs(dragX - gameObject.tileOriginX) > 20) {
          let { gridX, gridY } = gameObject.getGridPos();

          // if (this.tiles[gridX + Math.sign(dragX - gameObject.tileOriginX)] instanceof LetterTile) {
          if (this.tiles[gridX + Math.sign(dragX - gameObject.tileOriginX)]) {
            this.allowDrag = false;
            // this.swapLetters(gridX, gridY, gridX + Math.sign(dragX - gameObject.tileOriginX), gridY);
            this.swapTiles(gridX, gridY, gridX + Math.sign(dragX - gameObject.tileOriginX), gridY);
            // gameObject.resetPosition();
            this.checkForWords();
          }
          // else {
          //   gameObject.resetPosition();
          // }
        } else if ((Math.abs(dragY - gameObject.tileOriginY) > 20)) {
          let { gridX, gridY } = gameObject.getGridPos();
          // if (this.tiles[gridX][gridY + Math.sign(dragY - gameObject.tileOriginY)] instanceof LetterTile) {
          if (this.tiles[gridX][gridY + Math.sign(dragY - gameObject.tileOriginY)]) {
            this.allowDrag = false;
            // this.swapLetters(gridX, gridY, gridX, gridY + Math.sign(dragY - gameObject.tileOriginY));
            this.swapTiles(gridX, gridY, gridX, gridY + Math.sign(dragY - gameObject.tileOriginY));
            // gameObject.resetPosition();
            this.checkForWords();
          }
        }
      }
    }, this);



    // let gridY = (gameObject.id % 8);
    // let gridX = ((gameObject.id - gridY) / 8);

    // let swapId = 8 * (gridX + Math.sign(dragX - gameObject.tileOriginX)) + gridY;

    // let swapTile = this.tiles[swapId];
    // if (typeof swapTile !== 'undefined') {
    //   let newLetter = swapTile.text.text;
    //   this.tiles[swapId].text.text = gameObject.text.text;
    //   gameObject.text.text = newLetter;

    //   gameObject.resetPosition();
    //   this.checkForWords();
    // }
    // }
    // } else if (Math.abs(dragY - gameObject.tileOriginY) > 20) {
    //   gameObject.allowDrag = false;
    //   let gridY = (gameObject.id % 8);
    //   let gridX = ((gameObject.id - gridY) / 8);

    //   let swapId = 8 * gridX + gridY + Math.sign(dragY - gameObject.tileOriginY);

    //   let swapTile = this.tiles[swapId];
    //   if (typeof swapTile !== 'undefined') {
    //     let newLetter = swapTile.text.text;
    //     this.tiles[swapId].text.text = gameObject.text.text;
    //     gameObject.text.text = newLetter;

    //     gameObject.resetPosition();
    //   }
    // }
    // }
    // }, this);
    this.input.on('dragend', function (pointer, gameObject) {
      this.allowDrag = true;
      gameObject.resetPosition();
    }, this);

    // let { width, height } = this.sys.game.canvas;
    // const menuTabHeight = 40;
    // this.addMenuBar(width, menuTabHeight);

    // this.tilesWithLetters = 0;

    // let numberOfLetters = 90;
    // this.gridSize = 5;

    // this.drawGrid(this.gridSize, menuTabHeight);
    // this.generateTiles(numberOfLetters);
    // this.addNextTileDisplay(menuTabHeight);


    // this.wordsFound = [] //['ALL', 'WORDS', 'FOUND', 'SHOWN', 'HERE', 'WORD']; //'ss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss', 'fhfhss'];
    // this.wordsFoundBitmap = this.add.bitmapText(width / 2, 100 + menuTabHeight + 1.05 * 60 * this.gridSize, 'main-font', this.wordsFound.join('  '), 18).setOrigin(0.5, 0);
    // this.wordsFoundBitmap.setMaxWidth(0.95 * width);
    // this.wordsFoundBitmap.setCenterAlign();

    // Load valid word list
    let cache = this.cache.text;
    this.wordList = cache.get("words").split("\n"); // Need to make sure line endings are correct

    // // Game timer
    // // this.maxSeconds = 480; // Time limit in seconds
    // // this.addTimer(320, 25);
    // // this.timer = this.time.addEvent({
    // //   delay: 1000 * this.maxSeconds, // The timer uses milliseconds
    // // });

    // this.totalScore = 0;
    // this.scoreForTurn = 0;
    // this.multiplier = 0;

    // this.addScoreText(320, 80);


    // this.isGameOver = false;

    // console.log(this.letterGrid);
    // console.log(this.letterGrid[2][2])
  }

  makeGrid(cellWidth) {
    // let { width, height } = this.sys.game.canvas;
    // // let cellWidth = 60;

    // const gridWidth = 5;
    // const gridHeight = 8;

    // let startX = (width - gridWidth * cellWidth + cellWidth) / 2;
    // let startY = 120;

    const letters = [
      ['e', 'h', 'f', 'd', 'i', 'd', 'r', 'c'],
      ['r', 'a', 'n', 'r', 'l', 'b', 'l', 'a'],
      ['a', 'k', 'o', 'l', 's', 'w', 'a', 'o'],
      ['g', 'p', 'a', 'd', 'o', 's', 'n', 't'],
      ['r', 'n', 'f', 's', 'u', 'e', 'e', 's']
    ];
    this.tiles = [...Array(this.gridWidth)].map(e => Array(this.gridHeight));
    this.letterGrid = [...Array(this.gridWidth)].map(e => Array(this.gridHeight));
    for (let i = 0; i < this.gridWidth; i++) {
      for (let j = 0; j < this.gridHeight; j++) {

        let random = Phaser.Math.FloatBetween(0, 1);
        let letterIndex = this.cumulativeProbability.findIndex(function (number) {
          return number > random;
        });
        // this.text.text = ALPHABET[letterIndex];

        this.letterGrid[i][j] = ALPHABET[letterIndex];
        // let tile = new LetterTile(this, this.startX + i * this.cellWidth, this.startY + j * this.cellWidth, 60, ALPHABET[letterIndex], this.gridHeight * i + j);
        this.tiles[i][j] = new LetterTile(this, this.startX + i * this.cellWidth, this.startY + j * this.cellWidth, this.tileWidth, ALPHABET[letterIndex], this.gridHeight * i + j);

        // this.tiles[i][j] = new LetterTile(this, this.startX + i * this.cellWidth, this.startY + j * this.cellWidth, this.tileWidth, letters[i][j], this.gridHeight * i + j);
        // console.log(gridHeight * i + j)
        // new GridCell(this, startX + i * 1.05 * cellWidth, startY + j * 1.05 * cellWidth, cellWidth);

        // tile.on('pointerdown', () => {
        //   if (!tile.isLocked) {
        //     this.placeTile(tile);

        //     // Delay checking for words so tile can be clicked again
        //     if (!tile.justClicked) {
        //       tile.justClicked = true;
        //       this.time.addEvent({
        //         delay: 200,
        //         callback: () => {
        //           this.checkForWords();
        //           tile.justClicked = false;
        //           // Stop unlocked tiles from being clicked, only locked ones are interactive so
        //           // they can be unlocked. This is not nicely done!
        //           if (!tile.isLocked) {
        //             tile.disableInteractive();
        //           }
        //         }
        //       });
        //     } else {
        //       // Stop tile from making words
        //       tile.lockCell();
        //     }

        //   } else {
        //     tile.unlockCell();
        //     // Add delay to allow multiple cells to be unlocked???
        //     this.time.addEvent({
        //       delay: 400,
        //       callback: () => {
        //         this.checkForWords();
        //       }
        //     });
        //   }
        // });

        // Add to array of tiles
        // this.tiles.push(tile);
      }
    }
    // return startX
  }

  swapLetters(x1, y1, x2, y2) {
    this.updateMoves();
    const swapLetter = this.tiles[x1][y1].getLetter();
    this.tiles[x1][y1].setLetter(this.tiles[x2][y2].getLetter());
    this.tiles[x2][y2].setLetter(swapLetter);
  }

  swapTiles(x1, y1, x2, y2) {
    if (this.tiles[x2][y2] instanceof LetterTile) {
      this.updateMoves();
      const swapTile = this.tiles[x1][y1];
      this.tiles[x1][y1] = this.tiles[x2][y2];  //setLetter(this.tiles[x2][y2].getLetter());
      this.tiles[x2][y2] = swapTile;

      this.tiles[x1][y1].setTilePosition(this.getWorldPos(x1, y1))
      this.tiles[x2][y2].setTilePosition(this.getWorldPos(x2, y2))

      this.tiles[x1][y1].resetPosition();
      this.tiles[x2][y2].resetPosition();
    } else {
      this.tiles[x1][y1].resetPosition();
    }
  }

  updateMoves() {
    this.movesLeft -= 1;
    this.movesLeftText.text = this.movesLeft;
    if (this.movesLeft <= 0) {
      this.gameOver();
    }
  }

  gameOver() {
    let { width, height } = this.sys.game.canvas;
    this.add.bitmapText(width / 2, height / 2, 'main-font', 'GAME OVER', 36).setOrigin(0.5);
    this.allowDrag = false;
  }

  checkForWords() {
    // Add this.ischeckingforwords so this does not get called while it is currently checking. Or make asyncronous??
    // I don't think this causes any errors but it seems uneccessary to call it as often as it is (especially if unlocking multiple tiles)
    // May also cause multiplier to incrase if turns taken quickly (is this a feature?)
    // let indicesToUpdate = [];
    // gridHeight * i + j);

    let wordTiles = [];
    this.tiles.forEach(function (column, xPos) {
      let columnLetters = column.map(tile => tile.getLetter()).join('');
      let { startIndex, word } = this.getLongestWord(columnLetters);
      for (var i = 0; i < word.length; i++) {
        wordTiles.push([xPos, startIndex + i])
      }
      if (word) {
        console.log(word);
      }
    }, this);

    for (let yPos = 0; yPos < this.gridHeight; yPos++) {
      let rowLetters = this.tiles.map(column => column[yPos].getLetter()).join('');
      let { startIndex, word } = this.getLongestWord(rowLetters);
      for (var i = 0; i < word.length; i++) {
        wordTiles.push([startIndex + i, yPos])
      }
      // console.log(word);/
      if (word) {
        console.log(word);
      }
    }
    // remove duplicates
    // console.log(wordTiles);
    wordTiles = Array.from(new Set(wordTiles.map(JSON.stringify).sort()), JSON.parse);

    // wordTiles = array1.filter(val => !array2.includes(val));
    console.log(wordTiles);
    this.removeTiles(wordTiles);


    // for (let column of this.tiles) {
    //   columnLetters = column.map(tile => tile.getText()).join('');      
    //   let { startIndex, word } = this.getLongestWord(columnLetters);
    // }

    // // console.log(this.tile)
    // let wordIndices = [];
    // //TODO:  oNly check rows and cols thathave been modified
    // for (let i = this.gridWidth - 1; i < this.gridWidth; i++) {
    //   // Get letters and corresponding grid point for the rows and columns
    //   let columnIndices = Array.from(Array(this.gridHeight).keys()).map(index => this.gridHeight * i + index);
    //   var columnLetters = columnIndices.map(index => this.tiles[index].getText()).join('');
    //   console.log(columnLetters)
    //   // console.log(column.join(''));
    //   let { startIndex, word } = this.getLongestWord(columnLetters);

    //   // console.log(startIndex);
    //   // console.log(word);

    //   // console.log(columnIndices.slice(startIndex, startIndex + word.length))
    //   // console.log(word);
    //   // // this.tiles[this.ySize * i + index].getText()]

    //   // const [a, b] = Array.from(Array(this.ySize).keys()).map(index => this.ySize * i + index, this.tiles[this.ySize * i + index].getText());
    //   // console.log(a);
    //   // console.log(b);
    //   wordIndices = wordIndices.concat(columnIndices.slice(startIndex, startIndex + word.length));
    // }
    // console.log(wordIndices)

    // this.removeTiles(wordIndices)


    // for
    // for (let i = 0; i < this.ySize; i++) {
    //   var rows = Array.from(Array(this.xSize).keys()).map(index => [i + this.ySize * index, this.tiles[i + this.ySize * index].getText()]);
    //   console.log(rows);
    // }
    // // let rows = Array.from(Array(this.xSize).keys()).map(index => [i + this.ySize * index, this.tiles[i + this.ySize * index].getText()]);

    // // console.log(columns);
    // // console.log(rows);
    // for (const letters of [columns, rows]) {
    //   let word = rows.map(a => a[1]);
    //   //   Array.from(Array(this.xSize).keys()).map(index => [i + this.ySize * index, this.tiles[i + this.ySize * index].getText()]);

    //   // let word = letters[0][1];
    //   // let wordIndices = letters[0][1] ? [letters[0][0]] : [];
    //   console.log(word);
    // }
    //   for (let j = 1; j < this.gridSize; j++) {
    //     if (letters[j][1]) {
    //       word += letters[j][1];
    //       wordIndices.push(letters[j][0])
    //     }
    //     if (!letters[j][1] || j == this.gridSize - 1) {
    //       if (this.isValidWord(word)) {
    //         this.wordFound(word, wordIndices);
    //         indicesToUpdate.push(wordIndices);
    //       }
    //       word = "";
    //       wordIndices = [];
    //     }
    //   }
    // }
    // }

    // for (const indices of indicesToUpdate) {
    //   for (const i of indices) {
    //     this.tiles[i].resetCell();
    //   }
    // }
    // this.displayWordsFound();

    // // New words may have been made by removing these letters so run this again if indicesToUpdate is non-empty
    // if (indicesToUpdate.length) {
    //   // Add delay so words are not added at the same time
    //   this.time.addEvent({
    //     delay: 1000,
    //     callback: () => {
    //       this.checkForWords();
    //     }
    //   });
    // } else {
    //   let score = this.scoreForTurn * this.multiplier;
    //   this.updateScore(score);

    //   if (this.tilesWithLetters == this.gridSize ** 2 || !this.playerTiles.length) {
    //     // The grid is full and no words are made: game over!
    //     this.gameOver();
    //   }
    // }
  }

  getLongestWord(letters, minLength = 3) {
    console.log('letters', letters)
    let startIndex;
    let word = '';
    for (let i = 0; i < letters.length - minLength + 1; i++) {
      for (let j = i + minLength; j < letters.length + 1; j++) {
        let newWord = letters.slice(i, j);
        if (this.wordList.includes(newWord) & newWord.length > word.length) {
          startIndex = i;
          word = newWord;
        }
      }
    }
    return { startIndex, word };
  }

  removeTiles(wordTiles) {
    // Make clone of original tiles, modifying in place will cause all kinds of issues! 
    let newTiles = [...this.tiles];
    newTiles.forEach((row, rowIndex) => newTiles[rowIndex] = [...row])

    // CA THIS BE MODIFIED IN PLVE NOW???
    // console.log(this.tiles);
    // console.log(newTiles);

    for (let pos of wordTiles) {
      this.tiles[pos[0]][pos[1]].remove();
      // newTiles[pos[0]][pos[1]] = new EmptyTile();

      // Move all tiles above this one down by one, NOOOOOOOOOOOOOOOOOO
      for (var i = pos[1]; i > 0; i--) {
        newTiles[pos[0]][i] = newTiles[pos[0]][i - 1]; // this.tiles[pos[0]][i - 1];
        newTiles[pos[0]][i].setTilePosition(this.getWorldPos(pos[0], i));
        // newTiles[pos[0]][i - 1] = new EmptyTile();
      }
      newTiles[pos[0]][0] = new EmptyTile();
    }

    this.tiles = newTiles;
    this.printGrid();

    // Not the way to do it!!!!
    this.time.addEvent({
      delay: 3000,
      loop: false,
      callback: this.updateTilePositions, //this.spawnShape,
      callbackScope: this
    }, this);

    // this.updateTilePositions();




    // console.log(this.tiles)




    // console.log(wordTiles)


    // const newGrid = [...grid]
    // Clone each row
    // newGrid.forEach((row, rowIndex) => newGrid[rowIndex] = [...row])
    //   let newTiles = Array.from(this.tiles);

    // for (let pos of wordTiles) {
    //   // if (pos[0] == 0 & pos[1] == 0) {
    //   //   console.log("A")
    //   // }

    //   console.log(pos)
    //   console.log(this.tiles[0][0].getLetter());

    //   this.tiles[pos[0]][pos[1]].remove();  //destroy();  //deactivate();
    //   // console.log(pos);
    //   // this.tiles[pos[0]][pos[1]] = new EmptyTile();
    //   //update position of all above but don't change array yet
    //   // console.log(pos)
    //   for (var i = pos[1]; i > 0; i--) { //} this.gridHeight - 1; i > pos[1]; i--) { // pos[1] + 1
    //     // console.log(i)
    //     // this.tiles[pos[0]][i].setTilePosition(this.getWorldPos(pos[0], i + 1));
    //     newTiles[pos[0]][i] = this.tiles[pos[0]][i - 1]; // = this.tiles[pos[0]][i] = this.tiles[pos[0]][i - 1];
    //     newTiles[pos[0]][i].setTilePosition(this.getWorldPos(pos[0], i)); // = this.tiles[pos[0]][i].setTilePosition(this.getWorldPos(pos[0], i));
    //     // this.tiles[pos[0]][i - 1] = new EmptyTile();
    //     // 
    //     // console.log(pos[0], i);
    //   }
    //   newTiles[pos[0]][0] = new EmptyTile();
    //   // this.tiles[pos[0]][0] = new EmptyTile();

    //   // simplest to move above down each time, most efficient? need to deactiavet all before mving down
    //   // get min unchanged y
    //   // count how many tiles changed above for each x
    //   // remaining new pos is min y + i
    // }

    // this.tiles = newTiles;

    // // this.updateTilePosition();
    // console.log(this.tiles)
  }

  printGrid() {
    let letterGrid = [...Array(this.gridWidth)].map(e => Array(this.gridHeight));
    for (var i = 0; i < this.gridWidth; i++) {
      for (var j = 0; j < this.gridHeight; j++) {
        letterGrid[i][j] = this.tiles[i][j].getLetter();
      }
    }
    console.log(letterGrid);
  }

  updateTilePositions() {
    // Do this better
    // const oldTiles = this.tiles;
    // console.log(this.tiles)
    for (let i = 0; i < this.tiles.length; i++) {
      for (let j = 0; j < this.tiles[i].length; j++) {
        // console.log(instanceof (this.tiles[i][j]))
        if (this.tiles[i][j] instanceof LetterTile) {
          // console.log(this.tiles[i][j])
          this.tiles[i][j].resetPosition();
        }
        // let tile = this.tiles[i][j];
        // // console.log(tile);
        // if (tile.scene) {
        //   let { gridX, gridY } = tile.getGridPos();
        //   this.tiles[gridX][gridY] = oldTiles[i][j];  // this.tiles[i][j];

        // } else {
        //   this.tiles[i][j] = new EmptyTile();
        // }
        // this.tiles[i]
        // if (this.tiles[i][j]) {



        // }
      }
    }

  }

  getWorldPos(i, j) {
    return new Phaser.Math.Vector2(this.startX + i * this.cellWidth, this.startY + j * this.cellWidth);
  }

  // gameOver() {
  //   // Stop this from being called more than once during game
  //   if (!this.isGameOver) {
  //     this.isGameOver = true;

  //     // Stop all tiles from being interactive, otherwise it will keep checking for words
  //     for (let tile of this.tiles) {
  //       tile.disableInteractive();
  //     }
  //     this.computeFinalScore();

  //     this.scene.launch('GameOverScene', { mainScene: this.scene });
  //   }
  // }

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

    // this.playerTiles = ['O', 'S', 'Q', 'W', 'T', 'O', 'W', 'R', 'D', 'S']

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

// class LetterTile extends Phaser.Physics.Arcade.Sprite {
//   constructor(scene, x, y, cellSize, fontSize = 36) {
//     super(scene, x, y, 'letter-tile').setOrigin(0.5).setTint(TILE_COLOURS[0]).setInteractive();
//     scene.add.existing(this);

//     scene.input.setDraggable(this);
//     scene.input.on('drag', function (pointer, gameObject, dragX, dragY) {

//       gameObject.x = dragX;
//       gameObject.y = dragY;

//     });
//     this.displayHeight = cellSize, this.displayWidth = cellSize;

//     this.text = scene.add.bitmapText(x, y, 'main-font', '', fontSize).setOrigin(0.5).setDepth(1).setDropShadow(2, 2, 0x000000)
//   }

//   setText(newText) {
//     this.text.text = newText;
//     this.setTint(TILE_COLOURS[1]);
//   }

//   addGlow(alpha = 0) {
//     this.glow = this.scene.add.sprite(this.x, this.y, 'letter-tile').setOrigin(0.5).setTint(0xffffff).setDepth(-1).setAlpha(alpha);

//     this.glow.displayHeight = 1.1 * this.displayHeight;
//     this.glow.displayWidth = 1.1 * this.displayWidth;
//   }

//   addFade() {
//     this.fade = this.scene.add.sprite(this.x, this.y, 'letter-tile').setOrigin(0.5).setTint(0x000000).setDepth(1).setAlpha(0.5);

//     this.fade.displayHeight = this.displayHeight;
//     this.fade.displayWidth = this.displayWidth;
//   }

//   remove() {
//     this.text.destroy();
//     if (this.glow) {
//       this.glow.destroy();
//     }
//     this.destroy();
//   }
// }

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
