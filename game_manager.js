var gameManager = {
  config: configuration,
  canvas: document.createElement("canvas"),
  init: function() {
    this.initCanvas();
    this.generator = new Generator(this.config);

    this.reset();

    gameFrameLoop();
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
    return this.enemies.some(enemy => enemy.crashWith(this.player));
  },
  updateEnemies: function() {
    for (enemy of this.enemies) {
      if (enemy.isInRange(this.player, this.config.enemyMapRange)) {
        this.setNewTargetPossitionForComponent(enemy, this.player.body.origin);
      }
    }

    this.generateNewTargetForEnemiesIfNeed();
  },
  generateNewTargetForEnemiesIfNeed: async function() {
    var currentEnemyTargets = this.getEnemyTargets(); // TODO: cache this list and only recalculating on changes.
    for (var i = 0; i < this.enemies.length; ++i) {
      var enemy = this.enemies[i];
      // this character is already has its target.
      if (enemy.routePath.length > 0) { continue; }

      var currentPositionOnMap = convertCoordinateToMapPosition(enemy.body.origin, this.config.unitSize);
      var position = await this.generator.generateRandomPositionForEnemy(this.map, currentEnemyTargets.concat(currentPositionOnMap));
      this.setNewTargetPossitionOnMapForComponent(enemy, position);
    }
  },
  getEnemyTargets: function() {
    return this.enemies.reduce((results, enemy) => {
      if (enemy.routePath.length <= 0) { return results; }
      var target = convertCoordinateToMapPosition(enemy.routePath.last(), this.config.unitSize);
      results.push(target);
      return results;
    }, []);
  },
  getEnemyPositions: function() {
    return this.enemies.map(enemy => convertCoordinateToMapPosition(enemy.body.origin, this.config.unitSize));
  },
  checkEnemyCollision: function() { // TODO: this function is extremely expensive when there is huge number of enemies, consider some improvement later.
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
    var result = this.graph.search(startNode, endNode, [NodeType.WALL]);
    var unitSize = this.config.unitSize;
    var mapRoutePath = result.map(p => new Point(p.x * unitSize, p.y * unitSize));

    component.routePath = mapRoutePath;
  }
};

function gameFrameLoop() {
  let fpsValue = fps.tick();

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

  window.fps.innerHTML = fpsValue + " FPS";
  requestAnimationFrame(gameFrameLoop);
}

function updateEnemies() {
  gameManager.updateEnemies();
}
