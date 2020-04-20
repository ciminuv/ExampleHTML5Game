function GraphNode(x, y, type) {
  this.position = new Point(x, y);
  this.type = type;
}

function Graph(map) {
  var nodes = [];
  for (var x = 0; x < map.length; ++x) {
    nodes[x] = new Array(map[x].length);
    for (var y = 0; y < map[x].length; ++y) {
      nodes[x][y] = new GraphNode(x, y, map[x][y]);
    }
  }
  this.nodes = nodes;
}

// A* search algorithm: https://en.wikipedia.org/wiki/A*_search_algorithm
// f(n) = g(n) + h(n)
// f(n) = estimated cost from node n to destination.
// where n is the next node on the path, g(n) is the cost of the path from the start node to n, and h(n) is a heuristic function that estimates the cost of the cheapest path from n to the goal.

Graph.prototype.search = function(start, end, transform, ignoreNodeTypes, ignoreNodePositions = []) {
  // no operation needed for node that has type in ignoreNodeTypes.
  if (ignoreNodeTypes.includes(end.type)) {
    return [];
  }

  this.reset();

  var openSet = [];
  openSet.push(start);

  while (openSet.length > 0) {
    var index = this.getNextItemIndex(openSet);
    var node = openSet[index];

    if (node == end) {
      return this.reconstructPath(node, transform);
    }

    openSet.remove(index);
    node.checked = true;

    var neighbors = this.neighbors(node);
    for (neighbor of neighbors) {
      if (ignoreNodePositions.some(p => p.x == neighbor.position.x && p.y == neighbor.position.y)) {
        continue;
      }
      if (neighbor.checked || ignoreNodeTypes.includes(neighbor.type)) {
        continue;
      }

      var newGScore = node.g + 1;
      var isBestGScore = false;
      if (!neighbor.visited) {
        isBestGScore = true;
        neighbor.h = neighbor.position.distance(end.position);
        neighbor.visited = true;
        openSet.push(neighbor);
      } else if (newGScore < neighbor.g) {
        isBestGScore = true;
      }

      if (isBestGScore) {
        neighbor.g = newGScore;
        neighbor.f = neighbor.g + neighbor.h;
        neighbor.parent = node;
      }
    }
  }

  // not found.
  return [];
};

Graph.prototype.reconstructPath = function(endNode, transform) {
  var node = endNode;
  var result = [];

  while(node.parent) {
    result.push(transform(node.position));
    node = node.parent;
  }

  return result.reverse();
}

// The node in openSet having the lowest fScore[] value.
// This operation can occur in O(1) time if openSet is a min-heap or a priority queue
Graph.prototype.getNextItemIndex = function(openSet) {
  var index = 0;
  for (var i = 0; i < openSet.length; i++) {
    if(openSet[i].f < openSet[index].f) {
      index = i;
    }
  }
  return index;
};

Graph.prototype.reset = function() {
  for (var x = 0; x < this.nodes.length; x++) {
    for (var y = 0; y < this.nodes[x].length; y++) {
      this.nodes[x][y].g = 0;
      this.nodes[x][y].h = 0;
      this.nodes[x][y].f = 0;
      this.nodes[x][y].visited = false;
      this.nodes[x][y].checked = false;
      this.nodes[x][y].parent = null;
    }
  }
};

Graph.prototype.neighbors = function(node) {
  var results = [];
  var x = node.position.x;
  var y = node.position.y;

  if (this.nodes[x-1] && this.nodes[x-1][y]) {
    results.push(this.nodes[x-1][y]);
  }
  if (this.nodes[x+1] && this.nodes[x+1][y]) {
    results.push(this.nodes[x+1][y]);
  }
  if (this.nodes[x][y-1]) {
    results.push(this.nodes[x][y-1]);
  }
  if (this.nodes[x][y+1]) {
    results.push(this.nodes[x][y+1]);
  }
  return results;
};
