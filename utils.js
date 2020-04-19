function getMousePosition(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  return new Point(evt.clientX - rect.left, evt.clientY - rect.top);
}

function convertCoordinateToMapPosition(coordinate, unitSize) {
  if (coordinate === undefined) { return; }

  return new Point(Math.floor(coordinate.x / unitSize), Math.floor(coordinate.y / unitSize));
}

function constructTargetPosition(map, position, direction) {
  if (direction === undefined) { return position; }
  var newTargetPosition = new Point(position.x, position.y);
  if (direction == Direction.WEST) {
    newTargetPosition.x -= 1;
  } else if (direction == Direction.EAST) {
    newTargetPosition.x += 1;
  } else if (direction == Direction.NORTH) {
    newTargetPosition.y -= 1;
  } else if (direction == Direction.SOUTH) {
    newTargetPosition.y += 1;
  }
  return map[newTargetPosition.x] && map[newTargetPosition.x][newTargetPosition.y] ? newTargetPosition : position;
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

if (!Array.prototype.last){
  Array.prototype.last = function() {
    return this[this.length - 1];
  };
};

if (!Array.prototype.remove) {
  Array.prototype.remove = function(from, to) {
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
  };
}
