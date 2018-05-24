var app = {
  initDone: false,
  lines: [],
  pos: null,
  modeEnum: {
    DRAW: 1,
    ERASE: 2,
    SELECT: 3
  },
  canvasMode: null,
  selectedLine: null,

  init: function() {
    var self = this;
    if(self.initDone)
      return;
    self.canvasMode = self.modeEnum.DRAW;
    self.bindToolbarEvents();
    self.bindDrawAreaEvents();
    self.initDone = true;
  },

  bindToolbarEvents: function() {
    var self = this;
    document.getElementById('btn-line').addEventListener('click', function() {
      self.canvasMode = self.modeEnum.DRAW;
      self.pos = null;
      self.updateToolbarState();
    });
    document.getElementById('btn-erase').addEventListener('click', function() {
      self.canvasMode = self.modeEnum.ERASE;
      self.pos = null;
      self.updateToolbarState();
    });
    document.getElementById('btn-select').addEventListener('click', function() {
      self.canvasMode = self.modeEnum.SELECT;
      self.pos = null;
      self.updateToolbarState();
    });
  },

  isEraseMode: function() {
    var self = this;
    return self.canvasMode === self.modeEnum.ERASE ;
  },

  isDrawMode: function() {
    var self = this;
    return self.canvasMode === self.modeEnum.DRAW ;
  },

  isSelectMode: function() {
    var self = this;
    return self.canvasMode === self.modeEnum.SELECT ;
  },

  updateToolbarState: function() {
    var self = this;
    document.getElementById('btn-erase').className = self.isEraseMode() ? 'active' : '';
    document.getElementById('btn-line').className = self.isDrawMode() ? 'active' : '';
    document.getElementById('btn-select').className = self.isSelectMode() ? 'active' : '';
  },

  bindDrawAreaEvents: function() {
    var self = this;
    var canvas = document.getElementById('canvas');
    canvas.addEventListener('click', function(e) {
      var x = e.offsetX, y = e.offsetY;
      if (self.isEraseMode()) {
        self.eraseLine(x,y);
      } else if (self.isDrawMode()) {
          self.drawLine(x,y);
      } else if (self.isSelectMode()) {
          self.selectLine(x,y);
      }
      self.render();
    });
  },

  selectLine: function(x,y) {
    self = this;
    if (self.lines.length > 0) { // if there's something to select

    // var minSquareDistance, closestIndex;
    // self.lines.forEach(function(line, index) {
    //   var squareDistance = line.squareDistanceFrom(x, y);
    //   if(index === 0 || squareDistance < minSquareDistance) {
    //     minSquareDistance = squareDistance;
    //     closestIndex = index;
    //   }
    //
     }
  },

  eraseLine: function(x,y) {
    self = this;
    if (self.lines.length > 0) {
      var minSquareDistance, closestIndex;
      self.lines.forEach(function(line, index) {
        var squareDistance = line.squareDistanceFrom(x, y);
        if(index === 0 || squareDistance < minSquareDistance) {
          minSquareDistance = squareDistance;
          closestIndex = index;
        }
      });
      self.lines.splice(closestIndex, 1);
    }
  },

  drawLine: function(x,y){
    self = this;
    if(!self.pos) {
      // save first click of the line
      self.pos = [ x, y ];
    } else {
      // create the line and add to the list
      var x0 = self.pos[0], y0 = self.pos[1];
      var length = Geometry.distance(x0, y0, x, y);
      // Math.sqrt((x - x0) * (x - x0) + (y - y0) * (y - y0));
      var line = new Line(x0, y0, x, y, length);
      self.lines.push(line);
      self.pos = null;
    }
  },

  render: function() {
    var self = this;
    var canvas = document.getElementById('canvas');
    if (canvas) {
      var ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      self.lines.forEach(function(line) {
        line.draw(ctx);
      });
    }
  },
};
