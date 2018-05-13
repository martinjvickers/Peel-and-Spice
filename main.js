/*
  Written by Dr Martin Vickers based upon Phaser.js tutorial.
  Artwork and animation by Sarah Brookes.

  Last updated 13-May-2018
*/

var sceneGame = {
  key: 'game',
  preload: preloadGame,
  create: createGame,
  update: update,
  files: [
    { type: 'image', key: 'gamebg', url: 'assets/background.jpg'}
  ]
};

var sceneSplash = {
  key: 'splash',
  preload: preloadSplash,
  create: createSplash,
  files: [
    { type: 'image', key: 'splashbg', url: 'assets/splashscreen.png'}
  ]
};

var sceneGameOver = {
  key: 'gameover',
  preload: preloadGameOver,
  create: createGameOver
};

var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 300},
        debug: false
      }
    },
    scene: [ sceneSplash, sceneGame, sceneGameOver ]
};

var game = new Phaser.Game(config);
var score = 0;

function preloadGame ()
{
  this.load.image('sky', 'assets/background.jpg');
  this.load.image('ground','assets/platform.png');
  this.load.image('star','assets/bottle_sm.png');
  this.load.image('bomb','assets/sugarcube.png');
  this.load.spritesheet('dude', 'assets/person.png', {frameWidth: 64, frameHeight: 96});
}

function createGame ()
{
  this.add.image(400, 300, 'sky');
  var platforms;
  platforms = this.physics.add.staticGroup();
  platforms.create(400, 568, 'ground').setScale(1).refreshBody();
  platforms.create(600, 400, 'ground').setScale(0.5).refreshBody();
  platforms.create(50, 250, 'ground').setScale(0.5).refreshBody();
  platforms.create(750, 220, 'ground').setScale(0.5).refreshBody();

  // Create our player
  player = this.physics.add.sprite(100, 450, 'dude');
  player.setBounce(0.2);
  player.setCollideWorldBounds(true);

  // Create our animation for player
  this.anims.create({
    key: 'left',
    frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1
  });

  this.anims.create({
    key: 'turn',
    frames: [ { key: 'dude', frame: 4 } ],
    frameRate: 20,
  });

  this.anims.create({
    key: 'right',
    frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
    frameRate: 10,
    repeat: -1
  });

  // Create some stars
  stars = this.physics.add.group({
    key: 'star',
    repeat: 11,
    setXY: { x: 12, y: 0, stepX: 70 }
  });

  stars.children.iterate(function (child) {
    child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
  });

  // Enable player to collide with platform and set keyboard keys
  this.physics.add.collider(player, platforms);
  this.physics.add.collider(stars, platforms);
  cursors = this.input.keyboard.createCursorKeys();

  this.physics.add.overlap(player, stars, collectStar, null, this);
  scoreText = this.add.text(16,16, 'Score: 0', {fontSize: '32px', fill: '#000'});

  bombs = this.physics.add.group();
  this.physics.add.collider(bombs, platforms);
  this.physics.add.collider(player, bombs, hitBomb, null, this);

}

function preloadSplash ()
{
  this.load.image('splashbg','assets/splashscreen.png');
}

function createSplash ()
{
  this.add.image(400, 300, 'splashbg');

  this.input.on('pointerdown', function () {
    this.input.stopPropagation();
    this.scene.switch('game');
  }, this);
}

function preloadGameOver ()
{
  this.load.image('gameoverbg','assets/gameover.jpg');
}

function createGameOver ()
{
  this.add.image(400, 300, 'gameoverbg');

  this.input.on('pointerdown', function () {
    this.input.stopPropagation();
    this.sys.game.destroy(true);
    game = new Phaser.Game(config);
  }, this);
}


function hitBomb (player, bomb)
{
  this.physics.pause();
  player.setTint(0xff0000);
  player.anims.play('turn');
  score = 0;
  this.scene.switch('gameover');
}

function collectStar (player, star)
{
  star.disableBody(true, true);
  score += 10;
  scoreText.setText('Score: ' + score);

  if (stars.countActive(true) === 0)
  {
    stars.children.iterate(function (child) {
      child.enableBody(true, child.x, 0, true, true);
    });

    var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0,400);
    var bomb = bombs.create(x, 16, 'bomb');
    bomb.setBounce(1);
    bomb.setCollideWorldBounds(true);
    bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
    bomb.allowGravity = false;
  }
}

function update ()
{
  if(cursors.left.isDown)
  {
    player.setVelocityX(-160);
    player.anims.play('left', true);
  }
  else if(cursors.right.isDown)
  {
    player.setVelocityX(160);
    player.anims.play('right', true);
  }
  else
  {
    player.setVelocityX(0);
    player.anims.play('turn');
  }

  if(cursors.up.isDown && player.body.touching.down)
  {
    player.setVelocityY(-330);
  }
}

