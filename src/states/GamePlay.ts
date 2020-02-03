import { GameAssetKeys } from "/assets"

export class GamePlay extends Phaser.State {
  public static key = "GamePlay"
  public key = GamePlay.key

  map: Phaser.Tilemap
  layer: Phaser.TilemapLayer
  player: Phaser.Sprite

  //#region Coin Fountain
  coin: Phaser.Sprite
  coins: Phaser.Group
  emitter: Phaser.Particles.Arcade.Emitter
  emitterType:
    'default' |
    'basic' |
    'flow' |
    'explode';
  //#endregion Coin Fountain

  facing: 'left' | 'right' | 'idle' = 'left'
  jumpTimer = 0
  cursors: Phaser.CursorKeys
  jumpButton: Phaser.Key
  bg: Phaser.TileSprite

  init() {
    console.log("State", this.key)
    // this.setupCoinFountain();
  }

  reset(sprite) {
    sprite.kill();
  }

  //
  //#region Basic Coin Fountain (Gravity / Velocity)

  emitBasicCoins() {
    const gameWidth = this.game.width;
    const gameHeight = this.game.height;

    this.coins = this.game.add.group();
    // add a sprite into a group right at the bottom center of the screen
    this.coin = this.game.add.sprite(gameWidth / 2, gameHeight, GameAssetKeys.starBig);
    // physics
    this.game.physics.enable(this.coin, Phaser.Physics.ARCADE);
    this.coins.add(this.coin);
    // start animation
    this.coin.animations.add('flip');
    this.coin.animations.play('flip', 30, true);
    // set the anchor at 0.5
    this.coin.anchor.set(0.5);

    // set an event listener to kill as it reaches bounds
    this.coin.checkWorldBounds = true;
    this.coin.body.collideWorldBounds = false;
    // gravity, sort of falling speed
    this.coin.body.gravity.setTo(0, 1700);
    // this.coin.body.gravity.setTo(0, 1700);
    this.coin.events.onOutOfBounds.add(this.reset, this.coin);

    this.setBasicCoinsPattern();
  };

  setBasicCoinsPattern() {
    const coinsPattern = [
      [
        [100, -1500],
        [200, -1400],
        [400, -1000],
        [600, -800]
      ],
      [
        [-100, -1500],
        [-200, -1400],
        [-400, -1000],
        [-600, -800]
      ]
    ];

    // either right or left
    const _direction = Math.floor(Math.random() * (2));
    // choose a preset pattern number of how a coin leaps
    const _pattern = Math.floor(Math.random() * (4));

    // make a move. x is the distance of leaping, while y is for how high a coin leap
    this.coin.body.velocity.setTo(
      coinsPattern[_direction][_pattern][0],
      coinsPattern[_direction][_pattern][1]
    );
  };

  //#endregion Basic Coin Fountain (Gravity / Velocity)
  //____________________________________________

  //
  //#region Coin Fountain Emitter

  setupCoinFountain(): void {
    const gameWidth = this.game.width;
    const gameHeight = this.game.height;
    const particle = {
      keys: GameAssetKeys.coin4,
      frames: undefined,
      quantity: undefined,
      collide: true,
      collideWorldBounds: true,
      particleArguments: undefined
    }

    // this.coin = this.game.add.sprite(gameWidth / 2, gameHeight, GameAssetKeys.starBig);

    this.emitter = this.game.add.emitter(this.game.world.centerX, (this.game.world.height - 20), 100);
    // this.emitter = this.game.add.emitter(gameWidth / 2, gameHeight, 200);
    this.emitter.makeParticles(
      particle.keys,
      particle.collide,
      particle.quantity,
      particle.collide,
      particle.collideWorldBounds,
      particle.particleArguments
    );

    this.emitter.minParticleSpeed.setTo(-600, -1700);
    this.emitter.maxParticleSpeed.setTo(600, -800);

    this.emitter.minParticleScale = 0.1;
    this.emitter.maxParticleScale = 0.3;
    this.emitter.gravity.setTo(0, 2000);

    // this.emitterType = 'flow';
  };
  emitCoinsDefault(): void {
    this.emitter.emitParticle();
    // console.info('DB - emitCoinsDefault(): void');
  };
  emitCoinsFlow(): void {
    //  This will emit a quantity of 5 particles every 500ms. Each particle will live for 2000ms.
    //  The -1 means "run forever"
    // this.emitter.flow(2000, 500, 5, -1);
    // this.emitter.flow(2000, 500, 5, 50);
    // this.emitter.flow(2000, 500, 1, 5);

    //  This will emit a single particle every 100ms. Each particle will live for 2000ms.
    //  The 100 means it will emit 100 particles in total and then stop.
    // this.emitter.flow(2000, 100, 1, 100);
    // this.emitter.flow(2000, 200, 1, 1);
    this.emitter.flow(2000, 150, 5, 100);
    // console.info('DB - emitCoinsFlow(): void');
  };
  emitCoinsExplode(): void {
    this.emitter.explode(1500, 20);
  };

