var configuration = {
  targetFPS: 60, // target FPS
  size: 800, // canvas size
  numberOfUnit: 64,
  numberOfEnemies: 4,
  playerSpeed: 2, // unit per second
  enemySpeed: 2.2, // unit per second
  enemyRange: 15, // unit range that it will be able to sense our player.
  playerColor: 'blue',
  enemyColor: 'red',
  wallColor: 'black',
  gridColor: '#BBB',
};

configuration.unitSize = configuration.size / configuration.numberOfUnit;
configuration.enemyMapRange = configuration.unitSize * configuration.enemyRange;
