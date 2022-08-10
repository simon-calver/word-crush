export default class menuScene extends Phaser.Scene {

  constructor() {
    super('MenuScene');
  }

  preload() {
    this.load.html('instructions', 'word-game/assets/text/instructions.html');
  }

  create(data = { mainScene: Phaser.Scene, menuType: String }) {
    let { width, _ } = this.sys.game.canvas;
    let { startY, middleHeight } = this.getSize(data.menuType);

    // Make menu background out of pngs
    let backgroundTop = this.add.image(width / 2, startY, 'menu-top').setOrigin(0.5, 0);
    let backgroundMiddle = this.add.image(width / 2, startY + backgroundTop.displayHeight, 'menu-middle').setOrigin(0.5, 0);
    backgroundMiddle.displayHeight = middleHeight;

    let backgroundBottom = this.add.image(width / 2, startY + backgroundTop.displayHeight + backgroundMiddle.displayHeight, 'menu-top').setOrigin(0.5, 0);
    backgroundBottom.flipY = true;

    // Button to return to game
    let cancelButton = this.add.sprite(width - 4, 120, 'cross').setOrigin(1, 0).setScale(0.4).setInteractive();
    cancelButton.on('pointerdown', () => {
      data.mainScene.resume('MainScene');
      data.mainScene.resume('GameOverScene');
      this.scene.stop();
    });

    // Title text
    let titleWords = data.menuType.split('_');
    let title = titleWords.map((word) => {
      return (word.length > 2) ? (word[0].toUpperCase() + word.substring(1)) : (word);
    }).join(' ');
    this.add.bitmapText(width / 2, 134, 'main-font', title, 36).setOrigin(0.5, 0);

    this.setBodyText(data.menuType);
  }

  getSize(menuType) {
    let startY;
    let middleHeight;
    switch (menuType) {
      case 'how_to_play':
        startY = 116;
        middleHeight = 480;
        break;
      case 'settings': case 'stats':
        startY = 116;
        middleHeight = 216;
        break;
    }
    return { startY, middleHeight };
  }

  setBodyText(menuType) {
    let { width, height } = this.sys.game.canvas;
    switch (menuType) {
      case 'how_to_play':
        var element = this.add.dom(width / 2, 182).createFromCache('instructions').setOrigin(0.5, 0);
        element.addListener('click');
        element.on('click', function (event) {
          console.log("CICK")
        });
        break;
      case 'stats':
        this.gamesPlayedText = this.add.bitmapText(width / 2, 234, 'main-font', this.getGamesPlayedText(0), 30).setOrigin(0.5);
        this.gamesPlayedText.setCenterAlign();

        this.avgScoreText = this.add.bitmapText(width / 2, 314, 'main-font', this.getAvgScoreText(0), 30).setOrigin(0.5);
        this.avgScoreText.setCenterAlign();

        this.highScoreText = this.add.bitmapText(width / 2, 394, 'main-font', this.getHighScoreText(0), 30).setOrigin(0.5);
        this.highScoreText.setCenterAlign();

        this.displayScores();
        break;
      default:
        break;
    }
  }

  loadUserScores() {
    getUser().then(response => {
      if (!response) {
        this.displayScores(null)
      } else {
        getScores(response)
          .then(response => this.displayScores(response))
          .catch(error => {
            this.displayScores(null)
            console.log('Error:', error);
          });
      }
    });
  }

  displayScores() {
    getStats().then(stats => {
      this.gamesPlayedText.text = this.getGamesPlayedText(stats['played']);
      this.avgScoreText.text = this.getAvgScoreText(parseFloat(stats['average']).toFixed(2));
      this.highScoreText.text = this.getHighScoreText(stats['high']);
    });
  }

  getGamesPlayedText(gamesPlayed) {
    return `Games Played:\n${gamesPlayed}`;
  }

  getAvgScoreText(avgScore) {
    return `Average Score:\n${avgScore}`;
  }

  getHighScoreText(highScore) {
    return `High Score:\n${highScore}`;
  }
}