  //#endregion Coin Fountain Emitter
  //____________________________________________

  setEmitterType(emitterType): void {
    if (emitterType) {
      this.emitterType = (emitterType !== this.emitterType)
        ? emitterType
        : this.emitterType
    } else {
      this.emitterType = 'flow';
    }
  }
  onCursorPressed(): void {
    if (this.cursors.left.isDown) {
      this.setEmitterType('default');
    } else if (this.cursors.right.isDown) {
      this.setEmitterType('flow');
    } else if (this.cursors.up.isDown) {
      this.setEmitterType('explode');
    } else if (this.cursors.down.isDown) {
      this.setEmitterType('basic');
    }
  }
  startEmitter(): void {
    switch (this.emitterType) {
      case 'default':
        this.emitCoinsDefault();
        break;
      case 'flow':
        this.emitCoinsFlow();
        break;
      case 'explode':
        this.emitCoinsExplode();
        break;
      case 'basic':
        this.emitBasicCoins();
        break;

      default:
        break;
    }
  }

  //
  //#region Setup Functions

  setupStage() {
    this.game.physics.startSystem(Phaser.Physics.ARCADE)

    this.game.stage.backgroundColor = '#000000'

    this.bg = this.game.add.tileSprite(0, 0, 1280, 720, GameAssetKeys.background2)
    this.bg.fixedToCamera = true

    // this.map = this.game.add.tilemap('level1')

    // this.map.addTilesetImage(GameAssetKeys["tiles-1"])

    // this.map.setCollisionByExclusion([13, 14, 15, 16, 46, 47, 48, 49, 50, 51])

    // this.layer = this.map.createLayer('Tile Layer 1')

    //  Un-comment this on to see the collision tiles
    // layer.debug = true

    // this.layer.resizeWorld()

    // this.game.physics.arcade.gravity.y = 250
  }
  setupPlayer() {
    this.player = this.game.add.sprite(32, 32, GameAssetKeys.dude)
    this.game.physics.enable(this.player, Phaser.Physics.ARCADE)

    this.player.body.bounce.y = 0.2
    this.player.body.collideWorldBounds = true
    this.player.body.setSize(20, 32, 5, 16)

    this.player.animations.add('left', [0, 1, 2, 3], 10, true)
    this.player.animations.add('turn', [4], 20, true)
    this.player.animations.add('right', [5, 6, 7, 8], 10, true)

    this.game.camera.follow(this.player)
    // Finally Setup/create movement/interaction keys
    // this.setupCursors();
  }
  setupCursors() {
    this.cursors = this.game.input.keyboard.createCursorKeys()
    this.jumpButton = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR)
  }

  //#endregion Setup Functions
  //____________________________________________

  create() {
    // Setup/create game stage/scene
    this.setupStage();
    // Setup/create stage/scene objects
    // this.setupPlayer();
    this.setupCoinFountain();
    // Finally Setup/create movement/interaction keys
    this.setupCursors();

    this.emitterType = 'default';
  }

  update() {
    this.onCursorPressed();

    if (this.jumpButton.isDown) {
      this.startEmitter();
    }
  }

  render() {
    // this.game.debug.text(this.game.time.physicsElapsed.toString(), 32, 32)

    // this.game.debug.body(this.player)
    // this.game.debug.bodyInfo(this.player, 16, 24)

    // if (this.coin) {
    //   // this.game.debug.body(this.coin, '#e8c500');
    //   this.game.debug.bodyInfo(this.coin, 16, 24)
    // }
  }
}
