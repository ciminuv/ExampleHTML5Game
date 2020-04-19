var gameManager = {
  config: configuration,
  canvas: document.createElement("canvas"),
  init: function() {
    this.initCanvas();
    this.generator = new Generator(this.config);

    this.reset();

    this.interval = setInterval(update, 1000 / this.config.updateInterval);
    this.updateEnemiesInterval = setInterval(updateEnemies, 500);
  },
  initCanvas: function() {
    this.canvas.width = this.config.size;
    this.canvas.height = this.config.size;
    this.context = this.canvas.getContext("2d");
    document.body.insertBefore(this.canvas, document.body.childNodes[0]);
  },
  reset: function() {
    this.map = this.generator.generateMap();
    this.graph = new Graph(this.map);
    this.player = this.generatePlayer();
    this.enemies = this.generator.generateEnemies(this.map);

    var components = this.enemies.concat(this.player);
    this.renderer = new Renderer(this.config, this.context, this.map, components);
  },
  generatePlayer: function() {
    return this.generator.generateComponent(this.map, this.config.playerSpeed, this.config.playerColor);
  },
  updatePlayerTargetPossition: function(newPosition) {
    this.setNewTargetPossitionForComponent(this.player, newPosition);
  },
  isEndGame: function() {
    for (enemy of this.enemies) {
      if (enemy.crashWith(this.player)) {
        return true;
      }
    }

    return false;
  },
  updateEnemies: function() {
    for (enemy of this.enemies) {
      if (enemy.isInRange(this.player, this.config.enemyMapRange)) {
        this.setNewTargetPossitionForComponent(enemy, this.player.body.origin);
      }
    }

    this.generateNewTargetForEnemiesIfNeed();
  },
  generateNewTargetForEnemiesIfNeed: function() {
    var currentEnemyTargets = this.getEnemyTargets();
    for (enemy of this.enemies) {
      // this character is already has its target.
      if (enemy.routePath.length > 0) { continue; }

      var currentPositionOnMap = convertCoordinateToMapPosition(enemy.body.origin, this.config.unitSize);
      var position = this.generator.generateRandomPositionForEnemy(this.map, currentEnemyTargets.concat(currentPositionOnMap));
      this.setNewTargetPossitionOnMapForComponent(enemy, position);
    }
  },
  getEnemyTargets: function() {
    var results = [];
    for (enemy of this.enemies) {
      if (enemy.routePath.length <= 0) { continue; }
      var target = convertCoordinateToMapPosition(enemy.routePath.last(), this.config.unitSize);
      results.push(target);
    }
    return results;
  },
  getEnemyPositions: function() {
    return this.enemies.map(enemy => convertCoordinateToMapPosition(enemy.body.origin, this.config.unitSize));
  },
  checkEnemyCollision: function() {
    var enemyPositions = this.getEnemyPositions();
    for (i = 0; i < this.enemies.length; ++i) {
      var enemy = this.enemies[i];
      var firstTarget = enemy.routePath[0];
      if (firstTarget === undefined) { continue; }

      var otherEnemyPositions = enemyPositions.filter((_, index) => index != i);
      var firstTargetOnMap = convertCoordinateToMapPosition(firstTarget, this.config.unitSize);
      if (otherEnemyPositions.some(position => position.isEqual(firstTargetOnMap))) {
        enemy.routePath = [];
      }
    }
  },
  setNewTargetPossitionForComponent: function(component, position) {
    var targetPositionOnMap = convertCoordinateToMapPosition(position, this.config.unitSize);
    this.setNewTargetPossitionOnMapForComponent(component, targetPositionOnMap);
  },
  setNewTargetPossitionOnMapForComponent: function(component, targetPositionOnMap) {
    var currentTargetPositionOnMap = convertCoordinateToMapPosition(component.routePath.last(), this.config.unitSize);
    if (targetPositionOnMap.isEqual(currentTargetPositionOnMap)) {
      return; // no operation needed as current target is already equal to new target.
    }
    var currentPositionOnMap = convertCoordinateToMapPosition(component.body.origin, this.config.unitSize);

    var startNode = this.graph.nodes[currentPositionOnMap.x][currentPositionOnMap.y];
    var endNode = this.graph.nodes[targetPositionOnMap.x][targetPositionOnMap.y];
    var result = this.graph.search(startNode, endNode, [NodeType.WALL], this.getEnemyPositions());
    var unitSize = this.config.unitSize;
    var mapRoutePath = result.map(p => new Point(p.x * unitSize, p.y * unitSize));

    component.routePath = mapRoutePath;
  }
};

function update() {
  if (gameManager.isEndGame()) {
    gameManager.reset();
  } else {
    gameManager.checkEnemyCollision();
    gameManager.renderer.render();
    gameManager.player.update();
    for (enemy of gameManager.enemies) {
      enemy.update();
    }
  }
}

function updateEnemies() {
  gameManager.updateEnemies();
}