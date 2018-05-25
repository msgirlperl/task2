var app = {
  initDone: false,
  lines: [],
  pos: null,
  modeEnum: {
    DRAW: 1,
    ERASE: 2,
    SELECT: 3,
    PENCIL: 4
  },
  canvasMode: null,
  selectedLineIndex: null,

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

      // un-select any selected line
      if (self.selectedLineIndex > -1){
        self.selectedLineIndex = -1;
        self.render();
      }

      self.pos = null;
      self.updateToolbarState();
    });
    document.getElementById('btn-erase').addEventListener('click', function() {
      if (self.canvasMode === self.modeEnum.SELECT && self.selectedLineIndex > -1) {
        self.lines.splice(self.selectedLineIndex, 1);
        self.selectedLineIndex = -1;
        self.render();
      } else {
        self.canvasMode = self.modeEnum.ERASE;
        self.updateToolbarState();
      }
      self.pos = null;
    });
    document.getElementById('btn-select').addEventListener('click', function() {
      self.canvasMode = self.modeEnum.SELECT;
      self.pos = null;
      self.updateToolbarState();
    });
    document.getElementById('btn-pencil').addEventListener('click', function() {
      self.canvasMode = self.modeEnum.PENCIL;
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

  isPencilMode: function() {
    var self = this;
    return self.canvasMode === self.modeEnum.PENCIL ;
  },

  updateToolbarState: function() {
    var self = this;
    document.getElementById('btn-erase').className = self.isEraseMode() ? 'active' : '';
    document.getElementById('btn-line').className = self.isDrawMode() ? 'active' : '';
    document.getElementById('btn-select').className = self.isSelectMode() ? 'active' : '';
    document.getElementById('btn-pencil').className = self.isPencilMode() ? 'active' : '';
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

    canvas.addEventListener('mousedown', function(e) {

      if (self.isPencilMode() && e.which === 1){

        self.pos = [ e.offsetX, e.offsetY ];

        let objectLines = []; // will hold the lines created while dragging the mouse
        self.lines.push(objectLines);

          const mouseMoveHandler = (evt) => {

            let newX = evt.offsetX;
            let newY = evt.offsetY;

            let length = Geometry.distance(self.pos[0], self.pos[1], newX, newY);
            let line = new Line(self.pos[0], self.pos[1], newX, newY, length);

            objectLines.push(line);
            self.render();

            self.pos = [ newX, newY ];
          };
          canvas.addEventListener('mousemove', mouseMoveHandler);

          const mouseUpHandler = (evt) => {
            self.pos = null;
            canvas.removeEventListener('mousemove', mouseMoveHandler);
            canvas.removeEventListener('mouseup', mouseUpHandler);
          };

          canvas.addEventListener('mouseup', mouseUpHandler);
      }
    });
  },

  findClosestIndex: function(x,y) {
    self = this;
    if (self.lines.length > 0) { // if there's something to select
      var minSquareDistance, closestIndex;
      self.lines.forEach((objectLines, index) => {
        objectLines.forEach((line, index2) => {
          var squareDistance = line.squareDistanceFrom(x, y);
          if((minSquareDistance === undefined) || (index === 0) || (squareDistance < minSquareDistance)) {
            minSquareDistance = squareDistance;
            closestIndex = index;
          }
        });

      });
      return closestIndex;
    }
    return -1;
  },

  selectLine: function(x,y) {
    self = this;
    let closestIndex = self.findClosestIndex(x, y);
    let line = self.lines[closestIndex];
    //if (line && line.squareDistanceFrom(x,y) <= 100) {// only want lines within 10 pixels
    if (line && line.some(l => l.squareDistanceFrom(x, y) <= 100 )) {
      self.selectedLineIndex = closestIndex;
    } else {
      self.selectedLineIndex = -1;
    }
  },

  eraseLine: function(x,y) {
    self = this;
    let closestIndex = self.findClosestIndex(x, y);
    if (closestIndex > -1) {
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
      var line = new Line(x0, y0, x, y, length);

      let objectLine = [ line ];
      self.lines.push(objectLine);
      self.pos = null;
    }
  },

  // drawObjectLine: function(x,y,newX,newY){
  //   self = this;
  //
  //   // create the line and add to the list
  //   var x0 = self.pos[0], y0 = self.pos[1];
  //   var length = Geometry.distance(x0, y0, x, y);
  //   // Math.sqrt((x - x0) * (x - x0) + (y - y0) * (y - y0));
  //   var line = new Line(x0, y0, x, y, length);
  //   self.lines.push(line);
  //   self.pos = null;
  // },


  render: function() {
    var self = this;
    var canvas = document.getElementById('canvas');
    if (canvas) {
      var ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      self.lines.forEach((objectLines, index) => {
        objectLines.forEach(line => {
          line.draw(ctx);
          if (index === self.selectedLineIndex) { //TODO: do we want to check type?  if object, use fill instead or change color?
            line.drawEnds(ctx);
          }
        });
      });
    }
  },
};
