var configuration = {
  targetFPS: 60, // target FPS NOTE: this is not configurable at the moment so please do not update this.
  size: 800, // canvas size
  numberOfUnit: 64,
  numberOfEnemies: 4,
  playerSpeed: 2, // unit per second
  enemySpeed: 2.2, // unit per second
  enemyRange: 15, // unit range that it will be able to sense our player.
  playerColor: 'blue',
  enemyColor: 'red',
  wallColor: 'black',
  gridColor: '#EEE',
};

configuration.unitSize = configuration.size / configuration.numberOfUnit;
configuration.enemyMapRange = configuration.unitSize * configuration.enemyRange;
