var NodeType = { NOTHING: 0, WALL: 1 };

function Generator(config) {
  this.config = config;
}

Generator.prototype.generateMap = function() {
  var grid = [];
  var randomGapPossition = Math.floor(Math.random() * this.config.numberOfUnit);
  var middle = this.config.numberOfUnit / 2;
  for (var x = 0; x < this.config.numberOfUnit; ++x) {
    grid[x] = new Array(this.config.numberOfUnit);
    for (var y = 0; y < this.config.numberOfUnit; ++y) {
      if (y == middle || y == middle + 1) {
        grid[x][y] = x == randomGapPossition ? NodeType.NOTHING : NodeType.WALL;
      } else {
        var num = Math.random();
        grid[x][y] = num < 0.125 ? NodeType.WALL : NodeType.NOTHING; // probability == 12.5%
      }
    }
  }
  // simple solution to prevent wall to block 2 fields ~ not 100%.
  grid[randomGapPossition][middle - 1] = grid[randomGapPossition][middle + 2] = NodeType.NOTHING;
  return grid;
};

Generator.prototype.generateComponent = function(map, unitPerSecondSpeed, color, radarRange) {
  do {
    var x = Math.floor(Math.random() * this.config.numberOfUnit);
    var y = Math.floor(Math.random() * this.config.numberOfUnit);
  } while (map[x][y] == NodeType.WALL);

  var speedPerFrame = (unitPerSecondSpeed * this.config.unitSize) / this.config.targetFPS;
  var rect = new Rect(x * this.config.unitSize, y * this.config.unitSize, this.config.unitSize, this.config.unitSize);
  return new Component(rect, speedPerFrame, color, radarRange);
};

Generator.prototype.generateEnemies = function(map) {
  return Array(this.config.numberOfEnemies).fill(0).map((_) => {
    return this.generateComponent(map, this.config.enemySpeed, this.config.enemyColor, this.config.enemyRange);
  });
};

// expected output: response position should follow the following rules:
//   - Do not need to cover all the map since it already has radar to sense our player.
//     So setting range from (radar range) / 5 to (numberOfUnit - (radar range) / 5) makes sense as it covered all edges and increase the probability to cover the exact 4 corner spots.
//     NOTE that: set range from Math.sqrt(Math.pow(radar range, 2) / 2) to (numberOfUnit - Math.sqrt(Math.pow(radar range, 2) / 2))
//                which means the idea of setting new random position range from the exact range that radar can cover, might seem to work but it reduces the probability of covering the exact 4 corners significantly,
//                because if our player stands in any corner, the probability of detecting the character from this random position is only 1 / Math.pow(range size, 2).
//   - Should keep enough distance from other enemy targets.
Generator.prototype.generateRandomPositionForEnemy = async function(map, existTargets) {
  if (this.enemyPositionGapToConer === undefined) {
    this.enemyPositionGapToConer = this.config.enemyRange / 5;
  }

  if (this.acceptedDistanceFromOtherTargets === undefined) {
    var roomLeftForRandomPosition = Math.pow(this.config.enemyRange * 3, 2);
    var totalPosition = Math.pow(this.config.numberOfUnit, 2);
    this.acceptedDistanceFromOtherTargets = Math.sqrt((totalPosition - roomLeftForRandomPosition) / this.config.numberOfEnemies);
    this.acceptedDistanceFromOtherTargets = Math.min(this.config.enemyRange, this.acceptedDistanceFromOtherTargets);
  }

  do {
    var x = getRandomInt(this.enemyPositionGapToConer, map.length - this.enemyPositionGapToConer);
    var y = getRandomInt(this.enemyPositionGapToConer, map.length - this.enemyPositionGapToConer);
    var position = new Point(x, y);
    var validDistanceToOtherTargets = existTargets.reduce((result, current) => {
      return result && position.distance(current) >= this.acceptedDistanceFromOtherTargets;
    }, true);
    await sleep(50);
  } while (map[x][y] == NodeType.WALL || !validDistanceToOtherTargets);

  return position;
};
