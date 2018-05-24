var app = {
  initDone: false,
  isEraseMode: false,
  lines: [],
  pos: null,
  
  init: function() {
    var self = this;
    if(self.initDone)
      return;
    self.bindToolbarEvents();
    self.bindDrawAreaEvents();
    self.initDone = true;
  },
  
  bindToolbarEvents: function() {
    var self = this;
    document.getElementById('btn-erase').addEventListener('click', function() {
      self.isEraseMode = true;
      self.pos = null;
      self.updateToolbarState();
    });
    document.getElementById('btn-line').addEventListener('click', function() {
      self.isEraseMode = false;
      self.pos = null;
      self.updateToolbarState();
    });
  },
  
  updateToolbarState: function() {
    var self = this;
    document.getElementById('btn-erase').className = self.isEraseMode ? 'active' : '';
    document.getElementById('btn-line').className = self.isEraseMode ? '' : 'active';
  },
  
  bindDrawAreaEvents: function() {
    var self = this;
    var canvas = document.getElementById('canvas');
    canvas.addEventListener('click', function(e) {
      var x = e.offsetX, y = e.offsetY;
      if(self.isEraseMode) {
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
      } else {
        if(!self.pos) {
          // save first click of the line
          self.pos = [ x, y ];
        } else {
          // create the line and add to the list
          var x0 = self.pos[0], y0 = self.pos[1];
          var length = Math.sqrt((x - x0) * (x - x0) + (y - y0) * (y - y0));
          var line = new Line(x0, y0, x, y, length);
          self.lines.push(line);
          self.pos = null;
        }
      }
      self.render();
    });
  },
  
  render: function() {
    var self = this;
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    self.lines.forEach(function(line) {
      line.draw(ctx);
    });
  },
};
