function Renderer(config, context, map, components) {
  this.config = config;
  this.context = context;
  this.map = map;
  this.components = components;
}

Renderer.prototype.render = function() {
  this.clear();

  this.drawGrid();
  this.drawMap();
  this.drawComponents();
};

Renderer.prototype.drawMap = function() {
  var length = this.map.length;
  for (var x = 0; x < length; ++x) {
    var rowLength = this.map[x].length;
    for (var y = 0; y < rowLength; ++y) {
      if (this.map[x][y] == 1) {
        this.context.fillStyle = this.config.wallColor;
        this.context.fillRect(x * this.config.unitSize, y * this.config.unitSize, this.config.unitSize, this.config.unitSize);
      }
    }
  }
};

Renderer.prototype.drawComponents = function() {
  for (component of this.components) {
    this.context.fillStyle = component.color;
    var position = component.body.origin;
    var size = component.body.size;
    this.context.fillRect(position.x, position.y, size.width, size.height);

    if (component.radarRange !== undefined) {
      this.context.beginPath();
      var position = component.body.middle();
      var outerRadius = this.config.unitSize * component.radarRange;
      var defaultInnerRadaRadius = outerRadius / 1.5;
      component.innerRadaRadius = (component.innerRadaRadius === undefined) ? defaultInnerRadaRadius : component.innerRadaRadius + component.speed / 5;
      if (component.innerRadaRadius >= outerRadius) {
        component.innerRadaRadius = defaultInnerRadaRadius;
      }
      var gradient = this.context.createRadialGradient(position.x, position.y, component.innerRadaRadius, position.x, position.y, outerRadius);
      gradient.addColorStop(0, "rgba(255, 0, 0, 0.1)");
      gradient.addColorStop(1, "rgba(255, 255, 255, 0.1)");
      this.context.arc(position.x, position.y, outerRadius, 0, 2 * Math.PI);
      this.context.fillStyle = gradient;
      this.context.fill();
    }
  }
};

Renderer.prototype.drawGrid = function() {
  this.context.lineWidth = 1;
  this.context.strokeStyle = this.config.gridColor;
  for (x = 0; x <= this.config.numberOfUnit; x++) {
    var posX = x * this.config.unitSize;
    this.context.beginPath();
    this.context.moveTo(posX, 0);
    this.context.lineTo(posX, this.config.size);
    this.context.stroke();
  }
  for (y = 0; y <= this.config.numberOfUnit; y++) {
    var posY = y * this.config.unitSize;
    this.context.beginPath();
    this.context.moveTo(0, posY);
    this.context.lineTo(this.config.size, posY);
    this.context.stroke();
  }
};

Renderer.prototype.clear = function() {
  this.context.clearRect(0, 0, this.config.size, this.config.size);
};
