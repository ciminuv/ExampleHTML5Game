function Point(x, y) {
  this.x = x;
  this.y = y;
}

function Size(width, height) {
  this.width = width;
  this.height = height;
}

Point.prototype.isEqual = function(other) {
  if (!(other instanceof Point))  return false;
  return this.x == other.x && this.y == other.y;
};

// https://en.wikipedia.org/wiki/Taxicab_geometry
Point.prototype.distance = function(other) {
  var d1 = Math.abs(this.x - other.x);
  var d2 = Math.abs(this.y - other.y);
  return d1 + d2;
};

function Rect(x, y, width, height) {
  this.origin = new Point(x, y);
  this.size = new Size(width, height);
}

Rect.prototype.middle = function() {
  return new Point(this.origin.x + this.size.width / 2, this.origin.y + this.size.height / 2);
};

Rect.prototype.isIntersect = function(other) {
  var maxX = this.origin.x + this.size.width;
  var maxY = this.origin.y + this.size.height;
  var otherMaxX = other.origin.x + other.size.width;
  var otherMaxY = other.origin.y + other.size.height;

  return maxX >= other.origin.x && this.origin.x <= otherMaxX && this.origin.y <= otherMaxY && maxY >= other.origin.y;
};

function Component(body, speed, color, radarRange) {
  this.body = body;
  this.speed = speed;
  this.color = color;
  this.radarRange = radarRange;
  this.routePath = []; // route to the next target.
}

Component.prototype.update = function() {
  if (this.routePath === undefined || this.routePath.length == 0) {
    return;
  }

  var nextTarget = this.routePath[0];
  if (nextTarget.x < this.body.origin.x) {
    this.body.origin.x = Math.max(this.body.origin.x - this.speed, nextTarget.x);
  }
  if (nextTarget.x > this.body.origin.x) {
    this.body.origin.x = Math.min(this.body.origin.x + this.speed, nextTarget.x);
  }

  if (nextTarget.y < this.body.origin.y) {
    this.body.origin.y = Math.max(this.body.origin.y - this.speed, nextTarget.y);
  }
  if (nextTarget.y > this.body.origin.y) {
    this.body.origin.y = Math.min(this.body.origin.y + this.speed, nextTarget.y);
  }

  if (nextTarget.x == this.body.origin.x && nextTarget.y == this.body.origin.y) {
    this.routePath.remove(0);
  }
};

Component.prototype.crashWith = function(other) {
  return this.body.isIntersect(other.body);
};

Component.prototype.isInRange = function(other, range) {
  var d1 = Math.abs(this.body.origin.x - other.body.origin.x);
  var d2 = Math.abs(this.body.origin.y - other.body.origin.y);
  return Math.sqrt((d1 * d1) + (d2 * d2)) <= range;
};
