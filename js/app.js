var app = {
  initDone: false,
  lines: [],
  pos: null,
  modeEnum: {
    DRAW: 1,
    ERASE: 2,
    SELECT: 3,
    PENCIL: 4,
    MOVE: 5
  },
  canvasMode: null,
  selectedLineIndex: null,

  init: function () {
    if(this.initDone)
      return;
    this.canvasMode = this.modeEnum.DRAW;
    this.bindToolbarEvents();
    this.bindDrawAreaEvents();
    this.initDone = true;
  },

  bindToolbarEvents: function () {

    document.getElementById('btn-line').addEventListener('click', () => {
      this.canvasMode = this.modeEnum.DRAW;
      this.unSelectLines();
      this.pos = null;
      this.updateToolbarState();
    });
    document.getElementById('btn-erase').addEventListener('click', () => {
      if (this.canvasMode === this.modeEnum.SELECT && this.selectedLineIndex > -1) {
        this.lines.splice(this.selectedLineIndex, 1);
        this.selectedLineIndex = -1;
        this.render();
      } else {
        this.canvasMode = this.modeEnum.ERASE;
        this.updateToolbarState();
      }
      this.pos = null;
    });
    document.getElementById('btn-select').addEventListener('click', () => {
      this.canvasMode = this.modeEnum.SELECT;
      this.pos = null;
      this.updateToolbarState();
    });
    document.getElementById('btn-pencil').addEventListener('click', () => {
      this.canvasMode = this.modeEnum.PENCIL;
      this.pos = null;
      this.unSelectLines();
      this.updateToolbarState();
    });
    document.getElementById('btn-move').addEventListener('click', () => {
      this.canvasMode = this.modeEnum.MOVE;
      this.unSelectLines();
      this.pos = null;
      this.updateToolbarState();
    });
  },

  unSelectLines: function () {
    if (this.selectedLineIndex > -1){
      this.selectedLineIndex = -1;
      this.render();
    }
  },

  isEraseMode: function () {
    return this.canvasMode === this.modeEnum.ERASE;
  },
  isDrawMode: function () {
    return this.canvasMode === this.modeEnum.DRAW;
  },
  isSelectMode: function () {
    return this.canvasMode === this.modeEnum.SELECT;
  },
  isPencilMode: function () {
    return this.canvasMode === this.modeEnum.PENCIL;
  },
  isMoveMode: function () {
    return this.canvasMode === this.modeEnum.MOVE;
  },

  updateToolbarState: function () {
    document.getElementById('btn-erase').className = this.isEraseMode() ? 'active' : '';
    document.getElementById('btn-line').className = this.isDrawMode() ? 'active' : '';
    document.getElementById('btn-select').className = this.isSelectMode() ? 'active' : '';
    document.getElementById('btn-pencil').className = this.isPencilMode() ? 'active' : '';
    document.getElementById('btn-move').className = this.isMoveMode() ? 'active' : '';
  },

  bindDrawAreaEvents: function () {
    var canvas = document.getElementById('canvas');
    canvas.addEventListener('click', (e) => {
      var x = e.offsetX, y = e.offsetY;
      if (this.isEraseMode()) {
        this.eraseLine(x,y);
      } else if (this.isDrawMode()) {
          this.drawLine(x,y);
      } else if (this.isSelectMode()) {
          this.selectLine(x,y);
      }
      this.render();
    });

    canvas.addEventListener('mousedown', (e) => {

      if (this.isPencilMode() && e.which === 1){

        this.pos = [ e.offsetX, e.offsetY ];

        let objectLines = []; // will hold the lines created while dragging the mouse
        this.lines.push(objectLines);

          const mouseMoveHandler = (evt) => {

            let newX = evt.offsetX, newY = evt.offsetY;
            let line = new Line(this.pos[0], this.pos[1], newX, newY);

            objectLines.push(line);
            this.render();

            this.pos = [ newX, newY ];
          };
          canvas.addEventListener('mousemove', mouseMoveHandler);

          const mouseUpHandler = (evt) => {
            this.pos = null;
            canvas.removeEventListener('mousemove', mouseMoveHandler);
            canvas.removeEventListener('mouseup', mouseUpHandler);
          };

          canvas.addEventListener('mouseup', mouseUpHandler);
      } else if (this.isMoveMode() && e.which === 1){

          this.pos = [ e.offsetX, e.offsetY ];
          this.selectLine(e.offsetX, e.offsetY);
          if (this.selectedLineIndex > -1){

            const mouseMoveHandler = (evt) => {

              let moveX = evt.offsetX - e.offsetX;
              let moveY = evt.offsetY - e.offsetY;
              let selectedLines = this.lines[this.selectedLineIndex];
              selectedLines.map(line => line.move(moveX, moveY))
              this.render();

              this.pos = [ evt.offsetX, evt.offsetY ];
            };
            canvas.addEventListener('mousemove', mouseMoveHandler);
            const mouseUpHandler = (evt) => {
              this.pos = null;
              canvas.removeEventListener('mousemove', mouseMoveHandler);
              canvas.removeEventListener('mouseup', mouseUpHandler);
            };

            canvas.addEventListener('mouseup', mouseUpHandler);
          }
      }
    });
  },

  findClosestIndex: function(x,y) {

    if (this.lines.length > 0) { // if there's something to select
      var minSquareDistance, closestIndex;
      this.lines.forEach((objectLines, index) => {
        objectLines.forEach((line) => {
          let squareDistance = line.squareDistanceFrom(x, y);
          if((minSquareDistance === undefined) || (squareDistance < minSquareDistance)) {
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
    let closestIndex = this.findClosestIndex(x, y);
    let line = this.lines[closestIndex];
    //if (line && line.squareDistanceFrom(x,y) <= 100) {// only want lines within 10 pixels
    if (line && line.some(l => l.squareDistanceFrom(x, y) <= 100 )) {
      this.selectedLineIndex = closestIndex;
    } else {
      this.selectedLineIndex = -1;
    }
  },

  eraseLine: function(x,y) {
    let closestIndex = this.findClosestIndex(x, y);
    if (closestIndex > -1) {
      this.lines.splice(closestIndex, 1);
    }
  },

  drawLine: function(x,y) {
    if(!this.pos) {
      // save first click of the line
      this.pos = [ x, y ];
    } else {
      // create the line and add to the list
      var x0 = this.pos[0], y0 = this.pos[1];
      var line = new Line(x0, y0, x, y);

      let objectLine = [ line ];
      this.lines.push(objectLine);
      this.pos = null;
    }
  },

  render: function() {
    var canvas = document.getElementById('canvas');
    if (canvas) {
      var ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      this.lines.forEach((objectLines, index) => {
        objectLines.forEach(line => {
          line.draw(ctx);
          if (index === this.selectedLineIndex) {
            line.drawEnds(ctx);
          }
        });
      });
    }
  },
};
app.init();
